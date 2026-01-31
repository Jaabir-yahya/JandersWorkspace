# Project Bridge - Development Skill

## Project Overview

Project Bridge is an African Informal Economy Ledger - a headless truth ledger designed for tracking transactions, payments, and entities in informal business contexts.

## Architecture

### Monorepo Structure (Turborepo)

```
JandersWorkspace/
├── apps/
│   ├── api/                    # NestJS backend (@project-bridge/api)
│   └── web/                    # Next.js frontend (@project-bridge/web)
├── packages/
│   ├── config/                 # Shared ESLint & TypeScript configs
│   ├── database/               # Prisma client & schema (@project-bridge/database)
│   └── types/                  # Shared TypeScript types (@project-bridge/types)
├── tests/                      # Integration tests
└── docs/                       # Documentation
```

### Key Technologies

- **Backend**: NestJS, Prisma, PostgreSQL, Supabase
- **Frontend**: Next.js 16, React, TypeScript, Tailwind CSS, Radix UI
- **Monorepo**: Turborepo, npm workspaces

## Common Patterns

### API Response Format

All API responses follow a consistent structure:

```typescript
// Success
{
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}

// Error
{
  "code": "ERROR_CODE",
  "message": "Human readable message",
  "details": { ... }
}
```

### Transaction Status Flow

```
DRAFT → POSTED → RECONCILED
   ↓       ↓
   └──── REVERSED
```

- **DRAFT**: Can be edited, deleted
- **POSTED**: Immutable, can be reversed
- **REVERSED**: Negative transaction created
- **RECONCILED**: Final state

### Payment Status

- **PENDING**: No payments recorded
- **PARTIAL**: Some payment received
- **SETTLED**: Fully paid

## Database Schema (Prisma)

### Core Models

1. **User**: System users with tenant access
2. **Entity**: Customers, suppliers, employees
3. **Transaction**: Core transaction record
4. **TransactionLine**: Line items for transactions
5. **Payment**: Payment records
6. **PaymentApplication**: Links payments to transactions

### Enums

```typescript
enum TxnStatus {
  DRAFT
  POSTED
  REVERSED
  RECONCILED
  VOIDED
  ARCHIVED
}

enum PaymentStatus {
  PENDING
  PARTIAL
  SETTLED
  FAILED
  CANCELLED
}

enum TxnType {
  RETAIL
  SERVICE
  RENTAL
  EXPENSE
}
```

## Frontend Patterns

### Data Fetching with SWR

```typescript
import useSWR from "swr";

export function useTransactions(filters?: TransactionFilters) {
  return useSWR<Transaction[]>(url, fetcher, {
    refreshInterval: 5000,
    revalidateOnFocus: true,
  });
}
```

### Safe Date Formatting

Always use null-safe date formatting:

```typescript
export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid date";
  return new Intl.DateTimeFormat("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
```

### Currency Formatting

```typescript
export function formatCurrency(amount: number | null | undefined, currency: string = "KES"): string {
  if (amount === null || amount === undefined) return "N/A";
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: currency,
  }).format(amount / 100); // Amount stored in cents
}
```

## Testing Strategy

### Unit Tests (Jest)

```typescript
// Service test pattern
describe('ServiceName', () => {
  let service: ServiceName;
  let prisma: PrismaService;

  const mockPrisma = {
    modelName: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ServiceName,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<ServiceName>(ServiceName);
  });
});
```

### Running Tests

```bash
# All tests
npm run test

# Specific app
npm run test -- --filter=@project-bridge/api

# Integration tests
npm run test:integration
```

## Common Issues & Solutions

### 1. Invalid Time Value Error

**Cause**: API returns `created_at` but frontend expects `transaction_date`

**Solution**: Map API fields to frontend types in api-client:

```typescript
// Transform API response
const transformTransaction = (apiData: any): Transaction => ({
  ...apiData,
  transaction_date: apiData.created_at || apiData.createdAt,
});
```

### 2. Module Not Found in Turborepo

**Cause**: Dependencies not installed in workspace

**Solution**:
```bash
# Install at root
npm install

# Or specific workspace
npm install <package> --workspace=@project-bridge/api
```

### 3. Prisma Client Not Found

**Solution**:
```bash
npm run generate  # Generates Prisma client
```

### 4. TypeScript Errors in Test Files

**Solution**: Exclude test files from type-check:
```json
// tsconfig.json
{
  "exclude": ["**/*.spec.ts", "**/*.test.ts", "test/**/*"]
}
```

## Development Commands

```bash
# Development
npm run dev              # Start all apps
npm run dev:api          # API only
npm run dev:web          # Web only

# Building
npm run build            # Build all
npm run type-check       # Type check all

# Testing
npm run test             # Run all tests
npm run lint             # Lint all

# Database
npm run generate         # Generate Prisma client
npm run setup            # Full setup (install + generate + build)
```

## Code Style Guidelines

1. **Naming**: camelCase for variables/functions, PascalCase for classes/types
2. **Imports**: Group by external → internal → types
3. **Error Handling**: Use NestJS exceptions (BadRequestException, NotFoundException)
4. **Types**: Always define return types on public methods
5. **Comments**: JSDoc for public APIs, inline for complex logic

## Security Considerations

1. Always validate input with class-validator DTOs
2. Use tenant isolation in all database queries
3. Never expose sensitive data in logs
4. Use Supabase RLS policies for attachments

## Performance Guidelines

1. Use SWR for client-side caching
2. Implement pagination for list endpoints
3. Use Prisma's `select` to limit returned fields
4. Add database indexes for frequently queried fields
