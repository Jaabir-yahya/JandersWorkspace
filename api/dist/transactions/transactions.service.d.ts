import { SupabaseClient } from '@supabase/supabase-js';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { PostTransactionDto } from './dto/post-transaction.dto';
import { ReverseTransactionDto } from './dto/reverse-transaction.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { UniversalInvoice } from './interfaces/universal-invoice.interface';
export interface TransactionFilters {
    status?: string;
    type?: string;
    entity_id?: string;
    date_from?: string;
    date_to?: string;
    search?: string;
    payment_status?: string;
}
export interface EntityHistoryItem {
    transaction_id: string;
    transaction_date: string;
    type: string;
    status: string;
    payment_status: string;
    total_amount: number;
    currency_code: string;
    reference: string;
    running_balance: number;
}
export declare class TransactionsService {
    private readonly supabase;
    constructor(supabase: SupabaseClient);
    create(dto: CreateTransactionDto): Promise<any>;
    findAll(tenantId: string, filters?: TransactionFilters): Promise<any[]>;
    findOne(id: string): Promise<any>;
    findByEntity(entityId: string): Promise<any[]>;
    postTransaction(id: string, dto: PostTransactionDto): Promise<any>;
    reverseTransaction(id: string, dto: ReverseTransactionDto): Promise<any>;
    updatePaymentStatus(id: string, dto: UpdatePaymentStatusDto): Promise<any>;
    getEntityHistory(entityId: string, tenantId: string): Promise<{
        entity: any;
        transactions: EntityHistoryItem[];
        total_balance: number;
    }>;
    standardizeTransaction(id: string): Promise<UniversalInvoice>;
    searchTransactions(tenantId: string, searchTerm: string, filters?: Omit<TransactionFilters, 'search'>): Promise<any[]>;
    findAllEntities(tenantId: string, filters?: {
        type?: string;
        search?: string;
    }): Promise<any[]>;
    createEntity(dto: any): Promise<any>;
    findEntityById(id: string): Promise<any>;
    getEntityBalance(entityId: string, tenantId: string): Promise<{
        entity: any;
        balance: {
            total_credit: number;
            total_debit: number;
            net_balance: number;
            transaction_count: number;
        };
    }>;
    getEntity360View(entityId: string, tenantId: string): Promise<{
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
    searchEntitiesByPhone(phone: string, tenantId: string): Promise<any>;
    addLinkedPhone(entityId: string, phone: string): Promise<any>;
    removeLinkedPhone(entityId: string, phone: string): Promise<any>;
}
