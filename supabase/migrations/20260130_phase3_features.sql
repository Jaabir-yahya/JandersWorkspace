-- 2026-01-30: Phase 3 Features Migration
-- Adds CRM features, split payments, file attachments, and enhanced transaction fields

-- ============================================
-- 1. UPDATE ENTITIES TABLE FOR CRM FEATURES
-- ============================================

ALTER TABLE entities 
ADD COLUMN IF NOT EXISTS linked_phones TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS alternate_names TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS trust_score INTEGER DEFAULT 50 CHECK (trust_score >= 0 AND trust_score <= 100);

-- ============================================
-- 2. UPDATE TRANSACTIONS TABLE FOR PHASE 3
-- ============================================

ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS linked_transaction_id UUID REFERENCES transactions(id),
ADD COLUMN IF NOT EXISTS due_date DATE,
ADD COLUMN IF NOT EXISTS context TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- ============================================
-- 3. CREATE PAYMENT_RECORDS TABLE FOR SPLIT PAYMENTS
-- ============================================

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

-- ============================================
-- 4. CREATE ATTACHMENTS TABLE FOR FILE STORAGE
-- ============================================

CREATE TABLE IF NOT EXISTS attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL CHECK (file_type IN ('IMAGE', 'PDF', 'AUDIO', 'OTHER')),
  file_url TEXT NOT NULL,
  file_size INTEGER,
  uploaded_by_user_id UUID NOT NULL REFERENCES users(id),
  uploaded_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  CONSTRAINT chk_attachment_parent CHECK (
    (entity_id IS NOT NULL) OR (transaction_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_attachments_entity ON attachments(entity_id);
CREATE INDEX IF NOT EXISTS idx_attachments_transaction ON attachments(transaction_id);

-- ============================================
-- 5. CREATE FUNCTION TO CALCULATE ENTITY BALANCE
-- ============================================

CREATE OR REPLACE FUNCTION calculate_entity_balance(p_entity_id UUID)
RETURNS TABLE(
  total_credit BIGINT,
  total_debit BIGINT,
  net_balance BIGINT
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(CASE WHEN type IN ('RETAIL', 'SERVICE', 'RENTAL') THEN total_amount ELSE 0 END), 0)::BIGINT as total_credit,
    COALESCE(SUM(CASE WHEN type = 'EXPENSE' THEN total_amount ELSE 0 END), 0)::BIGINT as total_debit,
    COALESCE(SUM(CASE 
      WHEN type IN ('RETAIL', 'SERVICE', 'RENTAL') THEN total_amount 
      WHEN type = 'EXPENSE' THEN -total_amount 
      ELSE 0 
    END), 0)::BIGINT as net_balance
  FROM transactions
  WHERE entity_id = p_entity_id
  AND status = 'POSTED';
END; $$;

-- ============================================
-- 6. CREATE FUNCTION TO SEARCH ENTITIES BY PHONE
-- ============================================

CREATE OR REPLACE FUNCTION search_entities_by_phone(p_phone TEXT, p_tenant_id UUID)
RETURNS TABLE(
  id UUID,
  display_name TEXT,
  phone_number TEXT,
  linked_phones TEXT[],
  type TEXT
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.display_name,
    e.phone_number,
    e.linked_phones,
    e.type
  FROM entities e
  WHERE e.tenant_id = p_tenant_id
  AND (
    e.phone_number = p_phone 
    OR p_phone = ANY(e.linked_phones)
  );
END; $$;

-- ============================================
-- 7. CREATE FUNCTION TO GET TOP CUSTOMERS
-- ============================================

CREATE OR REPLACE FUNCTION get_top_customers(p_tenant_id UUID, p_limit INTEGER DEFAULT 5)
RETURNS TABLE(
  entity_id UUID,
  display_name TEXT,
  total_amount BIGINT,
  transaction_count BIGINT
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.entity_id,
    e.display_name,
    COALESCE(SUM(t.total_amount), 0)::BIGINT as total_amount,
    COUNT(t.id)::BIGINT as transaction_count
  FROM transactions t
  JOIN entities e ON t.entity_id = e.id
  WHERE t.tenant_id = p_tenant_id
  AND t.status = 'POSTED'
  AND t.type IN ('RETAIL', 'SERVICE', 'RENTAL')
  GROUP BY t.entity_id, e.display_name
  ORDER BY total_amount DESC
  LIMIT p_limit;
END; $$;

-- ============================================
-- 8. CREATE FUNCTION TO GET ENTITY 360 VIEW
-- ============================================

CREATE OR REPLACE FUNCTION get_entity_360_view(p_entity_id UUID)
RETURNS TABLE(
  entity_id UUID,
  display_name TEXT,
  phone_number TEXT,
  linked_phones TEXT[],
  alternate_names TEXT[],
  location TEXT,
  notes TEXT,
  trust_score INTEGER,
  entity_type TEXT,
  total_credit BIGINT,
  total_debit BIGINT,
  net_balance BIGINT,
  recent_transactions JSONB,
  attachments_count BIGINT
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  WITH entity_balance AS (
    SELECT * FROM calculate_entity_balance(p_entity_id)
  ),
  recent_txns AS (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', t.id,
        'type', t.type,
        'status', t.status,
        'total_amount', t.total_amount,
        'transaction_date', t.transaction_date,
        'reference', t.reference
      ) ORDER BY t.transaction_date DESC
    ) as txns
    FROM transactions t
    WHERE t.entity_id = p_entity_id
    LIMIT 10
  ),
  attachment_count AS (
    SELECT COUNT(*) as cnt FROM attachments WHERE entity_id = p_entity_id
  )
  SELECT 
    e.id,
    e.display_name,
    e.phone_number,
    e.linked_phones,
    e.alternate_names,
    e.location,
    e.notes,
    e.trust_score,
    e.type,
    eb.total_credit,
    eb.total_debit,
    eb.net_balance,
    COALESCE(rt.txns, '[]'::jsonb),
    ac.cnt
  FROM entities e
  CROSS JOIN entity_balance eb
  CROSS JOIN recent_txns rt
  CROSS JOIN attachment_count ac
  WHERE e.id = p_entity_id;
END; $$;

-- ============================================
-- 9. UPDATE CREATE_TRANSACTION FUNCTION TO HANDLE PHASE 3 FIELDS
-- ============================================

CREATE OR REPLACE FUNCTION create_transaction(
  p_tenant_id UUID,
  p_entity_id UUID,
  p_created_by_user_id UUID,
  p_txn_type TEXT,
  p_currency_code TEXT,
  p_lines JSONB,
  p_reference TEXT DEFAULT NULL,
  p_due_date DATE DEFAULT NULL,
  p_context TEXT DEFAULT NULL,
  p_tags TEXT[] DEFAULT '{}',
  p_payment_records JSONB DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  tenant_id UUID,
  entity_id UUID,
  type TEXT,
  status TEXT,
  total_amount BIGINT,
  currency_code TEXT,
  reference TEXT,
  due_date DATE,
  context TEXT,
  tags TEXT[],
  payment_status TEXT,
  created_at TIMESTAMPTZ
) LANGUAGE plpgsql AS $$
DECLARE
  txn_id UUID;
  l JSONB;
  qty NUMERIC;
  unit NUMERIC;
  line_total NUMERIC;
  total_amt BIGINT;
  initial_payment_status TEXT := 'PENDING';
BEGIN
  IF p_lines IS NULL OR jsonb_typeof(p_lines) <> 'array' OR jsonb_array_length(p_lines) = 0 THEN
    RAISE EXCEPTION 'lines must be a non-empty array';
  END IF;

  -- Determine initial payment status based on due_date
  IF p_due_date IS NOT NULL THEN
    initial_payment_status := 'CREDIT';
  END IF;

  INSERT INTO transactions (
    tenant_id, entity_id, created_by_user_id, transaction_date, total_amount, 
    currency_code, status, type, payment_status, reference, due_date, context, tags, created_at
  ) VALUES (
    p_tenant_id, p_entity_id, p_created_by_user_id, now(), 0, 
    p_currency_code, 'DRAFT', p_txn_type::txn_type, initial_payment_status, 
    p_reference, p_due_date, p_context, p_tags, now()
  )
  RETURNING transactions.id INTO txn_id;

  FOR l IN SELECT * FROM jsonb_array_elements(p_lines) LOOP
    qty := (l->>'quantity')::numeric;
    unit := (l->>'unit_price')::numeric;
    IF qty IS NULL OR unit IS NULL THEN
      RAISE EXCEPTION 'each line must contain quantity and unit_price';
    END IF;
    line_total := (qty * unit)::numeric;

    INSERT INTO transaction_lines (
      transaction_id, description, quantity, unit_price, total_line_amount, 
      account_code, sku, metadata, created_at
    ) VALUES (
      txn_id,
      l->>'description',
      qty,
      unit,
      line_total,
      COALESCE(l->>'account_code', 'SALES'),
      l->>'sku',
      COALESCE(l->'metadata','{}'::jsonb),
      now()
    );
  END LOOP;

  -- Calculate total
  SELECT COALESCE(SUM(total_line_amount), 0)::BIGINT INTO total_amt
  FROM transaction_lines 
  WHERE transaction_id = txn_id;

  UPDATE transactions
  SET total_amount = total_amt
  WHERE id = txn_id;

  -- Insert payment records if provided
  IF p_payment_records IS NOT NULL AND jsonb_typeof(p_payment_records) = 'array' THEN
    INSERT INTO payment_records (transaction_id, method, amount, reference, paid_at, metadata)
    SELECT 
      txn_id,
      pr->>'method',
      (pr->>'amount')::INTEGER,
      pr->>'reference',
      COALESCE((pr->>'paid_at')::TIMESTAMP, NOW()),
      '{}'::JSONB
    FROM jsonb_array_elements(p_payment_records) pr;

    -- Update payment status based on total payments
    DECLARE
      total_paid BIGINT;
    BEGIN
      SELECT COALESCE(SUM(amount), 0) INTO total_paid
      FROM payment_records
      WHERE transaction_id = txn_id;

      IF total_paid >= total_amt THEN
        UPDATE transactions SET payment_status = 'PAID' WHERE id = txn_id;
      ELSIF total_paid > 0 THEN
        UPDATE transactions SET payment_status = 'PARTIAL' WHERE id = txn_id;
      END IF;
    END;
  END IF;

  RETURN QUERY SELECT 
    t.id, t.tenant_id, t.entity_id, t.type::TEXT, t.status::TEXT, t.total_amount, 
    t.currency_code, t.reference, t.due_date, t.context, t.tags, t.payment_status::TEXT, t.created_at
  FROM transactions t
  WHERE t.id = txn_id;
END; $$;

-- ============================================
-- 10. CREATE STORAGE BUCKET FOR ATTACHMENTS
-- ============================================

-- Note: This needs to be run via Supabase dashboard or API
-- INSERT INTO storage.buckets (id, name, public) VALUES ('attachments', 'attachments', true);

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify all columns exist
SELECT 'entities.linked_phones exists' as check FROM information_schema.columns WHERE table_name = 'entities' AND column_name = 'linked_phones'
UNION ALL
SELECT 'entities.trust_score exists' FROM information_schema.columns WHERE table_name = 'entities' AND column_name = 'trust_score'
UNION ALL
SELECT 'transactions.due_date exists' FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'due_date'
UNION ALL
SELECT 'transactions.context exists' FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'context'
UNION ALL
SELECT 'payment_records table exists' FROM information_schema.tables WHERE table_name = 'payment_records'
UNION ALL
SELECT 'attachments table exists' FROM information_schema.tables WHERE table_name = 'attachments';