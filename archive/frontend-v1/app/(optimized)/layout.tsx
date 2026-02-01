/**
 * Optimized Layout for Core Features
 * 
 * This layout is used for the critical P0 features:
 * - Dashboard
 * - Transactions
 * - People
 * 
 * It implements:
 * - Tenant configuration provider
 * - Network-aware loading
 * - Mobile-optimized navigation
 * - Minimal dependencies
 */

import { ReactNode } from 'react';
import { Metadata } from 'next';
import { DEFAULT_TENANT_CONFIG, createTenantConfig } from '@/lib/tenant-config';
import { TenantProvider } from '@/lib/hooks/use-tenant';
import { OptimizedShell } from '@/components/optimized-shell';

export const metadata: Metadata = {
  title: 'Project Bridge - Transaction Management',
  description: 'Lightweight transaction management for African businesses',
};

interface OptimizedLayoutProps {
  children: ReactNode;
}

export default function OptimizedLayout({ children }: OptimizedLayoutProps) {
  // In production, fetch this from API based on subdomain/header
  const tenantConfig = createTenantConfig({
    id: 'default',
    name: 'Project Bridge',
    country: 'KE',
    tier: 'BASIC',
  });

  return (
    <TenantProvider config={tenantConfig}>
      <OptimizedShell>
        {children}
      </OptimizedShell>
    </TenantProvider>
  );
}
