import { PrismaService } from '../prisma/prisma.service';
export interface SmsSummary {
    phoneNumber: string;
    message: string;
    type: 'daily' | 'weekly' | 'alert';
}
export declare class NairobiSmsService {
    private readonly prismaService;
    constructor(prismaService: PrismaService);
    generateDailySummary(tenantId: string): Promise<SmsSummary>;
    sendSms(sms: SmsSummary): Promise<boolean>;
    sendDailySummaries(): Promise<void>;
    private formatSmsMessage;
    handleSmsCommand(phoneNumber: string, message: string): Promise<string>;
    setupSmsWebhook(): Promise<{
        url: string;
        method: string;
    }>;
}
