import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UniversalTransactionsService } from '../universal-truth/transactions.service';
import { UniversalAccountsService } from '../universal-truth/accounts.service';
import {
  UniversalInvoice,
  UniversalInvoiceLineItem,
  getAccountCode,
} from '../transactions/interfaces/universal-invoice.interface';

export interface CreateInvoiceDto {
  customerName: string;
  customerId?: string;
  invoiceDate?: string;
  currency?: string;
  reference?: string;
  type?: 'RETAIL' | 'SERVICE' | 'RENTAL' | 'EXPENSE';
  lineItems: {
    description: string;
    quantity: number;
    unitPrice: number;
    accountCode?: string;
    sku?: string;
  }[];
  taxAmount?: number;
}

export interface InvoiceDto {
  id: string;
  invoice_id: string;
  customer_name: string;
  customer_id: string | null;
  invoice_date: string;
  currency: string;
  total_amount: number;
  line_items: UniversalInvoiceLineItem[];
  tax_amount: number;
  status:
    | 'DRAFT'
    | 'POSTED'
    | 'REVERSED'
    | 'RECONCILED'
    | 'VOIDED'
    | 'ARCHIVED';
  payment_status: 'PENDING' | 'PARTIAL' | 'SETTLED' | 'FAILED' | 'CANCELLED';
  reference?: string;
  type: 'RETAIL' | 'SERVICE' | 'RENTAL' | 'EXPENSE';
  created_at: string;
  updated_at?: string;
  metadata?: Record<string, any>;
}

export interface PaymentApplicationDto {
  paymentId: string;
  invoiceId: string;
  amount: number;
}

