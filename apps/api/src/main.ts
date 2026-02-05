import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ValidationExceptionFilter } from './common/filters/validation-exception.filter';
import {
  swaggerConfig,
  swaggerDocumentOptions,
  swaggerUiOptions,
} from './swagger/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        // Custom exception factory to return structured validation errors
        const validationErrors = errors.map((error) => ({
          field: error.property,
          message: Object.values(error.constraints || {}).join(', '),
          value: error.value,
        }));

        return new BadRequestException({
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: validationErrors,
        });
      },
    }),
  );

  // Enable CORS for frontend-backend communication
  const allowedOriginsRaw =
    process.env.ALLOWED_ORIGINS?.split(',').map((o) => o.trim().replace(/\/$/, '')) || [];
  const allowedOrigins = allowedOriginsRaw.filter(Boolean);
  const isDevelopment = process.env.NODE_ENV === 'development';

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin) {
        callback(null, true);
        return;
      }
      const originNormalized = origin.replace(/\/$/, '');

      if (allowedOrigins.length === 0) {
        if (
          isDevelopment &&
          (originNormalized.includes('localhost') || originNormalized.includes('127.0.0.1'))
        ) {
          callback(null, true);
          return;
        }
        callback(
          new Error(
            'CORS not configured - Set ALLOWED_ORIGINS on Railway (e.g. https://your-app.vercel.app)',
          ),
          false,
        );
        return;
      }

      if (allowedOrigins.includes(originNormalized)) {
        callback(null, true);
      } else {
        callback(
          new Error(
            `Origin ${origin} not allowed. Add to ALLOWED_ORIGINS: ${origin}`,
          ),
          false,
        );
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Id'],
  });

  // Set global exception filters
  app.useGlobalFilters(
    new GlobalExceptionFilter(app.get(ConfigService)),
    new ValidationExceptionFilter(),
  );

  app.setGlobalPrefix('api/v1');

  // Setup Swagger/OpenAPI documentation
  const document = SwaggerModule.createDocument(
    app,
    swaggerConfig,
    swaggerDocumentOptions,
  );
  SwaggerModule.setup('api/docs', app, document, swaggerUiOptions);

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/api/v1`);
  console.log(
    `API Documentation available at: http://localhost:${port}/api/docs`,
  );
}
bootstrap();
