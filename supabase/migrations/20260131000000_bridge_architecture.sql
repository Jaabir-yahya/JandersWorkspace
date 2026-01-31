-- Phase 1: Bridge Architecture Migration
-- Adds tenant tier system and integration infrastructure

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- New ENUMs for bridge architecture
CREATE TYPE tenant_tier AS ENUM ('BASIC', 'ADVANCED');
CREATE TYPE tenant_country AS ENUM ('KE', 'TZ', 'UG', 'RW', 'NG', 'US', 'UK', 'EU');
CREATE TYPE integration_type AS ENUM ('MPESA', 'WHATSAPP', 'QUICKBOOKS', 'XERO', 'SHOPIFY');
CREATE TYPE webhook_status AS ENUM ('PENDING', 'DELIVERED', 'FAILED', 'RETRYING');
CREATE TYPE integration_status AS ENUM ('ACTIVE', 'INACTIVE', 'ERROR', 'SYNCING');

-- Enhanced tenant configuration table
CREATE TABLE IF NOT EXISTS tenant_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tier tenant_tier NOT NULL DEFAULT 'BASIC',
  country tenant_country NOT NULL DEFAULT 'KE',
  features jsonb DEFAULT '{}'::jsonb,
  integration_settings jsonb DEFAULT '{}'::jsonb,
  commission_rates jsonb DEFAULT '{"mpesa": 0.02, "whatsapp": 0.01}'::jsonb,
  compliance_data jsonb DEFAULT '{}'::jsonb,
  rate_limits jsonb DEFAULT '{"daily": 1000, "monthly": 30000}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT uq_tenant_config UNIQUE (tenant_id)
);

CREATE INDEX idx_tenant_configs_tier ON tenant_configs(tier);
CREATE INDEX idx_tenant_configs_country ON tenant_configs(country);

-- Integration configurations for each tenant
CREATE TABLE IF NOT EXISTS integration_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  integration_type integration_type NOT NULL,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  last_sync_at timestamptz,
  sync_status integration_status DEFAULT 'ACTIVE',
  error_count integer DEFAULT 0,
  last_error text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT uq_tenant_integration UNIQUE (tenant_id, integration_type)
);

CREATE INDEX idx_integration_configs_tenant_type ON integration_configs(tenant_id, integration_type);
CREATE INDEX idx_integration_configs_active ON integration_configs(is_active, integration_type);

