-- 2026-01-29: Create Transaction Ledger Schema (Phase 1)
-- Up: create enums, tables, triggers

-- Enable pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ENUMs
CREATE TYPE txn_status AS ENUM ('DRAFT','POSTED','REVERSED','RECONCILED','VOIDED','ARCHIVED');
CREATE TYPE payment_status AS ENUM ('PENDING','PARTIAL','SETTLED','FAILED','CANCELLED');
CREATE TYPE txn_type AS ENUM ('RETAIL','SERVICE','RENTAL','EXPENSE');

-- users table (created_by references)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  phone_number text NOT NULL,
  email text,
  display_name text,
  role text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE (tenant_id, phone_number)
);
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);

-- entities table
CREATE TABLE IF NOT EXISTS entities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  type text NOT NULL,
  display_name text NOT NULL,
  phone_number text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_by_user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at timestamptz DEFAULT now(),
  UNIQUE (tenant_id, phone_number)
);
CREATE INDEX IF NOT EXISTS idx_entities_tenant ON entities(tenant_id);

-- transactions (header)
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  entity_id uuid REFERENCES entities(id) ON DELETE SET NULL,
  reference text,
  status txn_status NOT NULL DEFAULT 'DRAFT',
  type txn_type NOT NULL DEFAULT 'RETAIL',
  payment_status payment_status NOT NULL DEFAULT 'PENDING',
  total_amount numeric(18,4) NOT NULL DEFAULT 0, -- derived from lines
  currency_code varchar(3) NOT NULL DEFAULT 'USD',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_by_user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at timestamptz DEFAULT now(),
  reversed_transaction_id uuid REFERENCES transactions(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_transactions_tenant_status ON transactions(tenant_id, status);
CREATE UNIQUE INDEX IF NOT EXISTS ux_txn_tenant_ref ON transactions(tenant_id, reference) WHERE reference IS NOT NULL;

-- transaction_lines (lines)
CREATE TABLE IF NOT EXISTS transaction_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  description text,
  sku text,
  quantity numeric(18,4) NOT NULL DEFAULT 1,
  unit_price numeric(18,4) NOT NULL,
  total_line_amount numeric(18,4) NOT NULL,
  account_code text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tl_transaction ON transaction_lines(transaction_id);

-- payments
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  reference text,
  amount numeric(18,4) NOT NULL,
  currency_code varchar(3) NOT NULL DEFAULT 'USD',
  status payment_status NOT NULL DEFAULT 'PENDING',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_by_user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_payments_tenant ON payments(tenant_id);

-- payment_applications
CREATE TABLE IF NOT EXISTS payment_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  transaction_id uuid NOT NULL REFERENCES transactions(id) ON DELETE RESTRICT,
  applied_amount numeric(18,4) NOT NULL CHECK (applied_amount >= 0),
  created_at timestamptz DEFAULT now(),
  UNIQUE(payment_id, transaction_id)
);
CREATE INDEX IF NOT EXISTS idx_payment_app_txn ON payment_applications(transaction_id);

-- ------------------ TRIGGERS & FUNCTIONS ------------------

-- 1) enforce total_line_amount = quantity * unit_price
CREATE FUNCTION enforce_line_amount() RETURNS trigger AS $$
BEGIN
  IF NEW.total_line_amount IS DISTINCT FROM (NEW.quantity * NEW.unit_price) THEN
    RAISE EXCEPTION 'total_line_amount must equal quantity * unit_price (expected %)', (NEW.quantity * NEW.unit_price);
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_enforce_line_amount BEFORE INSERT OR UPDATE ON transaction_lines
FOR EACH ROW EXECUTE FUNCTION enforce_line_amount();

-- 2) recalc transaction total after line insert/update/delete
CREATE FUNCTION recalc_txn_total() RETURNS trigger AS $$
DECLARE s numeric := 0;
DECLARE t_id uuid;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    t_id := OLD.transaction_id;
  ELSE
    t_id := NEW.transaction_id;
  END IF;
  SELECT COALESCE(SUM(total_line_amount),0) INTO s FROM transaction_lines WHERE transaction_id = t_id;
  UPDATE transactions SET total_amount = s WHERE id = t_id;
  RETURN NULL;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_recalc_total AFTER INSERT OR UPDATE OR DELETE ON transaction_lines
FOR EACH ROW EXECUTE FUNCTION recalc_txn_total();

-- 3) prevent updates/deletes on immutable transactions
CREATE FUNCTION prevent_immutable_changes() RETURNS trigger AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    IF OLD.status IN ('POSTED','REVERSED','RECONCILED','ARCHIVED') THEN
      RAISE EXCEPTION 'cannot delete transaction with status %', OLD.status;
    END IF;
    RETURN OLD;
  ELSE
    -- UPDATE
    IF OLD.status IN ('POSTED','REVERSED','RECONCILED','ARCHIVED') THEN
      RAISE EXCEPTION 'cannot update transaction with status %', OLD.status;
    END IF;
    RETURN NEW;
  END IF;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_txn_immutable BEFORE UPDATE OR DELETE ON transactions
FOR EACH ROW EXECUTE FUNCTION prevent_immutable_changes();

-- 4) check metadata keys are snake_case (simple, non-recursive)
CREATE FUNCTION check_metadata_snakecase() RETURNS trigger AS $$
DECLARE k text;
BEGIN
  IF NEW.metadata IS NOT NULL THEN
    FOR k IN SELECT jsonb_object_keys(NEW.metadata) LOOP
      IF k !~ '^[a-z0-9_]+$' THEN
        RAISE EXCEPTION 'metadata keys must be snake_case, invalid key: %', k;
      END IF;
    END LOOP;
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_metadata_transactions BEFORE INSERT OR UPDATE ON transactions
FOR EACH ROW EXECUTE FUNCTION check_metadata_snakecase();

CREATE TRIGGER trg_metadata_lines BEFORE INSERT OR UPDATE ON transaction_lines
FOR EACH ROW EXECUTE FUNCTION check_metadata_snakecase();

CREATE TRIGGER trg_metadata_entities BEFORE INSERT OR UPDATE ON entities
FOR EACH ROW EXECUTE FUNCTION check_metadata_snakecase();

-- 5) ensure phone_number stored in E.164 like format (basic check)
CREATE FUNCTION phone_number_format_check() RETURNS trigger AS $$
BEGIN
  IF NEW.phone_number IS NOT NULL THEN
    IF NEW.phone_number !~ '^\+[1-9][0-9]{1,14}$' THEN
      RAISE EXCEPTION 'phone_number must be in E.164 format (e.g. +2547xxxxxxx)';
    END IF;
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_phone_entities BEFORE INSERT OR UPDATE ON entities
FOR EACH ROW EXECUTE FUNCTION phone_number_format_check();

CREATE TRIGGER trg_phone_users BEFORE INSERT OR UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION phone_number_format_check();

-- ------------------ END UP ------------------
