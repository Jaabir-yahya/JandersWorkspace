-- 2026-01-31: Add transaction_date column to transactions

ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS transaction_date TIMESTAMP WITH TIME ZONE DEFAULT now();
