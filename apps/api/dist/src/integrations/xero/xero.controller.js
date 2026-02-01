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
exports.XeroController = void 0;
const common_1 = require("@nestjs/common");
const xero_service_1 = require("./xero.service");
let XeroController = class XeroController {
    xeroService;
    constructor(xeroService) {
        this.xeroService = xeroService;
    }
    async initiateAuth(req) {
        const tenantId = req.user?.tenantId || 'default';
        return {
            success: true,
            message: 'OAuth flow initiated',
            tenantId,
            authUrl: 'https://login.xero.com/identity/connect/authorize',
        };
    }
    async handleAuthCallback(req, body) {
        const tenantId = req.user?.tenantId || 'default';
        return {
            success: true,
            message: 'Authentication successful',
            tenantId,
        };
    }
    async createInvoice(req, invoice) {
        const tenantId = req.user?.tenantId || 'default';
        const config = {
            clientId: '',
            clientSecret: '',
            redirectUri: '',
            environment: 'development',
            tenantId: '',
            accessToken: '',
            refreshToken: '',
        };
        const result = await this.xeroService.createInvoice(config, invoice);
        return {
            success: true,
            data: result,
            tenantId,
        };
    }
    async getInvoice(req, invoiceId) {
        const tenantId = req.user?.tenantId || 'default';
        const config = {
            clientId: '',
            clientSecret: '',
            redirectUri: '',
            environment: 'development',
            tenantId: '',
            accessToken: '',
            refreshToken: '',
        };
        const result = await this.xeroService.getInvoice(config, invoiceId);
        return {
            success: true,
            data: result,
            tenantId,
        };
    }
    async updateInvoice(req, invoiceId, invoice) {
        const tenantId = req.user?.tenantId || 'default';
        const config = {
            clientId: '',
            clientSecret: '',
            redirectUri: '',
            environment: 'development',
            tenantId: '',
            accessToken: '',
            refreshToken: '',
        };
        const result = await this.xeroService.updateInvoice(config, invoiceId, invoice);
        return {
            success: true,
            data: result,
            tenantId,
        };
    }
    async deleteInvoice(req, invoiceId) {
        const tenantId = req.user?.tenantId || 'default';
        const config = {
            clientId: '',
            clientSecret: '',
            redirectUri: '',
            environment: 'development',
            tenantId: '',
            accessToken: '',
            refreshToken: '',
        };
        const result = await this.xeroService.deleteInvoice(config, invoiceId);
        return {
            success: result,
            tenantId,
        };
    }
    async getContacts(req, page = 1) {
        const tenantId = req.user?.tenantId || 'default';
        const config = {
            clientId: '',
            clientSecret: '',
            redirectUri: '',
            environment: 'development',
            tenantId: '',
            accessToken: '',
            refreshToken: '',
        };
        const result = await this.xeroService.getContacts(config, page);
        return {
            success: true,
            data: result,
            tenantId,
        };
    }
    async createContact(req, contact) {
        const tenantId = req.user?.tenantId || 'default';
        const config = {
            clientId: '',
            clientSecret: '',
            redirectUri: '',
            environment: 'development',
            tenantId: '',
            accessToken: '',
            refreshToken: '',
        };
        const result = await this.xeroService.createContact(config, contact);
        return {
            success: true,
            data: result,
            tenantId,
        };
    }
    async syncBulk(req, body) {
        const tenantId = req.user?.tenantId || 'default';
        const result = await this.xeroService.syncData({
            tenantId,
            type: 'OUTBOUND',
            dataType: body.dataType,
        });
        return {
            success: result.success,
            data: result,
            tenantId,
        };
    }
    async handleWebhook(payload) {
        const result = await this.xeroService.handleWebhook(payload);
        return result;
    }
    async refreshToken(req) {
        const tenantId = req.user?.tenantId || 'default';
        const config = {
            clientId: '',
            clientSecret: '',
            redirectUri: '',
            environment: 'development',
            tenantId: '',
            accessToken: '',
            refreshToken: '',
        };
        const result = await this.xeroService.refreshAccessToken(config);
        return {
            success: true,
            data: {
                expiresAt: result.expiresAt,
            },
            tenantId,
        };
    }
    async getHealthStatus() {
        const health = await this.xeroService.getHealthStatus();
        return {
            service: this.xeroService.name,
            ...health,
        };
    }
};
exports.XeroController = XeroController;
__decorate([
    (0, common_1.Post)('auth/initiate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], XeroController.prototype, "initiateAuth", null);
__decorate([
    (0, common_1.Post)('auth/callback'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], XeroController.prototype, "handleAuthCallback", null);
__decorate([
    (0, common_1.Post)('invoices'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], XeroController.prototype, "createInvoice", null);
__decorate([
    (0, common_1.Get)('invoices/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], XeroController.prototype, "getInvoice", null);
__decorate([
    (0, common_1.Post)('invoices/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], XeroController.prototype, "updateInvoice", null);
__decorate([
    (0, common_1.Post)('invoices/:id/delete'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], XeroController.prototype, "deleteInvoice", null);
__decorate([
    (0, common_1.Get)('contacts'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], XeroController.prototype, "getContacts", null);
__decorate([
    (0, common_1.Post)('contacts'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], XeroController.prototype, "createContact", null);
__decorate([
    (0, common_1.Post)('sync/bulk'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], XeroController.prototype, "syncBulk", null);
__decorate([
    (0, common_1.Post)('webhook'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], XeroController.prototype, "handleWebhook", null);
__decorate([
    (0, common_1.Post)('token/refresh'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], XeroController.prototype, "refreshToken", null);
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], XeroController.prototype, "getHealthStatus", null);
exports.XeroController = XeroController = __decorate([
    (0, common_1.Controller)('api/v1/integrations/xero'),
    __metadata("design:paramtypes", [xero_service_1.XeroService])
], XeroController);
//# sourceMappingURL=xero.controller.js.map