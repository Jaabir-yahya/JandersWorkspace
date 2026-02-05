# State & Logs MVP — Frontend Layout and Use Case

This doc defines how the frontend maximises the **truth backend** so every tenant type gets **state** (amount total an entity is at) and **logs** (audit/history), with clear flows and links.

## Principles

- **State** = current total/balance for an entity or account (e.g. customer balance, supplier balance, trial balance).
- **Logs** = time-ordered history of what happened (transactions, ledger entries, per-entity history).
- All state and logs are derived from the **backend truth** (double-entry, transactions, entities, containers). The frontend only **plots** this data; it does not hold its own truth.

## Backend Truth (Already Exposed)

| Concern | API | Purpose |
|--------|-----|--------|
| **Entity state** | `GET /entities/:id/balance` | Net balance, credits, debits, transaction count |
| **Entity log** | `GET /entities/:id/history` | Running balance, list of transactions for entity |
| **Ledger log** | `GET /reporting/transaction-history` | All transactions (filter: entityId, containerId, dateFrom, dateTo) |
| **Account state** | `GET /reporting/trial-balance` | All accounts with balances (debits/credits) |
| **Dashboard state** | `GET /dashboard/stats` | Revenue, receivables, payables, top entities |
| **Containers** | `GET /business/containers` | Containers (optional filter: entityId) |
| **Supplies / Invoices** | `POST /business/supplies`, etc. | Inputs that write to truth (with containerId, entityId) |

## Frontend Layout (State vs Logs)

### State views (where tenants see “amount total”)

1. **Dashboard** — Overall state: revenue, receivables, payables, cash, top entities.
2. **People (Entities)** — List of entities; each row can show **state** (balance) and link to detail.
3. **Entity detail** — **State card**: balance (net, credits, debits); **Log**: transaction history with running balance.
4. **Reports** — **Trial balance** section: account-level state; **Transaction ledger** section: log with filters (entity, container, dates).
5. **Ledger** — Entry point to trial balance and transaction history (links to Reports or in-page).
6. **Containers** — Containers assigned to entities; state per container (e.g. stock in container) via container items.

### Log views (where tenants see “what happened”)

1. **Reports → Transaction history** — Full ledger log; filters: date range, entity, container.
2. **Entity detail → History** — Log for one entity (running balance).
3. **Dashboard → Recent activity** — Short log of recent events.

## Flows and Links

- **Record purchase (Supplies)** → Choose supplier (entity) and optional **container** → Posts to truth with `containerId` / `entityId` → Appears in transaction history (and in entity history if entity-linked).
- **Create invoice** → Links to customer (entity) → Posts to truth → Entity balance and entity history update.
- **Entity detail** → State (balance) + Log (history) from truth.
- **Reports** → Filter transaction log by **entity** or **container** → Export CSV.
- **Containers** → Assign to entity; receive supplies into container → Transaction history filterable by `containerId`.

## Tenant Use Cases (Max Usability)

- **See state**: Dashboard totals; People list with balance; Entity detail balance; Trial balance; Container-level state.
- **See logs**: Transaction history (global and by entity/container); Entity history; Recent activity.
- **Act**: Supplies, Invoices, Ledger actions (all write to truth with entity/container links so state and logs stay consistent).

## Lighter Use Case Users

- **No tenant / not signed in**: Dashboard shows zeros and a banner “Sign in or select a tenant”; API clients return empty stats or empty lists on error so the app does not crash.
- **No entities yet**: People page shows “No entities yet. Create them from supplies or invoices.” Entity detail, when opened by ID, falls back to `GET /entities/:id` so at least the name shows; balance/history show “No data yet” messaging.
- **Balance API fails per entity**: People list shows “—” for net balance so the list still works; balance is loaded for first 20 entities only to avoid hammering the API.
- **Empty data everywhere**: Reports show “No transactions match”; Inventory shows empty list; Supplies/Invoices forms still work so users can start recording.
- **Quick flow**: Dashboard has links to Record purchase, Create invoice, People, Reports so full and lighter users can jump straight to the main flows.

## Implementation Checklist (MVP)

- [x] Backend: entity balance, entity history, transaction-history (entity/container filters), trial balance.
- [x] Supplies form: container selection → `containerId` sent to API.
- [x] **Frontend**: Reporting API client (transaction-history, trial-balance).
- [x] **Frontend**: Entities API extended (balance, history).
- [x] **Frontend**: Reports page wired to transaction-history + trial balance; filters (entity, container, dates).
- [x] **Frontend**: People (Entities) page: list with link to detail.
- [x] **Frontend**: Entity detail page: state card (balance) + log (history).
- [x] **Frontend**: Sidebar: People; Reports/Ledger as main log views.

After this, the project is **finalised for MVP** (state + logs + flows); then we can move on to **integrations** (e.g. Xero, QuickBooks, WhatsApp) that also read/write the same truth.
