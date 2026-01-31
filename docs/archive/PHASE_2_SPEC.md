# PROJECT BRIDGE: PHASE 2 SPECIFICATION
**Status:** Implementation In Progress
**Focus:** Visibility, Workflow, & International Standardization
**Dependency:** Phase 1 (Truth Ledger) - Complete

---

## 1. OBJECTIVES

Phase 1 built the **Engine** (Data Storage). Phase 2 builds the **Dashboard** and the **Transmission** (Data Access & Export).

Our goals are:
1.  **Visibility:** Allow users to see, search, and filter their ledger without writing SQL.
2.  **Workflow:** Implement the "State Machine" (Draft -> Posted -> Reconciled).
3.  **Standardization:** Format the "Three Majors" data to match International standards (QBO, Xero, Kick) for future integration.
4.  **Interface:** Build the first usable Admin Portal using ToolJet.

---

## 2. THE STACK UPDATE

*   **Database:** Supabase (PostgreSQL) - *Unchanged.*
*   **Backend:** NestJS - *Unchanged.*
*   **Admin UI:** **ToolJet** (Self-hosted or Cloud).
*   **New Library:** `pdf-lib` (For generating receipts/invoices).

---

## 3. MODULE 1: THE STATE MACHINE (Workflow Logic)

In Phase 1, we only created `DRAFT` transactions. In Phase 2, we must enable the lifecycle of a transaction.

### 1.1 The States
*   `DRAFT`: Entry is being edited. Not yet "Truth."
*   `POSTED`: Entry is finalized. **Immutable** (LOCK 2 applies).
*   `REVERSED`: Entry was cancelled/voided. Links to original.
*   `RECONCILED`: Entry has been matched to a bank payment (M-Pesa/Card).

### 1.2 API Endpoints to Build

**A. Post Transaction**
*   **Endpoint:** `POST /api/v1/transactions/{id}/post`
*   **Logic:**
    1.  Verify status is `DRAFT`.
    2.  Change status to `POSTED`.
    3.  **Trigger:** (Future) Send webhook to Integrations.
*   **Why:** International tools (QBO) only accept "Finalized" transactions.

**B. Reverse Transaction**
*   **Endpoint:** `POST /api/v1/transactions/{id}/reverse`
*   **Body:** `{ "reason": "Customer return", "created_by_user_id": "..." }`
*   **Logic:**
    1.  Verify status is `POSTED`.
    2.  Create a NEW transaction (the Reversal).
    3.  Copy all `transaction_lines` but invert `quantity` and `total_line_amount` (make them negative).
    4.  Set `reversed_transaction_id` on the new record to point to the old ID.
    5.  Set status of new record to `POSTED`.
*   **Why:** This is the standard accounting method for handling returns/errors without deleting history.

---

## 4. MODULE 2: SEARCH & RETRIEVAL (Access)

Users need to find data fast. We implement "Smart Filters" similar to Copper/QuickBooks.

### 2.1 Enhanced List Endpoint
*   **Endpoint:** `GET /api/v1/transactions`
*   **New Query Params:**
    *   `status`: Filter by `DRAFT`, `POSTED`, `RECONCILED`.
    *   `type`: Filter by `RETAIL`, `SERVICE`, `RENTAL`.
    *   `entity_id`: Filter by specific Customer/Supplier.
    *   `date_from` / `date_to`: Date range picker.
    *   `search`: (The "Google" bar). Searches across `description`, `reference`, and `entity_name`.

### 2.2 Entity History (The "Copper" Feature)
*   **Endpoint:** `GET /api/v1/entities/{id}/history`
*   **Logic:**
    1.  Fetch all transactions linked to this Entity.
    2.  Calculate `Total Balance` (Sum of all amounts).
    3.  Return a timeline view.
*   **Why:** This replaces the manual "Notebook" lookup. It shows "Everything John Doe has ever done."

---

## 5. MODULE 3: INTERNATIONAL STANDARDIZATION (The "Bridge")

Based on research of **QuickBooks (QBO)** and **Kick Accounting**, international tools expect a very specific JSON structure. We must build an "Export Adapter."

### 3.1 The "Universal Invoice" Schema
We will create a standard internal JSON format that mimics QBO.

**JSON Structure (for Export):**
```json
{
  "invoice_id": "uuid",
  "customer_name": "John Doe",
  "invoice_date": "2024-01-29",
  "currency": "KES",
  "total_amount": 50000,
  "line_items": [
    {
      "description": "Consulting Service",
      "quantity": 4,
      "unit_price": 12500,
      "account_code": "400-SERVICE-INCOME"
    }
  ],
  "tax_amount": 0,
  "status": "PAID"
}
```

