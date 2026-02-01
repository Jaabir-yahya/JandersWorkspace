# Railway Deployment Guide

## Quick Deploy to Railway

### Prerequisites

1. Railway account (https://railway.app)
2. GitHub repository connected to Railway
3. Supabase project configured

### Required Environment Variables

Set these in Railway dashboard > Variables:

```bash
# Database
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# Supabase
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]

# API
NODE_ENV=production
ALLOWED_ORIGINS=https://yourdomain.com,https://api.yourdomain.com

# M-Pesa (if using)
MPESA_CONSUMER_KEY=[your-consumer-key]
MPESA_CONSUMER_SECRET=[your-consumer-secret]
MPESA_PASSKEY=[your-passkey]
MPESA_SHORTCODE=[your-shortcode]
MPESA_ENVIRONMENT=production
MPESA_CALLBACK_URL=https://api.yourdomain.com/api/v1/integrations/mpesa/stk-callback
```

### Deployment Steps

1. **Push to GitHub**

   ```bash
   git add .
   git commit -m "Ready for Railway deployment"
   git push origin main
   ```

2. **Connect to Railway**
   - Go to Railway Dashboard
   - Click "New Project"
   - Connect GitHub repository
   - Select `apps/api` as root directory

3. **Configure Environment Variables**
   - Go to Settings > Variables
   - Add all required variables from above

4. **Deploy**
   - Railway will auto-deploy on push
   - Or trigger manual deploy from dashboard

### Health Check

Railway will monitor: `GET /api/v1/health`

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2026-01-31T12:00:00.000Z"
}
```

### Railway URL

Your API will be available at:
`https://your-project-name.up.railway.app/api/v1`

### Post-Deployment

1. **Update Supabase CORS settings**
   - Add Railway URL to Supabase Dashboard > Authentication > URL Configuration

2. **Test API endpoints**

   ```bash
   curl https://your-project-name.up.railway.app/api/v1/health
   ```

3. **Update webhook URLs** (if using M-Pesa)
   - Set Railway URLs in M-Pesa developer portal

### Troubleshooting

**Build failures:**

- Check Railway build logs
- Verify environment variables
- Ensure all dependencies are in package.json

**Database connection issues:**

- Verify DATABASE_URL format
- Check Supabase connection pooling settings
- Run migrations manually if needed

**Health check failures:**

- Verify app is running on PORT 3000
- Check all required environment variables
- Review application logs
