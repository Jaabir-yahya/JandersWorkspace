# Project Bridge Frontend - Complete Summary

**Status**: ✅ PRODUCTION READY - Waiting for Backend
**Last Updated**: 2026-01-29
**Tech Stack**: Next.js 16, React 19.2, TypeScript, Tailwind CSS v4, shadcn/ui

---

## 🎯 What We Built - "The Digital Notebook"

A headless-first admin dashboard that captures the reality of Nairobi's informal economy with:
- **Split payments** (Cash + M-Pesa + Bank)
- **Credit tracking** (Udhaari with due dates)
- **Universal profiles** (One person, many phones)
- **Proof vault** (Receipts, invoices, voice notes)
- **Context field** (Observation canvas for patterns)

---

## 📁 Project Structure

```
/app
  /page.tsx                    # Transaction Feed (main page)
  /create/page.tsx             # Create Transaction
  /people/page.tsx             # People/CRM
  /proof/page.tsx              # Proof Vault
  /manager/page.tsx            # Transaction Manager
  /layout.tsx                  # Root layout
  /globals.css                 # Theme tokens

/components
  /transaction-feed.tsx        # Feed with filters + table
  /transaction-detail.tsx      # Detail modal with attachments
  /transaction-manager.tsx     # Post/Reverse transactions
  /create-transaction-form.tsx # Enhanced create form
  /people-crm.tsx              # CRM with entity profiles
  /proof-gallery.tsx           # File gallery with upload
  /reverse-modal.tsx           # Reversal with reason codes
  /status-badge.tsx            # Status/payment badges
  /dashboard-shell.tsx         # Navigation shell
  /ui/*                        # shadcn/ui components

/lib
  /api.ts                      # API client (all endpoints)
  /types.ts                    # TypeScript interfaces
  /helpers.ts                  # Currency formatting, dates
  /mock-data.ts                # Mock data for development
  /utils.ts                    # cn() utility

/BACKEND_API_SPEC.md           # Complete API specification
/FRONTEND_SUMMARY.md           # This document
```

---

## 🔌 API Integration Point

### Configuration

**File**: `/lib/api.ts`

```typescript
const API_BASE_URL = "http://localhost:3000/api/v1";
const DEFAULT_TENANT_ID = "tenant-001";
const DEFAULT_USER_ID = "user-001";
```

**To Connect Your Backend**:
1. Update `API_BASE_URL` to your backend URL
2. Set `USE_MOCK_DATA = false` in `/lib/mock-data.ts`
3. Ensure backend runs at `/api/v1` prefix

### Expected Response Format

All endpoints should return JSON with this structure:

```typescript
// Success response (single item)
{
  "id": "uuid",
  "field1": "value",
  // ... rest of object
}

// Success response (list)
[
  { "id": "uuid1", ... },
  { "id": "uuid2", ... }
]

// Error response
{
  "message": "Error description",
  "statusCode": 400
}
```

---

## 📊 Data Models (TypeScript Interfaces)

### Core Types

```typescript
// Transaction Types
type TransactionType = "RETAIL" | "SERVICE" | "RENTAL" | "EXPENSE" | "EXPENSE_RETURN";
type TransactionStatus = "DRAFT" | "POSTED" | "REVERSED" | "RECONCILED" | "VOIDED" | "ARCHIVED";
type PaymentStatus = "PENDING" | "PARTIAL" | "PAID" | "OVERDUE" | "CREDIT";
type PaymentMethod = "CASH" | "MPESA" | "BANK" | "CARD" | "CREDIT" | "OTHER";
type EntityType = "CUSTOMER" | "SUPPLIER" | "EMPLOYEE";
type ReasonCode = "RETURN" | "ERROR" | "CANCELLATION" | "OTHER";
```

### Entity (Person/Business)

```typescript
interface Entity {
  id: string;
  tenant_id: string;
  type: EntityType;
  display_name: string;
  phone_number?: string;           // E.164 format: +254711111111
  linked_phones?: string[];        // Additional phone numbers
  alternate_names?: string[];      // Nicknames, alternate spellings
  location?: string;               // Physical address
  notes?: string;                  // Communication log
  balance?: number;                // Calculated balance (optional)
  metadata: Record<string, unknown>;
  created_by_user_id: string;
  created_at: string;              // ISO 8601
  updated_at: string;
}

interface EntityWithBalance extends Entity {
  total_credit: number;            // Money they owe us
  total_debit: number;             // Money we owe them
  net_balance: number;             // Positive = they owe us
  transaction_count: number;
  last_transaction_date?: string;
}
```

