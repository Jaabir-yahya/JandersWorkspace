import { describe, it, beforeAll, expect } from '@jest/globals';
import { supabase } from '../src/supabase/supabase.client';

const TEST_TENANT = '22222222-2222-2222-2222-222222222222';
const TEST_ENTITY = '11111111-1111-1111-1111-111111111111';
const TEST_USER = '33333333-3333-3333-3333-333333333333';

describe('create_transaction function', () => {
  it('should create a RETAIL transaction with valid input', async () => {
    const tenantId = TEST_TENANT;
    const entityId = TEST_ENTITY;
    const createdByUserId = TEST_USER;
    const txnType = 'RETAIL';
    const currencyCode = 'KES';
    const lines = [
      {
        description: 'Nike Shoes',
        sku: 'NIKE-001',
        quantity: 2,
        unit_price: 5000,
        account_code: '200-SALES',
        metadata: { variant: 'Size 40', stock_location: 'Shelf A' },
      },
    ];

    const { data, error } = await supabase
      .rpc('create_transaction', {
        p_tenant_id: tenantId,
        p_entity_id: entityId,
        p_created_by_user_id: createdByUserId,
        p_txn_type: txnType,
        p_currency_code: currencyCode,
        p_lines: lines,
      });

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data[0]).toMatchObject({
      tenant_id: tenantId,
      entity_id: entityId,
      type: txnType,
      status: 'DRAFT',
      total_amount: 10000,
      currency_code: currencyCode,
    });
  });

  it('should create a SERVICE transaction with hours metadata', async () => {
    const tenantId = TEST_TENANT;
    const entityId = TEST_ENTITY;
    const createdByUserId = TEST_USER;
    const txnType = 'SERVICE';
    const currencyCode = 'KES';
    const lines = [
      {
        description: 'DJ Consultation',
        quantity: 4,
        unit_price: 2500,
        account_code: '200-SALES',
        metadata: { 
          hours: 4, 
          project_code: 'PROJ-001', 
          start_time: '18:00', 
          end_time: '22:00',
          skill_level: 'Senior' 
        },
      },
    ];

    const { data, error } = await supabase
      .rpc('create_transaction', {
        p_tenant_id: tenantId,
        p_entity_id: entityId,
        p_created_by_user_id: createdByUserId,
        p_txn_type: txnType,
        p_currency_code: currencyCode,
        p_lines: lines,
      });

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data[0]).toMatchObject({
      tenant_id: tenantId,
      type: txnType,
      status: 'DRAFT',
      total_amount: 10000,
      currency_code: currencyCode,
    });
  });

  it('should create a RENTAL transaction with return_date metadata', async () => {
    const tenantId = TEST_TENANT;
    const entityId = TEST_ENTITY;
    const createdByUserId = TEST_USER;
    const txnType = 'RENTAL';
    const currencyCode = 'KES';
    const lines = [
      {
        description: 'Canon Camera',
        quantity: 7,
        unit_price: 1500,
        account_code: '400-RENTAL-INCOME',
        metadata: { 
          return_date: '2024-02-15',
          serial_number: 'SN-998877',
          deposit_held: 5000,
          condition_out: 'New',
          insurance_waiver: true 
        },
      },
    ];

    const { data, error } = await supabase
      .rpc('create_transaction', {
        p_tenant_id: tenantId,
        p_entity_id: entityId,
        p_created_by_user_id: createdByUserId,
        p_txn_type: txnType,
        p_currency_code: currencyCode,
        p_lines: lines,
      });

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data[0]).toMatchObject({
      tenant_id: tenantId,
      type: txnType,
      status: 'DRAFT',
      total_amount: 10500,
      currency_code: currencyCode,
    });
  });

  it('should fail when lines are empty', async () => {
    const tenantId = TEST_TENANT;
    const entityId = TEST_ENTITY;
    const createdByUserId = TEST_USER;
    const txnType = 'RETAIL';
    const currencyCode = 'KES';
    const lines: any[] = [];

    const { data, error } = await supabase
      .rpc('create_transaction', {
        p_tenant_id: tenantId,
        p_entity_id: entityId,
        p_created_by_user_id: createdByUserId,
        p_txn_type: txnType,
        p_currency_code: currencyCode,
        p_lines: lines,
      });

    expect(data).toBeNull();
    expect(error).toBeDefined();
    expect(error!.message).toContain('lines must be a non-empty array');
  });

  it('should fail when a line is missing quantity or unit_price', async () => {
    const tenantId = TEST_TENANT;
    const entityId = TEST_ENTITY;
    const createdByUserId = TEST_USER;
    const txnType = 'RETAIL';
    const currencyCode = 'KES';
    const lines = [
      {
        description: 'Test Line Item 1',
        unit_price: 5000,
        account_code: '200-SALES',
        metadata: { note: 'Test metadata' },
      },
    ];

    const { data, error } = await supabase
      .rpc('create_transaction', {
        p_tenant_id: tenantId,
        p_entity_id: entityId,
        p_created_by_user_id: createdByUserId,
        p_txn_type: txnType,
        p_currency_code: currencyCode,
        p_lines: lines,
      });

    expect(data).toBeNull();
    expect(error).toBeDefined();
    expect(error!.message).toContain('each line must contain quantity and unit_price');
  });

  it('should enforce immutability on POSTED transactions (LOCK 2)', async () => {
    // First create a transaction
    const { data: createData, error: createError } = await supabase
      .rpc('create_transaction', {
        p_tenant_id: TEST_TENANT,
        p_entity_id: TEST_ENTITY,
        p_created_by_user_id: TEST_USER,
        p_txn_type: 'RETAIL',
        p_currency_code: 'KES',
        p_lines: [{ description: 'Test', quantity: 1, unit_price: 1000, account_code: '200-SALES' }],
      });

    expect(createError).toBeNull();
    const txnId = createData![0].id;

    // Update status to POSTED
    const { error: updateError } = await supabase
      .from('transactions')
      .update({ status: 'POSTED' })
      .eq('id', txnId);

    expect(updateError).toBeNull();

    // Try to delete the posted transaction - should fail
    const { error: deleteError } = await supabase
      .from('transactions')
      .delete()
      .eq('id', txnId);

    expect(deleteError).toBeDefined();
    expect(deleteError!.message).toContain('cannot delete transaction with status');
  });
});
