# Solo Developer Deployment Guide

## Overview

This guide provides best practices and workflows for managing deployments across GitHub Actions, Railway, Vercel, and Supabase as a solo developer.

## Architecture Overview

```
┌─────────────────┐
│   GitHub Repo   │
│  (Source Code)  │
└────────┬────────┘
         │
         ├───► GitHub Actions (CI/CD)
         │         │
         │         ├───► Railway (API Backend)
         │         │         └───► Supabase (Database)
         │         │
         │         └───► Vercel (Frontend Apps)
         │                   ├───► bridge-admin
         │                   └───► bridge-manual
         │
         └───► Local Development
                   └───► Docker Compose
```

## Quick Reference: Deployment Commands

### GitHub Actions (Automated)
```bash
# Trigger deployment by pushing to main
git add .
git commit -m "feat: your changes"
git push origin main

# Manually trigger workflows
# Go to: GitHub → Actions → Select workflow → Run workflow
```

### Railway (Manual API Deployment)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy API
railway up

# View logs
railway logs

# Open in browser
railway open
```

### Vercel (Manual Frontend Deployment)
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy preview
vercel

# Deploy to production
vercel --prod
```

### Supabase (Database Management)
```bash
# Start local Supabase
./start-supabase.sh

# Run migrations
cd packages/database
npx prisma migrate dev

# Seed database
npx prisma db seed

# Open Prisma Studio
npx prisma studio
```

## Recommended Workflow for Solo Developers

### 1. Development Phase

```bash
# Start local development environment
./start-supabase.sh  # Start Supabase locally
npm run dev          # Start API and frontend apps

# Make changes to code
# Test locally with hot reload
```

### 2. Testing Phase

```bash
# Run tests
npm test

# Type check
npm run type-check

# Lint
npm run lint

# Build locally to catch errors
npm run build
```

### 3. Deployment Phase

```bash
# Commit and push (triggers GitHub Actions)
git add .
git commit -m "feat: your feature description"
git push origin main

# Monitor deployment
# Go to: GitHub → Actions → Watch workflow run
```

### 4. Verification Phase

```bash
# Check Railway deployment
railway status
railway logs

# Check Vercel deployment
# Go to: vercel.com → Your project → Deployments

# Test production endpoints
curl https://your-api.railway.app/api/v1/health
```

## GitHub Actions Best Practices

### Workflow Triggers

Your workflows are configured to run automatically:

- **On push to main**: All deployment workflows run
- **On pull request**: CI tests run
- **Manual trigger**: Use workflow_dispatch for on-demand deployments

### Monitoring Workflows

```bash
# View workflow runs via CLI (requires gh CLI)
gh run list

# View specific run
gh run view <run-id>

# Watch logs in real-time
gh run watch
```

### Common Workflow Issues

#### Issue: Secrets not found
**Solution**: Check that secrets are configured in GitHub
```bash
# List secrets via CLI
gh secret list

# Add missing secret
gh secret set SECRET_NAME
```

#### Issue: Build failures
**Solution**: Check build logs for specific errors
```bash
# View failed workflow
gh run view <run-id> --log-failed
```

#### Issue: Deployment timeout
**Solution**: Increase timeout in workflow or check service health
```yaml
# Example: Add timeout step
- name: Wait for deployment
  run: |
    timeout 300 bash -c 'until curl -f $HEALTH_URL; do sleep 10; done'
```

## Railway Best Practices

### Project Structure

```
Railway Project: JandersWorkspace
├── Service: API (NestJS)
│   ├── Environment Variables
│   ├── Build Command
│   └── Start Command
└── Service: Database (PostgreSQL)
    ├── Connection URL
    └── Migrations
```

### Environment Variables Management

```bash
# Set environment variables via CLI
railway variables set DATABASE_URL="postgresql://..."
railway variables set JWT_SECRET="your-secret"
railway variables set NODE_ENV="production"

# View all variables
railway variables

# Remove variable
railway variables unset VARIABLE_NAME
```

