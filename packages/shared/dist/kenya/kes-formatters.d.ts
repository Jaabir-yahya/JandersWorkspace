/**
 * Kenyan Shilling (KES) Formatting and VAT Calculations
 * Standard formatting for Kenyan currency and 16% VAT calculations
 */
export declare const KENYA_VAT_RATE = 0.16;
export interface KesFormatOptions {
    symbol?: boolean;
    decimals?: number;
    thousandsSeparator?: string;
    decimalSeparator?: string;
}
/**
 * Format a number as Kenyan Shillings
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted KES string
 */
export declare function formatKes(amount: number, options?: KesFormatOptions): string;
/**
 * Parse a KES formatted string back to a number
 * @param formatted - The formatted string (e.g., "Ksh 1,234.56")
 * @returns The numeric value
 */
export declare function parseKes(formatted: string): number;
/**
 * Calculate VAT amount from a gross amount (inclusive of VAT)
 * @param grossAmount - The total amount including VAT
 * @param vatRate - The VAT rate (default 16%)
 * @returns The VAT amount
 */
export declare function calculateVatFromGross(grossAmount: number, vatRate?: number): number;
/**
 * Calculate VAT amount from a net amount (exclusive of VAT)
 * @param netAmount - The amount before VAT
 * @param vatRate - The VAT rate (default 16%)
 * @returns The VAT amount
 */
export declare function calculateVatFromNet(netAmount: number, vatRate?: number): number;
/**
 * Calculate gross amount (with VAT) from net amount
 * @param netAmount - The amount before VAT
 * @param vatRate - The VAT rate (default 16%)
 * @returns The gross amount including VAT
 */
export declare function addVat(netAmount: number, vatRate?: number): number;
/**
 * Calculate net amount (without VAT) from gross amount
 * @param grossAmount - The total amount including VAT
 * @param vatRate - The VAT rate (default 16%)
 * @returns The net amount before VAT
 */
export declare function removeVat(grossAmount: number, vatRate?: number): number;
/**
 * VAT breakdown for a transaction
 */
export interface VatBreakdown {
    netAmount: number;
    vatAmount: number;
    grossAmount: number;
    vatRate: number;
}
/**
 * Get complete VAT breakdown for a gross amount
 * @param grossAmount - The total amount including VAT
 * @param vatRate - The VAT rate (default 16%)
 * @returns Complete VAT breakdown
 */
export declare function getVatBreakdown(grossAmount: number, vatRate?: number): VatBreakdown;
/**
 * Check if an amount requires VAT registration
 * In Kenya, VAT registration is required for businesses with turnover > KES 5 million
 * @param annualTurnover - The annual turnover amount
 * @returns True if VAT registration is required
 */
export declare function requiresVatRegistration(annualTurnover: number): boolean;
/**
 * Round to nearest Kenyan currency denomination
 * @param amount - The amount to round
 * @returns Rounded amount
 */
export declare function roundToNearestShilling(amount: number): number;
/**
 * Format amount in words (Kenyan style)
 * @param amount - The amount to convert
 * @returns Amount in words
 */
export declare function amountInWords(amount: number): string;
//# sourceMappingURL=kes-formatters.d.ts.map