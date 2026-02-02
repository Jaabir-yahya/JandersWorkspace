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
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationsController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../auth/auth.guard");
const tenant_config_service_1 = require("../integrations/tenant-config.service");
const mpesa_service_1 = require("../integrations/kenya/mpesa/mpesa.service");
const integration_types_1 = require("../integrations/types/integration.types");
let IntegrationsController = class IntegrationsController {
    tenantConfigService;
    mpesaService;
    constructor(tenantConfigService, mpesaService) {
        this.tenantConfigService = tenantConfigService;
        this.mpesaService = mpesaService;
    }
    async getAvailableFeatures(req) {
        const tenantId = req.user?.tenantId || 'default';
        return this.tenantConfigService.getAvailableFeatures(tenantId);
    }
    async getTenantFeatures(req) {
        const tenantId = req.user?.tenantId || 'default';
        return this.tenantConfigService.getTenantFeatures(tenantId);
    }
    async getTenantConfig(req) {
        const tenantId = req.user?.tenantId || 'default';
        return this.tenantConfigService.getTenantConfig(tenantId);
    }
    async upgradeTier(req, tier) {
        const tenantId = req.user?.tenantId || 'default';
        return this.tenantConfigService.upgradeTier(tenantId, tier);
    }
    async initiateStkPush(req, stkPushDto) {
        const tenantId = req.user?.tenantId || 'default';
        await this.tenantConfigService.requireFeatureAccess(tenantId, 'mpesa_integration');
        const mpesaConfig = {
            consumerKey: process.env.MPESA_CONSUMER_KEY || '',
            consumerSecret: process.env.MPESA_CONSUMER_SECRET || '',
            passkey: process.env.MPESA_PASSKEY || '',
            shortcode: parseInt(process.env.MPESA_SHORTCODE || '0', 10),
            callbackUrl: process.env.MPESA_CALLBACK_URL || '',
            environment: process.env.MPESA_ENVIRONMENT || 'SANDBOX',
        };
        const request = {
            businessShortCode: mpesaConfig.shortcode,
            transactionType: 'CustomerPayBillOnline',
            amount: stkPushDto.amount,
            phoneNumber: stkPushDto.phoneNumber,
            callBackURL: mpesaConfig.callbackUrl,
            accountReference: stkPushDto.accountReference,
            transactionDesc: stkPushDto.transactionDesc || 'Payment',
        };
        const config = {
            id: '1',
            tenantId,
            integrationType: integration_types_1.IntegrationType.MPESA,
            config: mpesaConfig,
            isActive: true,
            syncStatus: integration_types_1.IntegrationStatus.ACTIVE,
            errorCount: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        return this.mpesaService.initiateStkPush(config, request, stkPushDto.transactionId);
    }
    async registerC2bUrls(req, body) {
        const tenantId = req.user?.tenantId || 'default';
        await this.tenantConfigService.requireFeatureAccess(tenantId, 'mpesa_c2b');
        const mpesaConfig = {
            consumerKey: process.env.MPESA_CONSUMER_KEY || '',
            consumerSecret: process.env.MPESA_CONSUMER_SECRET || '',
            callbackUrl: process.env.MPESA_C2B_CALLBACK_URL || '',
            environment: process.env.MPESA_ENVIRONMENT || 'SANDBOX',
        };
        const config = {
            id: '1',
            tenantId,
            integrationType: integration_types_1.IntegrationType.MPESA,
            config: mpesaConfig,
            isActive: true,
            syncStatus: integration_types_1.IntegrationStatus.ACTIVE,
            errorCount: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        return this.mpesaService.registerC2bUrls(config, body);
    }
    async sendB2cPayment(req, body) {
        const tenantId = req.user?.tenantId || 'default';
        await this.tenantConfigService.requireFeatureAccess(tenantId, 'mpesa_b2c');
        const mpesaConfig = {
            consumerKey: process.env.MPESA_CONSUMER_KEY || '',
            consumerSecret: process.env.MPESA_CONSUMER_SECRET || '',
            passkey: process.env.MPESA_PASSKEY || '',
            shortcode: parseInt(process.env.MPESA_SHORTCODE || '0', 10),
            initiatorName: process.env.MPESA_INITIATOR_NAME || '',
            securityCredential: process.env.MPESA_SECURITY_CREDENTIAL || '',
            timeoutUrl: process.env.MPESA_B2C_TIMEOUT_URL || '',
            resultUrl: process.env.MPESA_B2C_RESULT_URL || '',
            environment: process.env.MPESA_ENVIRONMENT || 'SANDBOX',
        };
        const request = {
            InitiatorName: mpesaConfig.initiatorName,
            SecurityCredential: mpesaConfig.securityCredential,
            CommandID: 'BusinessPayment',
            Amount: body.Amount,
            PartyA: mpesaConfig.shortcode,
            PartyB: body.PartyB,
            Remarks: body.Remarks,
            QueueTimeOutURL: mpesaConfig.timeoutUrl,
            ResultURL: mpesaConfig.resultUrl,
            Occasion: body.Occasion,
        };
        const config = {
            id: '1',
            tenantId,
            integrationType: integration_types_1.IntegrationType.MPESA,
            config: mpesaConfig,
            isActive: true,
            syncStatus: integration_types_1.IntegrationStatus.ACTIVE,
            errorCount: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        return this.mpesaService.sendB2cPayment(config, request, body.transactionId);
    }
    async handleMpesaWebhook(payload) {
        return this.mpesaService.handleWebhook(payload);
    }
    async updateIntegrationConfig(req, integrationType, config) {
        const tenantId = req.user?.tenantId || 'default';
        await this.tenantConfigService.updateIntegrationConfig(tenantId, integrationType, config);
        return { message: `${integrationType} configuration updated successfully` };
    }
    async getIntegrationConfig(req, integrationType) {
        const tenantId = req.user?.tenantId || 'default';
        await this.tenantConfigService.requireFeatureAccess(tenantId, `${integrationType.toLowerCase()}_sync`);
        return this.tenantConfigService.getIntegrationConfig(tenantId, integrationType);
    }
    async testIntegration(req, integrationType) {
        const tenantId = req.user?.tenantId || 'default';
        await this.tenantConfigService.requireFeatureAccess(tenantId, `${integrationType.toLowerCase()}_sync`);
        const config = await this.tenantConfigService.getIntegrationConfig(tenantId, integrationType);
        switch (integrationType) {
            case integration_types_1.IntegrationType.MPESA: {
                const mpesaConfig = {
                    id: '1',
                    tenantId,
                    integrationType: integration_types_1.IntegrationType.MPESA,
                    config: config || {},
                    isActive: true,
                    syncStatus: integration_types_1.IntegrationStatus.ACTIVE,
                    errorCount: 0,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                return this.mpesaService.testConnection(mpesaConfig);
            }
            default:
                return {
                    success: false,
                    message: `${integrationType} integration is temporarily disabled. Will be available in Phase 4.`,
                };
        }
    }
    async getIntegrationHealth(req, integrationType) {
        const tenantId = req.user?.tenantId || 'default';
        await this.tenantConfigService.requireFeatureAccess(tenantId, `${integrationType.toLowerCase()}_sync`);
        switch (integrationType) {
            case integration_types_1.IntegrationType.MPESA:
                return this.mpesaService.getHealthStatus();
            default:
                return {
                    status: 'UNHEALTHY',
                    errorMessage: 'Integration not supported',
                };
        }
    }
};
exports.IntegrationsController = IntegrationsController;
__decorate([
    (0, common_1.Get)('features'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "getAvailableFeatures", null);
__decorate([
    (0, common_1.Get)('tenant-features'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "getTenantFeatures", null);
__decorate([
    (0, common_1.Get)('config'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "getTenantConfig", null);
__decorate([
    (0, common_1.Put)('tier'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('tier')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "upgradeTier", null);
__decorate([
    (0, common_1.Post)('mpesa/stk-push'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "initiateStkPush", null);
__decorate([
    (0, common_1.Post)('mpesa/c2b/register'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "registerC2bUrls", null);
__decorate([
    (0, common_1.Post)('mpesa/b2c'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "sendB2cPayment", null);
__decorate([
    (0, common_1.Post)('mpesa/webhook'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "handleMpesaWebhook", null);
__decorate([
    (0, common_1.Put)(':integrationType/config'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('integrationType')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "updateIntegrationConfig", null);
__decorate([
    (0, common_1.Get)(':integrationType/config'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('integrationType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "getIntegrationConfig", null);
__decorate([
    (0, common_1.Post)(':integrationType/test'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('integrationType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "testIntegration", null);
__decorate([
    (0, common_1.Get)(':integrationType/health'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('integrationType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "getIntegrationHealth", null);
exports.IntegrationsController = IntegrationsController = __decorate([
    (0, common_1.Controller)('api/v1/integrations'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __metadata("design:paramtypes", [tenant_config_service_1.TenantConfigService,
        mpesa_service_1.MpesaService])
], IntegrationsController);
//# sourceMappingURL=integrations.controller.js.map