# Project Bridge Documentation

Welcome to the Project Bridge documentation. This directory contains comprehensive guides and references for developers working on the platform.

---

## 📚 Documentation Structure

```
docs/
├── README.md                    # This file - documentation index
├── PROJECT_OVERVIEW.md          # Comprehensive project overview
├── AGENTIC_BUILDING_GUIDE.md    # Guide for AI assistants
├── guides/                      # Technical guides
│   ├── DEPLOYMENT_TROUBLESHOOTING.md
│   └── INTEGRATION_DEVELOPMENT.md
└── archive/                      # Archived documentation
    ├── IMPLEMENTATION_*.md
    ├── PHASE*.md
    ├── MVP*.md
    ├── LEDGER_IMPLEMENTATION.md
    ├── FRONT_LINE_GUIDE.md
    ├── STRATEGY_DECISIONS.md
    ├── SOLO_DEVELOPER*.md
    ├── RAILWAY_MONOREPO_DIAGNOSIS.md
    ├── PROJECT_WISDOM_AND_GOALS.md
    ├── SOLO_DEV_INNOVATION.md
    ├── planstt/
    └── plans/
```

---

## 🚀 Quick Start

### For New Developers

1. Read [`README.md`](../README.md) - Project overview and quick start
2. Read [`PROJECT_OVERVIEW.md`](PROJECT_OVERVIEW.md) - Comprehensive architecture
3. Check [`../plans/`](../plans/) - Current architecture plans

### For AI Assistants

1. Read [`AGENTIC_BUILDING_GUIDE.md`](AGENTIC_BUILDING_GUIDE.md) - Complete guide for AI agents
2. Follow the patterns and conventions outlined
3. Use the quick reference section for common tasks

### For Troubleshooting

1. Check [`guides/DEPLOYMENT_TROUBLESHOOTING.md`](guides/DEPLOYMENT_TROUBLESHOOTING.md)
2. Check [`guides/INTEGRATION_DEVELOPMENT.md`](guides/INTEGRATION_DEVELOPMENT.md)
3. Review [`../DEPLOYMENT_SETUP.md`](../DEPLOYMENT_SETUP.md)

---

## 📖 Documentation Files

### Core Documentation

| File | Description | Audience |
|-------|-------------|-----------|
| [`README.md`](../README.md) | Main project README with quick start guide | All developers |
| [`PROJECT_OVERVIEW.md`](PROJECT_OVERVIEW.md) | Comprehensive project overview and architecture | All developers |
| [`AGENTIC_BUILDING_GUIDE.md`](AGENTIC_BUILDING_GUIDE.md) | Guide for AI assistants (Kilo Code, Cursor, etc.) | AI agents |
| [`CHANGELOG.md`](../CHANGELOG.md) | Project changelog and version history | All developers |
| [`CONTRIBUTING.md`](../CONTRIBUTING.md) | Contribution guidelines | Contributors |
| [`DEPLOYMENT_SETUP.md`](../DEPLOYMENT_SETUP.md) | Production deployment guide | DevOps engineers |
| [`REPOSITORY_STANDARDS.md`](../REPOSITORY_STANDARDS.md) | Coding conventions and standards | All developers |

### Technical Guides

| File | Description | Audience |
|-------|-------------|-----------|
| [`guides/DEPLOYMENT_TROUBLESHOOTING.md`](guides/DEPLOYMENT_TROUBLESHOOTING.md) | Common deployment issues and solutions | DevOps engineers |
| [`guides/INTEGRATION_DEVELOPMENT.md`](guides/INTEGRATION_DEVELOPMENT.md) | Integration development guide | Backend developers |

### Architecture Plans

| File | Description | Status |
|-------|-------------|--------|
| [`../plans/integration-summary.md`](../plans/integration-summary.md) | Turborepo integration summary | ✅ Complete |
| [`../plans/turborepo-integration-plan.md`](../plans/turborepo-integration-plan.md) | Turborepo integration plan | ✅ Complete |
| [`../plans/CORE_TRUTH_LEDGER_REALIGNMENT.md`](../plans/CORE_TRUTH_LEDGER_REALIGNMENT.md) | Core truth ledger realignment | Current |
| [`../plans/frontend-integration-plan.md`](../plans/frontend-integration-plan.md) | Frontend integration plan | Current |
| [`../plans/turborepo-realignment-plan.md`](../plans/turborepo-realignment-plan.md) | Turborepo realignment plan | Current |

