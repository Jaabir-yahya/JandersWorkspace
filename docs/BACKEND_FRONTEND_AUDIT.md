# Backend–Frontend Connectivity & Finalization Audit

**Date:** 2026-02-05

This document summarizes whether the backend (NestJS API) and frontend (Next.js web) are final, work together for the core purpose (Truth Ledger for Nairobi's business owners), and how auth and tenant control are connected.

---

## 1. Core Purpose Alignment

| Goal | Backend | Frontend | Connected? |
|------|---------|----------|------------|
| Truth Ledger (transactions, entities, items, payments) | ✅ Modules: transactions, entities (via ledger), inventory/supplies, payments, dashboard | ✅ Pages: dashboard, inventory, invoices, supplies, ledger, reports | ⚠️ Partially (see gaps below) |
| Multi-tenant | ✅ Tenant isolation via `req.user.tenantId` and/or `tenant_id` query/header | ❌ No tenant context; no login; no `tenant_id` sent | ❌ No |
| Auth (JWT + Supabase) | ✅ AuthGuard, sign-in/sign-up, `user_metadata.tenant_id` | ✅ Token in `localStorage.auth_token`; 401 → redirect `/login` | ⚠️ No login page; no tenant selection |

---

## 2. Critical Connection Issues

### 2.1 API Base URL Missing `/api/v1`

- **Backend:** All routes are under global prefix `api/v1` (see `main.ts`: `app.setGlobalPrefix('api/v1')`). Example: `GET /api/v1/dashboard/stats`.
- **Frontend:** `lib/api-client.ts` uses `baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"` with **no** `/api/v1`.
- **Result:** Frontend calls `http://localhost:3001/dashboard/stats` → backend expects `http://localhost:3001/api/v1/dashboard/stats` → **404** (or wrong port if API runs on 3000).
- **Fix:** Set `baseURL` to include `/api/v1`, e.g. `const baseURL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001") + "/api/v1"` or configure `NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1`.

### 2.2 Tenant ID Not Sent by Frontend

- **Backend:** Dashboard and transactions (main controller) **require** `tenant_id` as query param and validate against `req.user.tenantId`. Invoices, supplies, payments, reporting use `req.user.tenantId` only (from JWT).
- **Frontend:** `dashboardApi.stats()` and `dashboardApi.recentActivity()` call API **without** any `tenant_id`. `transactionsApi.list(params)` does not include `tenant_id` in params.
- **Result:** Authenticated dashboard/transactions list calls fail (backend throws "tenant_id is required" or validation error). In dev, dashboard falls back to mock data on catch.
- **Fix:** Frontend must (1) obtain current tenant (e.g. from sign-in response or `GET /tenants/my-tenants`), (2) store selected tenant (e.g. in context or localStorage), (3) pass `tenant_id` in all dashboard and transactions API calls.

### 2.3 Dashboard API Shape Mismatch

- **Backend:** Single endpoint `GET /dashboard/stats?tenant_id=...` returns `DashboardStats` (snake_case: `total_revenue_today`, `recent_activity`, etc.).
- **Frontend:** Calls three endpoints: `stats()`, `recentActivity(10)`, `kpiData()` → `/dashboard/stats`, `/dashboard/recent-activity`, `/dashboard/kpi`. Backend has **no** `/dashboard/recent-activity` or `/dashboard/kpi`; only `/dashboard/stats` exists and already includes `recent_activity`.
- **Result:** `recentActivity` and `kpiData` return 404. Dashboard page catches errors and shows mock data.
- **Fix:** Either (1) frontend calls only `GET /dashboard/stats?tenant_id=X` and maps response to UI (totalRevenue from backend totals, recentActivity from `recent_activity`), or (2) backend adds optional routes for recent-activity and kpi that accept tenant (from user or query).

### 2.4 No Login Page / Auth Entrypoint

- **Backend:** `POST /auth/sign-in` returns `{ data: { user: { id, email, tenantId, ... }, session: { accessToken, refreshToken, expiresAt } } }`.
- **Frontend:** Redirects to `/login` on 401 and expects `auth_token` in localStorage, but there is **no** `/login` route or page in `apps/web/app`.
- **Result:** Users cannot sign in; 401 always redirects to a non-existent login page.
- **Fix:** Add login page (e.g. `app/login/page.tsx`) that calls `POST /api/v1/auth/sign-in`, stores `accessToken` as `auth_token` and user/tenantId in state or storage, then redirects to dashboard.

---

## 3. Auth Flow Summary

| Step | Backend | Frontend | Status |
|------|---------|-----------|--------|
| Sign-in | POST /auth/sign-in → JWT + user.tenantId | No login page | ❌ |
| Token storage | N/A | localStorage `auth_token` (used by api-client) | ✅ (if token set) |
| Request auth | AuthGuard: Bearer token → req.user (id, email, tenantId, role) | api-client interceptor adds Authorization | ✅ |
| Tenant in JWT | user_metadata.tenant_id → req.user.tenantId | Not read; no tenant_id sent in queries | ❌ |
| 401 handling | UnauthorizedException | Clear token, redirect /login | ⚠️ (no /login) |

---

## 4. Tenant Control Summary

| Aspect | Backend | Frontend | Status |
|--------|---------|----------|--------|
| Tenant from JWT | req.user.tenantId from Supabase user_metadata | N/A | ✅ |
| Tenant in query | dashboard, transactions: require tenant_id and validate vs req.user.tenantId | Not sent | ❌ |
| Tenant selection | GET /tenants/my-tenants (auth) returns list; GET /tenants/slug/:slug (public) | Not used | ❌ |
| Public/manual flow | Dashboard public: GET /dashboard/stats/public with X-Tenant-Id; quick-capture with X-Tenant-Id | Not used | N/A for main web app |

---

## 5. API Type-Check and Build (Current State)

- **API type-check:** **Fails** (~40 errors). See `docs/FINALIZATION_STATUS.md`. Causes: schema/code mismatches (Transaction: no `party`, `patterns`, `insights`; Entity: `entityType` not `type`; ledger/reporting JSON typing; universal-truth spec imports).
- **Web build:** **Passes** (per FINALIZATION_STATUS and FINALIZATION_SUMMARY).
- **Conclusion:** Backend is not type-safe final until those errors are fixed; frontend build is fine.

---

## 6. What Works End-to-End

- **Health:** GET /api/v1/health (no auth) — frontend could call it if baseURL fixed.
- **Quick-capture (no JWT):** POST /api/v1/transactions/quick-capture with X-Tenant-Id — used by e2e and manual/bot flows; not used by current web UI.
- **Core API e2e:** With MockAuthGuard, transactions CRUD and dashboard stats work when tenant_id and auth are provided (see `tests/integration/core-api.e2e-spec.ts`).
- **CORS:** Backend allows localhost in development when ALLOWED_ORIGINS is unset; credentials true. Frontend must use correct origin (e.g. http://localhost:3000 for Next.js).

---

## 7. Recommended Fix Order

1. **Frontend baseURL:** Add `/api/v1` to API base URL so all requests hit the correct prefix.
2. **Frontend tenant context:** After login (or for dev), get current tenant (sign-in response or GET /tenants/my-tenants); store in context/localStorage; pass `tenant_id` in dashboard and transactions API calls.
3. **Frontend dashboard API:** Use single `GET /dashboard/stats?tenant_id=X`; map backend `DashboardStats` (snake_case, includes `recent_activity`) to the dashboard page state; remove or stub calls to non-existent recent-activity and kpi endpoints.
4. **Login page:** Add `/login` page; call POST /api/v1/auth/sign-in; store token and user/tenantId; redirect to dashboard.
5. **API type-check:** Resolve schema/code mismatches (FINALIZATION_STATUS) so CI and type-check pass.

After (1)–(4), the core flow (sign-in → select tenant → dashboard + transactions) can work. After (5), the project is finalized from a build/type-safety perspective.

---

## 8. References

- `README.md` — product goals, quick start, MVP testing
- `docs/FINALIZATION_STATUS.md` — what’s complete / not complete, API type errors
- `docs/FINALIZATION_SUMMARY.md` — goals vs state, verification
- `docs/TURBOREPO_FINALIZATION.md` — monorepo connections, verification
- `apps/api/src/main.ts` — global prefix, CORS
- `apps/web/lib/api-client.ts` — baseURL, auth header, 401 redirect
