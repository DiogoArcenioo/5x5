import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { timingSafeEqual } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { AppModule } from './app.module';
import { ApiExceptionFilter } from './shared/api-exception.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);
  const isProduction = config.get<string>('NODE_ENV') === 'production';
  const adminUsername = config.get<string>('ADMIN_USERNAME');
  const adminPassword = config.get<string>('ADMIN_PASSWORD');

  if (isProduction && (!adminUsername || !adminPassword)) {
    throw new Error('ADMIN_USERNAME and ADMIN_PASSWORD are required in production.');
  }

  const secureCompare = (received: string, expected: string): boolean => {
    const receivedBuffer = Buffer.from(received);
    const expectedBuffer = Buffer.from(expected);
    return receivedBuffer.length === expectedBuffer.length
      && timingSafeEqual(receivedBuffer, expectedBuffer);
  };

  const adminAuth = (request: Request, response: Response, next: NextFunction): void => {
    if (!adminUsername || !adminPassword) {
      next();
      return;
    }

    const authorization = request.headers.authorization;
    if (authorization?.startsWith('Basic ')) {
      const decoded = Buffer.from(authorization.slice(6), 'base64').toString('utf8');
      const separator = decoded.indexOf(':');
      const username = separator >= 0 ? decoded.slice(0, separator) : '';
      const password = separator >= 0 ? decoded.slice(separator + 1) : '';
      if (secureCompare(username, adminUsername) && secureCompare(password, adminPassword)) {
        next();
        return;
      }
    }

    response.setHeader('WWW-Authenticate', 'Basic realm="5x5 Admin", charset="UTF-8"');
    response.status(401).send('Autenticação administrativa necessária.');
  };

  app.set('trust proxy', 1);
  app.use('/api/admin', adminAuth);
  app.use('/docs', adminAuth);
  app.use('/docs-json', adminAuth);
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
  const host = config.get<string>('API_HOST', '0.0.0.0');
  app.enableShutdownHooks();
  await app.listen(port, host);
  console.log(`5x5 API running at http://localhost:${port}/api`);
  console.log(`Swagger available at http://localhost:${port}/docs`);
}

void bootstrap();
