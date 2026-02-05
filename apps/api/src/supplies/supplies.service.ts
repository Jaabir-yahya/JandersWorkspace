import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UniversalTransactionsService } from '../universal-truth/transactions.service';
import { UniversalAccountsService } from '../universal-truth/accounts.service';

export interface CreateSupplyDto {
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  unit: string;
  supplierId?: string;
  category?: string;
  accountId?: string; // Inventory account to credit
}

export interface SupplyDto {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  unit: string;
  supplierId?: string;
  category?: string;
  accountId?: string;
  createdAt: string;
  updatedAt: string;
  status: 'PENDING' | 'RECEIVED' | 'PROCESSED';
  transactionId?: string; // Links to Universal Truth transaction
}

@Injectable()
export class SuppliesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly transactionsService: UniversalTransactionsService,
    private readonly accountsService: UniversalAccountsService,
  ) {}

  /**
   * Create new supply with automatic ledger posting
   */
  async createSupply(
    tenantId: string,
    userId: string,
    createSupplyDto: CreateSupplyDto,
  ): Promise<SupplyDto> {
    const totalValue = createSupplyDto.quantity * createSupplyDto.unitPrice;

    // Use the provided account or get default inventory account
    const inventoryAccount = createSupplyDto.accountId
      ? await this.accountsService.getAccount(
          createSupplyDto.accountId,
          tenantId,
        )
      : await this.getDefaultInventoryAccount(tenantId);

    const purchasesAccount = await this.getDefaultPurchasesAccount(tenantId);

    if (!inventoryAccount || !purchasesAccount) {
      throw new Error('Required accounts not available for supply transaction');
    }

    // Create double-entry transaction for supply purchase
    const transactionId =
      await this.transactionsService.createDoubleEntryTransaction({
        tenantId,
        fromAccountId: purchasesAccount.id, // Debit: Increase inventory/purchases
        toAccountId: inventoryAccount.id, // Credit: Decrease cash/accounts payable
        amount: totalValue,
        reasonId: 'SUPPLY_PURCHASE',
        entityId: createSupplyDto.supplierId,
        notes: `Supply purchase: ${createSupplyDto.name} (${createSupplyDto.quantity} ${createSupplyDto.unit} @ ${createSupplyDto.unitPrice})`,
        reference: `SUPPLY-${Date.now()}`,
        createdById: userId,
      });

    // Store supply record using notes table (temporary solution)
    const supply = await this.prisma.note.create({
      data: {
        tenantId,
        content:
          createSupplyDto.description || `Supply: ${createSupplyDto.name}`,
        aboutType: 'SUPPLY',
        context: {
          name: createSupplyDto.name,
          description: createSupplyDto.description,
          quantity: createSupplyDto.quantity,
          unitPrice: createSupplyDto.unitPrice,
          totalValue,
          unit: createSupplyDto.unit,
          supplierId: createSupplyDto.supplierId,
          category: createSupplyDto.category,
          accountId: createSupplyDto.accountId,
          status: 'RECEIVED',
          transactionId,
        },
      },
    });

    return this.mapNoteToSupply(supply);
  }

  /**
   * Get all supplies for tenant
   */
  async findAllSupplies(tenantId: string): Promise<SupplyDto[]> {
    const supplies = await this.prisma.note.findMany({
      where: {
        tenantId,
        aboutType: 'SUPPLY',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return supplies.map((supply) => this.mapNoteToSupply(supply));
  }

  /**
   * Get supply by ID
   */
  async findOneSupply(tenantId: string, id: string): Promise<SupplyDto> {
    const supply = await this.prisma.note.findFirst({
      where: {
        tenantId,
        id,
        aboutType: 'SUPPLY',
      },
    });

    if (!supply) {
      throw new Error('Supply not found');
    }

    return this.mapNoteToSupply(supply);
  }

  /**
   * Update supply status (e.g., from PENDING to PROCESSED)
   */
  async updateSupplyStatus(
    tenantId: string,
    id: string,
    status: 'PENDING' | 'RECEIVED' | 'PROCESSED',
  ): Promise<SupplyDto> {
    const supply = await this.prisma.note.update({
      where: {
        tenantId,
        id,
        aboutType: 'SUPPLY',
      },
      data: {
        context: {
          status,
        },
      },
    });

    return this.mapNoteToSupply(supply);
  }

  /**
   * Delete supply (with transaction reversal)
   */
  async deleteSupply(tenantId: string, id: string): Promise<void> {
    const supply = await this.findOneSupply(tenantId, id);

    // Reverse the original transaction if it exists
    if (supply.transactionId) {
      await this.transactionsService.reverseTransaction(
        supply.transactionId,
        'Supply cancelled/removed',
      );
    }

    // Delete the supply record
    await this.prisma.note.delete({
      where: {
        tenantId,
        id,
        aboutType: 'SUPPLY',
      },
    });
  }

  /**
   * Get default inventory account for tenant
   */
  private async getDefaultInventoryAccount(tenantId: string) {
    let inventoryAccount = await this.prisma.account.findFirst({
      where: {
        tenantId,
        type: 'INVENTORY',
        isActive: true,
      },
    });

    if (!inventoryAccount) {
      // Create default inventory account
      const newInventoryAccountId = await this.accountsService.createAccount({
        tenantId,
        name: 'Inventory',
        type: 'INVENTORY',
        currency: 'KES',
        metadata: { isDefault: true },
      });
      inventoryAccount = await this.prisma.account.findUnique({
        where: { id: newInventoryAccountId },
      });
    }

    return inventoryAccount;
  }

  /**
   * Get default purchases account for tenant
   */
  private async getDefaultPurchasesAccount(tenantId: string) {
    let purchasesAccount = await this.prisma.account.findFirst({
      where: {
        tenantId,
        type: 'PURCHASES',
        isActive: true,
      },
    });

    if (!purchasesAccount) {
      // Create default purchases account
      const newPurchasesAccountId = await this.accountsService.createAccount({
        tenantId,
        name: 'Purchases',
        type: 'PURCHASES',
        currency: 'KES',
        metadata: { isDefault: true },
      });
      purchasesAccount = await this.prisma.account.findUnique({
        where: { id: newPurchasesAccountId },
      });
    }

    return purchasesAccount;
  }

  /**
   * Map note record to Supply DTO
   */
  private mapNoteToSupply(note: any): SupplyDto {
    const context = note.context || {};
    return {
      id: note.id,
      name: context.name || 'Unnamed Supply',
      description: note.content || context.description,
      quantity: context.quantity || 0,
      unitPrice: context.unitPrice || 0,
      totalValue: context.totalValue || 0,
      unit: context.unit || 'PCS',
      supplierId: context.supplierId,
      category: context.category,
      accountId: context.accountId,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
      status: context.status || 'PENDING',
      transactionId: context.transactionId,
    };
  }
}
