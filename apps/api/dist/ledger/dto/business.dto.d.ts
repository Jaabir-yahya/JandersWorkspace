export declare class CreateSupplyDto {
    supplierName: string;
    itemType: string;
    quantity: number;
    unitPrice: number;
    unit?: string;
    entityId?: string;
    containerId?: string;
    notes?: string;
    metadata?: Record<string, any>;
}
export declare class UpdateSupplyDto {
    supplierName?: string;
    itemType?: string;
    quantity?: number;
    unitPrice?: number;
    unit?: string;
    notes?: string;
    metadata?: Record<string, any>;
}
export declare class SupplyDto {
    id: string;
    tenantId: string;
    supplierName: string;
    itemType: string;
    quantity: number;
    unitPrice: number;
    total: number;
    unit: string;
    entityId?: string;
    notes?: string;
    metadata: Record<string, any>;
    linkedInventoryItems: any[];
    transactionPairId?: string;
    createdByUserId: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class InventoryDto {
    id: string;
    tenantId: string;
    name: string;
    quantity: number;
    unit: string;
    averagePrice: number;
    totalValue: number;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
export declare class CreateInvoiceDto {
    customerName: string;
    items: InvoiceItemDto[];
    entityId?: string;
    dueDate?: string;
    notes?: string;
    metadata?: Record<string, any>;
}
export declare class InvoiceItemDto {
    description: string;
    quantity: number;
    unitPrice: number;
    itemType?: string;
}
export declare class InvoiceDto {
    id: string;
    tenantId: string;
    customerName: string;
    items: InvoiceItemDto[];
    subtotal: number;
    total: number;
    status: string;
    entityId?: string;
    dueDate?: Date;
    notes?: string;
    metadata: Record<string, any>;
    isSettled: boolean;
    settledAmount: number;
    createdByUserId: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class CreatePaymentDto {
    amount: number;
    method: string;
    reference?: string;
    invoiceId?: string;
    entityId?: string;
    notes?: string;
    metadata?: Record<string, any>;
}
export declare class PaymentDto {
    id: string;
    tenantId: string;
    amount: number;
    reference?: string;
    method: string;
    status: string;
    metadata: Record<string, any>;
    createdByUserId?: string;
    createdAt: Date;
    updatedAt: Date;
    paidAt?: Date;
    applications: PaymentApplicationDto[];
}
export declare class PaymentApplicationDto {
    id: string;
    paymentId: string;
    transactionId: string;
    amount: number;
    appliedAmount: number;
    appliedAt: Date;
}
export declare class InventoryContainerDto {
    id: string;
    tenantId: string;
    name: string;
    type: string;
    location?: string;
    capacity?: string;
    assignedEntityId?: string;
    metadata: Record<string, any>;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare class CreateInventoryContainerDto {
    name: string;
    type: string;
    location?: string;
    capacity?: string;
    assignedEntityId?: string;
    metadata?: Record<string, any>;
}
export declare class UpdateInventoryContainerDto extends CreateInventoryContainerDto {
    isActive?: boolean;
}
export declare class InventoryContainerItemDto {
    id: string;
    containerId: string;
    itemId: string;
    quantity: number;
    batchRef: string;
    expiryAt?: Date;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    itemName?: string;
    itemSku?: string;
}
export declare class AddContainerItemDto {
    itemId: string;
    quantity: number;
    batchRef?: string;
    expiryAt?: string;
}
