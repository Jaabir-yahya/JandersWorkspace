/**
 * People Intelligence Engine
 * Handles relationship health, trust scores, and engagement metrics for Nairobi businesses.
 */
export interface Interaction {
    date: Date;
    type: string;
    amount?: number;
}
export interface PersonData {
    id: string;
    transactions: any[];
    lastContact?: Date;
    creditLimit?: number;
}
export declare class PeopleIntelligence {
    /**
     * Calculates a "Heatmap Score" (0-100) for a person based on RFM principles.
     * Recency, Frequency, Monetary value in a Nairobi context.
     */
    static calculateRelationshipHeatmap(person: PersonData): number;
    /**
     * Calculates a "Trust Score" (0-1) based on credit behavior.
     */
    static calculateTrustScore(person: {
        balance: number;
        transactions: any[];
    }): number;
    /**
     * Suggests the next best action for a relationship.
     */
    static getSuggestedAction(person: {
        name: string;
        balance: number;
        lastContact?: Date;
    }): string;
}
//# sourceMappingURL=people-intelligence.d.ts.map