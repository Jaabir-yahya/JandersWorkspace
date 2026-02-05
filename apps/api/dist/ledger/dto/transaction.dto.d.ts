export declare class CreateTransactionDto {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    date?: string;
    reasonId?: string;
    entityId?: string;
    notes?: string;
    reference?: string;
    metadata?: Record<string, any>;
}
export declare class CreateDoubleEntryTransactionDto {
    debitAccountType: string;
    creditAccountType: string;
    amount: number;
    date?: string;
    reasonId?: string;
    entityId?: string;
    notes?: string;
    reference?: string;
    linkedEntityType?: string;
    linkedEntityId?: string;
    containerId?: string;
}
export declare class AccountDto {
    id: string;
    tenantId: string;
    name: string;
    type: string;
    balance: number;
    currency: string;
    metadata: Record<string, any>;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare class EntityDto {
    id: string;
    tenantId: string;
    name: string;
    phone?: string;
    email?: string;
    type: string;
    isActive: boolean;
    metadata: Record<string, any>;
    createdByUserId: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class TransactionReasonDto {
    id: string;
    tenantId: string;
    name: string;
    type: string;
    parentId?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare class TransactionDto {
    id: string;
    tenantId: string;
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    date: Date;
    reasonId?: string;
    entityId?: string;
    notes?: string;
    reference?: string;
    metadata: Record<string, any>;
    reversalId?: string;
    createdByUserId: string;
    createdAt: Date;
    updatedAt: Date;
    fromAccount?: AccountDto;
    toAccount?: AccountDto;
    reason?: TransactionReasonDto;
    entity?: EntityDto;
}
