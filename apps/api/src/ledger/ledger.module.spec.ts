import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { AccountsService } from './accounts.service';
import { TransactionsService } from './transactions.service';
import { BusinessService } from './business.service';
import { ReportingService } from './reporting.service';
import { RpcService } from './rpc.service';

describe('Ledger Module Integration', () => {
  let accountsService: AccountsService;
  let transactionsService: TransactionsService;
  let businessService: BusinessService;
  let reportingService: ReportingService;
  let rpcService: RpcService;
  let prismaService: PrismaService;

  let mockTenantId = 'test-tenant-123';
  let mockUserId = 'test-user-123';
  let mockAccount: any;
  let mockTransaction: any;
  let mockAccounts: any[];

  beforeEach(() => {
    mockAccount = {
      id: 'account-123',
      name: 'Cash Account',
      sku: 'ACC_CASH_123',
      itemType: 'ACCOUNT',
      metadata: { accountType: 'CASH', balance: 1000 },
    };

    mockTransaction = {
      id: 'tx-123',
      tenantId: mockTenantId,
      amount: 500,
      insights: {
        transactionPairId: 'PAIR_123_abc',
        entryType: 'DEBIT',
      },
    };

    mockAccounts = [
      {
        id: 'acc-1',
        name: 'Cash Account',
        sku: 'ACC_CASH_1',
        itemType: 'ACCOUNT',
        metadata: { accountType: 'CASH', balance: 1000 },
      },
      {
        id: 'acc-2',
        name: 'Inventory Account',
        sku: 'ACC_INVENTORY_1',
        itemType: 'ACCOUNT',
        metadata: { accountType: 'INVENTORY', balance: 2000 },
      },
    ];
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsService,
        TransactionsService,
        BusinessService,
        ReportingService,
        RpcService,
        {
          provide: PrismaService,
          useValue: {
            $transaction: jest.fn(),
            item: {
              findFirst: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
            transaction: {
              findFirst: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
            },
            note: {
              create: jest.fn(),
              findFirst: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            payment: {
              create: jest.fn(),
              findFirst: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    accountsService = module.get<AccountsService>(AccountsService);
    transactionsService = module.get<TransactionsService>(TransactionsService);
    businessService = module.get<BusinessService>(BusinessService);
    reportingService = module.get<ReportingService>(ReportingService);
    rpcService = module.get<RpcService>(RpcService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('Account Service', () => {
    it('should be defined', () => {
      expect(accountsService).toBeDefined();
    });

    it('should create account with valid data', async () => {
      const createAccountDto = {
        name: 'Test Cash Account',
        type: 'CASH',
        balance: 1000,
        currency: 'KES',
      };

      const expectedResult = {
        id: 'test-account-123',
        tenantId: mockTenantId,
        name: 'Test Cash Account',
        type: 'CASH',
        balance: 1000,
        currency: 'KES',
        metadata: { accountType: 'CASH', currency: 'KES', balance: 1000 },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prismaService.item, 'findFirst').mockResolvedValue(null);
      jest.spyOn(prismaService.item, 'create').mockResolvedValue({
        id: 'test-account-123',
        tenantId: mockTenantId,
        name: 'Test Cash Account',
        sku: 'ACC_CASH_1234567890',
        itemType: 'ACCOUNT',
        quantity: 1000,
        metadata: { accountType: 'CASH', currency: 'KES', balance: 1000 },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const result = await accountsService.create(
        mockTenantId,
        mockUserId,
        createAccountDto,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('Transaction Service', () => {
    it('should be defined', () => {
      expect(transactionsService).toBeDefined();
    });

    it('should create double-entry transaction', async () => {
      const createDoubleEntryDto = {
        debitAccountType: 'CASH',
        creditAccountType: 'INVENTORY',
        amount: 500,
        notes: 'Test transaction',
      };

      const mockAccount = {
        id: 'account-123',
        name: 'Cash Account',
        sku: 'ACC_CASH_123',
        itemType: 'ACCOUNT',
        metadata: { accountType: 'CASH', balance: 1000 },
      };

      const mockTransaction = {
        id: 'tx-123',
        tenantId: mockTenantId,
        amount: 500,
        insights: {
          transactionPairId: 'PAIR_123_abc',
          entryType: 'DEBIT',
        },
      };

      jest.spyOn(prismaService, '$transaction').mockImplementation(
        async (
          callback: (data: {
            item: {
              findFirst: jest.Mock;
              findMany: jest.Mock;
              create: jest.Mock;
              update: jest.Mock;
            };
            transaction: {
              create: jest.Mock;
            };
          }) => Promise<any>,
        ) => {
          return callback({
            item: {
              findFirst: jest.fn().mockResolvedValue(mockAccount),
              findMany: jest.fn().mockResolvedValue([mockAccount]),
              create: jest.fn().mockResolvedValue(mockAccount),
              update: jest.fn().mockResolvedValue(mockAccount),
            },
            transaction: {
              create: jest.fn().mockResolvedValue(mockTransaction),
            },
          });
        },
      );

      const result = await transactionsService.createDoubleEntry(
        mockTenantId,
        mockUserId,
        createDoubleEntryDto,
      );

      expect(result).toHaveProperty('debitTransaction');
      expect(result).toHaveProperty('creditTransaction');
      expect(result).toHaveProperty('transactionPairId');
    });
  });

  describe('Business Service', () => {
    it('should be defined', () => {
      expect(businessService).toBeDefined();
    });

    it('should create supply with accounting entries', async () => {
      const createSupplyDto = {
        supplierName: 'Test Supplier',
        itemType: 'Test Product',
        quantity: 10,
        unitPrice: 50,
        unit: 'PCS',
      };

      jest.spyOn(prismaService, '$transaction').mockImplementation(
        async (
          callback: (data: {
            item: {
              findFirst: jest.Mock;
              findMany: jest.Mock;
              create: jest.Mock;
              update: jest.Mock;
            };
            transaction: {
              create: jest.Mock;
            };
          }) => Promise<any>,
        ) => {
          return callback({
            item: {
              findFirst: jest.fn().mockResolvedValue(mockAccount),
              findMany: jest.fn().mockResolvedValue([mockAccount]),
              create: jest.fn().mockResolvedValue(mockAccount),
              update: jest.fn().mockResolvedValue(mockAccount),
            },
            transaction: {
              create: jest.fn().mockResolvedValue(mockTransaction),
            },
          });
        },
      );

      jest.spyOn(transactionsService, 'createDoubleEntry').mockResolvedValue({
        debitTransaction: { id: 'debit-123' },
        creditTransaction: { id: 'credit-123' },
        transactionPairId: 'PAIR_123_abc',
      } as any);

      const result = await businessService.createSupply(
        mockTenantId,
        mockUserId,
        createSupplyDto,
      );

      expect(result).toHaveProperty('supplierName', 'Test Supplier');
      expect(result).toHaveProperty('itemType', 'Test Product');
      expect(result).toHaveProperty('quantity', 10);
      expect(result).toHaveProperty('total', 500); // quantity 10 * unitPrice 50
    });
  });

  describe('Reporting Service', () => {
    it('should be defined', () => {
      expect(reportingService).toBeDefined();
    });

    it('should generate trial balance', async () => {
      const mockAccounts = [
        {
          id: 'acc1',
          name: 'Cash Account',
          itemType: 'ACCOUNT',
          isActive: true,
          metadata: { accountType: 'CASH', balance: 1000, currency: 'KES' },
        },
        {
          id: 'acc2',
          name: 'Supplier Payable',
          itemType: 'ACCOUNT',
          isActive: true,
          metadata: {
            accountType: 'SUPPLIER_PAYABLE',
            balance: 500,
            currency: 'KES',
          },
        },
      ];

      jest
        .spyOn(prismaService.item, 'findMany')
        .mockResolvedValue(mockAccounts as any);

      const result = await reportingService.getTrialBalance(mockTenantId);

      expect(result).toHaveProperty('accounts');
      expect(result).toHaveProperty('summary');
      expect(result.summary.totalDebits).toBe(1000);
      expect(result.summary.totalCredits).toBe(500);
    });
  });

  describe('RPC Service', () => {
    it('should be defined', () => {
      expect(rpcService).toBeDefined();
    });

    it('should create double-entry transaction atomically', async () => {
      jest.spyOn(prismaService, '$transaction').mockImplementation(
        async (
          callback: (data: {
            item: {
              findFirst: jest.Mock;
              findMany: jest.Mock;
              create: jest.Mock;
              update: jest.Mock;
            };
            transaction: {
              create: jest.Mock;
            };
          }) => Promise<any>,
        ) => {
          return callback({
            item: {
              findFirst: jest.fn().mockResolvedValue(null),
              findMany: jest.fn().mockResolvedValue([]),
              create: jest.fn().mockResolvedValue({
                id: 'acc-123',
                metadata: { balance: 0 },
              }),
              update: jest.fn().mockResolvedValue({}),
            },
            transaction: {
              create: jest.fn().mockResolvedValue({
                id: 'tx-123',
                insights: { transactionPairId: 'PAIR_123_abc' },
              }),
            },
          });
        },
      );

      const result = await rpcService.createDoubleEntryTransaction(
        mockTenantId,
        mockUserId,
        'CASH',
        'INVENTORY',
        500,
      );

      expect(result).toHaveProperty('debitTransactionId');
      expect(result).toHaveProperty('creditTransactionId');
      expect(result).toHaveProperty('transactionPairId');
      expect(result.debitBalanceAfter).toBe(500);
      expect(result.creditBalanceAfter).toBe(-500);
    });
  });

  describe('Integration Test: Complete Business Flow', () => {
    it('should handle complete supply to payment flow', async () => {
      // 1. Create Supply
      const createSupplyDto = {
        supplierName: 'Test Supplier',
        itemType: 'Test Product',
        quantity: 10,
        unitPrice: 100,
      };

      jest.spyOn(prismaService, '$transaction').mockImplementation(
        async (
          callback: (data: {
            note: {
              create: jest.Mock;
              update: jest.Mock;
            };
            item: {
              findFirst: jest.Mock;
              create: jest.Mock;
              update: jest.Mock;
            };
          }) => Promise<any>,
        ) => {
          return callback({
            note: {
              create: jest.fn().mockResolvedValue({
                id: 'supply-123',
                context: { ...createSupplyDto, total: 1000 },
              }),
              update: jest.fn().mockResolvedValue({}),
            },
            item: {
              findFirst: jest.fn().mockResolvedValue(null),
              create: jest.fn().mockResolvedValue({
                id: 'item-123',
                quantity: 10,
              }),
              update: jest.fn().mockResolvedValue({}),
            },
          });
        },
      );

      jest.spyOn(transactionsService, 'createDoubleEntry').mockResolvedValue({
        debitTransaction: { id: 'debit-123', amount: 1000 },
        creditTransaction: { id: 'credit-123', amount: 1000 },
        transactionPairId: 'PAIR_SUPPLY_123',
      } as any);

      const supply = await businessService.createSupply(
        mockTenantId,
        mockUserId,
        createSupplyDto,
      );
      expect(supply.total).toBe(1000); // quantity 10 * unitPrice 100

      // 2. Check Trial Balance
      const mockAccounts = [
        {
          id: 'inventory-acc',
          name: 'Inventory',
          itemType: 'ACCOUNT',
          isActive: true,
          metadata: { accountType: 'INVENTORY', balance: 1000 },
        },
        {
          id: 'supplier-acc',
          name: 'Supplier Payable',
          itemType: 'ACCOUNT',
          isActive: true,
          metadata: { accountType: 'SUPPLIER_PAYABLE', balance: 1000 },
        },
      ];

      jest
        .spyOn(prismaService.item, 'findMany')
        .mockResolvedValue(mockAccounts as any);

      const trialBalance = await reportingService.getTrialBalance(mockTenantId);
      expect(trialBalance.summary.isBalanced).toBe(true);
    });
  });
});
