-- 2026-01-29: Add indexes for search functionality
-- These indexes support the "Google-like" search feature in Phase 2

-- Index for searching transaction descriptions (via transaction_lines)
CREATE INDEX IF NOT EXISTS idx_transaction_lines_description 
ON transaction_lines USING gin(to_tsvector('english', description));

-- Index for searching transaction references
CREATE INDEX IF NOT EXISTS idx_transactions_reference_search 
ON transactions USING gin(to_tsvector('english', reference));

-- Index for entity display_name search
CREATE INDEX IF NOT EXISTS idx_entities_display_name 
ON entities USING gin(to_tsvector('english', display_name));

-- Composite index for common query patterns
-- Used when filtering by tenant + status + date range
CREATE INDEX IF NOT EXISTS idx_transactions_tenant_status_date 
ON transactions(tenant_id, status, transaction_date DESC);

-- Index for payment status filtering (used in Reconciler view)
CREATE INDEX IF NOT EXISTS idx_transactions_payment_status 
ON transactions(payment_status) 
WHERE status = 'POSTED';
