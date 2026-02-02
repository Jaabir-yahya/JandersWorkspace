import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentRecordDto } from './dto/create-payment-record.dto';
import { PaymentStatus, Prisma } from '@prisma/client';

export interface PaymentRecord {
  id: string;
  transaction_id: string;
  method: string;
  amount: number;
  reference?: string;
  paid_at?: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

@Injectable()
export class PaymentRecordsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePaymentRecordDto): Promise<PaymentRecord> {
    // First, verify the transaction exists
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: dto.transaction_id },
      select: { id: true, status: true },
    });

    if (!transaction) {
      throw new NotFoundException(
        `Transaction ${dto.transaction_id} not found`,
      );
    }

    // Validate required tenant_id and created_by_user_id
    if (!dto.tenant_id) {
      throw new BadRequestException('tenant_id is required');
    }
    if (!dto.created_by_user_id) {
      throw new BadRequestException('created_by_user_id is required');
    }

    // Create payment record using Payment model
    const payment = await this.prisma.$transaction(async (tx) => {
      // Create the payment
      const newPayment = await tx.payment.create({
        data: {
          tenantId: dto.tenant_id,
          createdByUserId: dto.created_by_user_id,
          amount: dto.amount,
          status: PaymentStatus.SETTLED,
          reference: dto.reference || null,
          metadata: {
            method: dto.method,
            paid_at: dto.paid_at || new Date().toISOString(),
            transaction_id: dto.transaction_id,
          } as Prisma.InputJsonValue,
        },
      });

      // Create payment application linking to transaction
      await tx.paymentApplication.create({
        data: {
          paymentId: newPayment.id,
          transactionId: dto.transaction_id,
          amount: dto.amount,
        },
      });

      return newPayment;
    });

    // Update transaction payment_status based on total payments
    await this.updateTransactionPaymentStatus(dto.transaction_id);

    return {
      id: payment.id,
      transaction_id: dto.transaction_id,
      method: dto.method,
      amount: dto.amount,
      reference: dto.reference,
      paid_at: dto.paid_at || new Date().toISOString(),
      metadata: payment.metadata as Record<string, unknown>,
      created_at: payment.createdAt.toISOString(),
    };
  }

  async findByTransactionId(transactionId: string): Promise<PaymentRecord[]> {
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
      const metadata = app.payment?.metadata as any;
      return {
        id: app.paymentId,
        transaction_id: transactionId,
        method: metadata?.method || 'unknown',
        amount: Number(app.amount),
        reference: app.payment?.reference || undefined,
        paid_at: metadata?.paid_at || app.payment?.paidAt?.toISOString(),
        metadata: app.payment?.metadata as Record<string, unknown>,
        created_at: app.appliedAt.toISOString(),
      };
    });
  }

  async delete(id: string): Promise<void> {
    // First, get the payment record to find the transaction
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
      throw new NotFoundException(`Payment record ${id} not found`);
    }

    // Check if transaction is DRAFT (only allow deletion for DRAFT)
    if (paymentApp.transaction.status !== 'DRAFT') {
      throw new BadRequestException(
        'Cannot delete payment records for non-DRAFT transactions',
      );
    }

    const transactionId = paymentApp.transaction.id;

    // Delete payment application first (cascade will handle payment)
    await this.prisma.paymentApplication.delete({
      where: { id: paymentApp.id },
    });

    // Delete the payment
    await this.prisma.payment.delete({
      where: { id },
    });

    // Update transaction payment_status
    await this.updateTransactionPaymentStatus(transactionId);
  }

  private async updateTransactionPaymentStatus(
    transactionId: string,
  ): Promise<void> {
    // Get transaction total amount
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      select: { totalAmount: true, status: true },
    });

    if (!transaction) {
      return;
    }

    // Get total payments for this transaction
    const paymentApps = await this.prisma.paymentApplication.findMany({
      where: { transactionId },
      select: { appliedAmount: true },
    });

    const totalPaid = paymentApps.reduce(
      (sum, p) => sum + Number(p.appliedAmount),
      0,
    );
    const totalAmount = Number(transaction.totalAmount);

    let newStatus: PaymentStatus;
    if (totalPaid === 0) {
      newStatus = PaymentStatus.PENDING;
    } else if (totalPaid >= totalAmount) {
      newStatus = PaymentStatus.SETTLED;
    } else {
      newStatus = PaymentStatus.PARTIAL;
    }

    // Update transaction payment status
    await this.prisma.transaction.update({
      where: { id: transactionId },
      data: { paymentStatus: newStatus },
    });
  }
}
