# RAILWAY MONOREPO DEPLOYMENT DIAGNOSIS & SOLUTIONS

## 🚨 ROOT CAUSE IDENTIFIED

### The Problem

Railway expects to build from **repository root**, but we're trying to deploy from within the `apps/api` subdirectory. The error "Could not find root directory: /apps/api" occurs because:

1. Railway clones the entire repository
2. Looks for `apps/api` as an **absolute path from git root**
3. Our monorepo structure confuses the build context
4. Docker build context gets misaligned

### Why This Happens

- **Railway Default**: Builds from repository root, not subdirectory
- **Monorepo Issue**: Dependencies in `packages/` are outside the build context
- **Path Confusion**: Railway expects `/apps/api` but finds relative paths

---

## ✅ SOLUTION 1: RAILWAY ROOT DIRECTORY SETTING

### Configure in Railway Dashboard

1. Go to Railway Dashboard → JandersWorkspace Service
2. Click **Settings** → **General**
3. Set **Root Directory** to: `apps/api`
4. **Save** and redeploy

### How This Works

- Railway clones full repo
- Changes context to `apps/api`
- Builds from that subdirectory
- But still has access to parent directories for dependencies

---

## ✅ SOLUTION 2: RESTRUCTURE FOR RAILWAY

### Move Railway Config to Repository Root

```bash
# Move from apps/api/ to root
mv apps/api/railway.json ./
mv apps/api/Dockerfile ./api-Dockerfile
```

### Update Root Railway Config

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "api-Dockerfile",
    "dockerContext": "."
  },
  "deploy": {
    "healthcheckPath": "/api/v1/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "port": 3000
  }
}
```

### Update Dockerfile for Root Build

```dockerfile
FROM node:18-alpine AS base
WORKDIR /app

# Copy entire monorepo for dependencies
COPY . .

# Build in API context
WORKDIR /app/apps/api
RUN npm ci
RUN cd ../../ && npm install
RUN cd ../.. && npm run build:api

# Runtime
FROM node:18-alpine
WORKDIR /app/apps/api
COPY --from=0 /app/apps/api/dist ./dist
COPY --from=0 /app/apps/api/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/main"]
```

---

## ✅ SOLUTION 3: SIMPLIFIED SUB-REPO APPROACH

### Create Dedicated API Repository

```bash
# Create new repository just for API
# Copy only necessary files:
# - apps/api/* → repo root
# - packages/database → database/
# - packages/types → types/

# This eliminates monorepo complexity for Railway
```

---

## ✅ SOLUTION 4: RAILWAY CLI WITH CONTEXT

### Use CLI with Explicit Context

```bash
# From repository root
railway up --service=api --dockerfile=apps/api/Dockerfile

# Or with full context
railway up \
  --service=api \
  --dockerfile=apps/api/Dockerfile \
  --context=.
```

---

## 🧪 TESTING THE SOLUTIONS

### Solution 1 Test (Recommended First)

1. Go to Railway Dashboard
2. Set Root Directory: `apps/api`
3. Deploy from GitHub (not CLI)
4. Check build logs for success

### Solution 2 Test

```bash
# Apply changes
mv apps/api/railway.json ./
mv apps/api/Dockerfile ./api-Dockerfile

# Deploy from root
railway up

# Monitor logs
railway logs
```

### Solution 3 Test (Ultimate Fallback)

```bash
# If nothing else works, simplify
git checkout -b feature/simplify-api-deployment
# ... restructure files ...
# Deploy to new Railway service
```

---

## 🔍 DIAGNOSTIC COMMANDS

### Check Railway Configuration

```bash
# Current project
railway project list
railway status

# Service variables
railway variables list

# Build logs (after deployment attempt)
railway logs
```

### Test Build Locally

```bash
# Simulate Railway build context
docker build -f apps/api/Dockerfile -t test-api .

# Test Docker container
docker run -p 3000:3000 test-api
curl localhost:3000/api/v1/health
```

---

## 📊 WHY THIS MATTERS FOR NAIROBI SME

### The Real Cost

- **Delayed Deployment**: Nairobi businesses waiting for digital tools
- **Developer Frustration**: Time wasted on infrastructure vs features
- **Innovation Blocked**: Can't ship new SME capabilities

### The Opportunity

- **Fix Once, Deploy Forever**: Get this right and scale rapidly
- **Pattern Establishment**: Use this approach for all services
- **Speed Advantage**: Deploy features while competitors debug infra

---

## 🎯 RECOMMENDED APPROACH

### Step 1: Try Railway Dashboard Root Directory

**Fastest path** - No code changes needed

### Step 2: If That Fails, Use Solution 2

**Minimal restructure** - Keep monorepo, fix Railway config

### Step 3: Ultimate Fallback - Solution 3

**Guaranteed success** - Separate repo if Railway can't handle monorepo

---

## 🚀 NEXT STEPS

1. **Test Solution 1 now** (Railway Dashboard setting)
2. **If fails, apply Solution 2**
3. **Document what worked** in this guide
4. **Deploy all services** using the winning pattern

The goal is **production deployment this hour**, not perfect architecture. Nairobi SMEs need these tools now! 🇰🇰🇰🇰
