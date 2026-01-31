/**
 * Feature Flag Component
 * 
 * Conditionally renders children based on tenant feature configuration.
 * Supports fallback content when feature is disabled.
 * 
 * @example
 * ```tsx
 * <FeatureFlag feature="analytics" fallback={<UpgradePrompt />}>
 *   <RevenueChart />
 * </FeatureFlag>
 * ```
 */

'use client';

import { ReactNode } from 'react';
import { useFeature, useIntegration } from '@/lib/hooks/use-tenant';
import type { TenantConfig } from '@/lib/tenant-config';

interface FeatureFlagProps {
  feature: keyof TenantConfig['features'];
  children: ReactNode;
  fallback?: ReactNode;
}

export function FeatureFlag({ feature, children, fallback = null }: FeatureFlagProps) {
  const isEnabled = useFeature(feature);
  return isEnabled ? children : fallback;
}

interface IntegrationFlagProps {
  integration: keyof TenantConfig['integrations'];
  children: ReactNode;
  fallback?: ReactNode;
}

export function IntegrationFlag({ integration, children, fallback = null }: IntegrationFlagProps) {
  const isEnabled = useIntegration(integration);
  return isEnabled ? children : fallback;
}

interface TenantTierFlagProps {
  minTier: TenantConfig['tier'];
  currentTier: TenantConfig['tier'];
  children: ReactNode;
  fallback?: ReactNode;
}

const TIER_LEVELS: Record<TenantConfig['tier'], number> = {
  BASIC: 1,
  STANDARD: 2,
  ADVANCED: 3,
  ENTERPRISE: 4,
};

export function TenantTierFlag({ 
  minTier, 
  currentTier, 
  children, 
  fallback = null 
}: TenantTierFlagProps) {
  const hasAccess = TIER_LEVELS[currentTier] >= TIER_LEVELS[minTier];
  return hasAccess ? children : fallback;
}
