import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthenticatedRequest, SessionAuthGuard } from './auth.guards';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';

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
