-- Comprehensive Seed Data for Phase 3 Testing
-- This script creates realistic test data for all three majors (RETAIL, SERVICE, RENTAL)

-- ============================================
-- ENTITIES (Customers & Suppliers)
-- ============================================

-- Additional Customers
INSERT INTO entities (id, tenant_id, type, display_name, phone_number, metadata, created_by_user_id, created_at)
VALUES
  -- Customer 2: Retail Shop Regular
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'CUSTOMER', 'John Kamau', '+254712345678', '{"trust_score": 85, "customer_since": "2023-01-15"}', '33333333-3333-3333-3333-333333333333', now()),
  -- Customer 3: Service Client
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'CUSTOMER', 'Mary Wanjiku', '+254722987654', '{"trust_score": 92, "preferred_contact": "whatsapp"}', '33333333-3333-3333-3333-333333333333', now()),
  -- Customer 4: Rental Client
  ('cccccccc-cccc-cccc-cccc-cccc-cccccccccc', '22222222-2222-2222-2222-222222222222', 'CUSTOMER', 'David Ochieng', '+254733456789', '{"trust_score": 78, "rental_history": "5 rentals"}', '33333333-3333-3333-3333-333333333333', now()),
  -- Customer 5: Mixed Customer
  ('dddddddd-dddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222', 'CUSTOMER', 'Grace Mwangi', '+254744567890', '{"trust_score": 95, "payment_preference": "mpesa"}', '33333333-3333-3333-3333-333333333333', now())
ON CONFLICT DO NOTHING;

-- Suppliers
INSERT INTO entities (id, tenant_id, type, display_name, phone_number, metadata, created_by_user_id, created_at)
VALUES
  -- Supplier 1: Electronics Wholesaler
  ('eeeeeeee-eeee-eeee-eeee-eeee-eeeeeeeeee', '22222222-2222-2222-2222-222222222222', 'SUPPLIER', 'Tech Distributors Ltd', '+254720123456', '{"credit_terms": "30 days", "discount_rate": 0.05}', '33333333-3333-3333-3333-333333333333', now()),
  -- Supplier 2: Equipment Rental
  ('ffffffff-ffff-ffff-ffff-ffff-ffff-ffffffffffff', '22222222-2222-2222-2222-222222222222', 'SUPPLIER', 'Rental Equipment Co', '+254731234567', '{"rental_terms": "daily_rate", "deposit_required": true}', '33333333-3333-3333-3333-333333333333', now())
ON CONFLICT DO NOTHING;

-- ============================================
-- RETAIL TRANSACTIONS
-- ============================================

-- Retail Transaction 1: Posted Sale
INSERT INTO transactions (id, tenant_id, entity_id, created_by_user_id, transaction_date, total_amount, currency_code, status, type, payment_status, reference, metadata, created_at)
VALUES
  ('55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', now(), 18000, 'KES', 'POSTED', 'RETAIL', 'PAID', 'INV-RETAIL-001', '{"channel": "in_store", "salesperson": "John Kamau"}', now())
ON CONFLICT DO NOTHING;

INSERT INTO transaction_lines (id, transaction_id, description, sku, quantity, unit_price, total_line_amount, account_code, metadata, created_at)
VALUES
  ('66666666-6666-6666-6666-666666666666', '55555555-5555-5555-5555-555555555555', 'Adidas Tracksuit', 'ADIDAS-001', 1, 8000, 8000, '200-SALES', '{"variant": "Large", "color": "Black"}', now()),
  ('77777777-7777-7777-7777-777777777777', '55555555-5555-5555-5555-555555555555', 'Nike Air Max', 'NIKE-002', 1, 10000, 10000, '200-SALES', '{"variant": "Size 42", "color": "Red"}', now())
ON CONFLICT DO NOTHING;

-- Retail Transaction 2: Draft Sale (Multiple Items)
INSERT INTO transactions (id, tenant_id, entity_id, created_by_user_id, transaction_date, total_amount, currency_code, status, type, payment_status, reference, metadata, created_at)
VALUES
  ('88888888-8888-8888-8888-8888-888888888888', '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', now(), 45000, 'KES', 'DRAFT', 'RETAIL', 'PENDING', 'INV-RETAIL-002', '{"channel": "online", "order_source": "instagram"}', now())
ON CONFLICT DO NOTHING;

