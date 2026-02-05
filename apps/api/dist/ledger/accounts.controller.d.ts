import { AccountsService } from './accounts.service';
import { CreateAccountDto, UpdateAccountDto, AccountDto } from './dto/account.dto';
export declare class AccountsController {
    private readonly accountsService;
    constructor(accountsService: AccountsService);
    create(req: any, createAccountDto: CreateAccountDto): Promise<AccountDto>;
    findAll(req: any): Promise<AccountDto[]>;
    getTrialBalance(req: any): Promise<any[]>;
    findByType(req: any, type: string): Promise<AccountDto[]>;
    findOne(req: any, id: string): Promise<AccountDto>;
    getBalance(req: any, id: string): Promise<{
        balance: number;
    }>;
    update(req: any, id: string, updateAccountDto: UpdateAccountDto): Promise<AccountDto>;
    remove(req: any, id: string): Promise<void>;
}
