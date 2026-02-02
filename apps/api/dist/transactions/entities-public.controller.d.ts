import { TransactionsService } from './transactions.service';
import { CreateEntityPublicDto } from './dto/create-entity-public.dto';
export declare class EntitiesPublicController {
    private readonly transactionsService;
    constructor(transactionsService: TransactionsService);
    list(tenantId: string, type?: string, search?: string): Promise<{
        id: string;
        tenantId: string;
        type: import("@prisma/client").$Enums.EntityType;
        createdAt: Date;
        phoneNumber: string | null;
        displayName: string;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        createdByUserId: string;
    }[]>;
    create(tenantId: string, dto: CreateEntityPublicDto): Promise<{
        id: string;
        tenantId: string;
        type: import("@prisma/client").$Enums.EntityType;
        createdAt: Date;
        phoneNumber: string | null;
        displayName: string;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        createdByUserId: string;
    }>;
    getOne(tenantId: string, id: string): Promise<{
        id: string;
        tenantId: string;
        type: import("@prisma/client").$Enums.EntityType;
        createdAt: Date;
        phoneNumber: string | null;
        displayName: string;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        createdByUserId: string;
    }>;
    getHistory(tenantId: string, id: string): Promise<{
        entity: any;
        transactions: import("./transactions.service").EntityHistoryItem[];
        total_balance: number;
    }>;
    getBalance(tenantId: string, id: string): Promise<{
        entity: {
            id: string;
            tenantId: string;
            type: import("@prisma/client").$Enums.EntityType;
            createdAt: Date;
            phoneNumber: string | null;
            displayName: string;
            metadata: import("@prisma/client/runtime/library").JsonValue;
            createdByUserId: string;
        };
        balance: {
            total_credit: number;
            total_debit: number;
            net_balance: number;
            transaction_count: number;
        };
    }>;
}
