# PROJECT BRIDGE: PHASE 1 SPECIFICATION
**Status:** Active  
**Focus:** Core Data Infrastructure (The "Truth Ledger")  
**Version:** 1.0.0

---

## 1. OBJECTIVE
To build the **Immutable Headless Backend** that serves as the "Source of Truth" for all commercial activities (Retail, Service, Rental). We must prove that a single database schema can accurately record the "Three Majors" of African commerce without data corruption.

---

## 2. THE 6 FINAL LOCKS (Non-Negotiable)

These constraints are **enforced at the database level** to guarantee ledger integrity:

| Lock | Rule | Enforcement |
|------|------|-------------|
| **LOCK 1** | `total_amount` is DERIVED, not trusted | Backend recalculates from lines; rejects mismatches |
| **LOCK 2** | `POSTED` is the point of no return | No updates/deletes once status is POSTED, REVERSED, RECONCILED, or ARCHIVED |
| **LOCK 3** | Reversals are first-class transactions | Reversal must reference `original_transaction_id` with negative amounts and reason code |
| **LOCK 4** | Entity phone uniqueness is PER TENANT | `UNIQUE (tenant_id, phone_number)` - supports shared phones in Africa |
| **LOCK 5** | Metadata must be READABLE | Keys must be snake_case; no nested chaos; documented per Major |
| **LOCK 6** | Every table gets `created_by` | `created_by_user_id` UUID on all tables for audit and forensics |

---

## 3. THE STACK
*   **Database:** Supabase (PostgreSQL 15+).
*   **Backend Framework:** NestJS (TypeScript).
*   **ORM:** Prisma (Optional, but recommended for type safety) or raw SQL queries via `pg`. *Decision: Use raw `pg` or Supabase Client for maximum control over JSONB initially.*
*   **Testing:** Jest (Integration tests via Supabase client).

---

## 4. ARCHITECTURAL PRINCIPLES

### 4.1 The "Header + Lines" Structure
We reject wide tables. We use a normalized structure where every transaction has a Header (The "Who/When") and Lines (The "What").

### 4.2 Immutability (The "Truth" Rule) - LOCK 2
*   **Rule:** Once a transaction status is `POSTED`, it cannot be updated or deleted.
*   **Enforcement:** Database trigger returns exception for any `UPDATE` or `DELETE` on immutable transactions.
*   **Correction:** Errors are fixed by creating a new "Reversal Transaction" (Negative amount) - LOCK 3.

### 4.3 The "Three Majors" Flexibility
The system must natively support:
1.  **RETAIL:** Sale of Goods (Inventory focus).
2.  **SERVICE:** Sale of Time (Hourly/Project focus).
3.  **RENTAL:** Hire of Assets (Deposit/Return focus).

---

## 5. DATABASE SCHEMA (Deliverable 1)

The database consists of three primary tables with full audit support (LOCK 6).

### Table A: `users` (LOCK 6)
*The system users who create records.*
| Field | Type | Requirement |
|-------|------|-------------|
| `id` | UUID | Primary Key |
| `tenant_id` | UUID | Multi-tenancy isolation |
| `phone_number` | VARCHAR | E.164 format (+254...) |
| `email` | VARCHAR | Optional |
| `display_name` | VARCHAR | Human readable name |
| `role` | VARCHAR | System role |
| `metadata` | JSONB | Additional user data (LOCK 5) |
| `created_at` | Timestamp | System time |

**Constraint:** `UNIQUE (tenant_id, phone_number)` (LOCK 4 pattern)

### Table B: `entities`
*The "Who" - Customers, Suppliers, Employees.*
| Field | Type | Requirement |
|-------|------|-------------|
| `id` | UUID | Primary Key |
| `tenant_id` | UUID | Multi-tenancy isolation |
| `type` | ENUM | CUSTOMER, SUPPLIER, EMPLOYEE |
| `display_name` | VARCHAR | "John Doe" or "Jumia Logistics" |
| `phone_number` | VARCHAR | E.164 format (+254...) |
| `metadata` | JSONB | Trust Score, Location, Notes (LOCK 5) |
| `created_by_user_id` | UUID | FK to users (LOCK 6) |
| `created_at` | Timestamp | System time |

**Constraint:** `UNIQUE (tenant_id, phone_number)` (LOCK 4)

