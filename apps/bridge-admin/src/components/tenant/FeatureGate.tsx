import type { ReactNode } from "react";
import { useTenantStore } from "../../store/tenantStore";
import type { TenantFeatures } from "../../types";

interface FeatureGateProps {
  feature: keyof TenantFeatures;
  children: ReactNode;
  fallback?: ReactNode;
}

export function FeatureGate({
  feature,
  children,
  fallback = null,
}: FeatureGateProps) {
  const hasFeature = useTenantStore((state) => state.hasFeature(feature));

  if (!hasFeature) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
