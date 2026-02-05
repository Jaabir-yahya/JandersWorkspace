// E2E test IDs (match core-api.e2e-spec.ts) so user/tenant resolution and transaction create work
const E2E_TENANT_ID = "00000000-0000-0000-0000-000000000000";
const E2E_USER_ID = "00000000-0000-0000-0000-000000000000";
const E2E_ENTITY_ID = "d60c9094-6df2-47fe-9a35-864455e75a87";

const e2eUser = {
  id: E2E_USER_ID,
  tenantId: E2E_TENANT_ID,
  email: "test@test.local",
  metadata: { manual_capture: true },
  displayName: "Test User",
  phoneNumber: null,
  role: "user",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const fakeTxn = {
  id: "e2e00000-0000-0000-0000-000000000001",
  reference: "e2e-ref",
  amount: 500,
  status: "POSTED",
  paymentStatus: "PENDING",
  tenantId: E2E_TENANT_ID,
  entityId: E2E_ENTITY_ID,
  createdByUserId: E2E_USER_ID,
  type: "RETAIL",
  metadata: {},
  createdAt: new Date(),
  updatedAt: new Date(),
  lines: [],
  entity: { id: E2E_ENTITY_ID, name: "Test Entity", phone: null },
};

function createTxMock() {
  const createTxn = jest.fn().mockImplementation((args: { data?: { reference?: string; amount?: number; status?: string; lines?: unknown }; include?: unknown }) => {
    const data = args?.data ?? {};
    const ref = data.reference ?? "e2e-ref";
    const amount = data.amount ?? 500;
    const status = data.status === "REVERSED" ? "REVERSED" : "POSTED";
    const out = { ...fakeTxn, reference: ref, amount, total_amount: Math.abs(amount), status, lines: data.lines ?? [], entity: { id: E2E_ENTITY_ID, name: "Test Entity", phone: null } };
    return Promise.resolve(out);
  });
  return {
    transaction: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockImplementation((args: { where?: { id?: string } }) => (args?.where?.id === fakeTxn.id ? Promise.resolve({ ...fakeTxn, lines: [], entity: { id: E2E_ENTITY_ID, name: "Test Entity", phone: null } }) : Promise.resolve(null))),
      findFirst: jest.fn().mockResolvedValue(null),
      create: createTxn,
      update: jest.fn().mockResolvedValue({ ...fakeTxn, status: "REVERSED" }),
      delete: jest.fn().mockResolvedValue(fakeTxn),
      count: jest.fn().mockResolvedValue(0),
      aggregate: jest.fn().mockResolvedValue({ _count: { id: 0 } }),
    },
    transactionLine: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findMany: jest.fn().mockResolvedValue([e2eUser]),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn().mockResolvedValue(e2eUser),
      update: jest.fn(),
      delete: jest.fn(),
    },
    tenant: { findMany: jest.fn(), findUnique: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    entity: { findMany: jest.fn(), findUnique: jest.fn().mockResolvedValue({ id: E2E_ENTITY_ID, name: "Test Entity" }), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    account: { findMany: jest.fn(), findUnique: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    payment: { findMany: jest.fn().mockResolvedValue([]), findUnique: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    paymentApplication: { findMany: jest.fn(), findUnique: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    item: { findMany: jest.fn(), findUnique: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    note: { findMany: jest.fn(), findUnique: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    transactionReason: { findMany: jest.fn(), findUnique: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    proof: { findMany: jest.fn(), findUnique: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    webhookEvent: { findMany: jest.fn(), findUnique: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    featureFlag: { findMany: jest.fn(), findUnique: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    tenantIntegration: { findMany: jest.fn(), findUnique: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
  };
}

// Mock the Prisma client before any imports (used by e2e via jest.mock in this file)
const txMock = createTxMock();
const mockPrismaClient = {
  $connect: jest.fn().mockResolvedValue(undefined),
  $disconnect: jest.fn().mockResolvedValue(undefined),
  $on: jest.fn(),
  $queryRaw: jest.fn().mockResolvedValue([]),
  $executeRawUnsafe: jest.fn().mockResolvedValue(0),
  $transaction: jest.fn().mockImplementation((fn: (tx: unknown) => Promise<unknown>) => fn(txMock)),

  tenant: {
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue(null),
    findFirst: jest.fn().mockResolvedValue(null),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  user: {
    findMany: jest.fn().mockResolvedValue([e2eUser]),
    findUnique: jest.fn().mockResolvedValue(null),
    findFirst: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue(e2eUser),
    update: jest.fn(),
    delete: jest.fn(),
  },
  entity: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  transaction: {
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockImplementation((args: { where?: { id?: string } }) => args?.where?.id === fakeTxn.id ? Promise.resolve({ ...fakeTxn, lines: [], entity: { id: E2E_ENTITY_ID, name: "Test Entity", phone: null } }) : Promise.resolve(null)),
    findFirst: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockImplementation((args: { data?: { reference?: string; amount?: number; lines?: unknown } }) => {
    const amt = args?.data?.amount ?? 500;
    return Promise.resolve({ ...fakeTxn, reference: args?.data?.reference ?? "e2e-ref", amount: amt, total_amount: amt, lines: args?.data?.lines ?? [], entity: { id: E2E_ENTITY_ID, name: "Test Entity", phone: null } });
  }),
    update: jest.fn().mockImplementation(() => Promise.resolve({ ...fakeTxn, status: "REVERSED" })),
    delete: jest.fn(),
    count: jest.fn().mockResolvedValue(0),
    aggregate: jest.fn().mockResolvedValue({ _count: { id: 0 } }),
  },
  transactionLine: {
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue(null),
    findFirst: jest.fn().mockResolvedValue(null),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  item: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  payment: {
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  paymentApplication: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  account: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  note: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  transactionReason: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  proof: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  webhookEvent: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  featureFlag: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  tenantIntegration: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

const dbEnums = {
  TxnStatus: { DRAFT: "DRAFT", POSTED: "POSTED", REVERSED: "REVERSED", RECONCILED: "RECONCILED", VOIDED: "VOIDED", ARCHIVED: "ARCHIVED" },
  TxnType: { RETAIL: "RETAIL", SERVICE: "SERVICE", RENTAL: "RENTAL", EXPENSE: "EXPENSE" },
  PaymentStatus: { PENDING: "PENDING", PARTIAL: "PARTIAL", SETTLED: "SETTLED", FAILED: "FAILED", CANCELLED: "CANCELLED" },
  EntityType: { CUSTOMER: "CUSTOMER", SUPPLIER: "SUPPLIER", BOTH: "BOTH", PARTNER: "PARTNER", EMPLOYEE: "EMPLOYEE", AGENT: "AGENT", VENDOR: "VENDOR", GOVERNMENT: "GOVERNMENT", BANK: "BANK", CHAMA_MEMBER: "CHAMA_MEMBER" },
};

jest.mock("@project-bridge/database/client", () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => mockPrismaClient),
  };
});

// Mock other database exports (include enums so services do not get undefined)
jest.mock("@project-bridge/database", () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrismaClient),
  TxnStatus: dbEnums.TxnStatus,
  TxnType: dbEnums.TxnType,
  PaymentStatus: dbEnums.PaymentStatus,
  EntityType: dbEnums.EntityType,
  Prisma: {},
}));

// Set test environment variables
process.env.NODE_ENV = "test";

// Supabase env vars for tests (avoid "Missing required Supabase environment variables" in CI/deploy)
process.env.SUPABASE_URL =
  process.env.SUPABASE_URL || "https://test-project.supabase.co";
process.env.SUPABASE_SECRET_KEY =
  process.env.SUPABASE_SECRET_KEY || "test-supabase-secret-key";
process.env.SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY || "test-supabase-anon-key";
process.env.SUPABASE_JWT_SECRET =
  process.env.SUPABASE_JWT_SECRET || "test-jwt-secret";
