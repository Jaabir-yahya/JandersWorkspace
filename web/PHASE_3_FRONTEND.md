# Phase 3 Frontend - Project Bridge

## Overview
Phase 3 frontend for Project Bridge is a Next.js 15 application with shadcn/ui components that provides a complete transaction management interface. The frontend connects to the backend API running at `http://localhost:3000/api/v1`.

## Project Structure
```
web/my-app/
├── app/
│   ├── layout.tsx          # Root layout with ThemeProvider
│   ├── page.tsx            # Transaction Feed (home page)
│   ├── create/
│   │   └── page.tsx        # Create Transaction page
│   ├── people/
│   │   └── page.tsx        # People/CRM page
│   ├── proof/
│   │   └── page.tsx        # Proof Vault page
│   └── manager/
│       └── page.tsx        # Transaction Manager page
├── components/
│   ├── dashboard-shell.tsx # Navigation shell
│   ├── status-badge.tsx    # Status badge components
│   └── ui/                 # shadcn/ui components (40+)
├── lib/
│   ├── api-client.ts       # SWR-based API client
│   ├── types.ts            # TypeScript type definitions
│   └── helpers.ts          # Utility functions
└── public/                 # Static assets
```

## Pages

### 1. Transaction Feed (`/`)
- Displays all transactions in a table format
- Filters by status (DRAFT, POSTED, REVERSED)
- Search by transaction ID or entity name
- Click to view transaction details in a modal
- Shows transaction type, amount, status, and date

### 2. Create Transaction (`/create`)
- Select entity from dropdown or create new
- Add line items (description, quantity, price)
- Split payments across multiple methods:
  - CASH
  - MPESA
  - BANK
  - CARD
  - CREDIT (udhaari)
- Credit toggle with due date picker
- Real-time total calculation
- Creates transaction in DRAFT status

### 3. People/CRM (`/people`)
- List all entities (customers/suppliers)
- Search by phone number
- Click to view 360° entity profile:
  - Entity details (name, type, phone, email)
  - Current balance
  - Recent transactions
  - Linked phone numbers
  - Add new linked phone numbers

### 4. Proof Vault (`/proof`)
- Upload files to Supabase Storage
- Filter attachments by transaction ID
- Gallery view of all attachments
- Download attachments
- Delete attachments

### 5. Transaction Manager (`/manager`)
- View all transactions
- Post DRAFT transactions to POSTED status
- Reverse POSTED transactions to REVERSED status
- Bulk operations support

## API Client

The API client is built with SWR for efficient data fetching and caching:

### Data Fetching Hooks
- `useTransactions()` - Fetch all transactions
- `useTransaction(id)` - Fetch single transaction
- `useEntities()` - Fetch all entities
- `useEntity360View(id)` - Fetch entity 360° view
- `useAttachmentsForTransaction(id)` - Fetch attachments for transaction
- `usePaymentRecords(id)` - Fetch payment records for transaction
- `useDashboardStats()` - Fetch dashboard statistics

### Mutation Functions
- `createTransaction(data)` - Create new transaction
- `postTransaction(id)` - Post draft transaction
- `reverseTransaction(id)` - Reverse posted transaction
- `createEntity(data)` - Create new entity
- `uploadAttachment(file, transactionId)` - Upload file
- `deleteAttachment(id)` - Delete attachment
- `addLinkedPhone(entityId, phone)` - Add linked phone

## Type Definitions

All types are defined in `lib/types.ts` matching the API contract:

```typescript
// Transaction Status
type TransactionStatus = "DRAFT" | "POSTED" | "REVERSED";

// Payment Status
type PaymentStatus = "PENDING" | "PARTIAL" | "PAID" | "OVERDUE" | "CREDIT";

// Payment Methods
type PaymentMethod = "CASH" | "MPESA" | "BANK" | "CARD" | "CREDIT";

// Entity Types
type EntityType = "CUSTOMER" | "SUPPLIER";
```

## Features

### Split Payments
Support for multiple payment methods in a single transaction:
- Each payment method can have multiple records
- Real-time total calculation
- Credit payments with due dates

### Credit/Udhaari System
- Toggle credit mode for transactions
- Set due dates for credit payments
- Track overdue payments
- Purple badge for credit status

### Entity 360° View
Complete customer profile including:
- Entity information
- Current balance
- Transaction history
- Linked phone numbers
- Search by phone number

### File Upload
- Upload to Supabase Storage
- Associate with transactions
- Gallery view
- Download and delete support

### Transaction State Machine
```
DRAFT → POSTED → REVERSED
```

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **UI Library**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS
- **Data Fetching**: SWR (Stale-While-Revalidate)
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **TypeScript**: Full type safety

## Development

### Running the Application

1. Start the backend API:
```bash
cd api
npm run build
npm run start
```

2. Start the frontend dev server:
```bash
cd web/my-app
npm run dev
```

3. Open http://localhost:3001

### Building for Production

```bash
cd web/my-app
npm run build
```

The build output is in the `.next` directory.

## Deployment

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

### Deploy to Vercel

1. Push the code to GitHub
2. Import the project in Vercel
3. Set the `NEXT_PUBLIC_API_URL` environment variable
4. Deploy

## API Endpoints

The frontend connects to the following backend endpoints:

### Transactions
- `GET /transactions` - List all transactions
- `GET /transactions/:id` - Get single transaction
- `POST /transactions` - Create transaction
- `POST /transactions/:id/post` - Post transaction
- `POST /transactions/:id/reverse` - Reverse transaction

### Entities
- `GET /entities` - List all entities
- `GET /entities/:id` - Get single entity
- `GET /entities/:id/balance` - Get entity balance
- `GET /entities/:id/360-view` - Get entity 360° view
- `GET /entities/search?phone=` - Search by phone
- `POST /entities` - Create entity
- `POST /entities/:id/linked-phones` - Add linked phone

### Payment Records
- `GET /payment-records/transaction/:id` - Get payment records
- `POST /payment-records` - Create payment record
- `DELETE /payment-records/:id` - Delete payment record

### Attachments
- `POST /attachments/upload` - Upload file
- `GET /attachments/transaction/:id` - Get attachments for transaction
- `GET /attachments/entity/:id` - Get attachments for entity

### Dashboard
- `GET /dashboard/stats` - Get dashboard statistics

## Status

✅ **Phase 3 Frontend Complete**

All pages implemented and tested:
- ✅ Transaction Feed
- ✅ Create Transaction
- ✅ People/CRM
- ✅ Proof Vault
- ✅ Transaction Manager

Build successful and ready for deployment.
