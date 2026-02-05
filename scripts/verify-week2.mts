import { PeopleIntelligence } from '../packages/shared/src/intelligence/people-intelligence';
import { InventoryIntelligence } from '../packages/shared/src/intelligence/inventory-intelligence';
import { NLFoundation } from '../packages/shared/src/utils/nl-foundation';

console.log('--- NAIROBI CORE WEEK 2 VERIFICATION ---');

// 1. People Intelligence Test
console.log('\n[1] Testing People Intelligence...');
const person = {
    id: 'person-1',
    name: 'John Doe',
    balance: -5000,
    lastContact: new Date(Date.now() - (5 * 24 * 60 * 60 * 1000)), // 5 days ago
    transactions: [
        { date: new Date(), amount: 1000, type: 'out' },
        { date: new Date(), amount: 1500, type: 'out' }
    ]
};

const heatmap = PeopleIntelligence.calculateRelationshipHeatmap(person as any);
const trust = PeopleIntelligence.calculateTrustScore(person as any);
const suggestion = PeopleIntelligence.getSuggestedAction(person);

console.log(`- Heatmap Score: ${heatmap} (Expected ~50+)`);
console.log(`- Trust Score: ${trust} (Expected < 1.0 due to debt)`);
console.log(`- Suggestion: ${suggestion}`);

// 2. Inventory Intelligence Test
console.log('\n[2] Testing Inventory Intelligence...');
const item = {
    name: 'Sukuma Wiki',
    currentStock: 10,
    minStock: 20,
    unit: 'kg',
    isPerishable: true,
    shelfLifeDays: 3,
    lastStockUpdate: new Date(Date.now() - (1 * 24 * 60 * 60 * 1000))
};
const sales = [
    { itemId: 'item-1', qty: 5, date: new Date() },
    { itemId: 'item-1', qty: 5, date: new Date(Date.now() - (1 * 24 * 60 * 60 * 1000)) }
];

const daysLeft = InventoryIntelligence.predictDaysOfStockLeft(item, sales);
const stockAction = InventoryIntelligence.getStockAction(item, daysLeft);
const wastage = InventoryIntelligence.detectWastageAlert(item, daysLeft);

console.log(`- Days Left: ${daysLeft} (Expected ~14 based on total sales logic)`);
console.log(`- Action: ${stockAction}`);
console.log(`- Wastage Alert: ${wastage}`);

// 3. NL Foundation Test
console.log('\n[3] Testing NL Foundation...');
const queries = [
    'How much does Kamau owe?',
    'What is the stock of tomatoes?',
    'Show me my cash balance'
];

queries.forEach(q => {
    const cmd = NLFoundation.tokenize(q);
    console.log(`- Query: "${q}" -> Action: ${cmd.action}, Target: ${cmd.target || 'N/A'}`);
});

console.log('\n--- VERIFICATION COMPLETE ---');
