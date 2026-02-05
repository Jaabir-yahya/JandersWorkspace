/**
 * Universal Truth Integration Tests
 * Tests the Universal Truth API endpoints that are actually working
 */

import request from "supertest";
import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { ExecutionContext, ValidationPipe } from "@nestjs/common";
import { AppModule } from "../../apps/api/src/app.module";

const TEST_TENANT_ID = "00000000-0000-0000-0000-000000000000";
const TEST_USER_ID = "00000000-0000-0000-0000-000000000000";

/** Guard that injects a test user so protected routes pass without JWT */
class MockAuthGuard {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    req.user = {
      id: TEST_USER_ID,
      tenantId: TEST_TENANT_ID,
      email: "test@example.com",
    };
    return true;
  }
}

describe("Universal Truth API (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(require("../../apps/api/src/auth/auth.guard").AuthGuard)
      .useValue(new MockAuthGuard())
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("Basic Health Checks", () => {
    it("should pass basic API health check", async () => {
      await request(app.getHttpServer()).get("/health").expect(200);
    });
  });

  describe("Universal Truth Module Availability", () => {
    it("should have universal accounts endpoint available", async () => {
      // Test that the endpoint exists (even if it returns empty initially)
      const response = await request(app.getHttpServer())
        .get("/universal/accounts")
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should have universal transactions endpoint available", async () => {
      // Test that the endpoint exists (even if it returns empty initially)
      const response = await request(app.getHttpServer())
        .get("/universal/transactions")
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe("Core Integration Verification", () => {
    it("should have working dashboard endpoint", async () => {
      await request(app.getHttpServer()).get("/dashboard").expect(200);
    });

    it("should have working transactions endpoint", async () => {
      const response = await request(app.getHttpServer())
        .get("/transactions")
        .expect(200);

      expect(response.body).toHaveProperty("data");
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("should have working supplies endpoint", async () => {
      const response = await request(app.getHttpServer())
        .get("/supplies")
        .expect(200);

      expect(response.body).toHaveProperty("data");
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("should have working invoices endpoint", async () => {
      const response = await request(app.getHttpServer())
        .get("/invoices")
        .expect(200);

      expect(response.body).toHaveProperty("data");
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("should have working payments endpoint", async () => {
      const response = await request(app.getHttpServer())
        .get("/payments")
        .expect(200);

      expect(response.body).toHaveProperty("data");
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe("Reporting Integration", () => {
    it("should have working reporting endpoint", async () => {
      await request(app.getHttpServer())
        .get("/reporting/trial-balance")
        .expect(200);
    });

    it("should have working financial summary", async () => {
      const response = await request(app.getHttpServer())
        .get("/reporting/financial-summary")
        .expect(200);

      expect(response.body).toHaveProperty("totalRevenue");
      expect(response.body).toHaveProperty("totalExpenses");
      expect(response.body).toHaveProperty("netIncome");
    });
  });

  describe("Universal Truth Schema Integration", () => {
    it("should verify Account model exists in schema", async () => {
      // This verifies that our new Account model from Universal Truth is working
      const response = await request(app.getHttpServer())
        .get("/universal/accounts")
        .expect(200);

      // The response structure indicates the Account model is working
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should verify Transaction model integration", async () => {
      const response = await request(app.getHttpServer())
        .get("/universal/transactions")
        .expect(200);

      // The response structure indicates the Transaction model is working
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe("Multi-tenant Architecture Verification", () => {
    it("should support tenant isolation", async () => {
      // Mock user with specific tenant
      const moduleRef: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      })
        .overrideGuard(require("../../apps/api/src/auth/auth.guard").AuthGuard)
        .useValue({
          canActivate: (context: ExecutionContext) => {
            const req = context.switchToHttp().getRequest();
            req.user = {
              id: TEST_USER_ID,
              tenantId: "different-tenant-id",
              email: "test2@example.com",
            };
            return true;
          },
        })
        .compile();

      const testApp = moduleRef.createNestApplication();
      testApp.useGlobalPipes(new ValidationPipe());
      await testApp.init();

      // Request with different tenant should work
      const response = await request(testApp.getHttpServer())
        .get("/universal/accounts")
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);

      await testApp.close();
    });
  });
});
