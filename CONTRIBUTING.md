# Contributing to Project Bridge

Thank you for your interest in contributing to Project Bridge! This document provides guidelines and workflows for development.

---

## Table of Contents

- [Development Setup](#development-setup)
- [Development Workflow](#development-workflow)
- [Testing Requirements](#testing-requirements)
- [Code Quality Standards](#code-quality-standards)
- [Environment Variables](#environment-variables)
- [Database Changes](#database-changes)
- [External Testing with ngrok](#external-testing-with-ngrok)
- [Documentation](#documentation)
- [Questions?](#questions)

---

## Development Setup

### Prerequisites

- Node.js 20+ (see [`.nvmrc`](.nvmrc))
- npm 10+
- PostgreSQL 15+ (or Supabase account)
- ngrok (for external testing)

### Quick Start

```bash
# 1. Clone and setup
git clone <repository-url>
cd JandersWorkspace

# 2. Setup environment
cp .env.example .env
# Edit .env with your configuration

# 3. Install dependencies
npm install

# 4. Build packages
npm run build

# 5. Run database migrations
cd apps/api && npx prisma migrate dev

# 6. Start development
npm run dev
```

### Development URLs

- **Web Dashboard**: http://localhost:3001
- **API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api/docs
- **Database Studio**: http://localhost:5555 (run `npx prisma studio`)

---

## Development Workflow

### Branching Strategy

- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - New features
- `hotfix/*` - Urgent fixes

### Making Changes

1. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow existing code style
   - Add tests for new functionality
   - Update documentation

3. **Test locally**
   ```bash
   npm run test
   npm run lint
   npm run type-check
   ```

4. **Commit**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

### Commit Message Convention

We use [Conventional Commits](https://www.conventionalcommits.org):

| Type | Description |
|------|-------------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation only |
| `style:` | Formatting (no code change) |
| `refactor:` | Code restructuring |
| `test:` | Adding tests |
| `chore:` | Maintenance tasks |

Examples:
```
feat: add SKU search to transactions
fix: resolve entity balance calculation
docs: update API endpoint documentation
test: add unit tests for dashboard service
```

---

## Testing Requirements

### All Tests Must Pass

**Critical**: All tests must pass before submitting a pull request. The project maintains a **100% unit test pass rate**.

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:cov

# Run API tests only
cd apps/api && npm test

# Run frontend tests only (when added)
cd apps/web && npm test

# Run E2E tests
npm run test:e2e

# Run integration tests
npm run test:integration

# Run tests in watch mode
npm run test:watch
```

### Writing Tests

#### Unit Tests for Services

```typescript
// apps/api/src/dashboard/dashboard.service.spec.ts
describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should calculate total revenue correctly', async () => {
    const result = await service.getStats('tenant-1');
    expect(result.total_revenue_today).toBeGreaterThanOrEqual(0);
  });
});
```

#### Component Tests

```typescript
// apps/web/__tests__/components/button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

#### Integration Tests

```typescript
// tests/integration/transactions.test.ts
describe('Transaction API', () => {
  it('should create a transaction', async () => {
    const response = await request(app)
      .post('/api/v1/transactions')
      .send({
        tenant_id: 'test-tenant',
        entity_id: 'test-entity',
        total_amount: 1000,
      });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });
});
```

### Test Coverage Requirements

- Services: Minimum 80% coverage
- Components: Minimum 70% coverage
- Critical paths: 100% coverage

---

## Code Quality Standards

### TypeScript

- Use **strict mode** enabled
- Explicit return types on public methods
- Interfaces over types for objects
- No `any` types (use `unknown` with type guards)

```typescript
// Good
interface User {
  id: string;
  name: string;
}

function getUser(id: string): Promise<User> {
  return api.get(`/users/${id}`);
}

// Bad
function getUser(id: any): any {
  return api.get(`/users/${id}`);
}
```

### API (NestJS)

- Controllers handle HTTP concerns only
- Business logic in services
- Database functions for complex operations
- DTOs for input validation

```typescript
// Controller
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly service: TransactionsService) {}

  @Get()
  async findAll(@Query() filters: TransactionFilters) {
    return this.service.findAll(filters);
  }
}

// Service
@Injectable()
export class TransactionsService {
  async findAll(filters: TransactionFilters): Promise<Transaction[]> {
    // Business logic here
  }
}

// DTO
export class CreateTransactionDto {
  @IsString()
  tenant_id: string;

  @IsNumber()
  @Min(0)
  total_amount: number;
}
```

### Frontend (Next.js)

- App Router pattern
- Server components by default
- Client components when needed ("use client")
- SWR for data fetching

```typescript
// Server Component (default)
export default async function DashboardPage() {
  const stats = await getDashboardStats();
  return <Dashboard stats={stats} />;
}

// Client Component
"use client";

export function Dashboard({ stats }: { stats: Stats }) {
  const { data } = useSWR('/api/stats', fetcher, {
    fallbackData: stats,
  });
  
  return <div>{data.totalRevenue}</div>;
}
```

### Linting

```bash
# Run linter
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Check specific package
cd apps/api && npm run lint
cd apps/web && npm run lint
```

### Formatting

```bash
# Format all files
npm run format

# Check formatting
npm run format:check
```

### Pre-commit Checks

Before committing, ensure:

```bash
# 1. Tests pass
npm test

# 2. Linting passes
npm run lint

# 3. Type checking passes
npm run type-check

# 4. Build succeeds
npm run build
```

---

## Environment Variables

### Required Variables

Never commit `.env` files. Use `.env.example` as a template:

```bash
# Copy template
cp .env.example .env

# Edit with your values
# See .env.example for all required variables
```

### Environment Categories

| Category | Variables | Purpose |
|----------|-----------|---------|
| Database | `DATABASE_URL`, `DIRECT_URL` | PostgreSQL connection |
| Supabase | `SUPABASE_URL`, `SUPABASE_*_KEY` | Auth, storage, realtime |
| Security | `JWT_SECRET`, `ENCRYPTION_KEY` | Authentication & encryption |
| API | `API_PORT`, `API_PREFIX` | API configuration |
| Web | `NEXT_PUBLIC_API_URL` | Frontend API URL |

### Development vs Production

```bash
# Development
NODE_ENV=development
LOG_LEVEL=debug
ENABLE_MOCK_PAYMENTS=true

# Production
NODE_ENV=production
LOG_LEVEL=info
ENABLE_MOCK_PAYMENTS=false
```

### Adding New Variables

When adding new environment variables:

1. Add to `.env.example` with comment
2. Update relevant documentation
3. Add validation in code
4. Document in DEPLOYMENT.md

```typescript
// Validation example
const requiredEnvVars = [
  'DATABASE_URL',
  'SUPABASE_URL',
  'JWT_SECRET',
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});
```

---

## Database Changes

### Migrations

1. **Create migration**:
   ```bash
   cd apps/api
   npx prisma migrate dev --name add_new_field
   ```

2. **Apply migration**:
   ```bash
   npx prisma migrate deploy
   ```

3. **Generate client**:
   ```bash
   npx prisma generate
   ```

### Schema Changes

When modifying `schema.prisma`:

1. Update the schema
2. Create migration
3. Update seed data if needed
4. Run tests to verify
5. Update API DTOs if needed

### Seeding

```bash
# Seed development data
cd apps/api
npx prisma db seed

# Reset and seed
npx prisma migrate reset
```

---

## External Testing with ngrok

For testing webhooks from external services (M-Pesa, WhatsApp, etc.):

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Expose to internet
npm run tunnel      # For web (port 3001)
npm run tunnel:api  # For API (port 3000)
```

Update webhook URLs in external services to use the ngrok URL.

---

## Documentation

- Update relevant docs in `docs/`
- Keep API docs in sync with code
- Document breaking changes in CHANGELOG.md
- Update README.md for user-facing changes

### Documentation Structure

```
docs/
├── FRONTEND_ARCHITECTURE.md   # Frontend documentation
├── API_CONTRACT.md            # API documentation
├── DEPLOYMENT.md              # Deployment guide
└── ...
```

---

## Code Review Checklist

Before submitting a PR:

- [ ] Tests pass (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Type checking passes (`npm run type-check`)
- [ ] Build succeeds (`npm run build`)
- [ ] Documentation updated
- [ ] Environment variables documented
- [ ] No `console.log` statements (use logger)
- [ ] No sensitive data in code
- [ ] Error handling implemented

---

## Questions?

- Check existing documentation in `docs/`
- Review planning documents in `plans/`
- Open an issue for discussion

---

## Code of Conduct

- Be respectful and constructive
- Focus on the problem, not the person
- Help others learn and grow

---

**Thank you for contributing to Project Bridge!**

---

*Last Updated: 2026-01-31*
