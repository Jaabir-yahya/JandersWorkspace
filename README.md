# Project Bridge 🇰🇪

**The Truth Ledger for Nairobi's Business Owners**

A monorepo platform that gives **80% of Kenyan business owners** (manual users: mama mbogas, dukas) complete control over their financial data, while preparing infrastructure for **20%** who need integrations and automation.

---

## 🎯 Current State: Production-Ready MVP

**Status**: ✅ Core MVP Complete - Ready for Production Deployment

### What's Working ✅
- **Turborepo Monorepo**: Efficient workspace with apps and packages
- **NestJS Backend**: Complete API with authentication, transactions, entities, inventory
- **Next.js Frontend**: Modern dashboard with African-inspired design
- **Supabase Database**: PostgreSQL with comprehensive schema
- **Multi-tenant Architecture**: Tenant isolation with tier-based access control
- **Core Features**: Transactions, entities, items, payments, notes, dashboard

### Known Issues ⚠️
- **Workspace Linking**: Some packages using `file:` instead of `workspace:*` (optional cleanup)
- **Integration Code**: TODOs in integration code (deferred for post-MVP)
- **Turbo Remote Cache**: In some environments `turbo run build` may fail with TLS/keychain; use `turbo run build --no-daemon` or run build per package

---

## 📁 Monorepo Structure (Turborepo)

| Path | Purpose |
|------|---------|
| **apps/api** | NestJS backend (`@project-bridge/api`) – auth, transactions, ledger, business, reporting |
| **apps/web** | Next.js frontend (`ledger-system-frontend`) – dashboard, inventory, supplies, invoices, reports, ledger |
| **packages/database** | Prisma schema, migrations, `prisma generate` (used by API) |
| **packages/types** | Shared TypeScript types |
| **packages/shared** | Kenya utilities, formatters, truth-engine |
| **packages/config** | Shared ESLint/TypeScript configs |
| **packages/integrations** | Mpesa, QuickBooks, WhatsApp, Xero (shared code) |

**Root scripts:** `build`, `dev`, `dev:api`, `dev:web`, `dev:app` (api + web), `lint`, `test`, `db:local`, `db:migrate`, `db:studio`.
**Turbo pipeline:** `build` (depends on `^build` and `^generate`), `dev` (persistent), `generate`, `lint`, `test`, `type-check`, `clean`, `migrate`, `studio`.

---

## 🚀 Quick Start

### Prerequisites
- Node.js **20.19+ or 24** (Prisma 7; use `nvm use` with `.nvmrc` for 24)
- npm ≥9
- Docker (for local database)

### 1. Install Dependencies
```bash
npm install
```
After changing workspaces or pulling, run `npm install` at root so `package-lock.json` stays in sync. CI uses `npm ci` for reproducible installs.

### 2. Environment Setup
```bash
# Copy example configs
cp .env.example .env
cp apps/api/.env.example apps/api/.env

# Update with your Supabase credentials
```

### 3. Database
```bash
# Start local Supabase (Docker)
npm run db:local

# Run migrations
npm run db:migrate

# (Optional) Seed with Kenya sample data
npm run db:seed
```

### 4. Development
```bash
# Run everything (API + Web)
npm run dev

# Or run individually:
npm run dev:api      # Backend only (http://localhost:3001)
npm run dev:web      # Frontend only (http://localhost:3000)
```

---

