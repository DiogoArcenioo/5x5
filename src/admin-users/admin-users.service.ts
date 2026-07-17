import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, QueryFailedError } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { ListAdminUsersDto, ResetAdminUserPasswordDto, UpdateAdminUserDto } from './dto/admin-users.dto';

@Injectable()
export class AdminUsersService {
  constructor(private readonly dataSource: DataSource, private readonly authService: AuthService) {}

  async list(query: ListAdminUsersDto) {
    const values: unknown[] = [];
    const conditions: string[] = [];
    if (query.search?.trim()) {
      values.push(`%${query.search.trim()}%`);
      conditions.push(`(u.username ILIKE $${values.length} OR u.email ILIKE $${values.length})`);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countValues = [...values];
    values.push(query.pageSize, (query.page - 1) * query.pageSize);
    const data = await this.dataSource.query(`
      SELECT u.id, u.username, u.email, u.role, u.status,
             u.last_login_at AS "lastLoginAt", u.created_at AS "createdAt",
             GREATEST(0, COALESCE((SELECT sum(r.score)::integer FROM ranked_runs r WHERE r.user_id = u.id), 0) + u.ranked_points_adjustment)::integer AS points,
             GREATEST(0, (SELECT count(r.id)::integer FROM ranked_runs r WHERE r.user_id = u.id) + u.ranked_matches_adjustment)::integer AS "rankedAttempts",
             COALESCE((SELECT array_agg(i.provider ORDER BY i.provider) FROM user_oauth_identities i WHERE i.user_id = u.id), ARRAY[]::varchar[]) AS providers
      FROM app_users u
      ${where}
      ORDER BY CASE WHEN u.role = 'admin' THEN 0 ELSE 1 END, u.created_at DESC
      LIMIT $${values.length - 1} OFFSET $${values.length}
    `, values) as Array<Record<string, unknown>>;
    const [count] = await this.dataSource.query<Array<{ total: number }>>(
      `SELECT count(u.id)::integer AS total FROM app_users u ${where}`,
      countValues,
    );
    return { data, meta: { page: query.page, pageSize: query.pageSize, total: count.total, totalPages: Math.ceil(count.total / query.pageSize) } };
  }

  async update(id: number, dto: UpdateAdminUserDto, actingUserId: number) {
    if (!Object.keys(dto).length) throw new ConflictException('Nenhuma alteração foi informada.');
    if (id === actingUserId && ((dto.role && dto.role !== 'admin') || (dto.status && dto.status !== 'active'))) {
      throw new ForbiddenException('Você não pode remover o próprio acesso administrativo ou desativar sua conta.');
    }
    const current = await this.requireUser(id);
    const username = dto.username?.trim() ?? current.username;
    const email = dto.email === undefined ? current.email : dto.email?.trim() || null;
    try {
      const rows = await this.dataSource.query(`
        UPDATE app_users
        SET username = $2, username_normalized = $3,
            email = $4, email_normalized = $5,
            role = COALESCE($6, role), status = COALESCE($7, status), updated_at = now()
        WHERE id = $1
        RETURNING id, username, email, role, status, last_login_at AS "lastLoginAt", created_at AS "createdAt"
      `, [id, username, username.toLowerCase(), email, email?.toLowerCase() || null, dto.role || null, dto.status || null]);
      return rows[0];
    } catch (error) {
      if (error instanceof QueryFailedError && (error.driverError as { code?: string }).code === '23505') {
        throw new ConflictException('Este nome de usuário ou e-mail já está sendo utilizado.');
      }
      throw error;
    }
  }

  async resetPassword(id: number, dto: ResetAdminUserPasswordDto) {
    await this.requireUser(id);
    const passwordHash = await this.authService.hashPassword(dto.password);
    await this.dataSource.query('UPDATE app_users SET password_hash = $2, updated_at = now() WHERE id = $1', [id, passwordHash]);
    await this.dataSource.query('UPDATE user_sessions SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL', [id]);
    return { passwordUpdated: true, sessionsRevoked: true };
  }

  async remove(id: number, actingUserId: number) {
    if (id === actingUserId) throw new ForbiddenException('Você não pode excluir a própria conta administrativa.');
    return this.dataSource.transaction(async (manager) => {
      const users = await manager.query<Array<{ id: number; username: string }>>(
        'SELECT id, username FROM app_users WHERE id = $1 FOR UPDATE', [id],
      );
      if (!users[0]) throw new NotFoundException('Usuário não encontrado.');
      const [counts] = await manager.query<Array<{ sessions: number; rankedRuns: number; oauthIdentities: number }>>(`
        SELECT (SELECT count(id)::integer FROM user_sessions WHERE user_id = $1) AS sessions,
               (SELECT count(id)::integer FROM ranked_runs WHERE user_id = $1) AS "rankedRuns",
               (SELECT count(id)::integer FROM user_oauth_identities WHERE user_id = $1) AS "oauthIdentities"
      `, [id]);
      await manager.query('DELETE FROM app_users WHERE id = $1', [id]);
      return { deleted: true, username: users[0].username, cascaded: counts };
    });
  }

  private async requireUser(id: number): Promise<{ id: number; username: string; email: string | null }> {
    const users = await this.dataSource.query<Array<{ id: number; username: string; email: string | null }>>(
      'SELECT id, username, email FROM app_users WHERE id = $1', [id],
    );
    if (!users[0]) throw new NotFoundException('Usuário não encontrado.');
    return users[0];
  }
}
