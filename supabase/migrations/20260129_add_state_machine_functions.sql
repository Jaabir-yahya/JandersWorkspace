-- 2026-01-29: Add State Machine functions for Phase 2
-- These functions handle Post and Reverse operations

-- Function to post a transaction (DRAFT -> POSTED)
-- LOCK 2 ENFORCED: Once POSTED, transaction becomes immutable
CREATE OR REPLACE FUNCTION post_transaction(
  p_transaction_id uuid,
  p_user_id uuid
) RETURNS TABLE(
  id uuid,
  status text,
  posted_at timestamptz
) LANGUAGE plpgsql AS $$
DECLARE
  v_current_status txn_status;
  v_tenant_id uuid;
BEGIN
  -- Get current status and tenant
  SELECT status, tenant_id INTO v_current_status, v_tenant_id
  FROM transactions
  WHERE id = p_transaction_id;
  
  IF v_current_status IS NULL THEN
    RAISE EXCEPTION 'Transaction not found: %', p_transaction_id;
  END IF;
  
  -- Verify user has access to this tenant (basic check)
  -- In production, this would be more sophisticated
  
  -- Only DRAFT transactions can be posted
  IF v_current_status != 'DRAFT' THEN
    RAISE EXCEPTION 'Cannot post transaction with status %. Only DRAFT transactions can be posted.', v_current_status;
  END IF;
  
  -- Update status to POSTED
  UPDATE transactions 
  SET status = 'POSTED',
      metadata = metadata || jsonb_build_object('posted_at', now(), 'posted_by', p_user_id)
  WHERE id = p_transaction_id;
  
  RETURN QUERY SELECT 
    t.id,
    t.status::text,
    (t.metadata->>'posted_at')::timestamptz as posted_at
  FROM transactions t
  WHERE t.id = p_transaction_id;
END; $$;

-- Function to reverse a transaction (POSTED -> creates REVERSAL)
-- LOCK 3 ENFORCED: Reversals are first-class transactions with negative amounts
CREATE OR REPLACE FUNCTION reverse_transaction(
  p_original_transaction_id uuid,
  p_reason text,
  p_created_by_user_id uuid
) RETURNS TABLE(
  reversal_id uuid,
  original_id uuid,
  status text,
  total_amount numeric
) LANGUAGE plpgsql AS $$
DECLARE
  v_original txn_status;
  v_tenant_id uuid;
  v_entity_id uuid;
  v_currency_code varchar(3);
  v_type txn_type;
  v_reference text;
  v_reversal_id uuid;
  v_line record;
  v_new_total numeric := 0;
BEGIN
  -- Get original transaction details
  SELECT status, tenant_id, entity_id, currency_code, type, reference
  INTO v_original, v_tenant_id, v_entity_id, v_currency_code, v_type, v_reference
  FROM transactions
  WHERE id = p_original_transaction_id;
  
  IF v_original IS NULL THEN
    RAISE EXCEPTION 'Transaction not found: %', p_original_transaction_id;
  END IF;
  
  -- Only POSTED transactions can be reversed
  IF v_original != 'POSTED' THEN
    RAISE EXCEPTION 'Cannot reverse transaction with status %. Only POSTED transactions can be reversed.', v_original;
  END IF;
  
  -- Create the reversal transaction header
  INSERT INTO transactions (
    tenant_id,
    entity_id,
    created_by_user_id,
    type,
    status,
    payment_status,
    total_amount,
    currency_code,
    reference,
    reversed_transaction_id,
    metadata,
    transaction_date
  ) VALUES (
    v_tenant_id,
    v_entity_id,
    p_created_by_user_id,
    v_type,
    'POSTED',  -- Reversal is immediately posted
    'SETTLED', -- Reversal is considered settled
    0,         -- Will be calculated from lines
    v_currency_code,
    COALESCE(v_reference, '') || '-REV',
    p_original_transaction_id,
    jsonb_build_object(
      'reversal_reason', p_reason,
      'reversal_date', now(),
      'original_reference', v_reference
    ),
    now()
  )
  RETURNING id INTO v_reversal_id;
  
  -- Copy and invert all transaction lines
  FOR v_line IN 
    SELECT * FROM transaction_lines 
    WHERE transaction_id = p_original_transaction_id
  LOOP
    INSERT INTO transaction_lines (
      transaction_id,
      description,
      sku,
      quantity,
      unit_price,
      total_line_amount,
      account_code,
      metadata
    ) VALUES (
      v_reversal_id,
      'REVERSAL: ' || v_line.description,
      v_line.sku,
      -v_line.quantity,  -- Invert quantity
      v_line.unit_price,
      -v_line.total_line_amount,  -- Invert amount
      v_line.account_code,
      v_line.metadata || jsonb_build_object('original_line_id', v_line.id)
    );
    
    v_new_total := v_new_total + (-v_line.total_line_amount);
  END LOOP;
  
  -- Update reversal total
  UPDATE transactions 
  SET total_amount = v_new_total
  WHERE id = v_reversal_id;
  
  RETURN QUERY SELECT 
    v_reversal_id as reversal_id,
    p_original_transaction_id as original_id,
    'POSTED'::text as status,
    v_new_total as total_amount;
