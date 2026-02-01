"use client";

import React, { ReactNode } from "react";
import { useTenant } from "@/context/TenantContext";

type FeatureName = 
  | "manual_transactions"
  | "entity_management"
  | "payment_records"
  | "dashboard"
  | "mpesa_integration"
  | "whatsapp_integration"
  | "quickbooks_sync"
  | "xero_sync"
  | "shopify_sync"
  | "advanced_reporting";

interface FeatureGateProps {
  feature: FeatureName;
  children: ReactNode;
  fallback?: ReactNode;
  loadingComponent?: ReactNode;
}

/**
 * FeatureGate - Conditionally renders children based on tenant feature access
 * 
 * Usage:
 * <FeatureGate feature="mpesa_integration">
 *   <MpesaPaymentButton />
 * </FeatureGate>
 * 
 * <FeatureGate feature="whatsapp_integration" fallback={<ManualContact />}>
 *   <WhatsAppButton />
 * </FeatureGate>
 */
export function FeatureGate({
  feature,
  children,
  fallback = null,
  loadingComponent = null,
}: FeatureGateProps) {
  const { features, isLoading } = useTenant();

  if (isLoading) {
    return loadingComponent;
  }

  const hasFeature = features[feature] === true;

  return hasFeature ? <>{children}</> : <>{fallback}</>;
}

/**
 * FeatureBadge - Shows a badge/pill indicating feature availability
 * Useful for "Coming Soon" or "Premium" indicators
 */
interface FeatureBadgeProps {
  feature: FeatureName;
  children: ReactNode;
  lockedBadge?: ReactNode;
}

export function FeatureBadge({
  feature,
  children,
  lockedBadge = (
    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
      Upgrade
    </span>
  ),
}: FeatureBadgeProps) {
  const { features, isLoading } = useTenant();

  if (isLoading) {
    return <>{children}</>;
  }

  const hasFeature = features[feature] === true;

  return (
    <>
      {children}
      {!hasFeature && lockedBadge}
    </>
  );
}

/**
 * FeatureList - Renders different content based on feature availability
 * Useful for showing/hiding lists of features
 */
interface FeatureListProps {
  features: FeatureName[];
  children: (availableFeatures: FeatureName[]) => ReactNode;
}

export function FeatureList({ features: requiredFeatures, children }: FeatureListProps) {
  const { features, isLoading } = useTenant();

  if (isLoading) {
    return null;
  }

  const availableFeatures = requiredFeatures.filter(
    (feature) => features[feature] === true
  );

  return <>{children(availableFeatures)}</>;
}
