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
var ShopifyController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopifyController = void 0;
const common_1 = require("@nestjs/common");
const shopify_service_1 = require("./shopify.service");
let ShopifyController = ShopifyController_1 = class ShopifyController {
    shopifyService;
    logger = new common_1.Logger(ShopifyController_1.name);
    constructor(shopifyService) {
        this.shopifyService = shopifyService;
    }
    async initiateInstall(req) {
        const tenantId = req.user?.tenantId || 'default';
        return {
            success: true,
            message: 'Installation initiated',
            tenantId,
            installUrl: 'https://apps.shopify.com/your-app',
        };
    }
    async handleAuthCallback(req, body) {
        const tenantId = req.user?.tenantId || 'default';
        return {
            success: true,
            message: 'Authentication successful',
            tenantId,
            shop: body.shop,
        };
    }
    async getOrders(req, query) {
        const tenantId = req.user?.tenantId || 'default';
        const config = {
            shopDomain: '',
            accessToken: '',
            apiVersion: '2024-01',
        };
        const result = await this.shopifyService.getOrders(config, {
            status: query.status,
            financialStatus: query.financial_status,
            fulfillmentStatus: query.fulfillment_status,
            createdAtMin: query.created_at_min,
            createdAtMax: query.created_at_max,
            limit: query.limit,
        });
        return {
            success: true,
            data: result,
            tenantId,
        };
    }
    async getOrder(req, orderId) {
        const tenantId = req.user?.tenantId || 'default';
        const config = {
            shopDomain: '',
            accessToken: '',
            apiVersion: '2024-01',
        };
        const result = await this.shopifyService.getOrder(config, parseInt(orderId, 10));
        return {
            success: true,
            data: result,
            tenantId,
        };
    }
    async createOrder(req, order) {
        const tenantId = req.user?.tenantId || 'default';
        const config = {
            shopDomain: '',
            accessToken: '',
            apiVersion: '2024-01',
        };
        const result = await this.shopifyService.createOrder(config, order);
        return {
            success: true,
            data: result,
            tenantId,
        };
    }
    async updateOrder(req, orderId, order) {
        const tenantId = req.user?.tenantId || 'default';
        const config = {
            shopDomain: '',
            accessToken: '',
            apiVersion: '2024-01',
        };
        const result = await this.shopifyService.updateOrder(config, parseInt(orderId, 10), order);
        return {
            success: true,
            data: result,
            tenantId,
        };
    }
    async cancelOrder(req, orderId, body) {
        const tenantId = req.user?.tenantId || 'default';
        const config = {
            shopDomain: '',
            accessToken: '',
            apiVersion: '2024-01',
        };
        const result = await this.shopifyService.cancelOrder(config, parseInt(orderId, 10), body);
        return {
            success: true,
            data: result,
            tenantId,
        };
    }
    async getProducts(req, query) {
        const tenantId = req.user?.tenantId || 'default';
        const config = {
            shopDomain: '',
            accessToken: '',
            apiVersion: '2024-01',
        };
        const result = await this.shopifyService.getProducts(config, {
            limit: query.limit,
            collectionId: query.collection_id,
            productType: query.product_type,
            vendor: query.vendor,
        });
        return {
            success: true,
            data: result,
            tenantId,
        };
    }
    async getCustomer(req, customerId) {
        const tenantId = req.user?.tenantId || 'default';
        const config = {
            shopDomain: '',
            accessToken: '',
            apiVersion: '2024-01',
        };
        const result = await this.shopifyService.getCustomer(config, parseInt(customerId, 10));
        return {
            success: true,
            data: result,
            tenantId,
        };
    }
    async createCustomer(req, customer) {
        const tenantId = req.user?.tenantId || 'default';
        const config = {
            shopDomain: '',
            accessToken: '',
            apiVersion: '2024-01',
        };
        const result = await this.shopifyService.createCustomer(config, customer);
        return {
            success: true,
            data: result,
            tenantId,
        };
    }
    async syncBulk(req, body) {
        const tenantId = req.user?.tenantId || 'default';
        const result = await this.shopifyService.syncData({
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
    async handleWebhook(payload, hmac, shopDomain, topic) {
        this.logger.debug(`Received Shopify webhook: ${topic} from ${shopDomain}`);
        const result = await this.shopifyService.handleWebhook(payload);
        return result;
    }
    async getHealthStatus() {
        const health = await this.shopifyService.getHealthStatus();
        return {
            service: this.shopifyService.name,
            ...health,
        };
    }
};
exports.ShopifyController = ShopifyController;
__decorate([
    (0, common_1.Post)('auth/install'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ShopifyController.prototype, "initiateInstall", null);
__decorate([
    (0, common_1.Post)('auth/callback'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ShopifyController.prototype, "handleAuthCallback", null);
__decorate([
    (0, common_1.Get)('orders'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ShopifyController.prototype, "getOrders", null);
__decorate([
    (0, common_1.Get)('orders/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ShopifyController.prototype, "getOrder", null);
__decorate([
    (0, common_1.Post)('orders'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ShopifyController.prototype, "createOrder", null);
__decorate([
    (0, common_1.Post)('orders/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ShopifyController.prototype, "updateOrder", null);
__decorate([
    (0, common_1.Post)('orders/:id/cancel'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ShopifyController.prototype, "cancelOrder", null);
__decorate([
    (0, common_1.Get)('products'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ShopifyController.prototype, "getProducts", null);
__decorate([
    (0, common_1.Get)('customers/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ShopifyController.prototype, "getCustomer", null);
__decorate([
    (0, common_1.Post)('customers'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ShopifyController.prototype, "createCustomer", null);
__decorate([
    (0, common_1.Post)('sync/bulk'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ShopifyController.prototype, "syncBulk", null);
__decorate([
    (0, common_1.Post)('webhook'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-shopify-hmac-sha256')),
    __param(2, (0, common_1.Headers)('x-shopify-shop-domain')),
    __param(3, (0, common_1.Headers)('x-shopify-topic')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], ShopifyController.prototype, "handleWebhook", null);
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ShopifyController.prototype, "getHealthStatus", null);
exports.ShopifyController = ShopifyController = ShopifyController_1 = __decorate([
    (0, common_1.Controller)('api/v1/integrations/shopify'),
    __metadata("design:paramtypes", [shopify_service_1.ShopifyService])
], ShopifyController);
//# sourceMappingURL=shopify.controller.js.map