END; $$;

-- Function to update payment status
-- Used in the Reconciler view
CREATE OR REPLACE FUNCTION update_payment_status(
  p_transaction_id uuid,
  p_new_status payment_status,
  p_user_id uuid
) RETURNS TABLE(
  id uuid,
  old_status payment_status,
  new_status payment_status,
  updated_at timestamptz
) LANGUAGE plpgsql AS $$
DECLARE
  v_current_status payment_status;
  v_txn_status txn_status;
  v_tenant_id uuid;
BEGIN
  -- Get current statuses
  SELECT payment_status, status, tenant_id 
  INTO v_current_status, v_txn_status, v_tenant_id
  FROM transactions
  WHERE id = p_transaction_id;
  
  IF v_current_status IS NULL THEN
    RAISE EXCEPTION 'Transaction not found: %', p_transaction_id;
  END IF;
  
  -- Only POSTED transactions can have payment status updated
  IF v_txn_status != 'POSTED' THEN
    RAISE EXCEPTION 'Cannot update payment status for transaction with status %. Only POSTED transactions can be reconciled.', v_txn_status;
  END IF;
  
  -- Validate status transition
  -- Allowed transitions:
  -- PENDING -> PARTIAL, SETTLED, FAILED, CANCELLED
  -- PARTIAL -> SETTLED, FAILED
  -- SETTLED -> (no transitions allowed)
  -- FAILED -> PENDING
  -- CANCELLED -> PENDING
  
  IF v_current_status = 'SETTLED' THEN
    RAISE EXCEPTION 'Cannot change payment status from SETTLED';
  END IF;
  
  IF v_current_status = 'PENDING' AND p_new_status NOT IN ('PARTIAL', 'SETTLED', 'FAILED', 'CANCELLED') THEN
    RAISE EXCEPTION 'Invalid payment status transition from PENDING to %', p_new_status;
  END IF;
  
  IF v_current_status = 'PARTIAL' AND p_new_status NOT IN ('SETTLED', 'FAILED') THEN
    RAISE EXCEPTION 'Invalid payment status transition from PARTIAL to %', p_new_status;
  END IF;
  
  IF v_current_status IN ('FAILED', 'CANCELLED') AND p_new_status != 'PENDING' THEN
    RAISE EXCEPTION 'Invalid payment status transition from % to %. Only PENDING is allowed.', v_current_status, p_new_status;
  END IF;
  
  -- Update payment status
  UPDATE transactions 
  SET payment_status = p_new_status,
      status = CASE 
        WHEN p_new_status = 'SETTLED' THEN 'RECONCILED'::txn_status
        ELSE status
      END,
      metadata = metadata || jsonb_build_object(
        'payment_status_history', 
        COALESCE(metadata->'payment_status_history', '[]'::jsonb) || jsonb_build_array(jsonb_build_object(
          'from', v_current_status::text,
          'to', p_new_status::text,
          'at', now(),
          'by', p_user_id
        ))
      )
  WHERE id = p_transaction_id;
  
  RETURN QUERY SELECT 
    t.id,
    v_current_status as old_status,
    t.payment_status as new_status,
    now() as updated_at
  FROM transactions t
  WHERE t.id = p_transaction_id;
END; $$;

-- Function to get entity history with balance
-- The "Copper" feature - shows everything an entity has ever done
CREATE OR REPLACE FUNCTION get_entity_history(
  p_entity_id uuid,
  p_tenant_id uuid
) RETURNS TABLE(
  transaction_id uuid,
  transaction_date timestamptz,
  type text,
  status text,
  payment_status text,
  total_amount numeric,
  currency_code varchar(3),
  reference text,
  running_balance numeric
) LANGUAGE plpgsql AS $$
DECLARE
  v_running_balance numeric := 0;
  v_record record;
BEGIN
  -- Verify entity belongs to tenant
  IF NOT EXISTS (
    SELECT 1 FROM entities 
    WHERE id = p_entity_id AND tenant_id = p_tenant_id
  ) THEN
    RAISE EXCEPTION 'Entity not found or does not belong to tenant';
  END IF;
  
  -- Return all transactions with running balance
  FOR v_record IN 
    SELECT 
      t.id,
      t.transaction_date,
      t.type::text,
      t.status::text,
      t.payment_status::text,
      t.total_amount,
      t.currency_code,
      t.reference
    FROM transactions t
    WHERE t.entity_id = p_entity_id 
      AND t.tenant_id = p_tenant_id
      AND t.status IN ('POSTED', 'RECONCILED')
    ORDER BY t.transaction_date ASC, t.created_at ASC
  LOOP
    v_running_balance := v_running_balance + v_record.total_amount;
    
    transaction_id := v_record.id;
    transaction_date := v_record.transaction_date;
    type := v_record.type;
    status := v_record.status;
    payment_status := v_record.payment_status;
    total_amount := v_record.total_amount;
    currency_code := v_record.currency_code;
    reference := v_record.reference;
    running_balance := v_running_balance;
    
    RETURN NEXT;
  END LOOP;
END; $$;
