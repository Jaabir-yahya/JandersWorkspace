# Project Bridge - Repository Standards

## Overview

This document defines the standards and conventions for the Project Bridge repository. All contributors must follow these guidelines to maintain code quality and consistency.

## Repository Structure

### Current Structure (Turborepo)

```
JandersWorkspace/
├── 📁 apps/
│   ├── 📁 api/                      # NestJS backend (@project-bridge/api)
│   │   ├── 📁 src/                  # auth, dashboard, health, integrations, etc.
│   │   ├── 📁 prisma/
│   │   └── package.json
│   └── 📁 bridge-manual/            # Next.js frontend (manual-first tier)
│       ├── 📁 app/
│       ├── 📁 components/
│       └── package.json
├── 📁 packages/
│   ├── 📁 config/                   # Shared ESLint/TS configs
│   ├── 📁 database/                 # Shared Prisma client
│   └── 📁 types/                    # Shared TypeScript types
├── 📁 db/                            # Database migrations (SQL)
├── 📁 docs/                          # Documentation
├── 📁 plans/                         # Architecture plans
├── 📁 scripts/                       # Utility scripts (solo-dev friendly)
├── 📁 tests/                         # Integration tests
├── 📄 package.json                   # Root (workspaces, turbo)
├── 📄 turbo.json
└── 📄 README.md
```

## Naming Conventions

### Files

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `TransactionForm.tsx` |
| Hooks | camelCase with `use` prefix | `useTransactions.ts` |
| Utilities | camelCase | `formatCurrency.ts` |
| Constants | UPPER_SNAKE_CASE | `API_ENDPOINTS.ts` |
| Tests | Same as file + `.test.ts` | `transactions.service.test.ts` |
| Styles | camelCase + `.module.css` | `dashboard.module.css` |

### Directories

| Type | Convention | Example |
|------|------------|---------|
| Feature modules | kebab-case | `payment-records/` |
| Shared components | lowercase | `components/ui/` |
| API endpoints | kebab-case | `transactions/` |

### Code

| Type | Convention | Example |
|------|------------|---------|
| Classes | PascalCase | `TransactionsService` |
| Interfaces | PascalCase with `I` prefix | `ITransaction` |
| Types | PascalCase | `TransactionType` |
| Enums | PascalCase | `TxnStatus` |
| Constants | UPPER_SNAKE_CASE | `MAX_PAGE_SIZE` |
| Variables | camelCase | `transactionCount` |
| Functions | camelCase | `createTransaction` |
| Private methods | camelCase with `_` prefix | `_calculateTotal` |
| Database fields | snake_case | `tenant_id` |
| API responses | camelCase | `totalAmount` |

## Code Style

### TypeScript

```typescript
// ✅ Good: Explicit types, interfaces for objects
interface CreateTransactionDto {
  tenantId: string;
  entityId?: string;
  lines: TransactionLine[];
}

async function createTransaction(
  dto: CreateTransactionDto
): Promise<Transaction> {
  // Implementation
}

// ❌ Bad: Implicit types, no interfaces
async function createTransaction(data: any) {
  // Implementation
}
```

### React Components

```typescript
// ✅ Good: Functional components with explicit props
interface TransactionCardProps {
  transaction: Transaction;
  onClick?: (id: string) => void;
}

export function TransactionCard({ 
  transaction, 
  onClick 
}: TransactionCardProps): JSX.Element {
  return (
    <Card onClick={() => onClick?.(transaction.id)}>
      {/* Content */}
    </Card>
  );
}

// ❌ Bad: No type safety, class components
class TransactionCard extends React.Component {
  render() {
    return <div>{this.props.transaction}</div>;
  }
}
```

### NestJS Controllers

```typescript
// ✅ Good: Decorators, validation, typed responses
@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService
  ) {}

  @Post()
  async create(
    @Body(new ValidationPipe()) dto: CreateTransactionDto
  ): Promise<Transaction> {
    return this.transactionsService.create(dto);
  }
}

// ❌ Bad: No validation, implicit types
@Controller('transactions')
export class TransactionsController {
  @Post()
  create(@Body() data: any) {
    return this.service.create(data);
  }
}
```

### Database (Prisma)

```prisma
// ✅ Good: Snake_case in DB, clear relations
model Transaction {
  id              String    @id @default(uuid()) @db.Uuid
  tenantId        String    @map("tenant_id") @db.Uuid
  totalAmount     Decimal   @map("total_amount") @db.Decimal(18, 4)
  createdAt       DateTime  @default(now()) @map("created_at")
  
  lines           TransactionLine[]
  
  @@map("transactions")
}

// ❌ Bad: Inconsistent naming, no maps
model transaction {
  id String @id
  tenant_id String
  totalAmount Decimal
}
```

## Git Workflow

### Branch Naming

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/description` | `feature/mpesa-integration` |
| Bugfix | `fix/description` | `fix/transaction-calculation` |
| Hotfix | `hotfix/description` | `hotfix/security-patch` |
| Release | `release/version` | `release/v0.4.0` |
| Docs | `docs/description` | `docs/api-examples` |

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style (formatting, semicolons)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Build process, dependencies

Examples:
```
feat(transactions): add M-Pesa auto-reconciliation

