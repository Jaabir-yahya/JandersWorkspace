# Frontend Expert – Ledger/Bookkeeping Web App (Turborepo)

Use this skill when working on the **apps/web** Next.js frontend in the JandersWorkspace turborepo. The app is the single ledger-system frontend for truth-ledger and manual bookkeeping use cases.

## Scope

- **App**: `apps/web` (Next.js App Router, React, Tailwind)
- **API**: `apps/api` (NestJS) – consumed via `lib/api-client.ts` and `lib/api/*`
- **Design**: African-inspired theme (savanna, baobab, acacia, clay); high contrast for readability

## Principles

1. **Truth & manual bookkeeping first** – Views and nav are ordered by use case: Truth (Ledger, Reports) → Capture (Supplies, Invoices) → Manage (Dashboard, People, Inventory, Settings).
2. **Visibility** – Primary actions (e.g. "Add Item") use high-contrast buttons: `bg-savanna-700 text-white` so they stand out on light green/savanna-50 backgrounds.
3. **Network & errors** – API client shows a toast on network errors (no response). Use `getApiErrorMessage(error)` in catch blocks and `toast.error(getApiErrorMessage(error))` so users see backend messages.
4. **Efficiency** – Reuse `lib/api/*` modules; avoid duplicate fetch logic; use existing components (Button, Card, Input, Select, Modal).

## Key Files

| Purpose | Path |
|--------|------|
| API client & auth | `lib/api-client.ts` |
| API modules | `lib/api/*.ts` |
| Layout & nav | `components/AppLayoutGuard.tsx`, `components/Sidebar.tsx` |
| Buttons / forms | `components/Button.tsx`, `components/Input.tsx`, `components/Select.tsx` |
| Theme | `app/globals.css`, `tailwind.config.js` |

## Nav structure (use-case led)

- **Truth & bookkeeping**: Ledger, Reports
- **Capture**: Supplies, Invoices
- **Manage**: Dashboard, People, Inventory, Containers, Settings

## UI conventions

- Primary button: savanna-700 bg, white text (visible on savanna-50/white).
- Main content area: `bg-savanna-50/60`; cards: white with `border-baobab-200`.
- Toasts: sonner, top-right; use for success and error feedback.

## Dashboard: Active + Recent (use case)

The dashboard is structured for two needs: **viewing active state** and **viewing recent activity**.

- **Active** – One section listing all variables that have a balance or count for quick view:
  - Ledger trial balance accounts (when available): account name, type (DEBIT/CREDIT), balance.
  - Dashboard mains: Total revenue, Total expenses, Net income, Cash & payments, Accounts receivable, Accounts payable, Inventory value, Overdue invoices.
  - One table; optional Type column when ledger data is present. Summary row (debits/credits, Balanced badge) when trial balance is used.
  - Links: Ledger, Reports. Truth is backend; this is for quick comparison only.

- **Recent** – Recent activity list (transactions, payments, etc.) with link to Ledger "View all". Empty state message when no activity.

- **Overdue** – Slim alert banner when there are overdue invoices.

- **Quick actions** – Record purchase, Create invoice, Record payment, Settings (with shortcuts).

Active variables can be extended: any backend state or metric that has a "balance" or count can be added to the Active table (e.g. more account types, other KPIs). Keep one Active table so the dashboard stays one place for "what’s the state?" and one place for "what just happened?" (Recent).

## When adding or changing views

1. Place pages under `app/<section>/page.tsx`; use existing layout (AppLayoutGuard + Sidebar).
2. Use `getApiErrorMessage(error)` in catch and show via `toast.error(...)`.
3. Use theme colours (savanna, baobab, acacia, clay) and high-contrast primary actions.
4. Prefer existing components; add to `components/` or `components/ui/` if needed.
