"use strict";
/**
 * Shared integration types for Project Bridge
 * These types define the common interface for all third-party integrations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceError = exports.TenantTierError = exports.IntegrationError = exports.TenantTier = exports.TenantCountry = exports.IntegrationStatus = exports.IntegrationType = void 0;
var IntegrationType;
(function (IntegrationType) {
    IntegrationType["MPESA"] = "MPESA";
    IntegrationType["WHATSAPP"] = "WHATSAPP";
    IntegrationType["QUICKBOOKS"] = "QUICKBOOKS";
    IntegrationType["XERO"] = "XERO";
})(IntegrationType || (exports.IntegrationType = IntegrationType = {}));
var IntegrationStatus;
(function (IntegrationStatus) {
    IntegrationStatus["ACTIVE"] = "ACTIVE";
    IntegrationStatus["INACTIVE"] = "INACTIVE";
    IntegrationStatus["ERROR"] = "ERROR";
    IntegrationStatus["CONNECTING"] = "CONNECTING";
})(IntegrationStatus || (exports.IntegrationStatus = IntegrationStatus = {}));
var TenantCountry;
(function (TenantCountry) {
    TenantCountry["KENYA"] = "KE";
    TenantCountry["TANZANIA"] = "TZ";
    TenantCountry["UGANDA"] = "UG";
    TenantCountry["RWANDA"] = "RW";
    TenantCountry["NIGERIA"] = "NG";
    TenantCountry["USA"] = "US";
    TenantCountry["UK"] = "UK";
    TenantCountry["EU"] = "EU";
})(TenantCountry || (exports.TenantCountry = TenantCountry = {}));
var TenantTier;
(function (TenantTier) {
    TenantTier["BASIC"] = "BASIC";
    TenantTier["ADVANCED"] = "ADVANCED";
    TenantTier["PREMIUM"] = "PREMIUM";
    TenantTier["ENTERPRISE"] = "ENTERPRISE";
})(TenantTier || (exports.TenantTier = TenantTier = {}));
// ==================== Error Types ====================
class IntegrationError extends Error {
    constructor(integrationType, code, message, details) {
        super(message);
        this.integrationType = integrationType;
        this.code = code;
        this.details = details;
        this.name = 'IntegrationError';
    }
}
exports.IntegrationError = IntegrationError;
class TenantTierError extends Error {
    constructor(requiredTier, currentTier, feature) {
        super(`${feature} requires ${requiredTier} tier, current tier is ${currentTier}`);
        this.requiredTier = requiredTier;
        this.currentTier = currentTier;
        this.name = 'TenantTierError';
    }
}
exports.TenantTierError = TenantTierError;
class ComplianceError extends Error {
    constructor(country, regulation, message) {
        super(`Compliance violation in ${country}: ${message}`);
        this.country = country;
        this.regulation = regulation;
        this.name = 'ComplianceError';
    }
}
exports.ComplianceError = ComplianceError;
