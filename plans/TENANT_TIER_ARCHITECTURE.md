# Tenant Tier Architecture for Project Bridge

## Executive Summary

This document outlines the research and design for a flexible tenant subscription system that supports Project Bridge's two-tier plan structure:
- **Plan 1 (Free/Basic)**: Simple note-taking/recording tools for digitizing transactions
- **Plan 2 (Pro/Paid)**: Advanced integrations (M-Pesa, WhatsApp Business), multi-user teams, API access, webhooks, ERP/CRM integrations

## Research: SaaS Multi-Tenancy Patterns

### Pattern 1: Simple Tier Column
```sql
ALTER TABLE tenants ADD COLUMN tier VARCHAR(20) DEFAULT 'free';
-- Values: 'free', 'pro', 'enterprise'
```
**Pros**: Simple, fast queries  
**Cons**: Rigid, can't handle feature granularity

### Pattern 2: Feature Flags Table
```sql
CREATE TABLE tenant_features (
  tenant_id UUID REFERENCES tenants(id),
  feature_key VARCHAR(50),
  enabled BOOLEAN DEFAULT false,
  expires_at TIMESTAMP,
  PRIMARY KEY (tenant_id, feature_key)
);
```
**Pros**: Granular control, A/B testing capable  
**Cons**: More complex queries, requires joins

### Pattern 3: Subscription Plans + Feature Matrix
```sql
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY,
  name VARCHAR(50),
  price_cents INTEGER,
  billing_period VARCHAR(20) -- 'monthly', 'yearly'
);

CREATE TABLE plan_features (
  plan_id UUID REFERENCES subscription_plans(id),
  feature_key VARCHAR(50),
  limit_value INTEGER -- e.g., max users, max transactions
  PRIMARY KEY (plan_id, feature_key)
);

CREATE TABLE tenant_subscriptions (
  tenant_id UUID REFERENCES tenants(id),
  plan_id UUID REFERENCES subscription_plans(id),
  status VARCHAR(20), -- 'active', 'cancelled', 'past_due'
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT false
);
```
**Pros**: Industry standard, supports complex pricing, usage-based billing ready  
**Cons**: Most complex to implement

## Recommended Approach: Hybrid Pattern

For Project Bridge, we recommend a **hybrid approach** that combines the flexibility of feature flags with the simplicity of tier-based access:

### Core Tables

```sql
-- 1. Subscription Plans (defines what's available)
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL, -- 'Free', 'Pro', 'Enterprise'
  description TEXT,
  price_monthly_cents INTEGER,
  price_yearly_cents INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Plan Features (what each plan includes)
CREATE TABLE plan_features (
  plan_id UUID REFERENCES subscription_plans(id) ON DELETE CASCADE,
  feature_key VARCHAR(50) NOT NULL,
  feature_name VARCHAR(100),
  description TEXT,
  limit_type VARCHAR(20), -- 'boolean', 'count', 'storage', 'api_calls'
  limit_value INTEGER, -- NULL = unlimited, 0 = feature disabled
  PRIMARY KEY (plan_id, feature_key)
);

-- 3. Tenant Subscriptions (what each tenant has)
CREATE TABLE tenant_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id),
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'cancelled', 'past_due', 'trialing'
  billing_interval VARCHAR(20) DEFAULT 'monthly', -- 'monthly', 'yearly'
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  payment_provider VARCHAR(50), -- 'stripe', 'mpesa', 'manual'
  payment_provider_subscription_id VARCHAR(255),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id)
);

-- 4. Tenant Feature Overrides (for custom enterprise deals)
CREATE TABLE tenant_feature_overrides (
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  feature_key VARCHAR(50) NOT NULL,
  override_value INTEGER, -- NULL = use plan default
  reason TEXT,
  expires_at TIMESTAMPTZ,
  created_by_user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (tenant_id, feature_key)
);

-- 5. Usage Tracking (for metered billing)
CREATE TABLE tenant_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  feature_key VARCHAR(50) NOT NULL,
  usage_period_start TIMESTAMPTZ,
  usage_period_end TIMESTAMPTZ,
  current_value INTEGER DEFAULT 0,
  limit_value INTEGER, -- copied from plan at period start
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, feature_key, usage_period_start)
);
```

