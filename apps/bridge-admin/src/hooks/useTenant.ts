import { useCallback } from "react";
import { useTenantStore } from "../store/tenantStore";
import type { Tenant, TenantFeatures } from "../types";

interface UseTenantReturn {
  currentTenant: Tenant | null;
  tenantList: Tenant[];
  isLoading: boolean;
  error: string | null;
  resolveTenant: (slug: string) => Promise<Tenant | null>;
  switchTenant: (slug: string) => Promise<Tenant | null>;
  hasFeature: (featureName: keyof TenantFeatures) => boolean;
  clearError: () => void;
}

export function useTenant(): UseTenantReturn {
  const currentTenant = useTenantStore((state) => state.currentTenant);
  const tenantList = useTenantStore((state) => state.tenantList);
  const isLoading = useTenantStore((state) => state.isLoading);
  const error = useTenantStore((state) => state.error);
  const resolveTenant = useTenantStore((state) => state.resolveTenant);
  const switchTenant = useTenantStore((state) => state.switchTenant);
  const clearError = useTenantStore((state) => state.clearError);

  const hasFeature = useCallback(
    (featureName: keyof TenantFeatures): boolean => {
      if (!currentTenant) return false;
      return currentTenant.features[featureName] ?? false;
    },
    [currentTenant],
  );

  return {
    currentTenant,
    tenantList,
    isLoading,
    error,
    resolveTenant,
    switchTenant,
    hasFeature,
    clearError,
  };
}