### Monitoring and Debugging

```bash
# View real-time logs
railway logs --tail

# View specific service logs
railway logs --service api

# View deployment history
railway status

# Restart service
railway up --service api
```

### Database Migrations on Railway

```bash
# Run migrations on Railway
railway run npx prisma migrate deploy

# Seed database on Railway
railway run npx prisma db seed

# Open database shell
railway run psql $DATABASE_URL
```

## Vercel Best Practices

### Project Management

```bash
# List all projects
vercel list

# Link local project to Vercel
vercel link

# View project details
vercel inspect
```

### Environment Variables

```bash
# Set environment variable
vercel env add NEXT_PUBLIC_API_URL production

# List all environment variables
vercel env ls

# Remove environment variable
vercel env rm NEXT_PUBLIC_API_URL production
```

### Deployment Strategies

```bash
# Preview deployment (for testing)
vercel

# Production deployment
vercel --prod

# Deploy specific directory
vercel --prod apps/bridge-admin
```

### Custom Domains

```bash
# Add custom domain
vercel domains add yourdomain.com

# List domains
vercel domains ls
```

## Supabase Best Practices

### Local Development

```bash
# Start Supabase locally
./start-supabase.sh

# Access Supabase Dashboard
# Open: http://localhost:54323

# Access Prisma Studio
npx prisma studio
```

### Database Migrations

```bash
# Create new migration
cd packages/database
npx prisma migrate dev --name your_migration_name

# Reset database (development only)
npx prisma migrate reset

# Generate Prisma Client
npx prisma generate
```

### Production Database

```bash
# Apply migrations to production
npx prisma migrate deploy

# Seed production database
npx prisma db seed

# Pull database schema from production
npx prisma db pull
```

### Backup and Restore

```bash
# Backup database
pg_dump $DATABASE_URL > backup.sql

# Restore database
psql $DATABASE_URL < backup.sql

# Via Supabase Dashboard
# Go to: Database → Backups → Create backup
```

## Troubleshooting Guide

### Common Issues and Solutions

#### 1. GitHub Actions Failures

**Issue**: Workflow fails with "secret not found"
```bash
# Check secrets exist
gh secret list

# Add missing secret
gh secret set RAILWAY_APITOKEN
```

**Issue**: Build fails with "module not found"
```bash
# Clear cache and rebuild
# In workflow, add:
- name: Clear cache
  run: rm -rf node_modules package-lock.json
- name: Reinstall dependencies
  run: npm ci
```

#### 2. Railway Deployment Issues

**Issue**: Service crashes on startup
```bash
# View logs
railway logs

# Common causes:
# - Missing environment variables
# - Database connection issues
# - Port conflicts
```

**Issue**: Database connection refused
```bash
# Check DATABASE_URL format
railway variables

# Test connection
railway run node -e "console.log(process.env.DATABASE_URL)"
```

#### 3. Vercel Deployment Issues

**Issue**: Build fails with "environment variable not set"
```bash
# Check environment variables
vercel env ls

# Add missing variable
vercel env add VARIABLE_NAME production
```

**Issue**: Deployment succeeds but app doesn't work
```bash
# Check build output
vercel logs <deployment-url>

# Verify API URL is correct
vercel env ls NEXT_PUBLIC_API_URL
```

#### 4. Supabase Issues

**Issue**: Migration fails
```bash
# Check migration status
npx prisma migrate status

# Resolve conflicts
npx prisma migrate resolve --applied migration_name
```

**Issue**: Prisma Client outdated
```bash
# Regenerate client
npx prisma generate
```

## Monitoring and Observability

### Health Checks

```bash
# API Health Check
curl https://your-api.railway.app/api/v1/health

# Expected response:
# {"status":"ok","timestamp":"2024-01-01T00:00:00.000Z"}
```

### Log Aggregation

```bash
# Railway logs
railway logs --tail

# Vercel logs
vercel logs --follow

# GitHub Actions logs
gh run view <run-id> --log
```

