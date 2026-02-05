/**
 * Kenyan Data Cleaner
 * Transaction cleaning pipeline for Kenyan business context
 */
import { VatBreakdown } from '../kenya/kes-formatters';
/**
 * Transaction types
 */
export type TransactionType = 'income' | 'expense' | 'transfer' | 'unknown';
/**
 * Raw transaction from external source
 */
export interface RawTransaction {
    id: string;
    amount: number;
    currency: string;
    description: string;
    contact?: string;
    phoneNumber?: string;
    timestamp: Date;
    source: string;
    rawData: Record<string, unknown>;
}
/**
 * Cleaned transaction ready for export/reporting
 */
export interface CleanTransaction {
    id: string;
    originalAmount: number;
    standardizedAmount: number;
    currency: string;
    category: string;
    subCategory?: string;
    vat: VatBreakdown | null;
    contact: string;
    contactType: 'individual' | 'business' | 'unknown';
    timestamp: Date;
    description: string;
    source: string;
    context: KenyanBusinessContext;
    metadata: TransactionMetadata;
}
/**
 * Kenyan business context for transactions
 */
export interface KenyanBusinessContext {
    isInformal: boolean;
    commonInKenya: boolean;
    requiresVAT: boolean;
    businessSector?: string;
    isRecurring: boolean;
}
/**
 * Transaction metadata
 */
export interface TransactionMetadata {
    cleanedAt: Date;
    cleanerVersion: string;
    confidence: number;
    flags: string[];
    originalDescription: string;
}
/**
 * Kenyan transaction categories
 */
export declare const KENYAN_TRANSACTION_CATEGORIES: {
    readonly sales: {
        readonly name: "Sales";
        readonly swahiliName: "Mauzo";
        readonly type: "income";
    };
    readonly services: {
        readonly name: "Services";
        readonly swahiliName: "Huduma";
        readonly type: "income";
    };
    readonly mpesa_received: {
        readonly name: "M-Pesa Received";
        readonly swahiliName: "M-Pesa Iliyopokelewa";
        readonly type: "income";
    };
    readonly bank_deposit: {
        readonly name: "Bank Deposit";
        readonly swahiliName: "Amana ya Benki";
        readonly type: "income";
    };
    readonly refund: {
        readonly name: "Refund";
        readonly swahiliName: "Rejesha";
        readonly type: "income";
    };
    readonly inventory: {
        readonly name: "Inventory/Purchases";
        readonly swahiliName: "Malipo ya Bidhaa";
        readonly type: "expense";
    };
    readonly rent: {
        readonly name: "Rent";
        readonly swahiliName: "Kodi";
        readonly type: "expense";
    };
    readonly utilities: {
        readonly name: "Utilities";
        readonly swahiliName: "Huduma za Umeme na Maji";
        readonly type: "expense";
    };
    readonly salaries: {
        readonly name: "Salaries & Wages";
        readonly swahiliName: "Mishahara";
        readonly type: "expense";
    };
    readonly transport: {
        readonly name: "Transport";
        readonly swahiliName: "Usafiri";
        readonly type: "expense";
    };
    readonly fuel: {
        readonly name: "Fuel";
        readonly swahiliName: "Mafuta";
        readonly type: "expense";
    };
    readonly airtime: {
        readonly name: "Airtime";
        readonly swahiliName: "Muda wa Maongezi";
        readonly type: "expense";
    };
    readonly internet: {
        readonly name: "Internet";
        readonly swahiliName: "Intaneti";
        readonly type: "expense";
    };
    readonly mpesa_sent: {
        readonly name: "M-Pesa Sent";
        readonly swahiliName: "M-Pesa Iliyotumwa";
        readonly type: "expense";
    };
    readonly bank_withdrawal: {
        readonly name: "Bank Withdrawal";
        readonly swahiliName: "Kutoa Benki";
        readonly type: "expense";
    };
    readonly marketing: {
        readonly name: "Marketing";
        readonly swahiliName: "Utangazaji";
        readonly type: "expense";
    };
    readonly repairs: {
        readonly name: "Repairs & Maintenance";
        readonly swahiliName: "Matengenezo";
        readonly type: "expense";
    };
    readonly licenses: {
        readonly name: "Licenses & Permits";
        readonly swahiliName: "Leseni";
        readonly type: "expense";
    };
    readonly professional_services: {
        readonly name: "Professional Services";
        readonly swahiliName: "Huduma za Kitaalamu";
        readonly type: "expense";
    };
    readonly meals: {
        readonly name: "Meals & Entertainment";
        readonly swahiliName: "Chakula na Burudani";
        readonly type: "expense";
    };
    readonly supplies: {
        readonly name: "Office Supplies";
        readonly swahiliName: "Vifaa vya Ofisi";
        readonly type: "expense";
    };
    readonly transfer: {
        readonly name: "Transfer";
        readonly swahiliName: "Uhamisho";
        readonly type: "transfer";
    };
    readonly unknown: {
        readonly name: "Unknown";
        readonly swahiliName: "Haijulikani";
        readonly type: "unknown";
    };
};
/**
 * Kenyan Data Cleaner class
 * Cleans and standardizes transactions for Kenyan business context
 */
export declare class KenyanDataCleaner {
    private readonly version;
    private readonly vatThreshold;
    /**
     * Clean a transaction for export
     * @param transaction - The raw transaction to clean
     * @returns Cleaned transaction
     */
    cleanTransactionForExport(transaction: RawTransaction): Promise<CleanTransaction>;
    /**
     * Standardize amount to KES
     * @param amount - The original amount
     * @param currency - The currency code
     * @returns Standardized amount in KES
     */
    private standardizeAmount;
    /**
     * Categorize transaction using Kenyan context
     * @param description - The transaction description
     * @returns Category information
     */
    private categorizeKenyanTransaction;
    /**
     * Calculate VAT for a transaction
     * @param amount - The transaction amount
     * @param type - The transaction type
     * @returns VAT breakdown or null
     */
    private calculateVAT;
    /**
     * Clean contact name
     * @param contact - The raw contact name
     * @returns Cleaned contact name
     */
    private cleanContactName;
    /**
     * Determine contact type
     * @param contact - The contact name
     * @param phoneNumber - Optional phone number
     * @returns Contact type
     */
    private determineContactType;
    /**
     * Check if transaction is from informal sector
     * @param transaction - The transaction
     * @returns True if likely informal sector
     */
    private isInformalSector;
    /**
     * Check if transaction is common in Kenya
     * @param transaction - The transaction
     * @returns True if common Kenyan transaction
     */
    private isCommonKenyanTransaction;
    /**
     * Check if transaction requires VAT
     * @param amount - The transaction amount
     * @returns True if VAT should be calculated
     */
    private requiresVAT;
    /**
     * Check if transaction is likely recurring
     * @param description - The transaction description
     * @returns True if likely recurring
     */
    private isLikelyRecurring;
    /**
     * Clean description text
     * @param description - The raw description
     * @returns Cleaned description
     */
    private cleanDescription;
    /**
     * Calculate confidence score for cleaning
     * @param transaction - The transaction
     * @returns Confidence score (0-1)
     */
    private calculateConfidence;
    /**
     * Clean multiple transactions
     * @param transactions - Array of raw transactions
     * @returns Array of cleaned transactions
     */
    cleanTransactions(transactions: RawTransaction[]): Promise<CleanTransaction[]>;
}
export declare const kenyanDataCleaner: KenyanDataCleaner;
//# sourceMappingURL=kenyan-data-cleaner.d.ts.map