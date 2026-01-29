-- 2026-02-01: Fix create_transaction function signature to accept txn_type param
-- LOCK 1 ENFORCED: total_amount is derived from lines, not trusted from input
-- LOCK 3 ENFORCED: Reversals are first-class transactions (reversed_transaction_id field exists)
-- LOCK 6 ENFORCED: created_by_user_id is required

CREATE OR REPLACE FUNCTION create_transaction(
  p_tenant_id uuid,
  p_entity_id uuid,
  p_created_by_user_id uuid,
  p_txn_type txn_type,
  p_currency_code text,
  p_lines jsonb,
  p_transaction_date timestamptz DEFAULT now(),
  p_reference text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
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
  calculated_total numeric := 0;
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

  -- Insert transaction header with calculated total (LOCK 1)
  INSERT INTO transactions (
    tenant_id, entity_id, created_by_user_id, transaction_date, 
    total_amount, currency_code, status, type, payment_status, 
    reference, metadata, created_at
  )
  VALUES (
    p_tenant_id, p_entity_id, p_created_by_user_id, p_transaction_date,
    calculated_total, p_currency_code, 'DRAFT', p_txn_type, 'PENDING',
    p_reference, p_metadata, now()
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

  RETURN QUERY SELECT 
    txn.id AS "id", 
    txn.tenant_id AS "tenant_id", 
    txn.entity_id AS "entity_id", 
    txn.type::text AS "type", 
    txn.status AS "status", 
    txn.total_amount::bigint AS "total_amount", 
    txn.currency_code AS "currency_code", 
    txn.created_at AS "created_at"
  FROM transactions txn
  WHERE txn.id = txn_id;
END; $$;