### Archived Documentation

The [`archive/`](archive/) directory contains outdated documentation that has been moved for reference only. These files are not actively maintained but are kept for historical context.

---

## 🎯 Key Topics

### Getting Started

- **Quick Start**: See [`README.md`](../README.md) for setup instructions
- **Architecture**: See [`PROJECT_OVERVIEW.md`](PROJECT_OVERVIEW.md) for system architecture
- **Agentic Building**: See [`AGENTIC_BUILDING_GUIDE.md`](AGENTIC_BUILDING_GUIDE.md) for AI-assisted development

### Development

- **API Development**: NestJS backend with modular architecture
- **Frontend Development**: Next.js 14 with App Router
- **Database**: Supabase PostgreSQL with Prisma ORM
- **State Management**: Zustand for frontend state
- **Testing**: Jest for backend, React Testing Library for frontend

### Deployment

- **Development**: Local development with Docker
- **Staging**: Railway/Vercel for testing
- **Production**: Railway/Vercel for production
- **Troubleshooting**: See [`guides/DEPLOYMENT_TROUBLESHOOTING.md`](guides/DEPLOYMENT_TROUBLESHOOTING.md)

### Integration

- **M-Pesa**: STK Push for payments
- **WhatsApp**: Automated receipting
- **QuickBooks**: Accounting sync
- **Xero**: Accounting sync
- **Shopify**: E-commerce sync

---

## 🔍 Finding Information

### By Topic

| Topic | Documentation |
|-------|---------------|
| Project Overview | [`PROJECT_OVERVIEW.md`](PROJECT_OVERVIEW.md) |
| Quick Start | [`README.md`](../README.md) |
| Agentic Building | [`AGENTIC_BUILDING_GUIDE.md`](AGENTIC_BUILDING_GUIDE.md) |
| Deployment | [`DEPLOYMENT_SETUP.md`](../DEPLOYMENT_SETUP.md) |
| Troubleshooting | [`guides/DEPLOYMENT_TROUBLESHOOTING.md`](guides/DEPLOYMENT_TROUBLESHOOTING.md) |
| Integration | [`guides/INTEGRATION_DEVELOPMENT.md`](guides/INTEGRATION_DEVELOPMENT.md) |
| Standards | [`REPOSITORY_STANDARDS.md`](../REPOSITORY_STANDARDS.md) |
| Contributing | [`CONTRIBUTING.md`](../CONTRIBUTING.md) |

### By Role

| Role | Documentation |
|------|---------------|
| New Developer | [`README.md`](../README.md), [`PROJECT_OVERVIEW.md`](PROJECT_OVERVIEW.md) |
| AI Agent | [`AGENTIC_BUILDING_GUIDE.md`](AGENTIC_BUILDING_GUIDE.md) |
| Backend Developer | [`PROJECT_OVERVIEW.md`](PROJECT_OVERVIEW.md) - API Structure section |
| Frontend Developer | [`PROJECT_OVERVIEW.md`](PROJECT_OVERVIEW.md) - Frontend Structure section |
| DevOps Engineer | [`DEPLOYMENT_SETUP.md`](../DEPLOYMENT_SETUP.md), [`guides/DEPLOYMENT_TROUBLESHOOTING.md`](guides/DEPLOYMENT_TROUBLESHOOTING.md) |
| Integration Developer | [`guides/INTEGRATION_DEVELOPMENT.md`](guides/INTEGRATION_DEVELOPMENT.md) |

---

## 📝 Contributing to Documentation

When updating documentation:

1. **Keep it Current**: Update docs when code changes
2. **Be Clear**: Use simple language and examples
3. **Add Examples**: Include code snippets for common tasks
4. **Link Related**: Cross-reference related documentation
5. **Version Control**: Document when docs were last updated

---

## 🆘 Need Help?

- Check the relevant documentation file for your topic
- Review [`PROJECT_OVERVIEW.md`](PROJECT_OVERVIEW.md) for comprehensive information
- See [`AGENTIC_BUILDING_GUIDE.md`](AGENTIC_BUILDING_GUIDE.md) for AI-assisted development
- Check [`../plans/`](../plans/) for current architecture plans

---

**Last Updated:** 2026-02-04  
**Documentation Version:** 2.0
