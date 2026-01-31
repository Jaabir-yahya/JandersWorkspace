# Prisma Migration Plan: Production-Ready Database Architecture

## Executive Summary

**Decision**: Migrate from Supabase client to **Prisma ORM** for database access while keeping Supabase as the hosted PostgreSQL database.

**Why This Approach**:
- Supabase provides excellent managed PostgreSQL hosting with backups, scaling, and security
- Prisma provides superior developer experience with type safety, migrations, and query building
- You get the best of both worlds: managed infrastructure + professional ORM

---

## Current Architecture Analysis

### Pain Points with Current Supabase Client Approach

1. **No Type Safety**: Raw SQL queries and RPC calls return `any` types
2. **Manual Foreign Key Management**: Current 400 error due to missing user record
3. **No Connection Pooling**: Each request creates new connections
4. **Difficult Testing**: Hard to mock Supabase client for unit tests
5. **Schema Drift**: No version-controlled schema management
6. **No IntelliSense**: IDE can't autocomplete database fields

### Current Database Schema

```sql
-- Core Tables
- users (id, tenant_id, phone_number, email, display_name, role, metadata, created_at)
- entities (id, tenant_id, type, display_name, phone_number, metadata, created_by_user_id, created_at)
- transactions (id, tenant_id, entity_id, reference, status, type, payment_status, total_amount, currency_code, metadata, created_by_user_id, created_at, reversed_transaction_id)
- transaction_lines (id, transaction_id, description, sku, quantity, unit_price, total_line_amount, account_code, metadata, created_at)
- payments (id, tenant_id, reference, amount, currency_code, status, metadata, created_by_user_id, created_at)
- payment_applications (id, payment_id, transaction_id, applied_amount, created_at)

-- Enums
- txn_status: DRAFT, POSTED, REVERSED, RECONCILED, VOIDED, ARCHIVED
- payment_status: PENDING, PARTIAL, SETTLED, FAILED, CANCELLED
- txn_type: RETAIL, SERVICE, RENTAL, EXPENSE
```

---

## Target Architecture

### Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    NestJS API (Node.js)                     │
├─────────────────────────────────────────────────────────────┤
│  Prisma Client  ←── Type-safe, auto-generated queries      │
├─────────────────────────────────────────────────────────────┤
│  Connection Pooler (PgBouncer/Supabase Pooler)              │
├─────────────────────────────────────────────────────────────┤
│  Supabase PostgreSQL (Managed Database)                     │
└─────────────────────────────────────────────────────────────┘
```

### Benefits of Prisma + Supabase Combo

| Feature | Before (Supabase Client) | After (Prisma + Supabase) |
|---------|--------------------------|---------------------------|
| Type Safety | ❌ None | ✅ Full TypeScript types |
| Auto-completion | ❌ None | ✅ IDE IntelliSense |
| Migrations | ❌ Manual SQL | ✅ Version-controlled migrations |
| Connection Pooling | ❌ None | ✅ Built-in pooling |
| Query Building | ❌ Raw SQL/RPC | ✅ Fluent API |
| Relations | ❌ Manual joins | ✅ Automatic relations |
| Testing | ❌ Hard to mock | ✅ Easy dependency injection |
| Performance | ⚠️ Basic | ✅ Query optimization |

---

## Migration Strategy

### Phase 1: Foundation (Week 1)

#### 1.1 Install Prisma Dependencies

```bash
cd api
npm install prisma @prisma/client
npm install -D prisma
```

#### 1.2 Initialize Prisma

```bash
npx prisma init
```

This creates:
- `prisma/schema.prisma` - Database schema definition
- `.env` - Database connection URL

#### 1.3 Create Prisma Schema

Based on your existing migrations, here's the complete schema:

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Enums
enum TxnStatus {
  DRAFT
  POSTED
  REVERSED
  RECONCILED
  VOIDED
  ARCHIVED
}

enum PaymentStatus {
  PENDING
  PARTIAL
  SETTLED
  FAILED
  CANCELLED
}

enum TxnType {
  RETAIL
  SERVICE
  RENTAL
  EXPENSE
}

enum EntityType {
  CUSTOMER
  SUPPLIER
  BOTH
}

// Users table
model User {
  id                String    @id @default(uuid()) @db.Uuid
  tenantId          String    @map("tenant_id") @db.Uuid
  phoneNumber       String    @map("phone_number")
  email             String?
  displayName       String?   @map("display_name")
  role              String?
  metadata          Json      @default("{}")
  createdAt         DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)
  
  // Relations
  createdEntities   Entity[]  @relation("EntityCreator")
  createdTransactions Transaction[] @relation("TransactionCreator")
  createdPayments   Payment[] @relation("PaymentCreator")
  
  @@unique([tenantId, phoneNumber])
  @@index([tenantId])
  @@map("users")
}

// Entities table (customers/suppliers)
model Entity {
  id                String    @id @default(uuid()) @db.Uuid
  tenantId          String    @map("tenant_id") @db.Uuid
  type              EntityType
  displayName       String    @map("display_name")
  phoneNumber       String?   @map("phone_number")
  metadata          Json      @default("{}")
  createdByUserId   String    @map("created_by_user_id") @db.Uuid
  createdAt         DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)
  
  // Relations
  createdBy         User      @relation("EntityCreator", fields: [createdByUserId], references: [id])
  transactions      Transaction[]
  
  @@unique([tenantId, phoneNumber])
  @@index([tenantId])
  @@map("entities")
}

// Transactions table
model Transaction {
  id                    String        @id @default(uuid()) @db.Uuid
  tenantId              String        @map("tenant_id") @db.Uuid
  entityId              String?       @map("entity_id") @db.Uuid
  reference             String?
  status                TxnStatus     @default(DRAFT)
  type                  TxnType       @default(RETAIL)
  paymentStatus         PaymentStatus @default(PENDING) @map("payment_status")
  totalAmount           Decimal       @default(0) @map("total_amount") @db.Decimal(18, 4)
  currencyCode          String        @default("USD") @map("currency_code") @db.VarChar(3)
  metadata              Json          @default("{}")
  createdByUserId       String        @map("created_by_user_id") @db.Uuid
  createdAt             DateTime      @default(now()) @map("created_at") @db.Timestamptz(6)
  reversedTransactionId String?       @map("reversed_transaction_id") @db.Uuid
  
  // Relations
  entity                Entity?       @relation(fields: [entityId], references: [id])
  createdBy             User          @relation("TransactionCreator", fields: [createdByUserId], references: [id])
  lines                 TransactionLine[]
  paymentApplications   PaymentApplication[]
  reversedTransaction   Transaction?  @relation("TransactionReversal", fields: [reversedTransactionId], references: [id])
  reversingTransactions Transaction[] @relation("TransactionReversal")
  
  @@index([tenantId, status])
  @@unique([tenantId, reference])
  @@map("transactions")
}

// Transaction lines
model TransactionLine {
  id                String    @id @default(uuid()) @db.Uuid
  transactionId     String    @map("transaction_id") @db.Uuid
  description       String?
  sku               String?
  quantity          Decimal   @default(1) @db.Decimal(18, 4)
  unitPrice         Decimal   @map("unit_price") @db.Decimal(18, 4)
  totalLineAmount   Decimal   @map("total_line_amount") @db.Decimal(18, 4)
  accountCode       String    @map("account_code")
  metadata          Json      @default("{}")
  createdAt         DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)
  
  // Relations
  transaction       Transaction @relation(fields: [transactionId], references: [id], onDelete: Cascade)
  
  @@index([transactionId])
  @@map("transaction_lines")
}

// Payments table
model Payment {
  id                String    @id @default(uuid()) @db.Uuid
  tenantId          String    @map("tenant_id") @db.Uuid
  reference         String?
  amount            Decimal   @db.Decimal(18, 4)
  currencyCode      String    @default("USD") @map("currency_code") @db.VarChar(3)
  status            PaymentStatus @default(PENDING)
  metadata          Json      @default("{}")
  createdByUserId   String    @map("created_by_user_id") @db.Uuid
  createdAt         DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)
  
  // Relations
  createdBy         User      @relation("PaymentCreator", fields: [createdByUserId], references: [id])
  applications      PaymentApplication[]
  
  @@index([tenantId])
  @@map("payments")
}

// Payment applications (linking payments to transactions)
model PaymentApplication {
  id              String    @id @default(uuid()) @db.Uuid
  paymentId       String    @map("payment_id") @db.Uuid
  transactionId   String    @map("transaction_id") @db.Uuid
  appliedAmount   Decimal   @map("applied_amount") @db.Decimal(18, 4)
  createdAt       DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)
  
  // Relations
  payment         Payment   @relation(fields: [paymentId], references: [id], onDelete: Cascade)
  transaction     Transaction @relation(fields: [transactionId], references: [id])
  
  @@unique([paymentId, transactionId])
  @@index([transactionId])
  @@map("payment_applications")
}
```

#### 1.4 Environment Configuration

Update `api/.env`:

```bash
# Database Connection (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"

# For production with connection pooling:
# DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
```

