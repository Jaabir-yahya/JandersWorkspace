import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Tenant, TenantFeatures } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface TenantState {
  currentTenant: Tenant | null;
  tenantList: Tenant[];
  isLoading: boolean;
  error: string | null;

  resolveTenant: (slug: string) => Promise<Tenant | null>;
  setCurrentTenant: (tenant: Tenant | null) => void;
  hasFeature: (featureName: keyof TenantFeatures) => boolean;
  switchTenant: (slug: string) => Promise<Tenant | null>;
  addToTenantList: (tenant: Tenant) => void;
  removeFromTenantList: (slug: string) => void;
  clearError: () => void;
}

export const useTenantStore = create<TenantState>()(
  persist(
    (set, get) => ({
      currentTenant: null,
      tenantList: [],
      isLoading: false,
      error: null,

      resolveTenant: async (slug: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(
            `${API_URL}/api/v1/tenants/slug/${slug}`,
            {
              headers: {
                "Content-Type": "application/json",
              },
            },
          );

          if (!response.ok) {
            if (response.status === 404) {
              throw new Error(`Tenant "${slug}" not found`);
            }
            throw new Error(`Failed to resolve tenant: ${response.statusText}`);
          }

          const data = await response.json();
          const tenant: Tenant = {
            ...data,
            createdAt: new Date(data.createdAt),
            updatedAt: new Date(data.updatedAt),
          };

          set((state) => ({
            currentTenant: tenant,
            tenantList: state.tenantList.some((t) => t.slug === tenant.slug)
              ? state.tenantList.map((t) =>
                  t.slug === tenant.slug ? tenant : t,
                )
              : [...state.tenantList, tenant],
            isLoading: false,
          }));

          return tenant;
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to resolve tenant";
          set({ error: errorMessage, isLoading: false });
          return null;
        }
      },

      setCurrentTenant: (tenant: Tenant | null) => {
        set({ currentTenant: tenant, error: null });
      },

      hasFeature: (featureName: keyof TenantFeatures) => {
        const { currentTenant } = get();
        if (!currentTenant) return false;
        return currentTenant.features[featureName] ?? false;
      },

      switchTenant: async (slug: string) => {
        const { tenantList, resolveTenant } = get();

        const existingTenant = tenantList.find((t) => t.slug === slug);
        if (existingTenant) {
          set({ currentTenant: existingTenant, error: null });
          return existingTenant;
        }

        return await resolveTenant(slug);
      },

      addToTenantList: (tenant: Tenant) => {
        set((state) => ({
          tenantList: state.tenantList.some((t) => t.slug === tenant.slug)
            ? state.tenantList.map((t) => (t.slug === tenant.slug ? tenant : t))
            : [...state.tenantList, tenant],
        }));
      },

      removeFromTenantList: (slug: string) => {
        set((state) => ({
          tenantList: state.tenantList.filter((t) => t.slug !== slug),
          currentTenant:
            state.currentTenant?.slug === slug ? null : state.currentTenant,
        }));
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "bridge-admin-tenant",
      partialize: (state) => ({
        currentTenant: state.currentTenant,
        tenantList: state.tenantList,
      }),
    },
  ),
);
