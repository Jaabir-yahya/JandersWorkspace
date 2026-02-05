import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionsService } from './transactions.service';
import {
  CreateSupplyDto,
  UpdateSupplyDto,
  SupplyDto,
  InventoryDto,
  CreateInvoiceDto,
  InvoiceDto,
  CreatePaymentDto,
  PaymentDto,
  InventoryContainerDto,
  CreateInventoryContainerDto,
  UpdateInventoryContainerDto,
  InventoryContainerItemDto,
  AddContainerItemDto,
} from './dto/business.dto';

@Injectable()
export class BusinessService {
  constructor(
    private prisma: PrismaService,
    private transactionsService: TransactionsService,
  ) {}

  // Supplies Management
  async createSupply(
    tenantId: string,
    userId: string,
    createSupplyDto: CreateSupplyDto,
  ): Promise<SupplyDto> {
    return await this.prisma.$transaction(async (tx) => {
      const total = createSupplyDto.quantity * createSupplyDto.unitPrice;

      // Create supply record (using Note model for now)
      const supply = await tx.note.create({
        data: {
          tenantId,
          content: `Supply: ${createSupplyDto.supplierName} - ${createSupplyDto.itemType}`,
          aboutType: 'SUPPLY',
          context: {
            supplierName: createSupplyDto.supplierName,
            itemType: createSupplyDto.itemType,
            quantity: createSupplyDto.quantity,
            unitPrice: createSupplyDto.unitPrice,
            total,
            unit: createSupplyDto.unit,
            entityId: createSupplyDto.entityId,
            notes: createSupplyDto.notes,
            metadata: createSupplyDto.metadata,
          },
        },
      });

      // Find or create inventory item
      let inventoryItem = await tx.item.findFirst({
        where: {
          tenantId,
          name: createSupplyDto.itemType,
          itemType: 'INVENTORY',
        },
      });

      if (!inventoryItem) {
        inventoryItem = await tx.item.create({
          data: {
            tenantId,
            name: createSupplyDto.itemType,
            sku: `INV_${createSupplyDto.itemType.toUpperCase()}_${Date.now()}`,
            itemType: 'INVENTORY',
            quantity: createSupplyDto.quantity,
            defaultPrice: createSupplyDto.unitPrice * 1.2, // 20% markup
            tags: '',
            metadata: {
              averagePrice: createSupplyDto.unitPrice,
              totalValue: total,
              lastStockUpdate: new Date(),
              costPrice: createSupplyDto.unitPrice,
            },
          },
        });
      } else {
        // Update existing inventory
        const currentQuantity = Number(inventoryItem.quantity);
        const newQuantity = currentQuantity + createSupplyDto.quantity;
        const currentTotalValue =
          (inventoryItem.metadata as any)?.totalValue || 0;
        const newTotalValue = currentTotalValue + total;
        const newAveragePrice = newTotalValue / newQuantity;

        await tx.item.update({
          where: { id: inventoryItem.id },
          data: {
            quantity: newQuantity,
            costPrice: createSupplyDto.unitPrice,
            metadata: {
              ...(inventoryItem.metadata as any),
              averagePrice: newAveragePrice,
              totalValue: newTotalValue,
              lastStockUpdate: new Date(),
            },
          },
        });
      }

      // Create double-entry transaction (linked to entity + optional container)
      const transactionResult =
        await this.transactionsService.createDoubleEntry(tenantId, userId, {
          debitAccountType: 'INVENTORY',
          creditAccountType: 'SUPPLIER_PAYABLE',
          amount: total,
          entityId: createSupplyDto.entityId,
          notes: `Supply from ${createSupplyDto.supplierName}`,
          linkedEntityType: 'SUPPLY',
          linkedEntityId: supply.id,
          containerId: createSupplyDto.containerId,
        });

      // Update supply record with transaction pair ID
      await tx.note.update({
        where: { id: supply.id },
        data: {
          context: {
            ...(supply.context as any),
            transactionPairId: transactionResult.transactionPairId,
            linkedInventoryItems: [inventoryItem.id],
          },
        },
      });

      return this.mapSupplyToDto(supply);
    });
  }

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

