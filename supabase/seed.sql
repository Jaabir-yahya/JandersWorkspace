-- Seed data for Phase 1 local testing
-- Create a test tenant id, a user (created_by), and an entity

-- Use fixed UUIDs so tests can refer to them
INSERT INTO users (id, tenant_id, phone_number, email, display_name, metadata, created_at)
VALUES (
  '33333333-3333-3333-3333-333333333333'::uuid,
  '22222222-2222-2222-2222-222222222222'::uuid,
  '+254711111111',
  'test@example.com',
  'Seed User',
  '{"role":"admin"}',
  now()
) ON CONFLICT DO NOTHING;

INSERT INTO entities (id, tenant_id, type, display_name, phone_number, metadata, created_by_user_id, created_at)
VALUES (
  '11111111-1111-1111-1111-111111111111'::uuid,
  '22222222-2222-2222-2222-222222222222'::uuid,
  'CUSTOMER',
  'Test Customer',
  '+254700000000',
  '{"trust_score": 100}',
  '33333333-3333-3333-3333-333333333333'::uuid,
  now()
) ON CONFLICT DO NOTHING;

-- Seed data for transactions and transaction lines

-- Insert a test transaction (RETAIL example)
INSERT INTO transactions (id, tenant_id, entity_id, created_by_user_id, transaction_date, total_amount, currency_code, status, type, payment_status, created_at)
VALUES (
  '44444444-4444-4444-4444-444444444444'::uuid,
  '22222222-2222-2222-2222-222222222222'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  '33333333-3333-3333-3333-333333333333'::uuid,
  now(),
  10000,
  'KES',
  'DRAFT',
  'RETAIL',
  'PENDING',
  now()
) ON CONFLICT DO NOTHING;

-- Insert test transaction lines
INSERT INTO transaction_lines (id, transaction_id, description, sku, quantity, unit_price, total_line_amount, account_code, metadata, created_at)
VALUES
  (
    '55555555-5555-5555-5555-555555555555'::uuid,
    '44444444-4444-4444-4444-444444444444'::uuid,
    'Nike Shoes',
    'NIKE-001',
    2,
    5000,
    10000,
    '200-SALES',
    '{"variant":"Size 40","stock_location":"Shelf A"}'::jsonb,
    now()
  ) ON CONFLICT DO NOTHING;
