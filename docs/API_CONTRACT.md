# Project Bridge API Contract

## Overview

This document defines the complete API contract for Project Bridge - a headless truth ledger for the African informal economy. Any frontend implementation (web, mobile, desktop) should use this contract to interact with the backend.

**Base URL**: `http://localhost:3000/api/v1` (development)  
**Content-Type**: `application/json`  
**Authentication**: Bearer token (coming in Phase 4)

---

## Data Types

### Core Enums

```typescript
type TransactionType = 'RETAIL' | 'SERVICE' | 'RENTAL' | 'EXPENSE' | 'EXPENSE_RETURN';
type TransactionStatus = 'DRAFT' | 'POSTED' | 'REVERSED' | 'RECONCILED' | 'VOIDED' | 'ARCHIVED';
type PaymentStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CREDIT';
type EntityType = 'CUSTOMER' | 'SUPPLIER' | 'EMPLOYEE';
type PaymentMethod = 'CASH' | 'MPESA' | 'BANK' | 'CARD' | 'CREDIT' | 'OTHER';
type FileType = 'IMAGE' | 'PDF' | 'AUDIO' | 'OTHER';
type ReasonCode = 'RETURN' | 'ERROR' | 'CANCELLATION' | 'OTHER';
```

### Transaction

```typescript
interface Transaction {
  id: string;                          // UUID
  tenant_id: string;                   // UUID
  entity_id: string;                   // UUID - customer/supplier
  created_by_user_id: string;          // UUID
  type: TransactionType;
  status: TransactionStatus;
  payment_status: PaymentStatus;
  total_amount: number;                // In cents (5000 = 50.00)
  currency_code: string;               // e.g., 'KES', 'USD'
  transaction_date: string;            // ISO 8601
  reference?: string;                  // Invoice number, etc.
  reversed_transaction_id?: string;    // UUID of original if this is a reversal
  linked_transaction_id?: string;      // UUID of original for returns
  due_date?: string;                   // ISO 8601 - for credit/udhaari
  context?: string;                    // Free-form notes
  tags?: string[];                     // Categorization tags
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  
  // Relations
  lines: TransactionLine[];
  payments?: PaymentRecord[];
  attachments?: Attachment[];
  entity?: Entity;
}
```

### TransactionLine

```typescript
interface TransactionLine {
  id: string;
  transaction_id: string;
  description: string;
  quantity: number;
  unit_price: number;                  // In cents
  total_line_amount: number;           // quantity * unit_price
  account_code: string;                // e.g., '200-SALES'
  sku?: string;
  metadata: Record<string, unknown>;
}
```

### Entity

```typescript
interface Entity {
  id: string;
  tenant_id: string;
  type: EntityType;
  display_name: string;
  phone_number?: string;               // E.164 format (+254...)
  linked_phones?: string[];            // Additional phone numbers
  alternate_names?: string[];          // Nicknames, aliases
  location?: string;                   // Physical address
  notes?: string;                      // Communication log
  trust_score?: number;                // 0-100 calculated score
  metadata: Record<string, unknown>;
  created_by_user_id: string;
  created_at: string;
  updated_at: string;
}
```

### EntityWithBalance

```typescript
interface EntityWithBalance extends Entity {
  total_credit: number;                // Money they owe us
  total_debit: number;                 // Money we owe them
  net_balance: number;                 // Positive = they owe us
  transaction_count: number;
  last_transaction_date?: string;
}
```

### PaymentRecord

```typescript
interface PaymentRecord {
  id: string;
  transaction_id: string;
  method: PaymentMethod;
  amount: number;                      // In cents
  reference?: string;                  // M-Pesa code, bank ref, etc.
  paid_at?: string;                    // ISO 8601
  metadata: Record<string, unknown>;
  created_at: string;
}
```

### Attachment

```typescript
interface Attachment {
  id: string;
  entity_id?: string;                  // Either entity_id or transaction_id required
  transaction_id?: string;
  file_name: string;
  file_type: FileType;
  file_url: string;                    // Public URL to file
  file_size?: number;                  // Bytes
  uploaded_by_user_id: string;
  uploaded_at: string;
  metadata: Record<string, unknown>;
}
```

