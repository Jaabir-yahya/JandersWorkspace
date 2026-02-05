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
exports.PaymentController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../auth/auth.guard");
const payment_service_1 = require("./payment.service");
let PaymentController = class PaymentController {
    paymentService;
    constructor(paymentService) {
        this.paymentService = paymentService;
    }
    async createPayment(req, createPaymentDto) {
        const user = (0, auth_guard_1.getAuthenticatedUser)(req);
        if (!user.tenantId) {
            throw new common_1.BadRequestException('User must be associated with a tenant');
        }
        return this.paymentService.createPayment(user.tenantId, user.id, createPaymentDto);
    }
    async findAllPayments(req) {
        const user = (0, auth_guard_1.getAuthenticatedUser)(req);
        if (!user.tenantId) {
            throw new common_1.BadRequestException('User must be associated with a tenant');
        }
        return this.paymentService.findAllPayments(user.tenantId);
    }
    async findPaymentsByMethod(req, method) {
        const user = (0, auth_guard_1.getAuthenticatedUser)(req);
        if (!user.tenantId) {
            throw new common_1.BadRequestException('User must be associated with a tenant');
        }
        return this.paymentService.findPaymentsByMethod(user.tenantId, method);
    }
    async findOnePayment(req, id) {
        const user = (0, auth_guard_1.getAuthenticatedUser)(req);
        if (!user.tenantId) {
            throw new common_1.BadRequestException('User must be associated with a tenant');
        }
        return this.paymentService.findOnePayment(user.tenantId, id);
    }
    async reversePayment(req, id, reason) {
        const user = (0, auth_guard_1.getAuthenticatedUser)(req);
        if (!user.tenantId) {
            throw new common_1.BadRequestException('User must be associated with a tenant');
        }
        return this.paymentService.reversePayment(user.tenantId, id, reason);
    }
};
exports.PaymentController = PaymentController;
__decorate([
    (0, common_1.Post)(),
    ApiOperation({ summary: 'Create new payment' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "createPayment", null);
__decorate([
    (0, common_1.Get)(),
    ApiOperation({ summary: 'Get all payments' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "findAllPayments", null);
__decorate([
    (0, common_1.Get)('method/:method'),
    ApiOperation({ summary: 'Get payments by method' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('method')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "findPaymentsByMethod", null);
__decorate([
    (0, common_1.Get)(':id'),
    ApiOperation({ summary: 'Get payment by ID' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "findOnePayment", null);
__decorate([
    (0, common_1.Patch)(':id/reverse'),
    ApiOperation({ summary: 'Reverse payment' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "reversePayment", null);
exports.PaymentController = PaymentController = __decorate([
    (0, common_1.Controller)('payments'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __metadata("design:paramtypes", [payment_service_1.PaymentService])
], PaymentController);
function ApiOperation(options) {
    return (target, propertyKey, descriptor) => {
    };
}
//# sourceMappingURL=payment.controller.js.map