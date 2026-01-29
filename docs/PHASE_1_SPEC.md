# PROJECT BRIDGE: PHASE 1 SPECIFICATION
**Status:** Active
**Focus:** Core Data Infrastructure (The "Truth Ledger")

---

## 1. OBJECTIVE
To build the **Immutable Headless Backend** that serves as the "Source of Truth" for all commercial activities (Retail, Service, Rental). We must prove that a single database schema can accurately record the "Three Majors" of African commerce without data corruption.

## 2. THE STACK
*   **Database:** Supabase (PostgreSQL 15+).
*   **Backend Framework:** NestJS (TypeScript).
*   **ORM:** Prisma (Optional, but recommended for type safety) or raw SQL queries via `pg`. *Decision: Use raw `pg` or Supabase Client for maximum control over JSONB initially.*
*   **Testing:** Postman / Insomnia (For API validation).

## 3. ARCHITECTURAL PRINCIPLES

### 3.1 The "Header + Lines" Structure
We reject wide tables. We use a normalized structure where every transaction has a Header (The "Who/When") and Lines (The "What").

### 3.2 Immutability (The "Truth" Rule)
*   **Rule:** Once a transaction status is `POSTED`, it cannot be updated or deleted.
*   **Enforcement:** The API must return `403 Forbidden` for any `UPDATE` or `DELETE` request on a posted transaction.
*   **Correction:** Errors are fixed by creating a new "Reversal Transaction" (Negative amount).

### 3.3 The "Three Majors" Flexibility
The system must natively support:
1.  **RETAIL:** Sale of Goods (Inventory focus).
2.  **SERVICE:** Sale of Time (Hourly/Project focus).
3.  **RENTAL:** Hire of Assets (Deposit/Return focus).

---

## 4. DATABASE SCHEMA ( Deliverable 1 )

The database must consist of three primary tables.

### Table A: `entities`
*The "Who".*
*   `id` (UUID, PK)
*   `tenant_id` (UUID)
*   `type` (ENUM: CUSTOMER, SUPPLIER, EMPLOYEE)
*   `display_name` (VARCHAR)
*   `phone_number` (VARCHAR, Unique)
*   `metadata` (JSONB)

### Table B: `transactions`
*The "Header" (Immutable).*
*   `id` (UUID, PK)
*   `tenant_id` (UUID)
*   `entity_id` (UUID, FK)
*   `transaction_date` (Timestamp)
*   `total_amount` (BIGINT - Stores Cents)
*   `currency_code` (VARCHAR)
*   `status` (ENUM: DRAFT, POSTED, RECONCILED, VOIDED)
*   `type` (ENUM: RETAIL, SERVICE, RENTAL, EXPENSE)
*   `payment_status` (ENUM: PENDING, PARTIAL, PAID, OVERDUE)

### Table C: `transaction_lines`
*The "Lines" (Flexible).*
*   `id` (UUID, PK)
*   `transaction_id` (UUID, FK)
*   `description` (TEXT)
*   `quantity` (NUMERIC)
*   `unit_price` (BIGINT)
*   `total_line_amount` (BIGINT)
*   `account_code` (VARCHAR)
*   `metadata` (JSONB) *<-- Key for handling "Min/Max" data*

---

## 5. API ENDPOINTS ( Deliverable 2 )

We will build a standard CRUD API using NestJS.

### 5.1 Create Transaction
*   **Method:** `POST /api/v1/transactions`
*   **Body:**
```json
{
  "tenant_id": "uuid",
  "entity_id": "uuid",
  "type": "RETAIL",
  "transaction_date": "2024-01-29T10:00:00Z",
  "lines": [
    {
      "description": "Nike Shoes",
      "quantity": 1,
      "unit_price": 5000,
      "metadata": { "sku": "123" }
    }
  ]
}
```
*   **Logic:**
    1.  Validate `tenant_id`.
    2.  Calculate `total_amount` (Sum of lines).
    3.  Insert into `transactions` (Header).
    4.  Insert into `transaction_lines` (Lines).
    5.  Return `201 Created`.

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
