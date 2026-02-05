# Deployment Guide - African Business Platform

## Quick Start for African Entrepreneurs

This guide will help you deploy your accounting platform with minimal technical knowledge.

## Option 1: Vercel (Easiest - Recommended)

**Best for**: Quick setup, automatic scaling, free tier available

### Steps:

1. **Create accounts** (all free):
   - GitHub account: https://github.com
   - Vercel account: https://vercel.com

2. **Upload your code to GitHub**:
   ```bash
   # Initialize git
   git init
   git add .
   git commit -m "Initial commit"
   
   # Create repository on GitHub, then:
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

3. **Deploy on Vercel**:
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js
   - Click "Deploy"
   - Done! Your site will be live at `your-app.vercel.app`

4. **Configure environment variables** in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add: `NEXT_PUBLIC_API_URL` = `<your-backend-url>`

### Cost: FREE for starter (enough for small business)

---

## Option 2: Traditional VPS (More Control)

**Best for**: Those wanting full control, already have a server

### Providers in Africa:
- **Truehost (Kenya)**: KSh 500/month for basic VPS
- **SasaHost (Kenya)**: KSh 800/month with cPanel
- **Whogohost (Nigeria)**: ₦2,500/month
- **Xneelo (South Africa)**: R99/month

### Setup Steps:

1. **Access your server** via SSH:
   ```bash
   ssh root@your-server-ip
   ```

2. **Install Node.js 18+**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Install pnpm**:
   ```bash
   npm install -g pnpm
   ```

4. **Clone and setup**:
   ```bash
   git clone <your-repo-url>
   cd african-business-platform
   pnpm install
   ```

5. **Configure environment**:
   ```bash
   cd apps/web
   cp .env.example .env.local
   nano .env.local  # Edit with your settings
   ```

6. **Build the application**:
   ```bash
   cd apps/web
   pnpm build
   ```

7. **Install PM2 for process management**:
   ```bash
   npm install -g pm2
   ```

8. **Start the application**:
   ```bash
   pm2 start npm --name "business-platform" -- start
   pm2 save
   pm2 startup  # Follow the instructions
   ```

9. **Setup Nginx** (optional, for custom domain):
   ```bash
   sudo apt-get install nginx
   ```

   Create `/etc/nginx/sites-available/business-platform`:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Enable the site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/business-platform /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

10. **Setup SSL** (free with Let's Encrypt):
    ```bash
    sudo apt-get install certbot python3-certbot-nginx
    sudo certbot --nginx -d yourdomain.com
    ```

---

## Option 3: Docker (For Tech-Savvy Users)

**Best for**: Consistent deployments, easy updates

### Steps:

1. **Create Dockerfile** in `apps/web/`:
   ```dockerfile
   FROM node:18-alpine AS base
   
   # Install pnpm
   RUN npm install -g pnpm
   
   # Install dependencies
   FROM base AS deps
   WORKDIR /app
   COPY package.json pnpm-lock.yaml ./
   RUN pnpm install --frozen-lockfile
   
   # Build application
   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   RUN pnpm build
   
   # Production image
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

2. **Build and run**:
   ```bash
   docker build -t business-platform .
   docker run -p 3000:3000 business-platform
   ```

3. **Using Docker Compose** (with backend):
   ```yaml
   version: '3.8'
   services:
     frontend:
       build: ./apps/web
       ports:
         - "3000:3000"
       environment:
         - NEXT_PUBLIC_API_URL=http://backend:3001
       depends_on:
         - backend
     
     backend:
       build: ./apps/backend
       ports:
         - "3001:3001"
       environment:
         - DATABASE_URL=postgresql://user:pass@db:5432/business
       depends_on:
         - db
     
     db:
       image: postgres:15
       volumes:
         - postgres_data:/var/lib/postgresql/data
       environment:
         - POSTGRES_USER=user
         - POSTGRES_PASSWORD=pass
         - POSTGRES_DB=business

   volumes:
     postgres_data:
   ```

   Run with: `docker-compose up -d`

---

## Option 4: Shared Hosting (Cheapest)

**Best for**: Very tight budget (KSh 200-500/month)

**Limitations**: May not support Node.js, consider building static export

### Steps:

1. **Update next.config.js**:
   ```javascript
   const nextConfig = {
     output: 'export',
     images: { unoptimized: true }
   }
   ```

2. **Build static files**:
   ```bash
   cd apps/web
   pnpm build
   ```

3. **Upload `out/` folder** to your shared hosting via FTP/cPanel

**Note**: This removes server-side features but works for basic use

---

## Domain Setup

### Buying a Domain (African Providers)

- **Kenya**: .co.ke from KSh 1,200/year at KeNIC or Safaricom
- **International**: .com from $12/year at Namecheap, GoDaddy

### Pointing Domain to Your Server

1. **Get your server IP** from hosting provider

2. **Update DNS records** (at your domain registrar):
   ```
   Type: A
   Name: @
   Value: your-server-ip
   TTL: 3600
   
   Type: A
   Name: www
   Value: your-server-ip
   TTL: 3600
   ```

3. **Wait 24-48 hours** for DNS propagation (usually faster)

---

## Monitoring & Maintenance

### Essential Checks:

1. **Uptime monitoring** (free):
   - UptimeRobot: https://uptimerobot.com
   - Freshping: https://www.freshworks.com/website-monitoring

2. **Error tracking**:
   - Sentry (free tier): https://sentry.io

3. **Analytics**:
   - Google Analytics (free)
   - Plausible (privacy-focused, paid)

### Regular Maintenance:

```bash
# Update dependencies
pnpm update

# Rebuild and restart
pnpm build
pm2 restart business-platform

# Check logs
pm2 logs business-platform

# Backup database (if applicable)
pg_dump dbname > backup.sql
```

---

## Cost Comparison (Monthly in KES)

| Option | Cost | Setup Time | Tech Knowledge |
|--------|------|------------|----------------|
| Vercel | 0 - 2,000 | 10 minutes | Beginner |
| VPS | 500 - 2,000 | 2-4 hours | Intermediate |
| Docker | 1,000 - 3,000 | 1-2 hours | Advanced |
| Shared Host | 200 - 500 | 30 minutes | Beginner |

---

## Troubleshooting Common Issues

### "Cannot find module"
```bash
rm -rf node_modules
pnpm install
```

### "Port 3000 already in use"
```bash
# Find process
lsof -i :3000
# Kill it
kill -9 <PID>
```

### "Build failed"
```bash
# Clear cache
rm -rf .next
pnpm build
```

### Site slow on mobile data
- Enable image optimization
- Use CDN (Cloudflare free tier)
- Minimize JavaScript

---

## Security Checklist

- [ ] Use HTTPS (SSL certificate)
- [ ] Set strong passwords
- [ ] Enable firewall on server
- [ ] Regular backups
- [ ] Update dependencies monthly
- [ ] Set up fail2ban (for VPS)
- [ ] Use environment variables for secrets
- [ ] Enable CORS properly

---

## Support

- **Documentation**: See README.md
- **Issues**: Open on GitHub
- **Community**: Join our Telegram/WhatsApp group
- **Email**: support@yourdomain.com

---

## Next Steps After Deployment

1. **Configure tenant settings** in the dashboard
2. **Import chart of accounts** for your country
3. **Add your first customers/suppliers**
4. **Create test transactions** to familiarize
5. **Train your team** on data entry
6. **Set up backups** (critical!)

---

**Remember**: Start small, test thoroughly, and scale as needed. The platform is designed to grow with your business!
