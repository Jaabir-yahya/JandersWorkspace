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
exports.DashboardPublicController = void 0;
const common_1 = require("@nestjs/common");
const tenants_service_1 = require("../tenants/tenants.service");
const dashboard_service_1 = require("./dashboard.service");
let DashboardPublicController = class DashboardPublicController {
    dashboardService;
    tenantsService;
    constructor(dashboardService, tenantsService) {
        this.dashboardService = dashboardService;
        this.tenantsService = tenantsService;
    }
    async getStatsByTenant(tenantId, tenantKey) {
        if (!tenantId?.trim()) {
            throw new common_1.BadRequestException('X-Tenant-Id header is required');
        }
        await this.tenantsService.assertTenantKeyIfPresent(tenantId, tenantKey);
        return this.dashboardService.getDashboardStats(tenantId);
    }
};
exports.DashboardPublicController = DashboardPublicController;
__decorate([
    (0, common_1.Get)('stats/public'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Headers)('x-tenant-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DashboardPublicController.prototype, "getStatsByTenant", null);
exports.DashboardPublicController = DashboardPublicController = __decorate([
    (0, common_1.Controller)('dashboard'),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService,
        tenants_service_1.TenantsService])
], DashboardPublicController);
//# sourceMappingURL=dashboard-public.controller.js.map