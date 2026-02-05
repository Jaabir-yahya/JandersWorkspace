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
  const allowedOrigins =
    process.env.ALLOWED_ORIGINS?.split(',').map((o) => o.trim()) || [];
  const isDevelopment = process.env.NODE_ENV === 'development';

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) {
        callback(null, true);
        return;
      }

      // In development, allow localhost origins if not configured
      if (allowedOrigins.length === 0) {
        if (
          isDevelopment &&
          (origin.includes('localhost') || origin.includes('127.0.0.1'))
        ) {
          callback(null, true);
          return;
        }
        callback(
          new Error(
            'CORS not configured - Set ALLOWED_ORIGINS environment variable',
          ),
          false,
        );
        return;
      }

      // Check if origin is allowed
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(
          new Error(
            `Origin ${origin} not allowed. Add to ALLOWED_ORIGINS environment variable`,
          ),
          false,
        );
      }
    },
    credentials: true,
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
