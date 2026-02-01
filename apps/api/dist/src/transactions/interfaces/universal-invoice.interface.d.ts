export interface UniversalInvoiceLineItem {
    description: string;
    quantity: number;
    unit_price: number;
    account_code: string;
    sku?: string;
    line_total: number;
}
export interface UniversalInvoice {
    invoice_id: string;
    customer_name: string;
    customer_id: string | null;
    invoice_date: string;
    currency: string;
    total_amount: number;
    line_items: UniversalInvoiceLineItem[];
    tax_amount: number;
    status: 'DRAFT' | 'POSTED' | 'REVERSED' | 'RECONCILED' | 'VOIDED' | 'ARCHIVED';
    payment_status: 'PENDING' | 'PARTIAL' | 'SETTLED' | 'FAILED' | 'CANCELLED';
    reference?: string;
    type: 'RETAIL' | 'SERVICE' | 'RENTAL' | 'EXPENSE';
    reversed_transaction_id?: string;
    metadata?: Record<string, any>;
    created_at: string;
    updated_at?: string;
}
export declare const ACCOUNT_CODE_MAPPING: Record<string, string>;
export declare function getAccountCode(type: string): string;