### DashboardStats

```typescript
interface DashboardStats {
  total_revenue_today: number;
  total_revenue_week: number;
  total_revenue_month: number;
  transactions_today: number;
  transactions_week: number;
  outstanding_credit: number;          // Total udhaari owed to us
  outstanding_debt: number;            // Total we owe suppliers
  payment_method_breakdown: {
    cash: number;
    mpesa: number;
    bank: number;
    credit: number;
  };
  top_customers: Array<{
    entity_id: string;
    display_name: string;
    total_amount: number;
    transaction_count: number;
  }>;
  recent_activity: Array<{
    id: string;
    type: 'transaction' | 'payment' | 'entity' | 'reversal';
    description: string;
    amount?: number;
    timestamp: string;
  }>;
}
```

---

## API Endpoints

### Transactions

#### List Transactions
```http
GET /transactions?status=DRAFT&type=RETAIL&payment_status=PENDING&search=john&date_from=2026-01-01&date_to=2026-01-31
```

**Query Parameters**:
| Param | Type | Description |
|-------|------|-------------|
| status | string | Filter by status |
| type | string | Filter by type |
| payment_status | string | Filter by payment status |
| entity_id | string | Filter by customer/supplier |
| search | string | Search reference, entity name, SKU |
| date_from | string | Start date (ISO 8601) |
| date_to | string | End date (ISO 8601) |

**Response**: `Transaction[]`

---

#### Get Transaction
```http
GET /transactions/:id
```

**Response**: `Transaction` (with lines, payments, attachments, entity)

---

#### Create Transaction
```http
POST /transactions
Content-Type: application/json

{
  "tenant_id": "uuid",
  "created_by_user_id": "uuid",
  "entity_id": "uuid",
  "type": "RETAIL",
  "currency_code": "KES",
  "transaction_date": "2026-01-29T10:00:00Z",
  "reference": "INV-001",
  "due_date": "2026-02-05T00:00:00Z",      // Optional - for credit
  "context": "Deliver to Karen, Gate B",   // Optional
  "tags": ["urgent", "wholesale"],         // Optional
  "lines": [
    {
      "description": "Nike Air Max",
      "quantity": 2,
      "unit_price": 5000,
      "sku": "NIKE-001",
      "account_code": "200-SALES"
    }
  ],
  "payments": [                              // Optional - split payments
    {
      "method": "CASH",
      "amount": 5000,
      "reference": null
    },
    {
      "method": "MPESA",
      "amount": 5000,
      "reference": "ABC123"
    }
  ]
}
```

**Response**: `Transaction`

**Notes**:
- If `due_date` is provided, `payment_status` will be set to `CREDIT`
- If `payments` provided, payment records are created and status calculated
- `total_amount` is calculated from lines (not trusted from input)

---

#### Post Transaction
```http
POST /transactions/:id/post
Content-Type: application/json

{
  "user_id": "uuid"
}
```

**Response**: `Transaction` (status: POSTED)

**Errors**:
- 400: Transaction not in DRAFT status
- 404: Transaction not found

---

#### Reverse Transaction
```http
POST /transactions/:id/reverse
Content-Type: application/json

{
  "user_id": "uuid",
  "reason_code": "RETURN",
  "reason_text": "Customer returned items"
}
```

**Response**: `Transaction` (new reversal transaction)

**Notes**:
- Creates a new transaction with negative amounts
- Original transaction status changes to REVERSED
- Reversal transaction is immediately POSTED

---

#### Update Payment Status
```http
PATCH /transactions/:id/payment_status
Content-Type: application/json

{
  "payment_status": "PAID"
}
```

**Response**: `Transaction`

---

#### Export Transaction
```http
GET /transactions/:id/export
```

**Response**: Universal Invoice format (JSON)

---

### Entities

#### List Entities
```http
GET /entities?type=CUSTOMER&search=john
```

**Query Parameters**:
| Param | Type | Description |
|-------|------|-------------|
| type | string | Filter by type |
| search | string | Search name, phone, linked_phones, alternate_names |

**Response**: `Entity[]`

---

#### Get Entity
```http
GET /entities/:id
```

**Response**: `Entity`

