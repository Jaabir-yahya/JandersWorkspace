import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { UniversalAccountsService } from '../accounts.service';
import { UniversalTransactionsService } from '../transactions.service';

describe('Universal Truth Accounts Service', () => {
  let service: UniversalAccountsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UniversalAccountsService,
        {
          provide: PrismaService,
          useValue: {
            account: {
              findMany: jest.fn(),
              findFirst: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            $queryRaw: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UniversalAccountsService>(UniversalAccountsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAccount', () => {
    it('should create a new account with valid data', async () => {
      const accountData = {
        tenantId: 'tenant-123',
        name: 'Test Account',
        type: 'CASH',
        currency: 'KES',
        metadata: {},
        createdById: 'user-123',
      };

      const expectedAccount = {
        id: 'account-123',
        ...accountData,
        balance: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // createAccount uses $queryRaw (stored proc), returns account id string
      jest
        .spyOn(prisma, '$queryRaw')
        .mockResolvedValue([
          { p_account_id: 'account-123', p_error_message: null },
        ] as never);

      const result = await service.createAccount(accountData);

      expect(result).toEqual('account-123');
      expect(prisma.$queryRaw).toHaveBeenCalled();
    });

    it('should throw error for invalid account type', async () => {
      const accountData = {
        tenantId: 'tenant-123',
        name: 'Test Account',
        type: 'INVALID_TYPE',
        currency: 'KES',
      };

      await expect(service.createAccount(accountData)).rejects.toThrow();
    });
  });

  describe('getAccount', () => {
    it('should return account for valid account', async () => {
      const accountId = 'account-123';
      const tenantId = 'tenant-123';
      const expectedBalance = 1000;

      jest.spyOn(prisma.account, 'findFirst').mockResolvedValue({
        id: accountId,
        name: 'Test',
        type: 'CASH',
        balance: expectedBalance,
        currency: 'KES',
        tenantId,
        isActive: true,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const result = await service.getAccount(accountId, tenantId);

      expect(result).toBeDefined();
      expect(result.id).toBe(accountId);
      expect(result.balance).toBe(expectedBalance);
    });

    it('should throw error for non-existent account', async () => {
      jest.spyOn(prisma.account, 'findFirst').mockResolvedValue(null);

      await expect(
        service.getAccount('invalid-id', 'tenant-123'),
      ).rejects.toThrow();
    });
  });
});

describe('Universal Truth Transactions Service', () => {
  let service: UniversalTransactionsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UniversalTransactionsService,
        {
          provide: PrismaService,
          useValue: {
            account: { findUnique: jest.fn(), findFirst: jest.fn() },
            transaction: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            $transaction: jest.fn(),
            $queryRaw: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UniversalTransactionsService>(
      UniversalTransactionsService,
    );
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createDoubleEntryTransaction', () => {
    it('should create a double-entry transaction and return transaction id', async () => {
      const transactionData = {
        tenantId: 'tenant-123',
        fromAccountId: 'account-1',
        toAccountId: 'account-2',
        amount: 1000,
        reasonId: 'reason-123',
        notes: 'Test transaction',
        reference: 'TX-001',
        createdById: 'user-123',
      };

      jest
        .spyOn(prisma, '$queryRaw')
        .mockResolvedValue([
          { p_transaction_id: 'tx-123', p_error_message: null },
        ] as never);

      const result =
        await service.createDoubleEntryTransaction(transactionData);

      expect(result).toEqual('tx-123');
      expect(prisma.$queryRaw).toHaveBeenCalled();
    });

    it('should throw on stored proc error', async () => {
      const transactionData = {
        tenantId: 'tenant-123',
        fromAccountId: 'account-1',
        toAccountId: 'account-2',
        amount: 1000,
        createdById: 'user-123',
      };

      jest
        .spyOn(prisma, '$queryRaw')
        .mockResolvedValue([
          { p_transaction_id: null, p_error_message: 'Insufficient funds' },
        ] as never);

      await expect(
        service.createDoubleEntryTransaction(transactionData),
      ).rejects.toThrow();
    });
  });

  describe('reverseTransaction', () => {
    it('should create reversal and return reversal id', async () => {
      jest
        .spyOn(prisma, '$queryRaw')
        .mockResolvedValue([
          { p_reversal_id: 'tx-reverse-123', p_error_message: null },
        ] as never);

      const result = await service.reverseTransaction(
        'tx-123',
        'Reversal reason',
      );

      expect(result).toEqual('tx-reverse-123');
      expect(prisma.$queryRaw).toHaveBeenCalled();
    });

    it('should throw on stored proc error', async () => {
      jest.spyOn(prisma, '$queryRaw').mockResolvedValue([
        {
          p_reversal_id: null,
          p_error_message: 'Transaction already reversed',
        },
      ] as never);

      await expect(
        service.reverseTransaction('tx-123', 'reason'),
      ).rejects.toThrow();
    });
  });
});
