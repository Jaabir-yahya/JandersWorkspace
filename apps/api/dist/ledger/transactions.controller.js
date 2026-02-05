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
exports.TransactionsController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../auth/auth.guard");
const swagger_1 = require("@nestjs/swagger");
const transactions_service_1 = require("./transactions.service");
const transaction_dto_1 = require("./dto/transaction.dto");
let TransactionsController = class TransactionsController {
    transactionsService;
    constructor(transactionsService) {
        this.transactionsService = transactionsService;
    }
    async createDoubleEntry(req, createDoubleEntryDto) {
        return this.transactionsService.createDoubleEntry(req.user.tenantId, req.user.userId, createDoubleEntryDto);
    }
    async reverseDoubleEntry(req, transactionPairId) {
        return this.transactionsService.reverseDoubleEntry(req.user.tenantId, req.user.userId, transactionPairId);
    }
    async findAll(req, dateFrom, dateTo, accountType, entityType, entityName) {
        return this.transactionsService.findMany(req.user.tenantId, {
            dateFrom,
            dateTo,
            accountType,
            entityType,
            entityName,
        });
    }
    async getTransactionHistory(req, dateFrom, dateTo, accountType, entityType) {
        return this.transactionsService.getTransactionHistory(req.user.tenantId, {
            dateFrom,
            dateTo,
            accountType,
            entityType,
        });
    }
    async findOne(req, id) {
        return this.transactionsService.findOne(req.user.tenantId, id);
    }
};
exports.TransactionsController = TransactionsController;
__decorate([
    (0, common_1.Post)('double-entry'),
    (0, swagger_1.ApiOperation)({ summary: 'Create double-entry transaction' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Double-entry transaction created successfully',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, transaction_dto_1.CreateDoubleEntryTransactionDto]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "createDoubleEntry", null);
__decorate([
    (0, common_1.Post)(':transactionPairId/reverse'),
    (0, swagger_1.ApiOperation)({ summary: 'Reverse double-entry transaction' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Transaction reversed successfully',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('transactionPairId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "reverseDoubleEntry", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all transactions' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of all transactions',
        type: [transaction_dto_1.TransactionDto],
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('dateFrom')),
    __param(2, (0, common_1.Query)('dateTo')),
    __param(3, (0, common_1.Query)('accountType')),
    __param(4, (0, common_1.Query)('entityType')),
    __param(5, (0, common_1.Query)('entityName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, swagger_1.ApiOperation)({ summary: 'Get transaction history grouped by pairs' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Transaction history grouped by transaction pairs',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('dateFrom')),
    __param(2, (0, common_1.Query)('dateTo')),
    __param(3, (0, common_1.Query)('accountType')),
    __param(4, (0, common_1.Query)('entityType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "getTransactionHistory", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get transaction by ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Transaction details',
        type: transaction_dto_1.TransactionDto,
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "findOne", null);
exports.TransactionsController = TransactionsController = __decorate([
    (0, swagger_1.ApiTags)('transactions'),
    (0, common_1.Controller)('transactions'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __metadata("design:paramtypes", [transactions_service_1.TransactionsService])
], TransactionsController);
//# sourceMappingURL=transactions.controller.js.map