### Table C: `transactions`
*The "Header" (Immutable after POSTED).*
| Field | Type | Requirement |
|-------|------|-------------|
| `id` | UUID | Primary Key |
| `tenant_id` | UUID | Multi-tenancy isolation |
| `entity_id` | UUID | FK to entities (optional) |
| `created_by_user_id` | UUID | FK to users (LOCK 6) |
| `reference` | VARCHAR | External reference number |
| `status` | ENUM | DRAFT, POSTED, REVERSED, RECONCILED, VOIDED, ARCHIVED |
| `type` | ENUM | RETAIL, SERVICE, RENTAL, EXPENSE |
| `payment_status` | ENUM | PENDING, PARTIAL, SETTLED, FAILED, CANCELLED |
| `total_amount` | NUMERIC | DERIVED from lines (LOCK 1) |
| `currency_code` | VARCHAR(3) | ISO 4217 (KES, USD, NGN) |
| `transaction_date` | Timestamp | The "Economic Event Date" |
| `reversed_transaction_id` | UUID | Self-reference for reversals (LOCK 3) |
| `metadata` | JSONB | Transaction-level data (LOCK 5) |
| `created_at` | Timestamp | System time |

### Table D: `transaction_lines`
*The "Lines" (Flexible details).*
| Field | Type | Requirement |
|-------|------|-------------|
| `id` | UUID | Primary Key |
| `transaction_id` | UUID | FK to transactions |
| `description` | TEXT | Human readable name |
| `sku` | VARCHAR | Stock keeping unit (RETAIL) |
| `quantity` | NUMERIC | Item count, hours, or days |
| `unit_price` | NUMERIC | Price per unit (in cents) |
| `total_line_amount` | NUMERIC | `quantity * unit_price` (enforced by trigger) |
| `account_code` | VARCHAR | Chart of accounts mapping |
| `metadata` | JSONB | Type-specific details (LOCK 5) |
| `created_at` | Timestamp | System time |

---

## 6. THE "THREE MAJORS" SPECIFICATIONS

### 6.1 Major A: RETAIL (Goods)
*   **Header Type:** `RETAIL`
*   **Lines `description`:** Product Name (e.g., "Nike Shoes")
*   **Lines `quantity`:** Item count
*   **Lines `sku`:** Stock keeping unit
*   **Lines `metadata` (Min/Max):**
    *   *Min:* `{ }`
    *   *Max:* `{ "sku": "SKU-123", "variant": "Size 40", "weight_kg": 1.2, "stock_location": "Shelf A" }`
*   **Account Code:** `200-SALES`

### 6.2 Major B: SERVICES (Time/Talent)
*   **Header Type:** `SERVICE`
*   **Lines `description`:** Service Name (e.g., "DJ Consultation")
*   **Lines `quantity`:** Hours/Days
*   **Lines `metadata` (Min/Max):**
    *   *Min:* `{ "hours": 4 }`
    *   *Max:* `{ "project_code": "PROJ-001", "start_time": "18:00", "end_time": "22:00", "skill_level": "Senior" }`
*   **Account Code:** `200-SALES` or `300-SERVICE-INCOME`

### 6.3 Major C: RENTALS (Assets)
*   **Header Type:** `RENTAL`
*   **Lines `description`:** Asset Name (e.g., "Canon Camera")
*   **Lines `quantity`:** Days/Weeks
*   **Lines `metadata` (Min/Max):**
    *   *Min:* `{ "return_date": "2023-12-01" }`
    *   *Max:* `{ "serial_number": "SN-998877", "deposit_held": 5000, "condition_out": "New", "insurance_waiver": true }`
*   **Account Code:** `400-RENTAL-INCOME`

---

## 7. API ENDPOINTS (Deliverable 2)

### 7.1 Create Transaction
*   **Method:** `POST /api/v1/transactions`
*   **Body:**
```json
{
  "tenant_id": "uuid",
  "entity_id": "uuid",
  "created_by_user_id": "uuid",
  "type": "RETAIL",
  "currency_code": "KES",
  "transaction_date": "2024-01-29T10:00:00Z",
  "lines": [
    {
      "description": "Nike Shoes",
      "sku": "NIKE-001",
      "quantity": 2,
      "unit_price": 5000,
      "account_code": "200-SALES",
      "metadata": { "variant": "Size 40", "stock_location": "Shelf A" }
    }
  ]
}
```
*   **Logic:**
    1.  Validate `tenant_id` and `created_by_user_id` (LOCK 6).
    2.  Calculate `total_amount` from lines (LOCK 1 - reject if client sends mismatched total).
    3.  Validate metadata keys are snake_case (LOCK 5).
    4.  Insert into `transactions` (Header).
    5.  Insert into `transaction_lines` (Lines).
    6.  Return `201 Created`.

### 7.2 Post Transaction (Status Transition)
*   **Method:** `POST /api/v1/transactions/{id}/post`
*   **Effect:** Changes status from `DRAFT` to `POSTED`
*   **After POSTED:** Transaction becomes immutable (LOCK 2)

