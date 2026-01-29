export declare class TransactionLineDto {
    description: string;
    sku?: string;
    quantity: number;
    unit_price: number;
    account_code?: string;
    metadata?: Record<string, any>;
}
export declare class CreateTransactionDto {
    tenant_id: string;
    entity_id?: string;
    created_by_user_id: string;
    type: 'RETAIL' | 'SERVICE' | 'RENTAL' | 'EXPENSE';
    currency_code: string;
    reference?: string;
    transaction_date?: string;
    metadata?: Record<string, any>;
    lines: TransactionLineDto[];
}
