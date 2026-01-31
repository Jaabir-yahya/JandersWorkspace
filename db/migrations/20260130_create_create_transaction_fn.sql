-- 2026-01-30: Create function to atomically insert transactions and lines

-- This function inserts a transaction (header) and its lines atomically and returns the created transaction row.
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
  unit bigint;
  line_total bigint;
BEGIN
  IF p_lines IS NULL OR jsonb_typeof(p_lines) <> 'array' OR jsonb_array_length(p_lines) = 0 THEN
    RAISE EXCEPTION 'lines must be a non-empty array';
  END IF;

  INSERT INTO transactions (tenant_id, entity_id, transaction_date, total_amount, currency_code, status, type, payment_status, created_at)
  VALUES (p_tenant_id, p_entity_id, now(), 0, p_currency_code, 'DRAFT'::txn_status, p_txn_type::txn_type, 'PENDING'::payment_status, now())
  RETURNING id INTO txn_id;

  FOR l IN SELECT * FROM jsonb_array_elements(p_lines) LOOP
    qty := (l->>'quantity')::numeric;
    unit := (l->>'unit_price')::bigint;
    IF qty IS NULL OR unit IS NULL THEN
      RAISE EXCEPTION 'each line must contain quantity and unit_price';
    END IF;
    line_total := (qty * unit)::bigint;

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

  -- Recalculate total
  UPDATE transactions SET total_amount = (
    SELECT COALESCE(SUM(total_line_amount),0) FROM transaction_lines WHERE transaction_id = txn_id
  ) WHERE id = txn_id;

  RETURN QUERY SELECT id, tenant_id, entity_id, type, status, total_amount, currency_code, created_at FROM transactions WHERE id = txn_id;
END; $$;

-- Grant execute to authenticated roles if applicable (Supabase uses authenticated role names)
-- GRANT EXECUTE ON FUNCTION create_transaction(uuid, uuid, text, text, jsonb) TO authenticated;