## 📦 Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all apps in dev mode |
| `npm run build` | Build all apps for production |  
| `npm run lint` | Lint all code |
| `npm run test` | Run all tests |
| `npm run type-check` | TypeScript validation |
| `npm run clean` | Remove all build artifacts + node_modules |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:studio` | Open Prisma Studio (DB GUI) |

---

## 🧪 Testing MVP

1. **Sign in** at `/login` with your Supabase Auth user (e.g. the email/password you set up in Supabase Dashboard → Authentication → Users). For dashboard and transactions to load, set `user_metadata.tenant_id` in Supabase to a valid tenant UUID (create a tenant via API or DB, then in Supabase Auth → User → Edit user_metadata add `tenant_id: "<uuid>"`).
2. **Add an Item**: Navigate to `/inventory` → "Add Item" → Create "Sugar 1kg" (Cost: 80, Price: 100)
3. **Add a Person**: Navigate to `/dashboard` → People → Create "Jane" (Customer)
4. **Record Transaction**: `/dashboard` → Transactions → Sell Sugar to Jane (Cash, 100 KES)
5. **Verify Flows**:
   - `/dashboard` → Cash balance should show +100 KES
   - `/inventory` → Sugar stock should decrease
   - `/dashboard` → Jane should show transaction history
6. **Export Data**: Download CSVs from Inventory and Transactions pages

---

## 📚 Documentation

- **[Repository Standards](REPOSITORY_STANDARDS.md)**: Coding conventions
- **[Contributing Guide](CONTRIBUTING.md)**: How to contribute
- **[Deployment Setup](DEPLOYMENT_SETUP.md)**: Production deployment
- **[Guides](docs/guides/)**: Detailed technical docs
- **[Project Overview](docs/PROJECT_OVERVIEW.md)**: Comprehensive project documentation
- **[Turborepo Finalization](docs/TURBOREPO_FINALIZATION.md)**: Monorepo goals, connections, verification, and known issues

---

## 🤖️ Agentic Building Guide

### For AI Assistants (Kilo Code, Cursor, etc.)

This guide is designed for AI agents helping build this project. Follow these principles:

#### 1. Understand the Architecture
- **Monorepo**: Use Turborepo for efficient builds
- **Backend**: NestJS with modular architecture (auth, transactions, entities, etc.)
- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Database**: Supabase PostgreSQL with Prisma ORM
- **State Management**: Zustand for frontend state

#### 2. Code Style & Standards
- Follow [`REPOSITORY_STANDARDS.md`](REPOSITORY_STANDARDS.md)
- Use TypeScript strict mode
- Write descriptive variable names
- Add JSDoc comments for complex functions
- Keep functions small and focused

#### 3. File Organization
- **Backend**: Each feature in its own module (e.g., `transactions/`, `entities/`)
- **Frontend**: Pages in `app/`, components in `components/`, utilities in `lib/`
- **Shared**: Common code in `packages/shared/`
- **Types**: Shared types in `packages/types/`

#### 4. API Development
- Use NestJS modules for each feature
- Create DTOs for input validation
- Use Prisma for database operations
- Implement proper error handling
- Add Swagger documentation

#### 5. Frontend Development
- Use Next.js App Router
- Create reusable components in `components/ui/`
- Use Zustand for state management
- Implement proper loading states
- Add error boundaries

#### 6. Database Changes
- Update Prisma schema in `packages/database/prisma/schema.prisma`
- Generate migration: `npx prisma migrate dev <name>`
- Test migration locally
- Update types if needed

#### 7. Testing
- Write unit tests for services
- Write integration tests for controllers
- Test frontend components
- Test API endpoints
- Use Jest for backend, React Testing Library for frontend

#### 8. Common Patterns

##### Creating a New Backend Module
```bash
# Generate module
nest g module <module-name>
nest g controller <module-name>
nest g service <module-name>
```

##### Creating a New Frontend Page
```bash
# Create page in app/
mkdir -p apps/web/app/<page-name>
touch apps/web/app/<page-name>/page.tsx
```

##### Adding API Integration
```typescript
// In apps/web/lib/api/<feature>.ts
import { apiClient } from './api-client';

export async function get<Feature>() {
  return apiClient.get('/api/<feature>');
}
```

#### 9. Known Issues to Fix

##### Workspace Linking
**Issue**: Some packages use `file:` instead of `workspace:*`
**Fix**: Update `package.json` dependencies to use `workspace:*` for consistency

##### Turbo Remote Cache
**Issue**: `turbo run build` or `type-check` may fail with "Unable to set up TLS" in some environments
**Fix**: Run `turbo run build --no-daemon` or run scripts per package (e.g. `npm run build --workspace=@project-bridge/api`)

#### 10. Deployment Checklist
- [ ] All tests pass
- [ ] TypeScript errors resolved
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] Build succeeds
- [ ] Manual testing complete

---

## 🛠️ Tech Decisions

### Why Turborepo?
- **Shared code**: Types, DB schema, utilities across apps
- **Fast builds**: Only rebuild what changed
- **Future-proof**: Easy to add mobile app, webhooks server, etc.

### Why Supabase?
- **Postgres + Auth + Realtime** in one
- **Edge functions** for future integrations
- **Free tier** perfect for solo dev + small tenants

### Why Manual-First?
- **80% of users** don't need automation (yet)
- **Build right core** that won't break when adding integrations
- **Dogfood** platform ourselves before selling premium features

---

## 🚢 Deployment

- **Backend (API)**: Railway (auto-deploys from `main`)
- **Frontend (Web)**: Vercel (auto-deploys from `main`)
- **Database**: Supabase Cloud (managed Postgres)

```bash
# Production build (verifies everything works)
npm run build

# Deploy to production
npm run deploy:prod
```

---

## 🔮 Roadmap

### Completed: Nairobi Core MVP ✅
- [x] **Truth Engine**: Robust backend ledger with state transitions
- [x] **Intelligence Layer**: Auto-categorization & relationship heatmaps
- [x] **Nairobi Command Center**: Unified modern dashboard
- [x] **Modern History**: Story-driven transaction narratives
- [x] **Smart Inventory**: Demand prediction & reorder logic
- [x] **Multi-tenant Architecture**: Tenant isolation with tier-based access

### Next: Scale-Out
- [ ] Fix TypeScript errors in universal-truth module
- [ ] Fix workspace linking issues
- [ ] M-Pesa STK Push Integration
- [ ] WhatsApp Automated Receipting
- [ ] Multi-store / Multi-tenant isolation
- [ ] Offline PWA for frontline users

---

## 💬 Philosophy

> "Build the ledger right for manual users. Everything else is abstraction on top of truth."

The core transaction/entity model works whether you're a solo shopkeeper or a chain with 100 locations. Integrations are just *ways to get data in/out* faster—but the ledger stays clean.

---

## 📄 License

Proprietary - © 2026 Project Bridge
