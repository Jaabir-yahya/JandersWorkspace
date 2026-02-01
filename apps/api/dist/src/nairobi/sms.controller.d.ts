import { NairobiSmsService, SmsSummary } from './sms.service';
export interface SmsWebhookDto {
    from: string;
    to: string;
    text: string;
    timestamp: string;
}
export declare class NairobiSmsController {
    private readonly smsService;
    constructor(smsService: NairobiSmsService);
    handleIncomingSms(smsData: SmsWebhookDto): Promise<{
        status: string;
        response: string;
        timestamp: string;
        message?: undefined;
    } | {
        status: string;
        message: any;
        timestamp: string;
        response?: undefined;
    }>;
    sendTestSms(body: {
        phoneNumber: string;
        tenantId: string;
    }): Promise<{
        status: string;
        sent: boolean;
        message: string;
    } | {
        status: string;
        message: any;
        sent?: undefined;
    }>;
    sendDailySummaries(): Promise<{
        status: string;
        message: any;
        timestamp: string;
    }>;
    getWebhookConfig(): Promise<{
        url: string;
        method: string;
    }>;
    generateSummary(tenantId: string): Promise<{
        status: string;
        data: SmsSummary;
        message?: undefined;
    } | {
        status: string;
        message: any;
        data?: undefined;
    }>;
}
