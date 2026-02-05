/**
 * M-Pesa SMS Parsing and Validation Utilities
 * Handles parsing of M-Pesa transaction SMS messages
 */
export interface MpesaTransaction {
    transactionId: string;
    amount: number;
    phoneNumber: string;
    transactionType: 'sent' | 'received';
    timestamp: Date;
    balance?: number;
    recipientName?: string;
    senderName?: string;
    description?: string;
}
/**
 * Extract amount from M-Pesa SMS
 * @param sms - The SMS message text
 * @returns The extracted amount as a number
 */
export declare function extractAmount(sms: string): number;
/**
 * Extract phone number from M-Pesa SMS
 * @param sms - The SMS message text
 * @returns The extracted phone number
 */
export declare function extractPhoneNumber(sms: string): string;
/**
 * Extract transaction type from M-Pesa SMS
 * @param sms - The SMS message text
 * @returns The transaction type: 'sent' or 'received'
 */
export declare function extractTransactionType(sms: string): 'sent' | 'received';
/**
 * Extract timestamp from M-Pesa SMS
 * @param sms - The SMS message text
 * @returns The extracted timestamp as a Date object
 */
export declare function extractTimestamp(sms: string): Date;
/**
 * Check if a text message is an M-Pesa SMS
 * @param text - The text to check
 * @returns True if the text appears to be an M-Pesa SMS
 */
export declare function isMpesaSms(text: string): boolean;
/**
 * Parse a complete M-Pesa SMS message
 * @param sms - The SMS message text
 * @returns A complete MpesaTransaction object
 */
export declare function parseMpesaSms(sms: string): MpesaTransaction;
//# sourceMappingURL=mpesa-utils.d.ts.map