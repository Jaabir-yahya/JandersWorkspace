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
exports.TransactionsPublicController = void 0;
const common_1 = require("@nestjs/common");
const tenants_service_1 = require("../tenants/tenants.service");
const transactions_service_1 = require("./transactions.service");
let TransactionsPublicController = class TransactionsPublicController {
    transactionsService;
    tenantsService;
    constructor(transactionsService, tenantsService) {
        this.transactionsService = transactionsService;
        this.tenantsService = tenantsService;
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
};
exports.TransactionsPublicController = TransactionsPublicController;
__decorate([
    (0, common_1.Get)('export'),
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
], TransactionsPublicController.prototype, "export", null);
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
], TransactionsPublicController.prototype, "listByTenant", null);
exports.TransactionsPublicController = TransactionsPublicController = __decorate([
    (0, common_1.Controller)('transactions'),
    __metadata("design:paramtypes", [transactions_service_1.TransactionsService,
        tenants_service_1.TenantsService])
], TransactionsPublicController);
//# sourceMappingURL=transactions-public.controller.js.map