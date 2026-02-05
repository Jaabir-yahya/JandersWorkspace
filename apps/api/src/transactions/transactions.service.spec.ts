import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { PrismaService } from '../prisma/prisma.service';
import { TxnStatus, PaymentStatus } from '@project-bridge/database';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let prisma: PrismaService;

  const mockPrisma = {
    $transaction: jest.fn((callback) => callback(mockPrisma)),
    transaction: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    transactionLine: {
      createMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto: CreateTransactionDto = {
      tenant_id: '550e8400-e29b-41d4-a716-446655440000',
      entity_id: '550e8400-e29b-41d4-a716-446655440001',
      created_by_user_id: '550e8400-e29b-41d4-a716-446655440002',
      type: 'RETAIL',
      currency_code: 'KES',
      reference: 'INV-001',
      context: 'Test transaction',
      tags: ['test'],
      lines: [
        {
          description: 'Product A',
          quantity: 2,
          unit_price: 100,
          account_code: '200-SALES',
          sku: 'PROD-A',
        },
        {
          description: 'Product B',
          quantity: 1,
          unit_price: 50,
          account_code: '200-SALES',
        },
      ],
    };

    it('should calculate total from line items', async () => {
      const expectedTotal = 250; // (2 * 100) + (1 * 50)
      const mockTransaction = {
        id: '550e8400-e29b-41d4-a716-446655440003',
        tenantId: createDto.tenant_id,
        amount: expectedTotal,
        status: TxnStatus.DRAFT,
        lines: [],
      };

      mockPrisma.transaction.create.mockResolvedValue(mockTransaction);

      const result = await service.create(createDto);

      expect(result.amount).toBe(expectedTotal);
      expect(mockPrisma.transaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            amount: expectedTotal,
          }),
        }),
      );
    });

    it('should create transaction with correct status', async () => {
      const mockTransaction = {
        id: '550e8400-e29b-41d4-a716-446655440003',
        status: TxnStatus.DRAFT,
        paymentStatus: PaymentStatus.PENDING,
      };

      mockPrisma.transaction.create.mockResolvedValue(mockTransaction);

      const result = await service.create(createDto);

      expect(result.status).toBe(TxnStatus.DRAFT);
      expect(result.paymentStatus).toBe(PaymentStatus.PENDING);
    });

    it('should handle empty lines by creating transaction with zero total', async () => {
      const emptyLinesDto = { ...createDto, lines: [] };
      const mockTransaction = {
        id: '550e8400-e29b-41d4-a716-446655440003',
        tenantId: emptyLinesDto.tenant_id,
        amount: 0,
        status: TxnStatus.DRAFT,
        lines: [],
      };

      mockPrisma.transaction.create.mockResolvedValue(mockTransaction);

      const result = await service.create(emptyLinesDto);

      expect(result.amount).toBe(0);
      expect(mockPrisma.transaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            amount: 0,
            lines: { create: [] },
          }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return transactions for a tenant', async () => {
      const tenantId = '550e8400-e29b-41d4-a716-446655440000';
      const mockTransactions = [
        { id: '1', tenantId, totalAmount: 100 },
        { id: '2', tenantId, totalAmount: 200 },
      ];

      mockPrisma.transaction.findMany.mockResolvedValue(mockTransactions);

      const result = await service.findAll(tenantId);

      expect(result).toHaveLength(2);
      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId },
        }),
      );
    });

    it('should filter by status', async () => {
      const tenantId = '550e8400-e29b-41d4-a716-446655440000';
      const filters = { status: TxnStatus.POSTED };

      mockPrisma.transaction.findMany.mockResolvedValue([]);

      await service.findAll(tenantId, filters);

      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenantId,
            status: TxnStatus.POSTED,
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a transaction by id', async () => {
      const transactionId = '550e8400-e29b-41d4-a716-446655440003';
      const mockTransaction = {
        id: transactionId,
        totalAmount: 100,
        lines: [],
      };

      mockPrisma.transaction.findUnique.mockResolvedValue(mockTransaction);

      const result = await service.findOne(transactionId);

      expect(result.id).toBe(transactionId);
    });

    it('should throw NotFoundException if transaction not found', async () => {
      mockPrisma.transaction.findUnique.mockResolvedValue(null);

      await expect(
        service.findOne('550e8400-e29b-41d4-a716-446655440003'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('postTransaction', () => {
    it('should change status from DRAFT to POSTED', async () => {
      const transactionId = '550e8400-e29b-41d4-a716-446655440003';
      const mockTransaction = {
        id: transactionId,
        status: TxnStatus.DRAFT,
      };

      mockPrisma.transaction.findUnique.mockResolvedValue(mockTransaction);
      mockPrisma.transaction.update.mockResolvedValue({
        ...mockTransaction,
        status: TxnStatus.POSTED,
      });

      const result = await service.postTransaction(transactionId);
      expect(result.status).toBe(TxnStatus.POSTED);
    });

    it('should allow posting transaction regardless of current status', async () => {
      const transactionId = '550e8400-e29b-41d4-a716-446655440003';
      const mockTransaction = {
        id: transactionId,
        status: TxnStatus.POSTED,
      };

      mockPrisma.transaction.update.mockResolvedValue(mockTransaction);

      const result = await service.postTransaction(transactionId);
      expect(result.status).toBe(TxnStatus.POSTED);
      expect(mockPrisma.transaction.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: transactionId },
          data: { status: TxnStatus.POSTED },
        }),
      );
    });
  });

  describe('reverseTransaction', () => {
    it('should create a reversal transaction', async () => {
      const transactionId = '550e8400-e29b-41d4-a716-446655440003';
      const mockTransaction = {
        id: transactionId,
        status: TxnStatus.POSTED,
        tenantId: '550e8400-e29b-41d4-a716-446655440000',
        totalAmount: 100,
        lines: [
          {
            description: 'Product',
            quantity: 1,
            unitPrice: 100,
            totalLineAmount: 100,
          },
        ],
      };

      mockPrisma.transaction.findUnique.mockResolvedValue(mockTransaction);
      mockPrisma.transaction.create.mockResolvedValue({
        id: 'new-id',
        status: TxnStatus.POSTED,
        reversedTransactionId: transactionId,
      });

      const result = await service.reverseTransaction(transactionId, {
        reason: 'Customer return',
        created_by_user_id: '550e8400-e29b-41d4-a716-446655440002',
      });

      expect(result.reversedTransactionId).toBe(transactionId);
    });
  });
});
