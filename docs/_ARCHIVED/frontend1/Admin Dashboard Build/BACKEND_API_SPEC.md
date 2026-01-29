# Project Bridge - Backend API Specification

## Overview

This document specifies the complete REST API endpoints required for the Project Bridge frontend. The frontend is built with Next.js, TypeScript, and uses SWR for data fetching with automatic revalidation.

**Base URL**: `http://localhost:3000/api/v1`

---

## 🔑 Authentication

All requests should include a `user_id` in the request body or query params where applicable. The frontend currently uses a default user ID: `user-default-001`.

Future enhancement will add proper session-based authentication.

---

## 📊 Transaction Endpoints

### `GET /transactions`

List all transactions with optional filters.

**Query Parameters**:
- `status` (optional): `DRAFT` | `POSTED` | `REVERSED` | `RECONCILED` | `VOIDED` | `ARCHIVED`
- `type` (optional): `RETAIL` | `SERVICE` | `RENTAL` | `EXPENSE` | `EXPENSE_RETURN`
- `payment_status` (optional): `PENDING` | `PARTIAL` | `PAID` | `OVERDUE` | `CREDIT`
- `from_date` (optional): ISO date string (e.g., `2026-01-01`)
- `to_date` (optional): ISO date string
- `search` (optional): Full-text search on reference, entity name

**Response**: `200 OK`
```json
[
  {
    "id": "txn-uuid",
    "tenant_id": "tenant-uuid",
    "entity_id": "entity-uuid",
    "created_by_user_id": "user-uuid",
    "type": "RETAIL",
    "status": "POSTED",
    "payment_status": "PAID",
    "total_amount": 5000,
    "currency_code": "KES",
    "transaction_date": "2026-01-29T12:00:00Z",
    "reference": "INV-001",
    "reversed_transaction_id": null,
    "linked_transaction_id": null,
    "due_date": null,
    "context": "Deliver to Karen, Gate B",
    "metadata": {},
    "lines": [
      {
        "id": "line-uuid",
        "transaction_id": "txn-uuid",
        "description": "Item description",
        "quantity": 2,
        "unit_price": 2500,
        "total_line_amount": 5000,
        "account_code": "4000",
        "sku": "ITEM-001",
        "metadata": {}
      }
    ],
    "payments": [
      {
        "id": "pay-uuid",
        "transaction_id": "txn-uuid",
        "method": "MPESA",
        "amount": 3000,
        "reference": "ABC123456",
        "paid_at": "2026-01-29T12:00:00Z",
        "metadata": {}
      },
      {
        "id": "pay-uuid-2",
        "transaction_id": "txn-uuid",
        "method": "CASH",
        "amount": 2000,
        "reference": null,
        "paid_at": "2026-01-29T12:00:00Z",
        "metadata": {}
      }
    ],
    "attachments": [
      {
        "id": "att-uuid",
        "transaction_id": "txn-uuid",
        "file_name": "receipt.jpg",
        "file_type": "IMAGE",
        "file_url": "https://storage.example.com/receipt.jpg",
        "file_size": 102400,
        "uploaded_by_user_id": "user-uuid",
        "uploaded_at": "2026-01-29T12:00:00Z",
        "metadata": {}
      }
    ],
    "entity": {
      "id": "entity-uuid",
      "tenant_id": "tenant-uuid",
      "type": "CUSTOMER",
      "display_name": "John Kamau",
      "phone_number": "+254711111111",
      "linked_phones": ["+254722222222"],
      "alternate_names": ["Johnny"],
      "location": "Nairobi, Karen",
      "notes": "Regular customer, prefers M-Pesa",
      "balance": 5000,
      "metadata": {},
      "created_by_user_id": "user-uuid",
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-01-29T12:00:00Z"
    }
  }
]
```

---

### `GET /transactions/:id`

Get a single transaction by ID.

**Response**: `200 OK` (same schema as list item above)

---

### `POST /transactions`

Create a new transaction.

**Request Body**:
```json
{
  "tenant_id": "tenant-uuid",
  "created_by_user_id": "user-uuid",
  "entity_id": "entity-uuid",
  "type": "RETAIL",
  "currency_code": "KES",
  "transaction_date": "2026-01-29T12:00:00Z",
  "reference": "INV-002",
  "linked_transaction_id": null,
  "due_date": "2026-02-05",
  "context": "Customer requested green packaging",
  "lines": [
    {
      "description": "Product A",
      "quantity": 2,
      "unit_price": 1500,
      "account_code": "4000",
      "sku": "PROD-A"
    }
  ],
  "payments": [
    {
      "method": "CASH",
      "amount": 2000,
      "reference": null,
      "paid_at": "2026-01-29T12:00:00Z"
    },
    {
      "method": "MPESA",
      "amount": 1000,
      "reference": "XYZ789",
      "paid_at": "2026-01-29T12:00:00Z"
    }
  ]
}
```

