# Phase 1: Basic Tier Foundation - Actionable Todo List

## Overview
Transform [`bridge-manual`](apps/bridge-manual/) into the Basic Tier reference implementation for Nairobi's manual commerce users.

---

## Week 1 Tasks

### Task 1.1: Restructure bridge-manual as Basic Tier Package
**Goal:** Move manual-first patterns to a reusable package structure

- [ ] Create `packages/basic-tier-theme/` directory
- [ ] Move components from `apps/bridge-manual/src/components/`:
  - [`FeatureGate.tsx`](apps/bridge-manual/src/components/FeatureGate.tsx)
  - [`QuickAddTransaction.tsx`](apps/bridge-manual/src/components/QuickAddTransaction.tsx)
  - [`VoiceRecording.tsx`](apps/bridge-manual/src/components/VoiceRecording.tsx)
- [ ] Move context from `apps/bridge-manual/src/context/`:
  - [`TenantContext.tsx`](apps/bridge-manual/src/context/TenantContext.tsx)
- [ ] Move types from `apps/bridge-manual/src/types/`:
  - [`index.ts`](apps/bridge-manual/src/types/index.ts)
  - [`database.ts`](apps/bridge-manual/src/types/database.ts)
- [ ] Create package.json with proper exports
- [ ] Update tsconfig.json for package structure
- [ ] Verify build works with `npm run build`

**Files to Create:**
```
packages/basic-tier-theme/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts          # Main exports
│   ├── components/
│   │   ├── FeatureGate.tsx
│   │   ├── QuickAddTransaction.tsx
│   │   ├── VoiceRecording.tsx
│   │   └── index.ts
│   ├── context/
│   │   ├── TenantContext.tsx
│   │   └── index.ts
│   ├── types/
│   │   ├── index.ts
│   │   └── database.ts
│   └── styles/
│       └── basic-tier.css
```

---

### Task 1.2: Enhance Tenant Context for Subdomain Support
**Goal:** Enable tenant detection from URL slug

- [ ] Modify [`TenantContext.tsx`](apps/bridge-manual/src/context/TenantContext.tsx:65) to extract tenant slug from URL
- [ ] Add `getTenantBySlug()` API call
- [ ] Update `Tenant` interface to include full tenant data
- [ ] Handle loading/error states for tenant fetch
- [ ] Cache tenant data in localStorage

**Code Changes:**
```typescript
// Add to TenantContext
const getTenantSlugFromUrl = () => {
  const host = window.location.host;
  const parts = host.split('.');
  return parts.length > 2 ? parts[0] : null; // tenant.bridge.ke
};

// Update fetch to use slug
const fetchTenantBySlug = async (slug: string) => {
  const response = await fetch(`${apiUrl}/tenants/slug/${slug}`);
  return response.json();
};
```

---

### Task 1.3: Create Basic Tier Feature Interface
**Goal:** Define what features are available in Basic tier

- [ ] Create `packages/types/src/basic-tier-features.ts`
- [ ] Define `BasicTierFeatures` interface
- [ ] Create feature flag constants
- [ ] Add type guards for feature checking

**New File:**
```typescript
// packages/types/src/basic-tier-features.ts
export interface BasicTierFeatures {
  // Core Manual Features (Always Enabled)
  manual_transactions: true;
  voice_recording: true;
  photo_receipts: true;
  quick_customer_management: true;
  daily_summary_sms: true;
  
  // Smart Insights (Value Return)
  sales_trends: true;
  customer_insights: true;
  payment_patterns: true;
  profit_tracking: true;
  low_stock_alerts: true;
  
  // Upgrade Triggers (Disabled)
  mpesa_integration: false;
  whatsapp_integration: false;
  advanced_reports: false;
  multi_user: false;
  api_access: false;
}

export const BASIC_TIER_FEATURES: BasicTierFeatures = {
  manual_transactions: true,
  voice_recording: true,
  photo_receipts: true,
  quick_customer_management: true,
  daily_summary_sms: true,
  sales_trends: true,
  customer_insights: true,
  payment_patterns: true,
  profit_tracking: true,
  low_stock_alerts: true,
  mpesa_integration: false,
  whatsapp_integration: false,
  advanced_reports: false,
  multi_user: false,
  api_access: false,
};
```

