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
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../auth/auth.guard");
const tenants_service_1 = require("../tenants/tenants.service");
const dashboard_service_1 = require("./dashboard.service");
let DashboardController = class DashboardController {
    dashboardService;
    tenantsService;
    constructor(dashboardService, tenantsService) {
        this.dashboardService = dashboardService;
        this.tenantsService = tenantsService;
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
    async getStats(tenantId, req, xTenantId) {
        const effective = await this.resolveTenant(req, tenantId, xTenantId);
        return this.dashboardService.getDashboardStats(effective);
    }
    async getMetrics(tenantId, req, xTenantId, startDate, endDate) {
        const effective = await this.resolveTenant(req, tenantId, xTenantId);
        return this.dashboardService.getMetrics(effective, startDate, endDate);
    }
    async getReconciliation(tenantId, req, xTenantId) {
        const effective = await this.resolveTenant(req, tenantId, xTenantId);
        return this.dashboardService.getReconciliationSummary(effective);
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Query)('tenant_id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('metrics'),
    __param(0, (0, common_1.Query)('tenant_id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __param(3, (0, common_1.Query)('start_date')),
    __param(4, (0, common_1.Query)('end_date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String, String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getMetrics", null);
__decorate([
    (0, common_1.Get)('reconciliation'),
    __param(0, (0, common_1.Query)('tenant_id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Headers)('x-tenant-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getReconciliation", null);
exports.DashboardController = DashboardController = __decorate([
    (0, common_1.Controller)('dashboard'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService,
        tenants_service_1.TenantsService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map