**Response**: `201 Created` (full transaction object with generated IDs)

**Business Logic**:
- Transaction starts in `DRAFT` status
- If `payments` array is provided and sum equals `total_amount`, set `payment_status` to `PAID`
- If `payments` array sum is less than `total_amount`, set to `PARTIAL`
- If `payments` array is empty or missing, set to `PENDING`
- If `due_date` is provided, set `payment_status` to `CREDIT`
- Auto-calculate `total_amount` from line items: `SUM(quantity * unit_price)`

---

### `POST /transactions/:id/post`

Post a draft transaction (change status from DRAFT to POSTED).

**Request Body**:
```json
{
  "user_id": "user-uuid"
}
```

**Response**: `200 OK` (updated transaction object)

**Business Logic**:
- Only DRAFT transactions can be posted
- Sets `status` to `POSTED`
- Sets `posted_at` timestamp in metadata
- Validates that transaction has at least one line item

---

### `POST /transactions/:id/reverse`

Reverse a posted transaction.

**Request Body**:
```json
{
  "user_id": "user-uuid",
  "reason_code": "RETURN",
  "reason_details": "Customer returned damaged goods"
}
```

**Response**: `200 OK` (updated transaction object)

**Business Logic**:
- Only POSTED transactions can be reversed
- Sets `status` to `REVERSED`
- Stores reason in `metadata`
- Creates a reversing transaction (negative amounts) linked via `reversed_transaction_id`

---

### `PATCH /transactions/:id/payment_status`

Update payment status manually.

**Request Body**:
```json
{
  "payment_status": "PAID"
}
```

**Response**: `200 OK` (updated transaction object)

---

### `GET /transactions/:id/export`

Export transaction as JSON (for debugging/auditing).

**Response**: `200 OK` (full transaction object with all relations)

---

## 👥 Entity Endpoints

### `GET /entities`

List all entities with optional filters.

**Query Parameters**:
- `search` (optional): Search across `display_name`, `phone_number`, `linked_phones`, `alternate_names`
- `type` (optional): `CUSTOMER` | `SUPPLIER` | `EMPLOYEE`
- `has_balance` (optional): `true` | `false` - Filter to entities with outstanding balances

**Response**: `200 OK`
```json
[
  {
    "id": "entity-uuid",
    "tenant_id": "tenant-uuid",
    "type": "CUSTOMER",
    "display_name": "Mary Wanjiku",
    "phone_number": "+254722222222",
    "linked_phones": ["+254733333333"],
    "alternate_names": ["Mary W.", "Mama Wanjiku"],
    "location": "Westlands, Nairobi",
    "notes": "Prefers delivery on weekends",
    "balance": 15000,
    "metadata": {},
    "created_by_user_id": "user-uuid",
    "created_at": "2026-01-15T00:00:00Z",
    "updated_at": "2026-01-29T12:00:00Z"
  }
]
```

---

### `GET /entities/:id`

Get a single entity by ID.

**Response**: `200 OK` (entity object)

---

### `GET /entities/search?phone={phone}`

Search entities by phone number (checks both main and linked phones).

**Response**: `200 OK` (array of matching entities)

---

### `POST /entities`

Create a new entity.

**Request Body**:
```json
{
  "tenant_id": "tenant-uuid",
  "created_by_user_id": "user-uuid",
  "type": "CUSTOMER",
  "display_name": "Peter Ochieng",
  "phone_number": "+254744444444",
  "linked_phones": ["+254755555555"],
  "alternate_names": ["Pete"],
  "location": "Kilimani, Nairobi",
  "notes": "First-time customer",
  "metadata": {}
}
```

**Response**: `201 Created` (full entity object)

---

### `PATCH /entities/:id`

Update an existing entity.

**Request Body**:
```json
{
  "display_name": "Peter Ochieng Jr.",
  "location": "CBD, Nairobi",
  "notes": "Updated address"
}
```

**Response**: `200 OK` (updated entity object)

---

### `GET /entities/:id/profile`

