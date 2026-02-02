import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { PostTransactionDto } from './dto/post-transaction.dto';
import { ReverseTransactionDto } from './dto/reverse-transaction.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import {
  UniversalInvoice,
  getAccountCode,
} from './interfaces/universal-invoice.interface';
import { TxnStatus, PaymentStatus, Prisma } from '@prisma/client';

export interface TransactionFilters {
  status?: string;
  type?: string;
  entity_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  payment_status?: string;
}

export interface EntityHistoryItem {
  transaction_id: string;
  transaction_date: string;
  type: string;
  status: string;
  payment_status: string;
  total_amount: number;
  currency_code: string;
  reference: string;
  running_balance: number;
}

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Resolve created_by_user_id for quick-capture (no JWT).
   * Uses per-tenant "manual" user (metadata.manual_capture) or first user, or creates one.
   */
  async getOrCreateManualUserForTenant(tenantId: string): Promise<string> {
    const users = await this.prisma.user.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'asc' },
    });
    const manual = users.find((u) => (u.metadata as Record<string, unknown>)?.manual_capture === true);
    if (manual) return manual.id;
    if (users.length > 0) return users[0].id;
    const created = await this.prisma.user.create({
      data: {
        tenantId,
        phoneNumber: `+manual-${tenantId}`,
        email: `manual-${tenantId}@placeholder.local`,
        displayName: 'Manual Capture',
        role: 'user',
        metadata: { manual_capture: true } as Prisma.InputJsonValue,
      },
    });
    return created.id;
  }

  async create(dto: CreateTransactionDto) {
    // Create transaction with lines in a single transaction
    const transaction = await this.prisma.$transaction(async (tx) => {
      // Calculate total from lines
      const totalAmount = dto.lines.reduce((sum, line) => {
        return sum + line.quantity * line.unit_price;
      }, 0);

      // Create the transaction
      const txn = await tx.transaction.create({
        data: {
          tenantId: dto.tenant_id,
          entityId: dto.entity_id || null,
          createdByUserId: dto.created_by_user_id,
          type: dto.type as any,
          totalAmount: totalAmount,
          status: TxnStatus.DRAFT,
          paymentStatus: PaymentStatus.PENDING,
          reference: dto.reference || null,
          metadata: {
            context: dto.context,
            tags: dto.tags,
          } as Prisma.InputJsonValue,
          systemTags: '',
          customTags: '',
          lines: {
            create: dto.lines.map((line, index) => ({
              description: line.description,
              sku: line.sku || null,
              quantity: line.quantity,
              unitPrice: line.unit_price,
              lineTotal: line.quantity * line.unit_price,
              totalLineAmount: line.quantity * line.unit_price,
              accountCode: line.account_code || '200-SALES',
              metadata: (line.metadata || {}) as Prisma.InputJsonValue,
            })),
          },
        },
        include: {
          lines: true,
          entity: true,
        },
      });

      return txn;
    });

    return transaction;
  }

  async findAll(tenantId: string, filters?: TransactionFilters) {
    const where: Prisma.TransactionWhereInput = {
      tenantId,
    };

    if (filters?.status) {
      where.status = filters.status as TxnStatus;
    }

    if (filters?.type) {
      where.entity = {
        entityType: filters.type as any,
      };
    }

    if (filters?.entity_id) {
      where.entityId = filters.entity_id;
    }

    if (filters?.payment_status) {
      where.paymentStatus = filters.payment_status as PaymentStatus;
    }

    if (filters?.date_from || filters?.date_to) {
      where.createdAt = {};
      if (filters.date_from) {
        where.createdAt.gte = new Date(filters.date_from);
      }
      if (filters.date_to) {
        where.createdAt.lte = new Date(filters.date_to);
      }
    }

    // Search functionality
    if (filters?.search) {
      where.OR = [
        { reference: { contains: filters.search, mode: 'insensitive' } },
        {
          entity: {
            displayName: { contains: filters.search, mode: 'insensitive' },
          },
        },
      ];
    }

    const transactions = await this.prisma.transaction.findMany({
      where,
      include: {
        entity: {
          select: {
            id: true,
            displayName: true,
            phoneNumber: true,
          },
        },
        lines: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return transactions;
  }

  /**
   * Bulk export for manual tier: CSV or JSON.
   * Reuses findAll filters; optional limit for CSV/JSON.
   */
  async exportBulk(
    tenantId: string,
    filters?: TransactionFilters,
    format: 'json' | 'csv' = 'json',
    limit = 10_000,
  ): Promise<unknown[] | string> {
    const where: Prisma.TransactionWhereInput = { tenantId };

    if (filters?.status) where.status = filters.status as TxnStatus;
    if (filters?.type) where.type = filters.type as any;
    if (filters?.entity_id) where.entityId = filters.entity_id;
    if (filters?.payment_status) where.paymentStatus = filters.payment_status as PaymentStatus;
    if (filters?.date_from || filters?.date_to) {
      where.createdAt = {};
      if (filters.date_from) where.createdAt.gte = new Date(filters.date_from);
      if (filters.date_to) where.createdAt.lte = new Date(filters.date_to);
    }
    if (filters?.search) {
      where.OR = [
        { reference: { contains: filters.search, mode: 'insensitive' } },
        { entity: { displayName: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    const transactions = await this.prisma.transaction.findMany({
      where,
      include: {
        entity: { select: { id: true, displayName: true, phoneNumber: true } },
        lines: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    if (format === 'json') {
      return transactions.map((t) => ({
        id: t.id,
        tenantId: t.tenantId,
        type: t.type,
        totalAmount: Number(t.totalAmount),
        currencyCode: t.currencyCode,
        createdAt: t.createdAt.toISOString(),
        status: t.status,
        paymentStatus: t.paymentStatus,
        reference: t.reference,
        entity: t.entity,
        lines: t.lines.map((l) => ({
          description: l.description,
          quantity: Number(l.quantity),
          unitPrice: Number(l.unitPrice),
          totalLineAmount: Number(l.totalLineAmount),
        })),
      }));
    }

    const header = 'date,type,amount,currency,description,reference';
    const rows = transactions.map((t) => {
      const desc = t.lines?.[0]?.description ?? '';
      const escaped = desc.replace(/"/g, '""');
      return `${t.createdAt.toISOString().split('T')[0]},${t.type},${t.totalAmount},${t.currencyCode},"${escaped}",${(t.reference ?? '').replace(/"/g, '""')}`;
    });
    return [header, ...rows].join('\n');
  }

  async findOne(id: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        entity: true,
        lines: true,
        paymentApplications: {
          include: {
            payment: true,
          },
        },
      },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return transaction;
  }

  async findByEntity(entityId: string) {
    const transactions = await this.prisma.transaction.findMany({
      where: { entityId },
      include: {
        lines: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return transactions;
  }

  /**
   * Post a transaction (DRAFT -> POSTED)
   * LOCK 2: Once POSTED, transaction becomes immutable
   */
  async postTransaction(id: string, dto: PostTransactionDto) {
    const transaction = await this.prisma.transaction.update({
      where: { id },
      data: {
        status: TxnStatus.POSTED,
      },
      include: {
        lines: true,
        entity: true,
      },
    });

    return transaction;
  }

  /**
   * Reverse a transaction (POSTED -> creates REVERSAL)
   * LOCK 3: Reversals are first-class transactions with negative amounts
   */
  async reverseTransaction(id: string, dto: ReverseTransactionDto) {
    const result = await this.prisma.$transaction(async (tx) => {
      // Get original transaction
      const original = await tx.transaction.findUnique({
        where: { id },
        include: { lines: true },
      });

      if (!original) {
        throw new NotFoundException(`Transaction with ID ${id} not found`);
      }

      if (original.status !== TxnStatus.POSTED) {
        throw new BadRequestException(
          'Only POSTED transactions can be reversed',
        );
      }

      // Create reversal transaction
      const reversal = await tx.transaction.create({
        data: {
          tenantId: original.tenantId,
          entityId: original.entityId,
          createdByUserId: dto.created_by_user_id,
          type: original.type,
          currencyCode: original.currencyCode,
          totalAmount: -original.totalAmount,
          status: TxnStatus.REVERSED,
          paymentStatus: original.paymentStatus,
          reference: `REV-${original.reference || id}`,
          reversedTransactionId: original.id,
          systemTags: original.systemTags || '',
          customTags: original.customTags || '',
          metadata: {
            reversal_reason: dto.reason,
            original_reference: original.reference,
          } as Prisma.InputJsonValue,
          lines: {
            create: original.lines.map((line) => ({
              description: `REVERSAL: ${line.description}`,
              sku: line.sku,
              quantity: -line.quantity,
              unitPrice: line.unitPrice,
              lineTotal: -line.lineTotal,
              totalLineAmount: -line.totalLineAmount,
              accountCode: line.accountCode,
              metadata: line.metadata as Prisma.InputJsonValue,
            })),
          },
        },
        include: {
          lines: true,
        },
      });

      return reversal;
    });

    return result;
  }

  /**
   * Update payment status
   * Used in the Reconciler view
   */
  async updatePaymentStatus(id: string, dto: UpdatePaymentStatusDto) {
    const transaction = await this.prisma.transaction.update({
      where: { id },
      data: {
        paymentStatus: dto.status as PaymentStatus,
      },
      include: {
        lines: true,
        entity: true,
      },
    });

    return transaction;
  }

  /**
   * Get entity history with running balance
   * The "Copper" feature - shows everything an entity has ever done
   */
  async getEntityHistory(
    entityId: string,
    tenantId: string,
  ): Promise<{
    entity: any;
    transactions: EntityHistoryItem[];
    total_balance: number;
  }> {
    // Get entity details
    const entity = await this.prisma.entity.findFirst({
      where: {
        id: entityId,
        tenantId,
      },
    });

    if (!entity) {
      throw new NotFoundException(`Entity with ID ${entityId} not found`);
    }

    // Get all transactions for this entity
    const transactions = await this.prisma.transaction.findMany({
      where: {
        entityId,
        tenantId,
        status: { in: [TxnStatus.POSTED, TxnStatus.REVERSED] },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Calculate running balance
    let runningBalance = 0;
    const history: EntityHistoryItem[] = transactions.map((txn) => {
      const amount = Number(txn.totalAmount);
      runningBalance += amount;

      return {
        transaction_id: txn.id,
        transaction_date: txn.createdAt.toISOString(),
        type: txn.type,
        status: txn.status,
        payment_status: txn.paymentStatus,
        total_amount: amount,
        currency_code: txn.currencyCode,
        reference: txn.reference || '',
        running_balance: runningBalance,
      };
    });

    return {
      entity,
      transactions: history,
      total_balance: runningBalance,
    };
  }

  /**
   * Standardize transaction to Universal Invoice format
   * Compatible with QBO, Xero, and Kick
   */
  async standardizeTransaction(id: string): Promise<UniversalInvoice> {
    const transaction = await this.findOne(id);

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    const entityName = transaction.entity?.displayName || 'Unknown';

    // Map transaction type to account code
    const defaultAccountCode = getAccountCode(transaction.type);

    // Transform lines to Universal Invoice format
    const lineItems =
      transaction.lines?.map((line: any) => ({
        description: line.description,
        quantity: Number(line.quantity),
        unit_price: Number(line.unitPrice),
        account_code: line.accountCode || defaultAccountCode,
        sku: line.sku,
        line_total: Number(line.totalLineAmount),
      })) || [];

    // Build Universal Invoice
    const universalInvoice: UniversalInvoice = {
      invoice_id: transaction.id,
      customer_name: entityName,
      customer_id: transaction.entityId,
      invoice_date: transaction.createdAt.toISOString(),
      currency: transaction.currencyCode,
      total_amount: Number(transaction.totalAmount),
      line_items: lineItems,
      tax_amount: 0, // Not implemented in Phase 2
      status: transaction.status,
      payment_status: transaction.paymentStatus,
      reference: transaction.reference || undefined,
      type: transaction.type,
      reversed_transaction_id: transaction.reversedTransactionId || undefined,
      metadata: transaction.metadata as any,
      created_at: transaction.createdAt.toISOString(),
    };

    return universalInvoice;
  }

  /**
   * Search transactions with advanced filters
   * Supports full-text search across multiple fields including SKU
   * G-010: Search functionality includes SKU search
   */
  async searchTransactions(
    tenantId: string,
    searchTerm: string,
    filters?: Omit<TransactionFilters, 'search'>,
  ) {
    // First search in transaction_lines for description or SKU matches
    const lineMatches = await this.prisma.transactionLine.findMany({
      where: {
        OR: [
          { description: { contains: searchTerm, mode: 'insensitive' } },
          { sku: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      select: {
        transactionId: true,
      },
    });

    const transactionIdsFromLines = [
      ...new Set(lineMatches.map((l) => l.transactionId)),
    ];

    // Build main query
    const where: Prisma.TransactionWhereInput = {
      tenantId,
      OR: [
        { reference: { contains: searchTerm, mode: 'insensitive' } },
        {
          entity: {
            displayName: { contains: searchTerm, mode: 'insensitive' },
          },
        },
        { id: { in: transactionIdsFromLines } },
      ],
    };

    // Apply additional filters
    if (filters?.status) {
      where.status = filters.status as TxnStatus;
    }

    if (filters?.type) {
      where.entity = {
        entityType: filters.type as any,
      };
    }

    if (filters?.entity_id) {
      where.entityId = filters.entity_id;
    }

    if (filters?.date_from || filters?.date_to) {
      where.createdAt = {};
      if (filters.date_from) {
        where.createdAt.gte = new Date(filters.date_from);
      }
      if (filters.date_to) {
        where.createdAt.lte = new Date(filters.date_to);
      }
    }

    const transactions = await this.prisma.transaction.findMany({
      where,
      include: {
        entity: {
          select: {
            id: true,
            displayName: true,
            phoneNumber: true,
          },
        },
        lines: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return transactions;
  }

  // ============================================
  // ENTITY METHODS (Phase 3)
  // ============================================

  async findAllEntities(
    tenantId: string,
    filters?: { type?: string; search?: string },
  ) {
    const where: Prisma.EntityWhereInput = {
      tenantId,
    };

    if (filters?.type) {
      where.entityType = filters.type as any;
    }

    if (filters?.search) {
      where.OR = [
        { displayName: { contains: filters.search, mode: 'insensitive' } },
        { phoneNumber: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const entities = await this.prisma.entity.findMany({
      where,
      orderBy: {
        displayName: 'asc',
      },
    });

    return entities;
  }

  async createEntity(dto: any) {
    const entity = await this.prisma.entity.create({
      data: {
        tenantId: dto.tenant_id,
        entityType: dto.type as any,
        displayName: dto.display_name,
        phoneNumber: dto.phone_number || null,
        systemTags: dto.system_tags || '',
        customTags: dto.custom_tags || '',
        metadata: (dto.metadata || {}) as Prisma.InputJsonValue,
        createdByUserId: dto.created_by_user_id,
      },
    });

    return entity;
  }

  async findEntityById(id: string) {
    const entity = await this.prisma.entity.findUnique({
      where: { id },
    });

    if (!entity) {
      throw new NotFoundException(`Entity with ID ${id} not found`);
    }

    return entity;
  }

  async getEntityBalance(entityId: string, tenantId: string) {
    // Get entity details
    const entity = await this.findEntityById(entityId);

    // Verify tenant access
    if (entity.tenantId !== tenantId) {
      throw new NotFoundException(`Entity with ID ${entityId} not found`);
    }

    // Calculate balance from transactions
    const transactions = await this.prisma.transaction.findMany({
      where: {
        entityId,
        status: TxnStatus.POSTED,
      },
      select: {
        totalAmount: true,
      },
    });

    const totalCredit = transactions
      .filter((t) => Number(t.totalAmount) > 0)
      .reduce((sum, t) => sum + Number(t.totalAmount), 0);

    const totalDebit = transactions
      .filter((t) => Number(t.totalAmount) < 0)
      .reduce((sum, t) => sum + Number(t.totalAmount), 0);

    const netBalance = totalCredit + totalDebit;

    // Get transaction count
    const transactionCount = await this.prisma.transaction.count({
      where: {
        entityId,
        status: TxnStatus.POSTED,
      },
    });

    return {
      entity,
      balance: {
        total_credit: totalCredit,
        total_debit: Math.abs(totalDebit),
        net_balance: netBalance,
        transaction_count: transactionCount,
      },
    };
  }

  async getEntity360View(entityId: string, tenantId: string) {
    // Get entity with balance
    const { entity, balance } = await this.getEntityBalance(entityId, tenantId);

    // Get recent transactions (last 10)
    const recentTransactions = await this.prisma.transaction.findMany({
      where: {
        entityId,
        status: TxnStatus.POSTED,
      },
      include: {
        lines: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    // Get attachments (if table exists)
    let attachments: any[] = [];
    try {
      attachments = await this.prisma.$queryRaw`
        SELECT * FROM attachments WHERE entity_id = ${entityId} ORDER BY uploaded_at DESC
      `;
    } catch (e) {
      // Attachments table might not exist yet
      attachments = [];
    }

    return {
      entity,
      balance,
      recent_transactions: recentTransactions,
      attachments,
    };
  }

  async searchEntitiesByPhone(phone: string, tenantId: string) {
    const entities = await this.prisma.entity.findMany({
      where: {
        tenantId,
        phoneNumber: {
          contains: phone,
        },
      },
    });

    return entities;
  }

  async addLinkedPhone(entityId: string, phone: string) {
    // Get current entity
    const entity = await this.prisma.entity.findUnique({
      where: { id: entityId },
    });

    if (!entity) {
      throw new NotFoundException(`Entity with ID ${entityId} not found`);
    }

    // Get current linked phones from metadata
    const metadata = (entity.metadata as any) || {};
    const currentPhones: string[] = metadata.linked_phones || [];

    // Check if phone already exists
    if (currentPhones.includes(phone)) {
      throw new BadRequestException(
        'Phone number already linked to this entity',
      );
    }

    // Update with new phone
    const updatedEntity = await this.prisma.entity.update({
      where: { id: entityId },
      data: {
        metadata: {
          ...metadata,
          linked_phones: [...currentPhones, phone],
        } as Prisma.InputJsonValue,
      },
    });

    return updatedEntity;
  }

  async removeLinkedPhone(entityId: string, phone: string) {
    // Get current entity
    const entity = await this.prisma.entity.findUnique({
      where: { id: entityId },
    });

    if (!entity) {
      throw new NotFoundException(`Entity with ID ${entityId} not found`);
    }

    // Get current linked phones from metadata
    const metadata = (entity.metadata as any) || {};
    const currentPhones: string[] = metadata.linked_phones || [];

    // Remove phone
    const updatedPhones = currentPhones.filter((p: string) => p !== phone);

    const updatedEntity = await this.prisma.entity.update({
      where: { id: entityId },
      data: {
        metadata: {
          ...metadata,
          linked_phones: updatedPhones,
        } as Prisma.InputJsonValue,
      },
    });

    return updatedEntity;
  }
}
