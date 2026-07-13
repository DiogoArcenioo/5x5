import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'node:path';
import { AppModule } from './app.module';
import { ApiExceptionFilter } from './shared/api-exception.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  app.useStaticAssets(join(process.cwd(), 'frontend'));
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: config.get<string>('API_CORS_ORIGIN', 'http://localhost:5173')
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
    .setTitle('5x5 Admin API')
    .setDescription('API de cadastro e manutenção dos dados competitivos do jogo 5x5.')
    .setVersion('1.0')
    .addTag('health')
    .addTag('players')
    .addTag('coaches')
    .addTag('catalog')
    .addTag('admin-data')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = config.get<number>('API_PORT', 3000);
  await app.listen(port);
  console.log(`5x5 API running at http://localhost:${port}/api`);
  console.log(`Swagger available at http://localhost:${port}/docs`);
}

void bootstrap();
