# Tenant System Finalization Plan

## Audit Summary

### Current State
The backend API (`apps/api`) has a **mostly functional tenant isolation system** with some critical gaps that need addressing before locking in the architecture.

### What's Working Well

1. **Database Schema**: Prisma schema properly includes `tenantId` on all major tables:
   - `User.tenantId`
   - `Entity.tenantId`
   - `Transaction.tenantId`
   - `TransactionLine` (inherits via Transaction)
   - `Payment.tenantId`
   - `PaymentApplication` (inherits via relations)

2. **Transaction Service**: Proper tenant filtering in `findAll()` and `create()` methods

3. **Dashboard Service**: All queries properly filter by `tenantId`

4. **API Controllers**: Accept `tenant_id` as query parameter

### Critical Gaps Found

#### 1. **HARDCODED FALLBACK VALUES** ⚠️ HIGH PRIORITY
**File**: `apps/api/src/payment-records/payment-records.service.ts` (Lines 43-45)
```typescript
tenantId: dto.tenant_id || '00000000-0000-0000-0000-000000000000',
createdByUserId: dto.created_by_user_id || '00000000-0000-0000-0000-000000000000',
```
**Risk**: Payments created without explicit tenant_id will use a hardcoded UUID, causing data isolation breaches.

#### 2. **HARDCODED FEATURE FLAGS** ⚠️ MEDIUM PRIORITY
**File**: `apps/api/src/integrations/tenant-config.service.ts` (Lines 92-170)
Feature flags are hardcoded instead of being fetched from database:
- `digital_notes`
- `mpesa_stk_push`
- `whatsapp_business`
- `quickbooks_sync`
- `advanced_analytics`

**Risk**: Cannot dynamically enable/disable features per tenant without code deployment.

#### 3. **MISSING DATABASE MODELS FOR TENANT CONFIG**
The following types exist but have no corresponding Prisma models:
- `TenantConfig` - Tenant configuration storage
- `FeatureFlag` - Feature flag definitions
- `IntegrationConfig` - Integration settings per tenant
- `WebhookConfig` - Webhook configurations

#### 4. **OPTIONAL TENANT ID IN DTOs** ⚠️ MEDIUM PRIORITY
**File**: `apps/api/src/payment-records/dto/create-payment-record.dto.ts` (Lines 35-40)
```typescript
@IsOptional()
@IsString()
@IsUUID()
tenant_id?: string;
```
Tenant ID should be **required**, not optional.

#### 5. **MISSING TENANT VALIDATION**
No middleware or guard validates that:
- The tenant exists
- The user has access to the tenant
- The tenant is active

#### 6. **CONTROLLER ENDPOINTS MISSING TENANT PARAMS**
**File**: `apps/api/src/transactions/transactions.controller.ts` (Line 66, 71)
```typescript
@Get(':id')
findOne(@Param('id', ParseUUIDPipe) id: string) {
  return this.transactionsService.findOne(id); // No tenant_id!
}

@Get('entity/:entityId')
findByEntity(@Param('entityId', ParseUUIDPipe) entityId: string) {
  return this.transactionsService.findByEntity(entityId); // No tenant_id!
}
```
**Risk**: These endpoints don't filter by tenant, allowing cross-tenant data access.

---

## Recommended Implementation Plan

### Phase 1: Critical Fixes (Immediate)

1. **Remove Hardcoded Fallbacks**
   - Make `tenant_id` and `created_by_user_id` required in DTOs
   - Remove fallback UUIDs from payment-records.service.ts
   - Add validation to ensure IDs are provided

2. **Fix Missing Tenant Filters**
   - Update `transactions.controller.ts` endpoints to require `tenant_id`
   - Update service methods to filter by tenant

### Phase 2: Tenant Configuration System

1. **Add Prisma Models**
   ```prisma
   model Tenant {
     id            String    @id @default(uuid()) @db.Uuid
     name          String
     slug          String    @unique
     tier          String    // BASIC, ADVANCED
     country       String    // KE, TZ, UG, etc
     isActive      Boolean   @default(true)
     settings      Json      @default("{}")
     createdAt     DateTime  @default(now())
     updatedAt     DateTime  @updatedAt
     
     users         User[]
     entities      Entity[]
     transactions  Transaction[]
     payments      Payment[]
   }
   
   model FeatureFlag {
     id            String    @id @default(uuid()) @db.Uuid
     name          String    @unique
     description   String?
     isActive      Boolean   @default(true)
     tiers         String[]  // Which tiers have access
     countries     String[]  // Which countries have access
     createdAt     DateTime  @default(now())
     updatedAt     DateTime  @updatedAt
   }
   ```

2. **Implement TenantConfigService Database Methods**
   - Replace hardcoded `getFeatureFlags()` with database query
   - Implement proper `getTenantConfig(tenantId)` lookup
   - Add caching layer (Redis or in-memory)

### Phase 3: Security & Validation

1. **Create TenantGuard**
   - Validates tenant exists
   - Validates user has access to tenant
   - Attaches tenant context to request

2. **Create TenantInterceptor**
   - Automatically injects tenantId from context into service calls
   - Ensures all queries are tenant-scoped

3. **Audit All Endpoints**
   - Verify every endpoint properly filters by tenant
   - Add integration tests for cross-tenant access attempts

### Phase 4: Integration System

1. **Add IntegrationConfig Model**
   ```prisma
   model IntegrationConfig {
     id                String    @id @default(uuid()) @db.Uuid
     tenantId          String    @db.Uuid
     integrationType   String    // MPESA, WHATSAPP, etc
     config            Json      // Encrypted credentials
     isActive          Boolean   @default(false)
     lastSyncAt        DateTime?
     createdAt         DateTime  @default(now())
     updatedAt         DateTime  @updatedAt
     
     tenant            Tenant    @relation(fields: [tenantId], references: [id])
     
     @@unique([tenantId, integrationType])
   }
   ```

2. **Update BaseIntegrationService**
   - Load config from database instead of environment variables
   - Support per-tenant integration credentials

---

## Files Requiring Changes

### High Priority
1. `apps/api/src/payment-records/payment-records.service.ts` - Remove hardcoded UUIDs
2. `apps/api/src/payment-records/dto/create-payment-record.dto.ts` - Make tenant_id required
3. `apps/api/src/transactions/transactions.controller.ts` - Add tenant_id to all endpoints
4. `apps/api/src/transactions/transactions.service.ts` - Add tenant filter to findOne, findByEntity

### Medium Priority
5. `packages/database/prisma/schema.prisma` - Add Tenant, FeatureFlag, IntegrationConfig models
6. `apps/api/src/integrations/tenant-config.service.ts` - Implement database lookups
7. `apps/api/src/integrations/common/base-integration.service.ts` - Load config from DB

### Lower Priority
8. `apps/api/src/` - Create TenantGuard and TenantInterceptor
9. `apps/api/test/` - Add tenant isolation tests

---

## Testing Strategy

1. **Unit Tests**: Test each service method enforces tenant isolation
2. **Integration Tests**: Verify cross-tenant access is blocked
3. **E2E Tests**: Full tenant workflow testing

## Migration Strategy

1. Create database migration for new models
2. Backfill existing data with default tenant
3. Deploy code changes
4. Migrate integrations to per-tenant config
