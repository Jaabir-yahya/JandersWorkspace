# Project Bridge – Final Plan (Manual Nairobi Use Case)

**Single source of truth** for product, frontend, and manual tenants. English-first; manual notekeeping before integrations. Maximises for Nairobi locals: clean data, phone + desktop, and tracking how data connects (people ↔ items ↔ transactions).

**Docker:** Excluded for now. Deploy API (e.g. Railway) and frontend (e.g. Vercel) without Docker; add Docker later if needed.

---

## 1. Overview

**Product:** African Informal Economy Ledger – digital notekeeping for sales, expenses, people (customers/suppliers), and transactions. Manual-first; integrations (M-Pesa, WhatsApp, accounting) are optional and gated by tier.

**Users:** Manual tenants (Nairobi locals) – one app per tenant via slug or link; no login for core flow. Optional tenant API key for “my data” and export.

**Stack:** API (NestJS, Prisma, PostgreSQL/Supabase), frontend `apps/bridge-manual` (Next.js). Deploy: API (Railway or similar), frontend (Vercel). No Docker for now.

**Direct benefit to locals:** One place to store clean, structured data. Export (CSV/JSON) for use in other tools. See what happened, when, and with whom. Track connections: who bought what, who owes what, which items go with which people.

---

## 2. Benefit to Locals (Why Use the System)

- **Clean data:** Structured sales/expenses, people, and line items instead of scraps of paper or scattered notes.
- **One source of truth:** All transactions and people in one place; no double-entry across books.
- **Usable elsewhere:** Export CSV/JSON to use in spreadsheets, accounting, or other apps.
- **See connections:** Track item ↔ people (what sold to whom), people ↔ transactions (who bought what, who owes), people ↔ people (e.g. supplier vs customer). System stores and surfaces these links so locals can answer “who bought tomatoes?” or “what does Mary owe?”

---

## 3. Data Interconnections (What Locals Can Track)

| Connection | Meaning | How we support it |
|------------|--------|--------------------|
| **Transaction → Person** | This sale/expense was with whom (customer/supplier). | Optional “Who” on Quick Add; `entity_id` on transaction; History for [Person]. |
| **Person → Transactions** | All sales/expenses with this person; balance. | People list → “History for [Person]” with running balance. |
| **Item/Line → Person** | What was sold or bought, and with whom. | Line description + optional person on transaction; filter “by person” shows their items. |
| **Person → Person** | Supplier vs customer; or “referred by” (later). | Entity type: Customer, Supplier, Both. Same person can appear in different roles via type. |
| **Tag → Transactions & People** | Labels that group transactions (e.g. “wholesale”, “mama-mboga”). | Tags on transaction; filter list by tag; later “by tag” in Summary. |

**UI goal:** Let locals tap a person and see all their transactions and items; tap a transaction and see who it was with; filter by person or tag so connections are visible.

---

## 4. Frontend Plan (API + UI)

### 4.1 API configuration

- **Env:** `NEXT_PUBLIC_API_URL` = API origin only (e.g. `https://your-api.railway.app` or `http://localhost:3000`). Frontend appends `/api/v1` when calling API.
- **CORS:** Backend sets `ALLOWED_ORIGINS` to include frontend domain(s). Frontend sends requests with correct origin; no special CORS handling in app beyond using the env URL.

### 4.2 Tenant resolution (critical)

- **Slug from URL:** Subdomain `tenant.bridge.ke` → slug = `tenant`; path `bridge.ke/tenant` → slug = `tenant`.
- **First request on load:** `GET {API_URL}/api/v1/tenants/slug/{slug}`. Response: `id`, `name`, `slug`, `tier`, `country`, `features`, `settings`.
- **All later requests:** Send `X-Tenant-Id` = tenant `id` (UUID).
- **Optional key:** If URL has `?key=secret`, store in `sessionStorage` as `bridge_tenant_key`; send `X-Tenant-Key` for list, export, dashboard. Strip `?key=` from URL after reading to avoid leaking in sharing.

### 4.3 Headers

| Header | Value | When |
|--------|-------|------|
| `X-Tenant-Id` | Tenant UUID | Every request |
| `X-Tenant-Key` | Key from URL/session | When present; for list, export, stats if tenant has key set |
| `Content-Type` | `application/json` | POST/PATCH |

### 4.4 Core API endpoints (manual tier)