### 7.3 Create Reversal (LOCK 3)
*   **Method:** `POST /api/v1/transactions/{id}/reverse`
*   **Body:**
```json
{
  "reason": "Customer cancelled order",
  "created_by_user_id": "uuid"
}
```
*   **Logic:**
    1.  Original transaction must be POSTED.
    2.  Create new transaction with negative amounts.
    3.  Set `reversed_transaction_id` to original ID.
    4.  Return `201 Created`.

---

## 8. PHASE 1 COMPLETION CHECKLIST

We can say Phase 1 is "Amazing Truth and Access" when:

- [x] **Database:** Postgres running with `users`, `entities`, `transactions`, `transaction_lines` tables
- [x] **LOCK 1:** `total_amount` is derived from lines, not trusted from input
- [x] **LOCK 2:** Immutability trigger prevents updates/deletes on POSTED transactions
- [x] **LOCK 3:** `reversed_transaction_id` field exists for reversal tracking
- [x] **LOCK 4:** `UNIQUE (tenant_id, phone_number)` on entities
- [x] **LOCK 5:** Metadata trigger enforces snake_case keys
- [x] **LOCK 6:** `created_by_user_id` required on all tables
- [x] **API:** Can POST Retail, Service, and Rental transactions
- [x] **Storage:** Metadata captures unique fields (SKU, Serial Number, Hours)
- [x] **Tests:** Integration tests cover all Three Majors and immutability rules

---

## 9. ToolJet Integration Notes

ToolJet is **perfect** for Phase 1 if you respect this boundary:

*   **ToolJet = View + Input** (reads and creates DRAFT transactions)
*   **Your API = Law + Truth** (enforces all 6 Locks)
*   **Postgres = Memory** (immutable storage)

ToolJet must NEVER:
*   Mutate POSTED records
*   Bypass the API
*   Touch the DB directly

---

## 10. Conclusion

> **Once Phase 1 is live, the Product is technically finished.**

Everything else is just a "View":
*   Dashboard = Web view of `GET /transactions`
*   Mobile App = Native view of the same API
*   WhatsApp Bot = Conversational interface for `POST /transactions`

The **Truth does not change**. This ledger is the foundation for all future verticals, countries, and AI features.

### 5.2 List Transactions
*   **Method:** `GET /api/v1/transactions`
*   **Query Params:** `tenant_id`, `type`, `status`.
*   **Logic:** Return array of Headers + associated Lines.

### 5.3 Get Transaction Details
*   **Method:** `GET /api/v1/transactions/:id`
*   **Logic:** Return Header + Lines + Entity Details.

### 5.4 Update Status (The "State Machine")
*   **Method:** `PATCH /api/v1/transactions/:id/status`
*   **Body:** `{ "status": "POSTED" }`
*   **Logic:**
    1.  Check if current status is `DRAFT`.
    2.  If yes, update to `POSTED`.
    3.  If no, throw Error (`400 Bad Request` - "Cannot modify immutable record").

---

## 6. ACCEPTANCE CRITERIA (The "Smoke Test")

Phase 1 is complete when the following is proven:

1.  [ ] **Database Exists:** The three tables are created in Supabase.
2.  [ ] **Retail Test:** API successfully creates a Retail transaction with `metadata: { sku: "..." }`.
3.  [ ] **Service Test:** API successfully creates a Service transaction with `metadata: { hours: 4 }`.
4.  [ ] **Rental Test:** API successfully creates a Rental transaction with `metadata: { serial: "..." }`.
5.  [ ] **Immutability Test:** Attempting to `PATCH` a POSTED transaction fails with `403`.
6.  [ ] **Math Test:** The `total_amount` in the Header equals the sum of `total_line_amount` in the Lines.
7.  [ ] **Headless Check:** Data is retrievable via Postman/Insomnia without any UI (Dashboard).

---

## 7. OUT OF SCOPE (What we are NOT doing yet)
*   **User Authentication:** We assume `tenant_id` is passed in the body (we will add Auth later).
*   **Dashboard/UI:** No ToolJet or React frontend.
*   **M-Pesa Integration:** No payment processing.
*   **WhatsApp Bot:** No chat interface.
*   **Inventory Deduction:** We are just recording the sale, not deducting from a stock table yet.

---

## 8. NEXT STEPS (Immediate Action)
1.  Create Supabase Project (Cloud).
2.  Run SQL Migration (from previous prompt).
3.  Initialize NestJS Project locally.
4.  Connect NestJS to Supabase (using `@supabase/supabase-js`).
5.  Implement `POST /transactions`.
6.  Run the "Three Majors" Smoke Test.
