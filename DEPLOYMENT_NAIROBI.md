# Nairobi Manual Deployment Guide

This guide covers deploying Project Bridge for Nairobi manual use case tenants with a dogfood tenant for integration testing.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         VERCEL                                  │
│                    bridge-manual frontend                       │
│         (Feature flags control integration access)              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        RAILWAY                                  │
│                     NestJS API                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Tenant     │  │   Feature    │  │  Integration Guards  │  │
│  │   Config     │  │    Flags     │  │  (M-Pesa, WhatsApp)  │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE                                   │
│              PostgreSQL Database                                │
│  ┌──────────┐ ┌──────────────┐ ┌──────────────────────────┐    │
│  │  Tenant  │ │   Feature    │ │   Tenant Integrations    │    │
│  │  Table   │ │    Flags     │ │  (M-Pesa, WhatsApp, etc) │    │
│  └──────────┘ └──────────────┘ └──────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## Tenant Types

### 1. Regular Tenants (Nairobi Manual Users)
- **Tier**: BASIC
- **Features**: Manual transactions, entity management, payment records, dashboard
- **Integrations**: None (manual entry only)
- **Focus**: Simple, reliable manual business tracking

### 2. Dogfood Tenant (janders-dogfood)
- **Tier**: ENTERPRISE
- **Features**: All features enabled
- **Integrations**: M-Pesa, WhatsApp, QuickBooks, Xero, Shopify
- **Purpose**: Testing integrations before customer rollout

## Feature Flags

| Feature | Regular Tenants | Dogfood |
|---------|----------------|---------|
| manual_transactions | ✅ | ✅ |
| entity_management | ✅ | ✅ |
| payment_records | ✅ | ✅ |
| dashboard | ✅ | ✅ |
| mpesa_integration | ❌ | ✅ |
| whatsapp_integration | ❌ | ✅ |
| quickbooks_sync | ❌ | ✅ |
| xero_sync | ❌ | ✅ |
| shopify_sync | ❌ | ✅ |
| advanced_reporting | ❌ | ✅ |

## Deployment Steps

### 1. Database Setup

```bash
cd apps/api

# Run migrations
npx prisma migrate deploy

# Seed database with feature flags and dogfood tenant
npx prisma db seed
```

**Seeded Data:**
- 10 feature flags for access control
- Dogfood tenant: `janders-dogfood` (ID: `11111111-1111-1111-1111-111111111111`)
- Dogfood admin user (ID: `22222222-2222-2222-2222-222222222222`)
- All integrations enabled for dogfood tenant

### 2. API Deployment (Railway)

**Required Environment Variables:**

```bash
# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Supabase
SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_JWT_SECRET=...

# Security
JWT_SECRET=...
ENCRYPTION_KEY=...

# M-Pesa (for dogfood tenant)
MPESA_ENVIRONMENT=sandbox
MPESA_CONSUMER_KEY=...
MPESA_CONSUMER_SECRET=...
MPESA_SHORTCODE=...
MPESA_PASSKEY=...
MPESA_CALLBACK_URL=https://api.yourdomain.com/api/v1/integrations/mpesa/stk-callback

# WhatsApp (for dogfood tenant)
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_ACCESS_TOKEN=...
WHATSAPP_WEBHOOK_VERIFY_TOKEN=...
```

**Deploy:**
```bash
# Railway CLI
railway login
railway link
railway up
```

### 3. Frontend Deployment (Vercel)

**Required Environment Variables:**

```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
NEXT_PUBLIC_APP_URL=https://app.yourdomain.com
```

**Deploy:**
```bash
# Vercel CLI
vercel --prod
```

## API Endpoints

### Tenant Management

```bash
# Get current tenant features
GET /api/v1/integrations/tenant-features

# Get available features for tenant tier/country
GET /api/v1/integrations/features

# Get tenant config
GET /api/v1/integrations/config

# Create new tenant (admin only)
POST /api/v1/tenants
{
  "name": "My Business",
  "slug": "my-business",
  "phoneNumber": "+254...",
  "displayName": "Owner Name"
}

# Request integration access
POST /api/v1/tenants/request-integration
{
  "integrationType": "MPESA",
  "reason": "Need M-Pesa for customer payments"
}
```

### M-Pesa Integration (Dogfood Only)

