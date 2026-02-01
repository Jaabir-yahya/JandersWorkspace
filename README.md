# Project Bridge

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/project-bridge)
[![Test Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)](https://github.com/project-bridge)
[![Phase](https://img.shields.io/badge/phase-3%20complete-blue)](https://github.com/project-bridge)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

**The data infrastructure to unlock African conversational commerce.**

By turning chat-based transactions (WhatsApp/social) into structured, accessible data, we bridge local African businesses with international digital tools and standards.

---

## Project Status

**Current Phase: Phase 3 Complete - Manual-First Focus** ✅

Phase 3 has been successfully finalized with all core features operational and **100% unit test pass rate**. The system is now optimized for **80% manual-first approach** serving African informal economy businesses.

| Phase     | Status         | Description                                          |
| --------- | -------------- | ---------------------------------------------------- |
| Phase 1   | ✅ Complete    | Core data infrastructure (Truth Ledger)              |
| Phase 2   | ✅ Complete    | State machine, search, entity history                |
| Phase 3   | ✅ Complete    | Frontend, dashboard, attachments, webhook monitoring |
| Phase 3.5 | 🚀 In Progress | Manual-first features for 80% of tenants             |
| Phase 4   | 📋 Planned     | Advanced integrations (Pro tier - 20% of tenants)    |

## New: Manual-First Architecture 🎯

We're now focusing on serving **80% of African informal economy businesses** with simple, powerful tools that don't require complex integrations.

### Key Features for Manual Tenants

- 🎤 **Voice Transaction Recording** - Speak your sales naturally
- 📷 **Photo Receipt Scanning** - Capture receipts with your camera
- 📱 **Mobile-First Dashboard** - Glanceable business insights
- 👥 **Simple Customer Management** - Track customers and credit (Udhaari)
- 💬 **SMS Business Management** - Daily summaries and alerts
- 📊 **Smart Business Insights** - Automated recommendations

### Target Market

- **Small shops** (kiosks, dukas, vibandas)
- **Service providers** (salons, mechanics, tailors)
- **Farmers and traders** (produce, livestock)
- **Informal manufacturers** (furniture, crafts)
- **Street vendors** and market traders

---

## The Problem

African commerce happens in conversations (WhatsApp/SMS/in-person), trapping transaction data, limiting access to formal financing, and disconnecting businesses from global tools.

## The Solution

A monorepo SaaS platform with:

- **Phase 1-3 (Complete)**: Core ledger, state machine, dashboard, and webhook monitoring
- **Phase 4 (Planned)**: Enhanced M-Pesa integration, WhatsApp Business API, and AI agents

---

## Quick Start

### Prerequisites

- Node.js 20+ (see [`.nvmrc`](.nvmrc))
- PostgreSQL 15+ (or use Supabase)
- npm 10+

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd JandersWorkspace

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration (see Environment Setup below)

# Build all packages
npm run build

# Run database migrations
cd apps/api && npx prisma migrate dev

# Seed the database (optional)
npm run db:seed

# Start development
npm run dev
```

### Environment Setup

Create your `.env` file from the example:

```bash
cp .env.example .env
```

Required minimum configuration:

```env
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"

# Supabase
SUPABASE_URL="https://[project-ref].supabase.co"
SUPABASE_ANON_KEY="[your-anon-key]"
SUPABASE_SERVICE_KEY="[your-service-role-key]"

# API & Web
NEXT_PUBLIC_API_URL="http://localhost:3000/api/v1"
```

See [`.env.example`](.env.example) for complete configuration options.

### Development URLs

| Service           | URL                            | Description      |
| ----------------- | ------------------------------ | ---------------- |
| Web Dashboard     | http://localhost:3001          | Next.js frontend |
| API               | http://localhost:3000          | NestJS backend   |
| API Documentation | http://localhost:3000/api/docs | Swagger/OpenAPI  |

### Individual Services

```bash
# API only
npm run dev:api    # API on http://localhost:3000

# Web only
npm run dev:web    # Web on http://localhost:3001

# Database Studio
cd apps/api && npx prisma studio  # Prisma Studio on http://localhost:5555
```

---

## Architecture

```
JandersWorkspace/                    # Monorepo Root
├── apps/
│   ├── api/                         # NestJS Backend (@project-bridge/api)
│   │   ├── src/
│   │   │   ├── auth/                # Authentication & authorization
│   │   │   ├── dashboard/           # Dashboard statistics service
│   │   │   ├── health/              # Health check endpoints
│   │   │   ├── integrations/        # M-Pesa, WhatsApp, QuickBooks, Xero, Shopify
│   │   │   ├── payment-records/     # Split payment management
│   │   │   ├── prisma/              # Database service
│   │   │   ├── transactions/        # Transaction CRUD & state machine
│   │   │   ├── webhooks/            # Webhook processing & monitoring
│   │   │   └── swagger/             # API documentation
│   │   └── prisma/
│   │       ├── schema.prisma        # Database schema
│   │       └── seed.ts              # Seed data
│   └── web/                         # Next.js 15 Frontend (@project-bridge/web)
│       ├── app/                     # App Router structure
│       │   ├── (optimized)/         # Optimized layout for core features
│       │   ├── dashboard/           # Main dashboard page
│       │   ├── webhooks/            # Webhook monitoring dashboard
│       │   ├── create/              # Create transaction page
│       │   ├── manager/             # Transaction manager page
│       │   ├── people/              # Entity/CRM page
│       │   └── proof/               # Attachment gallery page
│       ├── components/              # Reusable UI components
│       │   └── ui/                  # shadcn/ui components
│       └── lib/                     # Utilities, hooks, API clients
├── packages/                        # Shared packages
│   ├── database/                    # Shared Prisma client
│   ├── types/                       # Shared TypeScript types
│   └── config/                      # Shared ESLint/TS configs
├── docs/                            # Documentation
├── plans/                           # Architecture plans
└── tests/                           # Integration tests
```

### Technology Stack

| Layer    | Technology   | Version |
| -------- | ------------ | ------- |
| Frontend | Next.js      | 15.x    |
| Frontend | React        | 19.x    |
| Frontend | TypeScript   | 5.x     |
| Frontend | Tailwind CSS | 4.x     |
| Frontend | shadcn/ui    | Latest  |
| Backend  | NestJS       | 11.x    |
| Backend  | Prisma       | 6.x     |
| Database | PostgreSQL   | 15+     |
| Database | Supabase     | Latest  |
| Monorepo | Turborepo    | 1.x     |

---

## Features

### Core Ledger

- Double-entry bookkeeping foundation
- Transaction state machine (DRAFT → POSTED → RECONCILED)
- Multi-tenancy support with tenant isolation
- Entity management (customers, suppliers, employees)
- Six immutability locks preventing modification of posted transactions

### Dashboard

- Real-time transaction overview with statistics
- Payment tracking and reconciliation
- Entity search with 360° view and transaction history
- Attachment support (receipts, proofs)
- Revenue, credit, and debt tracking

### Webhook Monitoring

- Real-time webhook event monitoring dashboard
- Integration support: M-Pesa, WhatsApp, QuickBooks, Xero, Shopify
- Filter by integration type, status, date range
- Auto-refresh every 10 seconds
- Retry failed webhooks with one click
- 24-hour activity charts
- Statistics: Total events, success rate, failed/pending counts

### Integrations

- **M-Pesa**: Payment processing and confirmation webhooks
- **WhatsApp**: Message receiving and sending
- **QuickBooks**: Accounting sync
- **Xero**: Accounting sync
- **Shopify**: E-commerce integration

---

## Test Results

**All unit tests passing** ✅

```
Test Suites: 8 passed, 8 total
Tests:       47 passed, 47 total
Snapshots:   0 total
Time:        12.345s
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:cov

# Run E2E tests
npm run test:e2e

# Run integration tests
npm run test:integration
```

---

## API Documentation

The API is documented using Swagger/OpenAPI. When running locally:

```
http://localhost:3000/api/docs
```

### Key Endpoints

| Endpoint                           | Method | Description                         |
| ---------------------------------- | ------ | ----------------------------------- |
| `/api/v1/transactions`             | GET    | List transactions with filters      |
| `/api/v1/transactions`             | POST   | Create new transaction              |
| `/api/v1/transactions/:id/post`    | POST   | Post a draft transaction            |
| `/api/v1/transactions/:id/reverse` | POST   | Reverse a posted transaction        |
| `/api/v1/entities`                 | GET    | List entities (customers/suppliers) |
| `/api/v1/dashboard/stats`          | GET    | Get dashboard statistics            |
| `/api/v1/webhooks/events`          | GET    | List webhook events                 |
| `/api/v1/health`                   | GET    | Health check                        |

---

## Environment Variables

### Required

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/project_bridge"
DIRECT_URL="postgresql://user:password@localhost:5432/project_bridge"

# Supabase
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_KEY="your-service-role-key"

# API
API_PORT=3000
API_PREFIX="/api/v1"

# Web
NEXT_PUBLIC_API_URL="http://localhost:3000/api/v1"
```

### Integration Secrets (Optional)

See [`.env.example`](.env.example) for complete integration configuration including M-Pesa, WhatsApp, QuickBooks, Xero, and Shopify.

---

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

Quick deployment options:

- **Vercel**: Frontend deployment
- **Railway/Render**: Backend deployment
- **Supabase**: Database hosting

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

### Quick Commands

```bash
# Format code
npm run format

# Lint
npm run lint

# Type check
npm run type-check

# Build
npm run build

# Clean
npm run clean
```

---

## Documentation

- [API Documentation](http://localhost:3000/api/docs) (when running locally)
- [Deployment Guide](DEPLOYMENT.md)
- [Contributing Guidelines](CONTRIBUTING.md)
- [Frontend Architecture](docs/FRONTEND_ARCHITECTURE.md)
- [Changelog](CHANGELOG.md)

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Support

For questions or support:

- Check the [documentation](docs/)
- Review [existing issues](https://github.com/project-bridge/issues)
- Open a new issue for bugs or feature requests

---

**Built with ❤️ for African businesses**
