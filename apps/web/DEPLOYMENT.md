# LedgerFlow Deployment Guide

## 🌍 Deployment Options for African Context

This guide covers deployment strategies optimized for African infrastructure, considering factors like connectivity, CDN availability, and cost.

## 🚀 Quick Deploy Options

### Option 1: Vercel (Recommended for MVP)

**Pros:**
- Zero configuration
- Global CDN
- Automatic HTTPS
- Preview deployments
- Free tier available

**Cons:**
- Requires credit card for scale
- US/EU-based (latency for African users)

#### Steps:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Production deploy
vercel --prod
```

**Environment Variables:**
Set in Vercel Dashboard → Settings → Environment Variables

### Option 2: Netlify

**Pros:**
- Simple deployment
- Good free tier
- Form handling
- Netlify Functions for API

**Cons:**
- Similar latency issues

#### Steps:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy

# Production
netlify deploy --prod
```

### Option 3: African Cloud Providers

#### 3a. Hetzner (Germany, but Africa-friendly pricing)

```bash
# Build the app
npm run build

# Copy to server
scp -r .next/ user@your-server:/var/www/ledgerflow/

# On server
cd /var/www/ledgerflow
npm install --production
pm2 start npm --name "ledgerflow" -- start
```

#### 3b. DigitalOcean (Cape Town Datacenter)

```yaml
# app.yaml
name: ledgerflow
region: fra # Frankfurt (closest to East Africa)

services:
- name: web
  build_command: npm run build
  run_command: npm start
  envs:
  - key: NEXT_PUBLIC_API_URL
    value: ${API_URL}
```

### Option 4: Self-Hosted (Local Server)

**Best for:** Full control, data sovereignty, cost savings

#### Using Docker

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

```bash
# Build and run
docker build -t ledgerflow .
docker run -p 3000:3000 ledgerflow
```

#### Using PM2 (Process Manager)

```bash
# Install PM2
npm install -g pm2

# Build app
npm run build

# Start with PM2
pm2 start npm --name ledgerflow -- start

# Save configuration
pm2 save

# Setup startup script
pm2 startup
```

## 🔧 Production Configuration

### Environment Variables

Create `.env.production`:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com

# Feature Flags
NEXT_PUBLIC_ENABLE_OFFLINE=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Error Tracking
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx

# MPesa (Production Credentials)
NEXT_PUBLIC_MPESA_CONSUMER_KEY=xxx
NEXT_PUBLIC_MPESA_CONSUMER_SECRET=xxx
NEXT_PUBLIC_MPESA_SHORTCODE=xxx
```

### Next.js Configuration

Update `next.config.js` for production:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // For self-hosted deployments
  output: 'standalone',
  
  // Performance optimizations
  swcMinify: true,
  
  // Image optimization
  images: {
    domains: ['yourdomain.com'],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

## 🔒 SSL/HTTPS Setup

### Using Let's Encrypt (Free SSL)

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is configured automatically
```

### Nginx Configuration

```nginx
# /etc/nginx/sites-available/ledgerflow
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 📊 Monitoring & Analytics

### 1. Application Monitoring

**Sentry Setup:**

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});
```

### 2. Performance Monitoring

**Vercel Analytics** (if using Vercel):

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 3. Google Analytics

```typescript
// lib/analytics.ts
export const pageview = (url: string) => {
  window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
    page_path: url,
  });
};

export const event = ({ action, category, label, value }) => {
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.API_URL }}
          
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 🌍 CDN & Caching Strategy

### CloudFlare Setup (Recommended)

1. **Add Site to CloudFlare**
2. **Configure Caching Rules:**

```
Cache Level: Standard
Browser Cache TTL: 1 month
Edge Cache TTL: 2 hours
```

3. **Optimize for African Traffic:**
   - Enable Argo Smart Routing (paid, but worth it)
   - Enable HTTP/3
   - Enable Early Hints

### Static Asset Optimization

```javascript
// next.config.js
module.exports = {
  images: {
    loader: 'cloudinary', // or 'imgix' for African CDN
    path: 'https://your-cdn.com/',
  },
};
```

## 💾 Database Backup Strategy

```bash
#!/bin/bash
# backup.sh - Run daily via cron

DATE=$(date +%Y%m%d)
BACKUP_DIR="/var/backups/ledgerflow"

# Backup database
pg_dump ledgerflow_db > $BACKUP_DIR/db_$DATE.sql

# Backup uploaded files
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /var/www/ledgerflow/uploads

# Keep only last 30 days
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

# Upload to cloud storage
# aws s3 sync $BACKUP_DIR s3://your-backup-bucket/
```

## 📈 Scaling Considerations

### Vertical Scaling (Single Server)
- Start: 1 CPU, 2GB RAM
- Growth: 2 CPU, 4GB RAM
- Mature: 4 CPU, 8GB RAM

### Horizontal Scaling (Multiple Servers)

```nginx
# Load balancer configuration
upstream ledgerflow {
    server 10.0.0.1:3000;
    server 10.0.0.2:3000;
    server 10.0.0.3:3000;
}

server {
    location / {
        proxy_pass http://ledgerflow;
    }
}
```

## 🚨 Disaster Recovery

### Backup Checklist
- [ ] Database backups (daily)
- [ ] File uploads backups (daily)
- [ ] Environment variables backed up
- [ ] SSL certificates backed up
- [ ] DNS records documented

### Recovery Steps
1. Provision new server
2. Restore database from backup
3. Restore uploaded files
4. Deploy application
5. Update DNS records
6. Test thoroughly

## 📱 Mobile App Deployment

### React Native (Future)

```bash
# iOS
cd ios && pod install
npx react-native run-ios --configuration Release

# Android
cd android
./gradlew assembleRelease

# Upload to stores
# iOS: App Store Connect
# Android: Google Play Console
```

## 🎯 Post-Deployment Checklist

- [ ] SSL certificate valid
- [ ] All environment variables set
- [ ] Database connection working
- [ ] File uploads working
- [ ] Email notifications working
- [ ] Error tracking configured
- [ ] Analytics tracking
- [ ] Backup system running
- [ ] Monitoring alerts configured
- [ ] Documentation updated
- [ ] Team trained on deployment process

## 📞 Support & Maintenance

### Regular Tasks
- **Daily:** Check error logs, monitor performance
- **Weekly:** Review analytics, check backups
- **Monthly:** Update dependencies, security patches
- **Quarterly:** Performance audit, cost optimization

### Emergency Contacts
- DevOps: [Contact Info]
- Database Admin: [Contact Info]
- Cloud Provider Support: [Contact Info]

---

**Production Ready! 🚀**

For deployment support, contact the infrastructure team.
