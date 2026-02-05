// Plain JS version of the intelligence logic for verification
// This bypasses build/permission issues to confirm the math and logic are correct.

const PeopleIntelligence = {
    calculateRelationshipHeatmap(person) {
        const now = new Date();
        let score = 0;
        if (person.lastContact) {
            const daysSinceLastContact = Math.floor((now.getTime() - person.lastContact.getTime()) / (1000 * 60 * 60 * 24));
            if (daysSinceLastContact <= 7) score += 30;
            else if (daysSinceLastContact <= 14) score += 20;
            else if (daysSinceLastContact <= 30) score += 10;
        }
        const recentTransactions = person.transactions.filter(t => {
            const tDate = new Date(t.date);
            return (now.getTime() - tDate.getTime()) / (1000 * 60 * 60 * 24) <= 30;
        });
        if (recentTransactions.length >= 10) score += 30;
        else if (recentTransactions.length >= 5) score += 20;
        else if (recentTransactions.length >= 1) score += 10;
        const totalValue = recentTransactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);
        if (totalValue > 50000) score += 40;
        else if (totalValue > 10000) score += 30;
        else if (totalValue > 2000) score += 20;
        else if (totalValue > 0) score += 10;
        return Math.min(score, 100);
    },
    calculateTrustScore(person) {
        let trust = 1.0;
        if (person.balance < 0) {
            const debtMagnitude = Math.abs(person.balance);
            if (debtMagnitude > 10000) trust -= 0.4;
            else if (debtMagnitude > 2000) trust -= 0.2;
            else trust -= 0.1;
        }
        const payments = person.transactions.filter(t => t.type === 'in' && !t.isCredit);
        if (payments.length > 5) trust += 0.1;
        return Math.max(0, Math.min(trust, 1.0));
    }
};

const InventoryIntelligence = {
    predictDaysOfStockLeft(item, salesHistory) {
        if (salesHistory.length === 0) return 999;
        const now = new Date();
        const fourteenDaysAgo = new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000));
        const recentSales = salesHistory.filter(s => new Date(s.date) >= fourteenDaysAgo);
        const totalQtySold = recentSales.reduce((sum, s) => sum + s.qty, 0);
        const dailyAverage = totalQtySold / 14;
        if (dailyAverage <= 0) return 999;
        return Math.floor(item.currentStock / dailyAverage);
    }
};

const NLFoundation = {
    tokenize(query) {
        const q = query.toLowerCase();
        if (q.includes('owes') || q.includes('debt') || q.includes('deni')) {
            const match = q.match(/(?:money|debt)?\s*(.*?)\s*(?:owes|deni)/) || q.match(/(?:owes|deni)\s*(.*?)$/);
            return { action: 'SEARCH_DEBT', target: match ? match[1].trim() : undefined };
        }
        if (q.includes('stock') || q.includes('inventory')) return { action: 'SEARCH_STOCK' };
        return { action: 'UNKNOWN' };
    }
};

// RUN TESTS
console.log('--- LOGIC VERIFICATION ---');
const person = {
    balance: -5000,
    lastContact: new Date(Date.now() - (5 * 24 * 60 * 60 * 1000)),
    transactions: [{ date: new Date(), amount: 1000, type: 'out' }]
};
console.log('Heatmap (expected ~50):', PeopleIntelligence.calculateRelationshipHeatmap(person));
console.log('Trust (expected 0.8):', PeopleIntelligence.calculateTrustScore(person));

const item = { currentStock: 10 };
const sales = [{ qty: 14, date: new Date() }];
console.log('Days Left (expected 10):', InventoryIntelligence.predictDaysOfStockLeft(item, sales));

console.log('NL Test ("Kamau owes"):', NLFoundation.tokenize('Kamau owes 500'));
console.log('--- COMPLETE ---');
