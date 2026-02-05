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

// Export types
export * from './types';

// Export integration services
export { MpesaService } from './mpesa';
export type { MpesaServiceConfig } from './mpesa';
export { WhatsAppService } from './whatsapp';
export type { WhatsAppServiceConfig } from './whatsapp';
export { QuickBooksService } from './quickbooks';
export type { QuickBooksServiceConfig } from './quickbooks';
export { XeroService } from './xero';
export type { XeroServiceConfig } from './xero';

// Export service factory for dynamic instantiation
import {
  IIntegrationService,
  ServiceConfig,
  IntegrationType,
} from './types';
import { MpesaService, MpesaServiceConfig } from './mpesa';
import { WhatsAppService, WhatsAppServiceConfig } from './whatsapp';
import { QuickBooksService, QuickBooksServiceConfig } from './quickbooks';
import { XeroService, XeroServiceConfig } from './xero';

/**
 * Factory function to create integration service instances
 * @param type - The type of integration to create
 * @param config - Configuration for the integration
 * @returns An instance of the requested integration service
 */
export function createIntegrationService(
  type: IntegrationType,
  config?: ServiceConfig,
): IIntegrationService {
  switch (type) {
    case IntegrationType.MPESA:
      return new MpesaService(config as MpesaServiceConfig);
    case IntegrationType.WHATSAPP:
      return new WhatsAppService(config as WhatsAppServiceConfig);
    case IntegrationType.QUICKBOOKS:
      return new QuickBooksService(config as QuickBooksServiceConfig);
    case IntegrationType.XERO:
      return new XeroService(config as XeroServiceConfig);
    default:
      throw new Error(`Unknown integration type: ${type}`);
  }
}

/**
 * Get all available integration types
 * @returns Array of available integration types
 */
export function getAvailableIntegrations(): IntegrationType[] {
  return [
    IntegrationType.MPESA,
    IntegrationType.WHATSAPP,
    IntegrationType.QUICKBOOKS,
    IntegrationType.XERO,
  ];
}

/**
 * Integration registry for managing multiple integrations
 */
export class IntegrationRegistry {
  private services: Map<IntegrationType, IIntegrationService> = new Map();

  /**
   * Register an integration service
   */
  register(type: IntegrationType, service: IIntegrationService): void {
    this.services.set(type, service);
  }

  /**
   * Get a registered integration service
   */
  get(type: IntegrationType): IIntegrationService | undefined {
    return this.services.get(type);
  }

  /**
   * Check if a service is registered
   */
  has(type: IntegrationType): boolean {
    return this.services.has(type);
  }

  /**
   * Unregister an integration service
   */
  unregister(type: IntegrationType): boolean {
    return this.services.delete(type);
  }

  /**
   * Get all registered services
   */
  getAll(): Map<IntegrationType, IIntegrationService> {
    return new Map(this.services);
  }

  /**
   * Clear all registered services
   */
  clear(): void {
    this.services.clear();
  }
}

// Export a default registry instance
export const integrationRegistry = new IntegrationRegistry();

// Default export
export default {
  MpesaService,
  WhatsAppService,
  QuickBooksService,
  XeroService,
  createIntegrationService,
  getAvailableIntegrations,
  IntegrationRegistry,
  integrationRegistry,
};
