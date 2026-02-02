export declare class TransactionLineDto {
    description: string;
    sku?: string;
    quantity: number;
    unit_price: number;
    account_code?: string;
    metadata?: Record<string, any>;
}
export declare class PaymentRecordDto {
    method: 'CASH' | 'M-PESA' | 'BANK_TRANSFER' | 'CARD' | 'CREDIT';
    amount: number;
    reference?: string;
    paid_at?: string;
}
export declare class CreateTransactionDto {
    tenant_id: string;
    entity_id?: string;
    created_by_user_id: string;
    type: 'RETAIL' | 'SERVICE' | 'RENTAL' | 'EXPENSE';
    currency_code: string;
    reference?: string;
    transaction_date?: string;
    due_date?: string;
    context?: string;
    tags?: string[];
    metadata?: Record<string, any>;
    lines: TransactionLineDto[];
    payment_records?: PaymentRecordDto[];
}
