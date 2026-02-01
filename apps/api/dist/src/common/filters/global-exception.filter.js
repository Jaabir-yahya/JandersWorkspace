"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var GlobalExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let GlobalExceptionFilter = GlobalExceptionFilter_1 = class GlobalExceptionFilter {
    configService;
    logger = new common_1.Logger(GlobalExceptionFilter_1.name);
    constructor(configService) {
        this.configService = configService;
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let code = 'INTERNAL_ERROR';
        let details = undefined;
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            }
            else if (exceptionResponse && typeof exceptionResponse === 'object') {
                message = exceptionResponse.message || message;
                details = exceptionResponse.details;
                code = exceptionResponse.code || code;
            }
            if (exception instanceof Error && exception.code) {
                code = exception.code;
            }
        }
        else if (exception instanceof Error) {
            message = exception.message;
            code = exception.name || 'UNKNOWN_ERROR';
            details = exception.stack;
        }
        const errorResponse = {
            success: false,
            code,
            message,
            details,
            timestamp: new Date().toISOString(),
            path: request.url,
        };
        if (this.configService.get('NODE_ENV') === 'development' &&
            exception instanceof Error) {
            errorResponse.stack = exception.stack;
        }
        this.logger.error(`${request.method} ${request.url} - ${status} - ${code} - ${message}`, exception instanceof Error ? exception.stack : exception);
        response.status(status).json(errorResponse);
    }
};
exports.GlobalExceptionFilter = GlobalExceptionFilter;
exports.GlobalExceptionFilter = GlobalExceptionFilter = GlobalExceptionFilter_1 = __decorate([
    (0, common_1.Catch)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], GlobalExceptionFilter);
//# sourceMappingURL=global-exception.filter.js.map