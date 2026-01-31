# Production Readiness Plan - Project Bridge

## Executive Summary

This plan addresses all critical blockers and high-priority gaps to get Project Bridge production-ready. Based on comprehensive analysis, the project has a solid foundation (85% complete) but needs specific infrastructure components before launch.

---

## Critical Blockers (Must Fix Before Launch)

### 1. Monorepo Build Issues 🔴
**Problem**: Multiple package-lock.json files causing Next.js conflicts
**Impact**: Build failures, dependency mismatches
**Solution**:
```bash
# Remove all package-lock.json files
find . -name "package-lock.json" -delete

# Clean install from root
npm install

# Verify workspace symlinks
npm run build --workspaces
```

**Files to Check**:
- Root `package.json` workspace configuration
- `apps/api/package.json` - Remove duplicate dependencies
- `apps/web/package.json` - Ensure Next.js version consistency
- `packages/database/package.json` - Check Prisma client versions

---

### 2. Missing Database Migrations 🔴
**Problem**: No migration files exist for database setup
**Impact**: Cannot recreate database schema in production
**Solution**:

Create initial migration:
```bash
cd packages/database
npx prisma migrate dev --name init
```

**Required Schema Additions**:
```prisma
// Add to schema.prisma

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
  integrations  TenantIntegration[]
  webhooks      WebhookConfig[]
}

model TenantIntegration {
  id                String    @id @default(uuid()) @db.Uuid
  tenantId          String    @db.Uuid
  integrationType   String    // MPESA, WHATSAPP, QUICKBOOKS
  encryptedConfig   Json      // API keys encrypted at rest
  isActive          Boolean   @default(true)
  lastSyncAt        DateTime?
  syncStatus        String    @default("ACTIVE")
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  tenant            Tenant    @relation(fields: [tenantId], references: [id])
  
  @@unique([tenantId, integrationType])
  @@map("tenant_integrations")
}

model WebhookEvent {
  id              String    @id @default(uuid()) @db.Uuid
  tenantId        String    @db.Uuid
  integrationType String
  eventType       String
  payload         Json
  processed       Boolean   @default(false)
  retryCount      Int       @default(0)
  errorMessage    String?
  createdAt       DateTime  @default(now())
  processedAt     DateTime?
  
  @@index([tenantId, processed])
  @@index([createdAt])
  @@map("webhook_events")
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
  
  @@map("feature_flags")
}
```

---

### 3. No Authentication System 🔴
**Problem**: Hardcoded user IDs, no JWT/session management
**Impact**: Security vulnerability, no user access control
**Solution**:

Implement Supabase Auth:

```typescript
// apps/api/src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { SupabaseAuthStrategy } from './supabase-auth.strategy';
import { AuthGuard } from './auth.guard';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'supabase' })],
  providers: [SupabaseAuthStrategy, AuthGuard],
  exports: [AuthGuard],
})
export class AuthModule {}
```

```typescript
// apps/api/src/auth/supabase-auth.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseAuthStrategy extends PassportStrategy(Strategy, 'supabase') {
  private supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY
  );

  async validate(token: string) {
    const { data: { user }, error } = await this.supabase.auth.getUser(token);
    
    if (error || !user) {
      throw new UnauthorizedException();
    }
    
    return {
      userId: user.id,
      email: user.email,
      tenantId: user.user_metadata.tenant_id,
    };
  }
}
```

**Update Controllers**:
```typescript
// apps/api/src/transactions/transactions.controller.ts
@Controller('transactions')
@UseGuards(AuthGuard)
export class TransactionsController {
  @Get()
  findAll(
    @CurrentUser() user: UserContext,
    @Query() filters: TransactionFilters
  ) {
    // Now user.tenantId is guaranteed from auth token
    return this.transactionsService.findAll(user.tenantId, filters);
  }
}
```

---

### 4. Security Issues - Hardcoded Credentials 🔴
**Problem**: Database credentials in .env file
**Impact**: Security risk if .env is committed
**Solution**:

1. **Rotate credentials immediately**
2. **Use environment-specific configs**:
```bash
# .env.local (never commit)
# .env.development
# .env.production (use secrets manager)
```

3. **Add to .gitignore**:
```
.env
.env.local
.env.*.local
*.pem
*.key
```

