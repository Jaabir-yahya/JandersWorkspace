/**
 * Business Pulse Calculators
 * Real-time metrics for Nairobi business owners.
 * These are stateless calculators designed for high-performance dashboards.
 */
export interface PulseData {
    cash: number;
    mpesa: number;
    bank: number;
    totalDebtors: number;
    totalCreditors: number;
}
export declare class PulseCalculators {
    /**
     * Calculates the core "Money Pulse" from a set of account balances.
     */
    static calculateMoneyPulse(balances: Array<{
        type: string;
        amount: number;
    }>): {
        cashHand: number;
        mpesaBalance: number;
        bankBalance: number;
        totalLiquid: number;
    };
    /**
     * Determines the "Collection Urgency" for debtors.
     */
    static getCollectionUrgency(debtors: Array<{
        name: string;
        amount: number;
        lastPaymentDays: number;
    }>): {
        urgency: string;
        suggestedAction: string;
        name: string;
        amount: number;
        lastPaymentDays: number;
    }[];
    /**
     * Suggests stock reorders based on current vs min stock.
     */
    static getStockPulse(items: Array<{
        name: string;
        current: number;
        min: number;
        unit: string;
    }>): {
        name: string;
        shortage: number;
        unit: string;
        urgency: string;
    }[];
}
//# sourceMappingURL=pulse-calculators.d.ts.map