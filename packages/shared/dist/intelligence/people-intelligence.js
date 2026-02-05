"use strict";
/**
 * People Intelligence Engine
 * Handles relationship health, trust scores, and engagement metrics for Nairobi businesses.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeopleIntelligence = void 0;
class PeopleIntelligence {
    /**
     * Calculates a "Heatmap Score" (0-100) for a person based on RFM principles.
     * Recency, Frequency, Monetary value in a Nairobi context.
     */
    static calculateRelationshipHeatmap(person) {
        const now = new Date();
        let score = 0;
        // 1. Recency (30%)
        if (person.lastContact) {
            const daysSinceLastContact = Math.floor((now.getTime() - person.lastContact.getTime()) / (1000 * 60 * 60 * 24));
            if (daysSinceLastContact <= 7)
                score += 30;
            else if (daysSinceLastContact <= 14)
                score += 20;
            else if (daysSinceLastContact <= 30)
                score += 10;
        }
        // 2. Frequency (30%)
        const recentTransactions = person.transactions.filter(t => {
            const tDate = new Date(t.date);
            return (now.getTime() - tDate.getTime()) / (1000 * 60 * 60 * 24) <= 30;
        });
        if (recentTransactions.length >= 10)
            score += 30;
        else if (recentTransactions.length >= 5)
            score += 20;
        else if (recentTransactions.length >= 1)
            score += 10;
        // 3. Monetary (40%)
        const totalValue = recentTransactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);
        if (totalValue > 50000)
            score += 40;
        else if (totalValue > 10000)
            score += 30;
        else if (totalValue > 2000)
            score += 20;
        else if (totalValue > 0)
            score += 10;
        return Math.min(score, 100);
    }
    /**
     * Calculates a "Trust Score" (0-1) based on credit behavior.
     */
    static calculateTrustScore(person) {
        let trust = 1.0;
        // Penalize for negative balance (debt)
        if (person.balance < 0) {
            const debtMagnitude = Math.abs(person.balance);
            if (debtMagnitude > 10000)
                trust -= 0.4;
            else if (debtMagnitude > 2000)
                trust -= 0.2;
            else
                trust -= 0.1;
        }
        // Reward for consistent payments
        const payments = person.transactions.filter(t => t.type === 'in' && !t.isCredit);
        if (payments.length > 5)
            trust += 0.1;
        return Math.max(0, Math.min(trust, 1.0));
    }
    /**
     * Suggests the next best action for a relationship.
     */
    static getSuggestedAction(person) {
        if (person.balance < -1000) {
            return `Kindly follow up with ${person.name} for KSh ${Math.abs(person.balance)} payment.`;
        }
        const now = new Date();
        if (person.lastContact) {
            const days = Math.floor((now.getTime() - person.lastContact.getTime()) / (1000 * 60 * 60 * 24));
            if (days > 21) {
                return `It's been ${days} days since you last saw ${person.name}. Check in?`;
            }
        }
        return `Relationship with ${person.name} is healthy.`;
    }
}
exports.PeopleIntelligence = PeopleIntelligence;
