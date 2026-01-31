# Documentation Cleanup Plan

## Current Documentation Inventory

### Existing Docs (Reviewed)

| File | Purpose | Status | Action |
|------|---------|--------|--------|
| `README.md` | Project overview | ✅ Good | Update with final structure |
| `docs/PRD.md` | Phase 1 requirements | ⚠️ Outdated | Archive, link to current |
| `docs/PHASE_1_SPEC.md` | Phase 1 spec | ⚠️ Outdated | Archive |
| `docs/PHASE_2_SPEC.md` | Phase 2 spec | ⚠️ Partial | Update or archive |
| `docs/PHASE_3_MASTER.md` | Phase 3 master | ✅ Current | Keep, update links |
| `docs/PHASE_3_COMPLETE.md` | Phase 3 completion | ✅ Current | Keep |
| `docs/PHASE_3_COMPLETION_PLAN.md` | Phase 3 plan | ⚠️ Completed | Archive |
| `docs/PHASE_3_FRONTEND_STRATEGY.md` | Frontend strategy | ✅ Current | Keep |
| `docs/API_CONTRACT.md` | API documentation | ✅ Current | Keep, update for Phase 4 |
| `docs/DEPLOYMENT.md` | Deployment guide | ✅ Current | Keep |
| `docs/DEPLOYMENT_CHECKLIST.md` | Checklist | ✅ Current | Keep |
| `docs/GOAL_CHECKLIST.md` | Goals | ⚠️ Outdated | Update or remove |
| `docs/openapi.yaml` | OpenAPI spec | ✅ Current | Keep, auto-generate |
| `docs/archive/frontend1/` | Old frontend | ✅ Archived | Keep in archive |
| `PHASE3_LOCKED.md` | Phase 3 lock file | ✅ Current | Keep |
| `plans/PRISMA_MIGRATION_PLAN.md` | Migration plan | ✅ Current | Keep |
| `plans/TENANT_TIER_ARCHITECTURE.md` | New: Tenant tiers | ✅ New | Keep |
| `plans/PHASE_4_ARCHITECTURE.md` | New: Phase 4 | ✅ New | Keep |

### Proposed New Structure

```
docs/
├── README.md                    # Documentation index
├── ARCHITECTURE.md              # High-level architecture
├── GETTING_STARTED.md           # Quick start guide
├── API/
│   ├── README.md               # API overview
│   ├── AUTHENTICATION.md       # Auth flows
│   ├── WEBHOOKS.md            # Webhook handling
│   └── openapi.yaml           # OpenAPI spec
├── DEPLOYMENT/
│   ├── README.md              # Deployment overview
│   ├── LOCAL.md               # Local development
│   ├── STAGING.md             # Staging setup
│   └── PRODUCTION.md          # Production deployment
├── DEVELOPMENT/
│   ├── README.md              # Dev guide
│   ├── DATABASE.md            # Database guide
│   ├── TESTING.md             # Testing guide
│   └── CONTRIBUTING.md        # Contribution guidelines
├── PHASES/
│   ├── PHASE_1.md             # Phase 1 summary (archived)
│   ├── PHASE_2.md             # Phase 2 summary (archived)
│   ├── PHASE_3.md             # Phase 3 summary
│   └── PHASE_4.md             # Phase 4 roadmap
├── PLANS/
│   ├── TENANT_TIERS.md        # Tenant architecture
│   ├── PRISMA_MIGRATION.md    # Migration plan
│   └── FUTURE.md              # Future ideas
└── archive/                   # Old docs
    ├── frontend1/
    ├── PRD.md
    ├── PHASE_1_SPEC.md
    └── PHASE_2_SPEC.md
```

## Cleanup Actions

### 1. Create Documentation Index

Create `docs/README.md` as the entry point:

```markdown
# Project Bridge Documentation

## Quick Links

- [Getting Started](GETTING_STARTED.md) - Set up your development environment
- [Architecture Overview](ARCHITECTURE.md) - System architecture and design decisions
- [API Documentation](API/README.md) - API reference and examples

## By Role

### I'm a Developer
1. [Getting Started](GETTING_STARTED.md)
2. [Development Guide](DEVELOPMENT/README.md)
3. [Database Guide](DEVELOPMENT/DATABASE.md)

### I'm DevOps
1. [Deployment Overview](DEPLOYMENT/README.md)
2. [Production Deployment](DEPLOYMENT/PRODUCTION.md)

### I'm a Product Manager
1. [Phase 3 Summary](PHASES/PHASE_3.md) - Current state
2. [Phase 4 Roadmap](PHASES/PHASE_4.md) - What's coming

## Project Phases

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 | ✅ Complete | Core data infrastructure (Truth Ledger) |
| Phase 2 | ✅ Complete | State machine, search, entity history |
| Phase 3 | ✅ Complete | Frontend, dashboard, attachments |
| Phase 4 | 🚧 Planned | Auth, subscriptions, M-Pesa, WhatsApp |

## Architecture Decision Records

- [ADR-001: Prisma over Supabase Client](../plans/PRISMA_MIGRATION.md)
- [ADR-002: Tenant Tier Architecture](../plans/TENANT_TIERS.md)
```

