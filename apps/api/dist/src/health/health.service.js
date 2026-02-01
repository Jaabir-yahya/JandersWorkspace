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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var HealthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const supabase_js_1 = require("@supabase/supabase-js");
const common_2 = require("@nestjs/common");
const auth_module_1 = require("../auth/auth.module");
let HealthService = HealthService_1 = class HealthService {
    configService;
    prismaService;
    supabaseClient;
    logger = new common_1.Logger(HealthService_1.name);
    startTime;
    constructor(configService, prismaService, supabaseClient) {
        this.configService = configService;
        this.prismaService = prismaService;
        this.supabaseClient = supabaseClient;
        this.startTime = Date.now();
    }
    getBasicHealth() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
        };
    }
    async getDetailedHealth() {
        const startTime = Date.now();
        const [databaseCheck, supabaseCheck, memoryCheck, integrationCheck] = await Promise.all([
            this.checkDatabase(),
            this.checkSupabase(),
            this.checkMemory(),
            this.checkIntegrations(),
        ]);
        const checks = [databaseCheck, supabaseCheck, memoryCheck];
        const hasUnhealthy = checks.some((c) => c.status === 'unhealthy');
        const hasDegraded = checks.some((c) => c.status === 'degraded');
        const overallStatus = hasUnhealthy
            ? 'unhealthy'
            : hasDegraded
                ? 'degraded'
                : 'healthy';
        return {
            status: overallStatus,
            timestamp: new Date().toISOString(),
            uptime: Date.now() - this.startTime,
            version: process.env.npm_package_version || '1.0.0',
            environment: this.configService.get('NODE_ENV') || 'development',
            checks: {
                database: databaseCheck,
                supabase: supabaseCheck,
                memory: memoryCheck,
                integrations: integrationCheck,
            },
        };
    }
    async getReadiness() {
        const [databaseHealthy, supabaseHealthy, envVarsHealthy] = await Promise.all([
            this.isDatabaseReady(),
            this.isSupabaseReady(),
            this.areRequiredEnvVarsSet(),
        ]);
        const ready = databaseHealthy && supabaseHealthy && envVarsHealthy;
        return {
            ready,
            timestamp: new Date().toISOString(),
            checks: {
                database: databaseHealthy,
                supabase: supabaseHealthy,
                requiredEnvVars: envVarsHealthy,
            },
        };
    }
    getLiveness() {
        return {
            alive: true,
            timestamp: new Date().toISOString(),
            uptime: Date.now() - this.startTime,
        };
    }
    async checkDatabase() {
        const startTime = Date.now();
        try {
            await this.prismaService.$queryRaw `SELECT 1`;
            return {
                status: 'healthy',
                responseTime: Date.now() - startTime,
                message: 'Database connection is healthy',
            };
        }
        catch (error) {
            this.logger.error('Database health check failed:', error);
            return {
                status: 'unhealthy',
                responseTime: Date.now() - startTime,
                message: 'Database connection failed',
                details: { error: error.message },
            };
        }
    }
    async checkSupabase() {
        const startTime = Date.now();
        try {
            const { data, error } = await this.supabaseClient.auth.getSession();
            if (error) {
                throw error;
            }
            return {
                status: 'healthy',
                responseTime: Date.now() - startTime,
                message: 'Supabase connection is healthy',
            };
        }
        catch (error) {
            this.logger.error('Supabase health check failed:', error);
            return {
                status: 'unhealthy',
                responseTime: Date.now() - startTime,
                message: 'Supabase connection failed',
                details: { error: error.message },
            };
        }
    }
    checkMemory() {
        const startTime = Date.now();
        const usage = process.memoryUsage();
        const maxMemory = 1024 * 1024 * 1024;
        const usedMemory = usage.heapUsed;
        const memoryPercent = (usedMemory / maxMemory) * 100;
        let status = 'healthy';
        let message = 'Memory usage is normal';
        if (memoryPercent > 90) {
            status = 'unhealthy';
            message = 'Memory usage is critically high';
        }
        else if (memoryPercent > 75) {
            status = 'degraded';
            message = 'Memory usage is high';
        }
        return {
            status,
            responseTime: Date.now() - startTime,
            message,
            details: {
                heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
                heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
                rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
                external: `${Math.round(usage.external / 1024 / 1024)}MB`,
                percentage: `${Math.round(memoryPercent)}%`,
            },
        };
    }
    async checkIntegrations() {
        const startTime = Date.now();
        const whatsappCheck = await this.checkWhatsAppHealth();
        const mpesaCheck = await this.checkMpesaHealth();
        const hasUnhealthy = whatsappCheck.status === 'unhealthy' || mpesaCheck.status === 'unhealthy';
        const hasDegraded = whatsappCheck.status === 'degraded' || mpesaCheck.status === 'degraded';
        const status = hasUnhealthy
            ? 'unhealthy'
            : hasDegraded
                ? 'degraded'
                : 'healthy';
        return {
            status,
            services: {
                whatsapp: whatsappCheck,
                mpesa: mpesaCheck,
            },
        };
    }
    async checkWhatsAppHealth() {
        const startTime = Date.now();
        try {
            const phoneNumberId = this.configService.get('WHATSAPP_PHONE_NUMBER_ID');
            const accessToken = this.configService.get('WHATSAPP_ACCESS_TOKEN');
            const verifyToken = this.configService.get('WHATSAPP_VERIFY_TOKEN');
            if (!phoneNumberId || !accessToken || !verifyToken) {
                return {
                    status: 'degraded',
                    responseTime: Date.now() - startTime,
                    message: 'WhatsApp credentials not configured',
                    details: {
                        hasPhoneNumberId: !!phoneNumberId,
                        hasAccessToken: !!accessToken,
                        hasVerifyToken: !!verifyToken,
                    },
                };
            }
            return {
                status: 'healthy',
                responseTime: Date.now() - startTime,
                message: 'WhatsApp credentials configured',
                details: {
                    phoneNumberId: phoneNumberId.substring(0, 4) + '...',
                },
            };
        }
        catch (error) {
            this.logger.error('WhatsApp health check failed:', error);
            return {
                status: 'unhealthy',
                responseTime: Date.now() - startTime,
                message: 'WhatsApp health check failed',
                details: { error: error.message },
            };
        }
    }
    async checkMpesaHealth() {
        const startTime = Date.now();
        try {
            const consumerKey = this.configService.get('MPESA_CONSUMER_KEY');
            const consumerSecret = this.configService.get('MPESA_CONSUMER_SECRET');
            const passkey = this.configService.get('MPESA_PASSKEY');
            const environment = this.configService.get('MPESA_ENVIRONMENT');
            if (!consumerKey || !consumerSecret || !passkey) {
                return {
                    status: 'degraded',
                    responseTime: Date.now() - startTime,
                    message: 'M-Pesa credentials not fully configured',
                    details: {
                        hasConsumerKey: !!consumerKey,
                        hasConsumerSecret: !!consumerSecret,
                        hasPasskey: !!passkey,
                        environment: environment || 'not set',
                    },
                };
            }
            return {
                status: 'healthy',
                responseTime: Date.now() - startTime,
                message: 'M-Pesa credentials configured',
                details: {
                    environment: environment || 'sandbox',
                    hasConsumerKey: true,
                },
            };
        }
        catch (error) {
            this.logger.error('M-Pesa health check failed:', error);
            return {
                status: 'unhealthy',
                responseTime: Date.now() - startTime,
                message: 'M-Pesa health check failed',
                details: { error: error.message },
            };
        }
    }
    async isDatabaseReady() {
        try {
            await this.prismaService.$queryRaw `SELECT 1`;
            return true;
        }
        catch {
            return false;
        }
    }
    async isSupabaseReady() {
        try {
            const { error } = await this.supabaseClient.auth.getSession();
            return !error;
        }
        catch {
            return false;
        }
    }
    areRequiredEnvVarsSet() {
        const required = [
            'DATABASE_URL',
            'SUPABASE_URL',
            'SUPABASE_SERVICE_ROLE_KEY',
        ];
        return required.every((key) => !!this.configService.get(key));
    }
};
exports.HealthService = HealthService;
exports.HealthService = HealthService = HealthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_2.Inject)(auth_module_1.SUPABASE_AUTH_CLIENT)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService,
        supabase_js_1.SupabaseClient])
], HealthService);
//# sourceMappingURL=health.service.js.map