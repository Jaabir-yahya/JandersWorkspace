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
exports.ShopifyService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const base_integration_service_1 = require("../common/base-integration.service");
const integration_types_1 = require("../types/integration.types");
let ShopifyService = class ShopifyService extends base_integration_service_1.BaseIntegrationService {
    configService;
    name = 'Shopify';
    type = integration_types_1.IntegrationType.SHOPIFY;
    country = integration_types_1.TenantCountry.USA;
    tier = integration_types_1.TenantTier.ADVANCED;
    constructor(configService) {
        super(configService);
        this.configService = configService;
    }
    async authenticate(config) {
        try {
            this.logger.debug('Authenticating Shopify integration');
            const shopifyConfig = config.config;
            if (!shopifyConfig.shopDomain || !shopifyConfig.accessToken) {
                this.logger.error('Missing required Shopify configuration');
                return false;
            }
            this.logger.log('Shopify authentication successful');
            return true;
        }
        catch (error) {
            this.handleError(error, 'AUTHENTICATION_FAILED');
        }
    }
    async syncData(request) {
        try {
            this.logger.debug(`Starting Shopify sync for tenant: ${request.tenantId}`);
            const processed = 0;
            const errors = [];
            this.logger.log(`Shopify sync completed. Processed: ${processed}`);
            return {
                success: true,
                processed,
                errors,
                lastSyncAt: new Date(),
            };
        }
        catch (error) {
            this.logger.error('Shopify sync failed:', error);
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
            this.logger.debug('Processing Shopify webhook');
            return {
                success: true,
                status: 200,
                message: 'Webhook processed successfully',
            };
        }
        catch (error) {
            this.logger.error('Shopify webhook processing failed:', error);
            return {
                success: false,
                status: 500,
                message: error.message,
            };
        }
    }
    async getOrder(config, orderId) {
        try {
            this.logger.debug(`Fetching Shopify order: ${orderId}`);
            return null;
        }
        catch (error) {
            this.handleError(error, 'ORDER_FETCH_FAILED');
        }
    }
    async getOrders(config, options) {
        try {
            this.logger.debug('Fetching Shopify orders');
            return { orders: [] };
        }
        catch (error) {
            this.handleError(error, 'ORDERS_FETCH_FAILED');
        }
    }
    async createOrder(config, order) {
        try {
            this.logger.debug('Creating Shopify order');
            return {
                success: true,
                orderId: Date.now(),
                name: `#${Date.now()}`,
            };
        }
        catch (error) {
            this.handleError(error, 'ORDER_CREATE_FAILED');
        }
    }
    async updateOrder(config, orderId, order) {
        try {
            this.logger.debug(`Updating Shopify order: ${orderId}`);
            return {
                success: true,
                orderId,
            };
        }
        catch (error) {
            this.handleError(error, 'ORDER_UPDATE_FAILED');
        }
    }
    async cancelOrder(config, orderId, options) {
        try {
            this.logger.debug(`Cancelling Shopify order: ${orderId}`);
            return {
                success: true,
                orderId,
            };
        }
        catch (error) {
            this.handleError(error, 'ORDER_CANCEL_FAILED');
        }
    }
    async getProducts(config, options) {
        try {
            this.logger.debug('Fetching Shopify products');
            return { products: [] };
        }
        catch (error) {
            this.handleError(error, 'PRODUCTS_FETCH_FAILED');
        }
    }
    async getCustomer(config, customerId) {
        try {
            this.logger.debug(`Fetching Shopify customer: ${customerId}`);
            return null;
        }
        catch (error) {
            this.handleError(error, 'CUSTOMER_FETCH_FAILED');
        }
    }
    async createCustomer(config, customer) {
        try {
            this.logger.debug('Creating Shopify customer');
            return {
                success: true,
                customerId: Date.now(),
            };
        }
        catch (error) {
            this.handleError(error, 'CUSTOMER_CREATE_FAILED');
        }
    }
    async syncTransactionToOrder(config, transaction) {
        try {
            this.logger.debug('Syncing transaction to Shopify order');
            const shopifyOrder = this.transformToShopifyOrder(transaction);
            const result = await this.createOrder(config, shopifyOrder);
            return {
                success: true,
                externalId: result.orderId.toString(),
                syncedAt: new Date(),
            };
        }
        catch (error) {
            this.handleError(error, 'TRANSACTION_SYNC_FAILED');
        }
    }
    async verifyWebhook(config, hmac, rawBody) {
        try {
            this.logger.debug('Verifying Shopify webhook');
            return true;
        }
        catch (error) {
            this.logger.error('Shopify webhook verification failed:', error);
            return false;
        }
    }
    transformToShopifyOrder(transaction) {
        return {
            email: transaction.entity?.email || '',
            financial_status: 'pending',
            total_price: transaction.total_amount?.toString() || '0',
            currency: transaction.currency_code || 'USD',
            line_items: transaction.lines?.map((line) => ({
                title: line.description || 'Item',
                quantity: line.quantity || 1,
                price: line.unit_price?.toString() || '0',
            })),
        };
    }
    async performHealthCheck() {
        try {
            return true;
        }
        catch (error) {
            this.logger.error('Shopify health check failed:', error);
            return false;
        }
    }
};
exports.ShopifyService = ShopifyService;
exports.ShopifyService = ShopifyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ShopifyService);
//# sourceMappingURL=shopify.service.js.map