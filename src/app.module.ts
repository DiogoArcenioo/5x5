import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { HealthModule } from './health/health.module';
import { AdminDataModule } from './admin-data/admin-data.module';
import { PeopleModule } from './people/people.module';
import { CatalogModule } from './catalog/catalog.module';
import { ALL_ENTITIES } from './database/entities';
import { AuthModule } from './auth/auth.module';
import { RankedModule } from './ranked/ranked.module';
import { AdminUsersModule } from './admin-users/admin-users.module';
import { NotificationsModule } from './notifications/notifications.module';
import { validateEnvironment } from './config/environment';
import { InternalApiKeyGuard } from './security/internal-api-key.guard';
import { CasualModule } from './casual/casual.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env.local', '.env'], validate: validateEnvironment }),
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 120 }]),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.getOrThrow<string>('DB_HOST'),
        port: Number(config.getOrThrow<string>('DB_PORT')),
        database: config.getOrThrow<string>('DB_NAME'),
        username: config.getOrThrow<string>('DB_USER'),
        password: config.getOrThrow<string>('DB_PASSWORD'),
        ssl: config.get<string>('DB_SSL') === 'true'
          ? { rejectUnauthorized: config.get<string>('DB_SSL_REJECT_UNAUTHORIZED', 'true') !== 'false' }
          : false,
        entities: ALL_ENTITIES,
        synchronize: false,
        logging: config.get<string>('DB_LOGGING') === 'true',
        extra: {
          max: 10,
          min: 0,
          idleTimeoutMillis: 30_000,
          connectionTimeoutMillis: 10_000,
          keepAlive: true,
          application_name: 'counter-5x5-nest-api',
        },
      }),
    }),
    AuthModule,
    RankedModule,
    CasualModule,
    AdminUsersModule,
    NotificationsModule,
    HealthModule,
    PeopleModule,
    CatalogModule,
    AdminDataModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: InternalApiKeyGuard },
  ],
})
export class AppModule {}
