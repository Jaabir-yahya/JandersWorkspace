# Simple Deployment Guide - Project Bridge

## Overview

This guide covers deploying Project Bridge with a **single frontend** that adapts to tenant tiers via feature flags.

**Architecture:**
- **Frontend:** One Next.js app (`apps/bridge-manual`) for ALL tenants
- **Backend:** NestJS API (`apps/api`) with tenant-based feature control
- **Database:** PostgreSQL (Supabase) with tenant isolation

**Tenant Types:**
- **BASIC Tier:** Manual transactions, voice, dashboard (default for new tenants)
- **ENTERPRISE Tier:** All features including M-Pesa, WhatsApp, integrations (your dogfood tenant)

---

## Quick Start

### 1. Database Setup

```bash
cd apps/api

# Install dependencies
npm install

# Run migrations
npx prisma migrate deploy

# Seed database (creates dogfood tenant + feature flags)
npx prisma db seed
```

**Seeded Data:**
- Dogfood tenant: `janders-dogfood` (ENTERPRISE tier, all features)
- Feature flags for all integrations
- Default BASIC tier settings

### 2. API Deployment (Railway)

**Environment Variables:**
```bash
# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Supabase
SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_JWT_SECRET=...

# Security
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=your-encryption-key

# M-Pesa (for dogfood/enterprise tenants)
MPESA_ENVIRONMENT=sandbox
MPESA_CONSUMER_KEY=...
MPESA_CONSUMER_SECRET=...
MPESA_SHORTCODE=...
MPESA_PASSKEY=...

# WhatsApp (for dogfood/enterprise tenants)
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_ACCESS_TOKEN=...
```

**Deploy:**
```bash
railway login
railway link
railway up
```

### 3. Frontend Deployment (Vercel)

**Environment Variables:**
```bash
NEXT_PUBLIC_API_URL=https://your-api.railway.app/api/v1
```

**Deploy:**
```bash
cd apps/bridge-manual
vercel --prod
```

---

## Tenant Access

### Your Dogfood Tenant (Full Features)

Access via subdomain:
```
https://janders-dogfood.your-domain.com
```

Or local development:
```
http://janders-dogfood.localhost:3001
```

**Features Enabled:**
- ✅ Manual transactions
- ✅ Voice recording
- ✅ Dashboard
- ✅ M-Pesa integration
- ✅ WhatsApp integration
- ✅ QuickBooks/Xero/Shopify sync
- ✅ Advanced reporting

### New Basic Tenants (Manual Only)

Create a new tenant:
```bash
curl -X POST https://your-api.railway.app/api/v1/tenants \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mama Mboga Shop",
    "slug": "mama-mboga",
    "phoneNumber": "+254712345678",
    "displayName": "Mary Wanjiku"
  }'
```

Access:
```
https://mama-mboga.your-domain.com
```

**Features Enabled:**
- ✅ Manual transactions
- ✅ Voice recording
- ✅ Dashboard
- ❌ M-Pesa integration (upgrade prompt shown)
- ❌ WhatsApp integration (upgrade prompt shown)
- ❌ Advanced integrations

---

## How Feature Gates Work

The frontend uses `FeatureGate` components to show/hide features:

```tsx
// Available to ALL tiers
<FeatureGate feature="manual_transactions">
  <QuickAddTransaction />
</FeatureGate>

// Enterprise only - shows upgrade prompt for Basic
<FeatureGate
  feature="mpesa_integration"
  fallback={<UpgradePrompt feature="M-Pesa" />}
>
  <MpesaSync />
</FeatureGate>
```

Features are controlled by:
1. Tenant tier in database (`BASIC` vs `ENTERPRISE`)
2. Feature flags in `feature_flags` table
3. Tenant settings JSON in `tenants.settings`

---

## Testing

### Test Dogfood Tenant (All Features)

```bash
# Get tenant info
curl https://your-api.railway.app/api/v1/tenants/slug/janders-dogfood

# Expected: tier="ENTERPRISE", all features=true
```

### Test Basic Tenant (Limited Features)

```bash
# Create test tenant
curl -X POST https://your-api.railway.app/api/v1/tenants \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Shop",
    "slug": "test-shop",
    "phoneNumber": "+254700000000",
    "displayName": "Test Owner"
  }'

# Verify features
curl https://your-api.railway.app/api/v1/tenants/slug/test-shop

# Expected: tier="BASIC", integrations=false
```

---

## Upgrading Tenants

To upgrade a tenant from BASIC to ENTERPRISE:

```bash
# Update tenant tier in database (admin only)
curl -X PATCH https://your-api.railway.app/api/v1/tenants/config \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tier": "ENTERPRISE"
  }'
```

Or directly in database:
```sql
UPDATE tenants SET tier = 'ENTERPRISE' WHERE slug = 'tenant-slug';
```

---

## Troubleshooting

### "Tenant not found" Error

**Check:**
1. URL format: `tenant-slug.your-domain.com`
2. Tenant exists: `GET /api/v1/tenants/slug/tenant-slug`
3. Tenant is active: `isActive=true` in database

### Features Not Showing

**Check:**
1. API returns correct features: `GET /api/v1/tenants/slug/{slug}`
2. Feature flags are seeded: Check `feature_flags` table
3. Tenant tier matches feature requirements

### CORS Errors

**Fix:**
Add to `apps/api/src/main.ts`:
```typescript
app.enableCors({
  origin: ['https://your-domain.com', 'https://*.your-domain.com'],
  credentials: true,
});
```

---

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    Vercel (Frontend)                        │
│              apps/bridge-manual (Next.js)                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  FeatureGate("mpesa_integration")                   │   │
│  │    ├─ BASIC tenant: Shows upgrade prompt            │   │
│  │    └─ ENTERPRISE tenant: Shows M-Pesa UI            │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Railway (Backend)                         │
│              apps/api (NestJS)                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Tenants    │  │   Feature    │  │ Integrations │      │
│  │   Controller │  │   Flags      │  │  (M-Pesa,    │      │
│  │              │  │              │  │  WhatsApp)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Supabase (Database)                        │
│  ┌──────────┐ ┌──────────────┐ ┌──────────────────────┐    │
│  │  Tenant  │ │   Feature    │ │ Tenant Integrations  │    │
│  │  Table   │ │    Flags     │ │ (config per tenant)  │    │
│  └──────────┘ └──────────────┘ └──────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## Next Steps

1. **Deploy API:** `cd apps/api && railway up`
2. **Deploy Frontend:** `cd apps/bridge-manual && vercel --prod`
3. **Test Dogfood:** Visit `janders-dogfood.your-domain.com`
4. **Create Test Tenant:** Use API or database
5. **Verify Feature Gates:** BASIC tenants see upgrade prompts

**Support:**
- API docs: `https://your-api.railway.app/api/docs`
- Health check: `GET /api/v1/health`
- Tenant lookup: `GET /api/v1/tenants/slug/{slug}`
