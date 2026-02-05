# GitHub Actions Workflows

CI/CD for the Project Bridge turborepo: **apps/api** (NestJS), **apps/web** (Next.js, package name `ledger-system-frontend`).

## Workflows

| File | Purpose | Triggers |
|------|---------|----------|
| **ci.yml** | Build and test on every push/PR | Push/PR to `main` or `develop` |
| **test-and-build.yml** | API-focused: test, migrate, build, Docker | Push/PR to `main` or `develop` when `apps/api/**`, `packages/**`, or `tests/**` change |
| **deploy-api-railway.yml** | Deploy API to Railway | Push to `main` when `apps/api/**`, `packages/**`, or Railway config change |
| **deploy-vercel.yml** | Deploy frontend (apps/web) to Vercel | Push to `main` when `apps/web/**` or `packages/**` change |

## Required secrets and variables

### Railway (deploy-api-railway.yml)

- **Secrets:** `RAILWAY_TOKEN` (Railway API token; Account → Tokens).
- **Variables:** `RAILWAY_SERVICE_NAME` (Railway service name), `RAILWAY_PUBLIC_URL` (e.g. `https://your-service.up.railway.app`).

### Vercel (deploy-vercel.yml)

- **Secrets:** `VERCEL_TOKEN` (Vercel API token).
- **Variables:** `VERCEL_ORG_ID`, `VERCEL_WEB_PROJECT_ID`, `NEXT_PUBLIC_API_URL` (API URL for the frontend).

## Local usage (match CI)

- **Node:** 24.x (see root `package.json` engines).
- **Install:** From repo root run `npm ci` (or `npm install` after changing workspaces).
- **Build API:** `npm run build:api` or `turbo run build --filter=@project-bridge/api`.
- **Build web:** `npm run dev:web` / `turbo run build --filter=ledger-system-frontend`.
- **Test API:** `npm run test:api`.
- **Prisma:** `npm run db:migrate` (from root) or `cd packages/database && npx prisma migrate deploy`.

## Naming reference

- **API app:** `apps/api`, package name `@project-bridge/api`.
- **Web app:** `apps/web`, package name `ledger-system-frontend` (use this in turbo filters).
- **Database package:** `@project-bridge/database` (Prisma client and schema in `packages/database`).

Obsolete apps `bridge-admin` and `bridge-perfect` have been removed; only **apps/api** and **apps/web** are used.

**Lockfile:** If `package-lock.json` still references removed workspaces, run `npm install` at repo root once so the lockfile matches current workspaces; then CI (`npm ci`) will succeed.