### Transaction

```typescript
interface Transaction {
  id: string;
  tenant_id: string;
  entity_id: string;
  created_by_user_id: string;
  type: TransactionType;
  status: TransactionStatus;
  payment_status: PaymentStatus;
  total_amount: number;            // IMPORTANT: Stored as INTEGER in cents
  currency_code: string;           // "KES", "USD", "NGN"
  transaction_date: string;        // ISO 8601
  reference?: string;
  reversed_transaction_id?: string;
  linked_transaction_id?: string;  // For EXPENSE_RETURN
  due_date?: string;               // For credit transactions
  context?: string;                // Free-form observation field
  metadata: Record<string, unknown>;
  lines: TransactionLine[];
  payments?: PaymentRecord[];      // Split payments
  attachments?: Attachment[];      // Proof/receipts
  entity?: Entity;                 // Populated in responses
}

interface TransactionLine {
  id: string;
  transaction_id: string;
  description: string;
  quantity: number;
  unit_price: number;              // INTEGER in cents
  total_line_amount: number;       // INTEGER in cents
  account_code?: string;
  sku?: string;
  metadata: Record<string, unknown>;
}
```

### Payment Record (Split Payments)

```typescript
interface PaymentRecord {
  id: string;
  transaction_id: string;
  method: PaymentMethod;
  amount: number;                  // INTEGER in cents
  reference?: string;              // M-Pesa code, bank ref
  paid_at?: string;                // ISO 8601
  metadata: Record<string, unknown>;
}
```

### Attachment (Proof)

```typescript
interface Attachment {
  id: string;
  entity_id?: string;
  transaction_id?: string;
  file_name: string;
  file_type: "IMAGE" | "PDF" | "AUDIO" | "OTHER";
  file_url: string;                // Public URL
  file_size?: number;              // Bytes
  uploaded_by_user_id: string;
  uploaded_at: string;             // ISO 8601
  metadata: Record<string, unknown>;
}
```

---

## 🔗 API Endpoints Expected by Frontend

### Transactions

```
GET    /api/v1/transactions
       ?status=POSTED&type=RETAIL&payment_status=PAID
       &start_date=2024-01-01&end_date=2024-12-31&search=john

GET    /api/v1/transactions/:id

POST   /api/v1/transactions
       Body: CreateTransactionInput

POST   /api/v1/transactions/:id/post
       Body: { user_id: string }

POST   /api/v1/transactions/:id/reverse
       Body: { reason_code, reason_text, user_id }

PATCH  /api/v1/transactions/:id/payment_status
       Body: { payment_status: PaymentStatus }

GET    /api/v1/transactions/:id/export

GET    /api/v1/transactions/:id/payment-records

GET    /api/v1/transactions/overdue
```

### Entities

```
GET    /api/v1/entities
       ?search=john&type=CUSTOMER&has_balance=true

GET    /api/v1/entities/:id

POST   /api/v1/entities
       Body: CreateEntityInput

PATCH  /api/v1/entities/:id
       Body: UpdateEntityInput

GET    /api/v1/entities/search?phone=+254711111111

GET    /api/v1/entities/:id/profile
       Returns: EntityWithBalance + { transactions: Transaction[] }

GET    /api/v1/entities/with-balances
       Returns: EntityWithBalance[]

POST   /api/v1/entities/:id/linked-phones
       Body: { phone: string }

DELETE /api/v1/entities/:id/linked-phones
       Body: { phone: string }

GET    /api/v1/entities/:id/history
       Returns: Entity + { transactions: Transaction[] }
```

### Attachments

```
POST   /api/v1/attachments/upload
       Content-Type: multipart/form-data
       FormData: { file, transaction_id?, entity_id?, user_id }

GET    /api/v1/attachments?transaction_id=xxx
GET    /api/v1/attachments?entity_id=xxx

DELETE /api/v1/attachments/:id
```

---

## 💰 Critical: Amount Storage

**Frontend sends and expects amounts as INTEGERS in CENTS**

```typescript
// Example: 1,500 KES
Frontend input: "1500"
Stored in DB: 150000 (integer)
Frontend display: "KES 1,500.00"

// Conversion helpers (already in /lib/helpers.ts)
formatCurrency(150000, "KES") // => "KES 1,500.00"
parseCurrency("1500") // => 150000
```