| Purpose | Method | Path | Body/Query |
|---------|--------|------|------------|
| Resolve tenant | GET | `/api/v1/tenants/slug/:slug` | — |
| Quick add | POST | `/api/v1/transactions/quick-capture` | `amount`, `description`, `type` (sale/expense), `method?`, `currency_code?` |
| Today’s list | GET | `/api/v1/transactions/list` | `date_from`, `date_to`, optional `type`, `entity_id`, `search` |
| Dashboard stats | GET | `/api/v1/dashboard/stats/public` | — |
| Export | GET | `/api/v1/transactions/export` | `format=csv|json`, `date_from`, `date_to`, `type?`, `limit?` |

(Planned: People list/create/get, entity history/balance – same base URL, public or key-scoped.)

### 4.5 Data models (frontend)

- **Transaction:** `id`, `amount`, `description`, `type` (sale | expense), `currency`, `method`, `timestamp`, `synced?`, optional `personId`, `note`, `tags`.
- **Tenant features:** `manual_transactions`, `entity_management`, `payment_records`, `dashboard`, `mpesa_integration`, `whatsapp_integration`, etc. – used to gate UI (e.g. show upgrade prompt for M-Pesa).
- **Person (when People is live):** `id`, `displayName`, `phoneNumber?`, `type` (Customer | Supplier | Both).

### 4.6 Offline-first

- **Local queue:** Pending transactions in localStorage; key e.g. `bridge_offline_transactions`. Each item: amount, description, type, method, optional tenantId.
- **Sync:** On submit, try POST to `/transactions/quick-capture`; on failure (offline), push to queue. When online, background sync queue; show “N unsynced” and “Sync now.”
- **Today’s view:** Merge synced (from API for today) + pending (from queue for today); label each “synced” or “pending.”

### 4.7 UI/UX (entry + flows)

- **Entry:** Parse URL for slug → GET tenant by slug → store tenant id → show tenant name + tier in header. Nav: Add, Summary; optional People when available.
- **Quick Add:** Amount (presets 100, 200, 500, 1000), description, Sale | Expense, payment method (Cash | M-Pesa). Optional: Who (when People API exists), Note, Tags. Optional: voice input.
- **Today’s Sales:** List = synced + pending for today; sort by time descending; badge “synced” / “pending.”
- **Summary:** Date picker, today’s sales/expenses/net, recent transactions, export (CSV, JSON). Empty state: “No data yet – add your first sale or expense.” Copy: “Your data is stored securely and can be exported for use in other tools.”

### 4.8 Errors and security

- **Network:** On POST failure, queue offline; retry when back online; show sync status.
- **404 on slug:** “Shop not found” message.
- **400 on quick-capture:** Show validation message.
- **401/403 (e.g. invalid key):** Prompt for valid key or use link with `?key=`.
- **No JWT for manual:** Public endpoints with `X-Tenant-Id` (and optional `X-Tenant-Key`). Key in `sessionStorage` only; strip `?key=` from URL after read.

---

## 5. Phone and Desktop

- **Mobile-first:** Layout and touch targets designed for phone first. Min touch target 44px; primary actions (Add, Sync) easy to reach.
- **Desktop:** Same app; responsive. On larger viewport: use max-width content (e.g. max-w-4xl), side-by-side where it helps (e.g. list + detail when we have “History for [Person]”).
- **Viewport:** Meta viewport set; no zoom blocking. Works on small screens (e.g. 320px) and large.
- **Navigation:** On phone: bottom or top tab bar (Add, Today’s Sales, Summary; later People). On desktop: header nav (Add, Summary, People) and optional sidebar when we add more sections.

---

## 6. Full User Experience (Manual Nairobi)

### 6.1 Entry

- Open link (e.g. `https://app.example.com/mama-mboga` or `.../mama-mboga?key=...`).
- App gets tenant from slug; optionally stores key. Header shows shop name and tier. No sign-up.

### 6.2 Add (efficient input)

- Quick Add: amount, description, Sale or Expense, method. Optional: Who (when People exists), Note, Tags. Presets and optional voice.
- Data saved offline if needed; synced when online. “Today’s Sales” shows synced + pending with labels.

### 6.3 Summary and export

- Summary: date, totals, recent list, export CSV/JSON. Empty state and “clean data” copy.
- Export: “Download my data” so data is usable elsewhere.

### 6.4 People and connections (planned)

- **People:** List customers/suppliers; add person (name, phone, type). In Quick Add, optional “Who.”
- **History for [Person]:** All transactions with that person + balance. Answers “what does X owe?” and “what did I sell to X?”
- **By person in Summary:** Optional breakdown by person (who brought most sales, who has balance).

