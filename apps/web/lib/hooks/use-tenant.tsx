/**
 * Tenant Context Hook
 * 
 * Provides tenant configuration throughout the app.
 * Uses React Context for global access to tenant settings.
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { config, isLoading } = useTenant();
 *   
 *   if (isLoading) return <Skeleton />;
 *   
 *   return config.features.analytics ? <Analytics /> : null;
 * }
 * ```
 */

'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import type { TenantConfig } from '@/lib/tenant-config';

interface TenantContextValue {
  config: TenantConfig;
  isLoading: boolean;
  error: Error | null;
}

const TenantContext = createContext<TenantContextValue | null>(null);

interface TenantProviderProps {
  children: ReactNode;
  config: TenantConfig;
}

export function TenantProvider({ children, config }: TenantProviderProps) {
  return (
    <TenantContext.Provider
      value={{
        config,
        isLoading: false,
        error: null,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant(): TenantContextValue {
  const context = useContext(TenantContext);
  
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  
  return context;
}

/**
 * Hook to check if a feature is enabled
 * @example
 * ```tsx
 * function MyComponent() {
 *   const hasAnalytics = useFeature('analytics');
 *   return hasAnalytics ? <Analytics /> : null;
 * }
 * ```
 */
export function useFeature(feature: keyof TenantConfig['features']): boolean {
  const { config } = useTenant();
  return config.features[feature] ?? false;
}

/**
 * Hook to check if an integration is enabled
 * @example
 * ```tsx
 * function MyComponent() {
 *   const hasMpesa = useIntegration('mpesa');
 *   return hasMpesa ? <MpesaButton /> : null;
 * }
 * ```
 */
export function useIntegration(integration: keyof TenantConfig['integrations']): boolean {
  const { config } = useTenant();
  return config.integrations[integration] ?? false;
}
