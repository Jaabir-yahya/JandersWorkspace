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
exports.PaymentRecordsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let PaymentRecordsService = class PaymentRecordsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const transaction = await this.prisma.transaction.findUnique({
            where: { id: dto.transaction_id },
            select: { id: true, status: true },
        });
        if (!transaction) {
            throw new common_1.NotFoundException(`Transaction ${dto.transaction_id} not found`);
        }
        if (!dto.tenant_id) {
            throw new common_1.BadRequestException('tenant_id is required');
        }
        if (!dto.created_by_user_id) {
            throw new common_1.BadRequestException('created_by_user_id is required');
        }
        const payment = await this.prisma.$transaction(async (tx) => {
            const newPayment = await tx.payment.create({
                data: {
                    tenantId: dto.tenant_id,
                    createdByUserId: dto.created_by_user_id,
                    amount: dto.amount,
                    status: client_1.PaymentStatus.SETTLED,
                    reference: dto.reference || null,
                    metadata: {
                        method: dto.method,
                        paid_at: dto.paid_at || new Date().toISOString(),
                        transaction_id: dto.transaction_id,
                    },
                },
            });
            await tx.paymentApplication.create({
                data: {
                    paymentId: newPayment.id,
                    transactionId: dto.transaction_id,
                    amount: dto.amount,
                },
            });
            return newPayment;
        });
        await this.updateTransactionPaymentStatus(dto.transaction_id);
        return {
            id: payment.id,
            transaction_id: dto.transaction_id,
            method: dto.method,
            amount: dto.amount,
            reference: dto.reference,
            paid_at: dto.paid_at || new Date().toISOString(),
            metadata: payment.metadata,
            created_at: payment.createdAt.toISOString(),
        };
    }
    async findByTransactionId(transactionId) {
        const paymentApps = await this.prisma.paymentApplication.findMany({
            where: { transactionId },
            include: {
                payment: true,
            },
            orderBy: {
                appliedAt: 'desc',
            },
        });
        return paymentApps.map((app) => {
            const metadata = app.payment?.metadata;
            return {
                id: app.paymentId,
                transaction_id: transactionId,
                method: metadata?.method || 'unknown',
                amount: Number(app.amount),
                reference: app.payment?.reference || undefined,
                paid_at: metadata?.paid_at || app.payment?.paidAt?.toISOString(),
                metadata: app.payment?.metadata,
                created_at: app.appliedAt.toISOString(),
            };
        });
    }
    async delete(id) {
        const paymentApp = await this.prisma.paymentApplication.findFirst({
            where: { paymentId: id },
            include: {
                payment: {
                    select: {
                        id: true,
                    },
                },
                transaction: {
                    select: {
                        id: true,
                        status: true,
                    },
                },
            },
        });
        if (!paymentApp) {
            throw new common_1.NotFoundException(`Payment record ${id} not found`);
        }
        if (paymentApp.transaction.status !== 'DRAFT') {
            throw new common_1.BadRequestException('Cannot delete payment records for non-DRAFT transactions');
        }
        const transactionId = paymentApp.transaction.id;
        await this.prisma.paymentApplication.delete({
            where: { id: paymentApp.id },
        });
        await this.prisma.payment.delete({
            where: { id },
        });
        await this.updateTransactionPaymentStatus(transactionId);
    }
    async updateTransactionPaymentStatus(transactionId) {
        const transaction = await this.prisma.transaction.findUnique({
            where: { id: transactionId },
            select: { totalAmount: true, status: true },
        });
        if (!transaction) {
            return;
        }
        const paymentApps = await this.prisma.paymentApplication.findMany({
            where: { transactionId },
            select: { appliedAmount: true },
        });
        const totalPaid = paymentApps.reduce((sum, p) => sum + Number(p.appliedAmount), 0);
        const totalAmount = Number(transaction.totalAmount);
        let newStatus;
        if (totalPaid === 0) {
            newStatus = client_1.PaymentStatus.PENDING;
        }
        else if (totalPaid >= totalAmount) {
            newStatus = client_1.PaymentStatus.SETTLED;
        }
        else {
            newStatus = client_1.PaymentStatus.PARTIAL;
        }
        await this.prisma.transaction.update({
            where: { id: transactionId },
            data: { paymentStatus: newStatus },
        });
    }
};
exports.PaymentRecordsService = PaymentRecordsService;
exports.PaymentRecordsService = PaymentRecordsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentRecordsService);
//# sourceMappingURL=payment-records.service.js.map