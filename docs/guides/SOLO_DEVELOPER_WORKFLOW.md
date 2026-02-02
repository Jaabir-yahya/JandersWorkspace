# SOLO DEVELOPER COMPLETE WORKFLOW GUIDE

## 🚀 DAILY DEVELOPMENT CYCLE

### Morning Startup (2 minutes)

```bash
# 1. Terminal 1 - Full Stack
npm run dev

# 2. Terminal 2 - Database (if needed)
cd packages/database && npx prisma studio

# 3. Terminal 3 - API Testing
cd apps/api && curl localhost:3000/api/v1/health
```

**Result**: API on :3000, Admin on :3001, Perfect on :3002, DB visualizer

### Feature Development Workflow

```bash
# 1. Create new feature branch
git checkout -b feature/nairobi-voice-transactions

# 2. Work on API
cd apps/api
npm run dev:api  # Hot reload with TypeScript

# 3. Test changes
curl -X POST "localhost:3000/api/v1/transactions/quick-capture" \
  -H "Content-Type: application/json" \
  -d '{"totalAmount": 1500, "businessPurpose": "PURCHASE", "customerSegment": "SUPPLIER"}'

# 4. Update database schema (if needed)
cd packages/database
npx prisma migrate dev --name add_voice_transactions
npx prisma generate

# 5. Update frontend
cd apps/bridge-admin
npm run dev:admin  # React hot reload

# 6. Quality checks
npm run type-check
npm run test:api
npm run lint

# 7. Commit and deploy
git add .
git commit -m "feat: add voice transaction capture for Nairobi SMEs"
cd apps/api && railway up
```

## 🗂️ PROJECT STRUCTURE NAVIGATION

### Understanding the Codebase

```
├── apps/api/                    # 🔥 Backend Core (NestJS)
│   ├── src/                    # All business logic
│   │   ├── transactions/        # Money movement engine
│   │   ├── entities/           # Business relationships
│   │   ├── inventory/          # Universal catalog
│   │   ├── tags/               # Smart categorization
│   │   └── money-movements/    # Every shilling tracked
│   ├── test/                   # API tests
│   └── dist/                   # Built application
│
├── apps/bridge-admin/          # 🎨 Admin Interface (React)
│   ├── src/                    # React components
│   │   ├── components/         # UI elements
│   │   ├── pages/              # Route pages
│   │   └── services/           # API calls
│   └── public/                 # Static assets
│
├── apps/bridge-perfect/         # 📱 Mobile Interface
│   └── src/                    # Mobile-optimized components
│
├── packages/database/          # 🗄️ Data Foundation
│   ├── prisma/                 # Database schema
│   │   └── schema.prisma       # Core data models
│   ├── migrations/             # Schema evolution history
│   └── seed.ts                 # Test data generation
│
├── packages/types/             # 🏷️ Type Definitions
│   └── index.ts                # Shared TypeScript interfaces
│
└── packages/validation/        # ✅ Business Rules
    └── schemas.ts              # Zod validation schemas
```

### Navigation Shortcuts

```bash
# Jump to any package instantly
cd apps/api                    # Backend
cd apps/bridge-admin           # Admin UI
cd apps/bridge-perfect         # Mobile UI
cd packages/database          # Database
cd packages/types             # Shared types

# Start specific services
npm run dev:api               # Backend only
npm run dev:admin             # Admin only
npm run dev:all              # Everything

# Test specific packages
npm run test:api             # API tests
npm run test:admin           # Frontend tests
```

---

## Daily Workflow

### Morning Routine

1. **Check deployments** (2 minutes)

   ```bash
   # Check Railway
   curl https://jandersworkspace-production.up.railway.app/api/v1/health

   # Check Vercel (when deployed)
   curl https://janders-workspace-bridge-admin.vercel.app/
   ```

2. **Review logs** (if issues)
   - Railway Dashboard → Deployments → Logs
   - Vercel Dashboard → Deployments → Logs
   - GitHub Actions → Actions tab

3. **Pull latest changes**
   ```bash
   git pull origin main
   ```

### Development Cycle

```bash
# 1. Start services
npm run dev

# 2. Code feature
# ... edit files ...

# 3. Test locally
curl http://localhost:3000/api/v1/health

# 4. Build check (catches deployment issues)
npm run build

# 5. Commit and deploy
git add .
git commit -m "feat: description"
git push origin main

# 6. Monitor deployment
# GitHub Actions → Actions tab
```

---

## Branch Strategy (Simplified)

```
main (production)
  │
  ├── feature/new-integration (PR → main)
  ├── fix/bug-fix (PR → main)
  └── hotfix/critical (direct push if urgent)
```

### When to Branch

- **New features** - Create branch, PR when done
- **Bug fixes** - Branch from main, PR when fixed
- **Hotfixes** - Push directly to main (only if critical)

### PR Template (Mental Checklist)

```markdown
## What

Brief description

## Tested

- [ ] Local dev
- [ ] Build passes
- [ ] API tests pass

## Deploy Notes

Any special deployment considerations
```

---

## Code Organization

### By Feature, Not Layer

```
integrations/
├── mpesa/                    # Everything M-Pesa
│   ├── mpesa.service.ts
│   ├── mpesa.controller.ts
│   ├── mpesa.module.ts
│   └── dto/
├── whatsapp/                 # Everything WhatsApp
│   └── ...
└── quickbooks/               # Everything QuickBooks
    └── ...
```

