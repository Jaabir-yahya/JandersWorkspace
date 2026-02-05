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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const transactions_service_1 = require("../universal-truth/transactions.service");
const accounts_service_1 = require("../universal-truth/accounts.service");
let PaymentService = class PaymentService {
    prisma;
    transactionsService;
    accountsService;
    constructor(prisma, transactionsService, accountsService) {
        this.prisma = prisma;
        this.transactionsService = transactionsService;
        this.accountsService = accountsService;
    }
    async createPayment(tenantId, userId, createPaymentDto) {
        const sourceAccount = createPaymentDto.accountId
            ? await this.accountsService.getAccount(createPaymentDto.accountId, tenantId)
            : await this.getDefaultCashAccount(tenantId);
        const targetAccount = await this.getDefaultRevenueAccount(tenantId);
        if (!sourceAccount || !targetAccount) {
            throw new Error('Required accounts not available for payment processing');
        }
        const transactionId = await this.transactionsService.createDoubleEntryTransaction({
            tenantId,
            fromAccountId: sourceAccount.id,
            toAccountId: targetAccount.id,
            amount: createPaymentDto.amount,
            reasonId: 'PAYMENT_RECEIVED',
            entityId: createPaymentDto.customerId,
            notes: `Payment: ${createPaymentDto.description || createPaymentDto.method}`,
            reference: createPaymentDto.reference || `PAY-${Date.now()}`,
            createdById: userId,
        });
        const payment = await this.prisma.payment.create({
            data: {
                tenantId,
                createdByUserId: userId,
                amount: createPaymentDto.amount,
                reference: createPaymentDto.reference,
                method: createPaymentDto.method,
                status: 'PROCESSED',
                metadata: {
                    description: createPaymentDto.description,
                    accountId: createPaymentDto.accountId,
                    customerId: createPaymentDto.customerId,
                    invoiceId: createPaymentDto.invoiceId,
                    transactionId,
                    ...createPaymentDto.metadata,
                },
            },
        });
        if (createPaymentDto.invoiceId) {
            await this.prisma.paymentApplication.create({
                data: {
                    paymentId: payment.id,
                    transactionId: createPaymentDto.invoiceId,
                    amount: createPaymentDto.amount,
                    appliedAmount: createPaymentDto.amount,
                    appliedAt: new Date(),
                },
            });
        }
        return this.mapPaymentToDto(payment, transactionId);
    }
    async findAllPayments(tenantId) {
        const payments = await this.prisma.payment.findMany({
            where: {
                tenantId,
            },
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                applications: true,
            },
        });
        return payments.map((payment) => this.mapPaymentToDto(payment));
    }
    async findOnePayment(tenantId, id) {
        const payment = await this.prisma.payment.findFirst({
            where: {
                tenantId,
                id,
            },
            include: {
                applications: true,
            },
        });
        if (!payment) {
            throw new Error('Payment not found');
        }
        return this.mapPaymentToDto(payment);
    }
    async findPaymentsByMethod(tenantId, method) {
        const payments = await this.prisma.payment.findMany({
            where: {
                tenantId,
                method: method.toUpperCase(),
            },
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                applications: true,
            },
        });
        return payments.map((payment) => this.mapPaymentToDto(payment));
    }
    async reversePayment(tenantId, id, reason) {
        const payment = await this.findOnePayment(tenantId, id);
        if (payment.transactionId) {
            await this.transactionsService.reverseTransaction(payment.transactionId, reason);
        }
        await this.prisma.payment.update({
            where: {
                tenantId,
                id,
            },
            data: {
                status: 'FAILED',
                metadata: {
                    ...payment.metadata,
                    reversalReason: reason,
                    reversedAt: new Date().toISOString(),
                },
            },
        });
        return { message: 'Payment reversed successfully' };
    }
    async getDefaultCashAccount(tenantId) {
        let cashAccount = await this.prisma.account.findFirst({
            where: {
                tenantId,
                type: 'CASH',
                isActive: true,
            },
        });
        if (!cashAccount) {
            const newCashAccountId = await this.accountsService.createAccount({
                tenantId,
                name: 'Cash',
                type: 'CASH',
                currency: 'KES',
                metadata: { isDefault: true },
            });
            cashAccount = await this.prisma.account.findUnique({
                where: { id: newCashAccountId },
            });
        }
        return cashAccount;
    }
    async getDefaultRevenueAccount(tenantId) {
        let revenueAccount = await this.prisma.account.findFirst({
            where: {
                tenantId,
                type: 'REVENUE',
                isActive: true,
            },
        });
        if (!revenueAccount) {
            const newRevenueAccountId = await this.accountsService.createAccount({
                tenantId,
                name: 'Revenue',
                type: 'REVENUE',
                currency: 'KES',
                metadata: { isDefault: true },
            });
            revenueAccount = await this.prisma.account.findUnique({
                where: { id: newRevenueAccountId },
            });
        }
        return revenueAccount;
    }
    mapPaymentToDto(payment, transactionId) {
        return {
            id: payment.id,
            amount: Number(payment.amount),
            method: payment.method,
            reference: payment.reference,
            description: payment.metadata?.description,
            accountId: payment.metadata?.accountId || '',
            customerId: payment.metadata?.customerId,
            invoiceId: payment.metadata?.invoiceId,
            status: payment.status,
            transactionId,
            createdAt: payment.createdAt,
            updatedAt: payment.updatedAt,
            metadata: payment.metadata,
        };
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        transactions_service_1.UniversalTransactionsService,
        accounts_service_1.UniversalAccountsService])
], PaymentService);
//# sourceMappingURL=payment.service.js.map