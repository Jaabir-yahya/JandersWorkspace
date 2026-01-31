/**
 * Universal Invoice Schema - Phase 2 International Standardization
 * 
 * This interface defines the standard JSON structure that mimics QuickBooks (QBO)
 * and Kick Accounting formats for future integration.
 * 
 * Why this matters:
 * - QBO, Xero, and Kick all expect similar structures
 * - By standardizing internally, we eliminate complex mapping in integration layers
 * - One format to rule them all
 */

export interface UniversalInvoiceLineItem {
  /** Line item description (e.g., "Nike Shoes", "Consulting Service") */
  description: string;
  
  /** Quantity (items, hours, days) */
  quantity: number;
  
  /** Price per unit */
  unit_price: number;
  
  /** Account code following chart of accounts */
  account_code: string;
  
  /** Optional SKU for retail items */
  sku?: string;
  
  /** Line total (quantity * unit_price) */
  line_total: number;
}

export interface UniversalInvoice {
  /** Unique invoice identifier (UUID) */
  invoice_id: string;
  
  /** Customer/Entity display name */
  customer_name: string;
  
  /** Entity ID (UUID) */
  customer_id: string | null;
  
  /** Invoice date (economic event date) */
  invoice_date: string; // ISO 8601 format
  
  /** Currency code (ISO 4217) */
  currency: string; // e.g., 'KES', 'USD', 'NGN'
  
  /** Total invoice amount */
  total_amount: number;
  
  /** Array of line items */
  line_items: UniversalInvoiceLineItem[];
  
  /** Tax amount (if applicable) */
  tax_amount: number;
  
  /** Invoice status */
  status: 'DRAFT' | 'POSTED' | 'REVERSED' | 'RECONCILED' | 'VOIDED' | 'ARCHIVED';
  
  /** Payment status */
  payment_status: 'PENDING' | 'PARTIAL' | 'SETTLED' | 'FAILED' | 'CANCELLED';
  
  /** Reference number (e.g., invoice number) */
  reference?: string;
  
  /** Transaction type */
  type: 'RETAIL' | 'SERVICE' | 'RENTAL' | 'EXPENSE';
  
  /** Original transaction ID (for reversals) */
  reversed_transaction_id?: string;
  
  /** Metadata for extensibility */
  metadata?: Record<string, any>;
  
  /** Creation timestamp */
  created_at: string;
  
  /** Last update timestamp */
  updated_at?: string;
}

/**
 * Account Code Mapping
 * 
 * Maps internal transaction types to standard account codes
 * compatible with QBO/Kick chart of accounts.
 */
export const ACCOUNT_CODE_MAPPING: Record<string, string> = {
  'RETAIL': '200-SALES',
  'SERVICE': '400-SERVICE-INCOME',
  'RENTAL': '500-RENTAL-INCOME',
  'EXPENSE': '600-EXPENSES',
};

/**
 * Get account code for transaction type
 */
export function getAccountCode(type: string): string {
  return ACCOUNT_CODE_MAPPING[type] || '200-SALES';
}
