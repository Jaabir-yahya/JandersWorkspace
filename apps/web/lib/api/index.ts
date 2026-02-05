/**
 * API Modules
 * 
 * This file exports all API modules for the accounting platform.
 * Import from this file to access all API endpoints.
 */

export { dashboardApi } from './dashboard';
export { entitiesApi } from './entities';
export { inventoryApi } from './inventory';
export { suppliesApi } from './supplies';
export { transactionsApi } from './transactions';
export { invoicesApi } from './invoices';
export { reportingApi } from './reporting';
export { tenantsApi } from './tenants';

// Re-export types for convenience
export type { InventoryListParams, InventoryListResponse } from './inventory';
export type { TransactionListParams, TransactionListResponse } from './transactions';
export type { InvoiceListParams, InvoiceListResponse } from './invoices';
