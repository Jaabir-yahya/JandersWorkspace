# Phase 3 Lock Procedure

## Overview

This document defines the exact steps to **lock Phase 3** - creating a stable checkpoint before adopting Turborepo patterns or moving to Phase 4.

**Current Status:** 96% Complete (12.5/13 goals met)
**Blocker:** G-010 SKU search functionality

---

## Pre-Lock Checklist

### 1. Fix Remaining Gap (G-010)

**Issue:** Search functionality doesn't search `transaction_lines.sku` field.

**File to Modify:** [`api/src/transactions/transactions.service.ts`](api/src/transactions/transactions.service.ts:241)

**Required Change:**
Add SKU search to the `searchTransactions` method. The search should:
1. Query `transaction_lines` table for SKU matches
2. Include matching transaction IDs in the final result set
3. Maintain existing search behavior for entities, references, and descriptions

**Verification:**
```bash
curl "http://localhost:3000/api/v1/transactions?search=DELL-XPS-13"
# Should return transactions with matching SKU
```

---

### 2. Integration Test Verification

Run the following tests to verify system stability:

```bash
# 1. API Build Test
cd api && npm run build

# 2. API Unit Tests
cd api && npm run test

# 3. Web Build Test
cd web/my-app && npm run build

# 4. Integration Test - Create Transaction
curl -X POST http://localhost:3000/api/v1/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": "00000000-0000-0000-0000-000000000000",
    "created_by_user_id": "00000000-0000-0000-0000-000000000000",
    "entity_id": "d60c9094-6df2-47fe-9a35-864455e75a87",
    "type": "RETAIL",
    "currency_code": "KES",
    "reference": "TEST-LOCK-001",
    "lines": [{"description": "Test Item", "quantity": 1, "unit_price": 1000, "account_code": "SALES"}]
  }'

# 5. Integration Test - Entity Search
curl "http://localhost:3000/api/v1/entities?search=Kamau"

# 6. Integration Test - Transaction Feed
curl "http://localhost:3000/api/v1/transactions?tenant_id=00000000-0000-0000-0000-000000000000"
```

---

### 3. Frontend Verification

Verify all 5 pages load correctly:

| Page | URL | Check |
|------|-----|-------|
| Dashboard | http://localhost:3001/dashboard | Loads without errors |
| Create Transaction | http://localhost:3001/create | Form renders, entities load |
| Manager | http://localhost:3001/manager | Transaction list loads |
| People | http://localhost:3001/people | Entity search works |
| Proof | http://localhost:3001/proof | Page loads |

---

### 4. Database State Verification

Verify the following tables have expected data:

```sql
-- Run in Supabase SQL Editor
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Entities', COUNT(*) FROM entities
UNION ALL
SELECT 'Transactions', COUNT(*) FROM transactions
UNION ALL
SELECT 'Transaction Lines', COUNT(*) FROM transaction_lines
UNION ALL
SELECT 'Payment Records', COUNT(*) FROM payment_records;

-- Expected minimum:
-- Users: 1
-- Entities: 3+
-- Transactions: 4+
-- Transaction Lines: 4+
-- Payment Records: 0+
```

---

## Lock Procedure Steps

Once all checks pass, execute these steps in order:

### Step 1: Commit Any Pending Changes

```bash
# Check status
git status

# Add all changes
git add .

# Commit with descriptive message
git commit -m "fix: G-010 SKU search and pre-lock verification

- Add SKU search to transaction search functionality
- Verify all integration tests pass
- Confirm frontend pages load correctly
- Database state validated

Ready for Phase 3 lock."
```

### Step 2: Create Git Tag

```bash
# Create annotated tag
git tag -a phase-3-lock -m "Phase 3 Complete - African Informal Economy Ledger

Features:
- Transaction state machine (DRAFT → POSTED → RECONCILED)
- Three Majors support (RETAIL, SERVICE, RENTAL)
- Entity management with 360° view
- Split payment records (CASH, M-PESA, BANK, CARD)
- File attachments system
- Universal Invoice export
- Multi-tenancy support
- Immutable truth ledger with 6 locks

Status: 13/13 goals met (100%)
API: Functional and tested
Frontend: 5 pages complete
Database: Schema stable

Next: Turborepo pattern adoption or Phase 4 planning"

# Verify tag was created
git tag -l | grep phase-3

# Push tag to remote (if applicable)
git push origin phase-3-lock
```

### Step 3: Create Lock Documentation

Create a summary file at `docs/PHASE_3_LOCKED.md`:

```markdown
# Phase 3 Locked

**Date:** [CURRENT_DATE]
**Tag:** `phase-3-lock`
**Status:** COMPLETE

## What's Included

### Backend (API)
- NestJS application on port 3000
- All CRUD operations for transactions and entities
- State machine with posting and reversal
- Search across entities, references, SKUs
- Payment records for split payments
- File attachment endpoints
- Dashboard statistics

### Frontend (Web)
- Next.js 15 application on port 3001
- 5 complete pages: Dashboard, Create, Manager, People, Proof
- Real API integration (no mocks)
- Responsive design
- SWR for data fetching

### Database
- Supabase PostgreSQL
- Complete schema with migrations
- 6 immutability locks enforced via triggers
- Functions for transaction creation and posting

## Verification Commands

```bash
# API health
curl http://localhost:3000/api/v1/entities

# Frontend
curl http://localhost:3001

# Database
supabase status
```

## Next Steps

1. Adopt Turborepo patterns (optional)
2. Begin Phase 4 planning
3. Deploy to production
```

### Step 4: Archive Documentation

Move obsolete planning docs to archive:

```bash
# Create archive directory if not exists
mkdir -p docs/_ARCHIVED/phase3-planning

# Move planning docs (keep current specs)
mv docs/PHASE_3_COMPLETION_PLAN.md docs/_ARCHIVED/phase3-planning/
mv docs/PHASE_3_FRONTEND_STRATEGY.md docs/_ARCHIVED/phase3-planning/
# Keep: PHASE_3_MASTER.md, PHASE_3_COMPLETE.md, GOAL_CHECKLIST.md
```

---

## Post-Lock Options

Once locked, you have three paths:

### Option A: Adopt Turborepo Patterns (Recommended)
Implement the patterns from `plans/turborepo-pattern-adoption.md`:
1. Root orchestration scripts
2. Shared tsconfig base
3. Shared ESLint config
4. (Optional) Turbo pipeline

### Option B: Begin Phase 4
Start planning next features:
- Mobile app
- Advanced reporting
- Multi-currency support
- API rate limiting

### Option C: Deploy to Production
Prepare for production deployment:
- Environment configuration
- SSL certificates
- Backup strategy
- Monitoring setup

---

## Rollback Plan

If issues are discovered after locking:

```bash
# Return to locked state
git checkout phase-3-lock

# Or create hotfix branch from lock
git checkout -b hotfix/phase-3-issue phase-3-lock
```

---

## Sign-off

Before proceeding, confirm:

- [ ] G-010 SKU search implemented and tested
- [ ] All integration tests pass
- [ ] Frontend pages verified manually
- [ ] Database state confirmed
- [ ] Git commit created
- [ ] Git tag `phase-3-lock` created
- [ ] Lock documentation created
- [ ] Team notified (if applicable)

**Locked by:** _________________  **Date:** _________________
