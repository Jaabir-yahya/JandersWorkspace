import { Test, TestingModule } from '@nestjs/testing';
import { PaymentRecordsService } from './payment-records.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PaymentStatus } from '@prisma/client';

describe('PaymentRecordsService', () => {
  let service: PaymentRecordsService;
  let prisma: PrismaService;

  const mockPrisma = {
    $transaction: jest.fn((callback) => callback(mockPrisma)),
    transaction: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    payment: {
      create: jest.fn(),
      delete: jest.fn(),
    },
    paymentApplication: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentRecordsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<PaymentRecordsService>(PaymentRecordsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto = {
      transaction_id: '550e8400-e29b-41d4-a716-446655440000',
      tenant_id: '550e8400-e29b-41d4-a716-446655440001',
      created_by_user_id: '550e8400-e29b-41d4-a716-446655440002',
      method: 'M-PESA' as const,
      amount: 1000,
      currency_code: 'KES',
      reference: 'MPESA123',
      paid_at: '2024-01-15T10:00:00Z',
    };

    it('should create a payment record successfully', async () => {
      const mockTransaction = {
        id: createDto.transaction_id,
        status: 'DRAFT',
      };

      const mockPayment = {
        id: '550e8400-e29b-41d4-a716-446655440003',
        amount: 1000,
        currencyCode: 'KES',
        reference: 'MPESA123',
        metadata: {
          method: 'mpesa',
          paid_at: '2024-01-15T10:00:00Z',
          transaction_id: createDto.transaction_id,
        },
        createdAt: new Date('2024-01-15T10:00:00Z'),
      };

      mockPrisma.transaction.findUnique.mockResolvedValue(mockTransaction);
      mockPrisma.payment.create.mockResolvedValue(mockPayment);
      mockPrisma.paymentApplication.create.mockResolvedValue({});
      mockPrisma.paymentApplication.findMany.mockResolvedValue([
        { appliedAmount: 1000 },
      ]);
      mockPrisma.transaction.update.mockResolvedValue({});

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(result.id).toBe(mockPayment.id);
      expect(result.amount).toBe(1000);
      expect(result.method).toBe('M-PESA');
      expect(mockPrisma.payment.create).toHaveBeenCalled();
      expect(mockPrisma.paymentApplication.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if transaction does not exist', async () => {
      mockPrisma.transaction.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should update transaction payment status to SETTLED when fully paid', async () => {
      const mockTransaction = {
        id: createDto.transaction_id,
        status: 'DRAFT',
        totalAmount: 1000,
      };

      mockPrisma.transaction.findUnique
        .mockResolvedValueOnce(mockTransaction)
        .mockResolvedValueOnce({ ...mockTransaction, totalAmount: 1000 });
      mockPrisma.payment.create.mockResolvedValue({
        id: 'payment-id',
        amount: 1000,
        currencyCode: 'KES',
        reference: 'REF123',
        metadata: { method: 'cash' },
        createdAt: new Date(),
      });
      mockPrisma.paymentApplication.create.mockResolvedValue({});
      mockPrisma.paymentApplication.findMany.mockResolvedValue([
        { appliedAmount: 1000 },
      ]);
      mockPrisma.transaction.update.mockResolvedValue({});

      await service.create({ ...createDto, amount: 1000 });

      expect(mockPrisma.transaction.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: createDto.transaction_id },
          data: { paymentStatus: PaymentStatus.SETTLED },
        }),
      );
    });
  });

  describe('findByTransactionId', () => {
    it('should return payment records for a transaction', async () => {
      const transactionId = '550e8400-e29b-41d4-a716-446655440000';

      mockPrisma.paymentApplication.findMany.mockResolvedValue([
        {
          payment: {
            id: 'payment-1',
            amount: 500,
            reference: 'REF1',
            metadata: { method: 'cash', paid_at: '2024-01-15T10:00:00Z' },
            createdAt: new Date('2024-01-15T10:00:00Z'),
          },
          appliedAmount: 500,
        },
      ]);

      const result = await service.findByTransactionId(transactionId);

      expect(result).toHaveLength(1);
      expect(result[0].amount).toBe(500);
      expect(result[0].method).toBe('cash');
    });

    it('should return empty array if no payments found', async () => {
      const transactionId = '550e8400-e29b-41d4-a716-446655440000';

      mockPrisma.paymentApplication.findMany.mockResolvedValue([]);

      const result = await service.findByTransactionId(transactionId);

      expect(result).toEqual([]);
    });
  });

  describe('delete', () => {
    it('should delete a payment record for DRAFT transaction', async () => {
      const paymentId = '550e8400-e29b-41d4-a716-446655440000';

      mockPrisma.paymentApplication.findFirst.mockResolvedValue({
        id: 'app-id',
        paymentId,
        transaction: { id: 'txn-id', status: 'DRAFT' },
      });
      mockPrisma.paymentApplication.delete.mockResolvedValue({});
      mockPrisma.payment.delete.mockResolvedValue({});
      mockPrisma.paymentApplication.findMany.mockResolvedValue([]);
      mockPrisma.transaction.findUnique.mockResolvedValue({
        totalAmount: 1000,
      });
      mockPrisma.transaction.update.mockResolvedValue({});

      await service.delete(paymentId);

      expect(mockPrisma.paymentApplication.delete).toHaveBeenCalled();
      expect(mockPrisma.payment.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException if payment record not found', async () => {
      const paymentId = '550e8400-e29b-41d4-a716-446655440000';

      mockPrisma.paymentApplication.findFirst.mockResolvedValue(null);

      await expect(service.delete(paymentId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException for non-DRAFT transactions', async () => {
      const paymentId = '550e8400-e29b-41d4-a716-446655440000';

      mockPrisma.paymentApplication.findFirst.mockResolvedValue({
        id: 'app-id',
        paymentId,
        transaction: { id: 'txn-id', status: 'POSTED' },
      });

      await expect(service.delete(paymentId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
