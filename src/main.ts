import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import type { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { ApiExceptionFilter } from './shared/api-exception.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'same-site' },
  }));
  app.use(json({ limit: '64kb' }));
  app.use(urlencoded({ extended: false, limit: '64kb' }));
  app.use((request: Request, response: Response, next: NextFunction) => {
    if (/^\/api\/(auth|admin|ranked)(\/|$)/.test(request.path)) {
      response.setHeader('Cache-Control', 'no-store, max-age=0');
      response.setHeader('Pragma', 'no-cache');
    }
    next();
  });
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: config.getOrThrow<string>('API_CORS_ORIGIN').split(',').map((origin) => origin.trim()),
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }));
  app.useGlobalFilters(new ApiExceptionFilter());

  const swaggerEnabled = config.get<string>('ENABLE_SWAGGER', 'false') === 'true'
    && config.get<string>('NODE_ENV', 'development') !== 'production';
  if (swaggerEnabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('5x5 API')
      .setDescription('API do jogo 5x5 com autenticação, catálogo e administração.')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document);
  }

  const port = config.get<number>('API_PORT', 3000);
  const host = config.get<string>('API_HOST', '0.0.0.0');
  app.enableShutdownHooks();
  await app.listen(port, host);
  console.log(`5x5 API running at http://localhost:${port}/api`);
  if (swaggerEnabled) console.log(`Swagger available at http://localhost:${port}/docs`);
}

void bootstrap();
