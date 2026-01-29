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
}
