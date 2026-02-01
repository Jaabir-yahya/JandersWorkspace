# 🚀 PROJECT BRIDGE: COMPLETE ROLLOUT GUIDE

## ✅ MISSION ACCOMPLISHED

### 🔴 Railway Issue: FIXED ✅

- Added `archive/` to `.gitignore`
- Pushed to git - Railway builds will now work

### 🎭 DUAL FRONTENDS: COMPLETE ✅

**1. bridge-perfect** (Mobile - 80% use case) - `localhost:3002`  
**2. bridge-admin** (Desktop - 20% use case) - `localhost:3003`

### 🏢 TENANT SYSTEM: COMPLETE ✅

**janders-dogfood** tenant created with:

- ✅ All features enabled (manual + integrations)
- ✅ M-Pesa integration configured
- ✅ WhatsApp integration configured
- ✅ QuickBooks, Xero, Shopify ready
- ✅ Enterprise tier access

---

## 📁 GITHUB ACTIONS WORKFLOWS

Created 3 deployment workflows in `.github/workflows/`:

### 1. `deploy-api.yml` - API to Railway

**Triggers:** Push to `apps/api/**`, `packages/**`  
**Actions:**

- Install dependencies
- Generate Prisma client
- Build application
- Deploy to Railway
- Run database migrations

**Required Secrets:**

```
RAILWAY_API_TOKEN - Your Railway token
RAILWAY_SERVICE_NAME - Service name (default: 'api')
```

### 2. `deploy-mobile.yml` - Mobile to Vercel

**Triggers:** Push to `apps/bridge-perfect/**`  
**Actions:**

- Install dependencies
- Pull Vercel env
- Build for production
- Deploy to Vercel

**Required Secrets:**

```
VERCEL_TOKEN - Your Vercel token
VERCEL_ORG_ID - Vercel organization ID
VERCEL_MOBILE_PROJECT_ID - Mobile project ID
```

### 3. `deploy-desktop.yml` - Desktop to Vercel

**Triggers:** Push to `apps/bridge-admin/**`  
**Actions:**

- Same as mobile
- Deploys to separate Vercel project

**Required Secrets:**

```
VERCEL_TOKEN - Your Vercel token
VERCEL_ORG_ID - Vercel organization ID
VERCEL_DESKTOP_PROJECT_ID - Desktop project ID
```

### 4. `ci.yml` - Continuous Integration

**Triggers:** All pushes and PRs to main/develop  
**Actions:**

- Install dependencies
- Generate Prisma
- Build all apps
- Lint (continue on error)
- Type check (continue on error)
- Run API unit tests

---

## 🎯 TENANT ACCESS SYSTEM

### Slug-Based Resolution

**URL Pattern:** `https://admin.yourdomain.com/:tenantSlug`

Examples:

- `https://admin.bridge.app/janders-dogfood` - Your dogfood tenant
- `https://admin.bridge.app/mama-mboga` - Basic tenant
- `https://app.bridge.app/mama-mboga` - Mobile for basic tenant

### Tenant Resolution Flow

1. **Desktop App:**
   - Reads URL path for tenant slug
   - Calls `GET /api/v1/tenants/slug/:slug`
   - Stores tenant in localStorage
   - Shows tenant selector in header
   - Displays feature badges (MPesa, WhatsApp, etc.)

2. **Mobile App:**
   - Same slug-based resolution
   - Optimized for touch/phone
   - Works offline-first

3. **API:**
   - Validates tenant exists and is active
   - Returns features based on tenant tier
   - Enforces feature access control

### Feature Gates

```typescript
// In desktop components
<FeatureGate feature="mpesa_integration">
  <MpesaDashboard />
</FeatureGate>

<FeatureGate
  feature="whatsapp_integration"
  fallback={<UpgradePrompt feature="WhatsApp" />}
>
  <WhatsAppDashboard />
</FeatureGate>
```

**Available Features:**

- `manual_transactions` - Basic transaction recording (all tiers)
- `entity_management` - Customer/supplier management (all tiers)
- `payment_records` - Payment tracking (all tiers)
- `dashboard` - Analytics dashboard (all tiers)
- `mpesa_integration` - M-Pesa STK push (Advanced+)
- `whatsapp_integration` - WhatsApp Business API (Advanced+)
- `quickbooks_sync` - QuickBooks sync (Premium+)
- `xero_sync` - Xero sync (Premium+)
- `shopify_sync` - Shopify integration (Premium+)
- `advanced_reporting` - Advanced analytics (Premium+)

