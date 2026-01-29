-- 2026-01-29: Consolidated migration for Phase 1

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  entity_id uuid NOT NULL,
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  total_amount bigint NOT NULL DEFAULT 0,
  currency_code text NOT NULL,
  status text NOT NULL DEFAULT 'DRAFT',
  type txn_type NOT NULL,
  payment_status text NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create transaction_lines table
CREATE TABLE IF NOT EXISTS transaction_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL REFERENCES transactions(id),
  description text,
  quantity numeric NOT NULL,
  unit_price numeric NOT NULL,
  total_line_amount numeric NOT NULL,
  account_code text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add transaction_date column to transactions (if not already added)
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS transaction_date TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Add reference column to transactions table
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS reference text;

-- Create or replace create_transaction function
CREATE OR REPLACE FUNCTION create_transaction(
  p_tenant_id uuid,
  p_entity_id uuid,
  p_txn_type text,
  p_currency_code text,
  p_lines jsonb
) RETURNS TABLE(
  id uuid,
  tenant_id uuid,
  entity_id uuid,
  type text,
  status text,
  total_amount bigint,
  currency_code text,
  created_at timestamptz
) LANGUAGE plpgsql AS $$
DECLARE
  txn_id uuid;
  l jsonb;
  qty numeric;
  unit numeric;
  line_total numeric;
BEGIN
  IF p_lines IS NULL OR jsonb_typeof(p_lines) <> 'array' OR jsonb_array_length(p_lines) = 0 THEN
    RAISE EXCEPTION 'lines must be a non-empty array';
  END IF;

  INSERT INTO transactions (tenant_id, entity_id, transaction_date, total_amount, currency_code, status, type, payment_status, created_at)
  VALUES (p_tenant_id, p_entity_id, now(), 0, p_currency_code, 'DRAFT', p_txn_type::txn_type, 'PENDING', now())
  RETURNING id INTO txn_id;

  FOR l IN SELECT * FROM jsonb_array_elements(p_lines) LOOP
    qty := (l->>'quantity')::numeric;
    unit := (l->>'unit_price')::numeric;
    IF qty IS NULL OR unit IS NULL THEN
      RAISE EXCEPTION 'each line must contain quantity and unit_price';
    END IF;
    line_total := (qty * unit)::numeric;

    INSERT INTO transaction_lines (transaction_id, description, quantity, unit_price, total_line_amount, account_code, metadata, created_at)
    VALUES (
      txn_id,
      l->>'description',
      qty,
      unit,
      line_total,
      l->>'account_code',
      COALESCE(l->'metadata','{}'::jsonb),
      now()
    );
  END LOOP;

  UPDATE transactions
  SET total_amount = (SELECT COALESCE(SUM(total_line_amount), 0) FROM transaction_lines WHERE transaction_id = txn_id)
  WHERE id = txn_id;

  RETURN QUERY SELECT * FROM transactions WHERE id = txn_id;
END;
$$;

-- Create txn_type enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'txn_type') THEN
    CREATE TYPE txn_type AS ENUM ('SALE', 'REFUND', 'TRANSFER');
  END IF;
END $$;

-- Create unique index on tenant_id and reference
CREATE UNIQUE INDEX IF NOT EXISTS ux_txn_tenant_ref ON transactions(tenant_id, reference) WHERE reference IS NOT NULL;

-- Ensure foreign key constraints
ALTER TABLE transactions
ADD CONSTRAINT fk_transactions_tenant FOREIGN KEY (tenant_id) REFERENCES users(tenant_id),
ADD CONSTRAINT fk_transactions_entity FOREIGN KEY (entity_id) REFERENCES entities(id),
ADD CONSTRAINT fk_transactions_created_by FOREIGN KEY (created_by_user_id) REFERENCES users(id);

ALTER TABLE payment_applications
ADD CONSTRAINT fk_payment_applications_payment FOREIGN KEY (payment_id) REFERENCES payments(id),
ADD CONSTRAINT fk_payment_applications_transaction FOREIGN KEY (transaction_id) REFERENCES transactions(id);

ALTER TABLE transaction_lines
ADD CONSTRAINT fk_transaction_lines_transaction FOREIGN KEY (transaction_id) REFERENCES transactions(id);

-- Create user-defined data types
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_status') THEN
    CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
    CREATE TYPE transaction_type AS ENUM ('purchase', 'refund');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    CREATE TYPE payment_status AS ENUM ('initiated', 'processed', 'failed');
  END IF;
END $$;

-- Add constraints for currency code validation
ALTER TABLE transactions
ADD CONSTRAINT valid_currency_code CHECK (currency_code IN ('USD', 'EUR', 'GBP'));

-- Add indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_transactions_tenant_id ON transactions (tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users (tenant_id);
CREATE INDEX IF NOT EXISTS idx_payment_applications_transaction_id ON payment_applications (transaction_id);

-- Ensure metadata validation
ALTER TABLE transactions
ADD CONSTRAINT metadata_has_required_keys CHECK (metadata ? 'key_name');

-- Ensure UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";