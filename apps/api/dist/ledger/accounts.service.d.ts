import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountDto, UpdateAccountDto, AccountDto } from './dto/account.dto';
export declare class AccountsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(tenantId: string, userId: string, createAccountDto: CreateAccountDto): Promise<AccountDto>;
    findAll(tenantId: string): Promise<AccountDto[]>;
    findOne(tenantId: string, id: string): Promise<AccountDto>;
    findByType(tenantId: string, type: string): Promise<AccountDto[]>;
    update(tenantId: string, id: string, updateAccountDto: UpdateAccountDto): Promise<AccountDto>;
    remove(tenantId: string, id: string): Promise<void>;
    getBalance(tenantId: string, id: string): Promise<{
        balance: number;
    }>;
    getTrialBalance(tenantId: string): Promise<any[]>;
    private mapItemToAccountDto;
}