### Feature Keys for Project Bridge

```typescript
enum FeatureKey {
  // Core (Plan 1 - Free)
  BASIC_TRANSACTIONS = 'basic_transactions',
  BASIC_ENTITIES = 'basic_entities',
  MANUAL_PAYMENT_RECORDING = 'manual_payment_recording',
  PROOF_ATTACHMENTS = 'proof_attachments',
  DASHBOARD_ANALYTICS = 'dashboard_analytics',
  
  // Advanced (Plan 2 - Pro)
  MPESA_AUTO_RECONCILIATION = 'mpesa_auto_reconciliation',
  WHATSAPP_BUSINESS_API = 'whatsapp_business_api',
  MULTI_USER_TEAMS = 'multi_user_teams',
  API_ACCESS = 'api_access',
  WEBHOOKS = 'webhooks',
  ADVANCED_REPORTING = 'advanced_reporting',
  CUSTOM_INTEGRATIONS = 'custom_integrations',
  PRIORITY_SUPPORT = 'priority_support',
  
  // Limits
  MAX_USERS = 'max_users',
  MAX_TRANSACTIONS_PER_MONTH = 'max_transactions_per_month',
  MAX_STORAGE_MB = 'max_storage_mb',
  MAX_API_CALLS_PER_DAY = 'max_api_calls_per_day',
}
```

### Sample Data

```sql
-- Insert Plans
INSERT INTO subscription_plans (id, name, description, price_monthly_cents, price_yearly_cents) VALUES
  (gen_random_uuid(), 'Free', 'Basic note-taking and transaction recording', 0, 0),
  (gen_random_uuid(), 'Pro', 'Advanced integrations and team features', 2900, 29000), -- $29/month, $290/year
  (gen_random_uuid(), 'Enterprise', 'Custom solutions and dedicated support', NULL, NULL);

-- Insert Plan Features (Free Plan)
INSERT INTO plan_features (plan_id, feature_key, feature_name, limit_type, limit_value) 
SELECT id, 'basic_transactions', 'Basic Transactions', 'boolean', 1 
FROM subscription_plans WHERE name = 'Free';

INSERT INTO plan_features (plan_id, feature_key, feature_name, limit_type, limit_value) 
SELECT id, 'max_users', 'Maximum Users', 'count', 1 
FROM subscription_plans WHERE name = 'Free';

INSERT INTO plan_features (plan_id, feature_key, feature_name, limit_type, limit_value) 
SELECT id, 'max_transactions_per_month', 'Max Transactions/Month', 'count', 100 
FROM subscription_plans WHERE name = 'Free';

INSERT INTO plan_features (plan_id, feature_key, feature_name, limit_type, limit_value) 
SELECT id, 'max_storage_mb', 'Max Storage (MB)', 'storage', 100 
FROM subscription_plans WHERE name = 'Free';

-- Insert Plan Features (Pro Plan)
INSERT INTO plan_features (plan_id, feature_key, feature_name, limit_type, limit_value) 
SELECT id, 'mpesa_auto_reconciliation', 'M-Pesa Auto Reconciliation', 'boolean', 1 
FROM subscription_plans WHERE name = 'Pro';

INSERT INTO plan_features (plan_id, feature_key, feature_name, limit_type, limit_value) 
SELECT id, 'whatsapp_business_api', 'WhatsApp Business API', 'boolean', 1 
FROM subscription_plans WHERE name = 'Pro';

INSERT INTO plan_features (plan_id, feature_key, feature_name, limit_type, limit_value) 
SELECT id, 'multi_user_teams', 'Multi-User Teams', 'boolean', 1 
FROM subscription_plans WHERE name = 'Pro';

INSERT INTO plan_features (plan_id, feature_key, feature_name, limit_type, limit_value) 
SELECT id, 'api_access', 'API Access', 'boolean', 1 
FROM subscription_plans WHERE name = 'Pro';

INSERT INTO plan_features (plan_id, feature_key, feature_name, limit_type, limit_value) 
SELECT id, 'webhooks', 'Webhooks', 'boolean', 1 
FROM subscription_plans WHERE name = 'Pro';

INSERT INTO plan_features (plan_id, feature_key, feature_name, limit_type, limit_value) 
SELECT id, 'max_users', 'Maximum Users', 'count', 10 
FROM subscription_plans WHERE name = 'Pro';

INSERT INTO plan_features (plan_id, feature_key, feature_name, limit_type, limit_value) 
SELECT id, 'max_transactions_per_month', 'Max Transactions/Month', 'count', 1000 
FROM subscription_plans WHERE name = 'Pro';

INSERT INTO plan_features (plan_id, feature_key, feature_name, limit_type, limit_value) 
SELECT id, 'max_storage_mb', 'Max Storage (MB)', 'storage', 1000 
FROM subscription_plans WHERE name = 'Pro';

INSERT INTO plan_features (plan_id, feature_key, feature_name, limit_type, limit_value) 
SELECT id, 'max_api_calls_per_day', 'Max API Calls/Day', 'api_calls', 10000 
FROM subscription_plans WHERE name = 'Pro';
```

