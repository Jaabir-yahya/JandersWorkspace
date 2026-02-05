"use strict";
/**
 * Kenyan Data Cleaner
 * Transaction cleaning pipeline for Kenyan business context
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.kenyanDataCleaner = exports.KenyanDataCleaner = exports.KENYAN_TRANSACTION_CATEGORIES = void 0;
const kes_formatters_1 = require("../kenya/kes-formatters");
/**
 * Kenyan transaction categories
 */
exports.KENYAN_TRANSACTION_CATEGORIES = {
    // Income categories
    sales: { name: 'Sales', swahiliName: 'Mauzo', type: 'income' },
    services: { name: 'Services', swahiliName: 'Huduma', type: 'income' },
    mpesa_received: { name: 'M-Pesa Received', swahiliName: 'M-Pesa Iliyopokelewa', type: 'income' },
    bank_deposit: { name: 'Bank Deposit', swahiliName: 'Amana ya Benki', type: 'income' },
    refund: { name: 'Refund', swahiliName: 'Rejesha', type: 'income' },
    // Expense categories
    inventory: { name: 'Inventory/Purchases', swahiliName: 'Malipo ya Bidhaa', type: 'expense' },
    rent: { name: 'Rent', swahiliName: 'Kodi', type: 'expense' },
    utilities: { name: 'Utilities', swahiliName: 'Huduma za Umeme na Maji', type: 'expense' },
    salaries: { name: 'Salaries & Wages', swahiliName: 'Mishahara', type: 'expense' },
    transport: { name: 'Transport', swahiliName: 'Usafiri', type: 'expense' },
    fuel: { name: 'Fuel', swahiliName: 'Mafuta', type: 'expense' },
    airtime: { name: 'Airtime', swahiliName: 'Muda wa Maongezi', type: 'expense' },
    internet: { name: 'Internet', swahiliName: 'Intaneti', type: 'expense' },
    mpesa_sent: { name: 'M-Pesa Sent', swahiliName: 'M-Pesa Iliyotumwa', type: 'expense' },
    bank_withdrawal: { name: 'Bank Withdrawal', swahiliName: 'Kutoa Benki', type: 'expense' },
    marketing: { name: 'Marketing', swahiliName: 'Utangazaji', type: 'expense' },
    repairs: { name: 'Repairs & Maintenance', swahiliName: 'Matengenezo', type: 'expense' },
    licenses: { name: 'Licenses & Permits', swahiliName: 'Leseni', type: 'expense' },
    professional_services: { name: 'Professional Services', swahiliName: 'Huduma za Kitaalamu', type: 'expense' },
    meals: { name: 'Meals & Entertainment', swahiliName: 'Chakula na Burudani', type: 'expense' },
    supplies: { name: 'Office Supplies', swahiliName: 'Vifaa vya Ofisi', type: 'expense' },
    // Transfer categories
    transfer: { name: 'Transfer', swahiliName: 'Uhamisho', type: 'transfer' },
    unknown: { name: 'Unknown', swahiliName: 'Haijulikani', type: 'unknown' },
};
/**
 * Common Kenyan business keywords for categorization
 */
const CATEGORY_KEYWORDS = {
    sales: ['sale', 'sold', 'payment received', 'customer', 'mauzo', 'mnunuzi'],
    services: ['service', 'consulting', 'consultation', 'fee', 'huduma', 'ushauri'],
    mpesa_received: ['mpesa received', 'you have received', 'imepokelewa', 'mpesa in'],
    bank_deposit: ['deposit', 'bank transfer in', 'wire in'],
    refund: ['refund', 'reversal', 'returned'],
    inventory: ['purchase', 'stock', 'inventory', 'goods', 'bidhaa', 'stock'],
    rent: ['rent', 'lease', 'kodi', 'nyumba'],
    utilities: ['kplc', 'nairobi water', 'token', 'electricity', 'water bill', 'umeme', 'maji'],
    salaries: ['salary', 'wage', 'payroll', 'mshahara', 'mishahara'],
    transport: ['uber', 'bolt', 'taxify', 'matatu', 'bus fare', 'boda', 'taxi'],
    fuel: ['shell', 'total', 'rubis', 'petrol', 'diesel', 'fuel', 'mafuta', 'petrol station'],
    airtime: ['airtime', 'safaricom', 'airtel', 'telkom', 'credit', 'muda wa maongezi'],
    internet: ['wifi', 'internet', 'faiba', 'zuku', 'safaricom home', 'home fibre'],
    mpesa_sent: ['mpesa sent', 'sent to', 'paid to', 'imetumwa', 'mpesa out'],
    bank_withdrawal: ['withdrawal', 'atm', 'bank transfer out', 'wire out'],
    marketing: ['advertising', 'marketing', 'facebook ads', 'google ads', 'promotion', 'utangazaji'],
    repairs: ['repair', 'maintenance', 'service', 'fix', 'matengenezo'],
    licenses: ['license', 'permit', 'business permit', 'trade license', 'leseni'],
    professional_services: ['accountant', 'lawyer', 'audit', 'legal', 'consultant'],
    meals: ['restaurant', 'food', 'lunch', 'dinner', 'coffee', 'chakula'],
    supplies: ['stationery', 'office', 'printer', 'paper', 'ink', 'vifaa'],
    transfer: ['transfer', 'move', 'between accounts', 'uhamisho'],
};
/**
 * Kenyan Data Cleaner class
 * Cleans and standardizes transactions for Kenyan business context
 */
