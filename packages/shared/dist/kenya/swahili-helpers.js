"use strict";
/**
 * Swahili Localization Helpers
 * Provides localized UI text and formatting for Kenyan users
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.bilingualLabels = exports.swahiliMpesa = exports.swahiliStatus = exports.swahiliBusiness = exports.swahiliTime = exports.swahiliGreetings = void 0;
exports.getSwahiliGreeting = getSwahiliGreeting;
exports.formatSwahiliDate = formatSwahiliDate;
exports.formatKesWithSwahili = formatKesWithSwahili;
exports.getSwahiliStatus = getSwahiliStatus;
exports.formatKenyanPhone = formatKenyanPhone;
exports.bilingualMessage = bilingualMessage;
// Common Swahili greetings
exports.swahiliGreetings = {
    goodMorning: 'Habari za asubuhi',
    goodAfternoon: 'Habari za mchana',
    goodEvening: 'Habari za jioni',
    hello: 'Jambo',
    welcome: 'Karibu',
    goodbye: 'Kwa heri',
    thankYou: 'Asante',
    thankYouVeryMuch: 'Asante sana',
    please: 'Tafadhali',
    sorry: 'Pole',
    yes: 'Ndiyo',
    no: 'Hapana',
};
// Time-related terms
exports.swahiliTime = {
    today: 'Leo',
    yesterday: 'Jana',
    tomorrow: 'Kesho',
    now: 'Sasa',
    later: 'Baadaye',
    morning: 'Asubuhi',
    afternoon: 'Mchana',
    evening: 'Jioni',
    night: 'Usiku',
    monday: 'Jumatatu',
    tuesday: 'Jumanne',
    wednesday: 'Jumatano',
    thursday: 'Alhamisi',
    friday: 'Ijumaa',
    saturday: 'Jumamosi',
    sunday: 'Jumapili',
};
// Business/financial terms
exports.swahiliBusiness = {
    money: 'Pesa',
    payment: 'Malipo',
    transaction: 'Shughuli',
    balance: 'Salio',
    account: 'Akaunti',
    receipt: 'Risiti',
    invoice: 'Ankara',
    customer: 'Mteja',
    supplier: 'Muuzaji',
    profit: 'Faida',
    loss: 'Hasara',
    expense: 'Gharama',
    income: 'Mapato',
    salary: 'Mshahara',
    price: 'Bei',
    discount: 'Punguzo',
    tax: 'Kodi',
    vat: 'VAT',
    bank: 'Benki',
    loan: 'Mkopo',
    debt: 'Deni',
    credit: 'Mkopo',
};
// Status terms
exports.swahiliStatus = {
    pending: 'Inasubiri',
    completed: 'Imekamilika',
    failed: 'Imeshindwa',
    processing: 'Inaendelea',
    cancelled: 'Imeghairiwa',
    approved: 'Imekubaliwa',
    rejected: 'Imekataliwa',
    active: 'Inayofanya kazi',
    inactive: 'Haijafanya kazi',
    paid: 'Imelipwa',
    unpaid: 'Haijalipwa',
};
// M-Pesa specific terms
exports.swahiliMpesa = {
    sendMoney: 'Tuma Pesa',
    withdrawMoney: 'Toa Pesa',
    buyAirtime: 'Nunua Muda wa Maongezi',
    lipaNaMpesa: 'Lipa na M-PESA',
    payBill: 'Lipa Bili',
    buyGoods: 'Nunua Bidhaa',
    myAccount: 'Akaunti Yangu',
    checkBalance: 'Angalia Salio',
    miniStatement: 'Taarifa Fupi',
    confirmed: 'Imethibitishwa',
    received: 'Imepokelewa',
    sent: 'Imetumwa',
};
/**
 * Get greeting based on time of day
 * @param date - Optional date (defaults to now)
 * @returns Appropriate Swahili greeting
 */
function getSwahiliGreeting(date = new Date()) {
    const hour = date.getHours();
    if (hour >= 5 && hour < 12) {
        return exports.swahiliGreetings.goodMorning;
    }
    else if (hour >= 12 && hour < 17) {
        return exports.swahiliGreetings.goodAfternoon;
    }
    else {
        return exports.swahiliGreetings.goodEvening;
    }
}
/**
 * Format a date with Swahili month/day names
 * @param date - The date to format
 * @param format - The format style
 * @returns Formatted date string
 */
