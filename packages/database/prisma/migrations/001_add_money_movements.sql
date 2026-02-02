-- Enhanced Money Movement Schema
-- Core bookkeeping foundation for Nairobi SMEs

-- Money Movement Table (NEW)
CREATE TABLE money_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  transaction_id UUID REFERENCES transactions(id),
  
  -- Money flow tracking (critical for Nairobi SMEs)
  movement_type VARCHAR(20) NOT NULL, -- INFLOW, OUTFLOW, TRANSFER
  source_type VARCHAR(30) NOT NULL,   -- CASH, MPESA, BANK, MOBILE_MONEY, CREDIT, TRANSFER
  amount DECIMAL(18,4) NOT NULL,
  reference_number VARCHAR(100),
  
  -- Business context
  business_purpose VARCHAR(100),           -- SALES, RENT, SALARIES, INVENTORY, TRANSPORT
  description TEXT,
  
  -- Settlement tracking
  is_settled BOOLEAN DEFAULT false,
  settled_date TIMESTAMPTZ(6),
  settlement_method VARCHAR(30),           -- CASH_HANDOVER, BANK_DEPOSIT, MOBILE_TRANSFER
  
  -- Smart tagging (extensible for innovation)
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ(6) DEFAULT NOW(),
  
  -- Constraints for data integrity
  CONSTRAINT fk_money_movement_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  CONSTRAINT fk_money_movement_transaction FOREIGN KEY (transaction_id) REFERENCES transactions(id),
  CONSTRAINT chk_amount_positive CHECK (amount > 0),
  CONSTRAINT chk_movement_type CHECK (movement_type IN ('INFLOW', 'OUTFLOW', 'TRANSFER'))
);

-- Cash Flow Real-time View (CRITICAL for Nairobi SMEs)
CREATE VIEW cash_flow_realtime AS
SELECT 
  mm.tenant_id,
  -- Real-time position
  SUM(CASE WHEN mm.movement_type = 'INFLOW' THEN mm.amount ELSE 0 END) as total_inflow,
  SUM(CASE WHEN mm.movement_type = 'OUTFLOW' THEN mm.amount ELSE 0 END) as total_outflow,
  SUM(CASE WHEN mm.movement_type = 'INFLOW' THEN -mm.amount ELSE mm.amount END) as net_position,
  
  -- By source type (critical for understanding cash sources)
  COUNT(CASE WHEN mm.source_type = 'MPESA' AND mm.movement_type = 'INFLOW' THEN 1 END) as mpesa_inflow_count,
  SUM(CASE WHEN mm.source_type = 'MPESA' AND mm.movement_type = 'INFLOW' THEN mm.amount ELSE 0 END) as mpesa_inflow_total,
  
  COUNT(CASE WHEN mm.source_type = 'CASH' AND mm.movement_type = 'INFLOW' THEN 1 END) as cash_inflow_count,
  SUM(CASE WHEN mm.source_type = 'CASH' AND mm.movement_type = 'INFLOW' THEN mm.amount ELSE 0 END) as cash_inflow_total,
  
  -- Recent movements (last 24 hours for mobile users)
  COUNT(CASE WHEN mm.created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as movements_24h,
  
  updated_at TIMESTAMPTZ(6) DEFAULT NOW()
FROM money_movements mm
WHERE mm.created_at >= NOW() - INTERVAL '90 days'
GROUP BY mm.tenant_id;

-- Money Movement Indexes for Performance
CREATE INDEX idx_money_movements_tenant_date ON money_movements(tenant_id, created_at);
CREATE INDEX idx_money_movements_transaction ON money_movements(transaction_id);
CREATE INDEX idx_money_movements_type_source ON money_movements(movement_type, source_type);
CREATE INDEX idx_money_movements_settled ON money_movements(is_settled, settled_date);