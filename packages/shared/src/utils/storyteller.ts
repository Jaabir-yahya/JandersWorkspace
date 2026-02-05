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

export class BusinessStoryteller {
    /**
     * Generates a "Headline" for a transaction.
     */
    static generateHeadline(txn: StoryInput): string {
        const amountStr = new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            maximumFractionDigits: 0
        }).format(txn.amount);

        if (txn.type === 'sale') {
            const party = txn.party || 'a customer';
            const action = txn.isCredit ? 'gave credit of' : 'sold';
            return `${action} ${txn.what || 'items'} to ${party} for ${amountStr}`;
        }

        if (txn.type === 'purchase') {
            const party = txn.party || 'a supplier';
            return `Bought ${txn.what || 'stock'} from ${party} for ${amountStr}`;
        }

        if (txn.type === 'expense') {
            return `Paid ${amountStr} for ${txn.what || 'expenses'}`;
        }

        return `${txn.type}: ${txn.what || 'Transaction'} of ${amountStr}`;
    }

    /**
     * Generates a "Memory" snippet for historical context.
     */
    static generateMemory(txn: StoryInput): string {
        const hours = new Date(txn.date).getHours();
        const timeOfDay = hours < 12 ? 'morning' : hours < 17 ? 'afternoon' : 'evening';

        return `Occurred during your ${timeOfDay} rush.`;
    }
}
