# Deployment Setup Guide

This guide covers the complete deployment setup for the Project Bridge monorepo, including Railway (backend), Vercel (frontend), and GitHub Actions automation.

## Overview

- **Backend (API)**: Railway
- **Frontend**: Vercel
- **Database**: Supabase PostgreSQL
- **CI/CD**: GitHub Actions

## Prerequisites

1. Railway account: https://railway.app
2. Vercel account: https://vercel.com
3. GitHub repository connected to both platforms
4. Supabase project configured

## 1. Railway Backend Deployment

### 1.1 Create Railway Project

1. Go to https://railway.app/dashboard
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. **Important**: Set the root directory to `apps/api`

### 1.2 Configure Environment Variables

In Railway Dashboard → Your Service → Variables, add:

```bash
# Database (from Supabase)
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# Supabase
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]

# API
NODE_ENV=production
PORT=3000

# Optional: CORS origins
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
```

### 1.3 Railway Configuration

The [`railway.json`](apps/api/railway.json) is already configured:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npx prisma generate && npm run build"
  },
  "deploy": {
    "startCommand": "npx prisma migrate deploy && node dist/src/main",
    "healthcheckPath": "/api/v1/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 1.4 GitHub Actions for Railway

The workflow is at [`.github/workflows/deploy-api.yml`](.github/workflows/deploy-api.yml).

**Required GitHub Secrets:**
- `RAILWAY_API_TOKEN`: Get from Railway Dashboard → Account Settings → Tokens

**Required GitHub Variables:**
- `RAILWAY_SERVICE_NAME`: Your Railway service name (default: "api")

## 2. Vercel Frontend Deployment

### 2.1 Create Vercel Projects

Create two projects:
1. **bridge-admin**: Admin dashboard
2. **bridge-manual**: Manual entry app

### 2.2 Configure Environment Variables

For each project in Vercel Dashboard → Settings → Environment Variables:

```bash
NEXT_PUBLIC_API_URL=https://your-railway-app.up.railway.app/api/v1
```

### 2.3 GitHub Actions for Vercel

The workflow is at [`.github/workflows/deploy-vercel.yml`](.github/workflows/deploy-vercel.yml).

**Required GitHub Secrets:**
- `VERCEL_TOKEN`: Get from Vercel Dashboard → Settings → Tokens

**Required GitHub Variables:**
- `VERCEL_ORG_ID`: Your Vercel organization ID
- `VERCEL_ADMIN_PROJECT_ID`: Project ID for bridge-admin
- `VERCEL_MANUAL_PROJECT_ID`: Project ID for bridge-manual

**Get Vercel IDs:**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project (run in app directory)
cd apps/bridge-admin
vercel link

# Get IDs from .vercel/project.json
cat .vercel/project.json
```

## 3. MCP Servers for Monitoring

Two MCP servers are configured for deployment monitoring:

### 3.1 Vercel MCP Server

**Location:** `/Users/jaabirahmed/Documents/Kilo-Code/MCP/vercel-server`

**Tools:**
- `list_projects`: List all Vercel projects
- `get_project`: Get project details
- `list_deployments`: List deployments for a project
- `get_deployment`: Get deployment details
- `get_deployment_logs`: View deployment logs
- `check_deployment_status`: Check deployment status
- `get_latest_production_deployment`: Get latest production deployment

### 3.2 Railway MCP Server

**Location:** `/Users/jaabirahmed/Documents/Kilo-Code/MCP/railway-server`

**Tools:**
- `list_projects`: List all Railway projects
- `get_project`: Get project details
- `list_deployments`: List deployments for a service
- `get_deployment`: Get deployment details
- `get_deployment_logs`: View deployment logs
- `check_deployment_status`: Check deployment status
- `get_latest_deployment`: Get latest deployment for a service

## 4. Monorepo Structure

```
project-bridge/
├── apps/
│   ├── api/                 # Railway backend
│   ├── bridge-admin/        # Vercel frontend
│   └── bridge-manual/       # Vercel frontend
├── packages/
│   ├── database/            # Shared Prisma client
│   └── types/               # Shared TypeScript types
├── .github/workflows/
│   ├── deploy-api.yml       # Railway deployment
│   ├── deploy-vercel.yml    # Vercel deployment
│   └── ci.yml               # CI checks
└── turbo.json               # Turborepo config
```

## 5. Deployment Workflow

### 5.1 Automatic Deployments

1. **Push to main branch**
   - API changes → Railway deployment
   - Frontend changes → Vercel deployment

2. **Database Migrations**
   - Run automatically during Railway deployment
   - Uses `prisma migrate deploy`

### 5.2 Manual Deployments

Trigger from GitHub Actions tab:
- Select workflow
- Click "Run workflow"

## 6. Troubleshooting

### Railway Issues

**"Could not find root directory: /apps/api"**
- Solution: Set root directory to `apps/api` in Railway dashboard

**Build failures**
- Check Railway build logs
- Verify environment variables are set
- Ensure `railway.json` is correct

**Database connection errors**
- Verify `DATABASE_URL` format
- Check Supabase connection settings
- Ensure IP allowlist includes Railway

### Vercel Issues

**Build failures**
- Check Vercel build logs
- Verify `NEXT_PUBLIC_API_URL` is set
- Check for TypeScript errors

**API connection errors**
- Verify API URL is correct
- Check CORS settings on backend
- Ensure Railway service is running

### GitHub Actions Issues

**Authentication errors**
- Verify `RAILWAY_API_TOKEN` secret
- Verify `VERCEL_TOKEN` secret
- Check token permissions

**Build failures in CI**
- Check Node.js version (should be 20)
- Verify `package-lock.json` is committed
- Check for missing environment variables

## 7. Environment Variables Summary

### GitHub Secrets
```
RAILWAY_API_TOKEN=your-railway-token
VERCEL_TOKEN=your-vercel-token
```

### GitHub Variables
```
RAILWAY_SERVICE_NAME=api
VERCEL_ORG_ID=your-org-id
VERCEL_ADMIN_PROJECT_ID=prj_xxx
VERCEL_MANUAL_PROJECT_ID=prj_xxx
NEXT_PUBLIC_API_URL=https://your-api.up.railway.app/api/v1
```

### Railway Variables
```
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NODE_ENV=production
PORT=3000
```

### Vercel Variables
```
NEXT_PUBLIC_API_URL=https://your-api.up.railway.app/api/v1
```

## 8. Quick Commands

```bash
# Local development
npm run dev:api      # Start API
npm run dev:web      # Start web apps

# Database
npm run deploy:db    # Deploy migrations

# Manual deployment
# Use GitHub Actions tab or push to main
```

## 9. Health Checks

- **API Health**: `GET /api/v1/health`
- **Railway Health**: Configured in `railway.json`
- **Vercel Health**: Automatic via Vercel dashboard

## 10. Support

- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- GitHub Actions Docs: https://docs.github.com/en/actions