**Why?**
- Avoids floating-point errors
- Standard practice for financial systems
- Precision for calculations

---

## 🎨 UI Components Used

### shadcn/ui Components (Already Installed)

```
- Button, Card, Badge, Dialog, Tabs, Table
- Input, Textarea, Select, Checkbox, Switch
- Dropdown Menu, Popover, Calendar
- Skeleton, Spinner, Alert, Toast
```

### Custom Components

```
- StatusBadge: Visual status indicators
- TransactionDetail: Modal with full transaction details
- CreateTransactionForm: Multi-section form with dynamic line items
- PeopleCRM: Entity profiles with search
- ProofGallery: File gallery with upload/preview
- DashboardShell: Navigation wrapper
```

---

## 🔄 Data Flow

### 1. Transaction Feed Page (`/`)

```
User visits page
  ↓
Component calls: useSWR('/transactions', transactionApi.list)
  ↓
Frontend: GET /api/v1/transactions?status=...&type=...
  ↓
Backend returns: Transaction[] (with entity populated)
  ↓
Frontend displays in table with filters
  ↓
User clicks row → Shows TransactionDetail modal
  ↓
Modal loads attachments: GET /api/v1/attachments?transaction_id=xxx
```

### 2. Create Transaction Page (`/create`)

```
User fills form:
  - Selects entity (dropdown populated from entityApi.list)
  - Adds line items (dynamic)
  - Adds split payments (optional)
  - Sets due date for credit (optional)
  - Adds context/notes (optional)
  ↓
User clicks "Create Transaction"
  ↓
Frontend: POST /api/v1/transactions
Body: {
  tenant_id, entity_id, type, currency_code,
  transaction_date, lines, payments, due_date, context
}
  ↓
Backend:
  - Creates transaction (status=DRAFT)
  - Creates payment_records if payments provided
  - Calculates payment_status
  ↓
Frontend receives new transaction
  ↓
Redirects to Transaction Feed with success message
```

### 3. People/CRM Page (`/people`)

```
User visits page
  ↓
Component calls: entityApi.getWithBalances()
  ↓
Frontend: GET /api/v1/entities/with-balances
  ↓
Backend returns: EntityWithBalance[] (with calculated balances)
  ↓
Frontend displays cards with balance indicators
  ↓
User clicks entity → Opens profile modal
  ↓
Modal loads: GET /api/v1/entities/:id/profile
  ↓
Backend returns: EntityWithBalance + { transactions: [] }
  ↓
Modal shows: contact info, balance, transaction history, files
```

### 4. Proof Vault Page (`/proof`)

```
User visits page
  ↓
Component calls: transactionApi.list() + attachmentApi.listForTransaction
  ↓
Aggregates all attachments across transactions
  ↓
Displays gallery view (grid of thumbnails)
  ↓
User clicks "Upload"
  ↓
Selects file + optionally links to transaction/entity
  ↓
Frontend: POST /api/v1/attachments/upload (multipart/form-data)
  ↓
Backend uploads to storage + saves metadata to DB
  ↓
Returns: Attachment with file_url
  ↓
Frontend refreshes gallery
```

---

## 🎯 Key Features Implementation

### Split Payments

**Frontend Form** (`/components/create-transaction-form.tsx`):
- User can add multiple payment methods
- Each payment has: method, amount, reference
- Total payment amount validated against transaction total
- Payment status auto-calculated

**API Call**:
```typescript
POST /api/v1/transactions
{
  lines: [...],
  payments: [
    { method: "CASH", amount: 50000, reference: null },
    { method: "MPESA", amount: 100000, reference: "QAZ123XYZ" }
  ]
}
```

**Backend Should**:
- Create transaction
- Create payment_records for each payment
- Set payment_status = "PAID" (if sum matches total)

### Credit Tracking (Udhaari)

**Frontend Form**:
- Toggle "Credit (Pay Later)"
- Shows due date picker
- Validates due date is in future

**API Call**:
```typescript
POST /api/v1/transactions
{
  lines: [...],
  payments: [],  // Empty for credit
  due_date: "2024-02-15"
}
```

**Backend Should**:
- Create transaction
- Set payment_status = "CREDIT"
- Store due_date
- On due_date, update payment_status = "OVERDUE" (cron job)

### Linked Phone Numbers

**Frontend UI** (`/components/people-crm.tsx`):
- Main phone number (required, E.164)
- "Add Phone" button for additional numbers
- Search across all phones

