/**
 * Kenyan Shilling (KES) Formatting and VAT Calculations
 * Standard formatting for Kenyan currency and 16% VAT calculations
 */

// Standard VAT rate in Kenya
export const KENYA_VAT_RATE = 0.16;

// Currency formatting options
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
export function formatKes(
  amount: number,
  options: KesFormatOptions = {}
): string {
  const {
    symbol = true,
    decimals = 2,
    thousandsSeparator = ',',
    decimalSeparator = '.',
  } = options;

  if (isNaN(amount) || amount === null || amount === undefined) {
    return symbol ? 'Ksh 0.00' : '0.00';
  }

  // Format the number
  const absAmount = Math.abs(amount);
  const [wholePart, decimalPart] = absAmount.toFixed(decimals).split('.');
  
  // Add thousands separators
  const formattedWhole = wholePart.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    thousandsSeparator
  );

  // Build the result
  let result = formattedWhole;
  if (decimals > 0) {
    result += decimalSeparator + decimalPart;
  }

  // Add symbol and negative sign if needed
  const prefix = symbol ? 'Ksh ' : '';
  const negative = amount < 0 ? '-' : '';

  return `${negative}${prefix}${result}`;
}

/**
 * Parse a KES formatted string back to a number
 * @param formatted - The formatted string (e.g., "Ksh 1,234.56")
 * @returns The numeric value
 */
export function parseKes(formatted: string): number {
  if (!formatted || typeof formatted !== 'string') {
    return 0;
  }

  // Remove currency symbol and whitespace
  const cleaned = formatted
    .replace(/Ksh|KES|ksh|kes/gi, '')
    .replace(/,/g, '')
    .trim();

  const value = parseFloat(cleaned);
  return isNaN(value) ? 0 : value;
}

/**
 * Calculate VAT amount from a gross amount (inclusive of VAT)
 * @param grossAmount - The total amount including VAT
 * @param vatRate - The VAT rate (default 16%)
 * @returns The VAT amount
 */
export function calculateVatFromGross(
  grossAmount: number,
  vatRate: number = KENYA_VAT_RATE
): number {
  if (isNaN(grossAmount) || grossAmount <= 0) {
    return 0;
  }

  // VAT = Gross - (Gross / (1 + VAT rate))
  return grossAmount - grossAmount / (1 + vatRate);
}

/**
 * Calculate VAT amount from a net amount (exclusive of VAT)
 * @param netAmount - The amount before VAT
 * @param vatRate - The VAT rate (default 16%)
 * @returns The VAT amount
 */
export function calculateVatFromNet(
  netAmount: number,
  vatRate: number = KENYA_VAT_RATE
): number {
  if (isNaN(netAmount) || netAmount <= 0) {
    return 0;
  }

  return netAmount * vatRate;
}

/**
 * Calculate gross amount (with VAT) from net amount
 * @param netAmount - The amount before VAT
 * @param vatRate - The VAT rate (default 16%)
 * @returns The gross amount including VAT
 */
export function addVat(
  netAmount: number,
  vatRate: number = KENYA_VAT_RATE
): number {
  if (isNaN(netAmount)) {
    return 0;
  }

  return netAmount * (1 + vatRate);
}

/**
 * Calculate net amount (without VAT) from gross amount
 * @param grossAmount - The total amount including VAT
 * @param vatRate - The VAT rate (default 16%)
 * @returns The net amount before VAT
 */
export function removeVat(
  grossAmount: number,
  vatRate: number = KENYA_VAT_RATE
): number {
  if (isNaN(grossAmount) || grossAmount <= 0) {
    return 0;
  }

  return grossAmount / (1 + vatRate);
}

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
export function getVatBreakdown(
  grossAmount: number,
  vatRate: number = KENYA_VAT_RATE
): VatBreakdown {
  const netAmount = removeVat(grossAmount, vatRate);
  const vatAmount = calculateVatFromGross(grossAmount, vatRate);

  return {
    netAmount: Math.round(netAmount * 100) / 100,
    vatAmount: Math.round(vatAmount * 100) / 100,
    grossAmount: Math.round(grossAmount * 100) / 100,
    vatRate,
  };
}

/**
 * Check if an amount requires VAT registration
 * In Kenya, VAT registration is required for businesses with turnover > KES 5 million
 * @param annualTurnover - The annual turnover amount
 * @returns True if VAT registration is required
 */
export function requiresVatRegistration(annualTurnover: number): boolean {
  const VAT_THRESHOLD = 5000000; // KES 5 million
  return annualTurnover >= VAT_THRESHOLD;
}

/**
 * Round to nearest Kenyan currency denomination
 * @param amount - The amount to round
 * @returns Rounded amount
 */
export function roundToNearestShilling(amount: number): number {
  return Math.round(amount);
}

/**
 * Format amount in words (Kenyan style)
 * @param amount - The amount to convert
 * @returns Amount in words
 */
export function amountInWords(amount: number): string {
  if (isNaN(amount) || amount < 0) {
    return 'Invalid amount';
  }

  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertLessThanOneThousand(n: number): string {
    if (n === 0) return '';
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) {
      return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
    }
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + convertLessThanOneThousand(n % 100) : '');
  }

  if (amount === 0) return 'Zero Kenyan Shillings';

  const billions = Math.floor(amount / 1000000000);
  const millions = Math.floor((amount % 1000000000) / 1000000);
  const thousands = Math.floor((amount % 1000000) / 1000);
  const remainder = Math.floor(amount % 1000);
  const cents = Math.round((amount % 1) * 100);

  let result = '';

  if (billions > 0) {
    result += convertLessThanOneThousand(billions) + ' Billion ';
  }
  if (millions > 0) {
    result += convertLessThanOneThousand(millions) + ' Million ';
  }
  if (thousands > 0) {
    result += convertLessThanOneThousand(thousands) + ' Thousand ';
  }
  if (remainder > 0) {
    result += convertLessThanOneThousand(remainder);
  }

  result = result.trim() + ' Kenyan Shillings';

  if (cents > 0) {
    result += ' and ' + convertLessThanOneThousand(cents) + ' Cents';
  }

  return result;
}
