# SOLO DEVELOPER DEPLOYMENT GUIDE

## 📚 Related Guides

- **📘 Comprehensive Workflow Guide**: See [`SOLO_DEVELOPER_DEPLOYMENT_WORKFLOW.md`](./SOLO_DEVELOPER_DEPLOYMENT_WORKFLOW.md) for detailed deployment workflows, troubleshooting, and best practices across all platforms (GitHub Actions, Railway, Vercel, Supabase)
- **🔧 Integration Development**: See [`INTEGRATION_DEVELOPMENT.md`](./INTEGRATION_DEVELOPMENT.md) for building new integrations

## 🎯 Core Philosophy

"I'm not just deploying code - I'm launching African SME digital infrastructure"

## 🚀 QUICK DEPLOY (30 seconds)

### Railway Production Deployment

```bash
# 1. Build locally (catch issues fast)
npm run build:api

# 2. Deploy to Railway
cd apps/api && railway up

# 3. Test deployment
curl https://jandersworkspace-production.up.railway.app/api/v1/health
```

### Local Development

```bash
# Start all services
npm run dev                    # API + Frontends + DB
npm run dev:api               # API only
npm run dev:admin             # Admin frontend only

# Database operations
cd packages/database && npx prisma studio     # Visual DB
npx prisma migrate deploy          # Deploy migrations
npx prisma db seed              # Create test data
```

## 🔧 DEPLOYMENT ARCHITECTURE

### The Problem We Solved

- **Issue**: Railway expects `/apps/api` (absolute) but monorepo has `apps/api` (relative)
- **Issue**: NIXPACKS builder struggles with NestJS + workspace dependencies
- **Issue**: No automated CI/CD for solo developer workflow

### The Solution

1. **Railway Configuration** (`railway.json` at root)
2. **Optimized Dockerfile** (for consistent builds)
3. **Local-first workflow** (test locally, deploy once)

## 📁 DEPLOYMENT FILES STRUCTURE

```
├── railway.json              # Railway config (root level)
├── apps/api/
│   ├── Dockerfile            # API container config
│   ├── Procfile              # Railway start command
│   └── .env.example          # Required env vars
├── .github/workflows/
│   ├── deploy-railway.yml    # Auto-deploy main branch
│   └── test-and-build.yml    # CI/CD pipeline
└── docs/guides/
    └── DEPLOYMENT_GUIDE.md   # This file
```

## 🛠️ RAILWAY CONFIGURATION BREAKDOWN

### Current Working Setup

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build:api",
    "watchPatterns": ["apps/api/**", "packages/**"]
  },
  "deploy": {
    "startCommand": "cd apps/api && node dist/main",
    "healthcheckPath": "/api/v1/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "port": 3000
  }
}
```

### Why This Works

- **Build from root**: npm installs workspace dependencies first
- **API-specific build**: `npm run build:api` targets only the backend
- **Smart start**: Changes to API directory before starting

## 🐳 DOCKER APPROACH (Alternative)

### Create Production Dockerfile

```dockerfile
# apps/api/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages ./packages

RUN npm ci --only=production
RUN npm run build:api

FROM node:18-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["node", "dist/main"]
```

### Railway Docker Deployment

```json
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "apps/api/Dockerfile"
  },
  "deploy": {
    "healthcheckPath": "/api/v1/health",
    "port": 3000
  }
}
```

## 🔄 CI/CD PIPELINE

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy-railway.yml
name: Deploy to Railway

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "npm"

      - name: Install and Build
        run: |
          npm ci
          npm run build:api

      - name: Deploy to Railway
        uses: railway-app/railway-action@v1
        with:
          service: JandersWorkspace
          api-token: ${{ secrets.RAILWAY_TOKEN }}
```

## 🎯 COMMON DEPLOYMENT ISSUES & SOLUTIONS

### Issue 1: "Could not find root directory: /apps/api"

**Cause**: Railway expects absolute paths in monorepo
**Solution**: Build from root, deploy from API directory

### Issue 2: "Application not found" (404 errors)

**Cause**: Health check path wrong or app not starting
**Solution**:

```bash
# Check logs
cd apps/api && railway logs

# Verify health endpoint works locally
curl localhost:3000/api/v1/health
```

### Issue 3: Build fails on dependencies

**Cause**: Workspace packages not installed
**Solution**: Ensure `npm install` runs before build

### Issue 4: Database connection errors

**Cause**: Environment variables missing
**Solution**: Check Railway variables:

```bash
cd apps/api && railway variables
```

## 🚀 DEPLOYMENT COMMANDS CHEAT SHEET

### Daily Commands

```bash
# Morning - Start fresh
npm run dev                    # Full dev environment

# Deploy changes
npm run build:api              # Verify build works
cd apps/api && railway up     # Deploy

# Test deployment
curl https://your-domain.railway.app/api/v1/health
curl -X POST "https://your-domain.railway.app/api/v1/transactions/quick-capture" \
  -H "X-Tenant-ID: test" \
  -d '{"totalAmount": 2500, "businessPurpose": "SALES"}'
```

### Troubleshooting Commands

```bash
# Check deployment status
cd apps/api && railway status

# View deployment logs
cd apps/api && railway logs

# Check environment variables
cd apps/api && railway variables

# Rebuild and redeploy
cd apps/api && railway up --force
```

## 📊 DEPLOYMENT MONITORING

### Health Checks

- **Endpoint**: `/api/v1/health`
- **Expected**: `{"status":"ok","timestamp":"..."}`
- **Timeout**: 100ms (Railway configured)

### Key Endpoints to Test

```bash
# API Health
GET /api/v1/health

# Core Functionality
POST /api/v1/transactions/quick-capture
GET /api/v1/money-movements

# Nairobi SME Features
POST /api/v1/entities (customer/supplier management)
GET /api/v1/inventory/items (stock tracking)
```

## 🎯 PRODUCTION CHECKLIST

### Before Deploying

- [ ] `npm run build:api` succeeds locally
- [ ] All tests pass: `npm run test`
- [ ] Environment variables configured in Railway
- [ ] Database migrations applied: `npx prisma migrate deploy`

### After Deploying

- [ ] Health endpoint responds
- [ ] Quick-capture transaction works
- [ ] Money movements endpoint returns data
- [ ] Railway logs show no errors

## 🔒 SECURITY CONFIGURATION

### Required Environment Variables

```bash
DATABASE_URL=postgresql://...          # Supabase connection
JWT_SECRET=your-secret-key             # JWT signing
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=your-supabase-secret
NODE_ENV=production
```

### Railway Security Settings

- **Port**: 3000 (configured in railway.json)
- **Health Check**: `/api/v1/health`
- **Restart Policy**: ON_FAILURE
- **Origins**: Your frontend domains

## 📚 NEXT STEPS

1. **Frontend Deployment**: Deploy bridge-admin to Vercel
2. **Domain Setup**: Configure custom domains
3. **Monitoring**: Set up Railway alerts
4. **Backup**: Configure database backups
5. **Scaling**: Set up Railway scaling rules

---

## 🏆 YOUR DEPLOYMENT SUPERPOWERS

✅ **30-Second Deployments**: One command from API directory
✅ **Local-First Testing**: Catch issues before they hit production  
✅ **Automated CI/CD**: GitHub Actions handle main branch deployments
✅ **Monorepo Support**: Railway + Turborepo working perfectly
✅ **Nairobi Ready**: Production API serving African SMEs immediately

You are now equipped to deploy and scale the Nairobi SME Digital Transformation platform! 🇰🇰🇰🇰