### 3.2 The "Standardize" Service
*   **Internal Function:** `standardizeTransaction(txn_id)`
*   **Logic:**
    1.  Fetch Header + Lines from DB.
    2.  Map `transactions.type` to `account_code`.
        *   *RETAIL* -> `200-SALES`
        *   *SERVICE* -> `400-SERVICE-INCOME`
        *   *RENTAL* -> `500-RENTAL-INCOME`
    3.  Return the "Universal Invoice" JSON.
*   **Why:** When we integrate with QBO/Kick later, we just call this function and send the result. No complex mapping logic needed in the integration layer.

---

## 6. MODULE 4: THE ADMIN PORTAL (ToolJet Implementation)

We will use ToolJet to build the user interface. **CRITICAL:** ToolJet must use the **API**, not direct DB access, to respect the 6 Locks.

### 4.1 Page 1: The "Ledger" (List View)
*   **Components:**
    *   **Table Widget:** Columns: `Date`, `Entity`, `Type`, `Amount`, `Status`.
    *   **Filters:** Date Range Picker, Type Dropdown, Status Dropdown.
    *   **API:** Calls `GET /api/v1/transactions` with filter params.
*   **Actions:**
    *   Click Row -> Opens "Detail View."
    *   Button "New Transaction" -> Opens "Create Modal."

### 4.2 Page 2: The "Creator" (Form View)
*   **Components:**
    *   **Form Widget:**
        *   Select Entity (Dropdown from API).
        *   Select Type (Retail/Service/Rental).
        *   Transaction Date.
    *   **Table Widget (Nested):** "Line Items."
        *   Columns: Description, Qty, Price, Account Code.
        *   Button: "Add Line."
*   **Logic:**
    *   User fills form -> Clicks "Save as Draft" -> Calls `POST /api/v1/transactions`.

### 4.3 Page 3: The "Reconciler" (Action View)
*   **Components:**
    *   **Table Widget:** Shows `POSTED` transactions with `payment_status = PENDING`.
    *   **Button:** "Mark Paid."
*   **Logic:**
    *   Click "Mark Paid" -> Calls `PATCH /api/v1/transactions/{id}/payment_status`.
    *   Updates status to `SETTLED` and `RECONCILED`.

---

## 7. ACCEPTANCE CRITERIA

Phase 2 is complete when:

1.  [ ] **State Machine:** I can create a Draft, Post it, and then Reverse it. The database shows 2 records (Original + Reversal).
2.  [ ] **Search:** I can search for "Nike" and find a Retail transaction from last month.
3.  [ ] **Entity History:** I can click "John Doe" and see a balance of 50,000 KES owed.
4.  [ ] **ToolJet:** I can create a Retail transaction via the ToolJet form, and it appears in the database correctly.
5.  [ ] **Standardization:** I can call `GET /api/v1/transactions/{id}/export` and receive JSON that matches QBO/Kick structure.
6.  [ ] **Reconciliation:** I can change a payment status from `PENDING` to `SETTLED`.

---

## 8. OUT OF SCOPE
*   **M-Pesa Integration:** We are manually marking payments as "Settled" in this phase.
*   **Sending Emails:** We are not emailing invoices yet.
*   **Complex Roles:** We assume one generic admin user per tenant for now.

---

## 9. IMPLEMENTATION ROADMAP (Step-by-Step)

**Week 1: State Machine**
1.  Write `POST /transactions/{id}/post` in NestJS.
2.  Write `POST /transactions/{id}/reverse` in NestJS.
3.  Test with Postman (Create -> Post -> Reverse).

**Week 2: Search & Filter**
1.  Update `GET /transactions` to accept query filters.
2.  Implement the `search` logic (ILIKE on description/name).
3.  Test filtering by `RETAIL` only.

**Week 3: ToolJet Setup**
1.  Deploy NestJS backend to Railway/Render.
2.  Spin up ToolJet (Cloud or Local).
3.  Connect ToolJet to your NestJS API (not the DB).
4.  Build the "Ledger" table view.

**Week 4: Form & Reconciliation**
1.  Build the "New Transaction" form in ToolJet.
2.  Test creating a DRAFT.
3.  Build the "Reconciler" view to mark items paid.

---

## 10. WHY THIS LEADS TO SUCCESS

By following this plan:
1.  **You are building to Standard:** Your data structure is now compatible with QBO, Xero, and Kick because of the "Universal Invoice" schema.
2.  **You are building to Africa:** The ToolJet interface is mobile-friendly and simple, suitable for the "Notebook" user.
3.  **You are preserving Truth:** All UI actions go through your API, ensuring the **6 Locks** can never be bypassed.

**Phase 2 transforms "Data" into a "System."**
