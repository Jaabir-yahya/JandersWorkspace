-- Phase 3 Seed Data
-- Run this to populate the database with test data for development

-- ============================================
-- 1. TENANT & USER SETUP
-- ============================================

-- Insert default tenant
INSERT INTO tenants (id, name, currency_code, metadata)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'Default Business',
  'KES',
  '{"business_type": "retail", "location": "Nairobi"}'
)
ON CONFLICT (id) DO NOTHING;

-- Insert default user
INSERT INTO users (id, email, display_name, tenant_ids, current_tenant_id, metadata)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'admin@example.com',
  'System Admin',
  ARRAY['00000000-0000-0000-0000-000000000000'],
  '00000000-0000-0000-0000-000000000000',
  '{"role": "admin"}'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. ENTITIES (CUSTOMERS & SUPPLIERS)
-- ============================================

-- Customers
INSERT INTO entities (id, tenant_id, created_by_user_id, type, display_name, phone_number, location, metadata)
VALUES 
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'CUSTOMER', 'John Kamau', '+254712345678', 'Nairobi CBD', '{"trust_score": 85}'),
  ('b2c3d4e5-f6a7-8901-bcde-f23456789012', '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'CUSTOMER', 'Mary Wanjiku', '+254723456789', 'Westlands', '{"trust_score": 92}'),
  ('c3d4e5f6-a7b8-9012-cdef-345678901234', '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'CUSTOMER', 'Peter Ochieng', '+254734567890', 'Eastleigh', '{"trust_score": 78}'),
  ('d4e5f6a7-b8c9-0123-defa-456789012345', '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'SUPPLIER', 'Tech Solutions Ltd', '+254745678901', 'Industrial Area', '{"business_type": "electronics"}'),
  ('e5f6a7b8-c9d0-1234-efab-567890123456', '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'CUSTOMER', 'Sarah Achieng', '+254756789012', 'Karen', '{"trust_score": 88}')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 3. TRANSACTIONS
-- ============================================

-- Transaction 1: Cash sale (POSTED)
INSERT INTO transactions (
  id, tenant_id, created_by_user_id, entity_id, type, currency_code, 
  total_amount, status, payment_status, is_credit, reference, context, tags
) VALUES (
  't1a2b3c4-d5e6-7890-abcd-ef1234567890',
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'RETAIL',
  'KES',
  15000,
  'POSTED',
  'PAID',
  false,
  'INV-001',
  'Laptop accessories sale',
  ARRAY['electronics', 'cash']
)
ON CONFLICT (id) DO NOTHING;

-- Transaction 1 Lines
INSERT INTO transaction_lines (transaction_id, line_number, description, quantity, unit_price, sku, account_code)
VALUES 
  ('t1a2b3c4-d5e6-7890-abcd-ef1234567890', 1, 'Wireless Mouse', 2, 2500, 'MOUSE-001', 'SALES'),
  ('t1a2b3c4-d5e6-7890-abcd-ef1234567890', 2, 'USB Cable', 5, 2000, 'CABLE-001', 'SALES')
ON CONFLICT DO NOTHING;

-- Transaction 1 Payment Records
INSERT INTO payment_records (transaction_id, method, amount, reference, status)
VALUES ('t1a2b3c4-d5e6-7890-abcd-ef1234567890', 'CASH', 15000, 'CASH-001', 'COMPLETED')
ON CONFLICT DO NOTHING;

-- Transaction 2: M-PESA sale (POSTED)
INSERT INTO transactions (
  id, tenant_id, created_by_user_id, entity_id, type, currency_code, 
  total_amount, status, payment_status, is_credit, reference, context, tags
) VALUES (
  't2b3c4d5-e6f7-8901-bcde-f23456789012',
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  'b2c3d4e5-f6a7-8901-bcde-f23456789012',
  'RETAIL',
  'KES',
  45000,
  'POSTED',
  'PAID',
  false,
  'INV-002',
  'Dell Laptop sale',
  ARRAY['electronics', 'laptop', 'mpesa']
)
ON CONFLICT (id) DO NOTHING;

-- Transaction 2 Lines
INSERT INTO transaction_lines (transaction_id, line_number, description, quantity, unit_price, sku, account_code)
VALUES ('t2b3c4d5-e6f7-8901-bcde-f23456789012', 1, 'Dell Inspiron 15', 1, 45000, 'DELL-INS-15', 'SALES')
ON CONFLICT DO NOTHING;

-- Transaction 2 Payment Records
INSERT INTO payment_records (transaction_id, method, amount, reference, status)
VALUES ('t2b3c4d5-e6f7-8901-bcde-f23456789012', 'M-PESA', 45000, 'MPESA-SD7H9J2K', 'COMPLETED')
ON CONFLICT DO NOTHING;

-- Transaction 3: Credit/Udhaari sale (POSTED, unpaid)
INSERT INTO transactions (
  id, tenant_id, created_by_user_id, entity_id, type, currency_code, 
  total_amount, status, payment_status, is_credit, credit_due_date, reference, context, tags
) VALUES (
  't3c4d5e6-f7a8-9012-cdef-345678901234',
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  'c3d4e5f6-a7b8-9012-cdef-345678901234',
  'RETAIL',
  'KES',
  8500,
  'POSTED',
  'UNPAID',
  true,
  CURRENT_DATE + INTERVAL '14 days',
  'INV-003',
  'Phone accessories on credit',
  ARRAY['accessories', 'credit', 'udhaari']
)
ON CONFLICT (id) DO NOTHING;

-- Transaction 3 Lines
INSERT INTO transaction_lines (transaction_id, line_number, description, quantity, unit_price, sku, account_code)
VALUES 
  ('t3c4d5e6-f7a8-9012-cdef-345678901234', 1, 'Phone Case', 1, 2500, 'CASE-IPHONE', 'SALES'),
  ('t3c4d5e6-f7a8-9012-cdef-345678901234', 2, 'Screen Protector', 2, 1500, 'SCREEN-PROT', 'SALES'),
  ('t3c4d5e6-f7a8-9012-cdef-345678901234', 3, 'Charger', 1, 2000, 'CHARGER-USB', 'SALES')
ON CONFLICT DO NOTHING;

-- Transaction 4: Split payment (Cash + M-PESA)
INSERT INTO transactions (
  id, tenant_id, created_by_user_id, entity_id, type, currency_code, 
  total_amount, status, payment_status, is_credit, reference, context, tags
) VALUES (
  't4d5e6f7-a8b9-0123-defa-456789012345',
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  'e5f6a7b8-c9d0-1234-efab-567890123456',
  'RETAIL',
  'KES',
  25000,
  'POSTED',
  'PARTIAL',
  false,
  'INV-004',
  'Tablet sale with split payment',
  ARRAY['electronics', 'tablet', 'split-payment']
)
ON CONFLICT (id) DO NOTHING;

-- Transaction 4 Lines
INSERT INTO transaction_lines (transaction_id, line_number, description, quantity, unit_price, sku, account_code)
VALUES ('t4d5e6f7-a8b9-0123-defa-456789012345', 1, 'Samsung Tablet A7', 1, 25000, 'TAB-SAM-A7', 'SALES')
ON CONFLICT DO NOTHING;

-- Transaction 4 Payment Records (Split)
INSERT INTO payment_records (transaction_id, method, amount, reference, status)
VALUES 
  ('t4d5e6f7-a8b9-0123-defa-456789012345', 'CASH', 10000, 'CASH-002', 'COMPLETED'),
  ('t4d5e6f7-a8b9-0123-defa-456789012345', 'M-PESA', 15000, 'MPESA-KL8M2N4P', 'COMPLETED')
ON CONFLICT DO NOTHING;

-- Transaction 5: Procurement from supplier
INSERT INTO transactions (
  id, tenant_id, created_by_user_id, entity_id, type, currency_code, 
  total_amount, status, payment_status, is_credit, reference, context, tags
) VALUES (
  't5e6f7a8-b9c0-1234-efab-567890123456',
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  'd4e5f6a7-b8c9-0123-defa-456789012345',
  'PROCUREMENT',
  'KES',
  120000,
  'POSTED',
  'UNPAID',
  true,
  'PO-001',
  'Stock purchase - Laptops',
  ARRAY['procurement', 'stock', 'supplier-credit']
)
ON CONFLICT (id) DO NOTHING;

-- Transaction 5 Lines
INSERT INTO transaction_lines (transaction_id, line_number, description, quantity, unit_price, sku, account_code)
VALUES ('t5e6f7a8-b9c0-1234-efab-567890123456', 1, 'HP Laptops (Bulk)', 5, 24000, 'HP-LAPTOP-15', 'INVENTORY')
ON CONFLICT DO NOTHING;

-- Transaction 6: Expense
INSERT INTO transactions (
  id, tenant_id, created_by_user_id, entity_id, type, currency_code, 
  total_amount, status, payment_status, is_credit, reference, context, tags
) VALUES (
  't6f7a8b9-c0d1-2345-fabc-678901234567',
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  NULL,
  'EXPENSE',
  'KES',
  5000,
  'POSTED',
  'PAID',
  false,
  'EXP-001',
  'Office rent - January',
  ARRAY['expense', 'rent', 'office']
)
ON CONFLICT (id) DO NOTHING;

-- Transaction 6 Lines
INSERT INTO transaction_lines (transaction_id, line_number, description, quantity, unit_price, sku, account_code)
VALUES ('t6f7a8b9-c0d1-2345-fabc-678901234567', 1, 'Monthly Office Rent', 1, 5000, NULL, 'RENT')
ON CONFLICT DO NOTHING;

-- Transaction 6 Payment
INSERT INTO payment_records (transaction_id, method, amount, reference, status)
VALUES ('t6f7a8b9-c0d1-2345-fabc-678901234567', 'BANK_TRANSFER', 5000, 'BANK-RENT-JAN', 'COMPLETED')
ON CONFLICT DO NOTHING;

-- Transaction 7: Draft transaction (not posted yet)
INSERT INTO transactions (
  id, tenant_id, created_by_user_id, entity_id, type, currency_code, 
  total_amount, status, payment_status, is_credit, reference, context, tags
) VALUES (
  't7a8b9c0-d1e2-3456-abcd-789012345678',
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'RETAIL',
  'KES',
  3200,
  'DRAFT',
  'PENDING',
  false,
  'DRAFT-001',
  'Pending sale - awaiting confirmation',
  ARRAY['draft', 'pending']
)
ON CONFLICT (id) DO NOTHING;

-- Transaction 7 Lines
INSERT INTO transaction_lines (transaction_id, line_number, description, quantity, unit_price, sku, account_code)
VALUES ('t7a8b9c0-d1e2-3456-abcd-789012345678', 1, 'Bluetooth Speaker', 1, 3200, 'SPKR-BT-001', 'SALES')
ON CONFLICT DO NOTHING;

-- ============================================
-- 4. ENTITY BALANCES (Trigger will calculate these, but let's verify)
-- ============================================

-- The entity_balances view will automatically calculate from transactions

-- ============================================
-- 5. SUMMARY
-- ============================================

-- Verify data was inserted
SELECT 'Tenants' as table_name, COUNT(*) as count FROM tenants
UNION ALL
SELECT 'Users', COUNT(*) FROM users
UNION ALL
SELECT 'Entities', COUNT(*) FROM entities
UNION ALL
SELECT 'Transactions', COUNT(*) FROM transactions
UNION ALL
SELECT 'Transaction Lines', COUNT(*) FROM transaction_lines
UNION ALL
SELECT 'Payment Records', COUNT(*) FROM payment_records;
