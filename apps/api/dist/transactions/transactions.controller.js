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
exports.EntitiesController = exports.TransactionsController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../auth/auth.guard");
const tenants_service_1 = require("../tenants/tenants.service");
const transactions_service_1 = require("./transactions.service");
const create_transaction_dto_1 = require("./dto/create-transaction.dto");
const post_transaction_dto_1 = require("./dto/post-transaction.dto");
const reverse_transaction_dto_1 = require("./dto/reverse-transaction.dto");
const update_payment_status_dto_1 = require("./dto/update-payment-status.dto");
let TransactionsController = class TransactionsController {
    transactionsService;
    tenantsService;
    constructor(transactionsService, tenantsService) {
        this.transactionsService = transactionsService;
        this.tenantsService = tenantsService;
    }
    create(dto) {
        return this.transactionsService.create(dto);
    }
    async resolveTenant(req, queryTenantId, headerTenantId) {
        const requested = (headerTenantId || queryTenantId)?.trim();
        if (!requested)
            throw new common_1.BadRequestException('tenant_id is required');
        const effective = await this.tenantsService.resolveEffectiveTenantId(req.user?.tenantId, requested, req.user?.email || '');
        if (!effective)
            throw new common_1.ForbiddenException('Access denied: no access to this tenant');
        return effective;
    }
    async findAll(tenantId, req, xTenantId, status, type, entityId, dateFrom, dateTo, search, paymentStatus) {
        const effective = await this.resolveTenant(req, tenantId, xTenantId);
        if (search) {
            return this.transactionsService.searchTransactions(effective, search, {
                status,
                type,
                entity_id: entityId,
                date_from: dateFrom,
                date_to: dateTo,
                payment_status: paymentStatus,
            });
        }
        return this.transactionsService.findAll(effective, {
            status,
            type,
            entity_id: entityId,
            date_from: dateFrom,
            date_to: dateTo,
            payment_status: paymentStatus,
        });
    }
    async listByTenant(tenantId, tenantKey, status, type, entityId, dateFrom, dateTo, search, paymentStatus) {
        if (!tenantId?.trim()) {
            throw new common_1.BadRequestException('X-Tenant-Id header is required');
        }
        await this.tenantsService.assertTenantKeyIfPresent(tenantId, tenantKey);
        if (search) {
            return this.transactionsService.searchTransactions(tenantId, search, {
                status,
                type,
                entity_id: entityId,
                date_from: dateFrom,
                date_to: dateTo,
                payment_status: paymentStatus,
            });
        }
        return this.transactionsService.findAll(tenantId, {
            status,
            type,
            entity_id: entityId,
            date_from: dateFrom,
            date_to: dateTo,
            payment_status: paymentStatus,
        });
    }
    findOne(id) {
        return this.transactionsService.findOne(id);
    }
    findByEntity(entityId) {
        return this.transactionsService.findByEntity(entityId);
    }
    postTransaction(id, dto) {
        return this.transactionsService.postTransaction(id);
    }
    reverseTransaction(id, dto) {
        return this.transactionsService.reverseTransaction(id, dto);
    }
    updatePaymentStatus(id, dto) {
        return this.transactionsService.updatePaymentStatus(id, dto);
    }
    async export(tenantId, tenantKey, res, format = 'json', dateFrom, dateTo, type, limit) {
        if (!tenantId?.trim()) {
            throw new common_1.BadRequestException('X-Tenant-Id header is required');
        }
        await this.tenantsService.assertTenantKeyIfPresent(tenantId, tenantKey);
        const lim = limit ? Math.min(parseInt(limit, 10) || 10000, 50000) : 10000;
        const result = await this.transactionsService.exportBulk(tenantId, { date_from: dateFrom, date_to: dateTo, type }, format, lim);
        if (format === 'csv' && typeof result === 'string') {
            const filename = `transactions-${dateFrom ?? 'all'}-${dateTo ?? 'all'}.csv`.replace(/ /g, '-');
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        }
        return result;
    }
    async exportTransaction(id) {
        return this.transactionsService.standardizeTransaction(id);
    }
};
exports.TransactionsController = TransactionsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Body)(new common_1.ValidationPipe({ whitelist: false, forbidNonWhitelisted: false }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_transaction_dto_1.CreateTransactionDto]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Query)('tenant_id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('type')),
    __param(5, (0, common_1.Query)('entity_id')),
    __param(6, (0, common_1.Query)('date_from')),
    __param(7, (0, common_1.Query)('date_to')),
    __param(8, (0, common_1.Query)('search')),
    __param(9, (0, common_1.Query)('payment_status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('list'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-tenant-key')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('type')),
    __param(4, (0, common_1.Query)('entity_id')),
    __param(5, (0, common_1.Query)('date_from')),
    __param(6, (0, common_1.Query)('date_to')),
    __param(7, (0, common_1.Query)('search')),
    __param(8, (0, common_1.Query)('payment_status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "listByTenant", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('entity/:entityId'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)('entityId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "findByEntity", null);
__decorate([
    (0, common_1.Post)(':id/post'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, post_transaction_dto_1.PostTransactionDto]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "postTransaction", null);
__decorate([
    (0, common_1.Post)(':id/reverse'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, reverse_transaction_dto_1.ReverseTransactionDto]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "reverseTransaction", null);
__decorate([
    (0, common_1.Patch)(':id/payment_status'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_payment_status_dto_1.UpdatePaymentStatusDto]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "updatePaymentStatus", null);
__decorate([
    (0, common_1.Get)('export-bulk'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-tenant-key')),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __param(3, (0, common_1.Query)('format')),
    __param(4, (0, common_1.Query)('date_from')),
    __param(5, (0, common_1.Query)('date_to')),
    __param(6, (0, common_1.Query)('type')),
    __param(7, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "export", null);
__decorate([
    (0, common_1.Get)(':id/export'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "exportTransaction", null);
exports.TransactionsController = TransactionsController = __decorate([
    (0, common_1.Controller)('transactions'),
    __metadata("design:paramtypes", [transactions_service_1.TransactionsService,
        tenants_service_1.TenantsService])
], TransactionsController);
let EntitiesController = class EntitiesController {
    transactionsService;
    constructor(transactionsService) {
        this.transactionsService = transactionsService;
    }
    findAll(req, tenantId, type, search) {
        const activeTenantId = tenantId || req.user?.tenantId;
        if (!activeTenantId) {
            throw new common_1.BadRequestException('tenant_id is required');
        }
        if (req.user?.tenantId && activeTenantId !== req.user.tenantId) {
            throw new common_1.ForbiddenException('Access denied: tenant mismatch');
        }
        return this.transactionsService.findAllEntities(activeTenantId, {
            type,
            search,
        });
    }
    create(req, dto) {
        if (!dto.tenant_id && req.user?.tenantId) {
            dto.tenant_id = req.user.tenantId;
        }
        if (!dto.created_by_user_id && req.user?.id) {
            dto.created_by_user_id = req.user.id;
        }
        return this.transactionsService.createEntity(dto);
    }
    async findOne(req, id, tenantId) {
        const activeTenantId = tenantId || req.user?.tenantId;
        const entity = await this.transactionsService.findEntityById(id);
        if (activeTenantId && entity.tenantId !== activeTenantId) {
            throw new common_1.ForbiddenException('Access denied: tenant mismatch');
        }
        return entity;
    }
    getEntityHistory(req, id, tenantId) {
        const activeTenantId = tenantId || req.user?.tenantId;
        if (!activeTenantId) {
            throw new common_1.BadRequestException('tenant_id is required');
        }
        return this.transactionsService.getEntityHistory(id, activeTenantId);
    }
    getEntityBalance(req, id, tenantId) {
        const activeTenantId = tenantId || req.user?.tenantId;
        if (!activeTenantId) {
            throw new common_1.BadRequestException('tenant_id is required');
        }
        return this.transactionsService.getEntityBalance(id, activeTenantId);
    }
    getEntity360View(req, id, tenantId) {
        const activeTenantId = tenantId || req.user?.tenantId;
        if (!activeTenantId) {
            throw new common_1.BadRequestException('tenant_id is required');
        }
        return this.transactionsService.getEntity360View(id, activeTenantId);
    }
    searchByPhone(req, phone, tenantId) {
        const activeTenantId = tenantId || req.user?.tenantId;
        if (!activeTenantId) {
            throw new common_1.BadRequestException('tenant_id is required');
        }
        if (!phone) {
            throw new common_1.BadRequestException('phone query parameter is required');
        }
        return this.transactionsService.searchEntitiesByPhone(phone, activeTenantId);
    }
    addLinkedPhone(id, phone) {
        if (!phone) {
            throw new common_1.BadRequestException('phone is required');
        }
        return this.transactionsService.addLinkedPhone(id, phone);
    }
    removeLinkedPhone(id, phone) {
        return this.transactionsService.removeLinkedPhone(id, phone);
    }
};
exports.EntitiesController = EntitiesController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('tenant_id')),
    __param(2, (0, common_1.Query)('type')),
    __param(3, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], EntitiesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], EntitiesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Query)('tenant_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], EntitiesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/history'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Query)('tenant_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], EntitiesController.prototype, "getEntityHistory", null);
__decorate([
    (0, common_1.Get)(':id/balance'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Query)('tenant_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], EntitiesController.prototype, "getEntityBalance", null);
__decorate([
    (0, common_1.Get)(':id/360-view'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Query)('tenant_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], EntitiesController.prototype, "getEntity360View", null);
__decorate([
    (0, common_1.Get)('search'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('phone')),
    __param(2, (0, common_1.Query)('tenant_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], EntitiesController.prototype, "searchByPhone", null);
__decorate([
    (0, common_1.Post)(':id/linked-phones'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)('phone')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], EntitiesController.prototype, "addLinkedPhone", null);
__decorate([
    (0, common_1.Delete)(':id/linked-phones/:phone'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('phone')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], EntitiesController.prototype, "removeLinkedPhone", null);
exports.EntitiesController = EntitiesController = __decorate([
    (0, common_1.Controller)('entities'),
    __metadata("design:paramtypes", [transactions_service_1.TransactionsService])
], EntitiesController);
//# sourceMappingURL=transactions.controller.js.map