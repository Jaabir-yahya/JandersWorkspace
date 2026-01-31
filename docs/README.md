# Project Bridge Documentation

Welcome to the Project Bridge documentation. This is your central hub for all project documentation.

---

## Quick Links

| Document | Description |
|----------|-------------|
| [Quick Start](../README.md#quick-start) | Get up and running in 5 minutes |
| [Architecture Overview](../README.md#architecture) | System architecture and design |
| [API Documentation](API_CONTRACT.md) | API reference and examples |
| [Frontend Architecture](FRONTEND_ARCHITECTURE.md) | Next.js frontend documentation |
| [Deployment Guide](../DEPLOYMENT.md) | Deploy to production |
| [Contributing Guide](../CONTRIBUTING.md) | Development guidelines |
| [Changelog](../CHANGELOG.md) | Version history and changes |

---

## By Role

### I'm a Developer

1. [Quick Start](../README.md#quick-start) - Set up your development environment
2. [Contributing Guide](../CONTRIBUTING.md) - Development workflow and standards
3. [Frontend Architecture](FRONTEND_ARCHITECTURE.md) - Frontend development guide
4. [API Contract](API_CONTRACT.md) - API reference

### I'm DevOps

1. [Deployment Guide](../DEPLOYMENT.md) - Complete deployment instructions
2. [Environment Setup](../DEPLOYMENT.md#environment-setup) - Environment variables
3. [Troubleshooting](../DEPLOYMENT.md#troubleshooting) - Common issues and solutions

### I'm a Product Manager

1. [Project Status](../README.md#project-status) - Current phase and features
2. [Changelog](../CHANGELOG.md) - What's new and changed
3. [Phase 3 Summary](PHASE_3_COMPLETE.md) - Current state details
4. [Phase 4 Roadmap](../CHANGELOG.md#future-roadmap) - What's coming next

---

## Project Phases

| Phase | Status | Description | Documentation |
|-------|--------|-------------|---------------|
| Phase 1 | ✅ Complete | Core data infrastructure (Truth Ledger) | [Archive](archive/PHASE_1_SPEC.md) |
| Phase 2 | ✅ Complete | State machine, search, entity history | [Archive](archive/PHASE_2_SPEC.md) |
| Phase 3 | ✅ Complete | Frontend, dashboard, webhook monitoring | [Summary](PHASE_3_COMPLETE.md) |
| Phase 4 | 🚧 Planned | Auth, subscriptions, M-Pesa, WhatsApp, AI | [Roadmap](../CHANGELOG.md#future-roadmap) |

---

## Documentation Structure

```
docs/
├── README.md                    # This file - documentation index
├── FRONTEND_ARCHITECTURE.md     # Next.js frontend documentation
├── API_CONTRACT.md              # API documentation
├── PHASE_3_COMPLETE.md          # Phase 3 completion summary
├── PHASE_3_MASTER.md            # Phase 3 master document
├── PHASE_3_FRONTEND_STRATEGY.md # Frontend strategy
├── DEPLOYMENT_CHECKLIST.md      # Deployment checklist
├── DATABASE_AUDIT_REPORT.md     # Database audit results
├── openapi.yaml                 # OpenAPI/Swagger specification
├── archive/                     # Archived documentation
│   ├── PRD.md                   # Original PRD
│   ├── PHASE_1_SPEC.md          # Phase 1 specification
│   ├── PHASE_2_SPEC.md          # Phase 2 specification
│   └── ...                      # Other archived docs
└── plans/                       # Future plans
    ├── phase-3-completion-plan.md
    ├── phase-3-lock-procedure.md
    └── ...
```

---

## Key Features

### Core Ledger
- Double-entry bookkeeping
- Transaction state machine (DRAFT → POSTED → RECONCILED)
- Multi-tenancy support
- Six immutability locks

### Dashboard
- Real-time statistics
- Payment tracking
- Entity management
- Attachment support

### Webhook Monitoring
- Real-time event monitoring
- Integration support (M-Pesa, WhatsApp, QuickBooks, Xero, Shopify)
- Auto-refresh every 10 seconds
- Retry functionality
- 24-hour activity charts

### Integrations
- M-Pesa payment processing
- WhatsApp messaging
- QuickBooks sync
- Xero sync
- Shopify integration

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 19, TypeScript 5 |
| Styling | Tailwind CSS 4, shadcn/ui |
| Backend | NestJS 11, Prisma 6 |
| Database | PostgreSQL 15+, Supabase |
| Monorepo | Turborepo |

---

## Getting Help

- **General Questions**: Check this documentation index
- **Development Issues**: See [Contributing Guide](../CONTRIBUTING.md)
- **Deployment Issues**: See [Deployment Troubleshooting](../DEPLOYMENT.md#troubleshooting)
- **API Questions**: See [API Contract](API_CONTRACT.md)

---

## Contributing to Documentation

When adding or updating documentation:

1. Follow the existing structure
2. Update this index if adding new files
3. Use clear, concise language
4. Include code examples where helpful
5. Keep links up to date

---

**Last Updated**: 2026-01-31
