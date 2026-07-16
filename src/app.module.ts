import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthModule } from './health/health.module';
import { AdminDataModule } from './admin-data/admin-data.module';
import { PeopleModule } from './people/people.module';
import { CatalogModule } from './catalog/catalog.module';
import { ALL_ENTITIES } from './database/entities';
import { AuthModule } from './auth/auth.module';
import { RankedModule } from './ranked/ranked.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
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
          ? { rejectUnauthorized: false }
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
    HealthModule,
    PeopleModule,
    CatalogModule,
    AdminDataModule,
  ],
})
export class AppModule {}
