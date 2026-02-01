"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export interface TenantFeatures {
  manual_transactions: boolean;
  entity_management: boolean;
  payment_records: boolean;
  dashboard: boolean;
  mpesa_integration: boolean;
  whatsapp_integration: boolean;
  quickbooks_sync: boolean;
  xero_sync: boolean;
  shopify_sync: boolean;
  advanced_reporting: boolean;
}

export interface TenantSettings {
  businessType?: 'duka' | 'kiosk' | 'service' | 'transport';
  location?: string;
  features?: TenantFeatures;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  tier: string;
  country: string;
  features: TenantFeatures;
  settings?: TenantSettings;
}

interface TenantContextType {
  tenant: Tenant | null;
  features: TenantFeatures;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const defaultFeatures: TenantFeatures = {
  manual_transactions: true,
  entity_management: true,
  payment_records: true,
  dashboard: true,
  mpesa_integration: false,
  whatsapp_integration: false,
  quickbooks_sync: false,
  xero_sync: false,
  shopify_sync: false,
  advanced_reporting: false,
};

const TenantContext = createContext<TenantContextType>({
  tenant: null,
  features: defaultFeatures,
  isLoading: true,
  error: null,
  refetch: async () => {},
});

export function useTenant() {
  return useContext(TenantContext);
}

// Helper: Extract tenant slug from URL (subdomain or path)
export function getTenantSlugFromUrl(): string | null {
  if (typeof window === "undefined") return null;

  const host = window.location.host;
  const parts = host.split(".");

  // Handle subdomain: tenant.bridge.ke or tenant.localhost:3000
  if (parts.length >= 2 && parts[0] !== "www" && parts[0] !== "bridge") {
    // Check if it's a subdomain (not just bridge.ke)
    if (parts.length >= 3 || host.includes("localhost")) {
      return parts[0];
    }
  }

  // Handle path-based: bridge.ke/tenant
  const path = window.location.pathname;
  const pathMatch = path.match(/^\/([^\/]+)/);
  if (pathMatch && pathMatch[1] && !pathMatch[1].startsWith("_")) {
    return pathMatch[1];
  }

  return null;
}

// Helper hook: Get current tenant slug
export function useTenantSlug(): string | null {
  const [slug, setSlug] = useState<string | null>(null);

  useEffect(() => {
    setSlug(getTenantSlugFromUrl());
  }, []);

  return slug;
}

// Helper hook: Check if current tenant is Basic tier
export function useIsBasicTier(): boolean {
  const { tenant } = useTenant();
  return tenant?.tier === "BASIC";
}

interface TenantProviderProps {
  children: ReactNode;
  apiUrl?: string;
  initialTenant?: Tenant | null;
  tenantSlug?: string;
}

export function TenantProvider({ 
  children, 
  apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1",
  initialTenant = null,
  tenantSlug: propTenantSlug,
}: TenantProviderProps) {
  const [tenant, setTenant] = useState<Tenant | null>(initialTenant);
  const [features, setFeatures] = useState<TenantFeatures>(defaultFeatures);
  const [isLoading, setIsLoading] = useState(!initialTenant);
  const [error, setError] = useState<string | null>(null);

  // Get tenant slug from props, URL, or localStorage
  const getTenantSlug = useCallback((): string | null => {
    if (propTenantSlug) return propTenantSlug;
    if (typeof window === "undefined") return null;
    
    // Try URL first
    const urlSlug = getTenantSlugFromUrl();
    if (urlSlug) return urlSlug;
    
    // Fall back to localStorage
    return localStorage.getItem("tenantSlug");
  }, [propTenantSlug]);

  // Fetch tenant by slug
  const fetchTenantBySlug = useCallback(async (slug: string): Promise<Tenant | null> => {
    try {
      const response = await fetch(`${apiUrl}/tenants/slug/${slug}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Tenant "${slug}" not found`);
        }
        throw new Error(`Failed to fetch tenant: ${response.statusText}`);
      }
      
      const data = await response.json();
      return {
        id: data.id,
        name: data.name,
        slug: data.slug,
        tier: data.tier,
        country: data.country,
        features: data.features || defaultFeatures,
        settings: data.settings,
      };
    } catch (err) {
      console.error("Error fetching tenant by slug:", err);
      return null;
    }
  }, [apiUrl]);

  // Fetch tenant features by ID
  const fetchTenantFeatures = useCallback(async (tenantId: string): Promise<TenantFeatures> => {
    try {
      const response = await fetch(`${apiUrl}/tenants/features`, {
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-Id": tenantId,
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });

      if (!response.ok) {
        console.warn("Failed to fetch tenant features, using defaults");
        return defaultFeatures;
      }

      const data = await response.json();
      return { ...defaultFeatures, ...data };
    } catch (err) {
      console.error("Error fetching tenant features:", err);
      return defaultFeatures;
    }
  }, [apiUrl]);

  // Main fetch function
  const fetchTenantData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const slug = getTenantSlug();
      
      if (!slug) {
        // No tenant slug - use default features for development
        console.warn("No tenant slug found, using default features");
        setFeatures(defaultFeatures);
        return;
      }

      // Try to get cached tenant first
      const cachedTenant = localStorage.getItem(`bridge:tenant:${slug}`);
      const cachedTimestamp = localStorage.getItem(`bridge:tenant:${slug}:timestamp`);
      const cacheAge = cachedTimestamp ? Date.now() - parseInt(cachedTimestamp) : Infinity;
      const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

      let tenantData: Tenant | null = null;

      if (cachedTenant && cacheAge < CACHE_DURATION) {
        try {
          tenantData = JSON.parse(cachedTenant);
          setTenant(tenantData);
          if (tenantData?.features) {
            setFeatures(tenantData.features);
          }
        } catch {
          // Invalid cache, fetch fresh
        }
      }

      // Always fetch fresh data in background
      const freshTenant = await fetchTenantBySlug(slug);
      
      if (freshTenant) {
        // Fetch full features for this tenant
        const freshFeatures = await fetchTenantFeatures(freshTenant.id);
        const mergedTenant = { ...freshTenant, features: freshFeatures };
        
        setTenant(mergedTenant);
        setFeatures(freshFeatures);
        
        // Cache the tenant data
        localStorage.setItem(`bridge:tenant:${slug}`, JSON.stringify(mergedTenant));
        localStorage.setItem(`bridge:tenant:${slug}:timestamp`, Date.now().toString());
        localStorage.setItem("tenantSlug", slug);
      } else if (!tenantData) {
        setError(`Tenant "${slug}" not found`);
        setFeatures(defaultFeatures);
      }
    } catch (err) {
      console.error("Error in fetchTenantData:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      // Fall back to defaults
      setFeatures(defaultFeatures);
    } finally {
      setIsLoading(false);
    }
  }, [getTenantSlug, fetchTenantBySlug, fetchTenantFeatures]);

  useEffect(() => {
    if (!initialTenant) {
      fetchTenantData();
    }
  }, [apiUrl, initialTenant, fetchTenantData]);

  const refetch = useCallback(async () => {
    await fetchTenantData();
  }, [fetchTenantData]);

  return (
    <TenantContext.Provider
      value={{
        tenant,
        features,
        isLoading,
        error,
        refetch,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}
