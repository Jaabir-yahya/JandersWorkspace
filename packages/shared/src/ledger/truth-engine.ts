/**
 * The Truth Engine - Core Ledger Rules for Project Bridge
 * This ensures that informal economy transactions follow industry standards
 * while remaining flexible for Nairobi business realities.
 */

export enum LedgerStatus {
    DRAFT = 'DRAFT',
    POSTED = 'POSTED',
    REVERSED = 'REVERSED',
    RECONCILED = 'RECONCILED',
    VOIDED = 'VOIDED',
    ARCHIVED = 'ARCHIVED'
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

export class TruthEngine {
    /**
     * Validates if a transaction follows core business rules.
     * LOCK 1: Derived totals must match line totals.
     */
    static validateTransaction(txn: TransactionInput): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        // Basic amount validation
        if (txn.amount <= 0 && !txn.isCredit) {
            errors.push('Transaction amount must be positive for non-credit entries');
        }

        // M-Pesa validation (common in Nairobi)
        if (txn.method === 'MPESA' && txn.mpesaCode && !/^[A-Z0-9]{10}$/.test(txn.mpesaCode)) {
            errors.push('Invalid M-Pesa reference code format');
        }

        // Line total validation (Truth Principle)
        if (txn.lines && txn.lines.length > 0) {
            const lineTotal = txn.lines.reduce((sum, line) => sum + line.amount, 0);
            if (Math.abs(lineTotal - txn.amount) > 0.01) {
                errors.push(`Transaction amount (${txn.amount}) does not match total of lines (${lineTotal})`);
            }
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * State Machine: Can a transaction transition from current to next status?
     */
    static canTransitionStatus(current: LedgerStatus, next: LedgerStatus): boolean {
        const validTransitions: Record<LedgerStatus, LedgerStatus[]> = {
            [LedgerStatus.DRAFT]: [LedgerStatus.POSTED, LedgerStatus.VOIDED],
            [LedgerStatus.POSTED]: [LedgerStatus.REVERSED, LedgerStatus.RECONCILED, LedgerStatus.ARCHIVED],
            [LedgerStatus.REVERSED]: [LedgerStatus.ARCHIVED],
            [LedgerStatus.RECONCILED]: [LedgerStatus.ARCHIVED],
            [LedgerStatus.VOIDED]: [LedgerStatus.ARCHIVED],
            [LedgerStatus.ARCHIVED]: [] // Terminal state
        };

        return validTransitions[current]?.includes(next) ?? false;
    }

    /**
     * Is the transaction locked/immutable?
     */
    static isImmutable(status: LedgerStatus): boolean {
        return [LedgerStatus.POSTED, LedgerStatus.REVERSED, LedgerStatus.ARCHIVED].includes(status);
    }

    /**
     * Calculates the "Trust Score" impact of a transaction.
     * Positive impact for settled debts, negative for late credit.
     */
    static calculateTrustImpact(txn: { amount: number; isCredit: boolean; status: LedgerStatus; paymentStatus: string }): number {
        if (txn.isCredit && txn.paymentStatus === 'SETTLED') return 5; // Payment on time
        if (txn.isCredit && txn.paymentStatus === 'PENDING') return -1; // New debt
        return 0;
    }
}
