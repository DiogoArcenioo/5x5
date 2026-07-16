import { ConflictException, Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes, scrypt as nodeScrypt, timingSafeEqual } from 'node:crypto';
import { OAuth2Client } from 'google-auth-library';
import { DataSource, QueryFailedError } from 'typeorm';
import { LoginDto, RegisterDto } from './dto/auth.dto';

export type AuthenticatedUser = {
  id: number;
  username: string;
  email: string | null;
  role: 'user' | 'admin';
  status: 'active' | 'disabled';
};

type UserWithPassword = AuthenticatedUser & { passwordHash: string | null };

@Injectable()
export class AuthService {
  constructor(private readonly dataSource: DataSource, private readonly config: ConfigService) {}

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

  googleConfig() {
    return { enabled: this.googleEnabled() };
  }

  async googleAuthorizationUrl(): Promise<string> {
    const { clientId, redirectUri } = this.googleSettings();
    const state = randomBytes(32).toString('base64url');
    await this.dataSource.query('DELETE FROM oauth_login_states WHERE expires_at <= now()');
    await this.dataSource.query(
      `INSERT INTO oauth_login_states (state_hash, expires_at)
       VALUES ($1, now() + interval '10 minutes')`,
      [this.hashToken(state)],
    );
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      prompt: 'select_account',
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  }

