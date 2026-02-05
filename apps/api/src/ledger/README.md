# Ledger Module

Complete double-entry accounting implementation for Nairobi Commerce MVP.

## Features

- ✅ Double-entry accounting with transaction pairs
- ✅ Account management with balance tracking
- ✅ Supplies and inventory management
- ✅ Invoice and payment processing
- ✅ Comprehensive reporting and KPIs
- ✅ Audit logging and transaction reversal
- ✅ RPC-style database operations
- ✅ Multi-tenant support
- ✅ Real-time balance updates
- ✅ Export functionality (JSON/CSV)

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
DATABASE_URL=postgresql://...
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
```

3. Run migrations:

```bash
npx prisma migrate dev
```

4. Start development server:

```bash
npm run dev
```

## API Endpoints

### Authentication

All endpoints require JWT authentication via Authorization header:

```
Authorization: Bearer <jwt-token>
```

### Core Accounting

**Accounts Management**

- `GET /api/v1/accounts` - List accounts
- `POST /api/v1/accounts` - Create account
- `GET /api/v1/accounts/:id` - Get account
- `PATCH /api/v1/accounts/:id` - Update account

**Transactions**

- `POST /api/v1/transactions/double-entry` - Create double-entry transaction
- `POST /api/v1/transactions/:pairId/reverse` - Reverse transaction
- `GET /api/v1/transactions` - List transactions

**Business Operations**

- `POST /api/v1/business/supplies` - Create supply
- `GET /api/v1/business/inventory` - Get inventory
- `POST /api/v1/business/invoices` - Create invoice
- `POST /api/v1/business/payments` - Create payment

### Reporting

**Financial Reports**

- `GET /api/v1/reporting/trial-balance` - Trial balance
- `GET /api/v1/reporting/transaction-history` - Transaction history
- `GET /api/v1/reporting/sales` - Sales report
- `GET /api/v1/reporting/expenses` - Expense report
- `GET /api/v1/reporting/cash-flow` - Cash flow report

**Dashboard**

- `GET /api/v1/reporting/dashboard/kpis` - KPI dashboard

**Exports**

- `GET /api/v1/reporting/export/:dataType` - Export data (JSON/CSV)

## Database Schema Adaptation

The implementation adapts the existing schema:

- **Accounts**: `Item` table with `itemType = 'ACCOUNT'`
- **Accounting Data**: Stored in JSON fields (`metadata`, `insights`)
- **Business Records**: Use `Note` table with `aboutType`
- **Transactions**: Enhanced with accounting metadata

## Example Usage

### Create Double-Entry Transaction

```bash
curl -X POST http://localhost:3000/api/v1/transactions/double-entry \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "debitAccountType": "INVENTORY",
    "creditAccountType": "SUPPLIER_PAYABLE",
    "amount": 1000,
    "notes": "Supply purchase"
  }'
```

### Get Trial Balance

```bash
curl -X GET http://localhost:3000/api/v1/reporting/trial-balance \
  -H "Authorization: Bearer <token>"
```

### Create Supply

```bash
curl -X POST http://localhost:3000/api/v1/business/supplies \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "supplierName": "Test Supplier",
    "itemType": "Product A",
    "quantity": 10,
    "unitPrice": 50
  }'
```

## Testing

Run the test suite:

```bash
npm test
```

Run specific ledger tests:

```bash
npm test -- ledger
```

## Architecture

```
src/ledger/
├── controllers/          # API endpoints
├── services/            # Business logic
├── dto/                # Data transfer objects
├── rpc.service.ts       # Database operations
├── ledger.module.ts     # Module definition
└── *.spec.ts          # Tests
```

## Key Concepts

1. **Transaction Pairs**: Every transaction creates linked debit/credit entries
2. **Account Types**: Standard accounting categories (Asset, Liability, Equity, Revenue, Expense)
3. **Multi-tenancy**: All operations isolated by tenant
4. **Atomic Operations**: Database transactions ensure consistency
5. **Audit Trail**: Complete change tracking with reversals

## Production Deployment

1. Set production environment variables
2. Run database migrations: `npx prisma migrate deploy`
3. Build application: `npm run build`
4. Start: `npm run start`

## Monitoring

- Health check: `GET /api/v1/health`
- Metrics: Integrated with Prisma query logging
- Error tracking: Structured error responses

## Security

- JWT authentication via Supabase
- Multi-tenant isolation
- Input validation
- SQL injection prevention via Prisma
- Rate limiting enabled
