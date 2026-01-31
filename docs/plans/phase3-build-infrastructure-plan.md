# Phase 3 Build Infrastructure Plan

## Objective
Lock Phase 3 while simultaneously setting up production-ready build infrastructure.

## Execution Order

### Phase A: Fix & Verify (Prerequisites)
1. **Fix G-010: SKU Search** - Complete the missing search functionality
2. **Verify all tests pass** - Ensure system is stable

### Phase B: Build Infrastructure (Parallelizable)
3. **Root package.json scripts** - One-command development
4. **Environment templates** - Consistent configuration
5. **ngrok setup** - External access for testing
6. **Integration tests** - Automated verification

### Phase C: Lock Phase 3
7. **Git tag & documentation** - Mark stable state
8. **Deployment checklist** - Production readiness

---

## Phase A: Fix & Verify

### Task 1: Fix G-010 SKU Search

**File:** [`api/src/transactions/transactions.service.ts`](api/src/transactions/transactions.service.ts:241)

**Current search** looks at:
- `entities.display_name`
- `transactions.reference`
- `transaction_lines.description`

**Missing:** `transaction_lines.sku`

**Implementation approach:**
Add SKU search query that joins with transaction_lines table:

```typescript
// In searchTransactions method
// 1. Search by SKU in transaction_lines
const { data: skuMatches } = await this.supabase
  .from('transaction_lines')
  .select('transaction_id')
  .ilike('sku', `%${searchTerm}%`);

const transactionIdsFromSku = skuMatches?.map(l => l.transaction_id) || [];

// 2. Include in final query OR clause
// Combine with existing entity/reference/description search
```

---

## Phase B: Build Infrastructure

### Task 2: Root Package.json Scripts

Create unified commands at workspace root:

```json
{
  "name": "project-bridge",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "concurrently \"npm:dev:api\" \"npm:dev:web\"",
    "dev:api": "cd api && npm run start:dev",
    "dev:web": "cd web/my-app && npm run dev",
    "build": "npm run build:api && npm run build:web",
    "build:api": "cd api && npm run build",
    "build:web": "cd web/my-app && npm run build",
    "test": "npm run test:api && npm run test:web",
    "test:api": "cd api && npm run test",
    "test:web": "cd web/my-app && npm test",
    "test:integration": "jest --runInBand tests/integration/",
    "lint": "cd api && npm run lint && cd ../web/my-app && npm run lint",
    "setup": "npm install && cd api && npm install && cd ../web/my-app && npm install",
    "tunnel": "ngrok http 3001",
    "tunnel:api": "ngrok http 3000"
  },
  "devDependencies": {
    "concurrently": "^8.2.0"
  }
}
```

**Benefits:**
- `npm run dev` starts both API and web
- `npm run build` builds everything
- `npm run tunnel` exposes web via ngrok

---

### Task 3: Environment Configuration Templates

Create template files for consistent setup:

**File:** `api/.env.example`
```bash
# Supabase
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# API
PORT=3000
NODE_ENV=development

# Optional: External services
# REDIS_URL=
# SENTRY_DSN=
```

**File:** `web/my-app/.env.example`
```bash
# API
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
API_URL=http://localhost:3000/api/v1

# Supabase (for client-side auth if needed)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# App
NEXT_PUBLIC_APP_NAME=Project Bridge
NEXT_PUBLIC_DEFAULT_TENANT_ID=00000000-0000-0000-0000-000000000000
```

**Setup script:** `scripts/setup-env.sh`
```bash
#!/bin/bash
echo "Setting up environment files..."

cp api/.env.example api/.env
cp web/my-app/.env.example web/my-app/.env.local

echo "Environment files created."
echo "Please update the values in:"
echo "  - api/.env"
echo "  - web/my-app/.env.local"
```

---

### Task 4: ngrok Setup for External Testing

**Why ngrok:**
- Share development environment with stakeholders
- Test webhooks
- Mobile app testing
- Client demos

