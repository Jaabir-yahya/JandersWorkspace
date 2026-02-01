import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

export interface ErrorResponse {
  success: false;
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  path?: string;
  stack?: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(private readonly configService: ConfigService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';
    let details: any = undefined;

    // Handle different types of exceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (exceptionResponse && typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || message;
        details = (exceptionResponse as any).details;
        code = (exceptionResponse as any).code || code;
      }

      // Extract code from exception if available
      if (exception instanceof Error && (exception as any).code) {
        code = (exception as any).code;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      code = exception.name || 'UNKNOWN_ERROR';
      details = exception.stack;
    }

    // Build error response
    const errorResponse: ErrorResponse = {
      success: false,
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Include stack trace in development
    if (
      this.configService.get('NODE_ENV') === 'development' &&
      exception instanceof Error
    ) {
      errorResponse.stack = exception.stack;
    }

    // Log the error
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${code} - ${message}`,
      exception instanceof Error ? exception.stack : exception,
    );

    // Send the error response
    response.status(status).json(errorResponse);
  }
}
