-- Enhanced Entity Model for Nairobi Business Realities
-- Supports flexible relationships, informal businesses, credit management

-- Enhance existing entities table
ALTER TABLE entities ADD COLUMN IF NOT EXISTS (
  -- Nairobi business flexibility (NEW)
  entity_type VARCHAR(50),              -- CUSTOMER, SUPPLIER, PARTNER, EMPLOYEE, AGENT, VENDOR, GOVERNMENT, BANK, CHAMA_MEMBER
  business_registration VARCHAR(50),      -- INFORMAL, REGISTERED, COMPANY, CHAMA, SOLE_PROPRIETOR
  business_scale VARCHAR(20),           -- MICRO, SMALL, MEDIUM, LARGE
  registration_number VARCHAR(100),      -- Business registration or tax ID
  
  -- Relationship management (NEW)
  parent_entity_id UUID REFERENCES entities(id),     -- For business groups/families
  agent_entity_id UUID REFERENCES entities(id),        -- For agents/distributors
  
  -- Credit management (critical for informal economy)
  credit_limit DECIMAL(18,4) DEFAULT 0,
  payment_terms INTEGER DEFAULT 0,                   -- Net days
  trust_score INTEGER DEFAULT 0,                     -- 0-100 from payment history
  
  -- Nairobi-specific context (NEW)
  preferred_contact_method VARCHAR(20) DEFAULT 'PHONE', -- PHONE, WHATSAPP, SMS, EMAIL
  language_preference VARCHAR(10) DEFAULT 'en',           -- en, sw
  location_notes TEXT,                                -- Market, estate, neighborhood
  
  -- Smart tagging foundation (NEW - extensible for innovation)
  system_tags TEXT[] DEFAULT '{}',                     -- Predefined Nairobi business tags
  custom_tags TEXT[] DEFAULT '{}',                     -- User-defined tags
  business_context JSONB DEFAULT '{}',                  -- Store business specifics
  
  -- Keep existing fields for compatibility
  created_at TIMESTAMPTZ(6) DEFAULT NOW(),
  updated_at TIMESTAMPTZ(6) DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(entity_type);
CREATE INDEX IF NOT EXISTS idx_entities_parent ON entities(parent_entity_id);
CREATE INDEX IF NOT EXISTS idx_entities_agent ON entities(agent_entity_id);
CREATE INDEX IF NOT EXISTS idx_entities_trust ON entities(trust_score);
CREATE INDEX IF NOT EXISTS idx_entities_registration ON entities(business_registration, business_scale);

-- Business context helper functions (Nairobi-specific)
CREATE OR REPLACE FUNCTION get_entity_business_context(entity_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'is_informal', CASE WHEN e.business_registration = 'INFORMAL' THEN true ELSE false END,
    'is_chama_member', CASE WHEN e.business_registration = 'CHAMA' THEN true ELSE false END,
    'is_registered', CASE WHEN e.business_registration IN ('REGISTERED', 'COMPANY') THEN true ELSE false END,
    'scale', e.business_scale,
    'preferred_language', e.language_preference,
    'has_credit_facility', CASE WHEN e.credit_limit > 0 THEN true ELSE false END
  ) INTO result
  FROM entities e WHERE e.id = entity_id;
  RETURN result;
END;
$$ LANGUAGE plpgsql;