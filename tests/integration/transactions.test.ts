import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../api/src/app.module';
import { CreateTransactionDto } from '../../api/src/transactions/dto/create-transaction.dto';

describe('Transactions Integration Tests', () => {
  let app: INestApplication;
  let createdTransactionId: string;

  const testTenantId = '00000000-0000-0000-0000-000000000000';
  const testUserId = '00000000-0000-0000-0000-000000000000';
  const testEntityId = 'd60c9094-6df2-47fe-9a35-864455e75a87';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/transactions', () => {
    it('should create a transaction with split payments', async () => {
      const createDto: CreateTransactionDto = {
        tenant_id: testTenantId,
        created_by_user_id: testUserId,
        entity_id: testEntityId,
        type: 'RETAIL',
        currency_code: 'KES',
        reference: `TEST-${Date.now()}`,
        context: 'Integration test transaction',
        tags: ['test', 'integration'],
        lines: [
          {
            description: 'Test Product',
            quantity: 2,
            unit_price: 1000,
            sku: 'TEST-SKU-001',
            account_code: 'SALES',
          },
        ],
        payment_records: [
          { method: 'CASH', amount: 1000, reference: 'CASH-TEST-001' },
          { method: 'M-PESA', amount: 1000, reference: 'MPESA-TEST-001' },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/transactions')
        .send(createDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.reference).toBe(createDto.reference);
      expect(response.body.total_amount).toBe(2000);
      expect(response.body.status).toBe('POSTED');
      expect(response.body.lines).toHaveLength(1);
      expect(response.body.payment_records).toHaveLength(2);

      createdTransactionId = response.body.id;
    });

    it('should reject invalid transaction data', async () => {
      const invalidDto = {
        tenant_id: testTenantId,
        // Missing required fields
      };

      await request(app.getHttpServer())
        .post('/api/v1/transactions')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('GET /api/v1/transactions', () => {
    it('should search transactions by reference', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/transactions')
        .query({ tenant_id: testTenantId, search: 'TEST-' })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should filter transactions by type', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/transactions')
        .query({ tenant_id: testTenantId, type: 'RETAIL' })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((tx: any) => {
        expect(tx.type).toBe('RETAIL');
      });
    });

    it('should filter transactions by date range', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      
      const response = await request(app.getHttpServer())
        .get('/api/v1/transactions')
        .query({
          tenant_id: testTenantId,
          start_date: startDate.toISOString(),
          end_date: new Date().toISOString(),
        })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/v1/transactions/:id', () => {
    it('should get transaction by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/transactions/${createdTransactionId}`)
        .query({ tenant_id: testTenantId })
        .expect(200);

      expect(response.body.id).toBe(createdTransactionId);
      expect(response.body).toHaveProperty('lines');
      expect(response.body).toHaveProperty('payment_records');
    });

    it('should return 404 for non-existent transaction', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/transactions/00000000-0000-0000-0000-000000000000')
        .query({ tenant_id: testTenantId })
        .expect(404);
    });
  });

  describe('POST /api/v1/transactions/:id/reverse', () => {
    it('should reverse a transaction', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/transactions/${createdTransactionId}/reverse`)
        .send({
          tenant_id: testTenantId,
          reason: 'Integration test reversal',
        })
        .expect(201);

      expect(response.body.status).toBe('REVERSED');
      expect(response.body).toHaveProperty('reversal_of_transaction_id');
    });

    it('should prevent double reversal', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/transactions/${createdTransactionId}/reverse`)
        .send({
          tenant_id: testTenantId,
          reason: 'Should fail',
        })
        .expect(400);
    });
  });
});
