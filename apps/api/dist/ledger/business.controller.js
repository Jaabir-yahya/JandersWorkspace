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
exports.BusinessController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../auth/auth.guard");
const swagger_1 = require("@nestjs/swagger");
const business_service_1 = require("./business.service");
const business_dto_1 = require("./dto/business.dto");
let BusinessController = class BusinessController {
    businessService;
    constructor(businessService) {
        this.businessService = businessService;
    }
    async createSupply(req, createSupplyDto) {
        return this.businessService.createSupply(req.user.tenantId, req.user.userId, createSupplyDto);
    }
    async findAllSupplies(req) {
        return this.businessService.findAllSupplies(req.user.tenantId);
    }
    async findOneSupply(req, id) {
        return this.businessService.findOneSupply(req.user.tenantId, id);
    }
    async updateSupply(req, id, updateSupplyDto) {
        return this.businessService.updateSupply(req.user.tenantId, req.user.userId, id, updateSupplyDto);
    }
    async removeSupply(req, id) {
        return this.businessService.removeSupply(req.user.tenantId, req.user.userId, id);
    }
    async getInventory(req) {
        return this.businessService.getInventory(req.user.tenantId);
    }
    async getInventoryItem(req, id) {
        return this.businessService.getInventoryItem(req.user.tenantId, id);
    }
    async getContainers(req, entityId) {
        return this.businessService.getContainers(req.user.tenantId, entityId);
    }
    async getContainer(req, id) {
        return this.businessService.getContainer(req.user.tenantId, id);
    }
    async createContainer(req, dto) {
        return this.businessService.createContainer(req.user.tenantId, dto);
    }
    async updateContainer(req, id, dto) {
        return this.businessService.updateContainer(req.user.tenantId, id, dto);
    }
    async deleteContainer(req, id) {
        return this.businessService.deleteContainer(req.user.tenantId, id);
    }
    async getContainerItems(req, id) {
        return this.businessService.getContainerItems(req.user.tenantId, id);
    }
    async addContainerItem(req, id, dto) {
        return this.businessService.addContainerItem(req.user.tenantId, id, dto);
    }
    async createInvoice(req, createInvoiceDto) {
        return this.businessService.createInvoice(req.user.tenantId, req.user.userId, createInvoiceDto);
    }
    async findAllInvoices(req) {
        return this.businessService.findAllInvoices(req.user.tenantId);
    }
    async findOneInvoice(req, id) {
        return this.businessService.findOneInvoice(req.user.tenantId, id);
    }
    async createPayment(req, createPaymentDto) {
        return this.businessService.createPayment(req.user.tenantId, req.user.userId, createPaymentDto);
    }
    async findAllPayments(req) {
        return this.businessService.findAllPayments(req.user.tenantId);
    }
    async findOnePayment(req, id) {
        return this.businessService.findOnePayment(req.user.tenantId, id);
    }
};
exports.BusinessController = BusinessController;
__decorate([
    (0, common_1.Post)('supplies'),
    (0, swagger_1.ApiOperation)({ summary: 'Create new supply' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Supply created successfully',
        type: business_dto_1.SupplyDto,
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, business_dto_1.CreateSupplyDto]),
    __metadata("design:returntype", Promise)
], BusinessController.prototype, "createSupply", null);
__decorate([
    (0, common_1.Get)('supplies'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all supplies' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of all supplies',
        type: [business_dto_1.SupplyDto],
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BusinessController.prototype, "findAllSupplies", null);
__decorate([
    (0, common_1.Get)('supplies/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get supply by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Supply details', type: business_dto_1.SupplyDto }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BusinessController.prototype, "findOneSupply", null);
__decorate([
    (0, common_1.Patch)('supplies/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update supply' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Supply updated successfully',
        type: business_dto_1.SupplyDto,
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, business_dto_1.UpdateSupplyDto]),
    __metadata("design:returntype", Promise)
], BusinessController.prototype, "updateSupply", null);
__decorate([
    (0, common_1.Delete)('supplies/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete supply' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Supply deleted successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BusinessController.prototype, "removeSupply", null);
__decorate([
    (0, common_1.Get)('inventory'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all inventory items' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of all inventory items',
        type: [business_dto_1.InventoryDto],
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BusinessController.prototype, "getInventory", null);
__decorate([
    (0, common_1.Get)('inventory/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get inventory item by ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Inventory item details',
        type: business_dto_1.InventoryDto,
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BusinessController.prototype, "getInventoryItem", null);
__decorate([
    (0, common_1.Get)('containers'),
    (0, swagger_1.ApiOperation)({ summary: 'List inventory containers (optional: filter by assigned entity)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of containers', type: [business_dto_1.InventoryContainerDto] }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('entityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BusinessController.prototype, "getContainers", null);
__decorate([
    (0, common_1.Get)('containers/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get container by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Container details', type: business_dto_1.InventoryContainerDto }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BusinessController.prototype, "getContainer", null);
__decorate([
    (0, common_1.Post)('containers'),
    (0, swagger_1.ApiOperation)({ summary: 'Create container' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Container created', type: business_dto_1.InventoryContainerDto }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, business_dto_1.CreateInventoryContainerDto]),
    __metadata("design:returntype", Promise)
], BusinessController.prototype, "createContainer", null);
__decorate([
    (0, common_1.Patch)('containers/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update container' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Container updated', type: business_dto_1.InventoryContainerDto }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, business_dto_1.UpdateInventoryContainerDto]),
    __metadata("design:returntype", Promise)
], BusinessController.prototype, "updateContainer", null);
__decorate([
    (0, common_1.Delete)('containers/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete container' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Container deleted' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BusinessController.prototype, "deleteContainer", null);
__decorate([
    (0, common_1.Get)('containers/:id/items'),
    (0, swagger_1.ApiOperation)({ summary: 'List items in container (batches)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Container items/batches', type: [business_dto_1.InventoryContainerItemDto] }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BusinessController.prototype, "getContainerItems", null);
__decorate([
    (0, common_1.Post)('containers/:id/items'),
    (0, swagger_1.ApiOperation)({ summary: 'Add item/batch to container' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Item added to container', type: business_dto_1.InventoryContainerItemDto }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, business_dto_1.AddContainerItemDto]),
    __metadata("design:returntype", Promise)
], BusinessController.prototype, "addContainerItem", null);
__decorate([
    (0, common_1.Post)('invoices'),
    (0, swagger_1.ApiOperation)({ summary: 'Create new invoice' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Invoice created successfully',
        type: business_dto_1.InvoiceDto,
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, business_dto_1.CreateInvoiceDto]),
    __metadata("design:returntype", Promise)
], BusinessController.prototype, "createInvoice", null);
__decorate([
    (0, common_1.Get)('invoices'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all invoices' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of all invoices',
        type: [business_dto_1.InvoiceDto],
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BusinessController.prototype, "findAllInvoices", null);
__decorate([
    (0, common_1.Get)('invoices/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get invoice by ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Invoice details',
        type: business_dto_1.InvoiceDto,
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BusinessController.prototype, "findOneInvoice", null);
__decorate([
    (0, common_1.Post)('payments'),
    (0, swagger_1.ApiOperation)({ summary: 'Create new payment' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Payment created successfully',
        type: business_dto_1.PaymentDto,
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, business_dto_1.CreatePaymentDto]),
    __metadata("design:returntype", Promise)
], BusinessController.prototype, "createPayment", null);
__decorate([
    (0, common_1.Get)('payments'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all payments' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of all payments',
        type: [business_dto_1.PaymentDto],
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BusinessController.prototype, "findAllPayments", null);
__decorate([
    (0, common_1.Get)('payments/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get payment by ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Payment details',
        type: business_dto_1.PaymentDto,
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BusinessController.prototype, "findOnePayment", null);
exports.BusinessController = BusinessController = __decorate([
    (0, swagger_1.ApiTags)('business'),
    (0, common_1.Controller)('business'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __metadata("design:paramtypes", [business_service_1.BusinessService])
], BusinessController);
//# sourceMappingURL=business.controller.js.map