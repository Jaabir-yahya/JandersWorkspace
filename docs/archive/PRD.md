# Project Bridge — Phase 1: The Truth Ledger

Status: Definition Complete
Goal: Build the immutable universal storage engine for Retail, Services, and Rentals.

Core Philosophy: Truth & Access
- Immutable entries (append-only once POSTED)
- Standardized: Header (`transactions`) + Lines (`transaction_lines`) + `entities`
- Accessible: Headless API for ingestion, queries, exports, and integrations.

Key tables & fields (summary):
- `transactions` (id, tenant_id, entity_id, transaction_date, total_amount (cents), currency_code, status, type, payment_status, created_at, created_by, metadata)
- `transaction_lines` (id, transaction_id, description, quantity, unit_price, total_line_amount, account_code, metadata JSONB)
- `entities` (id, tenant_id, type, display_name, phone_number, metadata JSONB)

Three Majors:
- RETAIL: product SKU, quantity (item count)
- SERVICE: hours/days, project_code
- RENTAL: asset serial, return_date, deposit

6 Final Locks (enforced):
1. total derived from lines (server recalculated)
2. POSTED is immutable
3. Reversals must reference original and contain negative lines and reason_code
4. phone uniqueness per tenant: UNIQUE (tenant_id, phone_number)
5. metadata in snake_case and readable
6. every table has created_by

Phase 1 Acceptance Criteria (summary):
- Postgres running with tables
- API supports POST of Retail, Service, Rental
- Metadata stored correctly
- Attempts to DELETE POSTED transaction return 403
- GET /transactions returns data instantly
- Totals and lines math is correct

For the full PRD text, consult the planning doc (source provided by stakeholders).