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
exports.UniversalTransactionsController = exports.UniversalAccountsController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../auth/auth.guard");
const auth_guard_2 = require("../auth/auth.guard");
const accounts_service_1 = require("./accounts.service");
const transactions_service_1 = require("./transactions.service");
let UniversalAccountsController = class UniversalAccountsController {
    accountsService;
    constructor(accountsService) {
        this.accountsService = accountsService;
    }
    async createAccount(data, req) {
        const user = (0, auth_guard_2.getAuthenticatedUser)(req);
        if (!user.tenantId) {
            throw new common_1.BadRequestException('User must be associated with a tenant');
        }
        data.tenantId = user.tenantId;
        return await this.accountsService.createAccount(data);
    }
    async getAccounts(req, groupBy) {
        const user = (0, auth_guard_2.getAuthenticatedUser)(req);
        if (!user.tenantId) {
            throw new common_1.BadRequestException('User must be associated with a tenant');
        }
        return await this.accountsService.getBalances(user.tenantId, groupBy);
    }
    async getAccount(id, req) {
        const user = (0, auth_guard_2.getAuthenticatedUser)(req);
        if (!user.tenantId) {
            throw new common_1.BadRequestException('User must be associated with a tenant');
        }
        return await this.accountsService.getAccount(id, user.tenantId);
    }
};
exports.UniversalAccountsController = UniversalAccountsController;
__decorate([
    (0, common_1.Post)('accounts'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UniversalAccountsController.prototype, "createAccount", null);
__decorate([
    (0, common_1.Get)('accounts'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('group')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UniversalAccountsController.prototype, "getAccounts", null);
__decorate([
    (0, common_1.Get)('accounts/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UniversalAccountsController.prototype, "getAccount", null);
exports.UniversalAccountsController = UniversalAccountsController = __decorate([
    (0, common_1.Controller)('universal'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __metadata("design:paramtypes", [accounts_service_1.UniversalAccountsService])
], UniversalAccountsController);
let UniversalTransactionsController = class UniversalTransactionsController {
    transactionsService;
    constructor(transactionsService) {
        this.transactionsService = transactionsService;
    }
    async createTransaction(data, req) {
        const user = (0, auth_guard_2.getAuthenticatedUser)(req);
        if (!user.tenantId) {
            throw new common_1.BadRequestException('User must be associated with a tenant');
        }
        data.tenantId = user.tenantId;
        data.createdById = user.id;
        const transactionId = await this.transactionsService.createDoubleEntryTransaction(data);
        return {
            id: transactionId,
            message: 'Double-entry transaction created successfully',
            amount: data.amount,
            fromAccount: data.fromAccountId,
            toAccount: data.toAccountId,
        };
    }
    async getTransactionStream(req, fromDate, toDate, accountId, entityId, limit) {
        const user = (0, auth_guard_2.getAuthenticatedUser)(req);
        if (!user.tenantId) {
            throw new common_1.BadRequestException('User must be associated with a tenant');
        }
        return await this.transactionsService.getTransactionStream(user.tenantId, {
            fromDate,
            toDate,
            accountId,
            entityId,
            limit: limit || 100,
        });
    }
    async getTransaction(id, req) {
        const user = (0, auth_guard_2.getAuthenticatedUser)(req);
        if (!user.tenantId) {
            throw new common_1.BadRequestException('User must be associated with a tenant');
        }
        return await this.transactionsService.getTransaction(id);
    }
    async reverseTransaction(id, reason, req) {
        const user = (0, auth_guard_2.getAuthenticatedUser)(req);
        if (!user.tenantId) {
            throw new common_1.BadRequestException('User must be associated with a tenant');
        }
        const reversalId = await this.transactionsService.reverseTransaction(id, reason);
        return {
            id: reversalId,
            message: 'Transaction reversed successfully',
            originalTransactionId: id,
            reversalReason: reason,
        };
    }
};
exports.UniversalTransactionsController = UniversalTransactionsController;
__decorate([
    (0, common_1.Post)('transactions'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UniversalTransactionsController.prototype, "createTransaction", null);
__decorate([
    (0, common_1.Get)('transactions/stream'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('fromDate')),
    __param(2, (0, common_1.Query)('toDate')),
    __param(3, (0, common_1.Query)('accountId')),
    __param(4, (0, common_1.Query)('entityId')),
    __param(5, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, Number]),
    __metadata("design:returntype", Promise)
], UniversalTransactionsController.prototype, "getTransactionStream", null);
__decorate([
    (0, common_1.Get)('transactions/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UniversalTransactionsController.prototype, "getTransaction", null);
__decorate([
    (0, common_1.Post)('transactions/:id/reverse'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('reason')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UniversalTransactionsController.prototype, "reverseTransaction", null);
exports.UniversalTransactionsController = UniversalTransactionsController = __decorate([
    (0, common_1.Controller)('universal'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __metadata("design:paramtypes", [transactions_service_1.UniversalTransactionsService])
], UniversalTransactionsController);
//# sourceMappingURL=universal-truth.controller.js.map