### Phase 2: Database Synchronization (Week 1-2)

#### 2.1 Baseline Migration

Since you already have a schema, use Prisma's introspection:

```bash
# Pull existing schema into Prisma
npx prisma db pull

# Or create a baseline migration
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > prisma/migrations/00_init/migration.sql
```

#### 2.2 Create Prisma Module for NestJS

```typescript
// api/src/prisma/prisma.module.ts
import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

```typescript
// api/src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

### Phase 3: Service Migration (Week 2-3)

#### 3.1 Migration Pattern

For each service, follow this pattern:

**Before (Supabase)**:
```typescript
const { data, error } = await this.supabase
  .from('transactions')
  .select('*')
  .eq('tenant_id', tenantId);
```

**After (Prisma)**:
```typescript
const transactions = await this.prisma.transaction.findMany({
  where: { tenantId },
  include: {
    entity: true,
    lines: true,
  },
});
```

#### 3.2 Service-by-Service Migration Plan

| Service | Complexity | Priority | Est. Time |
|---------|-----------|----------|-----------|
| TransactionsService | High | 1 | 2 days |
| PaymentRecordsService | Medium | 2 | 1 day |
| DashboardService | Medium | 3 | 1 day |
| AttachmentsService | Low | 4 | 0.5 day |

### Phase 4: Seed Data & Testing (Week 3)

#### 4.1 Prisma Seed Script

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create default tenant
  const tenant = await prisma.tenant.upsert({
    where: { id: '00000000-0000-0000-0000-000000000000' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000000',
      name: 'Default Business',
      currencyCode: 'KES',
      metadata: { business_type: 'retail', location: 'Nairobi' },
    },
  });

  // Create default user (fixes the foreign key issue!)
  const user = await prisma.user.upsert({
    where: { id: '00000000-0000-0000-0000-000000000000' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000000',
      tenantId: tenant.id,
      phoneNumber: '+254700000000',
      email: 'admin@example.com',
      displayName: 'System Admin',
      role: 'admin',
    },
  });

  // Create entities with proper foreign key
  await prisma.entity.createMany({
    data: [
      {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        tenantId: tenant.id,
        createdByUserId: user.id,
        type: 'CUSTOMER',
        displayName: 'John Kamau',
        phoneNumber: '+254712345678',
        metadata: { trust_score: 85 },
      },
      // ... more entities
    ],
    skipDuplicates: true,
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Add to `package.json`:
```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

Run: `npx prisma db seed`

### Phase 5: Production Deployment (Week 4)

#### 5.1 Connection Pooling Setup

For Supabase production:

```bash
# Use connection pooler URL
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=10"
```

#### 5.2 Migration Deployment

```bash
# Deploy migrations to production
npx prisma migrate deploy
```

---

## Implementation Checklist

### Week 1: Foundation
- [ ] Install Prisma dependencies
- [ ] Create `prisma/schema.prisma`
- [ ] Set up Prisma module in NestJS
- [ ] Configure environment variables
- [ ] Run initial introspection/baseline

### Week 2: Core Migration
- [ ] Migrate TransactionsService
- [ ] Migrate PaymentRecordsService
- [ ] Migrate DashboardService
- [ ] Update DTOs for type safety
- [ ] Remove Supabase module dependency

### Week 3: Data & Testing
- [ ] Create Prisma seed script
- [ ] Fix foreign key constraint issues
- [ ] Write integration tests with Prisma
- [ ] Performance testing
- [ ] Update API documentation

### Week 4: Production
- [ ] Set up connection pooling
- [ ] Deploy migrations
- [ ] Monitor performance
- [ ] Document new patterns

---

## Key Benefits You'll Get

1. **Type Safety**: Every database query is fully typed
2. **Foreign Key Handling**: Prisma automatically handles relations
3. **Migration Safety**: Version-controlled schema changes
4. **Better Testing**: Easy to mock Prisma client
5. **Performance**: Built-in query optimization and connection pooling
6. **Developer Experience**: Auto-completion and inline documentation
7. **Future-Proof**: Easy to add new features, indexes, and relations

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Migration downtime | Use blue-green deployment strategy |
| Data loss | Full backup before migration |
| Performance regression | Benchmark before/after with load testing |
| Learning curve | Team training sessions |

---

## Next Steps

1. **Review this plan** - Ensure it aligns with your goals
2. **Decide on timeline** - Can we compress to 2 weeks?
3. **Approve approach** - I'll start implementation
4. **Set up staging environment** - For safe testing

Would you like me to proceed with implementing this migration plan?
