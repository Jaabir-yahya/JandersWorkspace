"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const global_exception_filter_1 = require("./common/filters/global-exception.filter");
const validation_exception_filter_1 = require("./common/filters/validation-exception.filter");
const swagger_config_1 = require("./swagger/swagger.config");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        exceptionFactory: (errors) => {
            const validationErrors = errors.map((error) => ({
                field: error.property,
                message: Object.values(error.constraints || {}).join(', '),
                value: error.value,
            }));
            return new common_1.BadRequestException({
                code: 'VALIDATION_ERROR',
                message: 'Request validation failed',
                details: validationErrors,
            });
        },
    }));
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map((o) => o.trim()) || [];
    const isDevelopment = process.env.NODE_ENV === 'development';
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin) {
                callback(null, true);
                return;
            }
            if (allowedOrigins.length === 0) {
                if (isDevelopment &&
                    (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
                    callback(null, true);
                    return;
                }
                callback(new Error('CORS not configured - Set ALLOWED_ORIGINS environment variable'), false);
                return;
            }
            if (allowedOrigins.includes(origin)) {
                callback(null, true);
            }
            else {
                callback(new Error(`Origin ${origin} not allowed. Add to ALLOWED_ORIGINS environment variable`), false);
            }
        },
        credentials: true,
    });
    app.useGlobalFilters(new global_exception_filter_1.GlobalExceptionFilter(app.get(config_1.ConfigService)), new validation_exception_filter_1.ValidationExceptionFilter());
    app.setGlobalPrefix('api/v1');
    const document = swagger_1.SwaggerModule.createDocument(app, swagger_config_1.swaggerConfig, swagger_config_1.swaggerDocumentOptions);
    swagger_1.SwaggerModule.setup('api/docs', app, document, swagger_config_1.swaggerUiOptions);
    const port = process.env.PORT ?? 3001;
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}/api/v1`);
    console.log(`API Documentation available at: http://localhost:${port}/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map