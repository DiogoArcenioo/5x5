import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash, randomBytes, scrypt as nodeScrypt, timingSafeEqual } from 'node:crypto';
import { DataSource, QueryFailedError } from 'typeorm';
import { LoginDto, RegisterDto } from './dto/auth.dto';

export type AuthenticatedUser = {
  id: number;
  username: string;
  email: string | null;
  role: 'user' | 'admin';
  status: 'active' | 'disabled';
};

type UserWithPassword = AuthenticatedUser & { passwordHash: string };

@Injectable()
export class AuthService {
  constructor(private readonly dataSource: DataSource) {}

  async register(dto: RegisterDto) {
    const username = dto.username.trim();
    const email = dto.email?.trim() || null;
    const passwordHash = await this.hashPassword(dto.password);

    try {
      const rows = await this.dataSource.query<Array<AuthenticatedUser>>(
        `INSERT INTO app_users (
           username, username_normalized, email, email_normalized,
           password_hash, role, status
         ) VALUES ($1, $2, $3, $4, $5, 'user', 'active')
         RETURNING id, username, email, role, status`,
        [username, username.toLowerCase(), email, email?.toLowerCase() || null, passwordHash],
      );
      return this.createSession(rows[0]);
    } catch (error) {
      if (error instanceof QueryFailedError && (error.driverError as { code?: string }).code === '23505') {
        throw new ConflictException('Usuário ou e-mail já cadastrado.');
      }
      throw error;
    }
  }

  async login(dto: LoginDto) {
    const rows = await this.dataSource.query<Array<UserWithPassword>>(
      `SELECT id, username, email, role, status, password_hash AS "passwordHash"
       FROM app_users
       WHERE username_normalized = $1
       LIMIT 1`,
      [dto.username.trim().toLowerCase()],
    );
    const user = rows[0];
    if (!user || user.status !== 'active' || !(await this.verifyPassword(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Usuário ou senha inválidos.');
    }

    await this.dataSource.query(
      'UPDATE app_users SET last_login_at = now(), updated_at = now() WHERE id = $1',
      [user.id],
    );
    const { passwordHash: _passwordHash, ...safeUser } = user;
    return this.createSession(safeUser);
  }

  async authenticateToken(token: string): Promise<AuthenticatedUser> {
    const rows = await this.dataSource.query<Array<AuthenticatedUser>>(
      `SELECT u.id, u.username, u.email, u.role, u.status
       FROM user_sessions s
       JOIN app_users u ON u.id = s.user_id
       WHERE s.token_hash = $1
         AND s.revoked_at IS NULL
         AND s.expires_at > now()
         AND u.status = 'active'
       LIMIT 1`,
      [this.hashToken(token)],
    );
    if (!rows[0]) throw new UnauthorizedException('Sessão inválida ou expirada.');
    return rows[0];
  }

  async logout(token: string): Promise<{ loggedOut: true }> {
    await this.dataSource.query(
      'UPDATE user_sessions SET revoked_at = now() WHERE token_hash = $1 AND revoked_at IS NULL',
      [this.hashToken(token)],
    );
    return { loggedOut: true };
  }

  private async createSession(user: AuthenticatedUser) {
    const token = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.dataSource.query(
      `INSERT INTO user_sessions (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, this.hashToken(token), expiresAt],
    );
    return { token, expiresAt: expiresAt.toISOString(), user };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16);
    const derivedKey = await this.scrypt(password, salt);
    return `scrypt$${salt.toString('base64url')}$${derivedKey.toString('base64url')}`;
  }

  private async verifyPassword(password: string, storedHash: string): Promise<boolean> {
    const [algorithm, saltValue, hashValue] = storedHash.split('$');
    if (algorithm !== 'scrypt' || !saltValue || !hashValue) return false;
    const expected = Buffer.from(hashValue, 'base64url');
    const actual = await this.scrypt(password, Buffer.from(saltValue, 'base64url'));
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  }

  private scrypt(password: string, salt: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      nodeScrypt(password, salt, 64, (error, derivedKey) => {
        if (error) reject(error);
        else resolve(derivedKey as Buffer);
      });
    });
  }
}
