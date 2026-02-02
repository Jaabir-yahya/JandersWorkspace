-- Enhanced Entity Relationship Management
-- Handles complex Nairobi business networks and credit relationships

-- Entity Relationships Table (NEW)
CREATE TABLE entity_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  from_entity_id UUID NOT NULL REFERENCES entities(id),
  to_entity_id UUID NOT NULL REFERENCES entities(id),
  
  -- Relationship type for Nairobi business context
  relationship_type VARCHAR(50) NOT NULL, -- CUSTOMER, SUPPLIER, PARTNER, AGENT, FAMILY_MEMBER, EMPLOYER, DISTRIBUTOR
  
  -- Business intelligence
  total_volume DECIMAL(18,4) DEFAULT 0,
  last_transaction_date TIMESTAMPTZ(6),
  trust_level INTEGER DEFAULT 0,             -- 0-100 based on payment history
  
  -- Credit management (critical for informal economy)
  credit_limit DECIMAL(18,4) DEFAULT 0,
  payment_terms INTEGER DEFAULT 0,            -- Net days
  average_payment_days INTEGER DEFAULT 0,       -- Based on history
  
  -- Relationship specifics
  is_mutual BOOLEAN DEFAULT false,              -- Two-way business relationship
  business_context JSONB DEFAULT '{}',          -- Stores relationship specifics
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ(6) DEFAULT NOW(),
  updated_at TIMESTAMPTZ(6) DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT fk_entity_rel_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  CONSTRAINT fk_entity_rel_from FOREIGN KEY (from_entity_id) REFERENCES entities(id),
  CONSTRAINT fk_entity_rel_to FOREIGN KEY (to_entity_id) REFERENCES entities(id),
  CONSTRAINT chk_trust_level CHECK (trust_level >= 0 AND trust_level <= 100),
  CONSTRAINT chk_payment_terms CHECK (payment_terms >= 0),
  CONSTRAINT chk_relationship_type CHECK (relationship_type IN (
    'CUSTOMER', 'SUPPLIER', 'PARTNER', 'AGENT', 
    'FAMILY_MEMBER', 'EMPLOYER', 'DISTRIBUTOR', 'WHOLESALER', 'RETAILER'
  ))
);

-- Entity 360° View (CRITICAL for Nairobi SMEs)
CREATE VIEW entity_360_view AS
SELECT 
  e.*,
  
  -- Transaction summaries
  COALESCE(SUM(t.total_amount), 0) as total_transactions,
  COALESCE(SUM(CASE WHEN mm.movement_type = 'INFLOW' THEN mm.amount ELSE 0 END), 0) as total_received,
  COALESCE(SUM(CASE WHEN mm.movement_type = 'OUTFLOW' THEN mm.amount ELSE 0 END), 0) as total_paid,
  
  -- Relationship intelligence
  (SELECT COUNT(*) FROM entity_relationships er 
   WHERE er.to_entity_id = e.id AND er.is_active = true) as customer_relationships_count,
  (SELECT COUNT(*) FROM entity_relationships er 
   WHERE er.from_entity_id = e.id AND er.is_active = true) as supplier_relationships_count,
  (SELECT COALESCE(SUM(er.total_volume), 0) FROM entity_relationships er 
   WHERE er.to_entity_id = e.id OR er.from_entity_id = e.id) as total_relationship_volume,
  
  -- Credit worthiness
  (SELECT COALESCE(MAX(er.trust_level), 0) FROM entity_relationships er 
   WHERE er.to_entity_id = e.id OR er.from_entity_id = e.id) as max_trust_level,
  (SELECT COALESCE(AVG(er.average_payment_days), 0) FROM entity_relationships er 
   WHERE er.to_entity_id = e.id OR er.from_entity_id = e.id) as avg_payment_days,
  
  -- Recent activity
  (SELECT MAX(mm.created_at) FROM money_movements mm 
   JOIN transactions t ON mm.transaction_id = t.id 
   WHERE t.entity_id = e.id) as last_activity_date,
   
  updated_at TIMESTAMPTZ(6) DEFAULT NOW()
FROM entities e
LEFT JOIN transactions t ON t.entity_id = e.id
LEFT JOIN money_movements mm ON mm.transaction_id = t.id
GROUP BY e.id;

-- Performance Indexes
CREATE INDEX idx_entity_relationships_from ON entity_relationships(from_entity_id, is_active);
CREATE INDEX idx_entity_relationships_to ON entity_relationships(to_entity_id, is_active);
CREATE INDEX idx_entity_relationships_type ON entity_relationships(relationship_type, trust_level);