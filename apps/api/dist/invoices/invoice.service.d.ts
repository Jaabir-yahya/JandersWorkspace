import { PrismaService } from '../prisma/prisma.service';
import { UniversalTransactionsService } from '../universal-truth/transactions.service';
import { UniversalAccountsService } from '../universal-truth/accounts.service';
import { UniversalInvoiceLineItem } from '../transactions/interfaces/universal-invoice.interface';
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
    status: 'DRAFT' | 'POSTED' | 'REVERSED' | 'RECONCILED' | 'VOIDED' | 'ARCHIVED';
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
export declare class InvoiceService {
    private readonly prisma;
    private readonly transactionsService;
    private readonly accountsService;
    constructor(prisma: PrismaService, transactionsService: UniversalTransactionsService, accountsService: UniversalAccountsService);
    createInvoice(tenantId: string, userId: string, createInvoiceDto: CreateInvoiceDto): Promise<InvoiceDto>;
    findAllInvoices(tenantId: string): Promise<InvoiceDto[]>;
    findOneInvoice(tenantId: string, id: string): Promise<InvoiceDto>;
    applyPayment(tenantId: string, userId: string, paymentDto: PaymentApplicationDto): Promise<{
        message: string;
        transactionId: string;
    }>;
    updateInvoicePaymentStatus(tenantId: string, invoiceId: string, paymentStatus: InvoiceDto['payment_status']): Promise<void>;
    private getDefaultSalesAccount;
    private getDefaultReceivablesAccount;
    private getDefaultCashAccount;
    cancelInvoice(tenantId: string, invoiceId: string): Promise<void>;
    private mapNoteToInvoice;
}
