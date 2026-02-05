import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../prisma/prisma.service';
import { TxnStatus, TxnType, PaymentStatus } from '@project-bridge/database';

describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: PrismaService;

  const mockPrisma = {
    transaction: {
      findMany: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    payment: {
      findMany: jest.fn(),
    },
    entity: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDashboardStats', () => {
    it('should return dashboard stats for a tenant', async () => {
      const tenantId = '550e8400-e29b-41d4-a716-446655440000';

      mockPrisma.transaction.findMany.mockResolvedValue([]);
      mockPrisma.transaction.count.mockResolvedValue(0);
      mockPrisma.payment.findMany.mockResolvedValue([]);
      mockPrisma.transaction.groupBy.mockResolvedValue([]);
      mockPrisma.entity.findMany.mockResolvedValue([]);

      const result = await service.getDashboardStats(tenantId);

      expect(result).toBeDefined();
      expect(result.total_revenue_today).toBe(0);
      expect(result.total_revenue_week).toBe(0);
      expect(result.total_revenue_month).toBe(0);
      expect(result.transactions_today).toBe(0);
      expect(result.transactions_week).toBe(0);
      expect(result.outstanding_credit).toBe(0);
      expect(result.outstanding_debt).toBe(0);
      expect(result.payment_method_breakdown).toEqual({
        cash: 0,
        mpesa: 0,
        bank: 0,
        credit: 0,
      });
      expect(result.top_customers).toEqual([]);
      expect(result.recent_activity).toEqual([]);
    });

    it('should calculate revenue correctly', async () => {
      const tenantId = '550e8400-e29b-41d4-a716-446655440000';

      mockPrisma.transaction.findMany
        .mockResolvedValueOnce([
          { amount: 100 },
          { amount: 200 },
          { amount: 300 },
        ])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
      mockPrisma.transaction.count.mockResolvedValue(3);
      mockPrisma.payment.findMany.mockResolvedValue([]);
      mockPrisma.transaction.groupBy.mockResolvedValue([]);
      mockPrisma.entity.findMany.mockResolvedValue([]);

      const result = await service.getDashboardStats(tenantId);

      expect(result.total_revenue_today).toBe(600);
      expect(result.transactions_today).toBe(3);
    });

    it('should calculate payment method breakdown correctly', async () => {
      const tenantId = '550e8400-e29b-41d4-a716-446655440000';

      mockPrisma.transaction.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
      mockPrisma.transaction.count.mockResolvedValue(0);
      mockPrisma.payment.findMany.mockResolvedValue([
        { amount: 100, metadata: { method: 'cash' } },
        { amount: 200, metadata: { method: 'mpesa' } },
        { amount: 300, metadata: { method: 'bank_transfer' } },
        { amount: 400, metadata: { method: 'credit' } },
      ]);
      mockPrisma.transaction.groupBy.mockResolvedValue([]);
      mockPrisma.entity.findMany.mockResolvedValue([]);

      const result = await service.getDashboardStats(tenantId);

      expect(result.payment_method_breakdown).toEqual({
        cash: 100,
        mpesa: 200,
        bank: 300,
        credit: 400,
      });
    });

    it('should return top customers sorted by total amount', async () => {
      const tenantId = '550e8400-e29b-41d4-a716-446655440000';

      // Mock all findMany calls - the 6th call is for top customers with entity include
      mockPrisma.transaction.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([
          {
            id: 'txn-1',
            type: 'RETAIL',
            amount: 1000,
            createdAt: new Date(),
            reference: 'REF1',
            entityId: 'entity-1',
            entity: { id: 'entity-1', name: 'Customer A' },
          },
          {
            id: 'txn-2',
            type: 'RETAIL',
            amount: 500,
            createdAt: new Date(),
            reference: 'REF2',
            entityId: 'entity-2',
            entity: { id: 'entity-2', name: 'Customer B' },
          },
          {
            id: 'txn-3',
            type: 'RETAIL',
            amount: 200,
            createdAt: new Date(),
            reference: 'REF3',
            entityId: 'entity-1',
            entity: { id: 'entity-1', name: 'Customer A' },
          },
          {
            id: 'txn-4',
            type: 'RETAIL',
            amount: 300,
            createdAt: new Date(),
            reference: 'REF4',
            entityId: 'entity-2',
            entity: { id: 'entity-2', name: 'Customer B' },
          },
          {
            id: 'txn-5',
            type: 'RETAIL',
            amount: 150,
            createdAt: new Date(),
            reference: 'REF5',
            entityId: 'entity-1',
            entity: { id: 'entity-1', name: 'Customer A' },
          },
        ]);
      mockPrisma.transaction.count.mockResolvedValue(0);
      mockPrisma.payment.findMany.mockResolvedValue([]);
      mockPrisma.transaction.groupBy.mockResolvedValue([]);
      mockPrisma.entity.findMany.mockResolvedValue([]);

      const result = await service.getDashboardStats(tenantId);

      expect(result.top_customers).toHaveLength(2);
      expect(result.top_customers[0].display_name).toBe('Customer A');
      expect(result.top_customers[0].total_amount).toBe(1350); // 1000 + 200 + 150
      expect(result.top_customers[0].transaction_count).toBe(3);
      expect(result.top_customers[1].display_name).toBe('Customer B');
      expect(result.top_customers[1].total_amount).toBe(800); // 500 + 300
      expect(result.top_customers[1].transaction_count).toBe(2);
    });
  });
});