**API Calls**:
```typescript
// Add linked phone
POST /api/v1/entities/:id/linked-phones
{ phone: "+254722222222" }

// Search by any phone
GET /api/v1/entities/search?phone=+254722222222
```

**Backend Should**:
- Store linked_phones as ARRAY in DB
- Search main phone OR linked_phones
- Return all matches

### Context Field (Observation Canvas)

**Frontend Form**:
- Large textarea for free-form notes
- Placeholder: "Add delivery notes, WhatsApp refs, payment agreements..."

**API Call**:
```typescript
POST /api/v1/transactions
{
  lines: [...],
  context: "Deliver to Ngara. WhatsApp: 0722111111. Promised 10% discount next time."
}
```

**Backend Should**:
- Store context as TEXT field
- Make searchable (full-text search)
- Track common patterns for future features

### File Attachments (Proof)

**Frontend UI** (`/components/transaction-detail.tsx`):
- File upload button (drag & drop)
- Image thumbnails with preview
- PDF/audio icons with download

**API Calls**:
```typescript
// Upload
POST /api/v1/attachments/upload
FormData: { file, transaction_id, user_id }

// List
GET /api/v1/attachments?transaction_id=xxx

// Delete
DELETE /api/v1/attachments/:id
```

**Backend Should**:
- Accept multipart/form-data
- Upload to Supabase Storage / S3
- Return public URL
- Store metadata in DB
- Validate file types/sizes

---

## 🔐 Security Notes

### Frontend Assumptions

1. **Authentication**: Not implemented yet
   - Currently uses hardcoded `DEFAULT_USER_ID`
   - Backend should validate user_id on all requests

2. **Tenant Isolation**: Not enforced
   - Currently uses hardcoded `DEFAULT_TENANT_ID`
   - Backend MUST enforce tenant isolation on all queries

3. **File Upload**: No client-side validation
   - Backend MUST validate file types/sizes
   - Backend MUST scan for viruses (production)

### Backend Should Implement

```typescript
// Middleware pseudocode
app.use((req, res, next) => {
  // 1. Verify JWT token
  const userId = verifyToken(req.headers.authorization);
  
  // 2. Get tenant_id from user
  const tenantId = getUserTenant(userId);
  
  // 3. Add to request context
  req.user = { id: userId, tenant_id: tenantId };
  
  // 4. All DB queries MUST include tenant_id filter
  next();
});
```

---

## 🎨 Theme & Styling

### Color System (Dark Theme)

Defined in `/app/globals.css`:

```css
--background: oklch(0.1 0 0);      /* Near black */
--foreground: oklch(0.95 0 0);     /* Near white */
--primary: oklch(0.95 0 0);        /* White primary */
--muted: oklch(0.2 0 0);           /* Dark gray */
--success: oklch(0.7 0.17 160);    /* Teal green */
--warning: oklch(0.75 0.15 80);    /* Yellow */
--destructive: oklch(0.55 0.2 25); /* Red */
```

### Status Badge Colors

```typescript
// StatusBadge component uses semantic colors:
POSTED → success (green)
DRAFT → warning (yellow)
REVERSED → destructive (red)
PAID → success (green)
CREDIT → warning (yellow)
PARTIAL → warning (yellow)
PENDING → muted (gray)
```

---

## 📱 Responsive Design

All pages are mobile-first:

- **Desktop** (>1024px): Full table views, side-by-side layouts
- **Tablet** (768-1024px): Responsive tables, stacked forms
- **Mobile** (<768px): Card views, stacked forms, collapsible filters

Navigation shell collapses to hamburger menu on mobile.

---

## 🧪 Testing Your Backend

### Step 1: Disable Mock Data

```typescript
// In /lib/mock-data.ts
export const USE_MOCK_DATA = false;
```

### Step 2: Test Each Page

1. **Transaction Feed** (`/`)
   - Should load list of transactions
   - Filters should work
   - Click transaction → modal opens
   - Modal should show attachments

2. **Create Transaction** (`/create`)
   - Create simple transaction
   - Create with split payments
   - Create with credit/due date
   - Create with context notes

3. **People/CRM** (`/people`)
   - Should load entities with balances
   - Click entity → profile opens
   - Add linked phone
   - Search by phone

4. **Proof Vault** (`/proof`)
   - Upload image
   - Upload PDF
   - View thumbnail
   - Delete attachment

5. **Transaction Manager** (`/manager`)
   - Post draft transaction
   - Reverse posted transaction

### Step 3: Check Browser Console

