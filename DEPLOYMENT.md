# Deployment Guide

This guide covers deploying the Project Bridge application to production environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Database Deployment](#database-deployment)
- [API Deployment](#api-deployment)
- [Web Deployment](#web-deployment)
- [Webhook Configuration](#webhook-configuration)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)
- [Verification Steps](#verification-steps)

---

## Prerequisites

- Node.js 20+ (LTS recommended)
- PostgreSQL 15+ or Supabase account
- Vercel account (for frontend)
- Railway or Render account (for backend)
- Domain name (optional, for custom domains)
- SSL certificate (for production)

---

## Environment Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd JandersWorkspace
npm install
```

### 2. Environment File Creation

Create environment files from the example:

```bash
# Root .env for local development
cp .env.example .env

# Production environment (for deployment platforms)
cp .env.example .env.production
```

### 3. Required Environment Variables

#### Minimum Required Configuration

```env
# =============================================================================
# Database Configuration (PostgreSQL via Supabase)
# =============================================================================
# Get these from your Supabase project dashboard > Settings > Database
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1
DIRECT_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# =============================================================================
# Supabase Configuration
# =============================================================================
# From Supabase project dashboard > Settings > API
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_KEY=[your-service-role-key]
SUPABASE_JWT_SECRET=[your-jwt-secret]

# =============================================================================
# Application Settings
# =============================================================================
NODE_ENV=production
PORT=3000
API_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com

# =============================================================================
# Authentication & Security
# =============================================================================
# Generate secure random strings (min 32 characters)
JWT_SECRET=[generate-a-secure-random-string-min-32-chars]
JWT_EXPIRES_IN=7d
ENCRYPTION_KEY=[32-character-encryption-key]

# =============================================================================
# API Configuration
# =============================================================================
API_PORT=3000
API_PREFIX=/api/v1

# =============================================================================
# Web Frontend Configuration
# =============================================================================
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

#### Integration Variables (Optional)

See [`.env.example`](.env.example) for complete integration configuration including:
- M-Pesa (Safaricom)
- WhatsApp Business API
- QuickBooks Online
- Xero Accounting
- Shopify

### 4. Environment Variable Groups

| Category | Variables | Purpose |
|----------|-----------|---------|
| **Database** | `DATABASE_URL`, `DIRECT_URL` | PostgreSQL connection |
| **Supabase** | `SUPABASE_URL`, `SUPABASE_*_KEY` | Auth, storage, realtime |
| **Security** | `JWT_SECRET`, `ENCRYPTION_KEY` | Authentication & encryption |
| **Integrations** | `MPESA_*`, `WHATSAPP_*`, etc. | Third-party services |
| **Monitoring** | `LOG_LEVEL`, `LOG_FORMAT` | Logging configuration |
| **Features** | `ENABLE_*` | Feature flags |

---

## Database Deployment

### Option 1: Supabase (Recommended)

1. Create a Supabase project at https://supabase.com
2. Get your database connection string from Settings > Database
3. Run migrations:

```bash
export DATABASE_URL="your-supabase-connection-string"
cd apps/api
npx prisma migrate deploy
```

4. (Optional) Seed production data:

```bash
npx prisma db seed
```

### Option 2: Self-Hosted PostgreSQL

1. Install PostgreSQL 15+ on your server
2. Create database and user:

```sql
CREATE DATABASE project_bridge;
CREATE USER bridge_user WITH ENCRYPTED PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE project_bridge TO bridge_user;
```

3. Run migrations:

```bash
export DATABASE_URL="postgresql://bridge_user:password@localhost:5432/project_bridge"
cd apps/api
npx prisma migrate deploy
```

---

## API Deployment

### Option 1: Railway (Recommended)

1. **Create Railway Account**: https://railway.app

2. **Create New Project**:
   - Connect your GitHub repository
   - Select the `apps/api` directory

3. **Configure Environment Variables**:
   - Go to Variables tab
   - Add all required variables from `.env.production`

4. **Deploy**:
   - Railway will auto-deploy on push to main
   - Or trigger manual deploy

5. **Custom Domain** (optional):
   - Go to Settings > Domains
   - Add your custom domain
   - Configure DNS as instructed

### Option 2: Render

1. **Create Render Account**: https://render.com

2. **Create New Web Service**:
   - Connect your GitHub repository
   - Root directory: `apps/api`
   - Build command: `npm install && npm run build`
   - Start command: `npm start`

3. **Configure Environment Variables**:
   - Add all variables from `.env.production`

4. **Deploy**:
   - Render will auto-deploy on push

### Option 3: Docker Deployment

1. Create `Dockerfile` in `apps/api/`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build
RUN npm run build

# Expose port
EXPOSE 3000

# Start
CMD ["node", "dist/main"]
```

2. Build and run:

```bash
cd apps/api
docker build -t project-bridge-api .
docker run -p 3000:3000 --env-file .env.production project-bridge-api
```

---

## Web Deployment

### Vercel (Recommended)

1. **Install Vercel CLI**:

```bash
npm i -g vercel
```

2. **Configure `apps/web/vercel.json`**:

```json
{
  "version": 2,
  "buildCommand": "cd ../.. && npm run build --filter=@project-bridge/web",
  "outputDirectory": "dist",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_API_URL": "@api_url"
  }
}
```

3. **Deploy**:

```bash
cd apps/web
vercel --prod
```

4. **Environment Variables**:
   - Go to Vercel Dashboard > Project Settings > Environment Variables
   - Add `NEXT_PUBLIC_API_URL` pointing to your deployed API

---

## Webhook Configuration

### M-Pesa Webhook

1. Deploy your API with a public URL
2. Configure callback URLs in Safaricom Developer Portal:
   - Validation URL: `https://api.yourdomain.com/api/v1/integrations/mpesa/webhook`
   - Confirmation URL: `https://api.yourdomain.com/api/v1/integrations/mpesa/webhook`

### WhatsApp Webhook

1. Configure webhook in Meta Developer Portal:
   - Webhook URL: `https://api.yourdomain.com/api/v1/integrations/whatsapp/webhook`
   - Verify token: Your `WHATSAPP_WEBHOOK_VERIFY_TOKEN`

### QuickBooks/Xero/Shopify Webhooks

Configure webhook URLs in respective developer portals pointing to:
- `https://api.yourdomain.com/api/v1/integrations/{service}/webhook`

---

## Monitoring

### Health Check Endpoint

```bash
curl https://api.yourdomain.com/api/v1/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-01-31T20:00:00.000Z",
  "version": "1.0.0"
}
```

### Logging

Configure logging levels via environment variables:

```env
LOG_LEVEL=info
LOG_FORMAT=json
ENABLE_REQUEST_LOGGING=true
ENABLE_QUERY_LOGGING=false
```

---

## Troubleshooting

### Common Deployment Issues

#### 1. Database Connection Errors

**Symptom**: `Error: P1001: Can't reach database server`

**Solutions**:
- Verify `DATABASE_URL` is correct
- Check if IP allowlist includes your server IP (Supabase)
- Ensure connection string uses correct format
- Try connection with `pgbouncer=true` for Supabase

```bash
# Test connection
psql "your-database-url"
```

#### 2. Prisma Migration Failures

**Symptom**: `Error: P3005: The database schema is not empty`

**Solutions**:
```bash
# Reset and re-run migrations (WARNING: data loss)
npx prisma migrate reset

# Or mark migration as applied
npx prisma migrate resolve --applied migration_name
```

#### 3. CORS Errors

**Symptom**: `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solutions**:
- Verify `FRONTEND_URL` environment variable matches your actual frontend URL
- Check CORS configuration in `apps/api/src/main.ts`
- Ensure no trailing slashes in URLs

#### 4. Environment Variables Not Loading

**Symptom**: `Error: DATABASE_URL is required`

**Solutions**:
- Verify variables are set in deployment platform
- Check variable names match exactly (case-sensitive)
- For Vercel: Prefix with `NEXT_PUBLIC_` for client-side variables only
- Restart deployment after adding variables

#### 5. Build Failures

**Symptom**: `Module not found` or `Cannot find module`

**Solutions**:
```bash
# Clean and reinstall
cd apps/api
rm -rf node_modules dist
npm install
npm run build

# For monorepo issues
cd ../..
npm run clean
npm install
npm run build
```

#### 6. Webhook Events Not Received

**Symptom**: No webhook events appearing in dashboard

**Solutions**:
- Verify webhook URL is publicly accessible
- Check webhook secret is correctly configured
- Review server logs for incoming requests
- Test webhook endpoint with curl:

```bash
curl -X POST https://api.yourdomain.com/api/v1/integrations/mpesa/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

#### 7. Memory Issues on Railway/Render

**Symptom**: `JavaScript heap out of memory`

**Solutions**:
- Increase memory allocation in platform settings
- Add to build script:
```json
{
  "scripts": {
    "build": "NODE_OPTIONS='--max-old-space-size=4096' nest build"
  }
}
```

### Getting Help

If issues persist:
1. Check application logs in deployment platform
2. Review [API Documentation](http://localhost:3000/api/docs) (when running locally)
3. Open an issue with:
   - Error message
   - Deployment platform
   - Environment variables (redact secrets)
   - Recent changes

---

## Verification Steps

After deployment, verify the following:

### 1. API Health Check

```bash
curl https://api.yourdomain.com/api/v1/health
```

### 2. Database Connection

```bash
curl https://api.yourdomain.com/api/v1/dashboard/stats
```

### 3. Frontend Loading

Visit `https://yourdomain.com` and verify:
- Dashboard loads without errors
- Data is displayed correctly
- No console errors

### 4. API Documentation

Visit `https://api.yourdomain.com/api/docs` and verify:
- Swagger UI loads
- All endpoints are documented

### 5. Webhook Testing

Send test webhook:

```bash
curl -X POST https://api.yourdomain.com/api/v1/webhooks/test \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: your-secret" \
  -d '{
    "event": "test",
    "data": {"message": "Hello from deployment test"}
  }'
```

### 6. End-to-End Test

1. Create a test transaction through the frontend
2. Verify it appears in the dashboard
3. Check webhook events are logged

---

## Production Checklist

Before going live:

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificate installed
- [ ] Custom domain configured
- [ ] Webhook URLs updated in third-party portals
- [ ] Health check endpoint responding
- [ ] Error monitoring configured (Sentry, etc.)
- [ ] Backup strategy implemented
- [ ] Documentation updated

---

## Rollback Procedure

If deployment fails:

1. **Revert to Previous Version**:
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Database Rollback** (if needed):
   ```bash
   npx prisma migrate resolve --rolled-back migration_name
   ```

3. **Verify Rollback**:
   - Check health endpoint
   - Test critical functionality
   - Review error logs

---

**Last Updated**: 2026-01-31
