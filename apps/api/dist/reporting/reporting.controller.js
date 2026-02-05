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
const reporting_service_1 = require("./reporting.service");
let ReportingController = class ReportingController {
    reportingService;
    constructor(reportingService) {
        this.reportingService = reportingService;
    }
    async getTrialBalance(req, asOfDate, accountType) {
        const user = (0, auth_guard_1.getAuthenticatedUser)(req);
        if (!user.tenantId) {
            throw new common_1.BadRequestException('User must be associated with a tenant');
        }
        return this.reportingService.getTrialBalance(user.tenantId, {
            asOfDate,
            accountType,
        });
    }
    async getFinancialSummary(req, startDate, endDate) {
        const user = (0, auth_guard_1.getAuthenticatedUser)(req);
        if (!user.tenantId) {
            throw new common_1.BadRequestException('User must be associated with a tenant');
        }
        return this.reportingService.getFinancialSummary(user.tenantId, {
            startDate,
            endDate,
        });
    }
    async getBalanceSheet(req, asOfDate) {
        const user = (0, auth_guard_1.getAuthenticatedUser)(req);
        if (!user.tenantId) {
            throw new common_1.BadRequestException('User must be associated with a tenant');
        }
        return this.reportingService.getBalanceSheet(user.tenantId, {
            asOfDate,
        });
    }
    async getTransactionHistory(req, fromDate, toDate, accountId, limit) {
        const user = (0, auth_guard_1.getAuthenticatedUser)(req);
        if (!user.tenantId) {
            throw new common_1.BadRequestException('User must be associated with a tenant');
        }
        return this.reportingService.getTransactionHistory(user.tenantId, {
            fromDate,
            toDate,
            accountId,
            limit: limit || 100,
        });
    }
    async exportData(req, type, res, format = 'json', fromDate, toDate) {
        const user = (0, auth_guard_1.getAuthenticatedUser)(req);
        if (!user.tenantId) {
            throw new common_1.BadRequestException('User must be associated with a tenant');
        }
        const data = await this.reportingService.exportData(user.tenantId, type, format, { fromDate, toDate });
        if (format === 'csv') {
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${type}_${new Date().toISOString().split('T')[0]}.csv"`);
            return res.send(data);
        }
        res.setHeader('Content-Type', 'application/json');
        return res.json(data);
    }
};
exports.ReportingController = ReportingController;
__decorate([
    (0, common_1.Get)('trial-balance'),
    ApiOperation({ summary: 'Get trial balance' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('asOfDate')),
    __param(2, (0, common_1.Query)('accountType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ReportingController.prototype, "getTrialBalance", null);
__decorate([
    (0, common_1.Get)('financial-summary'),
    ApiOperation({ summary: 'Get financial summary' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ReportingController.prototype, "getFinancialSummary", null);
__decorate([
    (0, common_1.Get)('balance-sheet'),
    ApiOperation({ summary: 'Get balance sheet' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('asOfDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ReportingController.prototype, "getBalanceSheet", null);
__decorate([
    (0, common_1.Get)('transactions'),
    ApiOperation({ summary: 'Get transaction history' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('fromDate')),
    __param(2, (0, common_1.Query)('toDate')),
    __param(3, (0, common_1.Query)('accountId')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, Number]),
    __metadata("design:returntype", Promise)
], ReportingController.prototype, "getTransactionHistory", null);
__decorate([
    (0, common_1.Get)('export'),
    ApiOperation({ summary: 'Export financial data' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('type')),
    __param(2, (0, common_1.Res)()),
    __param(3, (0, common_1.Query)('format')),
    __param(4, (0, common_1.Query)('fromDate')),
    __param(5, (0, common_1.Query)('toDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object, String, String, String]),
    __metadata("design:returntype", Promise)
], ReportingController.prototype, "exportData", null);
exports.ReportingController = ReportingController = __decorate([
    (0, common_1.Controller)('reporting'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __metadata("design:paramtypes", [reporting_service_1.ReportingService])
], ReportingController);
function ApiOperation(options) {
    return (target, propertyKey, descriptor) => {
    };
}
//# sourceMappingURL=reporting.controller.js.map