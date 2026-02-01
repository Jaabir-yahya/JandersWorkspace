import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { TenantConfig, TenantTier, TenantCountry, FeatureFlag, IntegrationType } from './types/integration.types';
export declare class TenantConfigService {
    private readonly configService;
    private readonly prismaService;
    constructor(configService: ConfigService, prismaService: PrismaService);
    getTenantConfig(tenantId: string): Promise<TenantConfig>;
    private buildTenantConfig;
    private mapTierFromDatabase;
    private mapCountryFromDatabase;
    createTenantConfig(tenantId: string, tier?: TenantTier, country?: TenantCountry): Promise<TenantConfig>;
    updateTenantConfig(tenantId: string, updates: Partial<TenantConfig>): Promise<TenantConfig>;
    checkFeatureAccess(tenantId: string, feature: string): Promise<boolean>;
    requireFeatureAccess(tenantId: string, feature: string): Promise<void>;
    getFeatureFlag(name: string): Promise<FeatureFlag | null>;
    getFeatureFlags(): Promise<FeatureFlag[]>;
    private getDefaultFeatureFlags;
    getAvailableFeatures(tenantId: string): Promise<FeatureFlag[]>;
    getDefaultConfig(tenantId: string): TenantConfig;
    upgradeTier(tenantId: string, newTier: TenantTier): Promise<TenantConfig>;
    private isValidTierUpgrade;
    getTenantFeatures(tenantId: string): Promise<Record<string, boolean>>;
    isFeatureEnabled(tenantId: string, feature: string): Promise<boolean>;
    getIntegrationConfig(tenantId: string, integrationType: IntegrationType): Promise<any>;
    updateIntegrationConfig(tenantId: string, integrationType: IntegrationType, integrationConfig: any): Promise<void>;
}
