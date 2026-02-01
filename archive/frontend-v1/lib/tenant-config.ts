/**
 * Tenant Configuration System
 * 
 * Provides tenant-aware feature flags, integrations, and UI customization.
 * Supports the multi-tenant nature of Project Bridge where different
 * tenants have different feature needs based on their tier and country.
 */

// Feature flags for core functionality
export interface TenantFeatures {
  transactions: boolean;
  people: boolean;
  proof: boolean;
  manager: boolean;
  webhooks: boolean;
  analytics: boolean;
}

// Integration availability
export interface TenantIntegrations {
  mpesa: boolean;
  whatsapp: boolean;
  quickbooks: boolean;
  xero: boolean;
  shopify: boolean;
}

// UI customization options
export interface TenantUI {
  denseMode: boolean;        // Compact UI for mobile-heavy users
  showBalances: boolean;     // Show financial summaries
  enableQuickActions: boolean; // Floating action buttons
  primaryColor: string;      // Brand color (hex)
  logoUrl?: string;          // Custom logo
}

// Complete tenant configuration
export interface TenantConfig {
  id: string;
  name: string;
  country: 'KE' | 'NG' | 'ZA' | 'GH' | 'TZ' | 'UG' | 'OTHER';
  tier: 'BASIC' | 'STANDARD' | 'ADVANCED' | 'ENTERPRISE';
  features: TenantFeatures;
  integrations: TenantIntegrations;
  ui: TenantUI;
}

// Default configuration for new tenants
export const DEFAULT_TENANT_CONFIG: TenantConfig = {
  id: 'default',
  name: 'Project Bridge',
  country: 'KE',
  tier: 'BASIC',
  features: {
    transactions: true,
    people: true,
    proof: false,
    manager: false,
    webhooks: false,
    analytics: false,
  },
  integrations: {
    mpesa: true,
    whatsapp: false,
    quickbooks: false,
    xero: false,
    shopify: false,
  },
  ui: {
    denseMode: true,
    showBalances: true,
    enableQuickActions: true,
    primaryColor: '#10b981', // Emerald-500 for Kenya
  },
};

// Tier-based feature sets
export const TIER_FEATURES: Record<TenantConfig['tier'], Partial<TenantFeatures>> = {
  BASIC: {
    transactions: true,
    people: true,
    proof: false,
    manager: false,
    webhooks: false,
    analytics: false,
  },
  STANDARD: {
    transactions: true,
    people: true,
    proof: true,
    manager: true,
    webhooks: false,
    analytics: false,
  },
  ADVANCED: {
    transactions: true,
    people: true,
    proof: true,
    manager: true,
    webhooks: true,
    analytics: true,
  },
  ENTERPRISE: {
    transactions: true,
    people: true,
    proof: true,
    manager: true,
    webhooks: true,
    analytics: true,
  },
};

// Country-specific defaults
export const COUNTRY_DEFAULTS: Record<TenantConfig['country'], { integrations: Partial<TenantIntegrations>; ui: Partial<TenantUI> }> = {
  KE: {
    integrations: {
      mpesa: true,
      whatsapp: true,
      quickbooks: false,
      xero: false,
      shopify: false,
    },
    ui: {
      primaryColor: '#10b981', // Kenya green
    },
  },
  NG: {
    integrations: {
      mpesa: false,
      whatsapp: true,
      quickbooks: false,
      xero: false,
      shopify: false,
    },
    ui: {
      primaryColor: '#008751', // Nigeria green
    },
  },
  ZA: {
    integrations: {
      mpesa: false,
      whatsapp: true,
      quickbooks: true,
      xero: true,
      shopify: false,
    },
    ui: {
      primaryColor: '#007749', // South Africa green
    },
  },
  GH: {
    integrations: {
      mpesa: false,
      whatsapp: true,
      quickbooks: false,
      xero: false,
      shopify: false,
    },
    ui: {
      primaryColor: '#006b3f', // Ghana green
    },
  },
  TZ: {
    integrations: {
      mpesa: true,
      whatsapp: true,
      quickbooks: false,
      xero: false,
      shopify: false,
    },
    ui: {
      primaryColor: '#1eb53a', // Tanzania green
    },
  },
  UG: {
    integrations: {
      mpesa: true,
      whatsapp: true,
      quickbooks: false,
      xero: false,
      shopify: false,
    },
    ui: {
      primaryColor: '#d90000', // Uganda red
    },
  },
  OTHER: {
    integrations: {
      mpesa: false,
      whatsapp: false,
      quickbooks: true,
      xero: true,
      shopify: true,
    },
    ui: {
      primaryColor: '#10b981',
    },
  },
};

/**
 * Merge tenant configuration with defaults
 */
export function createTenantConfig(
  overrides: Partial<TenantConfig> & { id: string; name: string }
): TenantConfig {
  const countryDefaults = COUNTRY_DEFAULTS[overrides.country || 'KE'];
  const tierFeatures = TIER_FEATURES[overrides.tier || 'BASIC'];

  return {
    ...DEFAULT_TENANT_CONFIG,
    ...countryDefaults,
    features: {
      ...DEFAULT_TENANT_CONFIG.features,
      ...tierFeatures,
      ...overrides.features,
    },
    integrations: {
      ...DEFAULT_TENANT_CONFIG.integrations,
      ...countryDefaults?.integrations,
      ...overrides.integrations,
    },
    ui: {
      ...DEFAULT_TENANT_CONFIG.ui,
      ...countryDefaults?.ui,
      ...overrides.ui,
    },
    ...overrides,
  };
}

/**
 * Check if a feature is enabled for the tenant
 */
export function isFeatureEnabled(
  config: TenantConfig,
  feature: keyof TenantFeatures
): boolean {
  return config.features[feature] ?? false;
}

/**
 * Check if an integration is enabled for the tenant
 */
export function isIntegrationEnabled(
  config: TenantConfig,
  integration: keyof TenantIntegrations
): boolean {
  return config.integrations[integration] ?? false;
}
