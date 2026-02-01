import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

export interface ValidationErrorResponse {
  success: false;
  code: 'VALIDATION_ERROR';
  message: string;
  details: {
    field: string;
    message: string;
    value?: any;
  }[];
  timestamp: string;
  path?: string;
}

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ValidationExceptionFilter.name);

  catch(exception: BadRequestException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const exceptionResponse = exception.getResponse();

    let validationErrors: any[] = [];

    if (exceptionResponse && typeof exceptionResponse === 'object') {
      // Handle class-validator errors
      if (Array.isArray(exceptionResponse)) {
        validationErrors = exceptionResponse.map((error) => ({
          field: error.property,
          message: Object.values(error.constraints || {}).join(', '),
          value: error.value,
        }));
      } else if ((exceptionResponse as any).message) {
        // Handle string messages
        validationErrors = [
          {
            field: 'general',
            message: (exceptionResponse as any).message,
            value: undefined,
          },
        ];
      }
    } else {
      validationErrors = [
        {
          field: 'general',
          message: exception.message || 'Validation failed',
          value: undefined,
        },
      ];
    }

    const errorResponse: ValidationErrorResponse = {
      success: false,
      code: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      details: validationErrors,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Log validation errors
    this.logger.warn(
      `Validation error on ${request.method} ${request.url}: ${JSON.stringify(validationErrors)}`,
    );

    response.status(400).json(errorResponse);
  }
}