## Prisma Schema Extension

Add to `api/prisma/schema.prisma`:

```prisma
// Subscription Plans
model SubscriptionPlan {
  id                String    @id @default(uuid()) @db.Uuid
  name              String
  description       String?
  priceMonthlyCents Int?      @map("price_monthly_cents")
  priceYearlyCents  Int?      @map("price_yearly_cents")
  isActive          Boolean   @default(true) @map("is_active")
  createdAt         DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)
  
  // Relations
  features          PlanFeature[]
  subscriptions     TenantSubscription[]
  
  @@map("subscription_plans")
}

// Plan Features
model PlanFeature {
  id          String   @id @default(uuid()) @db.Uuid
  planId      String   @map("plan_id") @db.Uuid
  featureKey  String   @map("feature_key")
  featureName String?  @map("feature_name")
  description String?
  limitType   String?  @map("limit_type") // 'boolean', 'count', 'storage', 'api_calls'
  limitValue  Int?     @map("limit_value")
  
  // Relations
  plan        SubscriptionPlan @relation(fields: [planId], references: [id], onDelete: Cascade)
  
  @@unique([planId, featureKey])
  @@map("plan_features")
}

// Tenant Subscriptions
model TenantSubscription {
  id                             String    @id @default(uuid()) @db.Uuid
  tenantId                       String    @unique @map("tenant_id") @db.Uuid
  planId                         String    @map("plan_id") @db.Uuid
  status                         String    @default("active") // 'active', 'cancelled', 'past_due', 'trialing'
  billingInterval                String    @default("monthly") @map("billing_interval")
  currentPeriodStart             DateTime? @map("current_period_start") @db.Timestamptz(6)
  currentPeriodEnd               DateTime? @map("current_period_end") @db.Timestamptz(6)
  cancelAtPeriodEnd              Boolean   @default(false) @map("cancel_at_period_end")
  paymentProvider                String?   @map("payment_provider")
  paymentProviderSubscriptionId  String?   @map("payment_provider_subscription_id")
  metadata                       Json      @default("{}")
  createdAt                      DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt                      DateTime  @default(now()) @map("updated_at") @db.Timestamptz(6)
  
  // Relations
  plan                           SubscriptionPlan @relation(fields: [planId], references: [id])
  
  @@map("tenant_subscriptions")
}

// Tenant Feature Overrides
model TenantFeatureOverride {
  tenantId         String    @map("tenant_id") @db.Uuid
  featureKey       String    @map("feature_key")
  overrideValue    Int?      @map("override_value")
  reason           String?
  expiresAt        DateTime? @map("expires_at") @db.Timestamptz(6)
  createdByUserId  String    @map("created_by_user_id") @db.Uuid
  createdAt        DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)
  
  @@id([tenantId, featureKey])
  @@map("tenant_feature_overrides")
}

// Tenant Usage Tracking
model TenantUsage {
  id                String    @id @default(uuid()) @db.Uuid
  tenantId          String    @map("tenant_id") @db.Uuid
  featureKey        String    @map("feature_key")
  usagePeriodStart  DateTime  @map("usage_period_start") @db.Timestamptz(6)
  usagePeriodEnd    DateTime  @map("usage_period_end") @db.Timestamptz(6)
  currentValue      Int       @default(0) @map("current_value")
  limitValue        Int?      @map("limit_value")
  createdAt         DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt         DateTime  @default(now()) @map("updated_at") @db.Timestamptz(6)
  
  @@unique([tenantId, featureKey, usagePeriodStart])
  @@map("tenant_usage")
}
```

