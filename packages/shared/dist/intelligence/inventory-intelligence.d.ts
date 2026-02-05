/**
 * Inventory Intelligence Engine
 * Handles demand prediction, wastage alerts, and stock optimization for Nairobi businesses.
 */
export interface ItemSalesData {
    itemId: string;
    qty: number;
    date: Date;
}
export declare class InventoryIntelligence {
    /**
     * Predicts how many days of stock are left based on simple moving average sales.
     */
    static predictDaysOfStockLeft(item: {
        currentStock: number;
        unit: string;
    }, salesHistory: ItemSalesData[]): number;
    /**
     * Suggests replenishment actions.
     */
    static getStockAction(item: {
        name: string;
        currentStock: number;
        minStock?: number;
        unit: string;
    }, daysLeft: number): string;
    /**
     * Detects wastage patterns for perishables.
     */
    static detectWastageAlert(item: {
        name: string;
        isPerishable: boolean;
        shelfLifeDays?: number;
        lastStockUpdate?: Date;
    }, daysLeft: number): string | null;
}
//# sourceMappingURL=inventory-intelligence.d.ts.map