/**
 * The Truth Engine - Core Ledger Rules for Project Bridge
 * This ensures that informal economy transactions follow industry standards
 * while remaining flexible for Nairobi business realities.
 */
export declare enum LedgerStatus {
    DRAFT = "DRAFT",
    POSTED = "POSTED",
    REVERSED = "REVERSED",
    RECONCILED = "RECONCILED",
    VOIDED = "VOIDED",
    ARCHIVED = "ARCHIVED"
}
export interface TransactionInput {
    amount: number;
    party?: string;
    what?: string;
    method: string;
    mpesaCode?: string;
    isCredit: boolean;
    status?: LedgerStatus;
    lines?: Array<{
        amount: number;
        description: string;
    }>;
}
export declare class TruthEngine {
    /**
     * Validates if a transaction follows core business rules.
     * LOCK 1: Derived totals must match line totals.
     */
    static validateTransaction(txn: TransactionInput): {
        valid: boolean;
        errors: string[];
    };
    /**
     * State Machine: Can a transaction transition from current to next status?
     */
    static canTransitionStatus(current: LedgerStatus, next: LedgerStatus): boolean;
    /**
     * Is the transaction locked/immutable?
     */
    static isImmutable(status: LedgerStatus): boolean;
    /**
     * Calculates the "Trust Score" impact of a transaction.
     * Positive impact for settled debts, negative for late credit.
     */
    static calculateTrustImpact(txn: {
        amount: number;
        isCredit: boolean;
        status: LedgerStatus;
        paymentStatus: string;
    }): number;
}
//# sourceMappingURL=truth-engine.d.ts.map