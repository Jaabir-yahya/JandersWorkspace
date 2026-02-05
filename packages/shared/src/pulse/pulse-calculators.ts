/**
 * Business Pulse Calculators
 * Real-time metrics for Nairobi business owners.
 * These are stateless calculators designed for high-performance dashboards.
 */

export interface PulseData {
    cash: number;
    mpesa: number;
    bank: number;
    totalDebtors: number;
    totalCreditors: number;
}

export class PulseCalculators {
    /**
     * Calculates the core "Money Pulse" from a set of account balances.
     */
    static calculateMoneyPulse(balances: Array<{ type: string; amount: number }>): {
        cashHand: number;
        mpesaBalance: number;
        bankBalance: number;
        totalLiquid: number;
    } {
        let cash = 0, mpesa = 0, bank = 0;

        balances.forEach(b => {
            switch (b.type.toUpperCase()) {
                case 'CASH': cash += b.amount; break;
                case 'MPESA': mpesa += b.amount; break;
                case 'BANK': bank += b.amount; break;
            }
        });

        return {
            cashHand: cash,
            mpesaBalance: mpesa,
            bankBalance: bank,
            totalLiquid: cash + mpesa + bank
        };
    }

    /**
     * Determines the "Collection Urgency" for debtors.
     */
    static getCollectionUrgency(debtors: Array<{ name: string; amount: number; lastPaymentDays: number }>) {
        return debtors
            .filter(d => d.amount > 0)
            .map(d => ({
                ...d,
                urgency: d.lastPaymentDays > 30 ? 'HIGH' : d.lastPaymentDays > 14 ? 'MEDIUM' : 'LOW',
                suggestedAction: d.lastPaymentDays > 14 ? `Call ${d.name}` : `Remind ${d.name} via WhatsApp`
            }))
            .sort((a, b) => b.amount - a.amount);
    }

    /**
     * Suggests stock reorders based on current vs min stock.
     */
    static getStockPulse(items: Array<{ name: string; current: number; min: number; unit: string }>) {
        return items
            .filter(i => i.current <= i.min)
            .map(i => ({
                name: i.name,
                shortage: i.min - i.current,
                unit: i.unit,
                urgency: i.current === 0 ? 'CRITICAL' : 'REORDER'
            }));
    }
}
