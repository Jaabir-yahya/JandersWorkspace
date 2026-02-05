# Turborepo Truth Backend & Frontend API Verification

This doc summarizes how the monorepo relies on **truth** (single source of truth) and how the frontend **efficiently** uses the API with **direct return** for manual use cases.

---

## 1. Truth Backend & API

### Single source of truth

- **Schema**: `packages/database/prisma/schema.prisma` — defines models (Tenant, Transaction, Entity, Account, etc.). Prisma client is generated and used by the API.
- **Shared types**: `packages/types` — `ApiResponse<T>`, `ApiError` used across API and frontend.
- **Universal Truth**: Schema includes “Universal Truth” models (`Account`, `TransactionReason`, `Proof`) and migrations (`002_merge_universal_truth.sql`). API reads/writes these via Prisma.

### API behaviour (direct return)

- Controllers return **data directly** (or wrapped in `{ data }` where the frontend expects it). No extra transformation layer.
- **Dashboard**: `GET /api/v1/dashboard/stats?tenant_id=...` → `DashboardService.getDashboardStats(tenantId)` runs Prisma queries (revenue, transactions, outstanding, recent_activity) and returns one object.
- **Transactions**: `POST/GET /api/v1/transactions` → `TransactionsService` create/list with tenant isolation; response shape matches frontend expectations (e.g. `total_amount`, `status`, `lines`).
- **Quick capture**: `POST /api/v1/transactions/quick-capture` — manual sale/expense with minimal payload; backend creates transaction and returns it (direct return for manual entry).

So the backend is “truth”: one schema, one Prisma client, direct return of domain data.

---

## 2. Frontend Efficient Use of the API

### Central client and unwrap

- **Base URL**: `api-client.ts` uses `NEXT_PUBLIC_API_URL` (default `http://localhost:3001`) and `baseURL = ... + "/api/v1"`.
- **Auth**: Request interceptor adds `Authorization: Bearer <token>` from `localStorage.auth_token`; response interceptor handles 401 (clear token, redirect to `/login`).
- **Tenant**: `getCurrentTenantId()` / `setCurrentTenantId(tenantId)` from `localStorage.current_tenant_id` (set after login). All tenant-scoped calls pass `tenant_id` (or use this).

### Direct return (maximised for manual use)

- **apiClient** methods unwrap once:  
  `api.get<ApiResponse<T>>(url, config).then((res) => res.data.data)`  
  So callers get **T** directly, not `{ data: T }`. One call → one type-safe value.
- **Typed modules** in `lib/api/`:
  - `dashboardApi.stats(tenantId?)` → `Promise<DashboardStats>` (backend snake_case mapped to frontend camelCase in `dashboard.ts`).
  - `transactionsApi.list(params?)` → `Promise<TransactionListResponse>`; `.get(id)`, `.create(data)`, `.update`, `.delete`, `.reverse`, `.summary`, `.balance` all return typed data.
  - `inventoryApi`, `suppliesApi`, `invoicesApi`, `reportingApi`, `containersApi` follow the same pattern: single call, direct typed result.

So the frontend is efficient: one HTTP call per use case, no extra wrapping; manual flows (e.g. quick add, dashboard, transaction list) get **direct return** from the API.

---

## 3. Test & Build Verification (Summary)

| Step | Command | Result (as of last run) |
|------|--------|---------------------------|
| Type-check (API) | `cd apps/api && npm run type-check` | ✅ Pass |
| API unit tests | `cd apps/api && npm run test` | ⚠️ 4 suites fail (spec/implementation drift: e.g. `result.amount` vs `total_amount`, mocks for ledger/dashboard/payment-records) |
| API build | `cd apps/api && npm run build` | ✅ Pass |
| Web build | `cd apps/web && npm run build` | ✅ Pass (after adding `useRouter` import in `app/inventory/containers/[id]/page.tsx`) |
| Turbo (CI) | `npm run type-check`, `npm run test:api`, `npm run test:integration:core`, `npm run build:api` | Use in CI; locally Turbo may hit TLS/keychain; run per-package if needed. |

### Core e2e (truth + API)

- **Location**: `tests/integration/core-api.e2e-spec.ts`.
- **Covers**: Health, quick-capture (sale, tenant required), transactions (create, list, get, reverse), dashboard stats — all with mock auth and tenant.
- **Run**: `npm run test:integration:core` (requires `DATABASE_URL` and migrated DB, e.g. Postgres in CI or `docker-compose up -d` then migrate).

---

## 4. Commands Reference

```bash
# Prisma (required for API type-check/build)
cd packages/database && npx prisma generate --schema=./prisma/schema.prisma

# Type-check
cd apps/api && npm run type-check

# API unit tests
cd apps/api && npm run test

# API build
cd apps/api && npm run build

# Web build
cd apps/web && npm run build

# Integration (core truth + API e2e) — needs DB
DATABASE_URL=postgresql://... npm run test:integration:core
```

---

## 5. Summary

- **Truth**: Prisma schema + shared types; API serves domain data with direct return; quick-capture and CRUD are “manual” use cases with one request → one response.
- **Frontend**: Single apiClient, unwraps `res.data.data`, typed API modules, tenant from storage; maximised direct return for manual use.
- **Pipeline**: API and web **build** successfully; type-check passes; unit tests need alignment with current service return shapes; core e2e validates truth + API when DB is available.
