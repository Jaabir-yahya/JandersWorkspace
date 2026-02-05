"use strict";
/**
 * Kenyan Business Classifications
 * Types and classifications for Kenyan business entities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.KENYAN_BUSINESS_SECTORS = exports.KENYAN_BUSINESS_TYPES = exports.KENYA_MSME_CLASSIFICATIONS = void 0;
exports.classifyMSME = classifyMSME;
exports.getBusinessTypeInfo = getBusinessTypeInfo;
exports.getSectorInfo = getSectorInfo;
exports.requiresBusinessVatRegistration = requiresBusinessVatRegistration;
exports.isValidKraPin = isValidKraPin;
/**
 * Kenyan MSME classifications
 */
exports.KENYA_MSME_CLASSIFICATIONS = {
    micro: {
        category: 'micro',
        maxEmployees: 10,
        maxAnnualTurnover: 500000, // KES 500,000
        maxAssets: 500000, // KES 500,000
    },
    small: {
        category: 'small',
        maxEmployees: 50,
        maxAnnualTurnover: 5000000, // KES 5 million
        maxAssets: 5000000, // KES 5 million
    },
    medium: {
        category: 'medium',
        maxEmployees: 100,
        maxAnnualTurnover: 50000000, // KES 50 million
        maxAssets: 50000000, // KES 50 million
    },
};
/**
 * Business type definitions
 */