fix(api): correct total calculation for reversed transactions

docs(readme): update installation instructions

refactor(database): migrate to Prisma ORM
```

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console errors
```

## Environment Variables

### Naming

| Prefix | Usage | Example |
|--------|-------|---------|
| `NEXT_PUBLIC_` | Exposed to browser | `NEXT_PUBLIC_API_URL` |
| `SUPABASE_` | Supabase connection | `SUPABASE_URL` |
| `DATABASE_` | Database connection | `DATABASE_URL` |
| `MPESA_` | M-Pesa integration | `MPESA_CONSUMER_KEY` |
| No prefix | Server-only secrets | `JWT_SECRET` |

### Required Variables

#### API (.env)
```
DATABASE_URL=
DIRECT_URL=
SUPABASE_URL=
SUPABASE_SECRET_KEY=
```

#### Web (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

## Testing Standards

### Unit Tests

```typescript
// ✅ Good: Descriptive test names, arrange-act-assert
describe('TransactionsService', () => {
  describe('create', () => {
    it('should calculate total from line items', async () => {
      // Arrange
      const dto = createTransactionDto({
        lines: [
          { quantity: 2, unitPrice: 100 },
          { quantity: 1, unitPrice: 50 }
        ]
      });

      // Act
      const result = await service.create(dto);

      // Assert
      expect(result.totalAmount).toBe(250);
    });
  });
});
```

### Test Coverage

Minimum coverage requirements:
- Statements: 80%
- Branches: 70%
- Functions: 80%
- Lines: 80%

## Documentation Standards

### Code Documentation

```typescript
/**
 * Creates a new transaction with automatic total calculation.
 * 
 * @param dto - Transaction creation data
 * @returns The created transaction with lines
 * @throws BadRequestException if lines are empty
 * @throws ForbiddenException if tenant limit exceeded
 * 
 * @example
 * const transaction = await createTransaction({
 *   tenantId: 'uuid',
 *   lines: [{ description: 'Product', quantity: 1, unitPrice: 100 }]
 * });
 */
async function createTransaction(dto: CreateTransactionDto): Promise<Transaction> {
  // Implementation
}
```

### API Documentation

All endpoints must be documented in `docs/API_CONTRACT.md` with:
- Endpoint URL
- HTTP method
- Request/response schemas
- Error codes
- Example requests

## Performance Guidelines

### Database

- Use indexes for frequently queried columns
- Limit queries to 100 records by default
- Use pagination for large datasets
- Avoid N+1 queries with Prisma `include`

### API

- Response time < 200ms for cached queries
- Response time < 500ms for database queries
- Implement caching for read-heavy endpoints
- Use compression for responses > 1KB

### Frontend

- Lazy load routes and heavy components
- Optimize images with Next.js Image
- Use SWR for data fetching with caching
- Bundle size < 200KB initial load

## Security Standards

### Authentication

- Use JWT with 15-minute expiry
- Refresh tokens with 7-day expiry
- Store tokens in httpOnly cookies
- Validate all inputs with class-validator

### Authorization

- Check tenant isolation on every query
- Use RLS policies in PostgreSQL
- Validate user permissions before actions
- Log all authorization failures

### Data Protection

- Encrypt sensitive data at rest
- Use HTTPS for all communications
- Sanitize user inputs to prevent XSS
- Hash passwords with bcrypt

## Deployment Standards

### Environments

| Environment | Branch | URL |
|-------------|--------|-----|
| Development | `feature/*` | localhost |
| Staging | `develop` | staging.projectbridge.io |
| Production | `main` | app.projectbridge.io |

### Deployment Checklist

- [ ] All tests pass
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] Rollback plan documented
- [ ] Monitoring alerts configured

## Monitoring & Logging

### Logging Levels

| Level | Usage | Example |
|-------|-------|---------|
| ERROR | Application errors | Database connection failed |
| WARN | Warning conditions | Rate limit approaching |
| INFO | Normal operations | Transaction created |
| DEBUG | Detailed debug info | Query execution time |

### Metrics to Track

- API response times
- Error rates
- Database query performance
- Active users
- Transaction volume

## Code Review Checklist

### For Reviewers

- [ ] Code follows style guidelines
- [ ] Tests are included and pass
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance is acceptable
- [ ] Error handling is comprehensive

### For Authors

- [ ] Self-review completed
- [ ] All tests pass locally
- [ ] No console.log statements
- [ ] No commented-out code
- [ ] PR description is clear
- [ ] Linked to relevant issue

## Resources

- [TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
- [NestJS Best Practices](https://docs.nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Conventional Commits](https://www.conventionalcommits.org/)

## Questions?

If you're unsure about any standard:
1. Check existing code for examples
2. Ask in the team chat
3. Open a discussion in GitHub
4. When in doubt, prioritize readability

---

**Last Updated**: 2026-01-31  
**Version**: 1.0.0  
**Owner**: Project Bridge Team
