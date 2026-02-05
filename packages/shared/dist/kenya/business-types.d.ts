/**
 * Kenyan Business Classifications
 * Types and classifications for Kenyan business entities
 */
/**
 * Kenyan business entity types
 */
export type KenyanBusinessType = 'sole_proprietorship' | 'partnership' | 'limited_company' | 'public_limited_company' | 'cooperative' | 'ngo' | 'trust' | 'sacco' | 'chama' | 'micro_enterprise' | 'small_enterprise' | 'medium_enterprise' | 'large_enterprise';
/**
 * Business type metadata
 */
export interface BusinessTypeInfo {
    type: KenyanBusinessType;
    name: string;
    swahiliName: string;
    description: string;
    registrationAuthority: string;
    taxObligations: TaxObligation[];
    annualTurnoverThreshold?: number;
    employeeThreshold?: number;
}
/**
 * Tax obligations for businesses
 */
export interface TaxObligation {
    taxType: string;
    description: string;
    frequency: 'monthly' | 'quarterly' | 'annually';
    mandatory: boolean;
    threshold?: number;
}
/**
 * Business sector classifications
 */
export type KenyanBusinessSector = 'agriculture' | 'manufacturing' | 'retail' | 'wholesale' | 'technology' | 'financial_services' | 'real_estate' | 'construction' | 'transportation' | 'hospitality' | 'healthcare' | 'education' | 'professional_services' | 'arts_entertainment' | 'mining' | 'energy' | 'water_supply' | 'waste_management' | 'other';
/**
 * MSME classification based on Kenyan standards
 * Source: MSME Authority of Kenya
 */
export interface MSMEClassification {
    category: 'micro' | 'small' | 'medium';
    maxEmployees: number;
    maxAnnualTurnover: number;
    maxAssets: number;
}
/**
 * Kenyan MSME classifications
 */
export declare const KENYA_MSME_CLASSIFICATIONS: Record<string, MSMEClassification>;
/**
 * Business type definitions
 */
export declare const KENYAN_BUSINESS_TYPES: Record<KenyanBusinessType, BusinessTypeInfo>;
/**
 * Business sector information
 */
export declare const KENYAN_BUSINESS_SECTORS: Record<KenyanBusinessSector, {
    name: string;
    swahiliName: string;
    kraprefix: string;
}>;
/**
 * Classify a business based on turnover and employees
 * @param annualTurnover - Annual turnover in KES
 * @param employeeCount - Number of employees
 * @returns MSME classification
 */
export declare function classifyMSME(annualTurnover: number, employeeCount: number): MSMEClassification | null;
/**
 * Get business type information
 * @param type - The business type
 * @returns Business type information
 */
export declare function getBusinessTypeInfo(type: KenyanBusinessType): BusinessTypeInfo;
/**
 * Get sector information
 * @param sector - The business sector
 * @returns Sector information
 */
export declare function getSectorInfo(sector: KenyanBusinessSector): {
    name: string;
    swahiliName: string;
    kraprefix: string;
};
/**
 * Check if a business requires VAT registration based on turnover
 * @param annualTurnover - Annual turnover in KES
 * @returns True if VAT registration is required
 */
export declare function requiresBusinessVatRegistration(annualTurnover: number): boolean;
/**
 * Generate KRA PIN format validation
 * @param pin - The PIN to validate
 * @returns True if valid KRA PIN format
 */
export declare function isValidKraPin(pin: string): boolean;
//# sourceMappingURL=business-types.d.ts.map