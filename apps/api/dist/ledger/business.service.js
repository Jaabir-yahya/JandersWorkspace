"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const transactions_service_1 = require("./transactions.service");
let BusinessService = class BusinessService {
    prisma;
    transactionsService;
    constructor(prisma, transactionsService) {
        this.prisma = prisma;
        this.transactionsService = transactionsService;
    }
    async createSupply(tenantId, userId, createSupplyDto) {
        return await this.prisma.$transaction(async (tx) => {
            const total = createSupplyDto.quantity * createSupplyDto.unitPrice;
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
                        defaultPrice: createSupplyDto.unitPrice * 1.2,
                        tags: '',
                        metadata: {
                            averagePrice: createSupplyDto.unitPrice,
                            totalValue: total,
                            lastStockUpdate: new Date(),
                            costPrice: createSupplyDto.unitPrice,
                        },
                    },
                });
            }
            else {
                const currentQuantity = Number(inventoryItem.quantity);
                const newQuantity = currentQuantity + createSupplyDto.quantity;
                const currentTotalValue = inventoryItem.metadata?.totalValue || 0;
                const newTotalValue = currentTotalValue + total;
                const newAveragePrice = newTotalValue / newQuantity;
                await tx.item.update({
                    where: { id: inventoryItem.id },
                    data: {
                        quantity: newQuantity,
                        costPrice: createSupplyDto.unitPrice,
                        metadata: {
                            ...inventoryItem.metadata,
                            averagePrice: newAveragePrice,
                            totalValue: newTotalValue,
                            lastStockUpdate: new Date(),
                        },
                    },
                });
            }
            const transactionResult = await this.transactionsService.createDoubleEntry(tenantId, userId, {
                debitAccountType: 'INVENTORY',
                creditAccountType: 'SUPPLIER_PAYABLE',
                amount: total,
                entityId: createSupplyDto.entityId,
                notes: `Supply from ${createSupplyDto.supplierName}`,
                linkedEntityType: 'SUPPLY',
                linkedEntityId: supply.id,
                containerId: createSupplyDto.containerId,
            });
            await tx.note.update({
                where: { id: supply.id },
                data: {
                    context: {
                        ...supply.context,
                        transactionPairId: transactionResult.transactionPairId,
                        linkedInventoryItems: [inventoryItem.id],
                    },
                },
            });
            return this.mapSupplyToDto(supply);
        });
    }
    async findAllSupplies(tenantId) {
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
    async findOneSupply(tenantId, id) {
        const supply = await this.prisma.note.findFirst({
            where: {
                id,
                tenantId,
                aboutType: 'SUPPLY',
            },
        });
        if (!supply) {
            throw new common_1.NotFoundException(`Supply with ID ${id} not found`);
        }
        return this.mapSupplyToDto(supply);
    }
    async updateSupply(tenantId, userId, id, updateSupplyDto) {
        return await this.prisma.$transaction(async (tx) => {
            const existingSupply = await tx.note.findFirst({
                where: {
                    id,
                    tenantId,
                    aboutType: 'SUPPLY',
                },
            });
            if (!existingSupply) {
                throw new common_1.NotFoundException(`Supply with ID ${id} not found`);
            }
            const context = existingSupply.context;
            const transactionPairId = context?.transactionPairId;
            if (transactionPairId) {
                try {
                    await this.transactionsService.reverseDoubleEntry(tenantId, userId, transactionPairId);
                }
                catch (error) {
                    console.error('Failed to reverse original transaction:', error);
                }
            }
            if (context?.linkedInventoryItems) {
                for (const inventoryId of context.linkedInventoryItems) {
                    const inventoryItem = await tx.item.findFirst({
                        where: { id: inventoryId },
                    });
                    if (inventoryItem) {
                        const newQuantity = Number(inventoryItem.quantity) - context.quantity;
                        const currentTotalValue = inventoryItem.metadata?.totalValue || 0;
                        const oldValue = context.total;
                        const newTotalValue = currentTotalValue - oldValue;
                        const newAveragePrice = newQuantity > 0 ? newTotalValue / newQuantity : 0;
                        await tx.item.update({
                            where: { id: inventoryId },
                            data: {
                                quantity: newQuantity,
                                metadata: {
                                    ...inventoryItem.metadata,
                                    averagePrice: newAveragePrice,
                                    totalValue: newTotalValue,
                                    lastStockUpdate: new Date(),
                                },
                            },
                        });
                    }
                }
            }
            const newQuantity = updateSupplyDto.quantity || context.quantity;
            const newUnitPrice = updateSupplyDto.unitPrice || context.unitPrice;
            const newTotal = newQuantity * newUnitPrice;
            const newSupplierName = updateSupplyDto.supplierName || context.supplierName;
            const newItemType = updateSupplyDto.itemType || context.itemType;
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
            }
            else {
                const currentQuantity = Number(inventoryItem.quantity);
                const newQuantityTotal = currentQuantity + newQuantity;
                const currentTotalValue = inventoryItem.metadata?.totalValue || 0;
                const newTotalValue = currentTotalValue + newTotal;
                const newAveragePrice = newTotalValue / newQuantityTotal;
                await tx.item.update({
                    where: { id: inventoryItem.id },
                    data: {
                        quantity: newQuantityTotal,
                        costPrice: newUnitPrice,
                        metadata: {
                            ...inventoryItem.metadata,
                            averagePrice: newAveragePrice,
                            totalValue: newTotalValue,
                            lastStockUpdate: new Date(),
                        },
                    },
                });
            }
            const transactionResult = await this.transactionsService.createDoubleEntry(tenantId, userId, {
                debitAccountType: 'INVENTORY',
                creditAccountType: 'SUPPLIER_PAYABLE',
                amount: newTotal,
                notes: `Updated supply from ${newSupplierName}`,
                linkedEntityType: 'SUPPLY',
                linkedEntityId: id,
            });
            await tx.note.update({
                where: { id },
                data: {
                    context: {
                        ...updatedSupply.context,
                        transactionPairId: transactionResult.transactionPairId,
                        linkedInventoryItems: [inventoryItem.id],
                    },
                },
            });
            return this.mapSupplyToDto(updatedSupply);
        });
    }
    async removeSupply(tenantId, userId, id) {
        return await this.prisma.$transaction(async (tx) => {
            const supply = await tx.note.findFirst({
                where: {
                    id,
                    tenantId,
                    aboutType: 'SUPPLY',
                },
            });
            if (!supply) {
                throw new common_1.NotFoundException(`Supply with ID ${id} not found`);
            }
            const context = supply.context;
            const transactionPairId = context?.transactionPairId;
            if (transactionPairId) {
                await this.transactionsService.reverseDoubleEntry(tenantId, userId, transactionPairId);
            }
            if (context?.linkedInventoryItems) {
                for (const inventoryId of context.linkedInventoryItems) {
                    const inventoryItem = await tx.item.findFirst({
                        where: { id: inventoryId },
                    });
                    if (inventoryItem) {
                        const newQuantity = Number(inventoryItem.quantity) - context.quantity;
                        const currentTotalValue = inventoryItem.metadata?.totalValue || 0;
                        const oldValue = context.total;
                        const newTotalValue = currentTotalValue - oldValue;
                        const newAveragePrice = newQuantity > 0 ? newTotalValue / newQuantity : 0;
                        await tx.item.update({
                            where: { id: inventoryId },
                            data: {
                                quantity: newQuantity,
                                metadata: {
                                    ...inventoryItem.metadata,
                                    averagePrice: newAveragePrice,
                                    totalValue: newTotalValue,
                                    lastStockUpdate: new Date(),
                                },
                            },
                        });
                    }
                }
            }
            await tx.note.delete({
                where: { id },
            });
        });
    }
    async getInventory(tenantId) {
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
        }
        catch (err) {
            console.error('getInventory error:', err);
            return [];
        }
    }
    async getInventoryItem(tenantId, id) {
        const item = await this.prisma.item.findFirst({
            where: {
                id,
                tenantId,
                itemType: 'INVENTORY',
            },
        });
        if (!item) {
            throw new common_1.NotFoundException(`Inventory item with ID ${id} not found`);
        }
        return this.mapItemToInventoryDto(item);
    }
    async getContainers(tenantId, entityId) {
        if (!tenantId?.trim())
            return [];
        const where = { tenantId: tenantId.trim(), isActive: true };
        if (entityId?.trim())
            where.assignedEntityId = entityId.trim();
        const list = await this.prisma.inventoryContainer.findMany({
            where,
            orderBy: { name: 'asc' },
            include: { assignedEntity: true },
        });
        return list.map((c) => this.mapContainerToDto(c));
    }
    async getContainer(tenantId, id) {
        const c = await this.prisma.inventoryContainer.findFirst({
            where: { id, tenantId },
        });
        if (!c)
            throw new common_1.NotFoundException(`Container ${id} not found`);
        return this.mapContainerToDto(c);
    }
    async createContainer(tenantId, dto) {
        const raw = await this.prisma.inventoryContainer.create({
            data: {
                tenantId,
                name: dto.name,
                type: dto.type,
                location: dto.location ?? null,
                capacity: dto.capacity ?? null,
                assignedEntityId: dto.assignedEntityId ?? null,
                metadata: dto.metadata ?? {},
            },
        });
        return this.mapContainerToDto(raw);
    }
    async updateContainer(tenantId, id, dto) {
        await this.getContainer(tenantId, id);
        const raw = await this.prisma.inventoryContainer.update({
            where: { id },
            data: {
                ...(dto.name != null && { name: dto.name }),
                ...(dto.type != null && { type: dto.type }),
                ...(dto.location !== undefined && { location: dto.location }),
                ...(dto.capacity !== undefined && { capacity: dto.capacity }),
                ...(dto.assignedEntityId !== undefined && { assignedEntityId: dto.assignedEntityId ?? null }),
                ...(dto.metadata !== undefined && { metadata: dto.metadata }),
                ...(dto.isActive !== undefined && { isActive: dto.isActive }),
            },
        });
        return this.mapContainerToDto(raw);
    }
    async deleteContainer(tenantId, id) {
        await this.getContainer(tenantId, id);
        await this.prisma.inventoryContainer.delete({ where: { id } });
    }
    async getContainerItems(tenantId, containerId) {
        await this.getContainer(tenantId, containerId);
        const items = await this.prisma.inventoryContainerItem.findMany({
            where: { containerId },
            include: { item: true },
        });
        return items.map((row) => this.mapContainerItemToDto(row));
    }
    async addContainerItem(tenantId, containerId, dto) {
        await this.getContainer(tenantId, containerId);
        const item = await this.prisma.item.findFirst({
            where: { id: dto.itemId, tenantId, itemType: 'INVENTORY' },
        });
        if (!item)
            throw new common_1.NotFoundException(`Item ${dto.itemId} not found`);
        const batchRef = dto.batchRef?.trim() ?? '';
        const existing = await this.prisma.inventoryContainerItem.findFirst({
            where: { containerId, itemId: dto.itemId, batchRef },
        });
        let row;
        if (existing) {
            const newQty = Number(existing.quantity) + dto.quantity;
            row = await this.prisma.inventoryContainerItem.update({
                where: { id: existing.id },
                data: {
                    quantity: newQty,
                    ...(dto.expiryAt && { expiryAt: new Date(dto.expiryAt) }),
                },
                include: { item: true },
            });
        }
        else {
            row = await this.prisma.inventoryContainerItem.create({
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
    mapContainerToDto(c) {
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
    mapContainerItemToDto(row) {
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
    async createInvoice(tenantId, userId, createInvoiceDto) {
        return await this.prisma.$transaction(async (tx) => {
            const subtotal = createInvoiceDto.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
            const total = subtotal;
            const invoice = await tx.note.create({
                data: {
                    tenantId,
                    content: `Invoice: ${createInvoiceDto.customerName}`,
                    aboutType: 'INVOICE',
                    aboutId: createInvoiceDto.entityId,
                    context: {
                        customerName: createInvoiceDto.customerName,
                        items: createInvoiceDto.items,
                        subtotal,
                        total,
                        status: 'DRAFT',
                        entityId: createInvoiceDto.entityId,
                        dueDate: createInvoiceDto.dueDate,
                        notes: createInvoiceDto.notes,
                        metadata: createInvoiceDto.metadata,
                        isSettled: false,
                        settledAmount: 0,
                    },
                },
            });
            return this.mapNoteToInvoiceDto(invoice);
        });
    }
    async findAllInvoices(tenantId) {
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
    async findOneInvoice(tenantId, id) {
        const invoice = await this.prisma.note.findFirst({
            where: {
                id,
                tenantId,
                aboutType: 'INVOICE',
            },
        });
        if (!invoice) {
            throw new common_1.NotFoundException(`Invoice with ID ${id} not found`);
        }
        return this.mapNoteToInvoiceDto(invoice);
    }
    async createPayment(tenantId, userId, createPaymentDto) {
        return await this.prisma.$transaction(async (tx) => {
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
            const transactionResult = await this.transactionsService.createDoubleEntry(tenantId, userId, {
                debitAccountType: 'CASH',
                creditAccountType: 'ACCOUNTS_RECEIVABLE',
                amount: createPaymentDto.amount,
                notes: `Payment via ${createPaymentDto.method}`,
                linkedEntityType: 'PAYMENT',
                linkedEntityId: payment.id,
            });
            await tx.payment.update({
                where: { id: payment.id },
                data: {
                    metadata: {
                        ...payment.metadata,
                        transactionPairId: transactionResult.transactionPairId,
                    },
                },
            });
            if (createPaymentDto.invoiceId) {
                const invoice = await tx.note.findFirst({
                    where: {
                        id: createPaymentDto.invoiceId,
                        tenantId,
                        aboutType: 'INVOICE',
                    },
                });
                if (invoice) {
                    const context = invoice.context;
                    const newSettledAmount = (context.settledAmount || 0) + createPaymentDto.amount;
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
    async findAllPayments(tenantId) {
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
    async findOnePayment(tenantId, id) {
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
            throw new common_1.NotFoundException(`Payment with ID ${id} not found`);
        }
        return this.mapPaymentToDto(payment);
    }
    mapSupplyToDto(supply) {
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
            createdByUserId: '',
            createdAt: supply.createdAt,
            updatedAt: supply.updatedAt,
        };
    }
    mapItemToInventoryDto(item) {
        const rawMeta = item.metadata || {};
        let metadata = {};
        if (typeof rawMeta === 'object' && rawMeta !== null) {
            try {
                metadata = JSON.parse(JSON.stringify(rawMeta));
            }
            catch {
                metadata = {};
            }
        }
        const avgPrice = metadata.averagePrice ?? item.costPrice;
        const totalVal = metadata.totalValue ??
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
    mapNoteToInvoiceDto(invoice) {
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
            createdByUserId: '',
            createdAt: invoice.createdAt,
            updatedAt: invoice.updatedAt,
        };
    }
    mapPaymentToDto(payment) {
        return {
            id: payment.id,
            tenantId: payment.tenantId,
            amount: Number(payment.amount),
            reference: payment.reference,
            method: payment.method,
            status: payment.status,
            metadata: payment.metadata,
            createdByUserId: payment.createdByUserId,
            createdAt: payment.createdAt,
            updatedAt: payment.updatedAt,
            paidAt: payment.paidAt,
            applications: payment.applications.map((app) => ({
                id: app.id,
                paymentId: app.paymentId,
                transactionId: app.transactionId,
                amount: Number(app.amount),
                appliedAmount: Number(app.appliedAmount),
                appliedAt: app.appliedAt,
            })),
        };
    }
};
exports.BusinessService = BusinessService;
exports.BusinessService = BusinessService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        transactions_service_1.TransactionsService])
], BusinessService);
//# sourceMappingURL=business.service.js.map