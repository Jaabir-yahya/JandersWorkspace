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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseIntegrationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const integration_types_1 = require("../types/integration.types");
let BaseIntegrationService = class BaseIntegrationService {
    configService;
    logger;
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(this.constructor.name);
    }
    async onModuleInit() {
        this.logger.log(`Initializing ${this.name} integration service`);
        await this.initialize();
    }
    async initialize() {
    }
    async testConnection(config) {
        try {
            this.logger.debug(`Testing connection to ${this.name}`);
            return await this.authenticate(config);
        }
        catch (error) {
            this.logger.error(`Connection test failed for ${this.name}:`, error);
            return false;
        }
    }
    async getHealthStatus() {
        const startTime = Date.now();
        try {
            const isHealthy = await this.performHealthCheck();
            const responseTime = Date.now() - startTime;
            return {
                status: isHealthy ? 'HEALTHY' : 'UNHEALTHY',
                lastCheck: new Date(),
                responseTime,
            };
        }
        catch (error) {
            const responseTime = Date.now() - startTime;
            return {
                status: 'UNHEALTHY',
                lastCheck: new Date(),
                responseTime,
                errorMessage: error.message,
            };
        }
    }
    async performHealthCheck() {
        return true;
    }
    handleError(error, code) {
        this.logger.error(`Integration error in ${this.name}:`, error);
        if (error instanceof integration_types_1.IntegrationError) {
            throw error;
        }
        throw new integration_types_1.IntegrationError(this.type, code, error.message || 'Unknown integration error', error.details || error);
    }
    validateTenantTier(config) {
        if (this.tier === integration_types_1.TenantTier.ADVANCED) {
        }
    }
    sanitizeConfig(config) {
        const sanitized = { ...config.config };
        const sensitiveKeys = ['password', 'secret', 'token', 'key'];
        for (const key of Object.keys(sanitized)) {
            if (sensitiveKeys.some((sensitive) => key.toLowerCase().includes(sensitive))) {
                sanitized[key] = '[REDACTED]';
            }
        }
        return sanitized;
    }
    generateCorrelationId() {
        return `${this.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
};
exports.BaseIntegrationService = BaseIntegrationService;
exports.BaseIntegrationService = BaseIntegrationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], BaseIntegrationService);
//# sourceMappingURL=base-integration.service.js.map