## Feature Gating Implementation

### Service Layer

```typescript
// api/src/subscriptions/subscriptions.service.ts
@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getTenantFeatures(tenantId: string): Promise<FeatureMap> {
    const subscription = await this.prisma.tenantSubscription.findUnique({
      where: { tenantId },
      include: {
        plan: {
          include: { features: true }
        }
      }
    });

    if (!subscription) {
      // Return free plan defaults
      return this.getDefaultFreeFeatures();
    }

    // Get plan features
    const planFeatures = subscription.plan.features;
    
    // Get overrides
    const overrides = await this.prisma.tenantFeatureOverride.findMany({
      where: { 
        tenantId,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      }
    });

    // Merge plan features with overrides
    const featureMap: FeatureMap = {};
    
    for (const feature of planFeatures) {
      const override = overrides.find(o => o.featureKey === feature.featureKey);
      featureMap[feature.featureKey] = {
        enabled: override?.overrideValue !== 0 && feature.limitValue !== 0,
        limit: override?.overrideValue ?? feature.limitValue,
        type: feature.limitType
      };
    }

    return featureMap;
  }

  async canUseFeature(tenantId: string, featureKey: string): Promise<boolean> {
    const features = await this.getTenantFeatures(tenantId);
    return features[featureKey]?.enabled ?? false;
  }

  async checkLimit(tenantId: string, featureKey: string, increment: number = 1): Promise<LimitCheckResult> {
    const features = await this.getTenantFeatures(tenantId);
    const feature = features[featureKey];
    
    if (!feature || !feature.enabled) {
      return { allowed: false, reason: 'Feature not enabled' };
    }

    if (feature.limit === null) {
      return { allowed: true }; // Unlimited
    }

    // Get or create usage record
    const usage = await this.getOrCreateUsage(tenantId, featureKey, feature.limit);
    
    if (usage.currentValue + increment > feature.limit) {
      return { 
        allowed: false, 
        reason: 'Limit exceeded',
        current: usage.currentValue,
        limit: feature.limit
      };
    }

    return { allowed: true, current: usage.currentValue, limit: feature.limit };
  }

  async incrementUsage(tenantId: string, featureKey: string, amount: number = 1): Promise<void> {
    const now = new Date();
    const periodStart = startOfMonth(now);
    
    await this.prisma.tenantUsage.upsert({
      where: {
        tenantId_featureKey_usagePeriodStart: {
          tenantId,
          featureKey,
          usagePeriodStart: periodStart
        }
      },
      update: {
        currentValue: { increment: amount },
        updatedAt: now
      },
      create: {
        tenantId,
        featureKey,
        usagePeriodStart: periodStart,
        usagePeriodEnd: endOfMonth(now),
        currentValue: amount,
        limitValue: (await this.getTenantFeatures(tenantId))[featureKey]?.limit
      }
    });
  }
}
```

### Guard/Decorator for API Endpoints