Get entity profile with balance calculations and transaction history.

**Response**: `200 OK`
```json
{
  "id": "entity-uuid",
  "tenant_id": "tenant-uuid",
  "type": "CUSTOMER",
  "display_name": "John Kamau",
  "phone_number": "+254711111111",
  "linked_phones": ["+254722222222", "+254733333333"],
  "alternate_names": ["Johnny", "JK"],
  "location": "Karen, Nairobi",
  "notes": "VIP customer since 2025",
  "metadata": {},
  "created_by_user_id": "user-uuid",
  "created_at": "2025-06-01T00:00:00Z",
  "updated_at": "2026-01-29T12:00:00Z",
  "total_credit": 50000,
  "total_debit": 35000,
  "net_balance": 15000,
  "transaction_count": 24,
  "last_transaction_date": "2026-01-29T12:00:00Z",
  "transactions": [
    // Array of transaction objects
  ]
}
```

**Balance Calculations**:
- `total_credit`: Sum of all transactions where entity is a CUSTOMER and status is POSTED (money they owe us)
- `total_debit`: Sum of all transactions where entity is a SUPPLIER and status is POSTED (money we owe them)
- `net_balance`: `total_credit - total_debit` (positive = they owe us, negative = we owe them)

---

### `POST /entities/:id/linked-phones`

Add a linked phone number to an entity.

**Request Body**:
```json
{
  "phone": "+254766666666"
}
```

**Response**: `200 OK` (updated entity object)

---

### `DELETE /entities/:id/linked-phones`

Remove a linked phone number.

**Request Body**:
```json
{
  "phone": "+254766666666"
}
```

**Response**: `200 OK` (updated entity object)

---

### `GET /entities/with-balances`

Get all entities with their calculated balances (for CRM dashboard).

**Response**: `200 OK` (array of EntityWithBalance objects)

---

### `GET /entities/:id/history`

Legacy endpoint - Get entity with transaction history.

**Response**: `200 OK`
```json
{
  "id": "entity-uuid",
  "display_name": "John Kamau",
  // ... other entity fields
  "transactions": [
    // Array of transaction objects
  ]
}
```

---

## 📎 Attachment Endpoints

### `POST /attachments/upload`

Upload a file (receipt, invoice, audio note).

**Request**: `multipart/form-data`
- `file`: File object
- `transaction_id` (optional): UUID
- `entity_id` (optional): UUID
- `user_id`: UUID

**Response**: `201 Created`
```json
{
  "id": "att-uuid",
  "entity_id": "entity-uuid",
  "transaction_id": "txn-uuid",
  "file_name": "receipt.jpg",
  "file_type": "IMAGE",
  "file_url": "https://storage.example.com/attachments/receipt.jpg",
  "file_size": 204800,
  "uploaded_by_user_id": "user-uuid",
  "uploaded_at": "2026-01-29T12:00:00Z",
  "metadata": {}
}
```

**File Type Detection**:
- Images: `image/*` → `IMAGE`
- PDFs: `application/pdf` → `PDF`
- Audio: `audio/*` → `AUDIO`
- Other: → `OTHER`

**Storage Implementation**:
- Use Supabase Storage or local filesystem
- Generate secure URLs with expiration (if using cloud storage)
- Store files in: `{tenant_id}/{transaction_id or entity_id}/{filename}`

---

### `GET /attachments?transaction_id={id}`

List attachments for a transaction.

**Response**: `200 OK` (array of attachment objects)

---

### `GET /attachments?entity_id={id}`

List attachments for an entity.

**Response**: `200 OK` (array of attachment objects)

---

### `GET /attachments/:id`

Get a single attachment.

**Response**: `200 OK` (attachment object)

---

### `DELETE /attachments/:id`

Delete an attachment.

**Response**: `204 No Content`

**Implementation**: Delete from storage and database

---

## 📊 Database Schema

### `entities` table
```sql
CREATE TABLE entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  type VARCHAR(50) NOT NULL, -- CUSTOMER, SUPPLIER, EMPLOYEE
  display_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20), -- E.164 format: +254711111111
  linked_phones TEXT[], -- Array of phone numbers
  alternate_names TEXT[], -- Array of alternate names
  location TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_by_user_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_entities_phone ON entities(phone_number);
CREATE INDEX idx_entities_linked_phones ON entities USING GIN(linked_phones);
CREATE INDEX idx_entities_tenant ON entities(tenant_id);
```

---

