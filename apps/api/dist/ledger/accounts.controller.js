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
exports.AccountsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const accounts_service_1 = require("./accounts.service");
const account_dto_1 = require("./dto/account.dto");
const auth_guard_1 = require("../auth/auth.guard");
let AccountsController = class AccountsController {
    accountsService;
    constructor(accountsService) {
        this.accountsService = accountsService;
    }
    async create(req, createAccountDto) {
        return this.accountsService.create(req.user.tenantId, req.user.userId, createAccountDto);
    }
    async findAll(req) {
        return this.accountsService.findAll(req.user.tenantId);
    }
    async getTrialBalance(req) {
        return this.accountsService.getTrialBalance(req.user.tenantId);
    }
    async findByType(req, type) {
        return this.accountsService.findByType(req.user.tenantId, type);
    }
    async findOne(req, id) {
        return this.accountsService.findOne(req.user.tenantId, id);
    }
    async getBalance(req, id) {
        return this.accountsService.getBalance(req.user.tenantId, id);
    }
    async update(req, id, updateAccountDto) {
        return this.accountsService.update(req.user.tenantId, id, updateAccountDto);
    }
    async remove(req, id) {
        return this.accountsService.remove(req.user.tenantId, id);
    }
};
exports.AccountsController = AccountsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new account' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Account created successfully',
        type: account_dto_1.AccountDto,
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, account_dto_1.CreateAccountDto]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all accounts' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of all accounts',
        type: [account_dto_1.AccountDto],
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('trial-balance'),
    (0, swagger_1.ApiOperation)({ summary: 'Get trial balance' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Trial balance report' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "getTrialBalance", null);
__decorate([
    (0, common_1.Get)('type/:type'),
    (0, swagger_1.ApiOperation)({ summary: 'Get accounts by type' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Accounts of specified type',
        type: [account_dto_1.AccountDto],
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "findByType", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get account by ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Account details',
        type: account_dto_1.AccountDto,
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/balance'),
    (0, swagger_1.ApiOperation)({ summary: 'Get account balance' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Account balance' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "getBalance", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update account' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Account updated successfully',
        type: account_dto_1.AccountDto,
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, account_dto_1.UpdateAccountDto]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete account' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Account deleted successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "remove", null);
exports.AccountsController = AccountsController = __decorate([
    (0, swagger_1.ApiTags)('accounts'),
    (0, common_1.Controller)('accounts'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [accounts_service_1.AccountsService])
], AccountsController);
//# sourceMappingURL=accounts.controller.js.map