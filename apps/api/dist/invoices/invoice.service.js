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
exports.InvoiceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const transactions_service_1 = require("../universal-truth/transactions.service");
const accounts_service_1 = require("../universal-truth/accounts.service");
const universal_invoice_interface_1 = require("../transactions/interfaces/universal-invoice.interface");
let InvoiceService = class InvoiceService {
    prisma;
    transactionsService;
    accountsService;
    constructor(prisma, transactionsService, accountsService) {
        this.prisma = prisma;
        this.transactionsService = transactionsService;
        this.accountsService = accountsService;
    }
    async createInvoice(tenantId, userId, createInvoiceDto) {
        const totalAmount = createInvoiceDto.lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0) + (createInvoiceDto.taxAmount || 0);
        const salesAccount = await this.getDefaultSalesAccount(tenantId);
        const receivablesAccount = await this.getDefaultReceivablesAccount(tenantId);
        const transactionId = await this.transactionsService.createDoubleEntryTransaction({
            tenantId,
            fromAccountId: receivablesAccount.id,
            toAccountId: salesAccount.id,
            amount: totalAmount,
            reasonId: (0, universal_invoice_interface_1.getAccountCode)(createInvoiceDto.type || 'RETAIL'),
            entityId: createInvoiceDto.customerId,
            notes: `Invoice: ${createInvoiceDto.customerName} - ${createInvoiceDto.reference}`,
            reference: createInvoiceDto.reference || `INV-${Date.now()}`,
            createdById: userId,
        });
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
                    invoice_date: createInvoiceDto.invoiceDate ||
                        new Date().toISOString().split('T')[0],
                    currency: createInvoiceDto.currency || 'KES',
                    total_amount: totalAmount,
                    line_items: createInvoiceDto.lineItems.map((item) => ({
                        description: item.description,
                        quantity: item.quantity,
                        unit_price: item.unitPrice,
                        account_code: item.accountCode ||
                            (0, universal_invoice_interface_1.getAccountCode)(createInvoiceDto.type || 'RETAIL'),
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
    async findAllInvoices(tenantId) {
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
    async findOneInvoice(tenantId, id) {
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
    async applyPayment(tenantId, userId, paymentDto) {
        const invoice = await this.findOneInvoice(tenantId, paymentDto.invoiceId);
        const cashAccount = await this.getDefaultCashAccount(tenantId);
        const receivablesAccount = await this.getDefaultReceivablesAccount(tenantId);
        if (!cashAccount || !receivablesAccount) {
            throw new Error('Required accounts not available for payment transaction');
        }
        const transactionId = await this.transactionsService.createDoubleEntryTransaction({
            tenantId,
            fromAccountId: cashAccount.id,
            toAccountId: receivablesAccount.id,
            amount: paymentDto.amount,
            reasonId: 'PAYMENT_RECEIVED',
            entityId: invoice.customer_id || undefined,
            notes: `Payment received for invoice ${paymentDto.invoiceId}`,
            reference: `PAY-${Date.now()}`,
            createdById: userId,
        });
        const newStatus = invoice.payment_status === 'SETTLED'
            ? 'SETTLED'
            : invoice.payment_status === 'PENDING'
                ? 'PARTIAL'
                : invoice.payment_status;
        await this.updateInvoicePaymentStatus(tenantId, paymentDto.invoiceId, newStatus);
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
    async updateInvoicePaymentStatus(tenantId, invoiceId, paymentStatus) {
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
    async getDefaultSalesAccount(tenantId) {
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
        return salesAccount;
    }
    async getDefaultReceivablesAccount(tenantId) {
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
        return receivablesAccount;
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
    async cancelInvoice(tenantId, invoiceId) {
        await this.updateInvoicePaymentStatus(tenantId, invoiceId, 'CANCELLED');
    }
    mapNoteToInvoice(note) {
        const context = note.context || {};
        return {
            id: note.id,
            invoice_id: context.invoice_id || note.id,
            customer_name: context.customer_name || 'Unknown Customer',
            customer_id: context.customer_id,
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
};
exports.InvoiceService = InvoiceService;
exports.InvoiceService = InvoiceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        transactions_service_1.UniversalTransactionsService,
        accounts_service_1.UniversalAccountsService])
], InvoiceService);
//# sourceMappingURL=invoice.service.js.map