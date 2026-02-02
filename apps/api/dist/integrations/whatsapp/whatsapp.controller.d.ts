import { WhatsAppService } from './whatsapp.service';
import { SendMessageDto } from './dto/send-message.dto';
import { WebhookConfigDto } from './dto/webhook-config.dto';
export declare class WhatsAppController {
    private readonly whatsappService;
    constructor(whatsappService: WhatsAppService);
    sendMessage(req: any, sendMessageDto: SendMessageDto): Promise<{
        success: boolean;
        data: any;
        tenantId: any;
    }>;
    sendTemplateMessage(req: any, body: {
        to: string;
        templateName: string;
        languageCode?: string;
        components?: any[];
    }): Promise<{
        success: boolean;
        data: any;
        tenantId: any;
    }>;
    verifyWebhook(mode: string, token: string, challenge: string): Promise<string | {
        success: boolean;
        message: string;
    }>;
    handleWebhook(payload: any): Promise<import("../types/integration.types").WebhookResult>;
    configureWebhook(req: any, configDto: WebhookConfigDto): Promise<{
        success: boolean;
        message: string;
        tenantId: any;
        config: WebhookConfigDto;
    }>;
    getHealthStatus(): Promise<{
        status: "HEALTHY" | "DEGRADED" | "UNHEALTHY";
        lastCheck: Date;
        responseTime?: number;
        errorMessage?: string;
        service: string;
    }>;
}
