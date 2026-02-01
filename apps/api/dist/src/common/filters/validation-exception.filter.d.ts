import { ExceptionFilter, ArgumentsHost, BadRequestException } from '@nestjs/common';
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
export declare class ValidationExceptionFilter implements ExceptionFilter {
    private readonly logger;
    catch(exception: BadRequestException, host: ArgumentsHost): void;
}
