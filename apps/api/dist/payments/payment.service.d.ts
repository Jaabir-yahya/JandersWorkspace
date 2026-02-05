import { PrismaService } from '../prisma/prisma.service';
import { UniversalTransactionsService } from '../universal-truth/transactions.service';
import { UniversalAccountsService } from '../universal-truth/accounts.service';
export interface CreatePaymentDto {
    amount: number;
    method: 'CASH' | 'MPESA' | 'BANK' | 'CHECK' | 'MOBILE_MONEY';
    reference?: string;
    description?: string;
    accountId?: string;
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
    transactionId?: string;
    createdAt: string;
    updatedAt: string;
    metadata?: Record<string, any>;
}
export declare class PaymentService {
    private readonly prisma;
    private readonly transactionsService;
    private readonly accountsService;
    constructor(prisma: PrismaService, transactionsService: UniversalTransactionsService, accountsService: UniversalAccountsService);
    createPayment(tenantId: string, userId: string, createPaymentDto: CreatePaymentDto): Promise<PaymentDto>;
    findAllPayments(tenantId: string): Promise<PaymentDto[]>;
    findOnePayment(tenantId: string, id: string): Promise<PaymentDto>;
    findPaymentsByMethod(tenantId: string, method: string): Promise<PaymentDto[]>;
    reversePayment(tenantId: string, id: string, reason: string): Promise<{
        message: string;
    }>;
    private getDefaultCashAccount;
    private getDefaultRevenueAccount;
    private mapPaymentToDto;
}
