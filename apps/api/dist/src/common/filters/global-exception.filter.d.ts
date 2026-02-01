import { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export interface ErrorResponse {
    success: false;
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    path?: string;
    stack?: string;
}
export declare class GlobalExceptionFilter implements ExceptionFilter {
    private readonly configService;
    private readonly logger;
    constructor(configService: ConfigService);
    catch(exception: unknown, host: ArgumentsHost): void;
}