All API errors are logged:
```
[API Error] Failed to fetch: GET /api/v1/transactions
Error: Connection refused
```

### Step 4: Verify Data Flow

Use browser DevTools Network tab:
- Check request payloads
- Check response formats
- Verify status codes (200, 201, 400, 404, 500)

---

## 🚀 Deployment

### Environment Variables (Frontend)

```bash
NEXT_PUBLIC_API_URL=https://api.projectbridge.com/api/v1
NEXT_PUBLIC_TENANT_ID=your-tenant-id
NEXT_PUBLIC_USER_ID=your-user-id
```

### Build & Deploy

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start production server
npm start

# Deploy to Vercel
vercel deploy --prod
```

---

## 📊 Current State Summary

### ✅ Complete & Working

- [x] 5 pages fully built
- [x] All UI components styled
- [x] Dark theme implemented
- [x] Type system complete
- [x] API client with all endpoints
- [x] Mock data for development
- [x] Currency formatting helpers
- [x] Date formatting helpers
- [x] Status badge system
- [x] Responsive design
- [x] Loading states
- [x] Empty states
- [x] Error handling
- [x] Form validation
- [x] File upload UI
- [x] Image preview
- [x] Dynamic line items
- [x] Split payment UI
- [x] Credit toggle
- [x] Context field
- [x] Linked phones UI
- [x] Balance display
- [x] Transaction history
- [x] Filters (status, type, date, search)
- [x] Auto-refresh (30s)

### ⏳ Waiting on Backend

- [ ] Real API endpoints
- [ ] Database schema
- [ ] File storage
- [ ] Authentication
- [ ] Tenant isolation

### 🚫 Not Implemented (Future)

- [ ] User authentication UI
- [ ] Multi-tenant switcher
- [ ] Overdue notifications
- [ ] Trust scores
- [ ] Analytics dashboard
- [ ] Bulk operations
- [ ] Export to CSV/PDF
- [ ] Email/SMS notifications
- [ ] WhatsApp integration
- [ ] M-Pesa API integration

---

## 🎯 Success Metrics

When backend is complete, these should all work:

1. **Create a transaction** with 2 payment methods → Both payments saved
2. **Create a credit transaction** with due date → payment_status = "CREDIT"
3. **Upload a receipt** → File appears in Proof Vault
4. **Add a linked phone** to entity → Search by that phone finds entity
5. **View entity profile** → Balance calculated correctly
6. **Post a draft** → status changes to "POSTED"
7. **Reverse a transaction** → status changes to "REVERSED"
8. **Filter transactions** by status → Only matching transactions shown
9. **Search by entity name** → Matching transactions shown
10. **Auto-refresh** after 30s → New transactions appear

---

## 💡 Design Philosophy

**"Build a Digital Notebook that is smarter than a physical notebook."**

### What Makes It Smart?

1. **Split Payments** → Physical notebooks can't auto-calculate
2. **Linked Phones** → Physical notebooks can't search across aliases
3. **Context Field** → Captures observations, learns patterns
4. **Proof Vault** → Physical notebooks can't store photos/audio
5. **Balance Tracking** → Physical notebooks require manual calculation
6. **Search** → Instant vs. flipping pages
7. **Filters** → Show me "all credit transactions due this week"
8. **Auto-refresh** → Real-time vs. stale data

---

## 🤝 Integration Checklist

Before going live:

- [ ] Backend endpoints match spec
- [ ] Amount storage uses integers (cents)
- [ ] Phone numbers use E.164 format
- [ ] Dates use ISO 8601 format
- [ ] CORS enabled for frontend domain
- [ ] File upload works (multipart/form-data)
- [ ] Error messages are user-friendly
- [ ] Response times < 500ms for list endpoints
- [ ] Response times < 200ms for get endpoints
- [ ] Database indexes on: entity_id, status, payment_status, transaction_date
- [ ] Tenant isolation enforced on ALL queries
- [ ] User authentication working
- [ ] File storage configured (Supabase/S3)
- [ ] Environment variables set

---

## 📞 Support

**Frontend Questions?**
- Check `/lib/types.ts` for data structures
- Check `/lib/api.ts` for endpoint signatures
- Check `/BACKEND_API_SPEC.md` for detailed API docs

**Found a Bug?**
- Check browser console for errors
- Check Network tab for failed requests
- Verify backend response format matches expected types

---

**Built with ❤️ for Nairobi's informal economy**

*Last Updated: 2026-01-29*