### Performance Monitoring

```bash
# Check Railway metrics
railway status

# Check Vercel analytics
# Go to: vercel.com → Your project → Analytics

# Database performance
# Go to: Supabase Dashboard → Database → Performance
```

## Security Best Practices

### Secret Management

```bash
# Never commit secrets to git
# Use .gitignore for .env files

# Store secrets in GitHub
gh secret set SECRET_NAME

# Rotate secrets regularly
# Update in GitHub, Railway, Vercel, and Supabase
```

### Environment Variables

```bash
# Use different variables for each environment
# - development
# - staging
# - production

# Validate required variables on startup
# Add to your application:
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}
```

### Access Control

```bash
# Limit GitHub Actions permissions
# In workflow YAML:
permissions:
  contents: read
  deployments: write

# Use least privilege for API tokens
# Railway: Create token with minimal scope
# Vercel: Use project-specific tokens
```

## Automation Scripts

### Quick Deploy Script

Create `scripts/deploy.sh`:

```bash
#!/bin/bash

echo "🚀 Starting deployment process..."

# Run tests
echo "📋 Running tests..."
npm test || exit 1

# Build
echo "🔨 Building..."
npm run build || exit 1

# Commit and push
echo "📤 Committing and pushing..."
git add .
git commit -m "chore: deploy $(date +%Y-%m-%d)"
git push origin main

echo "✅ Deployment initiated! Check GitHub Actions for status."
```

### Health Check Script

Create `scripts/health-check.sh`:

```bash
#!/bin/bash

API_URL="https://your-api.railway.app/api/v1/health"

echo "🏥 Checking API health..."
response=$(curl -s -o /dev/null -w "%{http_code}" $API_URL)

if [ $response -eq 200 ]; then
  echo "✅ API is healthy"
  exit 0
else
  echo "❌ API is unhealthy (HTTP $response)"
  exit 1
fi
```

### Backup Script

Create `scripts/backup.sh`:

```bash
#!/bin/bash

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

echo "💾 Creating backup..."

# Backup database
pg_dump $DATABASE_URL > $BACKUP_DIR/db_$DATE.sql

echo "✅ Backup created: $BACKUP_DIR/db_$DATE.sql"
```

## Recommended Tools

### CLI Tools

```bash
# GitHub CLI
brew install gh  # macOS
# or: sudo apt install gh  # Linux

# Railway CLI
npm install -g @railway/cli

# Vercel CLI
npm install -g vercel

# Supabase CLI
brew install supabase/tap/supabase  # macOS
# or: npm install -g supabase
```

### VS Code Extensions

- GitHub Pull Requests
- Docker
- Prisma
- ESLint
- Prettier

### Monitoring Tools

- Railway Dashboard
- Vercel Analytics
- Supabase Dashboard
- GitHub Actions Insights

## Best Practices Summary

### Development
- ✅ Use local development environment
- ✅ Test thoroughly before deploying
- ✅ Use feature branches for new features
- ✅ Write meaningful commit messages

### Deployment
- ✅ Use automated CI/CD pipelines
- ✅ Monitor deployment logs
- ✅ Test production endpoints after deployment
- ✅ Keep rollback plan ready

### Security
- ✅ Never commit secrets
- ✅ Rotate secrets regularly
- ✅ Use environment-specific variables
- ✅ Implement proper access controls

### Monitoring
- ✅ Set up health checks
- ✅ Monitor logs regularly
- ✅ Track performance metrics
- ✅ Set up alerts for failures

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Railway Documentation](https://docs.railway.app/)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)

## Getting Help

If you encounter issues:

1. Check logs: `railway logs`, `vercel logs`, or GitHub Actions logs
2. Review this guide's troubleshooting section
3. Check service-specific documentation
4. Search GitHub Issues for similar problems
5. Ask for help in community forums

---

**Last Updated**: 2024-02-02
**Maintained by**: Solo Developer Guide
