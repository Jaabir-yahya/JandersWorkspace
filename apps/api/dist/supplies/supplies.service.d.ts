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
    accountId?: string;
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
    transactionId?: string;
}
export declare class SuppliesService {
    private readonly prisma;
    private readonly transactionsService;
    private readonly accountsService;
    constructor(prisma: PrismaService, transactionsService: UniversalTransactionsService, accountsService: UniversalAccountsService);
    createSupply(tenantId: string, userId: string, createSupplyDto: CreateSupplyDto): Promise<SupplyDto>;
    findAllSupplies(tenantId: string): Promise<SupplyDto[]>;
    findOneSupply(tenantId: string, id: string): Promise<SupplyDto>;
    updateSupplyStatus(tenantId: string, id: string, status: 'PENDING' | 'RECEIVED' | 'PROCESSED'): Promise<SupplyDto>;
    deleteSupply(tenantId: string, id: string): Promise<void>;
    private getDefaultInventoryAccount;
    private getDefaultPurchasesAccount;
    private mapNoteToSupply;
}
