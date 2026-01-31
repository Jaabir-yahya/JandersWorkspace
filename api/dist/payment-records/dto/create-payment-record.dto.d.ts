export declare class CreatePaymentRecordDto {
    transaction_id: string;
    method: 'CASH' | 'M-PESA' | 'BANK_TRANSFER' | 'CARD' | 'CREDIT';
    amount: number;
    reference?: string;
    paid_at?: string;
}