---

## 🐕 JANDERS-DOGFOOD TENANT

### Configuration

```typescript
{
  id: '11111111-1111-1111-1111-111111111111',
  name: 'Janders Dogfood',
  slug: 'janders-dogfood',
  tier: 'ENTERPRISE',
  country: 'KE',
  isActive: true,
  settings: {
    features: {
      manual_transactions: true,
      entity_management: true,
      payment_records: true,
      dashboard: true,
      mpesa_integration: true,      // ✅ ENABLED
      whatsapp_integration: true,   // ✅ ENABLED
      quickbooks_sync: true,
      xero_sync: true,
      shopify_sync: true,
      advanced_reporting: true,
    },
    rateLimits: { daily: 10000, monthly: 300000 },
  }
}
```

### Integrations Configured

1. **M-Pesa** (Sandbox mode)
   - Environment: sandbox
   - Shortcode: 174379
   - Ready for STK push testing

2. **WhatsApp Business** (Sandbox mode)
   - Environment: sandbox
   - Ready for message templates

3. **QuickBooks** (Sandbox mode)
   - Ready for accounting sync

4. **Xero** (Sandbox mode)
   - Ready for accounting sync

5. **Shopify** (Sandbox mode)
   - Ready for e-commerce integration

### Admin User

```typescript
{
  id: '22222222-2222-2222-2222-222222222222',
  tenantId: '11111111-1111-1111-1111-111111111111',
  phoneNumber: '+254700000001',
  email: 'dogfood@janders.app',
  displayName: 'Janders Dogfood Admin',
  role: 'admin',
}
```

---

## 🌐 DEPLOYMENT CHECKLIST

### 1. Environment Variables

Create `.env` files for each app:

**API (`apps/api/.env`):**

```env
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
JWT_SECRET=your-jwt-secret
SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...

# M-Pesa (for dogfood tenant)
MPESA_ENVIRONMENT=sandbox
MPESA_CONSUMER_KEY=...
MPESA_CONSUMER_SECRET=...
MPESA_SHORTCODE=174379
MPESA_PASSKEY=...

# WhatsApp (for dogfood tenant)
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_ACCESS_TOKEN=...
```

**Mobile (`apps/bridge-perfect/.env.local`):**

```env
VITE_API_URL=https://api.bridge.app/api/v1
```

**Desktop (`apps/bridge-admin/.env.local`):**

```env
VITE_API_URL=https://api.bridge.app/api/v1
```

### 2. GitHub Secrets

Add these to your GitHub repository (Settings > Secrets and variables > Actions):

```
RAILWAY_API_TOKEN=your_railway_token

VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_MOBILE_PROJECT_ID=mobile_project_id
VERCEL_DESKTOP_PROJECT_ID=desktop_project_id
```

### 3. Deploy Steps

**Step 1: Deploy API**

```bash
# Push to main branch
git add .
git commit -m "Ready for production deployment"
git push origin main

# Or manually trigger:
# GitHub > Actions > Deploy API to Railway > Run workflow
```

**Step 2: Run Database Migrations**

```bash
cd apps/api
npx prisma migrate deploy
npx prisma db seed  # Creates dogfood tenant
```

**Step 3: Deploy Mobile**

```bash
# Push changes to apps/bridge-perfect
# Or manually trigger workflow
```

**Step 4: Deploy Desktop**

```bash
# Push changes to apps/bridge-admin
# Or manually trigger workflow
```

### 4. Verify Deployments

**API Health Check:**

```bash
curl https://api.bridge.app/api/v1/health
# Should return: { "status": "ok", ... }
```

**Tenant Resolution:**

```bash
curl https://api.bridge.app/api/v1/tenants/slug/janders-dogfood
# Should return tenant with all features enabled
```

**Mobile App:**

- Visit: `https://app.bridge.app`
- Should load with tenant selector

**Desktop App:**

- Visit: `https://admin.bridge.app/janders-dogfood`
- Should show full dashboard with all features

---

## 🧪 TESTING WORKFLOW

### Test Dogfood Tenant (Full Features)

1. **Open Desktop:**

   ```
   https://admin.bridge.app/janders-dogfood
   ```

2. **Verify Features:**
   - Dashboard loads with stats cards
   - Revenue chart displays
   - M-Pesa badge visible in header
   - WhatsApp badge visible in header
   - Integrations menu item visible

3. **Test M-Pesa Integration:**
   - Click "Integrations" in sidebar
   - Click "M-Pesa"
   - See configuration panel
   - Shows: Environment, Shortcode, Status

