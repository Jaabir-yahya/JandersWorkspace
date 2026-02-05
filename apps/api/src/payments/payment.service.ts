import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UniversalTransactionsService } from '../universal-truth/transactions.service';
import { UniversalAccountsService } from '../universal-truth/accounts.service';

export interface CreatePaymentDto {
  amount: number;
  method: 'CASH' | 'MPESA' | 'BANK' | 'CHECK' | 'MOBILE_MONEY';
  reference?: string;
  description?: string;
  accountId?: string; // Source account to debit
  customerId?: string;
  invoiceId?: string;
  metadata?: Record<string, any>;
}

export interface PaymentDto {
  id: string;
  amount: number;
  method: 'CASH' | 'MPESA' | 'BANK' | 'CHECK' | 'MOBILE_MONEY';
  reference?: string;
  description?: string;
  accountId: string;
  customerId?: string;
  invoiceId?: string;
  status: 'PENDING' | 'PROCESSED' | 'FAILED';
  transactionId?: string; // Links to Universal Truth transaction
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class PaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly transactionsService: UniversalTransactionsService,
    private readonly accountsService: UniversalAccountsService,
  ) {}

  /**
   * Create payment with automatic ledger posting
   */
  async createPayment(
    tenantId: string,
    userId: string,
    createPaymentDto: CreatePaymentDto,
  ): Promise<PaymentDto> {
    // Get or create accounts needed for payment processing
    const sourceAccount = createPaymentDto.accountId
      ? await this.accountsService.getAccount(
          createPaymentDto.accountId,
          tenantId,
        )
      : await this.getDefaultCashAccount(tenantId);

    const targetAccount = await this.getDefaultRevenueAccount(tenantId);

    if (!sourceAccount || !targetAccount) {
      throw new Error('Required accounts not available for payment processing');
    }

    // Create double-entry transaction for payment receipt
    const transactionId =
      await this.transactionsService.createDoubleEntryTransaction({
        tenantId,
        fromAccountId: sourceAccount.id, // Debit: Increase cash/bank
        toAccountId: targetAccount.id, // Credit: Increase revenue
        amount: createPaymentDto.amount,
        reasonId: 'PAYMENT_RECEIVED',
        entityId: createPaymentDto.customerId,
        notes: `Payment: ${createPaymentDto.description || createPaymentDto.method}`,
        reference: createPaymentDto.reference || `PAY-${Date.now()}`,
        createdById: userId,
      });

    // Store payment record
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

    // Store payment application if invoice specified
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

  /**
   * Get all payments for tenant
   */
  async findAllPayments(tenantId: string): Promise<PaymentDto[]> {
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

  /**
   * Get payment by ID
   */
  async findOnePayment(tenantId: string, id: string): Promise<PaymentDto> {
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

  /**
   * Get payments by method (for reporting)
   */
  async findPaymentsByMethod(
    tenantId: string,
    method: string,
  ): Promise<PaymentDto[]> {
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

  /**
   * Reverse payment with transaction reversal
   */
  async reversePayment(
    tenantId: string,
    id: string,
    reason: string,
  ): Promise<{ message: string }> {
    const payment = await this.findOnePayment(tenantId, id);

    // Reverse the original transaction if it exists
    if (payment.transactionId) {
      await this.transactionsService.reverseTransaction(
        payment.transactionId,
        reason,
      );
    }

    // Update payment status
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

  /**
   * Get default cash account for tenant
   */
  private async getDefaultCashAccount(tenantId: string) {
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

  /**
   * Get default revenue account for tenant
   */
  private async getDefaultRevenueAccount(tenantId: string) {
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

  /**
   * Map payment record to Payment DTO
   */
  private mapPaymentToDto(payment: any, transactionId?: string): PaymentDto {
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
}
