"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardModule = void 0;
const common_1 = require("@nestjs/common");
const tenants_module_1 = require("../tenants/tenants.module");
const transactions_module_1 = require("../transactions/transactions.module");
const prisma_module_1 = require("../prisma/prisma.module");
const dashboard_service_1 = require("./dashboard.service");
const dashboard_controller_1 = require("./dashboard.controller");
const dashboard_public_controller_1 = require("./dashboard-public.controller");
const dashboard_mobile_controller_1 = require("./dashboard-mobile.controller");
let DashboardModule = class DashboardModule {
};
exports.DashboardModule = DashboardModule;
exports.DashboardModule = DashboardModule = __decorate([
    (0, common_1.Module)({
        imports: [tenants_module_1.TenantsModule, transactions_module_1.TransactionsModule, prisma_module_1.PrismaModule],
        controllers: [
            dashboard_public_controller_1.DashboardPublicController,
            dashboard_controller_1.DashboardController,
            dashboard_mobile_controller_1.DashboardMobileController,
        ],
        providers: [dashboard_service_1.DashboardService],
    })
], DashboardModule);
//# sourceMappingURL=dashboard.module.js.map