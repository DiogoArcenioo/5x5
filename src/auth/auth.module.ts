import { Global, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AdminGuard, SessionAuthGuard } from './auth.guards';
import { AuthService } from './auth.service';

@Global()
@Module({
  controllers: [AuthController],
  providers: [AuthService, SessionAuthGuard, AdminGuard],
  exports: [AuthService, SessionAuthGuard, AdminGuard],
})
export class AuthModule {}
