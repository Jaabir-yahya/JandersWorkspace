-- Universal Item Catalog for Nairobi SMEs
-- Handles inventory, services, assets, expenses with smart pricing

-- Items Table (NEW)
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  sku VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  
  -- Item categorization (flexible for Nairobi businesses)
  item_type VARCHAR(30) NOT NULL,              -- PRODUCT, SERVICE, ASSET, EXPENSE, TAX, FEE
  category VARCHAR(100),
  unit_of_measure VARCHAR(20) DEFAULT 'PCS',
  
  -- Pricing management (Nairobi businesses need flexible pricing)
  default_price DECIMAL(18,4) NOT NULL,
  cost_price DECIMAL(18,4),
  price_tiers JSONB DEFAULT '{}',                -- {"retail": 50, "wholesale": 45, "bulk": 40}
  
  -- Inventory tracking (critical for retail businesses)
  current_stock DECIMAL(12,4) DEFAULT 0,
  min_stock_level DECIMAL(12,4) DEFAULT 0,
  reorder_point DECIMAL(12,4) DEFAULT 0,
  last_stock_update TIMESTAMPTZ(6),
  
  -- Nairobi business specifics
  supplier_id UUID REFERENCES entities(id),  -- Who supplies this
  is_perishable BOOLEAN DEFAULT false,            -- Important for food businesses
  storage_requirements TEXT,                     -- "Keep dry", "Refrigerate"
  
  -- Smart tagging foundation (extensible)
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ(6) DEFAULT NOW(),
  updated_at TIMESTAMPTZ(6) DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT fk_items_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  CONSTRAINT fk_items_supplier FOREIGN KEY (supplier_id) REFERENCES entities(id),
  CONSTRAINT chk_item_type CHECK (item_type IN (
    'PRODUCT', 'SERVICE', 'ASSET', 'EXPENSE', 'TAX', 'FEE', 'MATERIAL'
  )),
  CONSTRAINT chk_positive_prices CHECK (default_price > 0 AND cost_price >= 0),
  CONSTRAINT chk_positive_stock CHECK (current_stock >= 0)
);

-- Item Price History (NEW)
CREATE TABLE item_price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(id),
  old_price DECIMAL(18,4),
  new_price DECIMAL(18,4) NOT NULL,
  change_reason VARCHAR(100),               -- MANUAL, SUPPLIER_UPDATE, MARKET_ADJUST, COMPETITOR_RESPONSE
  changed_by_user_id UUID REFERENCES users(id),
  changed_at TIMESTAMPTZ(6) DEFAULT NOW(),
  
  CONSTRAINT fk_price_history_item FOREIGN KEY (item_id) REFERENCES items(id)
);

-- Inventory Movements (NEW) - Tracks stock in/out
CREATE TABLE inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(id),
  movement_type VARCHAR(20) NOT NULL,       -- STOCK_IN, STOCK_OUT, ADJUSTMENT, WASTE, RETURN
  quantity DECIMAL(12,4) NOT NULL,
  unit_cost DECIMAL(18,4),
  total_cost DECIMAL(18,4) GENERATED ALWAYS AS (quantity * unit_cost) STORED,
  reference_number VARCHAR(100),               -- Purchase order, invoice number
  notes TEXT,
  created_by_user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ(6) DEFAULT NOW(),
  
  CONSTRAINT fk_inventory_item FOREIGN KEY (item_id) REFERENCES items(id),
  CONSTRAINT chk_movement_type CHECK (movement_type IN ('STOCK_IN', 'STOCK_OUT', 'ADJUSTMENT', 'WASTE', 'RETURN'))
);

-- Item 360° View (CRITICAL for Nairobi businesses)
CREATE VIEW item_360_view AS
SELECT 
  i.*,
  -- Current stock status
  CASE WHEN i.current_stock <= i.min_stock_level THEN 'LOW_STOCK' ELSE 'OK' END as stock_status,
  ROUND(((i.current_stock - i.min_stock_level) / i.min_stock_level) * 100, 2) as stock_level_percentage,
  
  -- Pricing analysis
  ROUND(((i.default_price - i.cost_price) / i.default_price) * 100, 2) as profit_margin_percentage,
  (SELECT COUNT(*) FROM item_price_history iph WHERE iph.item_id = i.id AND iph.changed_at >= NOW() - INTERVAL '30 days') as price_changes_30d,
  
  -- Sales performance
  (SELECT COALESCE(SUM(im.quantity), 0) FROM inventory_movements im WHERE im.item_id = i.id AND im.movement_type = 'STOCK_OUT') as total_sold,
  
  -- Supplier info
  e_s.display_name as supplier_name,
  
  -- Last activity
  (SELECT MAX(im.created_at) FROM inventory_movements im WHERE im.item_id = i.id) as last_movement_date
FROM items i
LEFT JOIN entities e_s ON e_s.id = i.supplier_id
WHERE i.is_active = true;

-- Performance indexes
CREATE INDEX idx_items_tenant_type ON items(tenant_id, item_type);
CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_items_stock ON items(current_stock, min_stock_level);
CREATE INDEX idx_items_sku ON items(sku);
CREATE INDEX idx_inventory_movements_item ON inventory_movements(item_id, created_at);