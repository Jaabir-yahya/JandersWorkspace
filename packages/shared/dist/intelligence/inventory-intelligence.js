"use strict";
/**
 * Inventory Intelligence Engine
 * Handles demand prediction, wastage alerts, and stock optimization for Nairobi businesses.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryIntelligence = void 0;
class InventoryIntelligence {
    /**
     * Predicts how many days of stock are left based on simple moving average sales.
     */
    static predictDaysOfStockLeft(item, salesHistory) {
        if (salesHistory.length === 0)
            return 999; // Assume plenty if no sales history
        // Calculate daily average sales over the last 14 days
        const now = new Date();
        const fourteenDaysAgo = new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000));
        const recentSales = salesHistory.filter(s => new Date(s.date) >= fourteenDaysAgo);
        const totalQtySold = recentSales.reduce((sum, s) => sum + s.qty, 0);
        const dailyAverage = totalQtySold / 14;
        if (dailyAverage <= 0)
            return 999;
        return Math.floor(item.currentStock / dailyAverage);
    }
    /**
     * Suggests replenishment actions.
     */
    static getStockAction(item, daysLeft) {
        if (item.currentStock === 0) {
            return `CRITICAL: Out of ${item.name}. Restock immediately!`;
        }
        if (daysLeft <= 3) {
            return `LOW STOCK: ${item.name} will finish in ~${daysLeft} days. Buy more soon.`;
        }
        if (item.minStock && item.currentStock <= item.minStock) {
            return `REORDER: ${item.name} has hit its minimum level (${item.minStock} ${item.unit}).`;
        }
        return `${item.name} stock level is healthy.`;
    }
    /**
     * Detects wastage patterns for perishables.
     */
    static detectWastageAlert(item, daysLeft) {
        if (!item.isPerishable || !item.shelfLifeDays || !item.lastStockUpdate)
            return null;
        if (daysLeft > item.shelfLifeDays) {
            return `WASTAGE WARNING: ${item.name} is moving slower than its shelf life (${item.shelfLifeDays} days). Consider a discount.`;
        }
        return null;
    }
}
exports.InventoryIntelligence = InventoryIntelligence;
