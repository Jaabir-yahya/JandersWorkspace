"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantConfigService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const integration_types_1 = require("./types/integration.types");
let TenantConfigService = class TenantConfigService {
    configService;
    prismaService;
    constructor(configService, prismaService) {
        this.configService = configService;
        this.prismaService = prismaService;
    }
    async getTenantConfig(tenantId) {
        try {
            const tenant = await this.prismaService.tenant.findUnique({
                where: { id: tenantId, isActive: true },
            });
            if (!tenant) {
                throw new common_1.NotFoundException(`Tenant ${tenantId} not found`);
            }
            const integrations = await this.prismaService.tenantIntegration.findMany({
                where: { tenantId, isActive: true },
            });
            return this.buildTenantConfig(tenant, integrations);
        }
        catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.warn(`Database lookup failed for tenant ${tenantId}, using default config:`, error.message);
                return this.getDefaultConfig(tenantId);
            }
            throw error;
        }
    }
    buildTenantConfig(tenant, integrations) {
        const integrationSettings = {};
        for (const integration of integrations) {
            try {
                integrationSettings[integration.integrationType] = {};
            }
            catch (error) {
                console.warn(`Failed to parse integration config for ${integration.integrationType}:`, error.message);
            }
        }
        return {
            id: `config_${tenant.id}`,
            tenantId: tenant.id,
            tier: this.mapTierFromDatabase(tenant.tier),
            country: this.mapCountryFromDatabase(tenant.country),
            features: {},
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
                    reportingThreshold: 1000000,
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
    mapTierFromDatabase(tier) {
        const tierMap = {
            BASIC: integration_types_1.TenantTier.BASIC,
            ADVANCED: integration_types_1.TenantTier.ADVANCED,
            PREMIUM: integration_types_1.TenantTier.PREMIUM,
            ENTERPRISE: integration_types_1.TenantTier.ENTERPRISE,
        };
        return tierMap[tier] || integration_types_1.TenantTier.BASIC;
    }
    mapCountryFromDatabase(country) {
        const countryMap = {
            KE: integration_types_1.TenantCountry.KENYA,
            TZ: integration_types_1.TenantCountry.TANZANIA,
            UG: integration_types_1.TenantCountry.UGANDA,
            US: integration_types_1.TenantCountry.USA,
            UK: integration_types_1.TenantCountry.UK,
        };
        return countryMap[country] || integration_types_1.TenantCountry.KENYA;
    }
    async createTenantConfig(tenantId, tier = integration_types_1.TenantTier.BASIC, country = integration_types_1.TenantCountry.KENYA) {
        try {
            const existingTenant = await this.prismaService.tenant.findUnique({
                where: { id: tenantId },
            });
            if (existingTenant) {
                throw new common_1.ForbiddenException(`Tenant ${tenantId} already exists`);
            }
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
            const integrations = [];
            return this.buildTenantConfig(tenant, integrations);
        }
        catch (error) {
            throw new Error(`Failed to create tenant configuration: ${error.message}`);
        }
    }
    async updateTenantConfig(tenantId, updates) {
        try {
            const existingTenant = await this.prismaService.tenant.findUnique({
                where: { id: tenantId, isActive: true },
            });
            if (!existingTenant) {
                throw new common_1.NotFoundException(`Tenant ${tenantId} not found`);
            }
            const currentSettings = existingTenant.settings || {};
            const mergedSettings = { ...currentSettings };
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
            const updatedTenant = await this.prismaService.tenant.update({
                where: { id: tenantId },
                data: {
                    ...updates,
                    settings: mergedSettings,
                    updatedAt: new Date(),
                },
            });
            const integrations = await this.prismaService.tenantIntegration.findMany({
                where: { tenantId, isActive: true },
            });
            return this.buildTenantConfig(updatedTenant, integrations);
        }
        catch (error) {
            throw new Error(`Failed to update tenant configuration: ${error.message}`);
        }
    }
    async checkFeatureAccess(tenantId, feature) {
        const config = await this.getTenantConfig(tenantId);
        const featureFlag = await this.getFeatureFlag(feature);
        if (!featureFlag || !featureFlag.isActive) {
            return false;
        }
        if (!featureFlag.tiers.includes(config.tier)) {
            throw new integration_types_1.TenantTierError(featureFlag.tiers[0], config.tier, feature);
        }
        if (!featureFlag.countries.includes(config.country)) {
            return false;
        }
        return true;
    }
    async requireFeatureAccess(tenantId, feature) {
        const hasAccess = await this.checkFeatureAccess(tenantId, feature);
        if (!hasAccess) {
            throw new common_1.ForbiddenException(`Feature '${feature}' is not available for this tenant`);
        }
    }
    async getFeatureFlag(name) {
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
                tiers: flag.tiers,
                countries: flag.countries,
                isActive: flag.isActive,
                createdAt: flag.createdAt,
                updatedAt: flag.updatedAt,
            };
        }
        catch (error) {
            console.warn(`Failed to fetch feature flag ${name}:`, error.message);
            const flags = await this.getFeatureFlags();
            return flags.find((flag) => flag.name === name) || null;
        }
    }
    async getFeatureFlags() {
        try {
            const flags = await this.prismaService.featureFlag.findMany({
                where: { isActive: true },
                orderBy: { name: 'asc' },
            });
            return flags.map((flag) => ({
                id: flag.id,
                name: flag.name,
                description: flag.description || undefined,
                tiers: flag.tiers,
                countries: flag.countries,
                isActive: flag.isActive,
                createdAt: flag.createdAt,
                updatedAt: flag.updatedAt,
            }));
        }
        catch (error) {
            console.warn('Failed to fetch feature flags from database, using defaults:', error.message);
            return await this.getDefaultFeatureFlags();
        }
    }
    async getDefaultFeatureFlags() {
        return [
            {
                id: 'default-1',
                name: 'digital_notes',
                description: 'Digital note taking capabilities',
                tiers: [integration_types_1.TenantTier.BASIC, integration_types_1.TenantTier.ADVANCED],
                countries: [
                    integration_types_1.TenantCountry.KENYA,
                    integration_types_1.TenantCountry.TANZANIA,
                    integration_types_1.TenantCountry.UGANDA,
                ],
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 'default-2',
                name: 'mpesa_stk_push',
                description: 'M-Pesa STK Push payments',
                tiers: [integration_types_1.TenantTier.ADVANCED],
                countries: [integration_types_1.TenantCountry.KENYA],
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 'default-3',
                name: 'whatsapp_business',
                description: 'WhatsApp Business API integration',
                tiers: [integration_types_1.TenantTier.ADVANCED],
                countries: [
                    integration_types_1.TenantCountry.KENYA,
                    integration_types_1.TenantCountry.TANZANIA,
                    integration_types_1.TenantCountry.UGANDA,
                ],
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 'default-4',
                name: 'quickbooks_sync',
                description: 'QuickBooks Online synchronization',
                tiers: [integration_types_1.TenantTier.ADVANCED],
                countries: [integration_types_1.TenantCountry.KENYA, integration_types_1.TenantCountry.USA, integration_types_1.TenantCountry.UK],
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 'default-5',
                name: 'advanced_analytics',
                description: 'Advanced analytics and reporting',
                tiers: [integration_types_1.TenantTier.ADVANCED],
                countries: [
                    integration_types_1.TenantCountry.KENYA,
                    integration_types_1.TenantCountry.TANZANIA,
                    integration_types_1.TenantCountry.UGANDA,
                ],
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ];
    }
    async getAvailableFeatures(tenantId) {
        const config = await this.getTenantConfig(tenantId);
        const allFlags = await this.getFeatureFlags();
        return allFlags.filter((flag) => flag.isActive &&
            flag.tiers.includes(config.tier) &&
            flag.countries.includes(config.country));
    }
    getDefaultConfig(tenantId) {
        return {
            id: `config_${tenantId}`,
            tenantId,
            tier: integration_types_1.TenantTier.BASIC,
            country: integration_types_1.TenantCountry.KENYA,
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
                    reportingThreshold: 1000000,
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
    async upgradeTier(tenantId, newTier) {
        try {
            const config = await this.getTenantConfig(tenantId);
            if (config.tier === newTier) {
                return config;
            }
            if (!this.isValidTierUpgrade(config.tier, newTier)) {
                throw new common_1.ForbiddenException(`Invalid tier upgrade from ${config.tier} to ${newTier}`);
            }
            console.log(`Upgrading tenant ${tenantId} from ${config.tier} to ${newTier}`);
            return this.updateTenantConfig(tenantId, { tier: newTier });
        }
        catch (error) {
            throw new Error(`Failed to upgrade tenant tier: ${error.message}`);
        }
    }
    isValidTierUpgrade(currentTier, newTier) {
        const tierHierarchy = {
            [integration_types_1.TenantTier.BASIC]: 1,
            [integration_types_1.TenantTier.ADVANCED]: 2,
            [integration_types_1.TenantTier.PREMIUM]: 3,
            [integration_types_1.TenantTier.ENTERPRISE]: 4,
        };
        return tierHierarchy[newTier] > tierHierarchy[currentTier];
    }
    async getTenantFeatures(tenantId) {
        const config = await this.getTenantConfig(tenantId);
        const availableFeatures = await this.getAvailableFeatures(tenantId);
        const tenantSettings = config.settings?.features || {};
        const features = {};
        for (const flag of availableFeatures) {
            const isBasicFeature = [
                'manual_transactions',
                'entity_management',
                'payment_records',
                'dashboard',
            ].includes(flag.name);
            features[flag.name] = tenantSettings[flag.name] ?? isBasicFeature;
        }
        return features;
    }
    async isFeatureEnabled(tenantId, feature) {
        const features = await this.getTenantFeatures(tenantId);
        return features[feature] === true;
    }
    async getIntegrationConfig(tenantId, integrationType) {
        const config = await this.getTenantConfig(tenantId);
        const featureName = integrationType.toLowerCase() === 'mpesa'
            ? 'mpesa_integration'
            : integrationType.toLowerCase() === 'whatsapp'
                ? 'whatsapp_integration'
                : `${integrationType.toLowerCase()}_sync`;
        await this.requireFeatureAccess(tenantId, featureName);
        return config.integrationSettings[integrationType] || null;
    }
    async updateIntegrationConfig(tenantId, integrationType, integrationConfig) {
        try {
            const tenantConfig = await this.getTenantConfig(tenantId);
            const featureName = integrationType.toLowerCase() === 'mpesa'
                ? 'mpesa_integration'
                : integrationType.toLowerCase() === 'whatsapp'
                    ? 'whatsapp_integration'
                    : `${integrationType.toLowerCase()}_sync`;
            await this.requireFeatureAccess(tenantId, featureName);
            await this.prismaService.tenantIntegration.upsert({
                where: {
                    tenantId_integrationType: {
                        tenantId,
                        integrationType,
                    },
                },
                update: {
                    encryptedConfig: integrationConfig,
                    isActive: true,
                    updatedAt: new Date(),
                },
                create: {
                    tenantId,
                    provider: integrationType,
                    integrationType,
                    encryptedConfig: integrationConfig,
                    isActive: true,
                },
            });
            console.log(`Updated ${integrationType} config for tenant ${tenantId}`);
        }
        catch (error) {
            throw new Error(`Failed to update integration config: ${error.message}`);
        }
    }
};
exports.TenantConfigService = TenantConfigService;
exports.TenantConfigService = TenantConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], TenantConfigService);
//# sourceMappingURL=tenant-config.service.js.map