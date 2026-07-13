import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { AuthenticatedUser, AuthService } from './auth.service';

export type AuthenticatedRequest = Request & { user: AuthenticatedUser; authToken: string };

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(protected readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers.authorization;
    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token de acesso não informado.');
    }
    const token = authorization.slice(7).trim();
    if (!token) throw new UnauthorizedException('Token de acesso não informado.');
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
