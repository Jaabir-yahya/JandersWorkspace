-- 2026-02-02: Fix create_transaction function for full Phase 3 support
-- This update adds support for due_date, context, tags, and payment_records
-- LOCK 1 ENFORCED: total_amount is derived from lines, not trusted from input
-- LOCK 6 ENFORCED: created_by_user_id is required

-- First, ensure all Phase 3 columns exist
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS due_date DATE,
ADD COLUMN IF NOT EXISTS context TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Ensure payment_records table exists
CREATE TABLE IF NOT EXISTS payment_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  method VARCHAR(50) NOT NULL CHECK (method IN ('CASH', 'M-PESA', 'BANK_TRANSFER', 'CARD', 'CREDIT')),
  amount INTEGER NOT NULL CHECK (amount > 0),
  reference VARCHAR(255),
  paid_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_records_txn ON payment_records(transaction_id);

-- Drop and recreate the function with full Phase 3 support
CREATE OR REPLACE FUNCTION create_transaction(
  p_tenant_id uuid,
  p_entity_id uuid,
  p_created_by_user_id uuid,
  p_txn_type txn_type,
  p_currency_code text,
  p_lines jsonb,
  p_transaction_date timestamptz DEFAULT now(),
  p_reference text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb,
  p_due_date date DEFAULT NULL,
  p_context text DEFAULT NULL,
  p_tags text[] DEFAULT '{}',
  p_payment_records jsonb DEFAULT NULL
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
  pr jsonb;
  qty numeric;
  unit numeric;
  line_total numeric;
  calculated_total numeric := 0;
  payment_total integer := 0;
  pr_amount integer;
BEGIN
  -- Validate lines array
  IF p_lines IS NULL OR jsonb_typeof(p_lines) <> 'array' OR jsonb_array_length(p_lines) = 0 THEN
    RAISE EXCEPTION 'lines must be a non-empty array';
  END IF;

  -- Calculate total from lines before insert (LOCK 1: derived, not trusted)
  FOR l IN SELECT * FROM jsonb_array_elements(p_lines) LOOP
    qty := (l->>'quantity')::numeric;
    unit := (l->>'unit_price')::numeric;
    IF qty IS NULL OR unit IS NULL THEN
      RAISE EXCEPTION 'each line must contain quantity and unit_price';
    END IF;
    calculated_total := calculated_total + (qty * unit);
  END LOOP;

  -- Calculate payment total if payment_records provided
  IF p_payment_records IS NOT NULL AND jsonb_typeof(p_payment_records) = 'array' THEN
    FOR pr IN SELECT * FROM jsonb_array_elements(p_payment_records) LOOP
      pr_amount := (pr->>'amount')::integer;
      IF pr_amount IS NOT NULL THEN
        payment_total := payment_total + pr_amount;
      END IF;
    END LOOP;
    
    -- Validate payment total matches transaction total
    IF payment_total > calculated_total THEN
      RAISE EXCEPTION 'payment total (%) exceeds transaction total (%)', payment_total, calculated_total;
    END IF;
  END IF;

  -- Insert transaction header with calculated total (LOCK 1)
  INSERT INTO transactions (
    tenant_id, entity_id, created_by_user_id, transaction_date, 
    total_amount, currency_code, status, type, payment_status, 
    reference, metadata, due_date, context, tags, created_at
  )
  VALUES (
    p_tenant_id, p_entity_id, p_created_by_user_id, p_transaction_date,
    calculated_total, p_currency_code, 'DRAFT'::txn_status, p_txn_type, 
    CASE 
      WHEN payment_total = 0 THEN 'PENDING'::payment_status
      WHEN payment_total < calculated_total THEN 'PARTIAL'::payment_status
      ELSE 'SETTLED'::payment_status
    END,
    p_reference, p_metadata, p_due_date, p_context, COALESCE(p_tags, '{}'), now()
  )
  RETURNING id INTO txn_id;

  -- Insert transaction lines
  FOR l IN SELECT * FROM jsonb_array_elements(p_lines) LOOP
    qty := (l->>'quantity')::numeric;
    unit := (l->>'unit_price')::numeric;
    line_total := (qty * unit)::numeric;

    INSERT INTO transaction_lines (
      transaction_id, description, sku, quantity, unit_price, 
      total_line_amount, account_code, metadata, created_at
    )
    VALUES (
      txn_id,
      l->>'description',
      l->>'sku',
      qty,
      unit,
      line_total,
      COALESCE(l->>'account_code', '200-SALES'),
      COALESCE(l->'metadata','{}'::jsonb),
      now()
    );
  END LOOP;

  -- Insert payment records if provided
  IF p_payment_records IS NOT NULL AND jsonb_typeof(p_payment_records) = 'array' THEN
    FOR pr IN SELECT * FROM jsonb_array_elements(p_payment_records) LOOP
      INSERT INTO payment_records (
        transaction_id, method, amount, reference, paid_at, metadata, created_at
      )
      VALUES (
        txn_id,
        pr->>'method',
        (pr->>'amount')::integer,
        pr->>'reference',
        COALESCE((pr->>'paid_at')::timestamp, NOW()),
        COALESCE(pr->'metadata', '{}'::jsonb),
        now()
      );
    END LOOP;
  END IF;

  RETURN QUERY SELECT 
    txn.id AS "id", 
    txn.tenant_id AS "tenant_id", 
    txn.entity_id AS "entity_id", 
    txn.type::text AS "type", 
    txn.status::text AS "status", 
    txn.total_amount::bigint AS "total_amount", 
    txn.currency_code AS "currency_code", 
    txn.created_at AS "created_at"
  FROM transactions txn
  WHERE txn.id = txn_id;
END; $$;
