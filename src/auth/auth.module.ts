import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AdminGuard, SessionAuthGuard } from './auth.guards';
import { AuthService } from './auth.service';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          algorithm: 'HS256',
          issuer: config.get<string>('JWT_ISSUER', 'cs5x5-api'),
          audience: config.get<string>('JWT_AUDIENCE', 'cs5x5-web'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, SessionAuthGuard, AdminGuard],
  exports: [AuthService, SessionAuthGuard, AdminGuard],
})
export class AuthModule {}
