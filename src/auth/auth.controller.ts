import { Body, Controller, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthenticatedRequest, SessionAuthGuard } from './auth.guards';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { GoogleExchangeDto } from './dto/google-auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('google/config')
  googleConfig() {
    return this.authService.googleConfig();
  }

  @Get('google')
  async google(@Res() response: Response) {
    response.redirect(await this.authService.googleAuthorizationUrl());
  }

  @Get('google/callback')
  async googleCallback(@Query('code') code: string | undefined, @Query('state') state: string | undefined, @Res() response: Response) {
    try {
      const redirectUrl = await this.authService.completeGoogleAuthorization(code, state);
      response.redirect(redirectUrl);
    } catch (_error) {
      response.redirect(this.authService.googleFailureRedirect());
    }
  }

  @Post('google/exchange')
  googleExchange(@Body() dto: GoogleExchangeDto) {
    return this.authService.exchangeGoogleCode(dto.code);
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
  logout(@Req() request: AuthenticatedRequest) {
    return this.authService.logout(request.authToken);
  }
}
