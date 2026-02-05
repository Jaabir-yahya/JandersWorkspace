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
export * from './types';
export { MpesaService } from './mpesa';
export type { MpesaServiceConfig } from './mpesa';
export { WhatsAppService } from './whatsapp';
export type { WhatsAppServiceConfig } from './whatsapp';
export { QuickBooksService } from './quickbooks';
export type { QuickBooksServiceConfig } from './quickbooks';
export { XeroService } from './xero';
export type { XeroServiceConfig } from './xero';
import { IIntegrationService, ServiceConfig, IntegrationType } from './types';
import { MpesaService } from './mpesa';
import { WhatsAppService } from './whatsapp';
import { QuickBooksService } from './quickbooks';
import { XeroService } from './xero';
/**
 * Factory function to create integration service instances
 * @param type - The type of integration to create
 * @param config - Configuration for the integration
 * @returns An instance of the requested integration service
 */
export declare function createIntegrationService(type: IntegrationType, config?: ServiceConfig): IIntegrationService;
/**
 * Get all available integration types
 * @returns Array of available integration types
 */
export declare function getAvailableIntegrations(): IntegrationType[];
/**
 * Integration registry for managing multiple integrations
 */
export declare class IntegrationRegistry {
    private services;
    /**
     * Register an integration service
     */
    register(type: IntegrationType, service: IIntegrationService): void;
    /**
     * Get a registered integration service
     */
    get(type: IntegrationType): IIntegrationService | undefined;
    /**
     * Check if a service is registered
     */
    has(type: IntegrationType): boolean;
    /**
     * Unregister an integration service
     */
    unregister(type: IntegrationType): boolean;
    /**
     * Get all registered services
     */
    getAll(): Map<IntegrationType, IIntegrationService>;
    /**
     * Clear all registered services
     */
    clear(): void;
}
export declare const integrationRegistry: IntegrationRegistry;
declare const _default: {
    MpesaService: typeof MpesaService;
    WhatsAppService: typeof WhatsAppService;
    QuickBooksService: typeof QuickBooksService;
    XeroService: typeof XeroService;
    createIntegrationService: typeof createIntegrationService;
    getAvailableIntegrations: typeof getAvailableIntegrations;
    IntegrationRegistry: typeof IntegrationRegistry;
    integrationRegistry: IntegrationRegistry;
};
export default _default;
//# sourceMappingURL=index.d.ts.map