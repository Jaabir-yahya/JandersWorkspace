# Contributing to Project Bridge

Thank you for your interest in contributing to Project Bridge! This document provides guidelines and workflows for development.

## Development Setup

### Prerequisites
- Node.js 18+ (see `.nvmrc`)
- npm 9+
- Supabase CLI (for local database)
- ngrok (for external testing)

### Quick Start

```bash
# 1. Clone and setup
git clone <repository-url>
cd JandersWorkspace

# 2. Setup environment
./scripts/setup-env.sh

# 3. Install dependencies
npm run setup

# 4. Start development
npm run dev
```

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
   npm run health-check
   ```

4. **Commit**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

### Commit Message Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only
- `style:` - Formatting (no code change)
- `refactor:` - Code restructuring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

Examples:
```
feat: add SKU search to transactions
fix: resolve entity balance calculation
docs: update API endpoint documentation
```

## Code Style

### TypeScript
- Use strict mode
- Explicit return types on public methods
- Interfaces over types for objects

### API (NestJS)
- Controllers handle HTTP concerns only
- Business logic in services
- Database functions for complex operations
- DTOs for input validation

### Frontend (Next.js)
- App Router pattern
- Server components by default
- Client components when needed
- SWR for data fetching

## Testing

### Running Tests
```bash
# All tests
npm test

# API only
cd api && npm test

# Integration tests
npm run test:integration

# Health check
npm run health-check
```

### Writing Tests
- Unit tests for services
- Integration tests for API endpoints
- E2E tests for critical user flows

## Database Changes

### Migrations
1. Create migration in `supabase/migrations/`
2. Name format: `YYYYMMDD_description.sql`
3. Apply: `supabase migration up`
4. Test locally before committing

### Seeding
```bash
# Seed development data
node scripts/db-seed.js
```

## Environment Variables

Never commit `.env` files. Use `.env.example` as template:

```bash
# Copy template
cp api/.env.example api/.env

# Edit with your values
vim api/.env
```

## External Testing with ngrok

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Expose to internet
npm run tunnel
```

## Documentation

- Update relevant docs in `docs/`
- Keep API docs in sync with code
- Document breaking changes in CHANGELOG.md

## Questions?

- Check existing documentation in `docs/`
- Review planning documents in `plans/`
- Open an issue for discussion

## Code of Conduct

- Be respectful and constructive
- Focus on the problem, not the person
- Help others learn and grow