exports.KENYAN_BUSINESS_TYPES = {
    sole_proprietorship: {
        type: 'sole_proprietorship',
        name: 'Sole Proprietorship',
        swahiliName: 'Biashara ya Mtu Mmoja',
        description: 'Business owned and operated by one person',
        registrationAuthority: 'County Government',
        taxObligations: [
            { taxType: 'Income Tax', description: 'Turnover Tax or Normal Tax', frequency: 'monthly', mandatory: true, threshold: 5000000 },
            { taxType: 'VAT', description: 'Value Added Tax', frequency: 'monthly', mandatory: false, threshold: 5000000 },
        ],
    },
    partnership: {
        type: 'partnership',
        name: 'Partnership',
        swahiliName: 'Ushirika',
        description: 'Business owned by two or more partners',
        registrationAuthority: 'Registrar of Companies',
        taxObligations: [
            { taxType: 'Income Tax', description: 'Partnership tax return', frequency: 'annually', mandatory: true },
            { taxType: 'VAT', description: 'Value Added Tax', frequency: 'monthly', mandatory: false, threshold: 5000000 },
        ],
    },
    limited_company: {
        type: 'limited_company',
        name: 'Private Limited Company',
        swahiliName: 'Kampuni ya Kibinafsi',
        description: 'Company with limited liability, shares not publicly traded',
        registrationAuthority: 'Registrar of Companies',
        taxObligations: [
            { taxType: 'Corporate Tax', description: 'Company income tax', frequency: 'annually', mandatory: true },
            { taxType: 'VAT', description: 'Value Added Tax', frequency: 'monthly', mandatory: false, threshold: 5000000 },
            { taxType: 'PAYE', description: 'Pay As You Earn', frequency: 'monthly', mandatory: true },
            { taxType: 'NHIF', description: 'National Hospital Insurance Fund', frequency: 'monthly', mandatory: true },
            { taxType: 'NSSF', description: 'National Social Security Fund', frequency: 'monthly', mandatory: true },
        ],
    },
    public_limited_company: {
        type: 'public_limited_company',
        name: 'Public Limited Company',
        swahiliName: 'Kampuni ya Umma',
        description: 'Company whose shares are traded publicly',
        registrationAuthority: 'Registrar of Companies & CMA',
        taxObligations: [
            { taxType: 'Corporate Tax', description: 'Company income tax', frequency: 'annually', mandatory: true },
            { taxType: 'VAT', description: 'Value Added Tax', frequency: 'monthly', mandatory: true },
            { taxType: 'PAYE', description: 'Pay As You Earn', frequency: 'monthly', mandatory: true },
            { taxType: 'NHIF', description: 'National Hospital Insurance Fund', frequency: 'monthly', mandatory: true },
            { taxType: 'NSSF', description: 'National Social Security Fund', frequency: 'monthly', mandatory: true },
        ],
    },
    cooperative: {
        type: 'cooperative',
        name: 'Cooperative Society',
        swahiliName: 'Shirika la Ushirika',
        description: 'Member-owned business organization',
        registrationAuthority: 'Commissioner for Co-operative Development',
        taxObligations: [
            { taxType: 'Income Tax', description: 'Cooperative tax', frequency: 'annually', mandatory: true },
            { taxType: 'VAT', description: 'Value Added Tax', frequency: 'monthly', mandatory: false, threshold: 5000000 },
        ],
    },
    ngo: {
        type: 'ngo',
        name: 'Non-Governmental Organization',
        swahiliName: 'Shirika Lisilo la Kiserikali',
        description: 'Non-profit organization',
        registrationAuthority: 'NGO Coordination Board',
        taxObligations: [
            { taxType: 'Income Tax', description: 'NGO tax exemption application', frequency: 'annually', mandatory: false },
        ],
    },
    trust: {
        type: 'trust',
        name: 'Trust',
        swahiliName: 'Amana',
        description: 'Legal arrangement for holding assets',
        registrationAuthority: 'Registrar of Trusts',
        taxObligations: [
            { taxType: 'Income Tax', description: 'Trust income tax', frequency: 'annually', mandatory: true },
        ],
    },
    sacco: {
        type: 'sacco',
        name: 'SACCO',
        swahiliName: 'SACCO',
        description: 'Savings and Credit Cooperative Organization',
        registrationAuthority: 'SASRA',
        taxObligations: [
            { taxType: 'Income Tax', description: 'SACCO tax', frequency: 'annually', mandatory: true },
            { taxType: 'Withholding Tax', description: 'Interest withholding tax', frequency: 'monthly', mandatory: true },
        ],
    },
    chama: {
        type: 'chama',
        name: 'Chama',
        swahiliName: 'Chama',
        description: 'Informal savings and investment group',
        registrationAuthority: 'Self-regulated / County',
        taxObligations: [
            { taxType: 'Income Tax', description: 'If registered', frequency: 'annually', mandatory: false },
        ],
    },
    micro_enterprise: {
        type: 'micro_enterprise',
        name: 'Micro Enterprise',
        swahiliName: 'Biashara Ndogo',
        description: 'Business with up to 10 employees and KES 500K turnover',
        registrationAuthority: 'County Government',
        taxObligations: [
            { taxType: 'Turnover Tax', description: '3% of gross receipts', frequency: 'monthly', mandatory: true },
        ],
        annualTurnoverThreshold: 500000,
        employeeThreshold: 10,
    },
    small_enterprise: {
        type: 'small_enterprise',
        name: 'Small Enterprise',
        swahiliName: 'Biashara Ndogo-Medium',
        description: 'Business with 10-50 employees and KES 500K-5M turnover',
        registrationAuthority: 'Registrar of Companies',
        taxObligations: [
            { taxType: 'Income Tax', description: 'Corporate or personal tax', frequency: 'annually', mandatory: true },
            { taxType: 'VAT', description: 'Value Added Tax', frequency: 'monthly', mandatory: false, threshold: 5000000 },
        ],
        annualTurnoverThreshold: 5000000,
        employeeThreshold: 50,
    },
    medium_enterprise: {
        type: 'medium_enterprise',
        name: 'Medium Enterprise',
        swahiliName: 'Biashara ya Kati',
        description: 'Business with 50-100 employees and KES 5M-50M turnover',
        registrationAuthority: 'Registrar of Companies',
        taxObligations: [
            { taxType: 'Corporate Tax', description: 'Company income tax', frequency: 'annually', mandatory: true },
            { taxType: 'VAT', description: 'Value Added Tax', frequency: 'monthly', mandatory: true },
            { taxType: 'PAYE', description: 'Pay As You Earn', frequency: 'monthly', mandatory: true },
        ],
        annualTurnoverThreshold: 50000000,
        employeeThreshold: 100,
    },
    large_enterprise: {
        type: 'large_enterprise',
        name: 'Large Enterprise',
        swahiliName: 'Biashara Kubwa',
        description: 'Business with over 100 employees or KES 50M+ turnover',
        registrationAuthority: 'Registrar of Companies',
        taxObligations: [
            { taxType: 'Corporate Tax', description: 'Company income tax', frequency: 'annually', mandatory: true },
            { taxType: 'VAT', description: 'Value Added Tax', frequency: 'monthly', mandatory: true },
            { taxType: 'PAYE', description: 'Pay As You Earn', frequency: 'monthly', mandatory: true },
            { taxType: 'NHIF', description: 'National Hospital Insurance Fund', frequency: 'monthly', mandatory: true },
            { taxType: 'NSSF', description: 'National Social Security Fund', frequency: 'monthly', mandatory: true },
            { taxType: 'Excise Duty', description: 'Where applicable', frequency: 'monthly', mandatory: false },
        ],
        annualTurnoverThreshold: 50000000,
        employeeThreshold: 100,
    },
};
/**
 * Business sector information
 */