### 6.5 Items and tags (planned)

- **Items:** Freeform description per line first; optional category/tag per line later. Enables “what sold to whom” and “which items by person.”
- **Tags:** Per transaction; filter list and Summary by tag; surfaces connections (e.g. all “wholesale” or “mama-mboga”).

### 6.6 Integrations (gated)

- BASIC: manual only; upgrade prompts for M-Pesa, WhatsApp.
- ENTERPRISE: full features; same app, feature gates by tier.

---

## 7. English-First Terminology

| Term | Meaning |
|------|--------|
| **People** | Customers, suppliers, contacts. |
| **Customer** | Someone who buys from you or owes you. |
| **Supplier** | Someone you buy from or owe. |
| **Transaction** | One sale, expense, or service event. |
| **Sale** | Money in. |
| **Expense** | Money out. |
| **Line item** | One row: what, quantity, price. |
| **Item or service** | What you sell or buy (freeform first). |
| **Note** | Extra text on a transaction. |
| **Tags** | Labels to filter and connect (e.g. wholesale). |
| **Summary** | Totals and lists (dashboard). **History** | Past transactions; per-person when People exists. |

---

## 8. Current State

- **Tenant:** Slug resolution; optional `?key=` and `X-Tenant-Key` for list/export/stats.
- **Quick-capture:** Amount, description, type, method. No person/note/tags in API yet.
- **List, dashboard, export:** Public with `X-Tenant-Id` (and key when set).
- **Frontend:** Add (Quick Add, Voice), Today’s Sales (synced + pending), Summary (date, totals, export, empty state). Offline queue and sync. Header: Add, Summary.
- **Deploy:** No Docker; API + frontend to Railway/Vercel; `npm run deploy:db` for DB.

---

## 9. Plan (Phases)

### Phase A – People and notekeeping

1. **Quick-capture extended:** Optional `person_id` (entity_id), `note`, `tags[]` in API and UI.
2. **People for manual:** Public (or key-scoped) list people, create person, get person. UI: People page; “Who” in Quick Add.
3. **Entity history/balance for manual:** GET entity, GET entity history, GET entity balance. UI: “History for [Person]” (transactions + balance).

### Phase B – Connections and smart interaction

4. **List filters:** By person, by tag; note and tags in list and export.
5. **Search:** Include note and tags in backend search.
6. **Summary:** Optional “by person” and “by tag” so locals see who/what drives numbers.

### Phase C – Items and deeper connections

7. **Line category/tag:** Optional category or tag per line (metadata) for “what” and “what ↔ who.”
8. **Catalog (optional):** Item/Product table and “Pick item” if needed; else keep freeform.

### Out of scope for 80% manual

- Docker: excluded for now.
- Integrations: gated.
- Multi-currency: single (e.g. KES).
- Formal PDF invoicing: export CSV/JSON is enough for now.

---

## 10. Deployment (No Docker)

### 10.1 Database

```bash
cd apps/api && npx prisma migrate deploy && npx prisma db seed
# or from root: npm run deploy:db
```

### 10.2 API (e.g. Railway)

Env: `DATABASE_URL`, `DIRECT_URL`, `ALLOWED_ORIGINS`, `JWT_SECRET`. Deploy; health: `GET https://your-api/api/v1/health`.

### 10.3 Frontend (e.g. Vercel)

Env: `NEXT_PUBLIC_API_URL` = API origin. Deploy: `cd apps/bridge-manual && vercel --prod`.

### 10.4 Tenant API key

Optional. Set via `PATCH /api/v1/tenants/:id/api-key` (admin JWT). Share link with `?key=...`; app stores in session and sends `X-Tenant-Key`.

---

## 11. Dev Workflow

```bash
npm install && cp .env.example .env && ./scripts/setup-env.sh
npm run verify   # env, build, tests
npm run dev      # API :3000, bridge-manual :3001
```

Use tenant path (e.g. `http://localhost:3001/janders-dogfood`) after seed.

---

## 12. References

- [API Contract](API_CONTRACT.md)
- [Contributing](../CONTRIBUTING.md)
- [Repository standards](../REPOSITORY_STANDARDS.md)
- [DEPLOYMENT_SIMPLE](../DEPLOYMENT_SIMPLE.md)

This is the final plan for the manual Nairobi use case: clean data, phone + desktop, and maximising value by storing data and making connections (people ↔ items ↔ transactions) visible and usable.
