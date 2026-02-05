-- Universal Truth Migration
-- This script safely merges existing schema with new Universal Truth model

-- ============================================
-- Step 1: Add Universal Truth Tables
-- ============================================

-- Add Account table (new core model)
CREATE TABLE IF NOT EXISTS accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- CASH, BANK, AGENT, INVENTORY, FX_FLOAT, CLEARING, TRUST
  balance DECIMAL(18,4) DEFAULT 0 CHECK (balance >= 0),
  currency VARCHAR(3) DEFAULT 'KES',
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add Transaction Reason table
CREATE TABLE IF NOT EXISTS transaction_reasons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- INCOME, EXPENSE, TRANSFER, ADJUSTMENT
  parent_id UUID DEFAULT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add Proof table
CREATE TABLE IF NOT EXISTS proofs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  transaction_id UUID DEFAULT NULL,
  type VARCHAR(50) NOT NULL, -- RECEIPT, INVOICE, SWIFT, UPLOAD, WHATSAPP, SCREENSHOT
  reference VARCHAR(255) DEFAULT NULL,
  metadata JSONB DEFAULT '{}',
  file_path TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add Audit Log table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID DEFAULT NULL,
  user_id UUID DEFAULT NULL,
  action VARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE, REVERSE, ADMIN_OVERRIDE
  table_name VARCHAR(255) DEFAULT NULL,
  record_id UUID DEFAULT NULL,
  old_data JSONB DEFAULT NULL,
  new_data JSONB DEFAULT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Step 2: Extend Existing Tables
-- ============================================

-- Add Universal Truth fields to existing tenants table
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS accounting_standard VARCHAR(20) DEFAULT 'SIMPLE',
ADD COLUMN IF NOT EXISTS is_admin_tenant BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS capabilities JSONB DEFAULT '{}';

-- Add Universal Truth fields to existing users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Add Universal Truth fields to existing entities table
ALTER TABLE entities 
ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'CONTACT',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add Universal Truth fields to existing transactions table
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS from_account_id UUID DEFAULT NULL,
ADD COLUMN IF NOT EXISTS to_account_id UUID DEFAULT NULL,
ADD COLUMN IF NOT EXISTS reason_id UUID DEFAULT NULL,
ADD COLUMN IF NOT EXISTS reversal_id UUID DEFAULT NULL,
ADD COLUMN IF NOT EXISTS created_by_user_id UUID DEFAULT NULL,
ADD COLUMN IF NOT EXISTS date TIMESTAMPTZ DEFAULT created_at;

-- ============================================
-- Step 3: Create Indexes for Performance
-- ============================================

-- Account indexes
CREATE INDEX IF NOT EXISTS idx_accounts_tenant_active ON accounts(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_accounts_tenant_type ON accounts(tenant_id, type);
CREATE INDEX IF NOT EXISTS idx_accounts_balance ON accounts(balance) WHERE is_active = true;

-- Transaction reason indexes
CREATE INDEX IF NOT EXISTS idx_reasons_tenant_active ON transaction_reasons(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_reasons_tenant_type ON transaction_reasons(tenant_id, type);

-- Transaction indexes
CREATE INDEX IF NOT EXISTS idx_transactions_tenant_date ON transactions(tenant_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_tenant_from ON transactions(tenant_id, from_account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_tenant_to ON transactions(tenant_id, to_account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_entity ON transactions(entity_id);
CREATE INDEX IF NOT EXISTS idx_transactions_reversal ON transactions(reversal_id);

-- Proof indexes
CREATE INDEX IF NOT EXISTS idx_proofs_tenant_transaction ON proofs(tenant_id, transaction_id);
CREATE INDEX IF NOT EXISTS idx_proofs_type ON proofs(type);

-- Audit log indexes
CREATE INDEX IF NOT EXISTS idx_audit_tenant_action ON audit_logs(tenant_id, action);
CREATE INDEX IF NOT EXISTS idx_audit_table_created ON audit_logs(table_name, created_at DESC);

-- ============================================
-- Step 4: Create Foreign Key Constraints
-- ============================================

-- Account foreign keys
ALTER TABLE accounts 
ADD CONSTRAINT fk_accounts_tenant 
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Transaction Reason foreign keys
ALTER TABLE transaction_reasons 
ADD CONSTRAINT fk_reasons_tenant 
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_reasons_parent 
  FOREIGN KEY (parent_id) REFERENCES transaction_reasons(id) ON DELETE SET NULL;

-- Proof foreign keys
ALTER TABLE proofs 
ADD CONSTRAINT fk_proofs_tenant 
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_proofs_transaction 
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL;

-- Transaction foreign keys
ALTER TABLE transactions 
ADD CONSTRAINT fk_transactions_from_account 
  FOREIGN KEY (from_account_id) REFERENCES accounts(id) ON DELETE RESTRICT,
ADD CONSTRAINT fk_transactions_to_account 
  FOREIGN KEY (to_account_id) REFERENCES accounts(id) ON DELETE RESTRICT,
ADD CONSTRAINT fk_transactions_reason 
  FOREIGN KEY (reason_id) REFERENCES transaction_reasons(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_transactions_entity 
  FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_transactions_tenant 
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_transactions_created_by 
  FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_transactions_reversal 
  FOREIGN KEY (reversal_id) REFERENCES transactions(id) ON DELETE SET NULL;

-- Entity foreign keys
ALTER TABLE entities 
ADD CONSTRAINT fk_entities_tenant 
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_entities_created_by 
  FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL;

-- User foreign keys
ALTER TABLE users 
ADD CONSTRAINT fk_users_tenant 
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- ============================================
-- Step 5: Create Unique Constraints
-- ============================================

-- Account unique constraint per tenant
ALTER TABLE accounts 
ADD CONSTRAINT uq_accounts_tenant_name UNIQUE (tenant_id, name);

-- Transaction Reason unique constraint per tenant
ALTER TABLE transaction_reasons 
ADD CONSTRAINT uq_reasons_tenant_name UNIQUE (tenant_id, name);

-- ============================================
-- Step 6: Create Views for Easy Access
-- ============================================

-- Account balances view
CREATE OR REPLACE VIEW account_balances AS
SELECT 
  a.id,
  a.tenant_id,
  a.name,
  a.type,
  a.balance,
  a.currency,
  a.is_active,
  a.created_at,
  a.updated_at
FROM accounts a
WHERE a.is_active = true;

-- Transaction stream view
CREATE OR REPLACE VIEW transaction_stream AS
SELECT 
  t.id,
  t.tenant_id,
  t.from_account_id,
  t.to_account_id,
  t.amount,
  t.date,
  t.reason_id,
  t.entity_id,
  t.notes,
  t.reference,
  tr.name as reason_name,
  e.name as entity_name,
  from_acc.name as from_account_name,
  to_acc.name as to_account_name
FROM transactions t
LEFT JOIN transaction_reasons tr ON t.reason_id = tr.id
LEFT JOIN entities e ON t.entity_id = e.id
LEFT JOIN accounts from_acc ON t.from_account_id = from_acc.id
LEFT JOIN accounts to_acc ON t.to_account_id = to_acc.id;

COMMIT;