---

### Task 1.4: Update API for Basic Tier Support
**Goal:** Add endpoints needed for Basic tier functionality

- [ ] Add `GET /api/v1/tenants/slug/:slug` endpoint in [`tenants.controller.ts`](apps/api/src/tenants/tenants.controller.ts:30)
- [ ] Add `GET /api/v1/tenants/features` to return tenant's features
- [ ] Update [`tenant-config.service.ts`](apps/api/src/integrations/tenant-config.service.ts:18) with Basic tier defaults
- [ ] Add Basic tier feature flag seed data

**API Endpoints to Add:**
```typescript
// In tenants.controller.ts
@Get('slug/:slug')
async getTenantBySlug(@Param('slug') slug: string) {
  return this.prismaService.tenant.findUnique({
    where: { slug },
    select: { id: true, name: true, slug: true, tier: true, settings: true }
  });
}

@Get('me')
@UseGuards(AuthGuard)
async getCurrentTenant(@Request() req: any) {
  const tenantId = req.user?.tenantId;
  return this.tenantConfigService.getTenantConfig(tenantId);
}
```

---

### Task 1.5: Create Tenant-Aware Layout
**Goal:** Build layout that adapts to tenant configuration

- [ ] Create `BasicTierLayout` component
- [ ] Add tenant branding support (name, logo)
- [ ] Implement feature-gated navigation
- [ ] Add mobile-optimized header
- [ ] Create loading state for tenant fetch

**New Component:**
```typescript
// packages/basic-tier-theme/src/components/BasicTierLayout.tsx
interface BasicTierLayoutProps {
  children: React.ReactNode;
  tenant: Tenant;
}

export function BasicTierLayout({ children, tenant }: BasicTierLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold">{tenant.name}</h1>
          <span className="text-sm text-gray-500">Basic Tier</span>
        </div>
      </header>
      <main className="max-w-4xl mx-auto p-4">
        {children}
      </main>
    </div>
  );
}
```

---

### Task 1.6: Update Frontend App Structure
**Goal:** Integrate new Basic Tier theme into web app

- [ ] Update [`apps/bridge-manual/src/app/layout.tsx`](apps/bridge-manual/src/app/layout.tsx:18) to use BasicTierLayout
- [ ] Modify [`page.tsx`](apps/bridge-manual/src/app/page.tsx:8) for tenant-aware routing
- [ ] Add error boundary for tenant loading failures
- [ ] Create tenant not found page
- [ ] Test with dogfood tenant

**Integration Code:**
```typescript
// apps/web/app/layout.tsx
import { BasicTierLayout } from '@bridge/basic-tier-theme';

export default async function RootLayout({
  children,
  params: { tenant }
}: {
  children: React.ReactNode;
  params: { tenant: string }
}) {
  const tenantData = await fetchTenantBySlug(tenant);
  
  return (
    <html>
      <body>
        <TenantProvider initialTenant={tenantData}>
          <BasicTierLayout tenant={tenantData}>
            {children}
          </BasicTierLayout>
        </TenantProvider>
      </body>
    </html>
  );
}
```

---

## Verification Checklist

Before moving to Phase 2, verify:

- [ ] `packages/basic-tier-theme` builds successfully
- [ ] Tenant slug extraction works from URL
- [ ] Basic tier features are correctly loaded
- [ ] Feature gates hide/show based on tenant tier
- [ ] Dogfood tenant still works with all features
- [ ] New Basic tenant gets only Basic features
- [ ] Mobile layout is responsive
- [ ] No console errors

---

## Next Steps After Phase 1

Once Phase 1 is complete, proceed to:

1. **Phase 2:** Voice-to-transaction parsing, photo capture, AI insights
2. **Phase 3:** Self-service signup, instant tenant creation
3. **Phase 4:** PWA, offline support, mobile optimization

---

## Questions to Resolve

1. Should we keep `apps/bridge-manual` or fully migrate to `packages/basic-tier-theme`?
2. Do we need a separate `apps/web` or use `apps/bridge-manual` as the web app?
3. What's the subdomain structure? `tenant.bridge.ke` or `bridge.ke/tenant`?
4. Should Basic tier tenants share a database or have isolated schemas?