### 2. Archive Old Documentation

Move to `docs/archive/`:
- `docs/PRD.md` → `docs/archive/PRD.md`
- `docs/PHASE_1_SPEC.md` → `docs/archive/PHASE_1_SPEC.md`
- `docs/PHASE_2_SPEC.md` → `docs/archive/PHASE_2_SPEC.md`
- `docs/PHASE_3_COMPLETION_PLAN.md` → `docs/archive/PHASE_3_COMPLETION_PLAN.md`
- `docs/GOAL_CHECKLIST.md` → `docs/archive/GOAL_CHECKLIST.md`

### 3. Consolidate Phase Documentation

Create `docs/PHASES/PHASE_3.md`:

```markdown
# Phase 3: Frontend & Integration

**Status**: ✅ COMPLETE  
**Date**: 2026-01-31  
**Tag**: `v0.3.0-phase3-locked`

## Summary

Phase 3 delivered a complete frontend for Project Bridge, transforming the headless API into a usable product.

## Deliverables

### Frontend (Next.js 15)
- [x] Dashboard with analytics
- [x] Transaction feed with filtering
- [x] Create transaction form
- [x] Entity management (People/CRM)
- [x] Proof vault for attachments
- [x] Transaction manager (post/reverse)

### Backend Enhancements
- [x] Dashboard service with stats
- [x] Attachment service (Supabase Storage)
- [x] Payment records for split payments
- [x] Search functionality

### Database
- [x] Prisma ORM migration
- [x] Complete schema with relations

## Technical Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: NestJS, Prisma, PostgreSQL
- **Storage**: Supabase Storage

## Documentation

- [Phase 3 Master](../PHASE_3_MASTER.md)
- [Phase 3 Frontend Strategy](../PHASE_3_FRONTEND_STRATEGY.md)
- [API Contract](../API/API_CONTRACT.md)

## What's Next

See [Phase 4 Roadmap](PHASE_4.md)
```

### 4. Update Main README

Update `README.md` with:
- Clear project description aligned with pitch
- Quick start instructions
- Link to full documentation
- Architecture diagram
- Contributing guidelines

### 5. Create Getting Started Guide

Create `docs/GETTING_STARTED.md`:

```markdown
# Getting Started with Project Bridge

## Prerequisites

- Node.js 18+
- PostgreSQL 15+ (or Supabase account)
- npm or yarn

## Quick Start

```bash
# Clone repository
git clone <repo-url>
cd JandersWorkspace

# Install dependencies
npm run setup

# Set up environment
cp api/.env.example api/.env
cp web/my-app/.env.example web/my-app/.env.local

# Edit .env files with your credentials

# Start development
npm run dev
```

## Development Workflow

1. API runs on http://localhost:3000
2. Web runs on http://localhost:3001
3. See [Development Guide](DEVELOPMENT/README.md) for details

## Next Steps

- [Architecture Overview](ARCHITECTURE.md)
- [Database Guide](DEVELOPMENT/DATABASE.md)
- [API Documentation](API/README.md)
```

## Execution Checklist

- [ ] Create `docs/README.md` (index)
- [ ] Create `docs/GETTING_STARTED.md`
- [ ] Create `docs/ARCHITECTURE.md`
- [ ] Create `docs/PHASES/PHASE_3.md`
- [ ] Create `docs/PHASES/PHASE_4.md`
- [ ] Move old docs to `docs/archive/`
- [ ] Update root `README.md`
- [ ] Update `CONTRIBUTING.md` links
- [ ] Verify all internal links work
- [ ] Add table of contents to long docs

## Migration Script

```bash
#!/bin/bash
# scripts/cleanup-docs.sh

# Create new structure
mkdir -p docs/{API,DEPLOYMENT,DEVELOPMENT,PHASES,PLANS}
mkdir -p docs/archive

# Archive old docs
mv docs/PRD.md docs/archive/
mv docs/PHASE_1_SPEC.md docs/archive/
mv docs/PHASE_2_SPEC.md docs/archive/
mv docs/PHASE_3_COMPLETION_PLAN.md docs/archive/
mv docs/GOAL_CHECKLIST.md docs/archive/

# Move plans to docs/PLANS/
cp plans/TENANT_TIER_ARCHITECTURE.md docs/PLANS/TENANT_TIERS.md
cp plans/PHASE_4_ARCHITECTURE.md docs/PLANS/
cp plans/PRISMA_MIGRATION_PLAN.md docs/PLANS/PRISMA_MIGRATION.md

echo "Documentation cleanup complete"
echo "Next: Run 'npm run docs:verify' to check links"
```

## Success Criteria

- [ ] New developer can onboard in < 15 minutes
- [ ] All docs have clear navigation
- [ ] No broken internal links
- [ ] Archive clearly marked as historical
- [ ] Search functionality works (if using docs site)
