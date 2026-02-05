# Archive – Extracted Monorepo Sources

**Archived:** 2026-02-05

These directories were used as sources when setting up the turborepo monorepo. Their content has been merged into the root `apps/` and `packages/` and is no longer needed for day-to-day development.

## Contents

| Directory | What it was | Where it lives now |
|-----------|-------------|---------------------|
| **accounting-system** | Mini monorepo: Next.js app (dashboard + inventory) + `@repo/typescript-config` | `apps/web` (dashboard, inventory, + more routes); `packages/config` (TypeScript + ESLint) |
| **frontendexamplebridge** | Reference Next.js app: components, lib (api-client, store, types, utils), docs | `apps/web` (components/, lib/, same patterns; extended with api/, ui/, more pages) |
| **ledger-system-frontend** | Stale frontend (only `.next` build output; no source) | `apps/web` is the canonical frontend (package name `ledger-system-frontend`) |

## Verification (pre-archive)

- **Workspaces:** Root `package.json` uses `"workspaces": ["apps/*", "packages/*"]` — these three were never workspace members.
- **apps/web** includes: dashboard, inventory, invoices, ledger, reports, settings, supplies; components (Badge, Button, Card, Header, Input, LedgerPreview, Sidebar, etc.); lib (api-client, store, types, utils, api/).
- **packages/config** provides shared ESLint and TypeScript configs (superset of accounting-system’s typescript-config).

Safe to delete this `_archive` folder if you no longer need the original trees; otherwise keep for reference.
