export declare class UpdatePaymentStatusDto {
    user_id: string;
    status: 'PENDING' | 'PARTIAL' | 'SETTLED' | 'FAILED' | 'CANCELLED';
    notes?: string;
}
