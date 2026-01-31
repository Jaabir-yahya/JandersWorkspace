# Project Bridge Documentation

Welcome to the African Informal Economy Ledger (Project Bridge) documentation.

## Quick Start

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deploy the application
- **[API_CONTRACT.md](./API_CONTRACT.md)** - API reference
- **[../CONTRIBUTING.md](../CONTRIBUTING.md)** - Development workflow

## Documentation Structure

```
docs/
├── README.md              # This file
├── PRD.md                 # Product Requirements Document
├── API_CONTRACT.md        # API specification
├── DEPLOYMENT.md          # Deployment guide
├── DEPLOYMENT_CHECKLIST.md # Pre-deployment checklist
├── GOAL_CHECKLIST.md      # Project goals tracking
├── openapi.yaml           # OpenAPI specification
├── PHASE_1_SPEC.md        # Phase 1 specification
├── PHASE_2_SPEC.md        # Phase 2 specification
├── PHASE_3_COMPLETE.md    # Phase 3 completion summary
├── PHASE_3_COMPLETION_PLAN.md # Phase 3 completion plan
├── PHASE_3_FRONTEND_STRATEGY.md # Frontend strategy
├── PHASE_3_MASTER.md      # Phase 3 master document
├── archive/               # Archived documentation
│   └── frontend1/         # Old frontend implementation
└── plans/                 # Planning documents
    ├── finalization-cleanup-plan.md
    ├── phase-3-lock-procedure.md
    ├── phase3-build-infrastructure-plan.md
    ├── prisma-supabase-analysis.md
    └── turborepo-pattern-adoption.md
```

## Key Documents

### For Developers
- **[API_CONTRACT.md](./API_CONTRACT.md)** - Complete API reference with examples
- **[../CONTRIBUTING.md](../CONTRIBUTING.md)** - How to contribute and development workflow
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - How to deploy the application

### For Understanding the System
- **[PRD.md](./PRD.md)** - Product requirements and vision
- **[PHASE_3_COMPLETE.md](./PHASE_3_COMPLETE.md)** - What was built in Phase 3
- **[PHASE_3_MASTER.md](./PHASE_3_MASTER.md)** - Phase 3 detailed specification

### For Operations
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Pre-deployment verification
- **[GOAL_CHECKLIST.md](./GOAL_CHECKLIST.md)** - Project goals status

## API Quick Reference

### Base URL
```
http://localhost:3000/api/v1
```

### Key Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/transactions` | POST | Create transaction |
| `/transactions` | GET | List/search transactions |
| `/transactions/:id` | GET | Get transaction details |
| `/transactions/:id/reverse` | POST | Reverse transaction |
| `/dashboard/metrics` | GET | Dashboard metrics |
| `/dashboard/reconciliation` | GET | Reconciliation summary |

See [API_CONTRACT.md](./API_CONTRACT.md) for full details.

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Next.js   │────▶│   NestJS    │────▶│  Supabase   │
│   (Web)     │     │   (API)     │     │(PostgreSQL) │
│   :3001     │◀────│   :3000     │◀────│             │
└─────────────┘     └─────────────┘     └─────────────┘
```

## Version History

See [../CHANGELOG.md](../CHANGELOG.md) for version history.

## Support

- Run `npm run health-check` to verify system status
- Run `npm run verify-phase3` to verify Phase 3 completion
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for troubleshooting
