import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
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
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {}

  async getTenantConfig(tenantId: string): Promise<TenantConfig> {
    try {
      // Look up tenant in database
      const tenant = await this.prismaService.tenant.findUnique({
        where: { id: tenantId, isActive: true },
      });

      if (!tenant) {
        throw new NotFoundException(`Tenant ${tenantId} not found`);
      }

      // Get tenant's integrations
      const integrations = await this.prismaService.tenantIntegration.findMany({
        where: { tenantId, isActive: true },
      });

      // Build tenant config from database
      return this.buildTenantConfig(tenant, integrations);
    } catch (error) {
      // Fallback to default config for development
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          `Database lookup failed for tenant ${tenantId}, using default config:`,
          error.message,
        );
        return this.getDefaultConfig(tenantId);
      }
      throw error;
    }
  }

  private buildTenantConfig(tenant: any, integrations: any[]): TenantConfig {
    const integrationSettings: Record<string, any> = {};

    // Parse integration settings from encrypted configs
    for (const integration of integrations) {
      try {
        // Note: In production, decrypt integration.encryptedConfig
        // For now, use empty object as placeholder
        integrationSettings[integration.integrationType] = {};
      } catch (error) {
        console.warn(
          `Failed to parse integration config for ${integration.integrationType}:`,
          error.message,
        );
      }
    }

    return {
      id: `config_${tenant.id}`,
      tenantId: tenant.id,
      tier: this.mapTierFromDatabase(tenant.tier),
      country: this.mapCountryFromDatabase(tenant.country),
      features: {}, // Will be populated by feature flag checks
      integrationSettings,
      commissionRates: tenant.settings?.commissionRates || {
        mpesa: 0.02,
        whatsapp: 0.01,
        quickbooks: 0.015,
        xero: 0.015,
        shopify: 0.01,
      },
      complianceData: tenant.settings?.complianceData || {
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
      rateLimits: tenant.settings?.rateLimits || {
        daily: 1000,
        monthly: 30000,
      },
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
    };
  }

  private mapTierFromDatabase(tier: string): TenantTier {
    const tierMap = {
      BASIC: TenantTier.BASIC,
      ADVANCED: TenantTier.ADVANCED,
      PREMIUM: TenantTier.PREMIUM,
      ENTERPRISE: TenantTier.ENTERPRISE,
    };
    return tierMap[tier] || TenantTier.BASIC;
  }

  private mapCountryFromDatabase(country: string): TenantCountry {
    const countryMap = {
      KE: TenantCountry.KENYA,
      TZ: TenantCountry.TANZANIA,
      UG: TenantCountry.UGANDA,
      US: TenantCountry.USA,
      UK: TenantCountry.UK,
    };
    return countryMap[country] || TenantCountry.KENYA;
  }

  async createTenantConfig(
    tenantId: string,
    tier: TenantTier = TenantTier.BASIC,
    country: TenantCountry = TenantCountry.KENYA,
  ): Promise<TenantConfig> {
    try {
      // Check if tenant already exists
      const existingTenant = await this.prismaService.tenant.findUnique({
        where: { id: tenantId },
      });

      if (existingTenant) {
        throw new ForbiddenException(`Tenant ${tenantId} already exists`);
      }

      // Create new tenant with default settings
      const defaultSettings = {
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
            reportingThreshold: 1000000,
          },
        },
        rateLimits: {
          daily: 1000,
          monthly: 30000,
        },
      };

      const tenant = await this.prismaService.tenant.create({
        data: {
          id: tenantId,
          name: `Tenant ${tenantId}`,
          slug: `tenant-${tenantId.toLowerCase()}`,
          tier: tier,
          country,
          isActive: true,
          settings: defaultSettings,
        },
      });

      // No integrations initially
      const integrations: any[] = [];

      return this.buildTenantConfig(tenant, integrations);
    } catch (error) {
      throw new Error(
        `Failed to create tenant configuration: ${error.message}`,
      );
    }
  }

  async updateTenantConfig(
    tenantId: string,
    updates: Partial<TenantConfig>,
  ): Promise<TenantConfig> {
    try {
      // Get existing tenant from database
      const existingTenant = await this.prismaService.tenant.findUnique({
        where: { id: tenantId, isActive: true },
      });

      if (!existingTenant) {
        throw new NotFoundException(`Tenant ${tenantId} not found`);
      }

      // Merge settings
      const currentSettings = (existingTenant.settings as any) || {};
      const mergedSettings = { ...currentSettings };

      // Handle specific updates
      if (updates.commissionRates) {
        mergedSettings.commissionRates = {
          ...currentSettings.commissionRates,
          ...updates.commissionRates,
        };
      }
      if (updates.complianceData) {
        mergedSettings.complianceData = {
          ...currentSettings.complianceData,
          ...updates.complianceData,
        };
      }
      if (updates.rateLimits) {
        mergedSettings.rateLimits = {
          ...currentSettings.rateLimits,
          ...updates.rateLimits,
        };
      }

      // Update tenant in database
      const updatedTenant = await this.prismaService.tenant.update({
        where: { id: tenantId },
        data: {
          ...updates,
          settings: mergedSettings,
          updatedAt: new Date(),
        },
      });

      // Get updated integrations
      const integrations = await this.prismaService.tenantIntegration.findMany({
        where: { tenantId, isActive: true },
      });

      return this.buildTenantConfig(updatedTenant, integrations);
    } catch (error) {
      throw new Error(
        `Failed to update tenant configuration: ${error.message}`,
      );
    }
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
    try {
      const flag = await this.prismaService.featureFlag.findUnique({
        where: { name, isActive: true },
      });

      if (!flag) {
        return null;
      }

      return {
        id: flag.id,
        name: flag.name,
        description: flag.description || undefined,
        tiers: flag.tiers as TenantTier[],
        countries: flag.countries as TenantCountry[],
        isActive: flag.isActive,
        createdAt: flag.createdAt,
        updatedAt: flag.updatedAt,
      };
    } catch (error) {
      console.warn(`Failed to fetch feature flag ${name}:`, error.message);
      // Fallback to hardcoded flags for development
      const flags = await this.getFeatureFlags();
      return flags.find((flag: FeatureFlag) => flag.name === name) || null;
    }
  }

  async getFeatureFlags(): Promise<FeatureFlag[]> {
    try {
      const flags = await this.prismaService.featureFlag.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
      });

      return flags.map((flag) => ({
        id: flag.id,
        name: flag.name,
        description: flag.description || undefined,
        tiers: flag.tiers as TenantTier[],
        countries: flag.countries as TenantCountry[],
        isActive: flag.isActive,
        createdAt: flag.createdAt,
        updatedAt: flag.updatedAt,
      }));
    } catch (error) {
      console.warn(
        'Failed to fetch feature flags from database, using defaults:',
        error.message,
      );
      // Fallback to hardcoded flags for development
      return await this.getDefaultFeatureFlags();
    }
  }

  private async getDefaultFeatureFlags(): Promise<FeatureFlag[]> {
    // Default feature flags for development/fallback
    return [
      {
        id: 'default-1',
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
        id: 'default-2',
        name: 'mpesa_stk_push',
        description: 'M-Pesa STK Push payments',
        tiers: [TenantTier.ADVANCED],
        countries: [TenantCountry.KENYA],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'default-3',
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
        id: 'default-4',
        name: 'quickbooks_sync',
        description: 'QuickBooks Online synchronization',
        tiers: [TenantTier.ADVANCED],
        countries: [TenantCountry.KENYA, TenantCountry.USA, TenantCountry.UK],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'default-5',
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
    try {
      const config = await this.getTenantConfig(tenantId);

      if (config.tier === newTier) {
        return config;
      }

      // Check if upgrade is allowed (basic validation)
      if (!this.isValidTierUpgrade(config.tier, newTier)) {
        throw new ForbiddenException(
          `Invalid tier upgrade from ${config.tier} to ${newTier}`,
        );
      }

      // TODO: Implement billing logic, notifications, etc.
      console.log(
        `Upgrading tenant ${tenantId} from ${config.tier} to ${newTier}`,
      );

      return this.updateTenantConfig(tenantId, { tier: newTier });
    } catch (error) {
      throw new Error(`Failed to upgrade tenant tier: ${error.message}`);
    }
  }

  private isValidTierUpgrade(
    currentTier: TenantTier,
    newTier: TenantTier,
  ): boolean {
    const tierHierarchy = {
      [TenantTier.BASIC]: 1,
      [TenantTier.ADVANCED]: 2,
      [TenantTier.PREMIUM]: 3,
      [TenantTier.ENTERPRISE]: 4,
    };

    return tierHierarchy[newTier] > tierHierarchy[currentTier];
  }

  async getTenantFeatures(tenantId: string): Promise<Record<string, boolean>> {
    const config = await this.getTenantConfig(tenantId);
    const availableFeatures = await this.getAvailableFeatures(tenantId);
    const tenantSettings = (config as any).settings?.features || {};

    // Build feature map from available features and tenant settings
    const features: Record<string, boolean> = {};

    for (const flag of availableFeatures) {
      // Feature is enabled if tenant settings explicitly enable it
      // or if it's a basic feature available to all
      const isBasicFeature = ['manual_transactions', 'entity_management', 'payment_records', 'dashboard'].includes(flag.name);
      features[flag.name] = tenantSettings[flag.name] ?? isBasicFeature;
    }

    return features;
  }

  async isFeatureEnabled(tenantId: string, feature: string): Promise<boolean> {
    const features = await this.getTenantFeatures(tenantId);
    return features[feature] === true;
  }

  async getIntegrationConfig(
    tenantId: string,
    integrationType: IntegrationType,
  ): Promise<any> {
    const config = await this.getTenantConfig(tenantId);

    // Check if tenant has access to this integration
    const featureName = integrationType.toLowerCase() === 'mpesa'
      ? 'mpesa_integration'
      : integrationType.toLowerCase() === 'whatsapp'
      ? 'whatsapp_integration'
      : `${integrationType.toLowerCase()}_sync`;

    await this.requireFeatureAccess(tenantId, featureName);

    return config.integrationSettings[integrationType] || null;
  }

  async updateIntegrationConfig(
    tenantId: string,
    integrationType: IntegrationType,
    integrationConfig: any,
  ): Promise<void> {
    try {
      const tenantConfig = await this.getTenantConfig(tenantId);

      // Check if tenant has access to this integration
      const featureName = integrationType.toLowerCase() === 'mpesa'
        ? 'mpesa_integration'
        : integrationType.toLowerCase() === 'whatsapp'
        ? 'whatsapp_integration'
        : `${integrationType.toLowerCase()}_sync`;

      await this.requireFeatureAccess(tenantId, featureName);

      // Note: In production, encrypt integrationConfig before storing
      // For now, store as-is (placeholder for implementation)
      await this.prismaService.tenantIntegration.upsert({
        where: {
          tenantId_integrationType: {
            tenantId,
            integrationType,
          },
        },
        update: {
          encryptedConfig: integrationConfig, // TODO: Implement encryption
          isActive: true,
          lastSyncAt: new Date(),
          syncStatus: 'ACTIVE',
          updatedAt: new Date(),
        },
        create: {
          tenantId,
          integrationType,
          encryptedConfig: integrationConfig, // TODO: Implement encryption
          isActive: true,
          syncStatus: 'ACTIVE',
        },
      });

      console.log(`Updated ${integrationType} config for tenant ${tenantId}`);
    } catch (error) {
      throw new Error(`Failed to update integration config: ${error.message}`);
    }
  }
}
