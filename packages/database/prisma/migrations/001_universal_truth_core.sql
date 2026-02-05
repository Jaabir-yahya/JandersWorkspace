-- Universal Truth Stored Procedures
-- Core accounting logic for atomic double-entry transactions

-- ============================================
-- Core Double-Entry Transaction Creation
-- ============================================

CREATE OR REPLACE PROCEDURE create_double_entry_transaction(
  p_tenant_id UUID,
  p_from_account_id UUID,
  p_to_account_id UUID,
  p_amount DECIMAL(18,4),
  p_reason_id UUID DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_reference TEXT DEFAULT NULL,
  p_created_by_user_id UUID DEFAULT NULL,
  OUT p_transaction_id UUID,
  OUT p_error_message TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_from_balance DECIMAL(18,4);
  v_to_balance DECIMAL(18,4);
  v_tenant_exists BOOLEAN;
  v_accounts_different BOOLEAN;
BEGIN
  -- Input validation
  IF p_from_account_id IS NULL OR p_to_account_id IS NULL OR p_amount IS NULL OR p_amount <= 0 THEN
    p_error_message := 'Invalid input: accounts and amount must be provided';
    RETURN;
  END IF;

  IF p_from_account_id = p_to_account_id THEN
    p_error_message := 'From and to accounts must be different';
    RETURN;
  END IF;

  -- Validate tenant exists and is active
  SELECT EXISTS(SELECT 1 FROM tenants WHERE id = p_tenant_id AND is_active = true) INTO v_tenant_exists;
  IF NOT v_tenant_exists THEN
    p_error_message := 'Invalid tenant';
    RETURN;
  END IF;

  -- Validate accounts belong to tenant and are different
  SELECT (a1.id IS NOT NULL AND a1.tenant_id = p_tenant_id) AND 
         (a2.id IS NOT NULL AND a2.tenant_id = p_tenant_id) AND 
         a1.id != a2.id
  INTO v_accounts_different
  FROM accounts a1, accounts a2
  WHERE a1.id = p_from_account_id AND a2.id = p_to_account_id;

  IF NOT v_accounts_different THEN
    p_error_message := 'Invalid accounts or same account specified';
    RETURN;
  END IF;

  -- Start atomic transaction with advisory lock
  PERFORM pg_advisory_xact_lock(hashtext('tenant_' || p_tenant_id::text));

  -- Lock both accounts to prevent concurrent modifications
  SELECT balance INTO v_from_balance FROM accounts 
  WHERE id = p_from_account_id AND tenant_id = p_tenant_id 
  FOR UPDATE;
  
  SELECT balance INTO v_to_balance FROM accounts 
  WHERE id = p_to_account_id AND tenant_id = p_tenant_id 
  FOR UPDATE;

  -- Validate sufficient funds (allow negative for some account types)
  SELECT EXISTS(SELECT 1 FROM accounts WHERE id = p_from_account_id AND 
    type NOT IN ('CREDIT', 'LIABILITY') AND tenant_id = p_tenant_id) 
  INTO v_accounts_different;

  IF v_accounts_different AND v_from_balance < p_amount THEN
    p_error_message := 'Insufficient funds in account ' || p_from_account_id;
    RETURN;
  END IF;

  -- Create transaction record
  INSERT INTO transactions (
    tenant_id, from_account_id, to_account_id, amount, date,
    reason_id, entity_id, notes, reference, created_by_user_id
  ) VALUES (
    p_tenant_id, p_from_account_id, p_to_account_id, p_amount, CURRENT_TIMESTAMP,
    p_reason_id, p_entity_id, p_notes, p_reference, p_created_by_user_id
  ) RETURNING id INTO p_transaction_id;

  -- Update account balances atomically
  UPDATE accounts SET balance = balance - p_amount, updated_at = CURRENT_TIMESTAMP
  WHERE id = p_from_account_id;
  
  UPDATE accounts SET balance = balance + p_amount, updated_at = CURRENT_TIMESTAMP
  WHERE id = p_to_account_id;

  -- Write audit log
  INSERT INTO audit_log (
    tenant_id, user_id, action, table_name, record_id,
    old_data, new_data
  ) VALUES (
    p_tenant_id, p_created_by_user_id, 'CREATE', 'transactions',
    p_transaction_id, NULL, jsonb_build_object(
      'from_account_id', p_from_account_id,
      'to_account_id', p_to_account_id,
      'amount', p_amount,
      'from_balance_before', v_from_balance,
      'to_balance_before', v_to_balance
    )
  );

  COMMIT;
EXCEPTION
  WHEN OTHERS THEN
    ROLLBACK;
    p_error_message := SQLERRM;
    RAISE;
END;
$$;

-- ============================================
-- Transaction Reversal (Never Delete)
-- ============================================

CREATE OR REPLACE PROCEDURE reverse_transaction(
  p_tenant_id UUID,
  p_transaction_id UUID,
  p_reverse_reason TEXT DEFAULT NULL,
  p_created_by_user_id UUID DEFAULT NULL,
  OUT p_reversal_id UUID,
  OUT p_error_message TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_original_transaction RECORD;
  v_reverse_reason_id UUID;
  v_tenant_exists BOOLEAN;
BEGIN
  -- Input validation
  IF p_transaction_id IS NULL THEN
    p_error_message := 'Transaction ID is required';
    RETURN;
  END IF;

  -- Validate tenant exists and is active
  SELECT EXISTS(SELECT 1 FROM tenants WHERE id = p_tenant_id AND is_active = true) INTO v_tenant_exists;
  IF NOT v_tenant_exists THEN
    p_error_message := 'Invalid tenant';
    RETURN;
  END IF;

  -- Get original transaction
  SELECT * INTO v_original_transaction 
  FROM transactions 
  WHERE id = p_transaction_id AND tenant_id = p_tenant_id;

  IF NOT FOUND THEN
    p_error_message := 'Original transaction not found';
    RETURN;
  END IF;

  IF v_original_transaction.reversal_id IS NOT NULL THEN
    p_error_message := 'Transaction already reversed';
    RETURN;
  END IF;

  -- Create or find "REVERSAL" reason
  SELECT id INTO v_reverse_reason_id 
  FROM transaction_reasons 
  WHERE tenant_id = p_tenant_id AND name = 'REVERSAL' AND type = 'ADJUSTMENT';

  IF v_reverse_reason_id IS NULL THEN
    INSERT INTO transaction_reasons (tenant_id, name, type) 
    VALUES (p_tenant_id, 'REVERSAL', 'ADJUSTMENT') 
    RETURNING id INTO v_reverse_reason_id;
  END IF;

  -- Create reversal transaction (inverse of original)
  INSERT INTO transactions (
    tenant_id, from_account_id, to_account_id, amount, date,
    reason_id, notes, reference, reversal_id, created_by_user_id
  ) VALUES (
    p_tenant_id, 
    v_original_transaction.to_account_id,  -- Reverse flow
    v_original_transaction.from_account_id,  -- Reverse flow
    v_original_transaction.amount,             -- Same amount
    CURRENT_TIMESTAMP,
    v_reverse_reason_id,
    COALESCE(p_reverse_reason, 'System reversal of: ' || COALESCE(v_original_transaction.reference, v_original_transaction.id)),
    'REV-' || COALESCE(v_original_transaction.reference, v_original_transaction.id),
    p_transaction_id,
    p_created_by_user_id
  ) RETURNING id INTO p_reversal_id;

  -- Write audit log
  INSERT INTO audit_log (
    tenant_id, user_id, action, table_name, record_id,
    old_data, new_data
  ) VALUES (
    p_tenant_id, p_created_by_user_id, 'REVERSE', 'transactions',
    p_transaction_id, row_to_json(v_original_transaction),
    jsonb_build_object(
      'reversal_id', p_reversal_id,
      'reverse_reason', p_reverse_reason,
      'original_amount', v_original_transaction.amount
    )
  );

EXCEPTION
  WHEN OTHERS THEN
    ROLLBACK;
    p_error_message := SQLERRM;
    RAISE;
END;
$$;

-- ============================================
-- Account Creation with Validation
-- ============================================

CREATE OR REPLACE PROCEDURE create_account(
  p_tenant_id UUID,
  p_name VARCHAR(255),
  p_type VARCHAR(50),
  p_currency VARCHAR(3) DEFAULT 'KES',
  p_created_by_user_id UUID DEFAULT NULL,
  OUT p_account_id UUID,
  OUT p_error_message TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_tenant_exists BOOLEAN;
  v_account_exists BOOLEAN;
BEGIN
  -- Input validation
  IF p_tenant_id IS NULL OR p_name IS NULL OR p_type IS NULL THEN
    p_error_message := 'Tenant, name, and type are required';
    RETURN;
  END IF;

  -- Validate tenant exists and is active
  SELECT EXISTS(SELECT 1 FROM tenants WHERE id = p_tenant_id AND is_active = true) INTO v_tenant_exists;
  IF NOT v_tenant_exists THEN
    p_error_message := 'Invalid tenant';
    RETURN;
  END IF;

  -- Check for duplicate account name within tenant
  SELECT EXISTS(SELECT 1 FROM accounts WHERE tenant_id = p_tenant_id AND LOWER(name) = LOWER(p_name)) INTO v_account_exists;
  IF v_account_exists THEN
    p_error_message := 'Account with this name already exists for tenant';
    RETURN;
  END IF;

  -- Create account
  INSERT INTO accounts (
    tenant_id, name, type, currency, created_by_user_id
  ) VALUES (
    p_tenant_id, p_name, p_type, p_currency, p_created_by_user_id
  ) RETURNING id INTO p_account_id;

  -- Write audit log
  INSERT INTO audit_log (
    tenant_id, user_id, action, table_name, record_id, new_data
  ) VALUES (
    p_tenant_id, p_created_by_user_id, 'CREATE', 'accounts',
    p_account_id, jsonb_build_object(
      'name', p_name,
      'type', p_type,
      'currency', p_currency
    )
  );

EXCEPTION
  WHEN OTHERS THEN
    p_error_message := SQLERRM;
END;
$$;

-- ============================================
-- Get Tenant Account Balances (Read-Only)
-- ============================================

CREATE OR REPLACE FUNCTION get_tenant_balances(
  p_tenant_id UUID,
  p_group_by VARCHAR(50) DEFAULT NULL
) RETURNS TABLE (
  account_id UUID,
  account_name VARCHAR,
  account_type VARCHAR,
  balance DECIMAL(18,4),
  currency VARCHAR(3)
)
LANGUAGE plpgsql
AS $$
DECLARE
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.name,
    a.type,
    a.balance,
    a.currency
  FROM accounts a
  WHERE a.tenant_id = p_tenant_id AND a.is_active = true
  ORDER BY 
    CASE 
      WHEN p_group_by = 'type' THEN a.type
      WHEN p_group_by = 'balance' THEN a.balance DESC
      ELSE a.name
    END;
END;
$$;

-- ============================================
-- Transaction Stream Query
-- ============================================

CREATE OR REPLACE FUNCTION get_transaction_stream(
  p_tenant_id UUID,
  p_from_date DATE DEFAULT NULL,
  p_to_date DATE DEFAULT NULL,
  p_account_id UUID DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_limit INT DEFAULT 100
) RETURNS TABLE (
  id UUID,
  date TIMESTAMPTZ,
  amount DECIMAL(18,4),
  from_account_name VARCHAR,
  to_account_name VARCHAR,
  reason_name VARCHAR,
  entity_name VARCHAR,
  notes TEXT,
  reference TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.date,
    t.amount,
    from_acc.name as from_account_name,
    to_acc.name as to_account_name,
    COALESCE(tr.name, 'No Reason') as reason_name,
    COALESCE(e.name, 'No Entity') as entity_name,
    t.notes,
    t.reference
  FROM transactions t
  LEFT JOIN accounts from_acc ON t.from_account_id = from_acc.id
  LEFT JOIN accounts to_acc ON t.to_account_id = to_acc.id
  LEFT JOIN transaction_reasons tr ON t.reason_id = tr.id
  LEFT JOIN entities e ON t.entity_id = e.id
  WHERE t.tenant_id = p_tenant_id
    AND (p_from_date IS NULL OR t.date >= p_from_date)
    AND (p_to_date IS NULL OR t.date <= p_to_date)
    AND (p_account_id IS NULL OR (t.from_account_id = p_account_id OR t.to_account_id = p_account_id))
    AND (p_entity_id IS NULL OR t.entity_id = p_entity_id)
  ORDER BY t.date DESC, t.created_at DESC
  LIMIT p_limit;
END;
$$;

-- ============================================
-- Audit Trail Query
-- ============================================

CREATE OR REPLACE FUNCTION get_audit_trail(
  p_tenant_id UUID,
  p_table_name VARCHAR(255) DEFAULT NULL,
  p_from_date DATE DEFAULT NULL,
  p_limit INT DEFAULT 100
) RETURNS TABLE (
  id UUID,
  action VARCHAR,
  table_name VARCHAR,
  record_id UUID,
  user_id UUID,
  old_data JSON,
  new_data JSON,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.id,
    al.action,
    al.table_name,
    al.record_id,
    al.user_id,
    al.old_data,
    al.new_data,
    al.created_at
  FROM audit_log al
  WHERE al.tenant_id = p_tenant_id
    AND (p_table_name IS NULL OR al.table_name = p_table_name)
    AND (p_from_date IS NULL OR al.created_at >= p_from_date)
  ORDER BY al.created_at DESC
  LIMIT p_limit;
END;
$$;

-- ============================================
-- Indexes for Performance
-- ============================================

-- Account indexes
CREATE INDEX IF NOT EXISTS idx_accounts_tenant_active ON accounts(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_accounts_tenant_type ON accounts(tenant_id, type);
CREATE INDEX IF NOT EXISTS idx_accounts_balance ON accounts(balance) WHERE is_active = true;

-- Transaction indexes
CREATE INDEX IF NOT EXISTS idx_transactions_tenant_date ON transactions(tenant_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_tenant_from ON transactions(tenant_id, from_account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_tenant_to ON transactions(tenant_id, to_account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_entity ON transactions(entity_id);
CREATE INDEX IF NOT EXISTS idx_transactions_reversal ON transactions(reversal_id);

-- Audit log indexes
CREATE INDEX IF NOT EXISTS idx_audit_tenant_action ON audit_log(tenant_id, action);
CREATE INDEX IF NOT EXISTS idx_audit_table_created ON audit_log(table_name, created_at DESC);

-- Proof indexes
CREATE INDEX IF NOT EXISTS idx_proofs_tenant_transaction ON proofs(tenant_id, transaction_id);
CREATE INDEX IF NOT EXISTS idx_proofs_type ON proofs(type);

-- Transaction reason indexes
CREATE INDEX IF NOT EXISTS idx_reasons_tenant_active ON transaction_reasons(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_reasons_tenant_type ON transaction_reasons(tenant_id, type);

-- ============================================
-- Grant Execute Permissions
-- ============================================

-- Grant execution rights to authenticated users
GRANT EXECUTE ON FUNCTION create_double_entry_transaction TO authenticated;
GRANT EXECUTE ON FUNCTION reverse_transaction TO authenticated;
GRANT EXECUTE ON FUNCTION create_account TO authenticated;
GRANT EXECUTE ON FUNCTION get_tenant_balances TO authenticated;
GRANT EXECUTE ON FUNCTION get_transaction_stream TO authenticated;
GRANT EXECUTE ON FUNCTION get_audit_trail TO authenticated;

-- Grant select rights for read operations
GRANT SELECT ON get_tenant_balances TO authenticated;
GRANT SELECT ON get_transaction_stream TO authenticated;
GRANT SELECT ON get_audit_trail TO authenticated;

COMMIT;