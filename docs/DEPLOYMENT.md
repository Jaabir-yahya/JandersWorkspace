# Deployment Guide

This guide covers deploying the African Informal Economy Ledger (Project Bridge) to production.

## Prerequisites

- Node.js 20.11.0+ (see `.nvmrc`)
- npm 9.0.0+
- Supabase project with PostgreSQL
- (Optional) ngrok account for tunneling

## Environment Setup

### 1. API Environment (`api/.env`)

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# Application
NODE_ENV=production
PORT=3000
```

### 2. Web Environment (`web/my-app/.env.local`)

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Deployment Steps

### Option 1: Local Production Build

```bash
# 1. Install dependencies
npm run setup

# 2. Build all services
npm run build

# 3. Start API (in production mode)
cd api && npm run start:prod

# 4. Start Web (in another terminal)
cd web/my-app && npm run start
```

### Option 2: Docker Deployment

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Option 3: ngrok for External Access

```bash
# 1. Install ngrok
npm install -g ngrok

# 2. Configure ngrok (optional)
# Edit ngrok.yml with your authtoken

# 3. Start tunnel
npm run tunnel

# 4. Update web/.env.local with ngrok URL
NEXT_PUBLIC_API_URL=https://your-ngrok-url.ngrok-free.app
```

## Database Migrations

### Apply Migrations

```bash
# Using Supabase CLI
supabase db push

# Or manually via SQL Editor
# Run files in db/migrations/ and supabase/migrations/
```

### Verify Database Schema

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'txn';

-- Check functions exist
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'txn';
```

## Health Checks

### API Health Check

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-01-31T11:00:00.000Z"
}
```

### Full System Check

```bash
npm run health-check
```

## Verification

After deployment, verify:

1. **API Endpoints**
   ```bash
   curl http://localhost:3000/api/v1/transactions?tenant_id=00000000-0000-0000-0000-000000000000
   ```

2. **Web Dashboard**
   - Open http://localhost:3001/dashboard
   - Verify transactions load
   - Test search functionality

3. **Database Connection**
   ```bash
   cd api && npm run test:db:connection
   ```

## Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] API health check passes
- [ ] Web dashboard loads
- [ ] Transaction creation works
- [ ] Search functionality works
- [ ] File uploads work (if using attachments)
- [ ] Logging configured
- [ ] Error monitoring enabled
- [ ] SSL/TLS configured (for public deployments)

## Troubleshooting

### API Won't Start

```bash
# Check logs
cat /tmp/api.log

# Verify environment
cat api/.env | grep -v KEY

# Test database connection
cd api && node -e "require('./dist/supabase/supabase.service').SupabaseService"
```

### Web Won't Build

```bash
# Clear Next.js cache
cd web/my-app && rm -rf .next

# Rebuild
npm run build
```

### Database Connection Issues

```bash
# Verify Supabase URL is reachable
curl $SUPABASE_URL/rest/v1/

# Check service key permissions
```

## Rollback Procedure

If deployment fails:

1. Stop services: `pkill -f "node"` or `docker-compose down`
2. Restore previous git tag: `git checkout v1.0.0-phase2`
3. Rebuild: `npm run build`
4. Restart services

## Support

- Check [CONTRIBUTING.md](../CONTRIBUTING.md) for development workflow
- Review [CHANGELOG.md](../CHANGELOG.md) for version history
- See [API_CONTRACT.md](./API_CONTRACT.md) for API details