```typescript
// api/src/subscriptions/guards/feature.guard.ts
@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredFeature = this.reflector.get<string>(
      'requiredFeature',
      context.getHandler()
    );

    if (!requiredFeature) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const tenantId = request.headers['x-tenant-id'];

    if (!tenantId) {
      throw new ForbiddenException('Tenant ID required');
    }

    const canUse = await this.subscriptionsService.canUseFeature(
      tenantId,
      requiredFeature
    );

    if (!canUse) {
      throw new ForbiddenException(
        `This feature requires a Pro subscription. Upgrade to access ${requiredFeature}.`
      );
    }

    return true;
  }
}

// Decorator
export const RequireFeature = (feature: string) => 
  applyDecorators(
    SetMetadata('requiredFeature', feature),
    UseGuards(FeatureGuard)
  );
```

### Usage in Controllers

```typescript
// api/src/transactions/transactions.controller.ts
@Controller('transactions')
export class TransactionsController {
  
  @Post('mpesa-webhook')
  @RequireFeature('mpesa_auto_reconciliation')
  async handleMpesaWebhook(@Body() payload: MpesaWebhookDto) {
    // Only Pro tenants can use M-Pesa auto-reconciliation
  }

  @Post()
  async create(
    @Body() dto: CreateTransactionDto,
    @Headers('x-tenant-id') tenantId: string
  ) {
    // Check transaction limit
    const limitCheck = await this.subscriptionsService.checkLimit(
      tenantId,
      'max_transactions_per_month'
    );

    if (!limitCheck.allowed) {
      throw new HttpException(
        `Transaction limit reached: ${limitCheck.current}/${limitCheck.limit}. Upgrade to Pro for more.`,
        HttpStatus.PAYMENT_REQUIRED
      );
    }

    // Create transaction
    const transaction = await this.transactionsService.create(dto);
    
    // Increment usage
    await this.subscriptionsService.incrementUsage(
      tenantId,
      'max_transactions_per_month'
    );

    return transaction;
  }
}
```

## Frontend Integration

### Hook for Feature Access

```typescript
// web/my-app/lib/hooks/use-subscription.ts
export function useTenantFeatures() {
  const { data, error } = useSWR<FeatureMap>(
    '/subscriptions/features',
    fetcher
  );

  return {
    features: data,
    isLoading: !error && !data,
    isError: error,
    canUseFeature: (key: string) => data?.[key]?.enabled ?? false,
    getLimit: (key: string) => data?.[key]?.limit ?? 0
  };
}

// Usage in components
function TransactionForm() {
  const { canUseFeature } = useTenantFeatures();
  
  return (
    <form>
      {/* Basic fields always available */}
      <EntitySelect />
      <LineItems />
      
      {/* Pro feature */}
      {canUseFeature('mpesa_auto_reconciliation') && (
        <MpesaIntegration />
      )}
      
      {/* Show upgrade prompt if not available */}
      {!canUseFeature('mpesa_auto_reconciliation') && (
        <UpgradePrompt feature="M-Pesa Auto Reconciliation" />
      )}
    </form>
  );
}
```

## Migration Path

### Phase 1: Schema Setup (Now)
1. Create subscription tables
2. Seed Free and Pro plans
3. Backfill existing tenants to Free plan

### Phase 2: Feature Gating (Phase 4)
1. Implement subscription service
2. Add guards to Pro-only endpoints
3. Add feature checks to frontend

### Phase 3: Billing Integration (Phase 5)
1. Integrate Stripe/M-Pesa for payments
2. Implement subscription lifecycle webhooks
3. Add usage tracking and alerting

## Conclusion

This architecture provides:
- **Flexibility**: Easy to add new features or plans
- **Granularity**: Per-feature control with limits
- **Override capability**: Support custom enterprise deals
- **Usage tracking**: Ready for metered billing
- **Clean separation**: Business logic isolated from billing

The design supports Project Bridge's immediate needs (Free vs Pro) while being extensible for future tiers (Enterprise, custom plans).