-- External system references (for mapping local IDs to external systems)
CREATE TABLE IF NOT EXISTS external_references (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  local_id uuid NOT NULL,
  local_type text NOT NULL, -- 'transaction', 'entity', 'payment'
  external_system text NOT NULL, -- 'mpesa', 'quickbooks', 'whatsapp'
  external_id text NOT NULL,
  external_data jsonb DEFAULT '{}'::jsonb,
  sync_direction text CHECK (sync_direction IN ('OUTBOUND', 'INBOUND', 'BIDIRECTIONAL')),
  last_sync_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_external_refs_local ON external_references(local_type, local_id);
CREATE INDEX idx_external_refs_tenant ON external_references(tenant_id, external_system);
CREATE INDEX idx_external_refs_external ON external_references(external_system, external_id);

-- Webhook configurations
CREATE TABLE IF NOT EXISTS webhook_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  name text NOT NULL,
  url text NOT NULL,
  events text[] DEFAULT '{}', -- Array of event types
  secret text NOT NULL,
  is_active boolean DEFAULT true,
  retry_policy jsonb DEFAULT '{"maxRetries": 3, "backoffMs": 1000}'::jsonb,
  last_triggered_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_webhook_configs_tenant ON webhook_configs(tenant_id, is_active);

-- Webhook delivery tracking
CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  webhook_config_id uuid NOT NULL REFERENCES webhook_configs(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  response_status integer,
  response_body text,
  response_headers jsonb,
  delivered_at timestamptz,
  retry_count integer DEFAULT 0,
  status webhook_status DEFAULT 'PENDING',
  next_retry_at timestamptz,
  error_message text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_webhook_deliveries_status ON webhook_deliveries(status, created_at);
CREATE INDEX idx_webhook_deliveries_config ON webhook_deliveries(webhook_config_id, status);
CREATE INDEX idx_webhook_deliveries_retry ON webhook_deliveries(next_retry_at, status) WHERE status = 'RETRYING';

-- Integration event log for audit and debugging
CREATE TABLE IF NOT EXISTS integration_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  event_type text NOT NULL,
  source_system text NOT NULL,
  target_system text,
  correlation_id text, -- For linking related events
  event_data jsonb NOT NULL,
  processed_at timestamptz,
  error_message text,
  retry_count integer DEFAULT 0,
  status text DEFAULT 'PENDING',
  priority integer DEFAULT 5, -- 1-10, lower is higher priority
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_integration_events_status ON integration_events(status, priority, created_at);
CREATE INDEX idx_integration_events_tenant ON integration_events(tenant_id, event_type);
CREATE INDEX idx_integration_events_correlation ON integration_events(correlation_id);

-- Feature flag system for tenant tier management
CREATE TABLE IF NOT EXISTS feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  tiers tenant_tier[] DEFAULT '{}', -- Which tiers can access this feature
  countries tenant_country[] DEFAULT '{}', -- Which countries this feature applies to
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert default feature flags
INSERT INTO feature_flags (name, description, tiers, countries) VALUES
('digital_notes', 'Digital note taking capabilities', ARRAY['BASIC', 'ADVANCED'], ARRAY['KE', 'TZ', 'UG', 'RW', 'NG']),
('transaction_ledger', 'Transaction management and ledger', ARRAY['BASIC', 'ADVANCED'], ARRAY['KE', 'TZ', 'UG', 'RW', 'NG']),
('entity_management', 'Entity 360° view management', ARRAY['BASIC', 'ADVANCED'], ARRAY['KE', 'TZ', 'UG', 'RW', 'NG']),
('basic_dashboard', 'Basic dashboard and analytics', ARRAY['BASIC', 'ADVANCED'], ARRAY['KE', 'TZ', 'UG', 'RW', 'NG']),
('attachments', 'File attachment system', ARRAY['BASIC', 'ADVANCED'], ARRAY['KE', 'TZ', 'UG', 'RW', 'NG']),
('mpesa_stk_push', 'M-Pesa STK Push payments', ARRAY['ADVANCED'], ARRAY['KE']),
('mpesa_c2b', 'M-Pesa C2B payments', ARRAY['ADVANCED'], ARRAY['KE']),
('mpesa_b2c', 'M-Pesa B2C payments', ARRAY['ADVANCED'], ARRAY['KE']),
('mpesa_b2b', 'M-Pesa B2B payments', ARRAY['ADVANCED'], ARRAY['KE']),
('whatsapp_business', 'WhatsApp Business API integration', ARRAY['ADVANCED'], ARRAY['KE', 'TZ', 'UG', 'RW', 'NG']),
('quickbooks_sync', 'QuickBooks Online synchronization', ARRAY['ADVANCED'], ARRAY['KE', 'TZ', 'UG', 'RW', 'NG', 'US', 'UK', 'EU']),
('xero_sync', 'Xero accounting synchronization', ARRAY['ADVANCED'], ARRAY['KE', 'TZ', 'UG', 'RW', 'NG', 'US', 'UK', 'EU']),
('shopify_sync', 'Shopify e-commerce synchronization', ARRAY['ADVANCED'], ARRAY['KE', 'TZ', 'UG', 'RW', 'NG', 'US', 'UK', 'EU']),
('advanced_analytics', 'Advanced analytics and reporting', ARRAY['ADVANCED'], ARRAY['KE', 'TZ', 'UG', 'RW', 'NG']),
('api_access', 'Full API access beyond read-only', ARRAY['ADVANCED'], ARRAY['KE', 'TZ', 'UG', 'RW', 'NG']),
('webhooks', 'Webhook configuration and management', ARRAY['ADVANCED'], ARRAY['KE', 'TZ', 'UG', 'RW', 'NG']),
('white_labeling', 'White-label customization options', ARRAY['ADVANCED'], ARRAY['KE', 'TZ', 'UG', 'RW', 'NG']),
('revenue_sharing', 'Commission and revenue sharing tracking', ARRAY['ADVANCED'], ARRAY['KE', 'TZ', 'UG', 'RW', 'NG']);

-- Multi-currency support
CREATE TABLE IF NOT EXISTS currency_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_currency varchar(3) NOT NULL,
  to_currency varchar(3) NOT NULL,
  rate numeric(18,8) NOT NULL,
  source text NOT NULL DEFAULT 'CBK', -- Central Bank of Kenya, etc.
  valid_from timestamptz NOT NULL,
  valid_to timestamptz,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT uq_currency_rate UNIQUE (from_currency, to_currency, valid_from)
);

CREATE INDEX idx_currency_rates_active ON currency_rates(valid_from, valid_to) WHERE valid_to IS NULL;

-- Update existing transactions table to support multi-currency
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS exchange_rate numeric(18,8);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS original_currency_code varchar(3);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS original_total_amount numeric(18,4);

-- Add metadata columns for integration tracking
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS integration_metadata jsonb DEFAULT '{}'::jsonb;
ALTER TABLE entities ADD COLUMN IF NOT EXISTS integration_metadata jsonb DEFAULT '{}'::jsonb;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS integration_metadata jsonb DEFAULT '{}'::jsonb;

-- Update updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to bridge tables
CREATE TRIGGER update_tenant_configs_updated_at BEFORE UPDATE ON tenant_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_integration_configs_updated_at BEFORE UPDATE ON integration_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_external_references_updated_at BEFORE UPDATE ON external_references FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_webhook_configs_updated_at BEFORE UPDATE ON webhook_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feature_flags_updated_at BEFORE UPDATE ON feature_flags FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) for tenant isolation
ALTER TABLE tenant_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies (assuming tenant_id is available from context)
CREATE POLICY tenant_configs_isolation ON tenant_configs FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);
CREATE POLICY integration_configs_isolation ON integration_configs FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);
CREATE POLICY external_references_isolation ON external_references FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);
CREATE POLICY webhook_configs_isolation ON webhook_configs FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);
CREATE POLICY webhook_deliveries_isolation ON webhook_deliveries FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);
CREATE POLICY integration_events_isolation ON integration_events FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

