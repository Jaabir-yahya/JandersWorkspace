/**
 * Swahili Localization Helpers
 * Provides localized UI text and formatting for Kenyan users
 */
export declare const swahiliGreetings: {
    readonly goodMorning: "Habari za asubuhi";
    readonly goodAfternoon: "Habari za mchana";
    readonly goodEvening: "Habari za jioni";
    readonly hello: "Jambo";
    readonly welcome: "Karibu";
    readonly goodbye: "Kwa heri";
    readonly thankYou: "Asante";
    readonly thankYouVeryMuch: "Asante sana";
    readonly please: "Tafadhali";
    readonly sorry: "Pole";
    readonly yes: "Ndiyo";
    readonly no: "Hapana";
};
export declare const swahiliTime: {
    readonly today: "Leo";
    readonly yesterday: "Jana";
    readonly tomorrow: "Kesho";
    readonly now: "Sasa";
    readonly later: "Baadaye";
    readonly morning: "Asubuhi";
    readonly afternoon: "Mchana";
    readonly evening: "Jioni";
    readonly night: "Usiku";
    readonly monday: "Jumatatu";
    readonly tuesday: "Jumanne";
    readonly wednesday: "Jumatano";
    readonly thursday: "Alhamisi";
    readonly friday: "Ijumaa";
    readonly saturday: "Jumamosi";
    readonly sunday: "Jumapili";
};
export declare const swahiliBusiness: {
    readonly money: "Pesa";
    readonly payment: "Malipo";
    readonly transaction: "Shughuli";
    readonly balance: "Salio";
    readonly account: "Akaunti";
    readonly receipt: "Risiti";
    readonly invoice: "Ankara";
    readonly customer: "Mteja";
    readonly supplier: "Muuzaji";
    readonly profit: "Faida";
    readonly loss: "Hasara";
    readonly expense: "Gharama";
    readonly income: "Mapato";
    readonly salary: "Mshahara";
    readonly price: "Bei";
    readonly discount: "Punguzo";
    readonly tax: "Kodi";
    readonly vat: "VAT";
    readonly bank: "Benki";
    readonly loan: "Mkopo";
    readonly debt: "Deni";
    readonly credit: "Mkopo";
};
export declare const swahiliStatus: {
    readonly pending: "Inasubiri";
    readonly completed: "Imekamilika";
    readonly failed: "Imeshindwa";
    readonly processing: "Inaendelea";
    readonly cancelled: "Imeghairiwa";
    readonly approved: "Imekubaliwa";
    readonly rejected: "Imekataliwa";
    readonly active: "Inayofanya kazi";
    readonly inactive: "Haijafanya kazi";
    readonly paid: "Imelipwa";
    readonly unpaid: "Haijalipwa";
};
export declare const swahiliMpesa: {
    readonly sendMoney: "Tuma Pesa";
    readonly withdrawMoney: "Toa Pesa";
    readonly buyAirtime: "Nunua Muda wa Maongezi";
    readonly lipaNaMpesa: "Lipa na M-PESA";
    readonly payBill: "Lipa Bili";
    readonly buyGoods: "Nunua Bidhaa";
    readonly myAccount: "Akaunti Yangu";
    readonly checkBalance: "Angalia Salio";
    readonly miniStatement: "Taarifa Fupi";
    readonly confirmed: "Imethibitishwa";
    readonly received: "Imepokelewa";
    readonly sent: "Imetumwa";
};
/**
 * Get greeting based on time of day
 * @param date - Optional date (defaults to now)
 * @returns Appropriate Swahili greeting
 */
export declare function getSwahiliGreeting(date?: Date): string;
/**
 * Format a date with Swahili month/day names
 * @param date - The date to format
 * @param format - The format style
 * @returns Formatted date string
 */
export declare function formatSwahiliDate(date: Date, format?: 'short' | 'long' | 'relative'): string;
/**
 * Format currency amount with Swahili text
 * @param amount - The amount
 * @returns Formatted string with Swahili
 */
export declare function formatKesWithSwahili(amount: number): string;
/**
 * Get transaction status in Swahili
 * @param status - The status key
 * @returns Swahili status text
 */
export declare function getSwahiliStatus(status: keyof typeof swahiliStatus): string;
/**
 * Format phone number in Kenyan style
 * @param phone - The phone number
 * @returns Formatted phone number
 */
export declare function formatKenyanPhone(phone: string): string;
/**
 * Create a bilingual message (English + Swahili)
 * @param english - English text
 * @param swahili - Swahili text
 * @returns Combined message
 */
export declare function bilingualMessage(english: string, swahili: string): string;
/**
 * Common bilingual UI labels
 */
export declare const bilingualLabels: {
    readonly save: string;
    readonly cancel: string;
    readonly delete: string;
    readonly edit: string;
    readonly create: string;
    readonly submit: string;
    readonly confirm: string;
    readonly back: string;
    readonly next: string;
    readonly search: string;
    readonly filter: string;
    readonly download: string;
    readonly upload: string;
    readonly print: string;
    readonly share: string;
    readonly settings: string;
    readonly help: string;
    readonly logout: string;
    readonly login: string;
    readonly register: string;
    readonly dashboard: string;
    readonly transactions: string;
    readonly reports: string;
    readonly customers: string;
    readonly suppliers: string;
    readonly inventory: string;
    readonly settingsAccount: string;
};
//# sourceMappingURL=swahili-helpers.d.ts.map