import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { PostTransactionDto } from './dto/post-transaction.dto';
import { ReverseTransactionDto } from './dto/reverse-transaction.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
export declare class TransactionsController {
    private readonly transactionsService;
    constructor(transactionsService: TransactionsService);
    create(dto: CreateTransactionDto): Promise<any>;
    findAll(tenantId: string, status?: string, type?: string, entityId?: string, dateFrom?: string, dateTo?: string, search?: string, paymentStatus?: string): Promise<any[]>;
    findOne(id: string): Promise<any>;
    findByEntity(entityId: string): Promise<any[]>;
    postTransaction(id: string, dto: PostTransactionDto): Promise<any>;
    reverseTransaction(id: string, dto: ReverseTransactionDto): Promise<any>;
    updatePaymentStatus(id: string, dto: UpdatePaymentStatusDto): Promise<any>;
    exportTransaction(id: string): Promise<import("./interfaces/universal-invoice.interface").UniversalInvoice>;
}
export declare class EntitiesController {
    private readonly transactionsService;
    constructor(transactionsService: TransactionsService);
    findAll(tenantId: string, type?: string, search?: string): Promise<any[]>;
    create(dto: any): Promise<any>;
    findOne(id: string): Promise<any>;
    getEntityHistory(id: string, tenantId: string): Promise<{
        entity: any;
        transactions: import("./transactions.service").EntityHistoryItem[];
        total_balance: number;
    }>;
    getEntityBalance(id: string, tenantId: string): Promise<{
        entity: any;
        balance: {
            total_credit: number;
            total_debit: number;
            net_balance: number;
            transaction_count: number;
        };
    }>;
    getEntity360View(id: string, tenantId: string): Promise<{
        entity: any;
        balance: {
            total_credit: number;
            total_debit: number;
            net_balance: number;
            transaction_count: number;
        };
        recent_transactions: any[];
        attachments: any[];
    }>;
    searchByPhone(phone: string, tenantId: string): Promise<any>;
    addLinkedPhone(id: string, phone: string): Promise<any>;
    removeLinkedPhone(id: string, phone: string): Promise<any>;
}
