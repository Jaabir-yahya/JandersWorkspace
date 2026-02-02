# Project Bridge

**Multi-tenant business management platform for African SMEs**

Built for the 80% of African businesses that operate informally - from kiosks and dukas to salons and market traders. Project Bridge provides a modern, mobile-first dashboard with optional integrations (M-Pesa, WhatsApp, QuickBooks) for businesses ready to digitize.

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/Jaabir-yahya/JandersWorkspace)
[![API Tests](https://img.shields.io/badge/api%20tests-23%20passing-brightgreen)](https://github.com/Jaabir-yahya/JandersWorkspace)
[![TypeScript](https://img.shields.io/badge/typescript-5.9-blue)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/nestjs-11.0-red)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/prisma-6.0-2D3748)](https://prisma.io/)

---

## Quick Start (Solo Developer)

```bash
# 1. Clone and install
git clone https://github.com/Jaabir-yahya/JandersWorkspace.git
cd JandersWorkspace
npm install

# 2. Set up environment
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env with your Supabase credentials

# 3. Run database migrations
cd apps/api && npx prisma migrate deploy

# 4. Start development
npm run dev          # Starts API (3000), bridge-admin (3003), bridge-perfect (3002)
```

**Test the setup:**
```bash
curl http://localhost:3000/api/v1/health
# Visit: http://localhost:3003/janders-dogfood
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Vercel                               │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ bridge-admin     │  │ bridge-perfect   │                │
│  │ (Desktop)        │  │ (Mobile)         │                │
│  │ localhost:3003   │  │ localhost:3002   │                │
│  └──────────────────┘  └──────────────────┘                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       Railway                               │
│                    NestJS API                               │
│              localhost:3000                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Tenants    │  │   Feature    │  │  Integrations    │  │
│  │   (Multi)    │  │   Flags      │  │  (M-Pesa, etc)   │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Supabase                               │
│              PostgreSQL + Auth                              │
└─────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19 + Vite + Tailwind CSS + Zustand |
| **Backend** | NestJS 11 + Prisma 6 + Swagger |
| **Database** | PostgreSQL (Supabase) |
| **Auth** | Supabase Auth (optional for MVP) |
| **Integrations** | M-Pesa, WhatsApp Business API, QuickBooks, Xero |
| **Deployment** | Railway (API) + Vercel (Frontend) |
| **CI/CD** | GitHub Actions |

---

## Project Structure

```
JandersWorkspace/
├── apps/
│   ├── api/                    # NestJS API (Railway)
│   │   ├── src/
│   │   │   ├── auth/          # JWT + Supabase Auth
│   │   │   ├── integrations/  # M-Pesa, WhatsApp, QuickBooks, Xero
│   │   │   ├── tenants/       # Multi-tenant logic
│   │   │   └── health/        # Health checks
│   │   └── prisma/            # Database schema + migrations
│   ├── bridge-admin/          # Desktop dashboard (Vercel)
│   └── bridge-perfect/        # Mobile dashboard (Vercel)
├── packages/
│   ├── types/                 # Shared TypeScript types
│   └── database/              # Shared Prisma client
├── docs/
│   ├── guides/                # Developer guides
│   ├── reference/             # API reference
│   └── archive/               # Old documentation
└── .github/workflows/         # CI/CD automation
```

---

## Solo Developer Workflow

### Daily Development

```bash
# Start all services
npm run dev

# Work on API
cd apps/api && npm run dev

# Work on bridge-admin
cd apps/bridge-admin && npm run dev

# Work on bridge-perfect
cd apps/bridge-perfect && npm run dev
```

### Testing

```bash
# Run API tests
npm test --workspace=@project-bridge/api

# Type checking
npm run type-check

# Build check (catches deployment issues)
npm run build
```

### Deployment

```bash
# 1. Commit and push
git add .
git commit -m "feat: your changes"
git push origin main

# 2. GitHub Actions auto-deploys:
#    - API → Railway
#    - Frontends → Vercel

# 3. Monitor deployments
#    - Railway Dashboard: https://railway.app
#    - Vercel Dashboard: https://vercel.com
```

---

## Environment Variables

### Required (Supabase)

```env
# apps/api/.env
DATABASE_URL=postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[password]@db.[ref].supabase.co:6543/postgres?pgbouncer=true
SUPABASE_URL=https://[ref].supabase.co
SUPABASE_SECRET_KEY=eyJhbG...
JWT_SECRET=your-random-secret
ENCRYPTION_KEY=your-32-char-key
```

### Optional (Integrations)

```env
# M-Pesa (Safaricom)
MPESA_ENVIRONMENT=sandbox
MPESA_CONSUMER_KEY=...
MPESA_CONSUMER_SECRET=...
MPESA_SHORTCODE=174379
MPESA_PASSKEY=...

# WhatsApp (Meta)
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_ACCESS_TOKEN=...
```

---

## Integration Development

### Adding a New Integration

1. **Create service** in `apps/api/src/integrations/[name]/`
2. **Extend tenant config** in `apps/api/src/integrations/tenant-config.service.ts`
3. **Add feature flag** in database seed
4. **Update frontend** to show integration UI when flag enabled

### Integration Pattern

```typescript
// apps/api/src/integrations/mpesa/mpesa.service.ts
@Injectable()
export class MpesaService {
  async initiatePayment(tenantId: string, amount: number, phone: string) {
    // 1. Check tenant has integration enabled
    const config = await this.tenantConfig.getIntegration(tenantId, 'MPESA');
    if (!config.enabled) throw new ForbiddenException();
    
    // 2. Make API call
    // 3. Store transaction
    // 4. Return result
  }
}
```

---

## Key Features

### For Tenants (Businesses)

- **Dashboard** - Business overview with charts
- **Transactions** - Record sales, purchases, expenses
- **People** - Customer/supplier management with credit tracking
- **Quick Add** - Fast transaction entry (mobile-optimized)
- **Integrations** - M-Pesa payments, WhatsApp notifications (optional)

### For You (Developer)

- **Multi-tenancy** - Slug-based isolation (`/janders-dogfood`)
- **Feature flags** - Enable features per tenant/tier
- **Public API** - Headless design, works from any frontend
- **Health checks** - `/api/v1/health` for monitoring
- **MCP Servers** - Monitor Vercel/Railway deployments

---

## Deployment Checklist

- [ ] Supabase project created
- [ ] Railway project linked to GitHub
- [ ] Vercel projects for bridge-admin and bridge-perfect
- [ ] GitHub secrets: `RAILWAY_API_TOKEN`, `VERCEL_TOKEN`
- [ ] Environment variables set in Railway
- [ ] Database migrations run
- [ ] Seed data loaded (includes `janders-dogfood` tenant)

See [DEPLOYMENT_SETUP.md](DEPLOYMENT_SETUP.md) for detailed instructions.

---

## Documentation

| Document | Purpose |
|----------|---------|
| [DEPLOYMENT_SETUP.md](DEPLOYMENT_SETUP.md) | Production deployment guide |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Development standards |
| [docs/guides/](docs/guides/) | Developer guides |
| [docs/reference/](docs/reference/) | API reference |
| [docs/archive/](docs/archive/) | Historical docs |

---

## Support

- **Issues**: GitHub Issues
- **API Docs**: `/api/docs` when running locally
- **Health Check**: `/api/v1/health`

---

## License

MIT License - see [LICENSE](LICENSE) file.

---

**Built for African SMEs. Made in Nairobi.** 🇰🇪
