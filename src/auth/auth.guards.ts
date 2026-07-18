import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { AUTH_COOKIE_NAME, AuthenticatedUser, AuthService } from './auth.service';

export type AuthenticatedRequest = Request & { user: AuthenticatedUser; authToken: string };

function cookieValue(header: string | undefined, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const separator = part.indexOf('=');
    if (separator < 0 || part.slice(0, separator).trim() !== name) continue;
    try { return decodeURIComponent(part.slice(separator + 1).trim()); } catch { return undefined; }
  }
  return undefined;
}

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(protected readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers.authorization;
    const bearer = authorization?.startsWith('Bearer ') ? authorization.slice(7).trim() : undefined;
    const token = bearer || cookieValue(request.headers.cookie, AUTH_COOKIE_NAME);
    if (!token) throw new UnauthorizedException('Sessão não informada.');
    request.user = await this.authService.authenticateToken(token);
    request.authToken = token;
    return true;
  }
}

@Injectable()
export class AdminGuard extends SessionAuthGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (request.user.role !== 'admin') {
      throw new ForbiddenException('Acesso permitido apenas para administradores.');
    }
    return true;
  }
}