### Naming Conventions

| Type        | Convention        | Example                 |
| ----------- | ----------------- | ----------------------- |
| Services    | `*.service.ts`    | `mpesa.service.ts`      |
| Controllers | `*.controller.ts` | `mpesa.controller.ts`   |
| DTOs        | `*.dto.ts`        | `stk-push.dto.ts`       |
| Tests       | `*.spec.ts`       | `mpesa.service.spec.ts` |

---

## Testing Strategy

### Unit Tests (Critical Path only)

```typescript
// Test:
// - Business logic
// - Feature flag checks
// - Input validation
// - Error handling

// Don't test:
// - Framework code
// - Database queries
// - External APIs (mock these)
```

### Integration Tests

- Run before merging to main
- Test full request/response flow
- Use test tenant (`janders-dogfood`)

### Manual Testing

```bash
# 1. Health check
curl http://localhost:3000/api/v1/health

# 2. API test
curl http://localhost:3000/api/v1/tenants/slug/janders-dogfood

# 3. Frontend test
open http://localhost:3003/janders-dogfood
```

---

## Debugging Production Issues

### 1. Check Health Endpoint

```bash
curl https://your-api.railway.app/api/v1/health
```

### 2. View Logs

```bash
# Railway
railway logs

# Or use dashboard
open https://railway.app/project/YOUR_PROJECT
```

### 3. Rollback (if needed)

```bash
# In Railway dashboard
# Deployments → Previous deployment → Redeploy

# Or in Vercel dashboard
# Deployments → Previous deployment → Promote to Production
```

### 4. Common Issues

| Issue           | Check                      |
| --------------- | -------------------------- |
| API 500 errors  | Environment variables set? |
| Database errors | Migrations run?            |
| Frontend blank  | API URL correct? CORS?     |
| Slow responses  | Database connection pool?  |

### Railway-Specific Troubleshooting

**Railway deployment not working:**

1. **Check Railway Dashboard**
   - Go to https://railway.app/dashboard
   - Verify project exists: `jandersworkspace-production`
   - Check GitHub repository is linked
   - Verify root directory is set to `apps/api`

2. **Check Environment Variables**
   - Railway Dashboard → Your Service → Variables
   - Verify all required variables are set
   - Check `DATABASE_URL` format
   - Verify `SUPABASE_SECRET_KEY` is correct

3. **Check Build Logs**
   - Railway Dashboard → Deployments → Latest deployment
   - Look for build errors
   - Check if `npm install` succeeded
   - Verify `npx prisma generate` ran successfully

4. **Test Health Endpoint**

   ```bash
   curl https://jandersworkspace-production.up.railway.app/api/v1/health
   ```

5. **Check Railway Configuration**
   - Verify `apps/api/railway.json` exists
   - Check `apps/api/Procfile` exists
   - Ensure start command is correct: `node dist/src/main`

6. **Manual Deployment**

   ```bash
   # Install Railway CLI
   npm install -g @railway/cli

   # Login
   railway login

   # Link project
   railway link

   # Deploy
   railway up --service=api
   ```

---

## Environment Management

### Local (.env)

```bash
# apps/api/.env
NODE_ENV=development
DATABASE_URL=postgresql://...
SUPABASE_SECRET_KEY=...
```

### Production (Railway)

Set in Railway dashboard → Variables:

- `NODE_ENV=production`
- `DATABASE_URL`
- `DIRECT_URL`
- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`
- `PORT=3000`
- `ALLOWED_ORIGINS=https://yourdomain.com`
- Integration credentials (optional)

**Railway URL**: `https://jandersworkspace-production.up.railway.app`

### Secrets (GitHub)

Settings → Secrets and variables:

- `RAILWAY_API_TOKEN`
- `VERCEL_TOKEN`

---

## Monitoring

### Health Checks

```bash
# Add to your monitoring (e.g., UptimeRobot)
GET https://your-api.railway.app/api/v1/health

# Expected response:
{
  "status": "healthy",
  "checks": {
    "database": true,
    "supabase": true
  }
}
```

### Alerts (Simple)

- Railway: Built-in email alerts for failures
- Vercel: Build failure notifications
- UptimeRobot: Free tier for health checks

---

## Performance Tips

### Database

```typescript
// Use select to minimize data transfer
await prisma.transaction.findMany({
  select: { id: true, amount: true },
  where: { tenantId },
});
```

### API

```typescript
// Use caching for feature flags
@Cacheable('tenant-features', 300)  // 5 minutes
async getTenantFeatures(tenantId: string) {
  // ...
}
```

### Frontend

- Use Vercel edge caching
- Lazy load heavy components
- Optimize images

---

## Backup & Recovery

### Database (Supabase)

- Daily backups included
- Point-in-time recovery available
- Export manually before major changes:
  ```bash
  pg_dump $DATABASE_URL > backup.sql
  ```

### Code

- Always on GitHub (main branch)
- Tag releases for milestones:
  ```bash
  git tag -a v1.0.0 -m "First stable release"
  git push origin v1.0.0
  ```

---

## Resources

- [Integration Development](INTEGRATION_DEVELOPMENT.md)
- [Deployment Setup](../DEPLOYMENT_SETUP.md)
- [API Reference](../reference/API.md) (Swagger at `/api/docs`)

---

**Keep it simple. Ship fast. Sleep well.**