class KenyanDataCleaner {
    constructor() {
        this.version = '1.0.0';
        this.vatThreshold = 5000000; // KES 5 million
    }
    /**
     * Clean a transaction for export
     * @param transaction - The raw transaction to clean
     * @returns Cleaned transaction
     */
    async cleanTransactionForExport(transaction) {
        const flags = [];
        const confidence = this.calculateConfidence(transaction);
        // Standardize amount
        const standardizedAmount = this.standardizeAmount(transaction.amount, transaction.currency);
        // Categorize using Kenyan context
        const category = this.categorizeKenyanTransaction(transaction.description);
        // Calculate VAT
        const vat = this.calculateVAT(standardizedAmount, category.type);
        // Clean contact name
        const contact = this.cleanContactName(transaction.contact || transaction.phoneNumber || 'Unknown');
        const contactType = this.determineContactType(contact, transaction.phoneNumber);
        // Determine if informal sector
        const isInformal = this.isInformalSector(transaction);
        // Check if common Kenyan transaction
        const commonInKenya = this.isCommonKenyanTransaction(transaction);
        // Check if requires VAT
        const requiresVAT = this.requiresVAT(standardizedAmount);
        // Check if recurring
        const isRecurring = this.isLikelyRecurring(transaction.description);
        return {
            id: transaction.id,
            originalAmount: transaction.amount,
            standardizedAmount,
            currency: transaction.currency.toUpperCase(),
            category: category.name,
            subCategory: category.swahiliName,
            vat,
            contact,
            contactType,
            timestamp: transaction.timestamp,
            description: this.cleanDescription(transaction.description),
            source: transaction.source,
            context: {
                isInformal,
                commonInKenya,
                requiresVAT,
                isRecurring,
            },
            metadata: {
                cleanedAt: new Date(),
                cleanerVersion: this.version,
                confidence,
                flags,
                originalDescription: transaction.description,
            },
        };
    }
    /**
     * Standardize amount to KES
     * @param amount - The original amount
     * @param currency - The currency code
     * @returns Standardized amount in KES
     */
    standardizeAmount(amount, currency) {
        const upperCurrency = currency.toUpperCase();
        // If already KES, return as is
        if (upperCurrency === 'KES' || upperCurrency === 'KSH') {
            return Math.abs(amount);
        }
        // TODO: Implement currency conversion if needed
        // For now, assume amount is in KES for Kenyan context
        return Math.abs(amount);
    }
    /**
     * Categorize transaction using Kenyan context
     * @param description - The transaction description
     * @returns Category information
     */
    categorizeKenyanTransaction(description) {
        const lowerDesc = description.toLowerCase();
        for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
            for (const keyword of keywords) {
                if (lowerDesc.includes(keyword.toLowerCase())) {
                    return exports.KENYAN_TRANSACTION_CATEGORIES[category] || exports.KENYAN_TRANSACTION_CATEGORIES.unknown;
                }
            }
        }
        return exports.KENYAN_TRANSACTION_CATEGORIES.unknown;
    }
    /**
     * Calculate VAT for a transaction
     * @param amount - The transaction amount
     * @param type - The transaction type
     * @returns VAT breakdown or null
     */
    calculateVAT(amount, type) {
        // Only calculate VAT for income/expense transactions
        if (type === 'transfer' || type === 'unknown') {
            return null;
        }
        // Assume amount includes VAT (common in Kenyan M-Pesa transactions)
        return {
            netAmount: (0, kes_formatters_1.removeVat)(amount),
            vatAmount: (0, kes_formatters_1.calculateVatFromGross)(amount),
            grossAmount: amount,
            vatRate: 0.16,
        };
    }
    /**
     * Clean contact name
     * @param contact - The raw contact name
     * @returns Cleaned contact name
     */
    cleanContactName(contact) {
        if (!contact || contact === 'Unknown') {
            return 'Unknown';
        }
        return contact
            .trim()
            .replace(/\s+/g, ' ') // Normalize whitespace
            .replace(/[^\w\s\-']/g, '') // Remove special characters except hyphens and apostrophes
            .replace(/\b\w/g, (char) => char.toUpperCase()); // Title case
    }
    /**
     * Determine contact type
     * @param contact - The contact name
     * @param phoneNumber - Optional phone number
     * @returns Contact type
     */
    determineContactType(contact, phoneNumber) {
        if (!contact || contact === 'Unknown') {
            return 'unknown';
        }
        // Check for business indicators
        const businessIndicators = [
            'ltd', 'limited', 'company', 'co', 'enterprises', 'solutions',
            'services', 'supplies', 'traders', 'hardware', 'shop', 'store',
            'restaurant', 'hotel', 'pharmacy', 'clinic', 'hospital',
            'school', 'college', 'university', 'institute',
        ];
        const lowerContact = contact.toLowerCase();
        for (const indicator of businessIndicators) {
            if (lowerContact.includes(indicator)) {
                return 'business';
            }
        }
        // If it has a phone number, likely an individual
        if (phoneNumber) {
            return 'individual';
        }
        return 'unknown';
    }
    /**
     * Check if transaction is from informal sector
     * @param transaction - The transaction
     * @returns True if likely informal sector
     */
    isInformalSector(transaction) {
        const informalIndicators = [
            'mama mboga',
            'boda boda',
            'matatu',
            'kibanda',
            'hawker',
            'vendor',
            'cash',
            'no receipt',
        ];
        const lowerDesc = transaction.description.toLowerCase();
        return informalIndicators.some((indicator) => lowerDesc.includes(indicator));
    }
    /**
     * Check if transaction is common in Kenya
     * @param transaction - The transaction
     * @returns True if common Kenyan transaction
     */
    isCommonKenyanTransaction(transaction) {
        const commonPatterns = [
            'mpesa',
            'safaricom',
            'kplc',
            'nairobi water',
            'equity',
            'kcb',
            'coop',
            'absa',
            'stanbic',
            'ncba',
            'airtel',
            'telkom',
            'faiba',
            'zuku',
        ];
        const lowerDesc = transaction.description.toLowerCase();
        const lowerSource = transaction.source.toLowerCase();
        return commonPatterns.some((pattern) => lowerDesc.includes(pattern) || lowerSource.includes(pattern));
    }
    /**
     * Check if transaction requires VAT
     * @param amount - The transaction amount
     * @returns True if VAT should be calculated
     */
    requiresVAT(amount) {
        // VAT applies to most transactions above a certain threshold
        // In practice, this would check business registration status
        return amount > 1000; // Simplified threshold
    }
    /**
     * Check if transaction is likely recurring
     * @param description - The transaction description
     * @returns True if likely recurring
     */
    isLikelyRecurring(description) {
        const recurringKeywords = [
            'subscription',
            'monthly',
            'rent',
            'salary',
            'subscription',
            'recurring',
            'standing order',
            'direct debit',
        ];
        const lowerDesc = description.toLowerCase();
        return recurringKeywords.some((keyword) => lowerDesc.includes(keyword));
    }
    /**
     * Clean description text
     * @param description - The raw description
     * @returns Cleaned description
     */
    cleanDescription(description) {
        return description
            .trim()
            .replace(/\s+/g, ' ') // Normalize whitespace
            .substring(0, 255); // Limit length
    }
    /**
     * Calculate confidence score for cleaning
     * @param transaction - The transaction
     * @returns Confidence score (0-1)
     */
    calculateConfidence(transaction) {
        let score = 0.5; // Base score
        // Increase confidence for known sources
        const trustedSources = ['mpesa', 'bank', 'quickbooks', 'xero'];
        if (trustedSources.some((s) => transaction.source.toLowerCase().includes(s))) {
            score += 0.2;
        }
        // Increase confidence if amount is reasonable
        if (transaction.amount > 0 && transaction.amount < 10000000) {
            score += 0.1;
        }
        // Increase confidence if description is meaningful
        if (transaction.description && transaction.description.length > 5) {
            score += 0.1;
        }
        // Increase confidence if contact info is present
        if (transaction.contact || transaction.phoneNumber) {
            score += 0.1;
        }
        return Math.min(score, 1.0);
    }
    /**
     * Clean multiple transactions
     * @param transactions - Array of raw transactions
     * @returns Array of cleaned transactions
     */
    async cleanTransactions(transactions) {
        const cleaned = [];
        for (const transaction of transactions) {
            try {
                const cleanedTx = await this.cleanTransactionForExport(transaction);
                cleaned.push(cleanedTx);
            }
            catch (error) {
                // Log error but continue processing
                console.error(`Failed to clean transaction ${transaction.id}:`, error);
            }
        }
        return cleaned;
    }
}
exports.KenyanDataCleaner = KenyanDataCleaner;
// Export singleton instance
exports.kenyanDataCleaner = new KenyanDataCleaner();
