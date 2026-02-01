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
exports.EntitiesPublicController = void 0;
const common_1 = require("@nestjs/common");
const transactions_service_1 = require("./transactions.service");
const create_entity_public_dto_1 = require("./dto/create-entity-public.dto");
let EntitiesPublicController = class EntitiesPublicController {
    transactionsService;
    constructor(transactionsService) {
        this.transactionsService = transactionsService;
    }
    async list(tenantId, type, search) {
        if (!tenantId?.trim()) {
            throw new common_1.BadRequestException('X-Tenant-Id header is required');
        }
        return this.transactionsService.findAllEntities(tenantId, { type, search });
    }
    async create(tenantId, dto) {
        if (!tenantId?.trim()) {
            throw new common_1.BadRequestException('X-Tenant-Id header is required');
        }
        const manualUserId = await this.transactionsService.getOrCreateManualUserForTenant(tenantId);
        const entityType = dto.type === 'customer' || dto.type === 'CUSTOMER'
            ? 'CUSTOMER'
            : dto.type === 'supplier' || dto.type === 'SUPPLIER'
                ? 'SUPPLIER'
                : dto.type === 'both' || dto.type === 'BOTH'
                    ? 'BOTH'
                    : 'CUSTOMER';
        return this.transactionsService.createEntity({
            tenant_id: tenantId,
            created_by_user_id: manualUserId,
            display_name: dto.display_name,
            phone_number: dto.phone_number ?? undefined,
            type: entityType,
        });
    }
    async getOne(tenantId, id) {
        if (!tenantId?.trim()) {
            throw new common_1.BadRequestException('X-Tenant-Id header is required');
        }
        const entity = await this.transactionsService.findEntityById(id);
        if (entity.tenantId !== tenantId) {
            throw new common_1.NotFoundException(`Entity with ID ${id} not found`);
        }
        return entity;
    }
    async getHistory(tenantId, id) {
        if (!tenantId?.trim()) {
            throw new common_1.BadRequestException('X-Tenant-Id header is required');
        }
        return this.transactionsService.getEntityHistory(id, tenantId);
    }
    async getBalance(tenantId, id) {
        if (!tenantId?.trim()) {
            throw new common_1.BadRequestException('X-Tenant-Id header is required');
        }
        return this.transactionsService.getEntityBalance(id, tenantId);
    }
};
exports.EntitiesPublicController = EntitiesPublicController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Query)('type')),
    __param(2, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], EntitiesPublicController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Body)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_entity_public_dto_1.CreateEntityPublicDto]),
    __metadata("design:returntype", Promise)
], EntitiesPublicController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EntitiesPublicController.prototype, "getOne", null);
__decorate([
    (0, common_1.Get)(':id/history'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EntitiesPublicController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Get)(':id/balance'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EntitiesPublicController.prototype, "getBalance", null);
exports.EntitiesPublicController = EntitiesPublicController = __decorate([
    (0, common_1.Controller)('entities'),
    __metadata("design:paramtypes", [transactions_service_1.TransactionsService])
], EntitiesPublicController);
//# sourceMappingURL=entities-public.controller.js.map