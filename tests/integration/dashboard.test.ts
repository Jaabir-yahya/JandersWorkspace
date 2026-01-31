import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../api/src/app.module';

describe('Dashboard Integration Tests', () => {
  let app: INestApplication;

  const testTenantId = '00000000-0000-0000-0000-000000000000';

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

  describe('GET /api/v1/dashboard/metrics', () => {
    it('should return dashboard metrics', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/dashboard/metrics')
        .query({ tenant_id: testTenantId })
        .expect(200);

      expect(response.body).toHaveProperty('total_transactions');
      expect(response.body).toHaveProperty('total_amount');
      expect(response.body).toHaveProperty('by_payment_method');
      expect(response.body).toHaveProperty('by_type');
      expect(response.body).toHaveProperty('recent_transactions');
    });

    it('should filter metrics by date range', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const response = await request(app.getHttpServer())
        .get('/api/v1/dashboard/metrics')
        .query({
          tenant_id: testTenantId,
          start_date: startDate.toISOString(),
          end_date: new Date().toISOString(),
        })
        .expect(200);

      expect(response.body).toHaveProperty('total_transactions');
    });
  });

  describe('GET /api/v1/dashboard/reconciliation', () => {
    it('should return reconciliation summary', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/dashboard/reconciliation')
        .query({ tenant_id: testTenantId })
        .expect(200);

      expect(response.body).toHaveProperty('total_expected');
      expect(response.body).toHaveProperty('total_received');
      expect(response.body).toHaveProperty('variance');
      expect(response.body).toHaveProperty('by_method');
    });
  });
});