4. **Use Supabase Vault for secrets**:
```sql
-- Store integration credentials encrypted
select vault.create_secret(
  'mpesa_consumer_key',
  'tenant_123_mpesa_key'
);
```

---

## High Priority Gaps

### 5. Missing Webhook Infrastructure 🟡
**Implementation**:

```typescript
// apps/api/src/webhooks/webhook.service.ts
@Injectable()
export class WebhookService {
  async processWebhook(event: WebhookEvent) {
    // Store event
    await this.prisma.webhookEvent.create({
      data: {
        tenantId: event.tenantId,
        integrationType: event.type,
        eventType: event.eventType,
        payload: event.payload,
      }
    });
    
    // Process async
    await this.webhookQueue.add('process', event);
  }
  
  async deliverWebhook(config: WebhookConfig, payload: any) {
    const signature = this.generateSignature(payload, config.secret);
    
    try {
      await fetch(config.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
        },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      // Retry logic
      await this.scheduleRetry(config, payload);
    }
  }
}
```

---

### 6. No Real-time Features 🟡
**Solution**: Add WebSocket support for live updates

```typescript
// apps/api/src/realtime/realtime.gateway.ts
@WebSocketGateway({
  cors: { origin: process.env.FRONTEND_URL },
})
export class RealtimeGateway implements OnGatewayConnection {
  @UseGuards(WsAuthGuard)
  handleConnection(client: Socket) {
    const tenantId = client.user.tenantId;
    client.join(`tenant:${tenantId}`);
  }
  
  notifyTransactionUpdate(tenantId: string, transaction: any) {
    this.server.to(`tenant:${tenantId}`).emit('transaction:updated', transaction);
  }
}
```

---

### 7. Testing Gaps 🟡
**Setup**:

```typescript
// Test configuration
// apps/api/test/transaction.e2e-spec.ts
describe('Transactions (e2e)', () => {
  it('should not allow cross-tenant access', async () => {
    const tenantA = await createTestTenant();
    const tenantB = await createTestTenant();
    
    const transaction = await createTransaction(tenantA.id);
    
    await request(app)
      .get(`/transactions/${transaction.id}`)
      .set('Authorization', `Bearer ${tenantB.token}`)
      .expect(403);
  });
});
```

---

### 8. Deployment Infrastructure 🟡

**Docker Setup**:
```dockerfile
# Dockerfile.api
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["node", "dist/main"]
```

**docker-compose.yml**:
```yaml
version: '3.8'
services:
  api:
    build:
      context: .
      dockerfile: Dockerfile.api
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - SUPABASE_URL=${SUPABASE_URL}
    ports:
      - "3000:3000"
  
  web:
    build:
      context: .
      dockerfile: Dockerfile.web
    ports:
      - "3001:3000"
    depends_on:
      - api
```

---

## Medium Priority

### 9. Monitoring & Logging
```typescript
// Add structured logging
import { Logger } from 'nestjs-pino';

// Add health checks
@Controller('health')
export class HealthController {
  @Get()
  async check() {
    return {
      database: await this.prisma.$queryRaw`SELECT 1`,
      supabase: await this.checkSupabase(),
      timestamp: new Date().toISOString(),
    };
  }
}
```

### 10. API Documentation
```typescript
// Add Swagger
const config = new DocumentBuilder()
  .setTitle('Project Bridge API')
  .setVersion('1.0')
  .addBearerAuth()
  .build();
```

### 11. Rate Limiting & Caching
```typescript
// Rate limiting
@UseGuards(ThrottlerGuard)
@Throttle(100, 60) // 100 requests per minute

// Redis caching
@UseInterceptors(CacheInterceptor)
@CacheTTL(300) // 5 minutes
```

---

## Implementation Timeline

### Week 1: Critical Blockers
- [ ] Fix monorepo build issues
- [ ] Create database migrations
- [ ] Implement Supabase Auth
- [ ] Rotate hardcoded credentials

### Week 2: Core Infrastructure
- [ ] Add webhook infrastructure
- [ ] Implement real-time features
- [ ] Set up testing framework
- [ ] Create Docker configuration

### Week 3: Polish & Deploy
- [ ] Add monitoring/logging
- [ ] Create API documentation
- [ ] Implement rate limiting
- [ ] Production deployment

---

## Success Criteria

- [ ] All tests passing
- [ ] Security audit passed
- [ ] Load testing completed
- [ ] Documentation complete
- [ ] Production deployment successful
