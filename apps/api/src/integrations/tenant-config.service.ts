import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  TenantConfig,
  TenantTier,
  TenantCountry,
  FeatureFlag,
  IntegrationType,
  TenantTierError,
} from './types/integration.types';

@Injectable()
export class TenantConfigService {
  constructor(private readonly configService: ConfigService) {}

  async getTenantConfig(tenantId: string): Promise<TenantConfig> {
    // TODO: Implement database lookup
    // For now, return a default configuration
    return this.getDefaultConfig(tenantId);
  }

  async createTenantConfig(
    tenantId: string,
    tier: TenantTier = TenantTier.BASIC,
    country: TenantCountry = TenantCountry.KENYA,
  ): Promise<TenantConfig> {
    // TODO: Implement database creation
    const config = this.getDefaultConfig(tenantId);
    config.tier = tier;
    config.country = country;
    return config;
  }

  async updateTenantConfig(
    tenantId: string,
    updates: Partial<TenantConfig>,
  ): Promise<TenantConfig> {
    const existing = await this.getTenantConfig(tenantId);

    // TODO: Implement database update
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    return updated;
  }

  async checkFeatureAccess(
    tenantId: string,
    feature: string,
  ): Promise<boolean> {
    const config = await this.getTenantConfig(tenantId);
    const featureFlag = await this.getFeatureFlag(feature);

    if (!featureFlag || !featureFlag.isActive) {
      return false;
    }

    // Check if tenant tier has access
    if (!featureFlag.tiers.includes(config.tier)) {
      throw new TenantTierError(
        featureFlag.tiers[0], // First allowed tier
        config.tier,
        feature,
      );
    }

    // Check if feature is available in tenant's country
    if (!featureFlag.countries.includes(config.country)) {
      return false;
    }

    return true;
  }

  async requireFeatureAccess(tenantId: string, feature: string): Promise<void> {
    const hasAccess = await this.checkFeatureAccess(tenantId, feature);
    if (!hasAccess) {
      throw new ForbiddenException(
        `Feature '${feature}' is not available for this tenant`,
      );
    }
  }

  async getFeatureFlag(name: string): Promise<FeatureFlag | null> {
    // TODO: Implement database lookup
    const flags = await this.getFeatureFlags();
    return flags.find((flag: FeatureFlag) => flag.name === name) || null;
  }

  async getFeatureFlags(): Promise<FeatureFlag[]> {
    // Return hardcoded feature flags for now
    return [
      {
        id: '1',
        name: 'digital_notes',
        description: 'Digital note taking capabilities',
        tiers: [TenantTier.BASIC, TenantTier.ADVANCED],
        countries: [
          TenantCountry.KENYA,
          TenantCountry.TANZANIA,
          TenantCountry.UGANDA,
        ],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        name: 'mpesa_stk_push',
        description: 'M-Pesa STK Push payments',
        tiers: [TenantTier.ADVANCED],
        countries: [TenantCountry.KENYA],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '3',
        name: 'whatsapp_business',
        description: 'WhatsApp Business API integration',
        tiers: [TenantTier.ADVANCED],
        countries: [
          TenantCountry.KENYA,
          TenantCountry.TANZANIA,
          TenantCountry.UGANDA,
        ],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '4',
        name: 'quickbooks_sync',
        description: 'QuickBooks Online synchronization',
        tiers: [TenantTier.ADVANCED],
        countries: [TenantCountry.KENYA, TenantCountry.USA, TenantCountry.UK],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '5',
        name: 'advanced_analytics',
        description: 'Advanced analytics and reporting',
        tiers: [TenantTier.ADVANCED],
        countries: [
          TenantCountry.KENYA,
          TenantCountry.TANZANIA,
          TenantCountry.UGANDA,
        ],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  async getAvailableFeatures(tenantId: string): Promise<FeatureFlag[]> {
    const config = await this.getTenantConfig(tenantId);
    const allFlags = await this.getFeatureFlags();

    return allFlags.filter(
      (flag) =>
        flag.isActive &&
        flag.tiers.includes(config.tier) &&
        flag.countries.includes(config.country),
    );
  }

  getDefaultConfig(tenantId: string): TenantConfig {
    return {
      id: `config_${tenantId}`,
      tenantId,
      tier: TenantTier.BASIC,
      country: TenantCountry.KENYA,
      features: {},
      integrationSettings: {},
      commissionRates: {
        mpesa: 0.02,
        whatsapp: 0.01,
        quickbooks: 0.015,
        xero: 0.015,
        shopify: 0.01,
      },
      complianceData: {
        dataRetention: {
          years: 7,
          anonymization: true,
        },
        mpesaCompliance: {
          kycRequired: true,
          amlChecks: true,
          reportingThreshold: 1000000, // KES
        },
      },
      rateLimits: {
        daily: 1000,
        monthly: 30000,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async upgradeTier(
    tenantId: string,
    newTier: TenantTier,
  ): Promise<TenantConfig> {
    const config = await this.getTenantConfig(tenantId);

    if (config.tier === newTier) {
      return config;
    }

    // TODO: Implement tier upgrade logic (billing, notifications, etc.)
    console.log(
      `Upgrading tenant ${tenantId} from ${config.tier} to ${newTier}`,
    );

    return this.updateTenantConfig(tenantId, { tier: newTier });
  }

  async getIntegrationConfig(
    tenantId: string,
    integrationType: IntegrationType,
  ): Promise<any> {
    const config = await this.getTenantConfig(tenantId);

    // Check if tenant has access to this integration
    await this.requireFeatureAccess(
      tenantId,
      `${integrationType.toLowerCase()}_sync`,
    );

    return config.integrationSettings[integrationType] || null;
  }

  async updateIntegrationConfig(
    tenantId: string,
    integrationType: IntegrationType,
    integrationConfig: any,
  ): Promise<void> {
    const tenantConfig = await this.getTenantConfig(tenantId);

    // Check if tenant has access to this integration
    await this.requireFeatureAccess(
      tenantId,
      `${integrationType.toLowerCase()}_sync`,
    );

    // TODO: Implement secure storage of integration configs
    tenantConfig.integrationSettings[integrationType] = integrationConfig;

    console.log(`Updated ${integrationType} config for tenant ${tenantId}`);
  }
}
