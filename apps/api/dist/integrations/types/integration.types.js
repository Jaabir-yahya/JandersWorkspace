"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceError = exports.TenantTierError = exports.IntegrationError = exports.EventSource = exports.EventType = exports.IntegrationStatus = exports.WebhookStatus = exports.TenantCountry = exports.TenantTier = exports.IntegrationType = void 0;
var IntegrationType;
(function (IntegrationType) {
    IntegrationType["MPESA"] = "MPESA";
    IntegrationType["WHATSAPP"] = "WHATSAPP";
    IntegrationType["QUICKBOOKS"] = "QUICKBOOKS";
    IntegrationType["XERO"] = "XERO";
    IntegrationType["SHOPIFY"] = "SHOPIFY";
})(IntegrationType || (exports.IntegrationType = IntegrationType = {}));
var TenantTier;
(function (TenantTier) {
    TenantTier["BASIC"] = "BASIC";
    TenantTier["ADVANCED"] = "ADVANCED";
    TenantTier["PREMIUM"] = "PREMIUM";
    TenantTier["ENTERPRISE"] = "ENTERPRISE";
})(TenantTier || (exports.TenantTier = TenantTier = {}));
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
var WebhookStatus;
(function (WebhookStatus) {
    WebhookStatus["PENDING"] = "PENDING";
    WebhookStatus["DELIVERED"] = "DELIVERED";
    WebhookStatus["FAILED"] = "FAILED";
    WebhookStatus["RETRYING"] = "RETRYING";
})(WebhookStatus || (exports.WebhookStatus = WebhookStatus = {}));
var IntegrationStatus;
(function (IntegrationStatus) {
    IntegrationStatus["ACTIVE"] = "ACTIVE";
    IntegrationStatus["INACTIVE"] = "INACTIVE";
    IntegrationStatus["ERROR"] = "ERROR";
    IntegrationStatus["SYNCING"] = "SYNCING";
})(IntegrationStatus || (exports.IntegrationStatus = IntegrationStatus = {}));
var EventType;
(function (EventType) {
    EventType["TRANSACTION_CREATED"] = "transaction.created";
    EventType["TRANSACTION_UPDATED"] = "transaction.updated";
    EventType["TRANSACTION_POSTED"] = "transaction.posted";
    EventType["TRANSACTION_REVERSED"] = "transaction.reversed";
    EventType["PAYMENT_RECEIVED"] = "payment.received";
    EventType["PAYMENT_FAILED"] = "payment.failed";
    EventType["ENTITY_CREATED"] = "entity.created";
    EventType["ENTITY_UPDATED"] = "entity.updated";
    EventType["INVOICE_GENERATED"] = "invoice.generated";
    EventType["SYNC_COMPLETED"] = "sync.completed";
    EventType["SYNC_FAILED"] = "sync.failed";
    EventType["WEBHOOK_DELIVERED"] = "webhook.delivered";
    EventType["WEBHOOK_FAILED"] = "webhook.failed";
})(EventType || (exports.EventType = EventType = {}));
var EventSource;
(function (EventSource) {
    EventSource["LEDGER"] = "LEDGER";
    EventSource["MPESA"] = "MPESA";
    EventSource["WHATSAPP"] = "WHATSAPP";
    EventSource["QUICKBOOKS"] = "QUICKBOOKS";
    EventSource["XERO"] = "XERO";
    EventSource["SHOPIFY"] = "SHOPIFY";
    EventSource["WEBHOOK"] = "WEBHOOK";
})(EventSource || (exports.EventSource = EventSource = {}));
class IntegrationError extends Error {
    integrationType;
    code;
    details;
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
    requiredTier;
    currentTier;
    constructor(requiredTier, currentTier, feature) {
        super(`${feature} requires ${requiredTier} tier, current tier is ${currentTier}`);
        this.requiredTier = requiredTier;
        this.currentTier = currentTier;
        this.name = 'TenantTierError';
    }
}
exports.TenantTierError = TenantTierError;
class ComplianceError extends Error {
    country;
    regulation;
    constructor(country, regulation, message) {
        super(`Compliance violation in ${country}: ${message}`);
        this.country = country;
        this.regulation = regulation;
        this.name = 'ComplianceError';
    }
}
exports.ComplianceError = ComplianceError;
//# sourceMappingURL=integration.types.js.map