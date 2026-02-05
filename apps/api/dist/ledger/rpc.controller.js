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
exports.RpcController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const rpc_service_1 = require("./rpc.service");
const auth_guard_1 = require("../auth/auth.guard");
let RpcController = class RpcController {
    rpcService;
    constructor(rpcService) {
        this.rpcService = rpcService;
    }
    async createDoubleEntryTransaction(req, createDoubleEntryDto) {
        return this.rpcService.createDoubleEntryTransaction(req.user.tenantId, req.user.userId, createDoubleEntryDto.debitAccountType, createDoubleEntryDto.creditAccountType, createDoubleEntryDto.amount, createDoubleEntryDto.description, createDoubleEntryDto.linkedEntityType, createDoubleEntryDto.linkedEntityId, createDoubleEntryDto.reference, createDoubleEntryDto.transactionDate
            ? new Date(createDoubleEntryDto.transactionDate)
            : undefined);
    }
    async reverseDoubleEntryTransaction(req, reverseDto) {
        return this.rpcService.reverseDoubleEntryTransaction(req.user.tenantId, req.user.userId, reverseDto.transactionPairId, reverseDto.reason);
    }
    async getTrialBalance(req) {
        return this.rpcService.getTrialBalance(req.user.tenantId);
    }
    async validateTransactionIntegrity(req, transactionPairId) {
        return this.rpcService.validateDoubleEntryIntegrity(req.user.tenantId, transactionPairId);
    }
    async logAuditEvent(req, auditDto) {
        await this.rpcService.logAuditEvent(req.user.tenantId, req.user.userId, auditDto.action, auditDto.tableName, auditDto.recordId, auditDto.oldData, auditDto.newData, auditDto.description);
        return { success: true };
    }
};
exports.RpcController = RpcController;
__decorate([
    (0, common_1.Post)('create-double-entry'),
    (0, swagger_1.ApiOperation)({ summary: 'Create double-entry transaction (RPC)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Double-entry transaction created' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RpcController.prototype, "createDoubleEntryTransaction", null);
__decorate([
    (0, common_1.Post)('reverse-double-entry'),
    (0, swagger_1.ApiOperation)({ summary: 'Reverse double-entry transaction (RPC)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Transaction reversed' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RpcController.prototype, "reverseDoubleEntryTransaction", null);
__decorate([
    (0, common_1.Get)('trial-balance'),
    (0, swagger_1.ApiOperation)({ summary: 'Get trial balance (RPC)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Trial balance' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RpcController.prototype, "getTrialBalance", null);
__decorate([
    (0, common_1.Get)('validate/:transactionPairId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Validate double-entry transaction integrity (RPC)',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Transaction validation result' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('transactionPairId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], RpcController.prototype, "validateTransactionIntegrity", null);
__decorate([
    (0, common_1.Post)('log-audit'),
    (0, swagger_1.ApiOperation)({ summary: 'Log audit event (RPC)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Audit event logged' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RpcController.prototype, "logAuditEvent", null);
exports.RpcController = RpcController = __decorate([
    (0, swagger_1.ApiTags)('rpc'),
    (0, common_1.Controller)('rpc'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [rpc_service_1.RpcService])
], RpcController);
//# sourceMappingURL=rpc.controller.js.map