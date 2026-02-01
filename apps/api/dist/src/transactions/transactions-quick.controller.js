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
exports.TransactionsQuickController = void 0;
const common_1 = require("@nestjs/common");
const transactions_service_1 = require("./transactions.service");
const quick_capture_dto_1 = require("./dto/quick-capture.dto");
let TransactionsQuickController = class TransactionsQuickController {
    transactionsService;
    constructor(transactionsService) {
        this.transactionsService = transactionsService;
    }
    async quickCapture(tenantId, dto) {
        if (!tenantId?.trim()) {
            throw new common_1.BadRequestException('X-Tenant-Id header is required');
        }
        const type = dto.type === 'sale' || dto.type === 'SALE'
            ? 'RETAIL'
            : dto.type === 'expense' || dto.type === 'EXPENSE'
                ? 'EXPENSE'
                : dto.type;
        const currencyCode = dto.currency_code || 'KES';
        const method = dto.method
            ? dto.method.toUpperCase().replace('MPESA', 'M-PESA')
            : 'CASH';
        const manualUserId = await this.transactionsService.getOrCreateManualUserForTenant(tenantId);
        return this.transactionsService.create({
            tenant_id: tenantId,
            created_by_user_id: manualUserId,
            type,
            currency_code: currencyCode,
            reference: `quick-${Date.now()}`,
            entity_id: dto.entity_id || undefined,
            context: dto.note || undefined,
            tags: dto.tags || undefined,
            lines: [
                {
                    description: dto.description,
                    quantity: 1,
                    unit_price: dto.amount,
                    account_code: type === 'EXPENSE' ? '500-EXPENSE' : '200-SALES',
                },
            ],
            payment_records: [{ method, amount: dto.amount }],
        });
    }
};
exports.TransactionsQuickController = TransactionsQuickController;
__decorate([
    (0, common_1.Post)('quick-capture'),
    __param(0, (0, common_1.Headers)('x-tenant-id')),
    __param(1, (0, common_1.Body)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, quick_capture_dto_1.QuickCaptureDto]),
    __metadata("design:returntype", Promise)
], TransactionsQuickController.prototype, "quickCapture", null);
exports.TransactionsQuickController = TransactionsQuickController = __decorate([
    (0, common_1.Controller)('transactions'),
    __metadata("design:paramtypes", [transactions_service_1.TransactionsService])
], TransactionsQuickController);
//# sourceMappingURL=transactions-quick.controller.js.map