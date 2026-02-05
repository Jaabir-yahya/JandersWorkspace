# GitHub Actions Workflows

CI/CD for the Project Bridge Turborepo: **apps/api** (NestJS), **apps/web** (Next.js, package name `ledger-system-frontend`). Workflows follow [Turborepo GitHub Actions best practices](https://turbo.build/repo/docs/guides/ci-vendors/github-actions).

## Workflows

| File | Purpose | Triggers |
|------|---------|----------|
| **ci.yml** | Build and test on every push/PR | Push/PR to `main` or `develop` |
| **test-and-build.yml** | API: test, migrate, build, Docker | Push/PR when `apps/api/**`, `packages/**`, or `tests/**` change |
| **deploy-api-railway.yml** | Deploy API to Railway | Push to `main` when API/packages/Railway config change |
| **deploy-vercel.yml** | Deploy frontend to Vercel | Push to `main` when `apps/web/**` or `packages/**` change |

## Best practices in use

- **Checkout:** `actions/checkout@v4` with `fetch-depth: 2` for Turbo change detection.
- **Node:** `actions/setup-node@v4` with `node-version: "24"`, `cache: "npm"`, `cache-dependency-path: package-lock.json`.
- **Turbo cache:** `actions/cache@v4` for `.turbo` with key `${{ runner.os }}-turbo-*` to speed up repeated builds.
- **Timeouts:** Jobs have `timeout-minutes` to avoid hung runs (CI: 20, test-and-build: 25, deploy: 10–15).
- **Strict CI:** Type check and unit tests must pass (no `continue-on-error`).
- **Optional:** Turbo Remote Caching via `TURBO_TOKEN` + `TURBO_TEAM` (uncomment in ci.yml to use).

## Required secrets and variables

### Railway (deploy-api-railway.yml)

- **Secrets:** `RAILWAY_TOKEN` (Railway API token; Account → Tokens).
- **Variables:** `RAILWAY_PUBLIC_URL` (e.g. `https://your-service.up.railway.app`). Optional: `RAILWAY_SERVICE_NAME` — set to the **exact** service name from Railway (Project → service name); leave empty for single-service projects.

### Vercel (deploy-vercel.yml)

- **Secrets:** `VERCEL_TOKEN` (Vercel API token).
- **Variables:** `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `NEXT_PUBLIC_API_URL` (API URL for the frontend; can be empty for build).

## Local usage (match CI)

- **Node:** 24.x (see root `package.json` engines).
- **Install:** From repo root run `npm ci` (or `npm install` after changing workspaces).
- **Build API:** `npm run build:api` or `turbo run build --filter=@project-bridge/api`.
- **Build web:** `turbo run build --filter=ledger-system-frontend`.
- **Test API:** `npm run test:api`.
- **Prisma:** `npm run db:migrate` or `cd packages/database && npx prisma migrate deploy`.

## Naming reference

- **API:** `apps/api`, package `@project-bridge/api`.
- **Web:** `apps/web`, package `ledger-system-frontend` (use in turbo filters).
- **Database:** `@project-bridge/database` (Prisma in `packages/database`).

Obsolete apps `bridge-admin` and `bridge-perfect` are removed; only **apps/api** and **apps/web** are used.

**Lockfile:** If `package-lock.json` references removed workspaces, run `npm install` at repo root once so CI (`npm ci`) succeeds.

## Deployment pipeline completion

- **CI (ci.yml):** On push/PR to `main` or `develop`: install → Turbo build (generate then build all) → lint → type-check → test. No remote Turbo cache by default (`TURBO_REMOTE_ONLY: false`); set `TURBO_TOKEN` and `TURBO_TEAM` to enable.
- **API Integration (test-and-build.yml):** On API/packages/tests changes: install → Turbo build → migrate test DB → integration tests → (on `main`) Docker build from `apps/api/Dockerfile` and health check.
- **Railway (deploy-api-railway.yml):** On push to `main` when API/packages change: `railway up --ci`. Uses `railway.json`: `dockerfilePath: apps/api/Dockerfile`, `dockerContext: .`. Requires `RAILWAY_TOKEN`, `RAILWAY_PUBLIC_URL`; optional `RAILWAY_SERVICE_NAME`.
- **Vercel (deploy-vercel.yml):** On push to `main` when `apps/web/**` or packages change: Turbo build frontend → `vercel --prod`. Set root directory to `apps/web` in Vercel project settings. Requires `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