**Configuration:** `ngrok.yml`
```yaml
version: 2
authtoken: YOUR_NGROK_AUTH_TOKEN

# Optional: Custom domain (paid plan)
# hostname: your-domain.ngrok.io

tunnels:
  web:
    proto: http
    addr: 3001
    subdomain: project-bridge-web
  api:
    proto: http
    addr: 3000
    subdomain: project-bridge-api
```

**Scripts:** Add to root package.json
```json
{
  "scripts": {
    "tunnel": "ngrok start web",
    "tunnel:api": "ngrok start api",
    "tunnel:all": "ngrok start web api"
  }
}
```

**Usage:**
```bash
# Terminal 1: Start dev servers
npm run dev

# Terminal 2: Expose to internet
npm run tunnel
# Outputs: https://xxxx.ngrok.io -> http://localhost:3001
```

---

### Task 5: Integration Test Suite

Create automated tests to verify system health:

**File:** `tests/integration/health.test.js`
```javascript
describe('Phase 3 System Health', () => {
  test('API is running', async () => {
    const res = await fetch('http://localhost:3000/api/v1/entities');
    expect(res.status).toBe(200);
  });

  test('Web is running', async () => {
    const res = await fetch('http://localhost:3001');
    expect(res.status).toBe(200);
  });

  test('Can create transaction', async () => {
    // Test transaction creation
  });

  test('Can search by SKU', async () => {
    // Test G-010 fix
  });
});
```

**Test runner:** Add to root package.json
```json
{
  "scripts": {
    "test:integration": "jest tests/integration/",
    "test:e2e": "playwright test"
  }
}
```

---

## Phase C: Lock Phase 3

### Task 6: Git Tag & Documentation

**Steps:**
1. Commit all changes
2. Create annotated tag
3. Generate lock documentation
4. Archive planning docs

**Commands:**
```bash
# Commit
git add .
git commit -m "feat: Phase 3 complete with build infrastructure

- Fix G-010: SKU search functionality
- Add root-level orchestration scripts
- Setup ngrok tunneling
- Environment configuration templates
- Integration test suite

Ready for production."

# Tag
git tag -a phase-3-lock -m "Phase 3 Locked: African Informal Economy Ledger

Features:
- Complete transaction state machine
- Three Majors support (RETAIL, SERVICE, RENTAL)
- Entity management with 360° view
- Split payments (CASH, M-PESA, BANK, CARD)
- File attachments
- Universal Invoice export
- Build infrastructure & ngrok support

Status: Production Ready"
```

---

### Task 7: Deployment Checklist

**File:** `docs/DEPLOYMENT_CHECKLIST.md`

```markdown
# Phase 3 Deployment Checklist

## Pre-Deployment
- [ ] All tests pass (`npm test`)
- [ ] Integration tests pass (`npm run test:integration`)
- [ ] Build succeeds (`npm run build`)
- [ ] Environment variables configured
- [ ] Database migrations applied

## Deployment Steps
1. Deploy API to hosting (Railway, Render, etc.)
2. Deploy Web to Vercel/Netlify
3. Configure CORS for production domains
4. Set up monitoring (optional)
5. Configure backups

## Post-Deployment
- [ ] Health check endpoints respond
- [ ] Can create transactions
- [ ] Can search by SKU
- [ ] File uploads work
- [ ] All 5 frontend pages load
```

---

## Summary Timeline

| Task | Effort | Dependencies |
|------|--------|--------------|
| Fix G-010 SKU search | 1 hour | None |
| Root package.json | 30 min | None |
| Environment templates | 30 min | None |
| ngrok setup | 30 min | None |
| Integration tests | 2 hours | G-010 fix |
| Git tag & lock | 30 min | All above |
| **Total** | **~5 hours** | |

---

## Next Steps

Would you like me to:
1. **Start implementing** - Fix G-010 and create the build infrastructure?
2. **Switch to Code mode** to execute the plan?
3. **Focus on specific tasks** first (e.g., just the root scripts)?
