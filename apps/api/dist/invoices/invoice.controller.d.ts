import * as InvoiceServiceModule from './invoice.service';
export declare class InvoiceController {
    private readonly invoiceService;
    constructor(invoiceService: InvoiceServiceModule.InvoiceService);
    createInvoice(req: any, createInvoiceDto: InvoiceServiceModule.CreateInvoiceDto): Promise<InvoiceServiceModule.InvoiceDto>;
    findAllInvoices(req: any): Promise<InvoiceServiceModule.InvoiceDto[]>;
    findOneInvoice(req: any, id: string): Promise<InvoiceServiceModule.InvoiceDto>;
    applyPayment(req: any, id: string, paymentDto: InvoiceServiceModule.PaymentApplicationDto): Promise<{
        message: string;
        transactionId: string;
    }>;
    cancelInvoice(req: any, id: string): Promise<{
        message: string;
    }>;
}
