/**
 * Natural Language Search Foundation
 * Lightweight tokenizer for the Nairobi frontline.
 */

export type NLAction =
    | 'SEARCH_DEBT'
    | 'SEARCH_STOCK'
    | 'SEARCH_CASH'
    | 'LIST_SUPPLIERS'
    | 'UNKNOWN';

export interface NLCommand {
    action: NLAction;
    target?: string;
    context?: string;
}

export class NLFoundation {
    /**
     * Tokenizes a natural query into a system command.
     */
    static tokenize(query: string): NLCommand {
        const q = query.toLowerCase();

        // Debt patterns
        if (q.includes('owes') || q.includes('debt') || q.includes('deni')) {
            const match = q.match(/(?:money|debt)?\s*(.*?)\s*(?:owes|deni)/) || q.match(/(?:owes|deni)\s*(.*?)$/);
            return {
                action: 'SEARCH_DEBT',
                target: match ? match[1].trim() : undefined
            };
        }

        // Stock patterns
        if (q.includes('stock') || q.includes('inventory') || q.includes('what do i have')) {
            const match = q.match(/(?:stock of|inventory of)\s*(.*?)$/);
            return {
                action: 'SEARCH_STOCK',
                target: match ? match[1].trim() : undefined
            };
        }

        // Cash patterns
        if (q.includes('cash') || q.includes('money') || q.includes('pesa')) {
            return { action: 'SEARCH_CASH' };
        }

        // Supplier patterns
        if (q.includes('supplier')) {
            return { action: 'LIST_SUPPLIERS' };
        }

        return { action: 'UNKNOWN', context: query };
    }
}
