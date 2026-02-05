import { Module } from '@nestjs/common';

/**
 * Swagger Module for Project Bridge API
 *
 * This module provides Swagger/OpenAPI documentation configuration.
 * The actual Swagger setup is done in main.ts using the swagger.config.ts file.
 *
 * Usage:
 * - Import this module in AppModule if you need Swagger-specific providers
 * - Swagger UI is automatically set up in main.ts at /api/docs
 */
@Module({
  providers: [],
  exports: [],
})
export class SwaggerModule {}