function formatSwahiliDate(date, format = 'long') {
    const swahiliMonths = [
        'Januari', 'Februari', 'Machi', 'Aprili', 'Mei', 'Juni',
        'Julai', 'Agosti', 'Septemba', 'Oktoba', 'Novemba', 'Desemba'
    ];
    const dayNames = [
        exports.swahiliTime.sunday,
        exports.swahiliTime.monday,
        exports.swahiliTime.tuesday,
        exports.swahiliTime.wednesday,
        exports.swahiliTime.thursday,
        exports.swahiliTime.friday,
        exports.swahiliTime.saturday,
    ];
    if (format === 'relative') {
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 0)
            return exports.swahiliTime.today;
        if (diffDays === 1)
            return exports.swahiliTime.yesterday;
        if (diffDays === -1)
            return exports.swahiliTime.tomorrow;
        if (diffDays > 1 && diffDays < 7) {
            return `${diffDays} siku zilizopita`;
        }
    }
    const day = date.getDate();
    const month = swahiliMonths[date.getMonth()];
    const year = date.getFullYear();
    const dayName = dayNames[date.getDay()];
    if (format === 'short') {
        return `${day} ${month.substring(0, 3)} ${year}`;
    }
    return `${dayName}, ${day} ${month} ${year}`;
}
/**
 * Format currency amount with Swahili text
 * @param amount - The amount
 * @returns Formatted string with Swahili
 */
function formatKesWithSwahili(amount) {
    if (amount === 0)
        return 'Ksh 0 (Sifuri)';
    const formatted = new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
    }).format(amount);
    return formatted;
}
/**
 * Get transaction status in Swahili
 * @param status - The status key
 * @returns Swahili status text
 */
function getSwahiliStatus(status) {
    return exports.swahiliStatus[status] || status;
}
/**
 * Format phone number in Kenyan style
 * @param phone - The phone number
 * @returns Formatted phone number
 */
function formatKenyanPhone(phone) {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    // Handle different formats
    if (digits.length === 9 && digits.startsWith('7')) {
        // Format: 7XX XXX XXX
        return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    }
    else if (digits.length === 10 && digits.startsWith('0')) {
        // Format: 07X XXX XXXX
        return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
    }
    else if (digits.length === 12 && digits.startsWith('254')) {
        // Format: +254 7XX XXX XXX
        return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`;
    }
    else if (digits.length === 13 && digits.startsWith('254')) {
        // Format: +254 1XX XXX XXX
        return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`;
    }
    return phone;
}
/**
 * Create a bilingual message (English + Swahili)
 * @param english - English text
 * @param swahili - Swahili text
 * @returns Combined message
 */
function bilingualMessage(english, swahili) {
    return `${english} / ${swahili}`;
}
/**
 * Common bilingual UI labels
 */
exports.bilingualLabels = {
    save: bilingualMessage('Save', 'Hifadhi'),
    cancel: bilingualMessage('Cancel', 'Ghairi'),
    delete: bilingualMessage('Delete', 'Futa'),
    edit: bilingualMessage('Edit', 'Hariri'),
    create: bilingualMessage('Create', 'Unda'),
    submit: bilingualMessage('Submit', 'Wasiliana'),
    confirm: bilingualMessage('Confirm', 'Thibitisha'),
    back: bilingualMessage('Back', 'Rudi'),
    next: bilingualMessage('Next', 'Endelea'),
    search: bilingualMessage('Search', 'Tafuta'),
    filter: bilingualMessage('Filter', 'Chuja'),
    download: bilingualMessage('Download', 'Pakua'),
    upload: bilingualMessage('Upload', 'Pakia'),
    print: bilingualMessage('Print', 'Chapisha'),
    share: bilingualMessage('Share', 'Sambaza'),
    settings: bilingualMessage('Settings', 'Mipangilio'),
    help: bilingualMessage('Help', 'Msaada'),
    logout: bilingualMessage('Logout', 'Toka'),
    login: bilingualMessage('Login', 'Ingia'),
    register: bilingualMessage('Register', 'Jiandikishe'),
    dashboard: bilingualMessage('Dashboard', 'Dashibodi'),
    transactions: bilingualMessage('Transactions', 'Shughuli'),
    reports: bilingualMessage('Reports', 'Ripoti'),
    customers: bilingualMessage('Customers', 'Wateja'),
    suppliers: bilingualMessage('Suppliers', 'Wauzaji'),
    inventory: bilingualMessage('Inventory', 'Malipo'),
    settingsAccount: bilingualMessage('Account Settings', 'Mipangilio ya Akaunti'),
};