INSERT INTO transaction_lines (id, transaction_id, description, sku, quantity, unit_price, total_line_amount, account_code, metadata, created_at)
VALUES
  ('99999999-9999-9999-9999-9999-999999999999', '88888888-8888-8888-8888-888888888888', 'Samsung Galaxy S24', 'SAMSUNG-001', 2, 15000, 30000, '200-SALES', '{"variant": "256GB", "color": "Titanium Gray"}', now()),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '88888888-8888-8888-8888-888888888888', 'Samsung Galaxy Watch', 'SAMSUNG-002', 1, 25000, 25000, '200-SALES', '{"variant": "44mm", "color": "Black"}', now())
ON CONFLICT DO NOTHING;

-- Retail Transaction 3: Credit Sale (Udhaari)
INSERT INTO transactions (id, tenant_id, entity_id, created_by_user_id, transaction_date, total_amount, currency_code, status, type, payment_status, reference, due_date, metadata, created_at)
VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccc-cccccccccc', '33333333-3333-3333-3333-333333333333', now(), 35000, 'KES', 'POSTED', 'RETAIL', 'CREDIT', 'INV-RETAIL-003', (now() + interval '7 days'), '{"credit_terms": "14 days", "guarantor": "John Kamau"}', now())
ON CONFLICT DO NOTHING;

INSERT INTO transaction_lines (id, transaction_id, description, sku, quantity, unit_price, total_line_amount, account_code, metadata, created_at)
VALUES
  ('cccccccc-cccc-cccc-cccc-cccc-cccccccccc', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Sony PlayStation 5', 'SONY-001', 1, 35000, 35000, '200-SALES', '{"edition": "Digital Edition", "warranty": "1 year"}', now())
ON CONFLICT DO NOTHING;

-- ============================================
-- SERVICE TRANSACTIONS
-- ============================================

-- Service Transaction 1: DJ Service (Posted)
INSERT INTO transactions (id, tenant_id, entity_id, created_by_user_id, transaction_date, total_amount, currency_code, status, type, payment_status, reference, metadata, created_at)
VALUES
  ('dddddddd-dddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', now(), 25000, 'KES', 'POSTED', 'SERVICE', 'PAID', 'INV-SERVICE-001', '{"event_type": "wedding", "hours": 4, "skill_level": "Senior"}', now())
ON CONFLICT DO NOTHING;

INSERT INTO transaction_lines (id, transaction_id, description, sku, quantity, unit_price, total_line_amount, account_code, metadata, created_at)
VALUES
  ('eeeeeeee-eeee-eeee-eeee-eeee-eeeeeeeeee', 'dddddddd-dddd-dddd-dddd-dddd-dddddddddddd', 'DJ Consultation & Equipment', 'DJ-001', 4, 6250, 25000, '300-SERVICE-INCOME', '{"equipment": "speakers, mixer, lights", "start_time": "18:00", "end_time": "22:00"}', now())
ON CONFLICT DO NOTHING;

-- Service Transaction 2: Photography Service (Draft)
INSERT INTO transactions (id, tenant_id, entity_id, created_by_user_id, transaction_date, total_amount, currency_code, status, type, payment_status, reference, metadata, created_at)
VALUES
  ('ffffffff-ffff-ffff-ffff-ffff-ffff-ffffffffffff', '22222222-2222-2222-2222-222222222222', 'dddddddd-dddd-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333', now(), 15000, 'KES', 'DRAFT', 'SERVICE', 'PENDING', 'INV-SERVICE-002', '{"service_type": "portrait", "location": "studio", "duration_hours": 2}', now())
ON CONFLICT DO NOTHING;

INSERT INTO transaction_lines (id, transaction_id, description, sku, quantity, unit_price, total_line_amount, account_code, metadata, created_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'ffffffff-ffff-ffff-ffff-ffff-ffffffffffff', 'Portrait Photography Session', 'PHOTO-001', 2, 7500, 15000, '300-SERVICE-INCOME', '{"includes": "editing", "deliverables": "20 edited photos"}', now())
ON CONFLICT DO NOTHING;

-- ============================================
-- RENTAL TRANSACTIONS
-- ============================================

-- Rental Transaction 1: Camera Rental (Posted)
INSERT INTO transactions (id, tenant_id, entity_id, created_by_user_id, transaction_date, total_amount, currency_code, status, type, payment_status, reference, metadata, created_at)
VALUES
  ('22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccc-cccccccccc', '33333333-3333-3333-3333-333333333333', now(), 10500, 'KES', 'POSTED', 'RENTAL', 'PAID', 'INV-RENTAL-001', '{"rental_days": 7, "daily_rate": 1500, "deposit_held": 5000, "serial_number": "SN-998877"}', now())
ON CONFLICT DO NOTHING;

INSERT INTO transaction_lines (id, transaction_id, description, sku, quantity, unit_price, total_line_amount, account_code, metadata, created_at)
VALUES
  ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'Canon EOS R5 Camera', 'CANON-001', 7, 1500, 10500, '400-RENTAL-INCOME', '{"condition_out": "New", "insurance_waiver": true, "return_date": "2024-02-05"}', now())
