export declare class MessageContentDto {
    body?: string;
    templateName?: string;
    templateData?: {
        language?: string;
        components?: Array<{
            type: string;
            parameters?: Array<{
                type: string;
                [key: string]: any;
            }>;
        }>;
    };
}
export declare class SendMessageDto {
    to: string;
    type: 'text' | 'template';
    content: MessageContentDto;
}