  async completeGoogleAuthorization(code?: string, state?: string): Promise<string> {
    if (!code || !state) throw new UnauthorizedException('Resposta de autenticação do Google incompleta.');
    const { clientId, clientSecret, redirectUri, frontendUrl } = this.googleSettings();
    await this.dataSource.transaction(async (manager) => {
      const states = await manager.query<Array<{ stateHash: string }>>(
        `SELECT state_hash AS "stateHash" FROM oauth_login_states
         WHERE state_hash = $1 AND expires_at > now()
         FOR UPDATE`,
        [this.hashToken(state)],
      );
      if (!states[0]) throw new UnauthorizedException('Tentativa de login do Google inválida ou expirada.');
      await manager.query('DELETE FROM oauth_login_states WHERE state_hash = $1', [this.hashToken(state)]);
    });

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: 'authorization_code' }),
      signal: AbortSignal.timeout(15_000),
    });
    const tokens = await tokenResponse.json() as { id_token?: string };
    if (!tokenResponse.ok || !tokens.id_token) throw new UnauthorizedException('O Google não confirmou a autenticação.');

    const ticket = await new OAuth2Client(clientId).verifyIdToken({ idToken: tokens.id_token, audience: clientId });
    const payload = ticket.getPayload();
    if (!payload?.sub || !payload.email || payload.email_verified !== true) {
      throw new UnauthorizedException('A conta do Google precisa ter um e-mail verificado.');
    }
    const user = await this.findOrCreateGoogleUser(payload.sub, payload.email, payload.name || 'Jogador');
    const exchangeCode = randomBytes(32).toString('base64url');
    await this.dataSource.query('DELETE FROM oauth_exchange_codes WHERE expires_at <= now()');
    await this.dataSource.query(
      `INSERT INTO oauth_exchange_codes (code_hash, user_id, expires_at)
       VALUES ($1, $2, now() + interval '2 minutes')`,
      [this.hashToken(exchangeCode), user.id],
    );
    const target = new URL('/entrar', frontendUrl);
    target.searchParams.set('google_code', exchangeCode);
    return target.toString();
  }

  googleFailureRedirect(): string {
    const frontendUrl = this.config.get<string>('FRONTEND_URL', 'http://localhost:3001');
    const target = new URL('/entrar', frontendUrl);
    target.searchParams.set('google_error', 'Não foi possível entrar com o Google. Tente novamente.');
    return target.toString();
  }

  async exchangeGoogleCode(code: string) {
    return this.dataSource.transaction(async (manager) => {
      const codes = await manager.query<Array<{ userId: number }>>(
        `SELECT user_id AS "userId" FROM oauth_exchange_codes
         WHERE code_hash = $1 AND expires_at > now()
         FOR UPDATE`,
        [this.hashToken(code)],
      );
      if (!codes[0]) throw new UnauthorizedException('Código de login do Google inválido ou expirado.');
      await manager.query('DELETE FROM oauth_exchange_codes WHERE code_hash = $1', [this.hashToken(code)]);
      await manager.query(
        `UPDATE app_users SET last_login_at = now(), updated_at = now()
         WHERE id = $1 AND status = 'active'`,
        [codes[0].userId],
      );
      const users = await manager.query<AuthenticatedUser[]>(
        'SELECT id, username, email, role, status FROM app_users WHERE id = $1 AND status = \'active\'',
        [codes[0].userId],
      );
      if (!users[0]) throw new UnauthorizedException('Esta conta está desativada.');
      return this.createSession(users[0], manager);
    });
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

  private async createSession(user: AuthenticatedUser, manager = this.dataSource.manager) {
    const token = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await manager.query(
      `INSERT INTO user_sessions (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, this.hashToken(token), expiresAt],
    );
    return { token, expiresAt: expiresAt.toISOString(), user };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16);
    const derivedKey = await this.scrypt(password, salt);
    return `scrypt$${salt.toString('base64url')}$${derivedKey.toString('base64url')}`;
  }

  private async verifyPassword(password: string, storedHash: string | null): Promise<boolean> {
    if (!storedHash) return false;
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

  private googleEnabled(): boolean {
    return Boolean(this.config.get<string>('GOOGLE_CLIENT_ID') && this.config.get<string>('GOOGLE_CLIENT_SECRET') && this.config.get<string>('GOOGLE_REDIRECT_URI'));
  }

  private googleSettings() {
    if (!this.googleEnabled()) throw new ServiceUnavailableException('Login com Google ainda não foi configurado.');
    return {
      clientId: this.config.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: this.config.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      redirectUri: this.config.getOrThrow<string>('GOOGLE_REDIRECT_URI'),
      frontendUrl: this.config.get<string>('FRONTEND_URL', 'http://localhost:3001'),
    };
  }

  private async findOrCreateGoogleUser(subject: string, email: string, displayName: string): Promise<AuthenticatedUser> {
    return this.dataSource.transaction(async (manager) => {
      const identityUsers = await manager.query<AuthenticatedUser[]>(
        `SELECT u.id, u.username, u.email, u.role, u.status
         FROM user_oauth_identities i JOIN app_users u ON u.id = i.user_id
         WHERE i.provider = 'google' AND i.provider_subject = $1`,
        [subject],
      );
      if (identityUsers[0]) {
        if (identityUsers[0].status !== 'active') throw new UnauthorizedException('Esta conta está desativada.');
        return identityUsers[0];
      }

      const normalizedEmail = email.trim().toLowerCase();
      let users = await manager.query<AuthenticatedUser[]>(
        'SELECT id, username, email, role, status FROM app_users WHERE email_normalized = $1 LIMIT 1',
        [normalizedEmail],
      );
      if (users[0]?.status === 'disabled') throw new UnauthorizedException('Esta conta está desativada.');
      if (!users[0]) {
        const username = await this.availableGoogleUsername(manager, displayName, normalizedEmail);
        await manager.query(
          `INSERT INTO app_users (username, username_normalized, email, email_normalized, password_hash, role, status)
           VALUES ($1, $2, $3, $3, NULL, 'user', 'active')`,
          [username, username.toLowerCase(), normalizedEmail],
        );
        users = await manager.query<AuthenticatedUser[]>(
          'SELECT id, username, email, role, status FROM app_users WHERE email_normalized = $1',
          [normalizedEmail],
        );
      }
      await manager.query(
        `INSERT INTO user_oauth_identities (user_id, provider, provider_subject, email)
         VALUES ($1, 'google', $2, $3)`,
        [users[0].id, subject, normalizedEmail],
      );
      return users[0];
    });
  }

  private async availableGoogleUsername(manager: import('typeorm').EntityManager, displayName: string, email: string): Promise<string> {
    const source = displayName || email.split('@')[0] || 'jogador';
    let base = source.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_.-]+/g, '_').replace(/^[_\-.]+|[_\-.]+$/g, '').slice(0, 42);
    if (base.length < 3) base = `jogador_${base}`.slice(0, 42);
    for (let attempt = 0; attempt < 20; attempt++) {
      const suffix = attempt === 0 ? '' : `_${randomBytes(3).toString('hex')}`;
      const candidate = `${base.slice(0, 50 - suffix.length)}${suffix}`;
      const exists = await manager.query('SELECT 1 FROM app_users WHERE username_normalized = $1', [candidate.toLowerCase()]) as Array<Record<string, unknown>>;
      if (!exists[0]) return candidate;
    }
    throw new ConflictException('Não foi possível gerar um nome de usuário para esta conta.');
  }
}
