/**
 * Kenyan Business Insights Engine
 * Automated intelligence for the Nairobi frontline.
 */
interface Transaction {
    party?: string;
    [key: string]: unknown;
}
interface Pattern {
    type: string;
    party: string;
    frequency: string;
    confidence: number;
}
export declare class KenyanBusinessInsights {
    /**
     * Detects patterns in transactions (e.g., recurring rent or supplier payments).
     */
    static detectPatterns(transactions: Transaction[]): Pattern[];
    /**
     * Auto-categorizes transactions based on Swahili/English keywords.
     */
    static autoCategorize(what: string, amount: number): string[];
}
export {};
//# sourceMappingURL=kenyan-insights.d.ts.map