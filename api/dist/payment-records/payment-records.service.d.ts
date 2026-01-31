import { SupabaseClient } from '@supabase/supabase-js';
import { CreatePaymentRecordDto } from './dto/create-payment-record.dto';
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
export declare class PaymentRecordsService {
    private readonly supabase;
    constructor(supabase: SupabaseClient);
    create(dto: CreatePaymentRecordDto): Promise<PaymentRecord>;
    findByTransactionId(transactionId: string): Promise<PaymentRecord[]>;
    delete(id: string): Promise<void>;
    private updateTransactionPaymentStatus;
}