exports.KENYAN_BUSINESS_SECTORS = {
    agriculture: { name: 'Agriculture', swahiliName: 'Kilimo', kraprefix: 'A' },
    manufacturing: { name: 'Manufacturing', swahiliName: 'Utengenezaji', kraprefix: 'M' },
    retail: { name: 'Retail Trade', swahiliName: 'Biashara ya Rejareja', kraprefix: 'R' },
    wholesale: { name: 'Wholesale Trade', swahiliName: 'Biashara ya Jumla', kraprefix: 'W' },
    technology: { name: 'Technology', swahiliName: 'Teknolojia', kraprefix: 'T' },
    financial_services: { name: 'Financial Services', swahiliName: 'Huduma za Kifedha', kraprefix: 'F' },
    real_estate: { name: 'Real Estate', swahiliName: 'Mali Isiyohamishika', kraprefix: 'E' },
    construction: { name: 'Construction', swahiliName: 'Ujenzi', kraprefix: 'C' },
    transportation: { name: 'Transportation', swahiliName: 'Usafiri', kraprefix: 'N' },
    hospitality: { name: 'Hospitality', swahiliName: 'Ukarimu', kraprefix: 'H' },
    healthcare: { name: 'Healthcare', swahiliName: 'Afya', kraprefix: 'X' },
    education: { name: 'Education', swahiliName: 'Elimu', kraprefix: 'D' },
    professional_services: { name: 'Professional Services', swahiliName: 'Huduma za Kitaalamu', kraprefix: 'P' },
    arts_entertainment: { name: 'Arts & Entertainment', swahiliName: 'Sanaa na Burudani', kraprefix: 'B' },
    mining: { name: 'Mining', swahiliName: 'Uchimbaji Madini', kraprefix: 'I' },
    energy: { name: 'Energy', swahiliName: 'Nishati', kraprefix: 'G' },
    water_supply: { name: 'Water Supply', swahiliName: 'Usambazaji Maji', kraprefix: 'V' },
    waste_management: { name: 'Waste Management', swahiliName: 'Usimamizi Taka', kraprefix: 'S' },
    other: { name: 'Other', swahiliName: 'Nyingine', kraprefix: 'O' },
};
/**
 * Classify a business based on turnover and employees
 * @param annualTurnover - Annual turnover in KES
 * @param employeeCount - Number of employees
 * @returns MSME classification
 */
function classifyMSME(annualTurnover, employeeCount) {
    if (annualTurnover <= exports.KENYA_MSME_CLASSIFICATIONS.micro.maxAnnualTurnover ||
        employeeCount <= exports.KENYA_MSME_CLASSIFICATIONS.micro.maxEmployees) {
        return exports.KENYA_MSME_CLASSIFICATIONS.micro;
    }
    if (annualTurnover <= exports.KENYA_MSME_CLASSIFICATIONS.small.maxAnnualTurnover ||
        employeeCount <= exports.KENYA_MSME_CLASSIFICATIONS.small.maxEmployees) {
        return exports.KENYA_MSME_CLASSIFICATIONS.small;
    }
    if (annualTurnover <= exports.KENYA_MSME_CLASSIFICATIONS.medium.maxAnnualTurnover ||
        employeeCount <= exports.KENYA_MSME_CLASSIFICATIONS.medium.maxEmployees) {
        return exports.KENYA_MSME_CLASSIFICATIONS.medium;
    }
    return null; // Large enterprise
}
/**
 * Get business type information
 * @param type - The business type
 * @returns Business type information
 */
function getBusinessTypeInfo(type) {
    return exports.KENYAN_BUSINESS_TYPES[type];
}
/**
 * Get sector information
 * @param sector - The business sector
 * @returns Sector information
 */
function getSectorInfo(sector) {
    return exports.KENYAN_BUSINESS_SECTORS[sector];
}
/**
 * Check if a business requires VAT registration based on turnover
 * @param annualTurnover - Annual turnover in KES
 * @returns True if VAT registration is required
 */
function requiresBusinessVatRegistration(annualTurnover) {
    return annualTurnover >= 5000000; // KES 5 million threshold
}
/**
 * Generate KRA PIN format validation
 * @param pin - The PIN to validate
 * @returns True if valid KRA PIN format
 */
function isValidKraPin(pin) {
    // KRA PIN format: A001234567A (letter, 9 digits, letter)
    const kraPinPattern = /^[A-Z]\d{9}[A-Z]$/;
    return kraPinPattern.test(pin);
}
