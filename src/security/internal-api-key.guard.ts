import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { timingSafeEqual } from 'node:crypto';

@Injectable()
export class InternalApiKeyGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    if (/^(?:\/api)?\/health\/?$/.test(request.path)) return true;

    const supplied = request.header('x-internal-api-key') ?? '';
    const expected = this.config.getOrThrow<string>('INTERNAL_API_KEY');
    const suppliedBuffer = Buffer.from(supplied);
    const expectedBuffer = Buffer.from(expected);
    if (suppliedBuffer.length !== expectedBuffer.length || !timingSafeEqual(suppliedBuffer, expectedBuffer)) {
      throw new UnauthorizedException('Origem da requisição não autorizada.');
    }
    return true;
  }
}
