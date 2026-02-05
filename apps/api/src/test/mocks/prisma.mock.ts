export const PrismaClient = jest.fn(() => ({
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  project: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  transaction: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  paymentRecord: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  attachment: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  ledgerEntry: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  universalTruth: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  note: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn().mockResolvedValue({ id: 'test-note-id' }),
    update: jest.fn(),
    delete: jest.fn(),
  },
  transactionLine: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn().mockResolvedValue({ id: 'test-line-id' }),
    update: jest.fn(),
    delete: jest.fn(),
  },
  $transaction: jest.fn(async (callback) => {
    const tx = {
      note: {
        findUnique: jest.fn().mockResolvedValue(null),
        findMany: jest.fn().mockResolvedValue([]),
        create: jest.fn().mockResolvedValue({ id: 'test-note-id' }),
        update: jest.fn().mockResolvedValue({}),
        delete: jest.fn().mockResolvedValue({}),
      },
      transaction: {
        findUnique: jest.fn().mockResolvedValue(null),
        findMany: jest.fn().mockResolvedValue([]),
        create: jest.fn().mockResolvedValue({ id: 'test-tx-id' }),
        update: jest.fn().mockResolvedValue({}),
        delete: jest.fn().mockResolvedValue({}),
      },
      transactionLine: {
        findUnique: jest.fn().mockResolvedValue(null),
        findMany: jest.fn().mockResolvedValue([]),
        create: jest.fn().mockResolvedValue({ id: 'test-line-id' }),
        update: jest.fn().mockResolvedValue({}),
        delete: jest.fn().mockResolvedValue({}),
      },
      ledgerEntry: {
        findUnique: jest.fn().mockResolvedValue(null),
        findMany: jest.fn().mockResolvedValue([]),
        create: jest.fn().mockResolvedValue({ id: 'test-entry-id' }),
        update: jest.fn().mockResolvedValue({}),
        delete: jest.fn().mockResolvedValue({}),
      },
    };
    return await callback(tx);
  }),
}));

export const TxnStatus = {
  DRAFT: 'DRAFT',
  POSTED: 'POSTED',
  REVERSED: 'REVERSED',
  RECONCILED: 'RECONCILED',
  VOIDED: 'VOIDED',
  ARCHIVED: 'ARCHIVED',
} as const;

export const PaymentStatus = {
  PENDING: 'PENDING',
  PARTIAL: 'PARTIAL',
  SETTLED: 'SETTLED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
} as const;

export const TxnType = {
  RETAIL: 'RETAIL',
  SERVICE: 'SERVICE',
  RENTAL: 'RENTAL',
  EXPENSE: 'EXPENSE',
} as const;

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
} as const;

export const Prisma = {
  TransactionStatus: TxnStatus,
  PaymentStatus: PaymentStatus,
  TransactionType: TxnType,
  EntityType: EntityType,
};