---

#### Create Entity
```http
POST /entities
Content-Type: application/json

{
  "tenant_id": "uuid",
  "created_by_user_id": "uuid",
  "type": "CUSTOMER",
  "display_name": "John Doe",
  "phone_number": "+254712345678",
  "linked_phones": ["+254722222222"],
  "alternate_names": ["Johnny"],
  "location": "Karen, Nairobi",
  "notes": "Regular customer, pays on time",
  "metadata": {}
}
```

**Response**: `Entity`

---

#### Update Entity
```http
PATCH /entities/:id
Content-Type: application/json

{
  "display_name": "John Doe Jr",
  "notes": "Updated note"
}
```

**Response**: `Entity`

---

#### Search by Phone
```http
GET /entities/search?phone=%2B254712345678
```

**Response**: `Entity[]` (searches both phone_number and linked_phones)

---

#### Get Entity with Balance
```http
GET /entities/:id/balance
```

**Response**:
```json
{
  "entity": Entity,
  "balance": {
    "total_credit": 50000,
    "total_debit": 10000,
    "net_balance": 40000
  }
}
```

---

#### Get Entity Profile (360° View)
```http
GET /entities/:id/profile
```

**Response**:
```json
{
  "entity": EntityWithBalance,
  "transactions": Transaction[],
  "attachments": Attachment[]
}
```

---

#### Add Linked Phone
```http
POST /entities/:id/linked-phones
Content-Type: application/json

{
  "phone": "+254722222222"
}
```

**Response**: `Entity`

---

#### Remove Linked Phone
```http
DELETE /entities/:id/linked-phones
Content-Type: application/json

{
  "phone": "+254722222222"
}
```

**Response**: `Entity`

---

#### Get Entities with Balances
```http
GET /entities/with-balances
```

**Response**: `EntityWithBalance[]`

---

### Payment Records

#### List Payment Records for Transaction
```http
GET /payment-records?transaction_id=:id
```

**Response**: `PaymentRecord[]`

---

#### Create Payment Record
```http
POST /payment-records
Content-Type: application/json

{
  "transaction_id": "uuid",
  "method": "MPESA",
  "amount": 5000,
  "reference": "ABC123",
  "paid_at": "2026-01-29T10:00:00Z"
}
```

**Response**: `PaymentRecord`

---

#### Delete Payment Record
```http
DELETE /payment-records/:id
```

**Response**: `204 No Content`

**Note**: Only allowed if parent transaction is in DRAFT status

---

### Attachments

#### Upload Attachment
```http
POST /attachments/upload
Content-Type: multipart/form-data

file: <binary>
transaction_id: uuid (optional)
entity_id: uuid (optional)
user_id: uuid
```

**Response**: `Attachment`

**Notes**:
- Either `transaction_id` or `entity_id` must be provided
- File is uploaded to Supabase Storage
- Max file size: 10MB

---

#### List Attachments
```http
GET /attachments?transaction_id=:id
GET /attachments?entity_id=:id
```

**Response**: `Attachment[]`

---

#### Delete Attachment
```http
DELETE /attachments/:id
```

**Response**: `204 No Content`

---

### Dashboard

#### Get Dashboard Stats
```http
GET /dashboard/stats
```

**Response**: `DashboardStats`

---

## Error Responses

All errors follow this format:

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

### Common Error Codes

| Status | Code | Description |
|--------|------|-------------|
| 400 | BAD_REQUEST | Invalid input data |
| 401 | UNAUTHORIZED | Missing or invalid authentication |
| 403 | FORBIDDEN | Not allowed to access this resource |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Resource already exists or state conflict |
| 422 | UNPROCESSABLE | Validation failed |
| 500 | INTERNAL_ERROR | Server error |

---

## Webhooks (Phase 4)

Future implementations will support webhooks for:

- Transaction posted
- Payment received
- Entity created/updated

---

## Rate Limiting

- 100 requests per minute per API key
- 1000 requests per hour per API key

---

## Versioning

API version is included in the URL path:
- Current: `/api/v1/`
- Future: `/api/v2/`

Breaking changes will result in a new version. Deprecated endpoints will be supported for 6 months.
