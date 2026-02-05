// E2E test IDs (match core-api.e2e-spec.ts) so user/tenant resolution and transaction create work
const E2E_TENANT_ID = '00000000-0000-0000-0000-000000000000';
const E2E_USER_ID = '00000000-0000-0000-0000-000000000000';
const E2E_ENTITY_ID = 'd60c9094-6df2-47fe-9a35-864455e75a87';

const e2eUser = {
  id: E2E_USER_ID,
  tenantId: E2E_TENANT_ID,
  email: 'test@test.local',
  metadata: { manual_capture: true },
  displayName: 'Test User',
  phoneNumber: null,
  role: 'user',
  createdAt: new Date(),
  updatedAt: new Date(),
};

function createTxMock() {
  const fakeTxn = {
    id: 'e2e-txn-0000-0000-000000000001',
    reference: 'e2e-ref',
    amount: 500,
    status: 'POSTED',
    paymentStatus: 'PENDING',
    tenantId: E2E_TENANT_ID,
    entityId: E2E_ENTITY_ID,
    createdByUserId: E2E_USER_ID,
    type: 'RETAIL',
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    lines: [],
    entity: { id: E2E_ENTITY_ID, name: 'Test Entity', phone: null },
  };
  return {
    transaction: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue(fakeTxn),
      update: jest.fn().mockResolvedValue(fakeTxn),
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
    tenant: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    entity: {
      findMany: jest.fn(),
      findUnique: jest
        .fn()
        .mockResolvedValue({ id: E2E_ENTITY_ID, name: 'Test Entity' }),
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
    payment: {
      findMany: jest.fn(),
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
    item: {
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
}

// Mock Prisma Client for testing
export const PrismaClient = jest.fn().mockImplementation(() => {
  const txMock = createTxMock();
  return {
    $connect: jest.fn().mockResolvedValue(undefined),
    $disconnect: jest.fn().mockResolvedValue(undefined),
    $on: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([]),
    $executeRawUnsafe: jest.fn().mockResolvedValue(0),
    $transaction: jest
      .fn()
      .mockImplementation((fn: (tx: unknown) => Promise<unknown>) =>
        fn(txMock),
      ),

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
      findUnique: jest.fn().mockResolvedValue(null),
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({
        id: 'e2e-txn-001',
        reference: 'e2e-ref',
        amount: 500,
        status: 'POSTED',
        lines: [],
        entity: { id: E2E_ENTITY_ID, name: 'Test Entity', phone: null },
      }),
      update: jest.fn(),
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
    paymentApplication: {
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
});

// Mock Prisma types
export const Prisma = {
  Tenant: {},
  User: {},
  Entity: {},
  Transaction: {},
  Item: {},
  Payment: {},
  Account: {},
  Note: {},
  TransactionReason: {},
  Proof: {},
  WebhookEvent: {},
  FeatureFlag: {},
  TenantIntegration: {},
};

// Mock enums
export const TxnStatus = {
  DRAFT: 'DRAFT',
  POSTED: 'POSTED',
  REVERSED: 'REVERSED',
  RECONCILED: 'RECONCILED',
  VOIDED: 'VOIDED',
  ARCHIVED: 'ARCHIVED',
};

export const TxnType = {
  RETAIL: 'RETAIL',
  SERVICE: 'SERVICE',
  RENTAL: 'RENTAL',
  EXPENSE: 'EXPENSE',
};

export const PaymentStatus = {
  PENDING: 'PENDING',
  PARTIAL: 'PARTIAL',
  SETTLED: 'SETTLED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
};

export const EntityType = {
  CUSTOMER: 'CUSTOMER',
  SUPPLIER: 'SUPPLIER',
  BOTH: 'BOTH',
  PARTNER: 'PARTNER',
  EMPLOYEE: 'EMPLOYEE',
  AGENT: 'AGENT',
  VENDOR: 'VENDOR',
  GOVERNMENT: 'GOVERNMENT',
  BANK: 'BANK',
  CHAMA_MEMBER: 'CHAMA_MEMBER',
};