ON CONFLICT DO NOTHING;

-- Rental Transaction 2: Equipment Rental (Draft with Credit)
INSERT INTO transactions (id, tenant_id, entity_id, created_by_user_id, transaction_date, total_amount, currency_code, status, type, payment_status, reference, due_date, metadata, created_at)
VALUES
  ('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'dddddddd-dddd-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333', now(), 21000, 'KES', 'DRAFT', 'RENTAL', 'CREDIT', 'INV-RENTAL-002', (now() + interval '14 days'), '{"rental_days": 3, "daily_rate": 7000, "deposit_held": 0, "equipment_type": "sound_system"}', now())
ON CONFLICT DO NOTHING;

INSERT INTO transaction_lines (id, transaction_id, description, sku, quantity, unit_price, total_line_amount, account_code, metadata, created_at)
VALUES
  ('55555555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444444', 'PA System Rental (3 days)', 'AUDIO-001', 3, 7000, 21000, '400-RENTAL-INCOME', '{"includes": "speakers, subwoofer, amplifier", "condition_out": "Good"}', now())
ON CONFLICT DO NOTHING;

-- ============================================
-- PAYMENT RECORDS (Split Payments)
-- ============================================

-- Payment Records for Retail Transaction 1 (Split: Cash + M-Pesa)
INSERT INTO payment_records (id, transaction_id, method, amount, reference, paid_at, metadata, created_at)
VALUES
  ('66666666-6666-6666-6666-666666666666', '55555555-5555-5555-5555-555555555555', 'CASH', 10000, 'CASH-001', now(), '{"payment_source": "counter"}', now()),
  ('77777777-7777-7777-7777-777777777777', '55555555-5555-5555-5555-555555555555', 'MPESA', 8000, 'MPESA-001', now(), '{"receipt": "KES1234567890"}', now())
ON CONFLICT DO NOTHING;

-- Payment Records for Service Transaction 1 (Partial Payment)
INSERT INTO payment_records (id, transaction_id, method, amount, reference, paid_at, metadata, created_at)
VALUES
  ('88888888-8888-8888-8888-888888888888', 'dddddddd-dddd-dddd-dddd-dddd-dddddddddddd', 'MPESA', 15000, 'MPESA-002', now(), '{"receipt": "KES9876543210"}', now())
ON CONFLICT DO NOTHING;

-- ============================================
-- ATTACHMENTS (Sample Files)
-- ============================================

-- Note: In a real scenario, these would be actual file uploads to Supabase Storage
-- For testing, we're creating placeholder records

INSERT INTO attachments (id, entity_id, transaction_id, file_name, file_type, file_url, uploaded_by_user_id, metadata, created_at)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '55555555-5555-5555-5555-555555555555', 'receipt_retail_001.jpg', 'IMAGE', 'https://example.com/receipts/receipt_retail_001.jpg', '33333333-3333-3333-3333-333333333333', '{"file_size": 245678, "upload_source": "mobile_app"}', now()),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'dddddddd-dddd-dddd-dddd-dddd-dddddddddddd', 'invoice_service_001.pdf', 'PDF', 'https://example.com/invoices/invoice_service_001.pdf', '33333333-3333-3333-3333-333333333333', '{"file_size": 156789, "document_type": "invoice"}', now()),
  ('cccccccc-cccc-cccc-cccc-cccc-cccccccccc', 'cccccccc-cccc-cccc-cccc-cccc-cccccccccc', '22222222-2222-2222-2222-222222222222', 'contract_rental_001.pdf', 'PDF', 'https://example.com/contracts/contract_rental_001.pdf', '33333333-3333-3333-3333-333333333333', '{"file_size": 234567, "document_type": "rental_contract"}', now())
ON CONFLICT DO NOTHING;

-- ============================================
-- SUMMARY
-- ============================================

-- Total Entities: 7 (5 customers + 2 suppliers)
-- Total Transactions: 6 (2 retail, 2 service, 2 rental)
-- Total Payment Records: 3
-- Total Attachments: 3

-- Transaction Status Distribution:
-- - POSTED: 3
-- - DRAFT: 3
-- - CREDIT: 1

-- Transaction Type Distribution:
-- - RETAIL: 3
-- - SERVICE: 2
-- - RENTAL: 1

-- Payment Methods:
-- - CASH: 1
-- - MPESA: 2
-- - CREDIT: 1
