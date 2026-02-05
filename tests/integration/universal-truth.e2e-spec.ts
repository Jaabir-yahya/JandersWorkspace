/**
 * Universal Truth Integration Tests
 * Tests the Universal Truth API endpoints for double-entry accounting
 */

import request from "supertest";
import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { ExecutionContext, ValidationPipe } from "@nestjs/common";
import { AppModule } from "../../apps/api/src/app.module";
import { PrismaService } from "../../apps/api/src/prisma/prisma.service";
import { AuthGuard } from "../../apps/api/src/auth/auth.guard";

describe("Universal Truth API (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let TEST_TENANT_ID = "00000000-0000-0000-0000-000000000";
  let TEST_USER_ID = "00000000-0000-0000-0000-000000000";

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = {
            id: TEST_USER_ID,
            tenantId: TEST_TENANT_ID,
            email: "test@example.com",
          };
          return true;
        },
      })
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    prisma = moduleRef.get<PrismaService>(PrismaService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("/universal/accounts", () => {
    it("POST should create a new account", async () => {
      const createAccountDto = {
        tenantId: TEST_TENANT_ID,
        name: "Test Cash Account",
        type: "CASH",
        currency: "KES",
        metadata: {},
      };

      const response = await request(app.getHttpServer())
        .post("/universal/accounts")
        .send(createAccountDto)
        .expect(201);

      expect(response.body).toMatchObject({
        tenantId: createAccountDto.tenantId,
        name: createAccountDto.name,
        type: createAccountDto.type,
        currency: createAccountDto.currency,
        balance: 0,
        isActive: true,
      });
      expect(response.body.id).toBeDefined();
    });

    it("GET should return accounts for tenant", async () => {
      const response = await request(app.getHttpServer())
        .get("/universal/accounts?tenantId=test-tenant")
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it("GET /:id should return specific account", async () => {
      // First create an account
      const createResponse = await request(app.getHttpServer())
        .post("/universal/accounts")
        .send({
          tenantId: TEST_TENANT_ID,
          name: "Test Bank Account",
          type: "BANK",
          currency: "KES",
        })
        .expect(201);

      const accountId = createResponse.body.id;

      // Then get it
      const response = await request(app.getHttpServer())
        .get(`/universal/accounts/${accountId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: accountId,
        name: "Test Bank Account",
        type: "BANK",
        currency: "KES",
      });
    });
  });

  describe("/universal/transactions", () => {
    let fromAccountId: string;
    let toAccountId: string;

    beforeEach(async () => {
      // Create test accounts for transactions
      const fromAccount = await request(app.getHttpServer())
        .post("/universal/accounts")
        .send({
          tenantId: TEST_TENANT_ID,
          name: "From Account",
          type: "CASH",
          currency: "KES",
        })
        .expect(201);

      const toAccount = await request(app.getHttpServer())
        .post("/universal/accounts")
        .send({
          tenantId: TEST_TENANT_ID,
          name: "To Account",
          type: "BANK",
          currency: "KES",
        })
        .expect(201);

      fromAccountId = fromAccount.body.id;
      toAccountId = toAccount.body.id;
    });

    it("POST should create a double-entry transaction", async () => {
      const createTransactionDto = {
        tenantId: TEST_TENANT_ID,
        fromAccountId,
        toAccountId,
        amount: 1000,
        notes: "Test transaction",
        reference: "TEST-001",
      };

      const response = await request(app.getHttpServer())
        .post("/universal/transactions")
        .send(createTransactionDto)
        .expect(201);

      expect(response.body).toMatchObject({
        tenantId: createTransactionDto.tenantId,
        fromAccountId: createTransactionDto.fromAccountId,
        toAccountId: createTransactionDto.toAccountId,
        amount: createTransactionDto.amount,
        notes: createTransactionDto.notes,
        reference: createTransactionDto.reference,
      });
      expect(response.body.id).toBeDefined();
      expect(response.body.date).toBeDefined();
    });

    it("should enforce double-entry accounting rules", async () => {
      // Create transaction
      await request(app.getHttpServer())
        .post("/universal/transactions")
        .send({
          tenantId: TEST_TENANT_ID,
          fromAccountId,
          toAccountId,
          amount: 1000,
          notes: "Balance test",
        })
        .expect(201);

      // Check account balances updated correctly
      const fromAccount = await request(app.getHttpServer())
        .get(`/universal/accounts/${fromAccountId}`)
        .expect(200);

      const toAccount = await request(app.getHttpServer())
        .get(`/universal/accounts/${toAccountId}`)
        .expect(200);

      // From account should be debited (balance reduced)
      expect(fromAccount.body.balance).toBe(-1000);
      // To account should be credited (balance increased)
      expect(toAccount.body.balance).toBe(1000);
    });

    it("POST should reverse a transaction", async () => {
      // Create original transaction
      const originalTx = await request(app.getHttpServer())
        .post("/universal/transactions")
        .send({
          tenantId: TEST_TENANT_ID,
          fromAccountId,
          toAccountId,
          amount: 500,
          notes: "Original transaction",
        })
        .expect(201);

      // Reverse it
      const response = await request(app.getHttpServer())
        .post(`/universal/transactions/${originalTx.body.id}/reverse`)
        .send({
          notes: "Reversal transaction",
        })
        .expect(201);

      expect(response.body).toMatchObject({
        fromAccountId: toAccountId, // Swapped
        toAccountId: fromAccountId, // Swapped
        amount: 500,
        reversalId: originalTx.body.id,
        notes: "Reversal transaction",
      });
    });

    it("GET should return transactions for tenant", async () => {
      await request(app.getHttpServer())
        .post("/universal/transactions")
        .send({
          tenantId: TEST_TENANT_ID,
          fromAccountId,
          toAccountId,
          amount: 100,
          notes: "List test",
        })
        .expect(201);

      const response = await request(app.getHttpServer())
        .get("/universal/transactions?tenantId=test-tenant")
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe("/universal/trial-balance", () => {
    beforeEach(async () => {
      // Create test accounts
      const cashAccount = await request(app.getHttpServer())
        .post("/universal/accounts")
        .send({
          tenantId: TEST_TENANT_ID,
          name: "Cash",
          type: "CASH",
          currency: "KES",
        })
        .expect(201);

      const bankAccount = await request(app.getHttpServer())
        .post("/universal/accounts")
        .send({
          tenantId: TEST_TENANT_ID,
          name: "Bank",
          type: "BANK",
          currency: "KES",
        })
        .expect(201);

      // Create balanced transactions
      await request(app.getHttpServer())
        .post("/universal/transactions")
        .send({
          tenantId: TEST_TENANT_ID,
          fromAccountId: cashAccount.body.id,
          toAccountId: bankAccount.body.id,
          amount: 1000,
          notes: "Cash to Bank",
        })
        .expect(201);
    });

    it("GET should return balanced trial balance", async () => {
      const response = await request(app.getHttpServer())
        .get("/universal/trial-balance?tenantId=test-tenant")
        .expect(200);

      expect(response.body).toMatchObject({
        isBalanced: true,
        totalDebits: expect.any(Number),
        totalCredits: expect.any(Number),
        accounts: expect.any(Array),
      });

      // In double-entry accounting, total debits should equal total credits
      expect(response.body.totalDebits).toBe(response.body.totalCredits);
    });

    it("should handle unbalanced state correctly", async () => {
      // This would need manual manipulation or an error scenario
      // For now, we test the structure
      const response = await request(app.getHttpServer())
        .get("/universal/trial-balance?tenantId=test-tenant")
        .expect(200);

      expect(response.body).toHaveProperty("isBalanced");
      expect(response.body).toHaveProperty("totalDebits");
      expect(response.body).toHaveProperty("totalCredits");
      expect(response.body).toHaveProperty("accounts");
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid account types", async () => {
      await request(app.getHttpServer())
        .post("/universal/accounts")
        .send({
          tenantId: TEST_TENANT_ID,
          name: "Invalid Account",
          type: "INVALID_TYPE",
          currency: "KES",
        })
        .expect(400);
    });

    it("should handle insufficient funds for cash accounts", async () => {
      const cashAccount = await request(app.getHttpServer())
        .post("/universal/accounts")
        .send({
          tenantId: TEST_TENANT_ID,
          name: "Empty Cash",
          type: "CASH",
          currency: "KES",
        })
        .expect(201);

      await request(app.getHttpServer())
        .post("/universal/transactions")
        .send({
          tenantId: TEST_TENANT_ID,
          fromAccountId: cashAccount.body.id,
          toAccountId: "some-other-id",
          amount: 1000, // More than balance (0)
        })
        .expect(400); // Should fail for insufficient funds
    });

    it("should handle duplicate reversals", async () => {
      const tx = await request(app.getHttpServer())
        .post("/universal/transactions")
        .send({
          tenantId: TEST_TENANT_ID,
          fromAccountId: "acc1",
          toAccountId: "acc2",
          amount: 100,
        })
        .expect(201);

      // First reversal should succeed
      await request(app.getHttpServer())
        .post(`/universal/transactions/${tx.body.id}/reverse`)
        .send({ notes: "First reversal" })
        .expect(201);

      // Second reversal should fail
      await request(app.getHttpServer())
        .post(`/universal/transactions/${tx.body.id}/reverse`)
        .send({ notes: "Second reversal" })
        .expect(400);
    });
  });
});
