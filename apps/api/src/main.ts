import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { TransformInterceptor } from './common/interceptors/transform.interceptor.js';
import { AllExceptionsFilter } from './common/filters/http-exception.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for Next.js frontend
  app.enableCors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  });

  // Global prefix: /api/v1
  app.setGlobalPrefix('api/v1');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Standard response formatting
  app.useGlobalInterceptors(new TransformInterceptor());

  // Standard error handling
  app.useGlobalFilters(new AllExceptionsFilter());

  // Swagger / OpenAPI documentation setup
  const config = new DocumentBuilder()
    .setTitle('Korfball Bantul Team Management API')
    .setDescription(
      'Dokumentasi resmi RESTful API untuk Sistem Manajemen Tim Korfball Bantul (Atlet, Coach, Manager).',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Masukkan Bearer JWT token dari Neon Auth',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Korfball Hub API Docs',
  });

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`🚀 NestJS Backend running on: http://localhost:${port}/api/v1`);
  console.log(`📖 Swagger API Documentation on: http://localhost:${port}/api/docs`);
}
await bootstrap();
