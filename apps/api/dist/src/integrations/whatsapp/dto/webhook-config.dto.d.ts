export declare class WebhookConfigDto {
    name: string;
    url: string;
    events: string[];
    secret?: string;
    isActive?: boolean;
    retryPolicy?: {
        maxRetries: number;
        backoffMs: number;
    };
}