4. **Test WhatsApp Integration:**
   - Click "WhatsApp" in integrations
   - See message templates
   - See recent messages (if any)

5. **Test Feature Gates:**
   - Switch to basic tenant (if available)
   - Verify M-Pesa/WhatsApp hidden
   - Shows "Upgrade" prompts instead

### Test Basic Tenant (Limited Features)

1. **Create Basic Tenant:**

   ```bash
   curl -X POST https://api.bridge.app/api/v1/tenants \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Mama Mboga Shop",
       "slug": "mama-mboga",
       "phoneNumber": "+254712345678",
       "displayName": "Mary Wanjiku"
     }'
   ```

2. **Open Desktop:**

   ```
   https://admin.bridge.app/mama-mboga
   ```

3. **Verify Limited Features:**
   - Manual transactions available
   - Dashboard shows basic stats
   - M-Pesa integration hidden or shows upgrade prompt
   - WhatsApp integration hidden

---

## 📊 MONITORING & HEALTH

### Health Check Endpoints

```bash
# API Health
curl https://api.bridge.app/api/v1/health

# Database Health (via Prisma)
curl https://api.bridge.app/api/v1/health/db

# Integration Status
curl https://api.bridge.app/api/v1/integrations/status
```

### Logs & Monitoring

**Railway Dashboard:**

- View real-time logs
- Monitor resource usage
- Set up alerts for errors

**Vercel Dashboard:**

- View deployment logs
- Monitor performance
- Check function invocations

---

## 🔐 SECURITY CHECKLIST

- ✅ API authentication via JWT
- ✅ Tenant isolation enforced
- ✅ API keys for public endpoints (optional)
- ✅ Feature-based access control
- ✅ Database credentials in Railway secrets
- ✅ Integration secrets encrypted
- ✅ CORS configured for frontend origins

---

## 🚀 ROLLOUT STRATEGY

### Phase 1: Internal Testing (You)

1. Deploy to production
2. Test dogfood tenant thoroughly
3. Verify M-Pesa sandbox transactions
4. Verify WhatsApp sandbox messages
5. Document any issues

### Phase 2: Beta Tenants

1. Invite 5-10 trusted shop owners
2. Give them basic tier access
3. Collect feedback on mobile app
4. Iterate based on feedback

### Phase 3: Public Launch

1. Open signup for basic tier
2. Monitor usage and performance
3. Provide support via WhatsApp
4. Gradually enable integrations for active users

### Phase 4: Scale

1. Optimize performance
2. Add advanced features
3. Expand to other countries (TZ, UG, NG)
4. Enterprise sales for larger businesses

---

## 📞 SUPPORT & TROUBLESHOOTING

### Common Issues

**1. Railway Build Fails**

- Check `archive/` is in `.gitignore`
- Verify no spaces in file paths
- Check Railway service configuration

**2. Tenant Not Found**

- Verify slug is correct
- Check tenant isActive = true
- Verify database has tenant record

**3. Features Not Showing**

- Check tenant tier includes features
- Verify settings.features object
- Check FeatureGate component usage

**4. M-Pesa Integration Not Working**

- Verify sandbox credentials
- Check callback URL is configured
- Review Railway logs for errors

### Getting Help

- **API Docs:** `https://api.bridge.app/api/docs`
- **Health Check:** `https://api.bridge.app/api/v1/health`
- **Tenant Lookup:** `https://api.bridge.app/api/v1/tenants/slug/:slug`

---

## 🎉 YOU'RE READY TO ROLLOUT!

### What's Complete:

✅ **GitHub Actions** - Automated deployment for API, Mobile, Desktop  
✅ **Tenant System** - Slug-based resolution with feature flags  
✅ **Dogfood Tenant** - janders-dogfood with all integrations  
✅ **M-Pesa Ready** - Sandbox configured, ready for testing  
✅ **WhatsApp Ready** - Sandbox configured, ready for testing  
✅ **Headless Design** - Both apps work with any tenant  
✅ **Feature Gates** - Basic vs Full feature control  
✅ **Dual Frontends** - Mobile (80%) + Desktop (20%)

### Next Steps:

1. **Add GitHub Secrets** (see checklist above)
2. **Push to Main** - Trigger deployments
3. **Run Migrations** - `npx prisma migrate deploy && npx prisma db seed`
4. **Test Dogfood** - Visit `https://admin.bridge.app/janders-dogfood`
5. **Rollout!** - Share with your first tenants

**Everything is ready. Time to ship!** 🚀
