"use strict";
/**
 * M-Pesa SMS Parsing and Validation Utilities
 * Handles parsing of M-Pesa transaction SMS messages
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractAmount = extractAmount;
exports.extractPhoneNumber = extractPhoneNumber;
exports.extractTransactionType = extractTransactionType;
exports.extractTimestamp = extractTimestamp;
exports.isMpesaSms = isMpesaSms;
exports.parseMpesaSms = parseMpesaSms;
/**
 * Extract amount from M-Pesa SMS
 * @param sms - The SMS message text
 * @returns The extracted amount as a number
 */
function extractAmount(sms) {
    // Match patterns like "Ksh1,234.00", "KES 1,234", "1,234.00"
    const patterns = [
        /Ksh[\s]*([\d,]+\.?\d*)/i,
        /KES[\s]*([\d,]+\.?\d*)/i,
        /sent[\s]+Ksh[\s]*([\d,]+\.?\d*)/i,
        /received[\s]+Ksh[\s]*([\d,]+\.?\d*)/i,
        /paid[\s]+Ksh[\s]*([\d,]+\.?\d*)/i,
        /confirmed[\s]+.*[\s]+Ksh[\s]*([\d,]+\.?\d*)/i,
    ];
    for (const pattern of patterns) {
        const match = sms.match(pattern);
        if (match) {
            const amountStr = match[1].replace(/,/g, '');
            const amount = parseFloat(amountStr);
            if (!isNaN(amount)) {
                return amount;
            }
        }
    }
    throw new Error('Could not extract amount from SMS');
}
/**
 * Extract phone number from M-Pesa SMS
 * @param sms - The SMS message text
 * @returns The extracted phone number
 */
function extractPhoneNumber(sms) {
    // Match Kenyan phone number patterns
    // +254XXXXXXXXX, 254XXXXXXXXX, 07XXXXXXXX, 01XXXXXXXX
    const patterns = [
        /from[\s]+(\+?254\d{9})/i,
        /to[\s]+(\+?254\d{9})/i,
        /from[\s]+(0[17]\d{8})/i,
        /to[\s]+(0[17]\d{8})/i,
        /(\+254\d{9})/,
        /(254\d{9})/,
        /(0[17]\d{8})/,
    ];
    for (const pattern of patterns) {
        const match = sms.match(pattern);
        if (match) {
            let phone = match[1];
            // Normalize to international format
            if (phone.startsWith('0')) {
                phone = '254' + phone.substring(1);
            }
            else if (!phone.startsWith('+') && !phone.startsWith('254')) {
                phone = '254' + phone;
            }
            return phone.startsWith('+') ? phone.substring(1) : phone;
        }
    }
    throw new Error('Could not extract phone number from SMS');
}
/**
 * Extract transaction type from M-Pesa SMS
 * @param sms - The SMS message text
 * @returns The transaction type: 'sent' or 'received'
 */
function extractTransactionType(sms) {
    const lowerSms = sms.toLowerCase();
    // Keywords indicating money received
    const receivedKeywords = [
        'received',
        'you have received',
        'incoming',
        'credited',
        'paid to you',
        'give money',
        'received from',
    ];
    // Keywords indicating money sent
    const sentKeywords = [
        'sent to',
        'paid to',
        'you sent',
        'outgoing',
        'debited',
        'bought',
        'withdraw',
        'withdrawn',
        'payment to',
        'transferred to',
    ];
    for (const keyword of receivedKeywords) {
        if (lowerSms.includes(keyword)) {
            return 'received';
        }
    }
    for (const keyword of sentKeywords) {
        if (lowerSms.includes(keyword)) {
            return 'sent';
        }
    }
    // Default to received if we can't determine
    return 'received';
}
/**
 * Extract timestamp from M-Pesa SMS
 * @param sms - The SMS message text
 * @returns The extracted timestamp as a Date object
 */