    return supplies.map((supply) => this.mapSupplyToDto(supply));
  }

  async findOneSupply(tenantId: string, id: string): Promise<SupplyDto> {
    const supply = await this.prisma.note.findFirst({
      where: {
        id,
        tenantId,
        aboutType: 'SUPPLY',
      },
    });

    if (!supply) {
      throw new NotFoundException(`Supply with ID ${id} not found`);
    }

    return this.mapSupplyToDto(supply);
  }

  async updateSupply(
    tenantId: string,
    userId: string,
    id: string,
    updateSupplyDto: UpdateSupplyDto,
  ): Promise<SupplyDto> {
    return await this.prisma.$transaction(async (tx) => {
      const existingSupply = await tx.note.findFirst({
        where: {
          id,
          tenantId,
          aboutType: 'SUPPLY',
        },
      });

      if (!existingSupply) {
        throw new NotFoundException(`Supply with ID ${id} not found`);
      }

      const context = existingSupply.context as any;
      const transactionPairId = context?.transactionPairId;

      // Reverse the original transaction if it exists
      if (transactionPairId) {
        try {
          await this.transactionsService.reverseDoubleEntry(
            tenantId,
            userId,
            transactionPairId,
          );
        } catch (error) {
          // Log error but continue
          console.error('Failed to reverse original transaction:', error);
        }
      }

      // Update inventory (remove old quantity)
      if (context?.linkedInventoryItems) {
        for (const inventoryId of context.linkedInventoryItems) {
          const inventoryItem = await tx.item.findFirst({
            where: { id: inventoryId },
          });

          if (inventoryItem) {
            const newQuantity =
              Number(inventoryItem.quantity) - context.quantity;
            const currentTotalValue =
              (inventoryItem.metadata as any)?.totalValue || 0;
            const oldValue = context.total;
            const newTotalValue = currentTotalValue - oldValue;
            const newAveragePrice =
              newQuantity > 0 ? newTotalValue / newQuantity : 0;

            await tx.item.update({
              where: { id: inventoryId },
              data: {
                quantity: newQuantity,
                metadata: {
                  ...(inventoryItem.metadata as any),
                  averagePrice: newAveragePrice,
                  totalValue: newTotalValue,
                  lastStockUpdate: new Date(),
                },
              },
            });
          }
        }
      }

      // Create new supply with updated values
      const newQuantity = updateSupplyDto.quantity || context.quantity;
      const newUnitPrice = updateSupplyDto.unitPrice || context.unitPrice;
      const newTotal = newQuantity * newUnitPrice;
      const newSupplierName =
        updateSupplyDto.supplierName || context.supplierName;
      const newItemType = updateSupplyDto.itemType || context.itemType;

      // Update supply record
      const updatedSupply = await tx.note.update({
        where: { id },
        data: {
          content: `Supply: ${newSupplierName} - ${newItemType}`,
          context: {
            ...context,
            supplierName: newSupplierName,
            itemType: newItemType,
            quantity: newQuantity,
            unitPrice: newUnitPrice,
            total: newTotal,
            unit: updateSupplyDto.unit || context.unit,
            notes: updateSupplyDto.notes || context.notes,
            metadata: { ...context.metadata, ...updateSupplyDto.metadata },
          },
        },
      });

      // Find or create inventory item for new item type
      let inventoryItem = await tx.item.findFirst({
        where: {
          tenantId,
          name: newItemType,
          itemType: 'INVENTORY',
        },
      });

      if (!inventoryItem) {
        inventoryItem = await tx.item.create({
          data: {
            tenantId,
            name: newItemType,
            sku: `INV_${newItemType.toUpperCase()}_${Date.now()}`,
            itemType: 'INVENTORY',
            quantity: newQuantity,
            defaultPrice: newUnitPrice * 1.2,
            tags: '',
            metadata: {
              averagePrice: newUnitPrice,
              totalValue: newTotal,
              lastStockUpdate: new Date(),
              costPrice: newUnitPrice,
            },
          },
        });
      } else {
        // Update existing inventory
        const currentQuantity = Number(inventoryItem.quantity);
        const newQuantityTotal = currentQuantity + newQuantity;
        const currentTotalValue =
          (inventoryItem.metadata as any)?.totalValue || 0;
        const newTotalValue = currentTotalValue + newTotal;
        const newAveragePrice = newTotalValue / newQuantityTotal;

        await tx.item.update({
          where: { id: inventoryItem.id },
          data: {
            quantity: newQuantityTotal,
            costPrice: newUnitPrice,
            metadata: {
              ...(inventoryItem.metadata as any),
              averagePrice: newAveragePrice,
              totalValue: newTotalValue,
              lastStockUpdate: new Date(),
            },
          },
        });
      }

      // Create new double-entry transaction
      const transactionResult =
        await this.transactionsService.createDoubleEntry(tenantId, userId, {
          debitAccountType: 'INVENTORY',
          creditAccountType: 'SUPPLIER_PAYABLE',
          amount: newTotal,
          notes: `Updated supply from ${newSupplierName}`,
          linkedEntityType: 'SUPPLY',
          linkedEntityId: id,
        });

      // Update supply record with new transaction pair ID
      await tx.note.update({
        where: { id },
        data: {
          context: {
            ...(updatedSupply.context as any),
            transactionPairId: transactionResult.transactionPairId,
            linkedInventoryItems: [inventoryItem.id],
          },
        },
      });

      return this.mapSupplyToDto(updatedSupply);
    });
  }

  async removeSupply(
    tenantId: string,
    userId: string,
    id: string,
  ): Promise<void> {
    return await this.prisma.$transaction(async (tx) => {
      const supply = await tx.note.findFirst({
        where: {
          id,
          tenantId,
          aboutType: 'SUPPLY',
        },
      });

      if (!supply) {
        throw new NotFoundException(`Supply with ID ${id} not found`);
      }

      const context = supply.context as any;
      const transactionPairId = context?.transactionPairId;

      // Reverse the transaction
      if (transactionPairId) {
        await this.transactionsService.reverseDoubleEntry(
          tenantId,
          userId,
          transactionPairId,
        );
      }

      // Update inventory
      if (context?.linkedInventoryItems) {
        for (const inventoryId of context.linkedInventoryItems) {
          const inventoryItem = await tx.item.findFirst({
            where: { id: inventoryId },
          });

          if (inventoryItem) {
            const newQuantity =
              Number(inventoryItem.quantity) - context.quantity;
            const currentTotalValue =
              (inventoryItem.metadata as any)?.totalValue || 0;
            const oldValue = context.total;
            const newTotalValue = currentTotalValue - oldValue;
            const newAveragePrice =
              newQuantity > 0 ? newTotalValue / newQuantity : 0;

            await tx.item.update({
              where: { id: inventoryId },
              data: {
                quantity: newQuantity,
                metadata: {
                  ...(inventoryItem.metadata as any),
                  averagePrice: newAveragePrice,
                  totalValue: newTotalValue,
                  lastStockUpdate: new Date(),
                },
              },
            });
          }
        }
      }

      // Delete supply record
      await tx.note.delete({
        where: { id },
      });
    });
  }

  // Inventory Management
  async getInventory(tenantId: string): Promise<InventoryDto[]> {
    if (!tenantId || typeof tenantId !== 'string' || tenantId.trim() === '') {
      return [];
    }
    try {
      const inventoryItems = await this.prisma.item.findMany({
        where: {
          tenantId: tenantId.trim(),
          itemType: 'INVENTORY',
          isActive: true,
        },
        orderBy: {
          name: 'asc',
        },
      });

      return inventoryItems.map((item) => this.mapItemToInventoryDto(item));
    } catch (err) {
      // Log but return empty list so frontend doesn't break
      console.error('getInventory error:', err);
      return [];
    }
  }

  async getInventoryItem(tenantId: string, id: string): Promise<InventoryDto> {
    const item = await this.prisma.item.findFirst({
      where: {
        id,
        tenantId,
        itemType: 'INVENTORY',
      },
    });

    if (!item) {
      throw new NotFoundException(`Inventory item with ID ${id} not found`);
    }

    return this.mapItemToInventoryDto(item);
  }

  // Inventory containers
  async getContainers(tenantId: string, entityId?: string): Promise<InventoryContainerDto[]> {
    if (!tenantId?.trim()) return [];
    const where: any = { tenantId: tenantId.trim(), isActive: true };
    if (entityId?.trim()) where.assignedEntityId = entityId.trim();
    const list = await (this.prisma as any).inventoryContainer.findMany({
      where,
      orderBy: { name: 'asc' },
      include: { assignedEntity: true },
    });
    return list.map((c: any) => this.mapContainerToDto(c));
  }

  async getContainer(tenantId: string, id: string): Promise<InventoryContainerDto> {
    const c = await (this.prisma as any).inventoryContainer.findFirst({
      where: { id, tenantId },
    });
    if (!c) throw new NotFoundException(`Container ${id} not found`);
    return this.mapContainerToDto(c);
  }

  async createContainer(
    tenantId: string,
    dto: CreateInventoryContainerDto,
  ): Promise<InventoryContainerDto> {
    const raw = await (this.prisma as any).inventoryContainer.create({
      data: {
        tenantId,
        name: dto.name,
        type: dto.type,
        location: dto.location ?? null,
        capacity: dto.capacity ?? null,
        assignedEntityId: dto.assignedEntityId ?? null,
        metadata: (dto.metadata as any) ?? {},
      },
    });
    return this.mapContainerToDto(raw);
  }

  async updateContainer(
    tenantId: string,
    id: string,
    dto: UpdateInventoryContainerDto,
  ): Promise<InventoryContainerDto> {
    await this.getContainer(tenantId, id);
    const raw = await (this.prisma as any).inventoryContainer.update({
      where: { id },
      data: {
        ...(dto.name != null && { name: dto.name }),
        ...(dto.type != null && { type: dto.type }),
        ...(dto.location !== undefined && { location: dto.location }),
        ...(dto.capacity !== undefined && { capacity: dto.capacity }),
        ...(dto.assignedEntityId !== undefined && { assignedEntityId: dto.assignedEntityId ?? null }),
        ...(dto.metadata !== undefined && { metadata: dto.metadata as any }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
    return this.mapContainerToDto(raw);
  }

  async deleteContainer(tenantId: string, id: string): Promise<void> {
    await this.getContainer(tenantId, id);
    await (this.prisma as any).inventoryContainer.delete({ where: { id } });
  }

  async getContainerItems(
    tenantId: string,
    containerId: string,
  ): Promise<InventoryContainerItemDto[]> {
    await this.getContainer(tenantId, containerId);
    const items = await (this.prisma as any).inventoryContainerItem.findMany({
      where: { containerId },
      include: { item: true },
    });
    return items.map((row: any) => this.mapContainerItemToDto(row));
  }

  async addContainerItem(
    tenantId: string,
    containerId: string,
    dto: AddContainerItemDto,
  ): Promise<InventoryContainerItemDto> {
    await this.getContainer(tenantId, containerId);
    const item = await this.prisma.item.findFirst({
      where: { id: dto.itemId, tenantId, itemType: 'INVENTORY' },
    });
    if (!item) throw new NotFoundException(`Item ${dto.itemId} not found`);
    const batchRef = dto.batchRef?.trim() ?? '';
    const existing = await (this.prisma as any).inventoryContainerItem.findFirst({
      where: { containerId, itemId: dto.itemId, batchRef },
    });
    let row: any;
    if (existing) {
      const newQty = Number(existing.quantity) + dto.quantity;
      row = await (this.prisma as any).inventoryContainerItem.update({
        where: { id: existing.id },
        data: {
          quantity: newQty,
          ...(dto.expiryAt && { expiryAt: new Date(dto.expiryAt) }),
        },
        include: { item: true },
      });
    } else {
      row = await (this.prisma as any).inventoryContainerItem.create({
        data: {
          containerId,
          itemId: dto.itemId,
          quantity: dto.quantity,
          batchRef,
          ...(dto.expiryAt && { expiryAt: new Date(dto.expiryAt) }),
        },
        include: { item: true },
      });
    }
    return this.mapContainerItemToDto(row);
  }

  private mapContainerToDto(c: any): InventoryContainerDto {
    return {
      id: c.id,
      tenantId: c.tenantId,
      name: c.name,
      type: c.type,
      location: c.location ?? undefined,
      capacity: c.capacity ?? undefined,
      assignedEntityId: c.assignedEntityId ?? undefined,
      metadata: typeof c.metadata === 'object' && c.metadata !== null ? { ...c.metadata } : {},
      isActive: c.isActive ?? true,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    };
  }

  private mapContainerItemToDto(row: any): InventoryContainerItemDto {
    const item = row.item;
    return {
      id: row.id,
      containerId: row.containerId,
      itemId: row.itemId,
      quantity: Number(row.quantity),
      batchRef: row.batchRef ?? '',
      expiryAt: row.expiryAt ?? undefined,
      metadata: typeof row.metadata === 'object' && row.metadata !== null ? { ...row.metadata } : {},
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      itemName: item?.name,
      itemSku: item?.sku,
    };
  }

  // Invoice Management
  async createInvoice(
    tenantId: string,
    userId: string,
    createInvoiceDto: CreateInvoiceDto,
  ): Promise<InvoiceDto> {
    return await this.prisma.$transaction(async (tx) => {
      const subtotal = createInvoiceDto.items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0,
      );
      const total = subtotal; // Add tax if needed

      // Create invoice record (using Note model)
      const invoice = await tx.note.create({
        data: {
          tenantId,
          content: `Invoice: ${createInvoiceDto.customerName}`,
          aboutType: 'INVOICE',
          aboutId: createInvoiceDto.entityId,
          context: {
            customerName: createInvoiceDto.customerName,
            items: createInvoiceDto.items as any,
            subtotal,
            total,
            status: 'DRAFT',
            entityId: createInvoiceDto.entityId,
            dueDate: createInvoiceDto.dueDate,
            notes: createInvoiceDto.notes,
            metadata: createInvoiceDto.metadata,
            isSettled: false,
            settledAmount: 0,
          } as any,
        },
      });

      return this.mapNoteToInvoiceDto(invoice);
    });
  }

  async findAllInvoices(tenantId: string): Promise<InvoiceDto[]> {
    const invoices = await this.prisma.note.findMany({
      where: {
        tenantId,
        aboutType: 'INVOICE',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return invoices.map((invoice) => this.mapNoteToInvoiceDto(invoice));
  }

  async findOneInvoice(tenantId: string, id: string): Promise<InvoiceDto> {
    const invoice = await this.prisma.note.findFirst({
      where: {
        id,
        tenantId,
        aboutType: 'INVOICE',
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    return this.mapNoteToInvoiceDto(invoice);
  }

  // Payment Management
  async createPayment(
    tenantId: string,
    userId: string,
    createPaymentDto: CreatePaymentDto,
  ): Promise<PaymentDto> {
    return await this.prisma.$transaction(async (tx) => {
      // Create payment record
      const payment = await tx.payment.create({
        data: {
          tenantId,
          createdByUserId: userId,
          amount: createPaymentDto.amount,
          reference: createPaymentDto.reference,
          method: createPaymentDto.method,
          status: 'COMPLETED',
          paidAt: new Date(),
          metadata: {
            invoiceId: createPaymentDto.invoiceId,
            entityId: createPaymentDto.entityId,
            notes: createPaymentDto.notes,
            ...createPaymentDto.metadata,
          },
        },
      });

      // Create double-entry transaction
      const transactionResult =
        await this.transactionsService.createDoubleEntry(tenantId, userId, {
          debitAccountType: 'CASH',
          creditAccountType: 'ACCOUNTS_RECEIVABLE',
          amount: createPaymentDto.amount,
          notes: `Payment via ${createPaymentDto.method}`,
          linkedEntityType: 'PAYMENT',
          linkedEntityId: payment.id,
        });

      // Update payment with transaction info
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          metadata: {
            ...(payment.metadata as any),
            transactionPairId: transactionResult.transactionPairId,
          },
        },
      });

      // Update invoice if provided
      if (createPaymentDto.invoiceId) {
        const invoice = await tx.note.findFirst({
          where: {
            id: createPaymentDto.invoiceId,
            tenantId,
            aboutType: 'INVOICE',
          },
        });

        if (invoice) {
          const context = invoice.context as any;
          const newSettledAmount =
            (context.settledAmount || 0) + createPaymentDto.amount;
          const isSettled = newSettledAmount >= context.total;

          await tx.note.update({
            where: { id: createPaymentDto.invoiceId },
            data: {
              context: {
                ...context,
                settledAmount: newSettledAmount,
                isSettled,
                status: isSettled ? 'SETTLED' : 'PARTIAL',
              },
            },
          });
        }
      }

      return this.mapPaymentToDto(payment);
    });
  }

  async findAllPayments(tenantId: string): Promise<PaymentDto[]> {
    const payments = await this.prisma.payment.findMany({
      where: {
        tenantId,
      },
      include: {
        applications: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return payments.map((payment) => this.mapPaymentToDto(payment));
  }

  async findOnePayment(tenantId: string, id: string): Promise<PaymentDto> {
    const payment = await this.prisma.payment.findFirst({
      where: {
        id,
        tenantId,
      },
      include: {
        applications: true,
      },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return this.mapPaymentToDto(payment);
  }

  private mapSupplyToDto(supply: any): SupplyDto {
    const context = supply.context;
    return {
      id: supply.id,
      tenantId: supply.tenantId,
      supplierName: context.supplierName,
      itemType: context.itemType,
      quantity: context.quantity,
      unitPrice: context.unitPrice,
      total: context.total,
      unit: context.unit || 'PCS',
      entityId: context.entityId,
      notes: context.notes,
      metadata: context.metadata || {},
      linkedInventoryItems: context.linkedInventoryItems || [],
      transactionPairId: context.transactionPairId,
      createdByUserId: '', // Note model doesn't have this
      createdAt: supply.createdAt,
      updatedAt: supply.updatedAt,
    };
  }

  private mapItemToInventoryDto(item: any): InventoryDto {
    const rawMeta = item.metadata || {};
    let metadata: Record<string, unknown> = {};
    if (typeof rawMeta === 'object' && rawMeta !== null) {
      try {
        metadata = JSON.parse(JSON.stringify(rawMeta));
      } catch {
        metadata = {};
      }
    }
    const avgPrice = metadata.averagePrice ?? item.costPrice;
    const totalVal =
      metadata.totalValue ??
      Number(item.quantity ?? 0) * Number(item.costPrice ?? 0);
    return {
      id: item.id,
      tenantId: item.tenantId,
      name: item.name,
      quantity: Number(item.quantity ?? 0),
      unit: item.unit_of_measure ?? 'PCS',
      averagePrice: Number(avgPrice ?? 0),
      totalValue: Number(totalVal),
      metadata,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  private mapNoteToInvoiceDto(invoice: any): InvoiceDto {
    const context = invoice.context;
    return {
      id: invoice.id,
      tenantId: invoice.tenantId,
      customerName: context.customerName,
      items: context.items || [],
      subtotal: context.subtotal || 0,
      total: context.total || 0,
      status: context.status || 'DRAFT',
      entityId: context.entityId,
      dueDate: context.dueDate ? new Date(context.dueDate) : undefined,
      notes: context.notes,
      metadata: context.metadata || {},
      isSettled: context.isSettled || false,
      settledAmount: context.settledAmount || 0,
      createdByUserId: '', // Note model doesn't have this
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
    };
  }

  private mapPaymentToDto(payment: any): PaymentDto {
    return {
      id: payment.id,
      tenantId: payment.tenantId,
      amount: Number(payment.amount),
      reference: payment.reference,
      method: payment.method,
      status: payment.status,
      metadata: payment.metadata as Record<string, any>,
      createdByUserId: payment.createdByUserId,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      paidAt: payment.paidAt,
      applications: payment.applications.map((app: any) => ({
        id: app.id,
        paymentId: app.paymentId,
        transactionId: app.transactionId,
        amount: Number(app.amount),
        appliedAmount: Number(app.appliedAmount),
        appliedAt: app.appliedAt,
      })),
    };
  }
}
