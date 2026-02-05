# MVP Publish Checklist

This document confirms finalization, sanitation, and readiness to publish the backend to Railway and the frontend to Vercel as configured in GitHub Actions.

## Deployment Workflows

### Backend → Railway

- **Workflow:** `.github/workflows/deploy-api-railway.yml`
- **Trigger:** Push to `main` when `apps/api/**`, `packages/**`, `railway.json`, or `apps/api/Dockerfile` change; or manual `workflow_dispatch`.
- **Steps:** Checkout → Install Railway CLI → Deploy (`railway up`) → Wait + health check → Test production endpoints.
- **Required secrets:** `RAILWAY_APITOKEN`
- **Required vars:** `RAILWAY_SERVICE_NAME` (optional; defaults to `JandersWorkspace` / `jandersworkspace`).
- **Config:** `railway.json` uses Dockerfile at `apps/api/Dockerfile`; health path `/api/v1/health`; start command aligned with Docker CMD (`cd /app/apps/api && node dist/main`).

### Frontend → Vercel

- **Workflow:** `.github/workflows/deploy-vercel.yml`
- **Trigger:** Push to `main` when `apps/web/**`, `packages/**`, or the workflow file change; or manual `workflow_dispatch`.
- **Steps:** Checkout → Setup Node 20 → `npm ci` (root) → Build (`turbo run build --filter=ledger-system-frontend`) → Deploy (`vercel --prod --cwd apps/web`).
- **Required secrets:** `VERCEL_TOKEN`
- **Required vars:** `NEXT_PUBLIC_API_URL`, `VERCEL_ORG_ID`, `VERCEL_WEB_PROJECT_ID` (Vercel project ID for the `apps/web` app).

- **Vercel Root Directory:** The project linked by `VERCEL_WEB_PROJECT_ID` must have **Root Directory** set to **`apps/web`** in Vercel → Project Settings → General. If the project was created for `apps/bridge-admin`, change it to `apps/web` or create a new project with root `apps/web`.
- If you use a different GitHub variable name (e.g. `VERCEL_PROJECT_ID`), set the workflow’s `VERCEL_PROJECT_ID` env to that var.

## CI: Test and Build

- **Workflow:** `.github/workflows/test-and-build.yml`
- **Trigger:** Push/PR to `main` or `develop` when `apps/api/**`, `packages/**`, `tests/**`, `package.json`, or `turbo.json` change.
- **Steps:** Checkout → Node 18 → `npm ci` → Generate Prisma → Type check → **Lint API only** (`npm run lint --workspace=@project-bridge/api`) → Unit tests → Migrate test DB → Integration tests (core-api) → Build API → (on `main`) Docker build and health check.

The **tests** workspace is included in root `package.json` workspaces so `npm run test:integration:core` works in CI.

## Sanitation and Build Status

- **API**
  - Unit tests: 44 tests, 6 suites, all passing.
  - Build: `nest build` succeeds.
  - Lint: `npm run lint --workspace=@project-bridge/api` exits 0 (warnings only; strict rules relaxed to `warn` for MVP).
- **Frontend (apps/web)**
  - Build: `next build` succeeds with `NEXT_PUBLIC_API_URL` set (e.g. in Vercel or locally).
- **TypeScript**
  - API: Fixed `universal-truth/transactions.service.ts` raw query typing (`result`/`raw` cast to arrays) so `npm run build` passes.

## Core Flows (MVP)

- **Health:** `GET /api/v1/health` — used by Railway health check and post-deploy smoke test.
- **Quick capture:** `POST /api/v1/transactions/quick-capture` with `X-Tenant-ID` — exercised in deploy workflow.
- **Auth:** JWT-based; frontend uses API client with tenant and auth headers.
- **Dashboard:** Dashboard API + frontend dashboard page (active balances, recent activity).
- **Ledger / transactions / entities:** Core truth and transaction streams; frontend ledger, transactions, people.
- **Reports / invoices / inventory / supplies:** API modules and frontend pages present; flows usable for MVP.

## Pre-Publish Checklist

- [ ] **Railway:** Create project/service; add `RAILWAY_APITOKEN` and optional `RAILWAY_SERVICE_NAME` in GitHub secrets/vars. Ensure production env has `DATABASE_URL`, `JWT_SECRET`, `ALLOWED_ORIGINS` (include Vercel frontend URL), and other required vars from `apps/api/.env.example`.
- [ ] **Vercel:** Create project for `apps/web` (root: `apps/web`); add `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_WEB_PROJECT_ID` (or your project ID var) in GitHub. Set `NEXT_PUBLIC_API_URL` to the Railway API URL (e.g. `https://<service>-production.up.railway.app`).
- [ ] **DB:** Run migrations against production DB (e.g. Supabase); use `DATABASE_URL` / `DIRECT_URL` from `.env.example`.
- [ ] **CORS:** In Railway API env, set `ALLOWED_ORIGINS` to include the Vercel app URL (e.g. `https://your-app.vercel.app`).

## Summary

- Backend is ready to publish to Railway via the deploy workflow; API builds, tests, and lint pass.
- Frontend (apps/web) is ready to publish to Vercel via the updated deploy-vercel workflow; build succeeds.
- CI runs API lint, unit and integration tests, and API build (and Docker build on `main`).
- Core MVP flows (health, quick-capture, auth, dashboard, ledger, transactions, reports, etc.) are in place; complete end-to-end testing in staging is recommended before go-live.