@Injectable()
export class InvoiceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly transactionsService: UniversalTransactionsService,
    private readonly accountsService: UniversalAccountsService,
  ) {}

  /**
   * Create invoice with automatic ledger posting
   */
  async createInvoice(
    tenantId: string,
    userId: string,
    createInvoiceDto: CreateInvoiceDto,
  ): Promise<InvoiceDto> {
    const totalAmount =
      createInvoiceDto.lineItems.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0,
      ) + (createInvoiceDto.taxAmount || 0);

    // Get or create accounts needed for invoice posting
    const salesAccount = await this.getDefaultSalesAccount(tenantId);
    const receivablesAccount =
      await this.getDefaultReceivablesAccount(tenantId);

    // Create double-entry transaction for invoice
    const transactionId =
      await this.transactionsService.createDoubleEntryTransaction({
        tenantId,
        fromAccountId: receivablesAccount.id, // Debit: Increase accounts receivable
        toAccountId: salesAccount.id, // Credit: Increase sales
        amount: totalAmount,
        reasonId: getAccountCode(createInvoiceDto.type || 'RETAIL'),
        entityId: createInvoiceDto.customerId,
        notes: `Invoice: ${createInvoiceDto.customerName} - ${createInvoiceDto.reference}`,
        reference: createInvoiceDto.reference || `INV-${Date.now()}`,
        createdById: userId,
      });

    // Store invoice record using notes table
    const invoice = await this.prisma.note.create({
      data: {
        tenantId,
        content: `Invoice to ${createInvoiceDto.customerName}`,
        aboutType: 'INVOICE',
        aboutId: createInvoiceDto.customerId,
        context: {
          invoice_id: transactionId,
          customer_name: createInvoiceDto.customerName,
          customer_id: createInvoiceDto.customerId,
          invoice_date:
            createInvoiceDto.invoiceDate ||
            new Date().toISOString().split('T')[0],
          currency: createInvoiceDto.currency || 'KES',
          total_amount: totalAmount,
          line_items: createInvoiceDto.lineItems.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            account_code:
              item.accountCode ||
              getAccountCode(createInvoiceDto.type || 'RETAIL'),
            sku: item.sku,
            line_total: item.quantity * item.unitPrice,
          })),
          tax_amount: createInvoiceDto.taxAmount || 0,
          status: 'POSTED',
          payment_status: 'PENDING',
          reference: createInvoiceDto.reference,
          type: createInvoiceDto.type || 'RETAIL',
        },
      },
    });

    return this.mapNoteToInvoice(invoice);
  }

  /**
   * Get all invoices for tenant
   */
  async findAllInvoices(tenantId: string): Promise<InvoiceDto[]> {
    const invoices = await this.prisma.note.findMany({
      where: {
        tenantId,
        aboutType: 'INVOICE',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return invoices.map((invoice) => this.mapNoteToInvoice(invoice));
  }

  /**
   * Get invoice by ID
   */
  async findOneInvoice(tenantId: string, id: string): Promise<InvoiceDto> {
    const invoice = await this.prisma.note.findFirst({
      where: {
        tenantId,
        id,
        aboutType: 'INVOICE',
      },
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    return this.mapNoteToInvoice(invoice);
  }

  /**
   * Apply payment to invoice with automatic ledger posting
   */
  async applyPayment(
    tenantId: string,
    userId: string,
    paymentDto: PaymentApplicationDto,
  ): Promise<{ message: string; transactionId: string }> {
    // Get invoice to validate payment amount
    const invoice = await this.findOneInvoice(tenantId, paymentDto.invoiceId);

    // Get or create payment accounts
    const cashAccount = await this.getDefaultCashAccount(tenantId);
    const receivablesAccount =
      await this.getDefaultReceivablesAccount(tenantId);

    if (!cashAccount || !receivablesAccount) {
      throw new Error(
        'Required accounts not available for payment transaction',
      );
    }

    // Create double-entry transaction for payment
    const transactionId =
      await this.transactionsService.createDoubleEntryTransaction({
        tenantId,
        fromAccountId: cashAccount.id, // Debit: Increase cash
        toAccountId: receivablesAccount.id, // Credit: Decrease accounts receivable
        amount: paymentDto.amount,
        reasonId: 'PAYMENT_RECEIVED',
        entityId: invoice.customer_id || undefined,
        notes: `Payment received for invoice ${paymentDto.invoiceId}`,
        reference: `PAY-${Date.now()}`,
        createdById: userId,
      });

    // Update invoice payment status
    const newStatus =
      invoice.payment_status === 'SETTLED'
        ? 'SETTLED'
        : invoice.payment_status === 'PENDING'
          ? 'PARTIAL'
          : invoice.payment_status;

    await this.updateInvoicePaymentStatus(
      tenantId,
      paymentDto.invoiceId,
      newStatus as 'PENDING' | 'PARTIAL' | 'SETTLED',
    );

    // Store payment application record
    await this.prisma.note.create({
      data: {
        tenantId,
        content: `Payment application: ${paymentDto.paymentId} to ${paymentDto.invoiceId}`,
        aboutType: 'PAYMENT_APPLICATION',
        aboutId: paymentDto.invoiceId,
        context: {
          paymentId: paymentDto.paymentId,
          invoiceId: paymentDto.invoiceId,
          amount: paymentDto.amount,
          transactionId,
        },
      },
    });

    return {
      message: 'Payment applied successfully',
      transactionId,
    };
  }

  /**
   * Update invoice payment status (used by controller for cancel and apply payment).
   */
  async updateInvoicePaymentStatus(
    tenantId: string,
    invoiceId: string,
    paymentStatus: InvoiceDto['payment_status'],
  ): Promise<void> {
    await this.prisma.note.updateMany({
      where: {
        tenantId,
        aboutType: 'INVOICE',
        context: {
          path: ['invoice_id'],
          equals: invoiceId,
        },
      },
      data: {
        context: {
          payment_status: paymentStatus,
        },
      },
    });
  }

  /**
   * Get default sales account for tenant
   */
  private async getDefaultSalesAccount(tenantId: string) {
    let salesAccount = await this.prisma.account.findFirst({
      where: {
        tenantId,
        type: 'SALES',
        isActive: true,
      },
    });

    if (!salesAccount) {
      const newSalesAccountId = await this.accountsService.createAccount({
        tenantId,
        name: 'Sales',
        type: 'SALES',
        currency: 'KES',
        metadata: { isDefault: true },
      });
      salesAccount = await this.prisma.account.findUnique({
        where: { id: newSalesAccountId },
      });
    }

    return salesAccount!;
  }

  /**
   * Get default receivables account for tenant
   */
  private async getDefaultReceivablesAccount(tenantId: string) {
    let receivablesAccount = await this.prisma.account.findFirst({
      where: {
        tenantId,
        type: 'RECEIVABLES',
        isActive: true,
      },
    });

    if (!receivablesAccount) {
      const newReceivablesAccountId = await this.accountsService.createAccount({
        tenantId,
        name: 'Accounts Receivable',
        type: 'RECEIVABLES',
        currency: 'KES',
        metadata: { isDefault: true },
      });
      receivablesAccount = await this.prisma.account.findUnique({
        where: { id: newReceivablesAccountId },
      });
    }

    return receivablesAccount!;
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

    return cashAccount!;
  }

  /**
   * Cancel invoice
   */
  async cancelInvoice(tenantId: string, invoiceId: string): Promise<void> {
    await this.updateInvoicePaymentStatus(
      tenantId,
      invoiceId,
      'CANCELLED' as 'PENDING' | 'PARTIAL' | 'SETTLED' | 'FAILED' | 'CANCELLED',
    );
  }

  /**
   * Map note record to Invoice DTO
   */
  private mapNoteToInvoice(note: any): InvoiceDto {
    const context = note.context || {};
    return {
      id: note.id,
      invoice_id: context.invoice_id || note.id,
      customer_name: context.customer_name || 'Unknown Customer',
      customer_id: context.customer_id as string | null,
      invoice_date: context.invoice_date || note.createdAt.split('T')[0],
      currency: context.currency || 'KES',
      total_amount: context.total_amount || 0,
      line_items: context.line_items || [],
      tax_amount: context.tax_amount || 0,
      status: context.status || 'DRAFT',
      payment_status: context.payment_status || 'PENDING',
      reference: context.reference,
      type: context.type || 'RETAIL',
      created_at: note.createdAt,
      updated_at: note.updatedAt,
      metadata: context.metadata,
    };
  }
}