function extractTimestamp(sms) {
    // Try to find date/time patterns in the SMS
    const patterns = [
        // "on 3/2/25 at 2:30 PM" or "on 3/2/2025 at 2:30 PM"
        /on\s+(\d{1,2}[\/\-]\d{1,2}[\/\-](?:\d{2}|\d{4}))\s+at\s+(\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)?)/i,
        // "3/2/25 14:30" or "3/2/2025 14:30"
        /(\d{1,2}[\/\-]\d{1,2}[\/\-](?:\d{2}|\d{4}))\s+(\d{1,2}:\d{2}(?::\d{2})?)/,
        // "at 2:30 PM on 3/2/25"
        /at\s+(\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)?)\s+on\s+(\d{1,2}[\/\-]\d{1,2}[\/\-](?:\d{2}|\d{4}))/i,
    ];
    for (const pattern of patterns) {
        const match = sms.match(pattern);
        if (match) {
            const dateStr = match[1] || match[2];
            const timeStr = match[2] || match[1];
            try {
                // Try to parse the date
                const dateParts = dateStr.split(/[\/\-]/);
                let day = parseInt(dateParts[0], 10);
                let month = parseInt(dateParts[1], 10) - 1; // JS months are 0-indexed
                let year = parseInt(dateParts[2], 10);
                // Handle 2-digit years
                if (year < 100) {
                    year += year < 50 ? 2000 : 1900;
                }
                // Parse time
                let hours = 0;
                let minutes = 0;
                const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i);
                if (timeMatch) {
                    hours = parseInt(timeMatch[1], 10);
                    minutes = parseInt(timeMatch[2], 10);
                    const ampm = timeMatch[4]?.toUpperCase();
                    if (ampm === 'PM' && hours !== 12) {
                        hours += 12;
                    }
                    else if (ampm === 'AM' && hours === 12) {
                        hours = 0;
                    }
                }
                const date = new Date(year, month, day, hours, minutes);
                if (!isNaN(date.getTime())) {
                    return date;
                }
            }
            catch {
                // Continue to next pattern
            }
        }
    }
    // If no timestamp found, return current date
    return new Date();
}
/**
 * Check if a text message is an M-Pesa SMS
 * @param text - The text to check
 * @returns True if the text appears to be an M-Pesa SMS
 */
function isMpesaSms(text) {
    if (!text || typeof text !== 'string') {
        return false;
    }
    const lowerText = text.toLowerCase();
    // M-Pesa specific keywords
    const mpesaKeywords = [
        'mpesa',
        'm-pesa',
        'confirmed',
        'transaction',
        'ksh',
        'kes ',
        'safaricom',
    ];
    // Must have at least 2 M-Pesa keywords to be considered valid
    let keywordCount = 0;
    for (const keyword of mpesaKeywords) {
        if (lowerText.includes(keyword)) {
            keywordCount++;
        }
    }
    return keywordCount >= 2;
}
/**
 * Parse a complete M-Pesa SMS message
 * @param sms - The SMS message text
 * @returns A complete MpesaTransaction object
 */
function parseMpesaSms(sms) {
    if (!isMpesaSms(sms)) {
        throw new Error('Text does not appear to be a valid M-Pesa SMS');
    }
    // Extract transaction ID
    let transactionId = '';
    const txIdMatch = sms.match(/(?:Transaction|Confirmation|Receipt)\s+(?:ID|Code|#)?[\s:]*([A-Z0-9]{8,})/i);
    if (txIdMatch) {
        transactionId = txIdMatch[1];
    }
    else {
        // Generate a fallback ID based on timestamp
        transactionId = `MPESA_${Date.now()}`;
    }
    // Try to extract recipient/sender name
    let recipientName;
    let senderName;
    const namePatterns = [
        /to\s+([A-Z\s]+)\s+\d/i,
        /from\s+([A-Z\s]+)\s+\d/i,
        /paid to\s+([A-Za-z\s]+?)\s+for/i,
        /bought from\s+([A-Za-z\s]+?)\s+for/i,
    ];
    for (const pattern of namePatterns) {
        const match = sms.match(pattern);
        if (match) {
            const name = match[1].trim();
            if (extractTransactionType(sms) === 'sent') {
                recipientName = name;
            }
            else {
                senderName = name;
            }
            break;
        }
    }
    // Try to extract balance
    let balance;
    const balanceMatch = sms.match(/(?:balance|new balance|bal)[\s:]*Ksh[\s]*([\d,]+\.?\d*)/i);
    if (balanceMatch) {
        balance = parseFloat(balanceMatch[1].replace(/,/g, ''));
    }
    return {
        transactionId,
        amount: extractAmount(sms),
        phoneNumber: extractPhoneNumber(sms),
        transactionType: extractTransactionType(sms),
        timestamp: extractTimestamp(sms),
        balance,
        recipientName,
        senderName,
        description: sms.substring(0, 200), // First 200 chars as description
    };
}
