-- Smart Tagging System for Nairobi SMEs
-- Auto-categorization with machine learning foundation

-- Standard Tags Table (NEW)
CREATE TABLE standard_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  category VARCHAR(50),                     -- CUSTOMER_TYPES, BUSINESS_CATEGORIES, PAYMENT_METHODS, LOCATIONS
  tag_name VARCHAR(100) NOT NULL,
  tag_value VARCHAR(100) NOT NULL,
  color_code VARCHAR(7),                    -- For UI visualization
  is_system_defined BOOLEAN DEFAULT true,     -- Predefined vs user-created
  parent_tag_id UUID REFERENCES standard_tags(id),
  
  -- Nairobi business presets
  is_local_relevant BOOLEAN DEFAULT false,    -- Specific to Kenyan business context
  usage_count INTEGER DEFAULT 0,             -- Popularity ranking
  
  created_at TIMESTAMPTZ(6) DEFAULT NOW(),
  
  CONSTRAINT fk_standard_tags_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  CONSTRAINT fk_standard_tags_parent FOREIGN KEY (parent_tag_id) REFERENCES standard_tags(id)
);

-- Auto-Tagging Rules Engine (NEW)
CREATE TABLE tagging_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  rule_name VARCHAR(100) NOT NULL,
  
  -- Flexible conditions (JSON allows any complexity)
  conditions JSONB NOT NULL,                  -- {"description_contains": "rent", "amount_gt": 5000, "entity_type": "SUPPLIER"}
  
  -- Smart actions
  actions JSONB NOT NULL,                      -- {"add_tags": ["RENT", "FIXED_EXPENSE"], "set_category": "OFFICE_COSTS"}
  
  -- Machine learning
  confidence_score INTEGER DEFAULT 0,              -- 0-100 how certain we are
  pattern_examples JSONB DEFAULT '[]',          -- Learning examples
  match_count INTEGER DEFAULT 0,                -- How often it applies
  success_rate DECIMAL(5,2) DEFAULT 0.00,     -- How accurate predictions are
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ(6) DEFAULT NOW(),
  updated_at TIMESTAMPTZ(6) DEFAULT NOW(),
  
  CONSTRAINT fk_tagging_rules_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Transaction Tag Assignments (NEW)
CREATE TABLE transaction_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES transactions(id),
  tag_id UUID REFERENCES standard_tags(id),
  tag_source VARCHAR(20) DEFAULT 'AUTO',       -- AUTO, MANUAL, SYSTEM, IMPORT
  confidence_score INTEGER DEFAULT 0,              -- 0-100 accuracy
  created_at TIMESTAMPTZ(6) DEFAULT NOW(),
  
  CONSTRAINT fk_transaction_tags_transaction FOREIGN KEY (transaction_id) REFERENCES transactions(id),
  CONSTRAINT fk_transaction_tags_tag FOREIGN KEY (tag_id) REFERENCES standard_tags(id),
  CONSTRAINT chk_tag_source CHECK (tag_source IN ('AUTO', 'MANUAL', 'SYSTEM', 'IMPORT'))
);

