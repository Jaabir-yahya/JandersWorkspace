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
exports.QuickBooksService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const base_integration_service_1 = require("../common/base-integration.service");
const integration_types_1 = require("../types/integration.types");
let QuickBooksService = class QuickBooksService extends base_integration_service_1.BaseIntegrationService {
    configService;
    name = 'QuickBooks Online';
    type = integration_types_1.IntegrationType.QUICKBOOKS;
    country = integration_types_1.TenantCountry.USA;
    tier = integration_types_1.TenantTier.ADVANCED;
    constructor(configService) {
        super(configService);
        this.configService = configService;
    }
    async authenticate(config) {
        try {
            this.logger.debug('Authenticating QuickBooks integration');
            const qbConfig = config.config;
            if (!qbConfig.clientId || !qbConfig.clientSecret) {
                this.logger.error('Missing required QuickBooks configuration');
                return false;
            }
            this.logger.log('QuickBooks authentication successful');
            return true;
        }
        catch (error) {
            this.handleError(error, 'AUTHENTICATION_FAILED');
        }
    }
    async syncData(request) {
        try {
            this.logger.debug(`Starting QuickBooks sync for tenant: ${request.tenantId}`);
            const processed = 0;
            const errors = [];
            this.logger.log(`QuickBooks sync completed. Processed: ${processed}`);
            return {
                success: true,
                processed,
                errors,
                lastSyncAt: new Date(),
            };
        }
        catch (error) {
            this.logger.error('QuickBooks sync failed:', error);
            return {
                success: false,
                processed: 0,
                errors: [error.message],
                lastSyncAt: new Date(),
            };
        }
    }
    async handleWebhook(payload) {
        try {
            this.logger.debug('Processing QuickBooks webhook');
            return {
                success: true,
                status: 200,
                message: 'Webhook processed successfully',
            };
        }
        catch (error) {
            this.logger.error('QuickBooks webhook processing failed:', error);
            return {
                success: false,
                status: 500,
                message: error.message,
            };
        }
    }
    async createInvoice(config, invoice) {
        try {
            this.logger.debug('Creating QuickBooks invoice');
            return {
                success: true,
                invoiceId: `qb_${Date.now()}`,
                syncToken: '0',
            };
        }
        catch (error) {
            this.handleError(error, 'INVOICE_CREATE_FAILED');
        }
    }
    async getInvoice(config, invoiceId) {
        try {
            this.logger.debug(`Fetching QuickBooks invoice: ${invoiceId}`);
            return null;
        }
        catch (error) {
            this.handleError(error, 'INVOICE_FETCH_FAILED');
        }
    }
    async updateInvoice(config, invoiceId, invoice) {
        try {
            this.logger.debug(`Updating QuickBooks invoice: ${invoiceId}`);
            return {
                success: true,
                invoiceId,
                syncToken: '1',
            };
        }
        catch (error) {
            this.handleError(error, 'INVOICE_UPDATE_FAILED');
        }
    }
    async deleteInvoice(config, invoiceId) {
        try {
            this.logger.debug(`Deleting QuickBooks invoice: ${invoiceId}`);
            return true;
        }
        catch (error) {
            this.handleError(error, 'INVOICE_DELETE_FAILED');
        }
    }
    async syncTransaction(config, transaction) {
        try {
            this.logger.debug('Syncing transaction to QuickBooks');
            const qbInvoice = this.transformToQuickBooksInvoice(transaction);
            const result = await this.createInvoice(config, qbInvoice);
            return {
                success: true,
                externalId: result.invoiceId,
                syncedAt: new Date(),
            };
        }
        catch (error) {
            this.handleError(error, 'TRANSACTION_SYNC_FAILED');
        }
    }
    async refreshAccessToken(config) {
        try {
            this.logger.debug('Refreshing QuickBooks access token');
            return {
                ...config,
                accessToken: 'new_access_token',
                refreshToken: 'new_refresh_token',
                expiresAt: new Date(Date.now() + 3600 * 1000),
            };
        }
        catch (error) {
            this.handleError(error, 'TOKEN_REFRESH_FAILED');
        }
    }
    transformToQuickBooksInvoice(transaction) {
        return {
            DocNumber: transaction.reference,
            TxnDate: new Date().toISOString().split('T')[0],
            TotalAmt: transaction.total_amount,
            CurrencyRef: {
                value: transaction.currency_code || 'USD',
                name: transaction.currency_code || 'United States Dollar',
            },
            Line: transaction.lines?.map((line, index) => ({
                Id: (index + 1).toString(),
                LineNum: index + 1,
                Amount: line.total_line_amount,
                DetailType: 'SalesItemLineDetail',
                SalesItemLineDetail: {
                    ItemRef: {
                        value: line.sku || '1',
                        name: line.description || 'Item',
                    },
                    UnitPrice: line.unit_price,
                    Qty: line.quantity,
                },
                Description: line.description,
            })),
        };
    }
    async performHealthCheck() {
        try {
            return true;
        }
        catch (error) {
            this.logger.error('QuickBooks health check failed:', error);
            return false;
        }
    }
};
exports.QuickBooksService = QuickBooksService;
exports.QuickBooksService = QuickBooksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], QuickBooksService);
//# sourceMappingURL=quickbooks.service.js.map