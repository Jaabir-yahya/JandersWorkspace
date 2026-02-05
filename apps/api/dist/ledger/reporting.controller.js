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
exports.ReportingController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../auth/auth.guard");
const swagger_1 = require("@nestjs/swagger");
const reporting_service_1 = require("./reporting.service");
let ReportingController = class ReportingController {
    reportingService;
    constructor(reportingService) {
        this.reportingService = reportingService;
    }
    async getTrialBalance(req) {
        return this.reportingService.getTrialBalance(req.user.tenantId);
    }
    async getTransactionHistory(req, dateFrom, dateTo, accountType, entityType, entityId, containerId) {
        return this.reportingService.getTransactionHistory(req.user.tenantId, {
            dateFrom,
            dateTo,
            accountType,
            entityType,
            entityId,
            containerId,
        });
    }
    async getInventoryReport(req) {
        return this.reportingService.getInventoryReport(req.user.tenantId);
    }
    async getSalesReport(req, dateFrom, dateTo) {
        return this.reportingService.getSalesReport(req.user.tenantId, {
            dateFrom,
            dateTo,
        });
    }
    async getExpenseReport(req, dateFrom, dateTo) {
        return this.reportingService.getExpenseReport(req.user.tenantId, {
            dateFrom,
            dateTo,
        });
    }
    async getCashFlowReport(req, dateFrom, dateTo) {
        return this.reportingService.getCashFlowReport(req.user.tenantId, {
            dateFrom,
            dateTo,
        });
    }
    async exportData(req, res, dataType, format = 'json') {
        try {
            const exportResult = await this.reportingService.exportData(req.user.tenantId, dataType, format);
            res.setHeader('Content-Type', exportResult.mimeType);
            res.setHeader('Content-Disposition', `attachment; filename="${exportResult.filename}"`);
            res.send(exportResult.data);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getDashboardKpis(req) {
        const tenantId = req.user.tenantId;
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const [trialBalance, transactionHistory, inventoryReport, salesReport, expenseReport,] = await Promise.all([
            this.reportingService.getTrialBalance(tenantId),
            this.reportingService.getTransactionHistory(tenantId, {
                dateFrom: startOfMonth.toISOString(),
                dateTo: endOfMonth.toISOString(),
            }),
            this.reportingService.getInventoryReport(tenantId),
            this.reportingService.getSalesReport(tenantId, {
                dateFrom: startOfMonth.toISOString(),
                dateTo: endOfMonth.toISOString(),
            }),
            this.reportingService.getExpenseReport(tenantId, {
                dateFrom: startOfMonth.toISOString(),
                dateTo: endOfMonth.toISOString(),
            }),
        ]);
        const totalAssets = trialBalance.summary.totalDebits;
        const totalLiabilities = trialBalance.summary.totalCredits;
        const monthlyRevenue = salesReport.summary.totalSales;
        const monthlyExpenses = expenseReport.summary.totalExpenses;
        const netProfit = monthlyRevenue - monthlyExpenses;
        const totalInventoryValue = inventoryReport.summary.totalValue;
        const lowStockItems = inventoryReport.summary.lowStockItems;
        const monthlyTransactions = transactionHistory.summary.totalTransactions;
        return {
            financial: {
                totalAssets,
                totalLiabilities,
                equity: totalAssets - totalLiabilities,
                monthlyRevenue,
                monthlyExpenses,
                netProfit,
                profitMargin: monthlyRevenue > 0 ? (netProfit / monthlyRevenue) * 100 : 0,
            },
            operational: {
                totalInventoryItems: inventoryReport.summary.totalItems,
                totalInventoryValue,
                lowStockItems,
                monthlyTransactions,
                averageTransactionValue: monthlyTransactions > 0 ? monthlyRevenue / monthlyTransactions : 0,
            },
            cashFlow: {
                monthlyNetCash: netProfit,
                cashFlowPerDay: netProfit / new Date().getDate(),
            },
            alerts: {
                lowStockAlert: lowStockItems > 0,
                profitAlert: netProfit < 0,
                cashFlowAlert: netProfit < 0,
            },
            generatedAt: new Date(),
        };
    }
};
exports.ReportingController = ReportingController;
__decorate([
    (0, common_1.Get)('trial-balance'),
    (0, swagger_1.ApiOperation)({ summary: 'Get trial balance report' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Trial balance report' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportingController.prototype, "getTrialBalance", null);
__decorate([
    (0, common_1.Get)('transaction-history'),
    (0, swagger_1.ApiOperation)({ summary: 'Get transaction history (optional: filter by entity or container)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Transaction history report' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('dateFrom')),
    __param(2, (0, common_1.Query)('dateTo')),
    __param(3, (0, common_1.Query)('accountType')),
    __param(4, (0, common_1.Query)('entityType')),
    __param(5, (0, common_1.Query)('entityId')),
    __param(6, (0, common_1.Query)('containerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ReportingController.prototype, "getTransactionHistory", null);
__decorate([
    (0, common_1.Get)('inventory'),
    (0, swagger_1.ApiOperation)({ summary: 'Get inventory report' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Inventory report' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportingController.prototype, "getInventoryReport", null);
__decorate([
    (0, common_1.Get)('sales'),
    (0, swagger_1.ApiOperation)({ summary: 'Get sales report' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sales report' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('dateFrom')),
    __param(2, (0, common_1.Query)('dateTo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ReportingController.prototype, "getSalesReport", null);
__decorate([
    (0, common_1.Get)('expenses'),
    (0, swagger_1.ApiOperation)({ summary: 'Get expense report' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Expense report' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('dateFrom')),
    __param(2, (0, common_1.Query)('dateTo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ReportingController.prototype, "getExpenseReport", null);
__decorate([
    (0, common_1.Get)('cash-flow'),
    (0, swagger_1.ApiOperation)({ summary: 'Get cash flow report' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Cash flow report' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('dateFrom')),
    __param(2, (0, common_1.Query)('dateTo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ReportingController.prototype, "getCashFlowReport", null);
__decorate([
    (0, common_1.Get)('export/:dataType'),
    (0, swagger_1.ApiOperation)({ summary: 'Export data in JSON or CSV format' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Exported data' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Response)()),
    __param(2, (0, common_1.Param)('dataType')),
    __param(3, (0, common_1.Query)('format')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String]),
    __metadata("design:returntype", Promise)
], ReportingController.prototype, "exportData", null);
__decorate([
    (0, common_1.Get)('dashboard/kpis'),
    (0, swagger_1.ApiOperation)({ summary: 'Get dashboard KPIs' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dashboard KPIs' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportingController.prototype, "getDashboardKpis", null);
exports.ReportingController = ReportingController = __decorate([
    (0, swagger_1.ApiTags)('reporting'),
    (0, common_1.Controller)('reporting'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __metadata("design:paramtypes", [reporting_service_1.ReportingService])
], ReportingController);
//# sourceMappingURL=reporting.controller.js.map