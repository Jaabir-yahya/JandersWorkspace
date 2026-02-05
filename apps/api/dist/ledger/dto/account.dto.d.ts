export declare class CreateAccountDto {
    name: string;
    type: string;
    balance?: number;
    currency?: string;
    metadata?: Record<string, any>;
}
export declare class UpdateAccountDto {
    name?: string;
    balance?: number;
    metadata?: Record<string, any>;
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
