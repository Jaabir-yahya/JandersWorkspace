# Frontend views and use cases

This doc describes how the **apps/web** frontend is structured around truth-ledger and manual bookkeeping use cases in the turborepo.

## Use-case map

| Use case | Goal | Views | API surface |
|----------|------|--------|-------------|
| **Truth & bookkeeping** | Single source of truth; double-entry; reports | Ledger, Reports | Ledger, reporting, universal-truth |
| **Capture** | Record transactions and documents | Supplies, Invoices | Supplies, invoices, transactions |
| **Manage** | Data and configuration | Dashboard, People, Inventory, Containers, Settings | Dashboard, entities, inventory, business/containers, tenants |

## Nav order (Sidebar)

1. **Truth & bookkeeping** – Ledger, Reports  
2. **Capture** – Supplies, Invoices  
3. **Manage** – Dashboard, People, Inventory, Containers, Settings  

This order prioritises “see the truth and reports” then “capture” then “manage data”.

## View optimisation notes

- **Dashboard**: Entry point; KPIs and recent activity; quick links to Capture and Ledger.
- **Ledger**: Core truth view; link from Reports and from Capture flows (e.g. “View in Ledger”).
- **Reports**: Trial balance, P&amp;L, etc.; read from same truth as Ledger.
- **Supplies / Invoices**: Capture flows; after save, user can go to Ledger or Reports to verify.
- **Inventory & Containers**: Support capture (e.g. supply line items) and stock truth.
- **People**: Entities (customers/suppliers); used by Invoices and Ledger.
- **Settings**: Tenant, integrations, preferences.

## Maximising “truth” in the UI

- **Dashboard Balance snapshot**: Key account/state balances from the ledger (trial balance) are shown for quick comparison; "Verify in Ledger" / "Full report" links support cross-check. Truth is backend; the dashboard surfaces active balances for efficiency.
- Every capture action (supply, invoice, payment) should be traceable to the Ledger.
- Reports read from the same backend truth as Ledger; avoid client-side-only aggregates for bookkeeping truth.
- Use clear success messages and optional “View in Ledger” / “View report” after capture.

## Manual bookkeeping efficiency

- Keyboard shortcuts (e.g. Ctrl+I Add Inventory, Ctrl+N New purchase) are in Sidebar quick actions.
- Primary actions (Add Item, Save, etc.) use high-contrast buttons (savanna-700, white text).
- Network errors are surfaced globally; API error messages are shown via `getApiErrorMessage(error)` and toast.

## Reference

- Frontend expert skill: `.kilocode/skills/frontend-expert/SKILL.md`
- API client and error handling: `apps/web/lib/api-client.ts`
- Nav definition: `apps/web/components/Sidebar.tsx`
