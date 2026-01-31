import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../apps/api/src/app.module';

describe('TransactionsController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /transactions', () => {
    it('should create a new transaction', () => {
      return request(app.getHttpServer())
        .post('/transactions')
        .send({
          tenant_id: '550e8400-e29b-41d4-a716-446655440000',
          created_by_user_id: '550e8400-e29b-41d4-a716-446655440001',
          type: 'RETAIL',
          currency_code: 'KES',
          lines: [
            {
              description: 'Test Product',
              quantity: 1,
              unit_price: 100,
              account_code: '200-SALES',
            },
          ],
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.status).toBe('DRAFT');
          expect(res.body.totalAmount).toBe(100);
        });
    });

    it('should validate required fields', () => {
      return request(app.getHttpServer())
        .post('/transactions')
        .send({
          tenant_id: '550e8400-e29b-41d4-a716-446655440000',
        })
        .expect(400);
    });
  });

  describe('GET /transactions', () => {
    it('should return transactions for a tenant', () => {
      return request(app.getHttpServer())
        .get('/transactions')
        .query({ tenant_id: '550e8400-e29b-41d4-a716-446655440000' })
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('POST /transactions/:id/post', () => {
    it('should post a draft transaction', async () => {
      // First create a transaction
      const createRes = await request(app.getHttpServer())
        .post('/transactions')
        .send({
          tenant_id: '550e8400-e29b-41d4-a716-446655440000',
          created_by_user_id: '550e8400-e29b-41d4-a716-446655440001',
          type: 'RETAIL',
          currency_code: 'KES',
          lines: [
            {
              description: 'Test Product',
              quantity: 1,
              unit_price: 100,
              account_code: '200-SALES',
            },
          ],
        });

      const transactionId = createRes.body.id;

      // Then post it
      return request(app.getHttpServer())
        .post(`/transactions/${transactionId}/post`)
        .send({
          user_id: '550e8400-e29b-41d4-a716-446655440001',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('POSTED');
        });
    });
  });
});
