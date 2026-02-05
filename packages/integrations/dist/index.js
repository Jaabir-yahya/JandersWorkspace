"use strict";
/**
 * Project Bridge Integrations Package
 *
 * This package provides modular integrations with third-party services:
 * - M-Pesa: Mobile money payments (Kenya)
 * - WhatsApp: Business messaging
 * - QuickBooks: Accounting (USA)
 * - Xero: Accounting (UK/EU)
 *
 * Each integration follows a consistent interface pattern and can be
 * extracted to its own microservice in the future.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.integrationRegistry = exports.IntegrationRegistry = exports.XeroService = exports.QuickBooksService = exports.WhatsAppService = exports.MpesaService = void 0;
exports.createIntegrationService = createIntegrationService;
exports.getAvailableIntegrations = getAvailableIntegrations;
// Export types
__exportStar(require("./types"), exports);
// Export integration services
var mpesa_1 = require("./mpesa");
Object.defineProperty(exports, "MpesaService", { enumerable: true, get: function () { return mpesa_1.MpesaService; } });
var whatsapp_1 = require("./whatsapp");
Object.defineProperty(exports, "WhatsAppService", { enumerable: true, get: function () { return whatsapp_1.WhatsAppService; } });
var quickbooks_1 = require("./quickbooks");
Object.defineProperty(exports, "QuickBooksService", { enumerable: true, get: function () { return quickbooks_1.QuickBooksService; } });
var xero_1 = require("./xero");
Object.defineProperty(exports, "XeroService", { enumerable: true, get: function () { return xero_1.XeroService; } });
// Export service factory for dynamic instantiation
const types_1 = require("./types");
const mpesa_2 = require("./mpesa");
const whatsapp_2 = require("./whatsapp");
const quickbooks_2 = require("./quickbooks");
const xero_2 = require("./xero");
/**
 * Factory function to create integration service instances
 * @param type - The type of integration to create
 * @param config - Configuration for the integration
 * @returns An instance of the requested integration service
 */
function createIntegrationService(type, config) {
    switch (type) {
        case types_1.IntegrationType.MPESA:
            return new mpesa_2.MpesaService(config);
        case types_1.IntegrationType.WHATSAPP:
            return new whatsapp_2.WhatsAppService(config);
        case types_1.IntegrationType.QUICKBOOKS:
            return new quickbooks_2.QuickBooksService(config);
        case types_1.IntegrationType.XERO:
            return new xero_2.XeroService(config);
        default:
            throw new Error(`Unknown integration type: ${type}`);
    }
}
/**
 * Get all available integration types
 * @returns Array of available integration types
 */
function getAvailableIntegrations() {
    return [
        types_1.IntegrationType.MPESA,
        types_1.IntegrationType.WHATSAPP,
        types_1.IntegrationType.QUICKBOOKS,
        types_1.IntegrationType.XERO,
    ];
}
/**
 * Integration registry for managing multiple integrations
 */
class IntegrationRegistry {
    constructor() {
        this.services = new Map();
    }
    /**
     * Register an integration service
     */
    register(type, service) {
        this.services.set(type, service);
    }
    /**
     * Get a registered integration service
     */
    get(type) {
        return this.services.get(type);
    }
    /**
     * Check if a service is registered
     */
    has(type) {
        return this.services.has(type);
    }
    /**
     * Unregister an integration service
     */
    unregister(type) {
        return this.services.delete(type);
    }
    /**
     * Get all registered services
     */
    getAll() {
        return new Map(this.services);
    }
    /**
     * Clear all registered services
     */
    clear() {
        this.services.clear();
    }
}
exports.IntegrationRegistry = IntegrationRegistry;
// Export a default registry instance
exports.integrationRegistry = new IntegrationRegistry();
// Default export
exports.default = {
    MpesaService: mpesa_2.MpesaService,
    WhatsAppService: whatsapp_2.WhatsAppService,
    QuickBooksService: quickbooks_2.QuickBooksService,
    XeroService: xero_2.XeroService,
    createIntegrationService,
    getAvailableIntegrations,
    IntegrationRegistry,
    integrationRegistry: exports.integrationRegistry,
};
