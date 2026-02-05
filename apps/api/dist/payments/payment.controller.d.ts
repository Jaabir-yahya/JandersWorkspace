import { PaymentService } from './payment.service';
import type { CreatePaymentDto, PaymentDto } from './payment.service';
export declare class PaymentController {
    private readonly paymentService;
    constructor(paymentService: PaymentService);
    createPayment(req: any, createPaymentDto: CreatePaymentDto): Promise<PaymentDto>;
    findAllPayments(req: any): Promise<PaymentDto[]>;
    findPaymentsByMethod(req: any, method: string): Promise<PaymentDto[]>;
    findOnePayment(req: any, id: string): Promise<PaymentDto>;
    reversePayment(req: any, id: string, reason: string): Promise<{
        message: string;
    }>;
}
