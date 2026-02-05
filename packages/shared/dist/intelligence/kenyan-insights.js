"use strict";
/**
 * Kenyan Business Insights Engine
 * Automated intelligence for the Nairobi frontline.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.KenyanBusinessInsights = void 0;
class KenyanBusinessInsights {
    /**
     * Detects patterns in transactions (e.g., recurring rent or supplier payments).
     */
    static detectPatterns(transactions) {
        const patterns = [];
        // Group by party to find recurring flows
        const partyGroups = transactions.reduce((acc, t) => {
            if (!t.party)
                return acc;
            acc[t.party] = acc[t.party] || [];
            acc[t.party].push(t);
            return acc;
        }, {});
        Object.entries(partyGroups).forEach(([party, txns]) => {
            if (txns.length >= 3) {
                patterns.push({
                    type: 'RECURRING_PARTY',
                    party,
                    frequency: 'MONTHLY', // Simplified detection logic
                    confidence: 0.8
                });
            }
        });
        return patterns;
    }
    /**
     * Auto-categorizes transactions based on Swahili/English keywords.
     */
    static autoCategorize(what, amount) {
        const categories = [];
        const narration = what.toLowerCase();
        // Transport & Logistics
        if (narration.includes('mkokoteni') || narration.includes('transport') || narration.includes('matatu')) {
            categories.push('logistics');
        }
        // Food & Stock
        if (narration.includes('sukuma') || narration.includes('nyama') || narration.includes('tomato') || narration.includes('mboga')) {
            categories.push('inventory_food');
        }
        // Fixed Costs
        if (narration.includes('rent') || narration.includes('kodi') || narration.includes('electricity') || narration.includes('stima')) {
            categories.push('fixed_operations');
        }
        // Small vs Large
        if (amount < 500)
            categories.push('petty_cash');
        if (amount > 10000)
            categories.push('high_value');
        return categories;
    }
}
exports.KenyanBusinessInsights = KenyanBusinessInsights;
