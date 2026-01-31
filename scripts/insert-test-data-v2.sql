-- Phase 3 Test Data Population (Simplified)
-- This script inserts test data directly into the database

-- Insert User
INSERT INTO users (id, tenant_id, phone_number, email, display_name, role, metadata)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '+254700000000',
    'admin@example.com',
    'System Admin',
    'ADMIN',
    '{}'::jsonb
)
ON CONFLICT (tenant_id, phone_number) DO NOTHING;

-- Insert Entities
INSERT INTO entities (id, tenant_id, type, display_name, phone_number, metadata, created_by_user_id)
VALUES 
    (
        '10000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000001',
        'CUSTOMER',
        'John Kamau',
        '+254712345678',
        '{"email": "john@example.com", "address": "Nairobi, Kenya", "tax_id": "TAX-001"}'::jsonb,
        '00000000-0000-0000-0000-000000000001'
    ),
    (
        '10000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0000-000000000001',
        'CUSTOMER',
        'Mary Wanjiku',
        '+254723456789',
        '{"email": "mary@example.com", "address": "Mombasa, Kenya", "tax_id": "TAX-002"}'::jsonb,
        '00000000-0000-0000-0000-000000000001'
    ),
    (
        '10000000-0000-0000-0000-000000000003',
        '00000000-0000-0000-0000-000000000001',
        'SUPPLIER',
        'ABC Electronics Ltd',
        '+254745678901',
        '{"email": "sales@abcelectronics.com", "address": "Industrial Area, Nairobi", "tax_id": "TAX-003"}'::jsonb,
        '00000000-0000-0000-0000-000000000001'
    )
ON CONFLICT (tenant_id, phone_number) DO NOTHING;

-- Insert Transactions (RETAIL) - DRAFT status
INSERT INTO transactions (id, tenant_id, entity_id, type, currency_code, status, payment_status, created_by_user_id, metadata)
VALUES 
    (
        '20000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000001',
        '10000000-0000-0000-0000-000000000001',
        'RETAIL',
        'KES',
        'DRAFT',
        'PENDING',
        '00000000-0000-0000-0000-000000000001',
        '{"reference": "INV-001"}'::jsonb
    ),
    (
        '20000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0000-000000000001',
        '10000000-0000-0000-0000-000000000003',
        'RETAIL',
        'KES',
        'DRAFT',
        'PENDING',
        '00000000-0000-0000-0000-000000000001',
        '{"reference": "INV-002"}'::jsonb
    )
ON CONFLICT DO NOTHING;

-- Insert Transaction Lines for RETAIL
INSERT INTO transaction_lines (id, transaction_id, description, sku, quantity, unit_price, total_line_amount, account_code, metadata)
VALUES 
    (
        '30000000-0000-0000-0000-000000000001',
        '20000000-0000-0000-0000-000000000001',
        'Laptop Stand',
        'SKU-001',
        5,
        3000,
        15000,
        '200-SALES',
        '{"product_name": "Laptop Stand"}'::jsonb
    ),
    (
        '30000000-0000-0000-0000-000000000002',
        '20000000-0000-0000-000000000002',
        'Wireless Mouse',
        'SKU-002',
        10,
        5000,
        50000,
        '200-SALES',
        '{"product_name": "Wireless Mouse"}'::jsonb
    )
ON CONFLICT DO NOTHING;

-- Insert Transactions (SERVICE) - DRAFT status
INSERT INTO transactions (id, tenant_id, entity_id, type, currency_code, status, payment_status, created_by_user_id, metadata)
VALUES 
    (
        '20000000-0000-0000-0000-000000000003',
        '00000000-0000-0000-0000-000000000001',
        '10000000-0000-0000-0000-000000000002',
        'SERVICE',
        'KES',
        'DRAFT',
        'PENDING',
        '00000000-0000-0000-0000-000000000001',
        '{"reference": "INV-003"}'::jsonb
    )
ON CONFLICT DO NOTHING;

-- Insert Transaction Lines for SERVICE
INSERT INTO transaction_lines (id, transaction_id, description, quantity, unit_price, total_line_amount, account_code, metadata)
VALUES 
    (
        '30000000-0000-0000-0000-000000000003',
        '20000000-0000-0000-000000000003',
        10,
        2500,
        25000,
        '200-SALES',
        '{"service_type": "CONSULTING", "hours": 10, "hourly_rate": 2500}'::jsonb
    )
ON CONFLICT DO NOTHING;

-- Insert Transactions (RENTAL) - DRAFT status
INSERT INTO transactions (id, tenant_id, entity_id, type, currency_code, status, payment_status, created_by_user_id, metadata)
VALUES 
    (
        '20000000-0000-0000-0000-000000000004',
        '00000000-0000-0000-0000-000000000001',
        '10000000-0000-0000-0000-000000000001',
        'RENTAL',
        'KES',
        'DRAFT',
        'PENDING',
        '00000000-0000-0000-0000-000000000001',
        '{"reference": "INV-004"}'::jsonb
    )
ON CONFLICT DO NOTHING;

-- Insert Transaction Lines for RENTAL
INSERT INTO transaction_lines (id, transaction_id, description, quantity, unit_price, total_line_amount, account_code, metadata)
VALUES 
    (
        '30000000-0000-0000-0000-000000000004',
        '20000000-0000-0000-000000000004',
        1,
        12000,
        12000,
        '200-SALES',
        '{"item_name": "Projector", "rental_period_days": 7, "daily_rate": 1500, "deposit": 5000, "return_date": "2026-02-05"}'::jsonb
    )
ON CONFLICT DO NOTHING;

-- Insert Payments
INSERT INTO payments (id, tenant_id, amount, currency_code, status, reference, created_by_user_id, metadata)
VALUES 
    (
        '40000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000001',
        10000,
        'KES',
        'SETTLED',
        'MPESA-REF-001',
        '00000000-0000-0000-0000-000000000001',
        '{"method": "M-PESA"}'::jsonb
    ),
    (
        '40000000-0000-0000-000000000002',
        '00000000-0000-0000-0000-000000000001',
        15000,
        'KES',
        'SETTLED',
        'BANK-REF-001',
        '00000000-0000-0000-0000-000000000001',
        '{"method": "BANK_TRANSFER"}'::jsonb
    )
ON CONFLICT DO NOTHING;

-- Apply payments to transactions
INSERT INTO payment_applications (payment_id, transaction_id, applied_amount)
VALUES 
    (
        '40000000-0000-0000-0000-000000000001',
        '20000000-0000-0000-0000-000000000001',
        10000
    ),
    (
        '40000000-0000-0000-000000000002',
        '20000000-0000-0000-000000000003',
        15000
    )
ON CONFLICT DO NOTHING;

-- Update payment status for transactions with payments
UPDATE transactions SET payment_status = 'PARTIAL' WHERE id = '20000000-0000-0000-0000-000000000001';
UPDATE transactions SET payment_status = 'SETTLED' WHERE id = '20000000-0000-0000-000000000003';
