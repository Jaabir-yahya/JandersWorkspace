import { PaymentRecordsService } from './payment-records.service';
import { CreatePaymentRecordDto } from './dto/create-payment-record.dto';
export declare class PaymentRecordsController {
    private readonly paymentRecordsService;
    constructor(paymentRecordsService: PaymentRecordsService);
    findByTransaction(transactionId: string): Promise<import("./payment-records.service").PaymentRecord[]>;
    create(dto: CreatePaymentRecordDto, req: any): Promise<import("./payment-records.service").PaymentRecord>;
    delete(id: string): Promise<void>;
}
