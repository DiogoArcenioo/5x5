import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { ListAdminRankingDto, UpdateAdminRankingDto } from './dto/admin-ranking.dto';

const RANKING_TIME_ZONE = 'America/Sao_Paulo';

@Injectable()
export class AdminRankingService {
  constructor(private readonly dataSource: DataSource) {}

  async list(query: ListAdminRankingDto) {
    const values: unknown[] = [];
    const conditions: string[] = [];
    if (query.search.trim()) {
      values.push(`%${query.search.trim()}%`);
      conditions.push(`(u.username ILIKE $${values.length} OR u.email ILIKE $${values.length})`);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countValues = [...values];
    values.push(query.pageSize, (query.page - 1) * query.pageSize);
    const data = await this.dataSource.query(`
      SELECT u.id, u.username, u.email, u.status,
             GREATEST(0, COALESCE((SELECT sum(r.score)::integer FROM ranked_runs r WHERE r.user_id = u.id), 0) + u.ranked_points_adjustment)::integer AS points,
             GREATEST(0, (SELECT count(r.id)::integer FROM ranked_runs r WHERE r.user_id = u.id) + u.ranked_matches_adjustment)::integer AS matches,
             COALESCE((SELECT sum(r.score)::integer FROM ranked_runs r WHERE r.user_id = u.id), 0) AS "earnedPoints",
             (SELECT count(r.id)::integer FROM ranked_runs r WHERE r.user_id = u.id) AS "actualMatches",
             u.ranked_unlimited AS unlimited,
             (SELECT count(r.id)::integer FROM ranked_runs r WHERE r.user_id = u.id
               AND r.played_on = ((now() AT TIME ZONE '${RANKING_TIME_ZONE}') - interval '1 minute')::date) AS "attemptsToday",
             CASE WHEN u.ranked_extra_attempts_on = ((now() AT TIME ZONE '${RANKING_TIME_ZONE}') - interval '1 minute')::date
               THEN u.ranked_extra_attempts ELSE 0 END AS "extraAttemptsToday"
      FROM app_users u
      ${where}
      ORDER BY u.ranked_unlimited DESC, points DESC, u.username ASC
      LIMIT $${values.length - 1} OFFSET $${values.length}
    `, values) as Array<Record<string, unknown>>;
    const [count] = await this.dataSource.query<Array<{ total: number }>>(
      `SELECT count(u.id)::integer AS total FROM app_users u ${where}`,
      countValues,
    );
    return { data, meta: { page: query.page, pageSize: query.pageSize, total: count.total, totalPages: Math.ceil(count.total / query.pageSize) } };
  }

  async update(id: number, dto: UpdateAdminRankingDto) {
    if (!Object.keys(dto).length) throw new ConflictException('Nenhuma alteração foi informada.');
    return this.dataSource.transaction(async (manager) => {
      const current = await this.lockUser(manager, id);
      const pointsAdjustment = dto.points === undefined
        ? current.pointsAdjustment
        : dto.points - current.earnedPoints;
      const matchesAdjustment = dto.matches === undefined
        ? current.matchesAdjustment
        : dto.matches - current.actualMatches;
      await manager.query(`
        UPDATE app_users
        SET ranked_points_adjustment = $2,
            ranked_matches_adjustment = $3,
            ranked_unlimited = $4,
            updated_at = now()
        WHERE id = $1
      `, [id, pointsAdjustment, matchesAdjustment, dto.unlimited ?? current.unlimited]);
      return { updated: true, id, points: dto.points ?? current.earnedPoints + pointsAdjustment, matches: dto.matches ?? current.actualMatches + matchesAdjustment, unlimited: dto.unlimited ?? current.unlimited };
    });
  }

  async release(id: number) {
    const rows = await this.dataSource.query<Array<{ id: number; extraAttemptsToday: number }>>(`
      UPDATE app_users
      SET ranked_extra_attempts = CASE
            WHEN ranked_extra_attempts_on = ((now() AT TIME ZONE $2) - interval '1 minute')::date
              THEN ranked_extra_attempts + 1
            ELSE 1
          END,
          ranked_extra_attempts_on = ((now() AT TIME ZONE $2) - interval '1 minute')::date,
          updated_at = now()
      WHERE id = $1
      RETURNING id, ranked_extra_attempts AS "extraAttemptsToday"
    `, [id, RANKING_TIME_ZONE]);
    if (!rows[0]) throw new NotFoundException('Usuário não encontrado.');
    return { released: true, ...rows[0] };
  }

  private async lockUser(manager: EntityManager, id: number) {
    const rows = await manager.query<Array<{
      id: number;
      earnedPoints: number;
      actualMatches: number;
      pointsAdjustment: number;
      matchesAdjustment: number;
      unlimited: boolean;
    }>>(`
      SELECT u.id,
             COALESCE((SELECT sum(r.score)::integer FROM ranked_runs r WHERE r.user_id = u.id), 0) AS "earnedPoints",
             (SELECT count(r.id)::integer FROM ranked_runs r WHERE r.user_id = u.id) AS "actualMatches",
             u.ranked_points_adjustment AS "pointsAdjustment",
             u.ranked_matches_adjustment AS "matchesAdjustment",
             u.ranked_unlimited AS unlimited
      FROM app_users u WHERE u.id = $1 FOR UPDATE
    `, [id]);
    if (!rows[0]) throw new NotFoundException('Usuário não encontrado.');
    return rows[0];
  }
}