### `transactions` table
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  entity_id UUID NOT NULL REFERENCES entities(id),
  created_by_user_id UUID NOT NULL,
  type VARCHAR(50) NOT NULL, -- RETAIL, SERVICE, RENTAL, EXPENSE, EXPENSE_RETURN
  status VARCHAR(50) NOT NULL DEFAULT 'DRAFT', -- DRAFT, POSTED, REVERSED, etc.
  payment_status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, PARTIAL, PAID, OVERDUE, CREDIT
  total_amount INTEGER NOT NULL, -- Amount in cents/smallest unit
  currency_code VARCHAR(3) NOT NULL DEFAULT 'KES',
  transaction_date TIMESTAMP NOT NULL,
  reference VARCHAR(255),
  reversed_transaction_id UUID REFERENCES transactions(id),
  linked_transaction_id UUID REFERENCES transactions(id), -- For EXPENSE_RETURN
  due_date DATE, -- For credit/udhaari
  context TEXT, -- Free-form observation notes
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_transactions_entity ON transactions(entity_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_reference ON transactions(reference);
```

---

### `transaction_lines` table
```sql
CREATE TABLE transaction_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  description VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price INTEGER NOT NULL, -- Amount in cents
  total_line_amount INTEGER NOT NULL, -- quantity * unit_price
  account_code VARCHAR(50),
  sku VARCHAR(100),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_transaction_lines_txn ON transaction_lines(transaction_id);
```

---

### `payment_records` table
```sql
CREATE TABLE payment_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  method VARCHAR(50) NOT NULL, -- CASH, MPESA, BANK, CARD, CREDIT, OTHER
  amount INTEGER NOT NULL, -- Amount in cents
  reference VARCHAR(255), -- M-Pesa code, bank ref, etc.
  paid_at TIMESTAMP,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payment_records_txn ON payment_records(transaction_id);
```

---

### `attachments` table
```sql
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL, -- IMAGE, PDF, AUDIO, OTHER
  file_url TEXT NOT NULL,
  file_size INTEGER,
  uploaded_by_user_id UUID NOT NULL,
  uploaded_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_attachments_entity ON attachments(entity_id);
CREATE INDEX idx_attachments_transaction ON attachments(transaction_id);
```

---

## 🎯 Key Implementation Notes

### 1. Amount Storage
- **ALWAYS store amounts as integers in the smallest currency unit (cents/cents)**
- Example: 1,500 KES = 150000 (stored as integer)
- Frontend handles conversion using `formatCurrency()` helper

### 2. Phone Number Format
- Use E.164 format: `+254711111111` (no spaces, dashes, or parentheses)
- Validate on backend: Must start with `+` and country code

### 3. Transaction Status Flow
```
DRAFT → (post) → POSTED → (reverse) → REVERSED
```
- DRAFT: Editable, not counted in balances
- POSTED: Immutable, counted in balances
- REVERSED: Creates reversing entry, original remains for audit

### 4. Payment Status Logic
```javascript
if (payments.sum === total_amount) → PAID
if (payments.sum > 0 && payments.sum < total_amount) → PARTIAL
if (payments.sum === 0 && due_date exists) → CREDIT
if (payments.sum === 0) → PENDING
if (due_date < today && payment_status != PAID) → OVERDUE
```

### 5. Balance Calculation
```javascript
// For CUSTOMER entities:
net_balance = SUM(transactions where type=RETAIL/SERVICE and status=POSTED)
            - SUM(payments.amount)

// For SUPPLIER entities:
net_balance = SUM(payments.amount)
            - SUM(transactions where type=EXPENSE and status=POSTED)
```

### 6. Search Implementation
- Entity search should use PostgreSQL `ILIKE` or full-text search
- Search fields: `display_name`, `phone_number`, `linked_phones[]`, `alternate_names[]`
- Transaction search: `reference`, `entity.display_name`

### 7. File Storage Best Practices
- Generate unique filenames: `{uuid}-{original_filename}`
- Validate file types on backend
- Enforce size limits (e.g., 10MB for images, 50MB for PDFs)
- Use signed URLs with expiration for cloud storage
- Implement virus scanning for production

---

## 🧪 Testing with Mock Data

The frontend has mock data enabled by default (`USE_MOCK_DATA = true` in `/lib/mock-data.ts`).

To switch to your backend:
1. Set `USE_MOCK_DATA = false` in `/lib/mock-data.ts`
2. Update `API_BASE_URL` in `/lib/api.ts` if needed
3. Ensure backend is running on `http://localhost:3000`

---

## 📝 Example Request/Response Flows

### Create Transaction with Split Payment
```http
POST /api/v1/transactions
Content-Type: application/json

{
  "tenant_id": "tenant-001",
  "created_by_user_id": "user-001",
  "entity_id": "entity-john-kamau",
  "type": "RETAIL",
  "currency_code": "KES",
  "transaction_date": "2026-01-29T14:30:00Z",
  "reference": "INV-123",
  "context": "Customer wants delivery to Karen, call before arriving",
  "lines": [
    {
      "description": "Laptop Dell XPS 13",
      "quantity": 1,
      "unit_price": 8000000, // 80,000 KES in cents
      "account_code": "4000",
      "sku": "LAPTOP-DELL-001"
    }
  ],
  "payments": [
    {
      "method": "MPESA",
      "amount": 5000000, // 50,000 KES
      "reference": "ABC123XYZ",
      "paid_at": "2026-01-29T14:30:00Z"
    },
    {
      "method": "CASH",
      "amount": 3000000, // 30,000 KES
      "paid_at": "2026-01-29T14:30:00Z"
    }
  ]
}
```

**Response**: `201 Created`
```json
{
  "id": "txn-new-uuid",
  "status": "DRAFT",
  "payment_status": "PAID", // 50k + 30k = 80k (fully paid)
  "total_amount": 8000000,
  // ... rest of transaction object with generated IDs
}
```

---

### Create Credit Transaction (Udhaari)
```http
POST /api/v1/transactions
Content-Type: application/json

{
  "tenant_id": "tenant-001",
  "created_by_user_id": "user-001",
  "entity_id": "entity-mary-wanjiku",
  "type": "RETAIL",
  "currency_code": "KES",
  "transaction_date": "2026-01-29T14:30:00Z",
  "due_date": "2026-02-12", // 2 weeks credit
  "reference": "INV-124",
  "context": "Agreed to pay in 2 weeks, customer is trusted",
  "lines": [
    {
      "description": "Milk 2L x 10 bottles",
      "quantity": 10,
      "unit_price": 15000, // 150 KES
      "account_code": "4000"
    }
  ],
  "payments": [] // No payment yet - it's credit
}
```

**Response**: `201 Created`
```json
{
  "id": "txn-credit-uuid",
  "status": "DRAFT",
  "payment_status": "CREDIT", // Has due_date, no payments
  "total_amount": 150000, // 1,500 KES
  "due_date": "2026-02-12",
  // ... rest of transaction
}
```

---

## 🚀 Frontend Implementation Summary

The frontend is fully built with:

1. **5 Pages**:
   - **Transaction Feed** (`/`): View all transactions with filters
   - **Create Transaction** (`/create`): Enhanced form with split payments, credit, context
   - **People/CRM** (`/people`): Universal profiles with linked phones, 360° view
   - **Proof Vault** (`/proof`): File gallery for receipts and attachments
   - **Transaction Manager** (`/manager`): Post/reverse transactions

2. **Key Features Implemented**:
   - ✅ Split payments (multiple methods per transaction)
   - ✅ Credit/Udhaari with due dates
   - ✅ Linked phone numbers for entities
   - ✅ File attachments (receipts, PDFs, audio)
   - ✅ Context/Notes field for observations
   - ✅ Transaction reversal with reason codes
   - ✅ Real-time balance calculations
   - ✅ Full-text search across entities and transactions
   - ✅ Mock data for development/testing

3. **Tech Stack**:
   - Next.js 15 (App Router)
   - TypeScript
   - Tailwind CSS v4
   - shadcn/ui components
   - SWR for data fetching
   - Lucide icons

4. **API Client** (`/lib/api.ts`):
   - Fully typed API methods
   - Mock data fallback for development
   - Error handling
   - File upload support

---

## 🎯 Next Steps for Backend

1. **Set up database**: Create tables using schemas above
2. **Implement API endpoints**: Follow this spec exactly
3. **Add validation**: Phone numbers (E.164), amounts (positive integers), required fields
4. **File storage**: Implement Supabase Storage or local filesystem
5. **Balance calculations**: Implement aggregation queries for entity balances
6. **Testing**: Use the frontend with mock data off to test your API

---

**Frontend Status**: ✅ Complete and ready for backend integration

**Backend Status**: ⏳ Awaiting implementation

**Last Updated**: 2026-01-29