-- Function to check tenant feature access
CREATE OR REPLACE FUNCTION has_tenant_feature(tenant_uuid uuid, feature_name text)
RETURNS boolean AS $$
DECLARE
  tenant_config tenant_configs%ROWTYPE;
  feature_flag feature_flags%ROWTYPE;
BEGIN
  -- Get tenant configuration
  SELECT * INTO tenant_config FROM tenant_configs WHERE tenant_id = tenant_uuid;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Get feature flag
  SELECT * INTO feature_flag FROM feature_flags 
  WHERE name = feature_name AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Check if tenant tier has access to this feature
  IF feature_flag.tiers @> ARRAY[tenant_config.tier] THEN
    -- Check if feature is available in tenant's country
    IF feature_flag.countries @> ARRAY[tenant_config.country] THEN
      RETURN true;
    END IF;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create tenant configuration
CREATE OR REPLACE FUNCTION create_tenant_config(
  tenant_uuid uuid,
  tier_param tenant_tier DEFAULT 'BASIC',
  country_param tenant_country DEFAULT 'KE'
)
RETURNS uuid AS $$
DECLARE
  config_id uuid;
BEGIN
  INSERT INTO tenant_configs (tenant_id, tier, country)
  VALUES (tenant_uuid, tier_param, country_param)
  RETURNING id INTO config_id;
  
  RETURN config_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log integration events
CREATE OR REPLACE FUNCTION log_integration_event(
  tenant_uuid uuid,
  event_type_param text,
  source_system_param text,
  target_system_param text DEFAULT NULL,
  correlation_id_param text DEFAULT NULL,
  event_data_param jsonb DEFAULT '{}'::jsonb,
  priority_param integer DEFAULT 5
)
RETURNS uuid AS $$
DECLARE
  event_id uuid;
BEGIN
  INSERT INTO integration_events (
    tenant_id, 
    event_type, 
    source_system, 
    target_system, 
    correlation_id, 
    event_data, 
    priority
  )
  VALUES (
    tenant_uuid, 
    event_type_param, 
    source_system_param, 
    target_system_param, 
    correlation_id_param, 
    event_data_param, 
    priority_param
  )
  RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;