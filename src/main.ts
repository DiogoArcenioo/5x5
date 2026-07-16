import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ApiExceptionFilter } from './shared/api-exception.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  app.set('trust proxy', 1);
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: config.get<string>('API_CORS_ORIGIN', 'http://localhost:3001')
      .split(',')
      .map((origin) => origin.trim()),
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }));
  app.useGlobalFilters(new ApiExceptionFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('5x5 API')
    .setDescription('API do jogo 5x5 com autenticação, catálogo e administração.')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth')
    .addTag('health')
    .addTag('players')
    .addTag('player-team-years')
    .addTag('catalog')
    .addTag('admin-data')
    .addTag('ranked')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = config.get<number>('API_PORT', 3000);
  const host = config.get<string>('API_HOST', '0.0.0.0');
  app.enableShutdownHooks();
  await app.listen(port, host);
  console.log(`5x5 API running at http://localhost:${port}/api`);
  console.log(`Swagger available at http://localhost:${port}/docs`);
}

void bootstrap();
