-- 2026-01-29: Add transaction_date field to transactions table
-- This field stores the actual economic event date, distinct from created_at

-- Add transaction_date column
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS transaction_date timestamptz DEFAULT now();

-- Create index for efficient date range queries
CREATE INDEX IF NOT EXISTS idx_transactions_transaction_date 
ON transactions(transaction_date);

-- Create composite index for tenant + date range queries (common for reporting)
CREATE INDEX IF NOT EXISTS idx_transactions_tenant_date 
ON transactions(tenant_id, transaction_date);

-- Create index on entity_id for entity history queries
CREATE INDEX IF NOT EXISTS idx_transactions_entity 
ON transactions(entity_id);

-- Create index on reference for search functionality
CREATE INDEX IF NOT EXISTS idx_transactions_reference 
ON transactions(reference);

-- Update existing records to use created_at as transaction_date
UPDATE transactions 
SET transaction_date = created_at 
WHERE transaction_date IS NULL;

-- Add NOT NULL constraint after backfill
ALTER TABLE transactions 
ALTER COLUMN transaction_date SET NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN transactions.transaction_date IS 'The actual economic event date (when the transaction occurred), distinct from created_at (when the record was created)';
