/**
 * Core API e2e – verifies truth: health, quick-capture, transactions, dashboard.
 * API-first: tests hit real HTTP routes; AuthGuard overridden so protected routes work without JWT.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { ExecutionContext } from '@nestjs/common';
import { AppModule } from '../../apps/api/src/app.module';
import { AuthGuard } from '../../apps/api/src/auth/auth.guard';

const TEST_TENANT_ID = '00000000-0000-0000-0000-000000000000';
const TEST_USER_ID = '00000000-0000-0000-0000-000000000000';
const TEST_ENTITY_ID = 'd60c9094-6df2-47fe-9a35-864455e75a87';

/** Guard that injects a test user so protected routes pass without JWT */
class MockAuthGuard {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    req.user = {
      id: TEST_USER_ID,
      email: 'test@test.local',
      tenantId: TEST_TENANT_ID,
      role: 'admin',
    };
    return true;
  }
}

describe('Core API (e2e) – truth verification', () => {
  let app: INestApplication;
  let createdTransactionId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(AuthGuard)
      .useClass(MockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health (no auth)', () => {
    it('GET /api/v1/health returns 200 and status', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200);
      expect(res.body).toHaveProperty('status');
    });

    it('GET /api/v1/health/ready returns readiness', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/health/ready')
        .expect((r) => expect([200, 503]).toContain(r.status));
      expect(res.body).toHaveProperty('ready');
    });
  });

  describe('Quick-capture (X-Tenant-Id, no JWT)', () => {
    it('POST /api/v1/transactions/quick-capture creates a sale', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/transactions/quick-capture')
        .set('x-tenant-id', TEST_TENANT_ID)
        .send({
          amount: 150,
          description: 'Core e2e sale',
          type: 'sale',
          currency_code: 'KES',
          method: 'CASH',
        })
        .expect(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.reference).toMatch(/^quick-/);
      expect(res.body.total_amount).toBe(150);
      expect(res.body.status).toBe('POSTED');
    });

    it('POST /api/v1/transactions/quick-capture rejects missing X-Tenant-Id', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/transactions/quick-capture')
        .send({ amount: 100, description: 'No tenant', type: 'sale' })
        .expect(400);
    });
  });

  describe('Transactions (with mock auth)', () => {
    it('POST /api/v1/transactions creates and returns POSTED transaction', async () => {
      const createDto = {
        tenant_id: TEST_TENANT_ID,
        created_by_user_id: TEST_USER_ID,
        entity_id: TEST_ENTITY_ID,
        type: 'RETAIL',
        currency_code: 'KES',
        reference: `core-e2e-${Date.now()}`,
        context: 'Core API e2e',
        tags: ['e2e', 'core'],
        lines: [
          {
            description: 'E2E product',
            quantity: 1,
            unit_price: 500,
            account_code: '200-SALES',
          },
        ],
        payment_records: [{ method: 'CASH', amount: 500 }],
      };
      const res = await request(app.getHttpServer())
        .post('/api/v1/transactions')
        .set('Authorization', 'Bearer mock')
        .send(createDto)
        .expect(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.reference).toBe(createDto.reference);
      expect(res.body.total_amount).toBe(500);
      expect(res.body.status).toBe('POSTED');
      createdTransactionId = res.body.id;
    });

    it('GET /api/v1/transactions returns list for tenant', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/transactions')
        .query({ tenant_id: TEST_TENANT_ID })
        .set('Authorization', 'Bearer mock')
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('GET /api/v1/transactions/:id returns one transaction', async () => {
      if (!createdTransactionId) return;
      const res = await request(app.getHttpServer())
        .get(`/api/v1/transactions/${createdTransactionId}`)
        .query({ tenant_id: TEST_TENANT_ID })
        .set('Authorization', 'Bearer mock')
        .expect(200);
      expect(res.body.id).toBe(createdTransactionId);
      expect(res.body).toHaveProperty('lines');
    });

    it('POST /api/v1/transactions/:id/reverse reverses transaction', async () => {
      if (!createdTransactionId) return;
      const res = await request(app.getHttpServer())
        .post(`/api/v1/transactions/${createdTransactionId}/reverse`)
        .set('Authorization', 'Bearer mock')
        .send({ tenant_id: TEST_TENANT_ID, reason: 'E2e reversal' })
        .expect(201);
      expect(res.body.status).toBe('REVERSED');
    });
  });

  describe('Dashboard (with mock auth)', () => {
    it('GET /api/v1/dashboard/stats returns stats for tenant', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/dashboard/stats')
        .query({ tenant_id: TEST_TENANT_ID })
        .set('Authorization', 'Bearer mock')
        .expect(200);
      expect(res.body).toHaveProperty('tenantId', TEST_TENANT_ID);
    });
  });
});
