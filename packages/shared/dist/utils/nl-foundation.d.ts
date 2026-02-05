/**
 * Natural Language Search Foundation
 * Lightweight tokenizer for the Nairobi frontline.
 */
export type NLAction = 'SEARCH_DEBT' | 'SEARCH_STOCK' | 'SEARCH_CASH' | 'LIST_SUPPLIERS' | 'UNKNOWN';
export interface NLCommand {
    action: NLAction;
    target?: string;
    context?: string;
}
export declare class NLFoundation {
    /**
     * Tokenizes a natural query into a system command.
     */
    static tokenize(query: string): NLCommand;
}
//# sourceMappingURL=nl-foundation.d.ts.map