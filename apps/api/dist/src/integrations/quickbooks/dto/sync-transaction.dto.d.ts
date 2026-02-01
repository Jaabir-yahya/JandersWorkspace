export declare class SyncTransactionDto {
    transactionId?: string;
    transaction: Record<string, any>;
    operation?: 'CREATE' | 'UPDATE' | 'DELETE';
}
