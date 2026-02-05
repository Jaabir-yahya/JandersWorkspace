import { TransactionsService } from './transactions.service';
import { CreateDoubleEntryTransactionDto, TransactionDto } from './dto/transaction.dto';
export declare class TransactionsController {
    private readonly transactionsService;
    constructor(transactionsService: TransactionsService);
    createDoubleEntry(req: any, createDoubleEntryDto: CreateDoubleEntryTransactionDto): Promise<{
        debitTransaction: TransactionDto;
        creditTransaction: TransactionDto;
        transactionPairId: string;
    }>;
    reverseDoubleEntry(req: any, transactionPairId: string): Promise<{
        reversalDebitTransaction: TransactionDto;
        reversalCreditTransaction: TransactionDto;
    }>;
    findAll(req: any, dateFrom?: string, dateTo?: string, accountType?: string, entityType?: string, entityName?: string): Promise<TransactionDto[]>;
    getTransactionHistory(req: any, dateFrom?: string, dateTo?: string, accountType?: string, entityType?: string): Promise<any[]>;
    findOne(req: any, id: string): Promise<TransactionDto>;
}