```bash
# Initiate STK Push
POST /api/v1/integrations/mpesa/stk-push
{
  "phoneNumber": "254712345678",
  "amount": 1000,
  "accountReference": "INV-001",
  "transactionDesc": "Payment for goods"
}
```

## Frontend Feature Gates

### Usage Example

```tsx
import { FeatureGate } from '@/components/FeatureGate';

// Show M-Pesa button only if tenant has access
<FeatureGate feature="mpesa_integration">
  <MpesaPaymentButton />
</FeatureGate>

// Show upgrade prompt for tenants without WhatsApp
<FeatureGate 
  feature="whatsapp_integration" 
  fallback={<UpgradePrompt feature="WhatsApp" />}
>
  <WhatsAppButton />
</FeatureGate>
```

### Tenant Context

```tsx
import { useTenant } from '@/context/TenantContext';

function MyComponent() {
  const { tenant, features, isLoading } = useTenant();
  
  if (isLoading) return <Loading />;
  
  if (features.mpesa_integration) {
    return <MpesaFeatures />;
  }
  
  return <ManualEntry />;
}
```

## Testing

### Dogfood Tenant Testing

```bash
# Test dogfood tenant has all features
curl https://api.yourdomain.com/api/v1/integrations/tenant-features \
  -H "Authorization: Bearer <dogfood-token>"

# Expected: All features enabled
{
  "manual_transactions": true,
  "mpesa_integration": true,
  "whatsapp_integration": true,
  ...
}
```

### Regular Tenant Testing

```bash
# Create new tenant
curl -X POST https://api.yourdomain.com/api/v1/tenants \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Business",
    "slug": "test-business",
    "phoneNumber": "+254700000000",
    "displayName": "Test Owner"
  }'

# Verify manual-only features
curl https://api.yourdomain.com/api/v1/integrations/tenant-features \
  -H "Authorization: Bearer <new-tenant-token>"

# Expected: Manual features only
{
  "manual_transactions": true,
  "mpesa_integration": false,
  "whatsapp_integration": false,
  ...
}
```

## Security

### Feature Guard

The [`TenantConfigService.requireFeatureAccess()`](apps/api/src/integrations/tenant-config.service.ts:280) method ensures:
- Tenant tier has access to feature
- Feature is available in tenant's country
- Feature flag is active

### API Protection

Integration endpoints check tenant features:
```typescript
@Post('mpesa/stk-push')
async initiateStkPush(@Request() req: any, @Body() dto: MpesaStkPushDto) {
  const tenantId = req.user?.tenantId;
  
  // Throws ForbiddenException if tenant doesn't have access
  await this.tenantConfigService.requireFeatureAccess(
    tenantId, 
    'mpesa_integration'
  );
  
  // Process payment...
}
```

## Monitoring

### Key Metrics

- **Tenant Count**: Total active tenants
- **Feature Usage**: Which features are used most
- **Integration Success**: M-Pesa/WhatsApp success rates
- **Error Rates**: Failed feature access attempts

### Health Check

```bash
curl https://api.yourdomain.com/api/v1/health

# Expected
{
  "status": "ok",
  "timestamp": "2026-01-31T..."
}
```

## Troubleshooting

### Issue: Tenant can't access features

**Check:**
1. Tenant exists in database
2. Feature flags are seeded
3. Tenant tier matches feature requirements
4. Tenant country is in feature's allowed countries

### Issue: M-Pesa integration fails

**Check:**
1. Dogfood tenant has `mpesa_integration` enabled
2. M-Pesa credentials are set in environment
3. Callback URL is accessible from internet
4. Tenant has `MPESA` integration record in database

### Issue: Frontend shows wrong features

**Check:**
1. API returns correct tenant features
2. `TenantProvider` is wrapping the app
3. `FeatureGate` component is using correct feature name

## Rollback

If issues occur:

1. **Database**: Restore from Supabase backup
2. **API**: Rollback Railway deployment
3. **Frontend**: Rollback Vercel deployment
4. **Dogfood**: Can be disabled without affecting other tenants

## Next Steps

1. Set up monitoring (Sentry, LogRocket)
2. Configure CI/CD for automated deployments
3. Add integration webhooks for real-time updates
4. Create admin dashboard for tenant management
5. Implement billing for tier upgrades
