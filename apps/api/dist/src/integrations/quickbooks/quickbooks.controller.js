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
exports.QuickBooksController = void 0;
const common_1 = require("@nestjs/common");
const quickbooks_service_1 = require("./quickbooks.service");
const sync_transaction_dto_1 = require("./dto/sync-transaction.dto");
let QuickBooksController = class QuickBooksController {
    quickbooksService;
    constructor(quickbooksService) {
        this.quickbooksService = quickbooksService;
    }
    async initiateAuth(req) {
        const tenantId = req.user?.tenantId || 'default';
        return {
            success: true,
            message: 'OAuth flow initiated',
            tenantId,
            authUrl: 'https://appcenter.intuit.com/connect/oauth2',
        };
    }
    async handleAuthCallback(req, body) {
        const tenantId = req.user?.tenantId || 'default';
        return {
            success: true,
            message: 'Authentication successful',
            tenantId,
            realmId: body.realmId,
        };
    }
    async createInvoice(req, invoice) {
        const tenantId = req.user?.tenantId || 'default';
        const config = {
            clientId: '',
            clientSecret: '',
            redirectUri: '',
            environment: 'sandbox',
            realmId: '',
            accessToken: '',
            refreshToken: '',
        };
        const result = await this.quickbooksService.createInvoice(config, invoice);
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
            environment: 'sandbox',
            realmId: '',
            accessToken: '',
            refreshToken: '',
        };
        const result = await this.quickbooksService.getInvoice(config, invoiceId);
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
            environment: 'sandbox',
            realmId: '',
            accessToken: '',
            refreshToken: '',
        };
        const result = await this.quickbooksService.updateInvoice(config, invoiceId, invoice);
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
            environment: 'sandbox',
            realmId: '',
            accessToken: '',
            refreshToken: '',
        };
        const result = await this.quickbooksService.deleteInvoice(config, invoiceId);
        return {
            success: result,
            tenantId,
        };
    }
    async syncTransaction(req, syncDto) {
        const tenantId = req.user?.tenantId || 'default';
        const config = {
            clientId: '',
            clientSecret: '',
            redirectUri: '',
            environment: 'sandbox',
            realmId: '',
            accessToken: '',
            refreshToken: '',
        };
        const result = await this.quickbooksService.syncTransaction(config, syncDto.transaction);
        return {
            success: true,
            data: result,
            tenantId,
        };
    }
    async syncBulk(req, body) {
        const tenantId = req.user?.tenantId || 'default';
        const result = await this.quickbooksService.syncData({
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
        const result = await this.quickbooksService.handleWebhook(payload);
        return result;
    }
    async refreshToken(req) {
        const tenantId = req.user?.tenantId || 'default';
        const config = {
            clientId: '',
            clientSecret: '',
            redirectUri: '',
            environment: 'sandbox',
            realmId: '',
            accessToken: '',
            refreshToken: '',
        };
        const result = await this.quickbooksService.refreshAccessToken(config);
        return {
            success: true,
            data: {
                expiresAt: result.expiresAt,
            },
            tenantId,
        };
    }
    async getHealthStatus() {
        const health = await this.quickbooksService.getHealthStatus();
        return {
            service: this.quickbooksService.name,
            ...health,
        };
    }
};
exports.QuickBooksController = QuickBooksController;
__decorate([
    (0, common_1.Post)('auth/initiate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], QuickBooksController.prototype, "initiateAuth", null);
__decorate([
    (0, common_1.Post)('auth/callback'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], QuickBooksController.prototype, "handleAuthCallback", null);
__decorate([
    (0, common_1.Post)('invoices'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], QuickBooksController.prototype, "createInvoice", null);
__decorate([
    (0, common_1.Get)('invoices/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], QuickBooksController.prototype, "getInvoice", null);
__decorate([
    (0, common_1.Post)('invoices/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], QuickBooksController.prototype, "updateInvoice", null);
__decorate([
    (0, common_1.Post)('invoices/:id/delete'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], QuickBooksController.prototype, "deleteInvoice", null);
__decorate([
    (0, common_1.Post)('sync'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, sync_transaction_dto_1.SyncTransactionDto]),
    __metadata("design:returntype", Promise)
], QuickBooksController.prototype, "syncTransaction", null);
__decorate([
    (0, common_1.Post)('sync/bulk'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], QuickBooksController.prototype, "syncBulk", null);
__decorate([
    (0, common_1.Post)('webhook'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], QuickBooksController.prototype, "handleWebhook", null);
__decorate([
    (0, common_1.Post)('token/refresh'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], QuickBooksController.prototype, "refreshToken", null);
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], QuickBooksController.prototype, "getHealthStatus", null);
exports.QuickBooksController = QuickBooksController = __decorate([
    (0, common_1.Controller)('api/v1/integrations/quickbooks'),
    __metadata("design:paramtypes", [quickbooks_service_1.QuickBooksService])
], QuickBooksController);
//# sourceMappingURL=quickbooks.controller.js.map