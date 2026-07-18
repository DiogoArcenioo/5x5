import { Body, Controller, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { AuthenticatedRequest, SessionAuthGuard } from './auth.guards';
import { AUTH_COOKIE_NAME, AuthService, AuthSession } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { GoogleExchangeDto } from './dto/google-auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly config: ConfigService) {}

  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 60_000, blockDuration: 15 * 60_000 } })
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) response: Response) {
    return this.establishSession(response, await this.authService.register(dto));
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60_000, blockDuration: 10 * 60_000 } })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
    return this.establishSession(response, await this.authService.login(dto));
  }

  @Get('google/config')
  googleConfig() {
    return this.authService.googleConfig();
  }

  @Get('google')
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  async google(@Res() response: Response) {
    response.redirect(await this.authService.googleAuthorizationUrl());
  }

  @Get('google/callback')
  async googleCallback(@Query('code') code: string | undefined, @Query('state') state: string | undefined, @Res() response: Response) {
    try {
      response.redirect(await this.authService.completeGoogleAuthorization(code, state));
    } catch {
      response.redirect(this.authService.googleFailureRedirect());
    }
  }

  @Post('google/exchange')
  @Throttle({ default: { limit: 10, ttl: 60_000, blockDuration: 10 * 60_000 } })
  async googleExchange(@Body() dto: GoogleExchangeDto, @Res({ passthrough: true }) response: Response) {
    return this.establishSession(response, await this.authService.exchangeGoogleCode(dto.code));
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(SessionAuthGuard)
  me(@Req() request: AuthenticatedRequest) {
    return request.user;
  }

  @Post('logout')
  @ApiBearerAuth()
  @UseGuards(SessionAuthGuard)
  async logout(@Req() request: AuthenticatedRequest, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.logout(request.authToken);
    response.clearCookie(AUTH_COOKIE_NAME, this.cookieOptions());
    return result;
  }

  private establishSession(response: Response, session: AuthSession) {
    response.cookie(AUTH_COOKIE_NAME, session.token, {
      ...this.cookieOptions(),
      expires: new Date(session.expiresAt),
    });
    return { expiresAt: session.expiresAt, user: session.user };
  }

  private cookieOptions() {
    return {
      httpOnly: true,
      secure: this.config.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict' as const,
      path: '/api',
    };
  }
}
