/**
 * Business Storyteller
 * Converts raw ledger entries into human-readable narratives.
 */
export interface StoryInput {
    type: string;
    what?: string;
    party?: string;
    amount: number;
    date: Date;
    isCredit: boolean;
}
export declare class BusinessStoryteller {
    /**
     * Generates a "Headline" for a transaction.
     */
    static generateHeadline(txn: StoryInput): string;
    /**
     * Generates a "Memory" snippet for historical context.
     */
    static generateMemory(txn: StoryInput): string;
}
//# sourceMappingURL=storyteller.d.ts.map