-- Nairobi Business Preset Tags
INSERT INTO standard_tags (id, tenant_id, category, tag_name, tag_value, color_code, is_system_defined, is_local_relevant) VALUES
  -- Customer types (Nairobi context)
  (gen_random_uuid(), 'default', 'CUSTOMER_TYPES', 'Walk-In Customer', 'walk_in', '#27ae60', true, true),
  (gen_random_uuid(), 'default', 'CUSTOMER_TYPES', 'Wholesale Buyer', 'wholesale', '#2196f3', true, true),
  (gen_random_uuid(), 'default', 'CUSTOMER_TYPES', 'Tourist', 'tourist', '#ff9800', true, true),
  (gen_random_uuid(), 'default', 'CUSTOMER_TYPES', 'Chama Member', 'chama_member', '#8b5cf6', true, true),
  (gen_random_uuid(), 'default', 'CUSTOMER_TYPES', 'Regular', 'regular', '#06d6a0', true, true),
  
  -- Business categories (Nairobi specific)
  (gen_random_uuid(), 'default', 'BUSINESS_CATEGORIES', 'Rent & Utilities', 'rent_utilities', '#dc3545', true, true),
  (gen_random_uuid(), 'default', 'BUSINESS_CATEGORIES', 'Transport & Fuel', 'transport_fuel', '#f59e0b', true, true),
  (gen_random_uuid(), 'default', 'BUSINESS_CATEGORIES', 'Food & Produce', 'food_produce', '#22c55e', true, true),
  (gen_random_uuid(), 'default', 'BUSINESS_CATEGORIES', 'Electronics & Tech', 'electronics_tech', '#3b82f6', true, true),
  (gen_random_uuid(), 'default', 'BUSINESS_CATEGORIES', 'Clothing & Textiles', 'clothing_textiles', '#8b5cf6', true, true),
  (gen_random_uuid(), 'default', 'BUSINESS_CATEGORIES', 'Marketing & Sales', 'marketing_sales', '#e91e63', true, true),
  
  -- Payment methods (critical for Nairobi)
  (gen_random_uuid(), 'default', 'PAYMENT_METHODS', 'M-Pesa', 'mpesa', '#10b981', true, true),
  (gen_random_uuid(), 'default', 'PAYMENT_METHODS', 'Airtel Money', 'airtel_money', '#00a896', true, true),
  (gen_random_uuid(), 'default', 'PAYMENT_METHODS', 'T-Kash', 'tkash', '#00bcd4', true, true),
  (gen_random_uuid(), 'default', 'PAYMENT_METHODS', 'Equitel', 'equitel', '#805ad5', true, true),
  (gen_random_uuid(), 'default', 'PAYMENT_METHODS', 'Cash', 'cash', '#333333', true, true),
  (gen_random_uuid(), 'default', 'PAYMENT_METHODS', 'Bank Transfer', 'bank_transfer', '#1f77b4', true, true),
  
  -- Nairobi market locations
  (gen_random_uuid(), 'default', 'LOCATIONS', 'Kibuye Market', 'kibuye_market', '#2d3748', true, true),
  (gen_random_uuid(), 'default', 'LOCATIONS', 'Gikomba', 'gikomba', '#7c3aed', true, true),
  (gen_random_uuid(), 'default', 'LOCATIONS', 'Kawangware Market', 'kawangware', '#a8dadc', true, true),
  (gen_random_uuid(), 'default', 'LOCATIONS', 'Eastleigh', 'eastleigh', '#16a085', true, true),
  (gen_random_uuid(), 'default', 'LOCATIONS', 'Rongai', 'rongai', '#5f4c0c', true, true);

-- Auto-tagging Function (Smart)
CREATE OR REPLACE FUNCTION auto_tag_transaction(transaction_uuid UUID, tenant_uuid UUID)
RETURNS VOID AS $$
DECLARE
  -- Apply tagging rules to a transaction
  rule_record RECORD;
  matched_tags TEXT[] := '{}';
BEGIN
  FOR rule_record IN 
    SELECT * FROM tagging_rules tr 
    WHERE tr.tenant_id = tenant_uuid AND tr.is_active = true
  LOOP
    -- Check if rule conditions match transaction
    IF check_tagging_rule_conditions(transaction_uuid, rule_record.conditions) THEN
      -- Apply rule actions
      matched_tags := array_cat(matched_tags, jsonb_extract_path_text(rule_record.actions, '$.add_tags'));
      
      -- Create tag assignments
      INSERT INTO transaction_tags (transaction_id, tag_id, tag_source, confidence_score)
      SELECT 
        transaction_uuid,
        st.id,
        'AUTO',
        rule_record.confidence_score
      FROM standard_tags st 
      WHERE st.tag_name = ANY(matched_tags);
      
      -- Update rule statistics
      UPDATE tagging_rules SET 
        match_count = match_count + 1,
        success_rate = ROUND(((success_rate * match_count) + 100) / (match_count + 1), 2)
      WHERE id = rule_record.id;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Check tagging conditions function
CREATE OR REPLACE FUNCTION check_tagging_rule_conditions(transaction_uuid UUID, conditions JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  -- Example conditions checking (expandable via JSON)
  RETURN (
    -- Amount conditions
    (conditions->>'amount_gt' IS NOT NULL AND 
     (SELECT t.total_amount FROM transactions t WHERE t.id = transaction_uuid) > (conditions->>'amount_gt')::DECIMAL) OR
    
    -- Description contains
    (conditions->>'description_contains' IS NOT NULL AND
     (SELECT t.reference FROM transactions t WHERE t.id = transaction_uuid) ILIKE '%' || (conditions->>'description_contains') || '%') OR
    
    -- Entity type conditions
    (conditions->>'entity_type' IS NOT NULL AND
     (SELECT e.entity_type FROM entities e 
      JOIN transactions t ON t.entity_id = e.id 
      WHERE t.id = transaction_uuid) = conditions->>'entity_type') OR
    
    -- Custom conditions (any JSON condition possible)
    true  -- Default to true if no conditions specified
  );
END;
$$ LANGUAGE plpgsql;