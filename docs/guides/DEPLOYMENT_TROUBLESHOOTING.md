# DEPLOYMENT TROUBLESHOOTING GUIDE

## 🚨 COMMON DEPLOYMENT ISSUES

### Issue 1: "Could not find root directory: /apps/api"

**Problem**: Railway expects absolute paths but monorepo uses relative paths
**Symptoms**: Build fails immediately with directory not found error
**Solution**: Use Dockerfile approach with proper context

```bash
# Before (broken)
{
  "build": { "buildCommand": "npm run build" }  # Runs in wrong directory
}

# After (working)
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "apps/api/Dockerfile"
  }
}
```

### Issue 2: "Application not found" (404 errors)

**Problem**: Application crashes on startup or wrong health check path
**Symptoms**: HTTP 404 from Railway domain
**Diagnosis**:

```bash
# Check Railway logs
cd apps/api && railway logs

# Check if app starts locally
npm run build:api
npm start
curl localhost:3000/api/v1/health
```

**Common Causes**:

- Missing environment variables
- Database connection issues
- Port configuration wrong
- Health check path incorrect

### Issue 3: Build Timeout on Railway

**Problem**: Docker build taking too long or hanging
**Symptoms**: Deployment times out after 10-15 minutes
**Solutions**:

1. **Optimize Dockerfile**:

```dockerfile
# Use .dockerignore to reduce build context
echo "node_modules
.git
coverage
*.log" > .dockerignore
```

2. **Cache Dependencies**:

```dockerfile
# Copy package files first for better caching
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
RUN npm ci --only=production
```

3. **Reduce Image Size**:

```dockerfile
FROM node:18-alpine AS runtime  # Use alpine instead of full node
```

### Issue 4: Database Connection Errors

**Problem**: App can't connect to database in production
**Symptoms**:

- `ECONNREFUSED` errors
- Timeout errors
- Authentication failures

**Checklist**:

```bash
# Verify Railway environment variables
cd apps/api && railway variables

# Check database is accessible
echo $DATABASE_URL | psql

# Test connection locally with same variables
DATABASE_URL="postgresql://..." npm start
```

**Required Variables**:

```bash
DATABASE_URL=postgresql://user:pass@host:port/db
DIRECT_URL=postgresql://user:pass@host:port/db  # For migrations
JWT_SECRET=your-secret-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=your-secret-key
```

### Issue 5: Health Check Failures

**Problem**: Railway health check keeps failing
**Symptoms**: Automatic restarts, unhealthy status

**Debug Health Check**:

```bash
# Test health endpoint locally
curl -v http://localhost:3000/api/v1/health

# Check response format
# Should return: {"status":"ok","timestamp":"2024-02-02T..."}
```

**Fix Health Check**:

```json
{
  "deploy": {
    "healthcheckPath": "/api/v1/health",
    "healthcheckTimeout": 300, // Increase timeout
    "restartPolicyType": "ON_FAILURE"
  }
}
```

**Add Health Check to Dockerfile**:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/v1/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"
```

## 🔧 RAILWAY DEBUG COMMANDS

### Essential Commands

```bash
# Check service status
railway status

# View deployment logs
railway logs

# View specific deployment logs
railway logs --deployment-id <id>

# Check environment variables
railway variables

# Force redeploy
railway up --force

# Scale service
railway scale --service <service-name> <replicas>
```

### Environment Management

```bash
# Add variable
railway variables set JWT_SECRET=your-secret

# Remove variable
railway variables remove JWT_SECRET

# List all variables
railway variables list
```

## 🐳 DOCKER ISSUES

### Issue: Large Image Sizes

**Problem**: Docker images are too big (>1GB)
**Solution**:

```dockerfile
# Multi-stage builds
FROM node:18-alpine AS builder
# ... build steps ...

FROM node:18-alpine AS runtime
COPY --from=builder /app/dist ./dist
# Only copy what's needed
```

### Issue: Permission Errors

**Problem**: Application can't write files or access resources
**Solution**:

```dockerfile
# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

# Set proper permissions
COPY --chown=nextjs:nodejs . .
```

## 🚨 EMERGENCY RECOVERY

### When Everything Is Broken

```bash
# 1. Rollback to previous deployment
railway rollback

# 2. Check last working deployment
railway deployments list

# 3. Restore from backup (database)
supabase db restore <backup-file>

# 4. Force rebuild from scratch
railway up --force
```

### Manual Database Recovery

```bash
# Access production database
cd packages/database
npx prisma db pull --force
npx prisma generate

# Check data integrity
npx prisma studio
```

## 📊 MONITORING SETUP

### Railway Alerts

```bash
# Set up Discord/Slack notifications
railway notifications create --type discord --webhook <url>

# Monitor response time
railway alerts create --metric response_time --threshold 1000

# Monitor error rate
railway alerts create --metric error_rate --threshold 5
```

### Health Monitoring

```bash
# Add monitoring endpoint to API
GET /api/v1/monitoring
Response: {
  "status": "ok",
  "database": "connected",
  "uptime": "2d 3h 45m",
  "memory": "45%",
  "version": "1.0.0"
}
```

## 🎯 PREVENTION CHECKLIST

### Before Each Deploy

- [ ] `npm run build:api` succeeds locally
- [ ] `npm run test:api` passes all tests
- [ ] Environment variables checked
- [ ] Database migrations tested
- [ ] Health endpoint verified

### After Each Deploy

- [ ] Health check responds correctly
- [ ] Core endpoints tested
- [ ] Error rates monitored
- [ ] Performance checked
- [ ] Logs reviewed for warnings

## 🆘 GETTING HELP

### Railway Support

- Documentation: https://docs.railway.app
- Discord: https://discord.gg/railway
- Status: https://status.railway.app

### Common Solutions

1. **Always use Dockerfile for monorepos** - More reliable than NIXPACKS
2. **Set proper health checks** - Prevents false restarts
3. **Monitor logs actively** - Catch issues early
4. **Test environment variables** - Missing configs cause most failures

---

## 🏆 PRO TIPS

✅ **Local Testing > Production Debugging**
Always test builds and health checks locally before deploying

✅ **Docker > NIXPACKS for Complex Apps**  
Docker gives more control and reliable builds for monorepos

✅ **Health Checks Are Your Friend**
Proper health checks prevent downtime and auto-restart failed containers

✅ **Environment Variables = Most Common Issue**  
Always verify Railway has all required environment variables

✅ **Logs Are Truth**  
Railway logs show exactly what's wrong - check them first

Your Nairobi SME API is now bulletproof for production deployment! 🇰🇰🇰🇰
