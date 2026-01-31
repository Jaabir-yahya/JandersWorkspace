# Turborepo Migration Guide

## Overview

This guide documents the migration from the legacy monorepo structure to Turborepo for improved build performance and developer experience.

## What Changed

### Directory Structure

**Before:**
```
JandersWorkspace/
├── api/                    # NestJS backend
├── web/my-app/            # Next.js frontend
├── package.json           # Root with npm scripts
```

**After:**
```
JandersWorkspace/
├── apps/
│   ├── api/               # NestJS backend (@project-bridge/api)
│   └── web/               # Next.js frontend (@project-bridge/web)
├── packages/
│   ├── database/          # Shared Prisma client (@project-bridge/database)
│   └── types/             # Shared TypeScript types (@project-bridge/types)
├── package.json           # Workspaces configuration
└── turbo.json             # Turbo pipeline
```

## New Commands

### Development

```bash
# Start all apps in development mode
npm run dev

# Start only API
npm run dev:api

# Start only Web
npm run dev:web
```

### Building

```bash
# Build all packages and apps
npm run build

# Turbo will:
# 1. Build @project-bridge/database first
# 2. Build @project-bridge/types (depends on database)
# 3. Build API and Web in parallel (both depend on packages)
```

### Testing

```bash
# Run all tests
npm run test

# Run integration tests
npm run test:integration
```

### Type Checking

```bash
# Type check all packages
npm run type-check
```

## Workspace Dependencies

### Adding a Dependency to a Specific App

```bash
# Add to API only
npm install lodash --workspace=@project-bridge/api

# Add to Web only
npm install axios --workspace=@project-bridge/web
```

### Adding a Shared Dependency

```bash
# Add to root (available to all workspaces)
npm install -D typescript
```

### Using Workspace Packages

```typescript
// In apps/api/src/some-file.ts
import { prisma, Transaction } from '@project-bridge/database';
import { ApiResponse } from '@project-bridge/types';

// In apps/web/lib/api.ts
import { DashboardStats } from '@project-bridge/types';
```

## Environment Variables

### API (.env in apps/api/)

```
DATABASE_URL=
DIRECT_URL=
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
```

### Web (.env.local in apps/web/)

```
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

## Troubleshooting

### Issue: "Cannot find module '@project-bridge/database'"

**Solution:**
```bash
# Build the packages first
npm run build

# Or generate Prisma client
cd packages/database && npm run generate
```

### Issue: "Port already in use"

**Solution:**
- API runs on port 3000
- Web runs on port 3001
- Make sure no other services are using these ports

### Issue: "Changes not reflecting"

**Solution:**
```bash
# Clear all caches
npm run clean

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild everything
npm run build
```

## Benefits of This Migration

1. **Faster Builds**: Only rebuild what changed
2. **Parallel Execution**: Run independent tasks concurrently
3. **Shared Packages**: Common code in one place
4. **Better Caching**: Build cache shared across team
5. **Clear Dependencies**: Explicit workspace relationships

## Rollback

If you need to rollback:

```bash
# The old structure is still available:
# - api/ (original)
# - web/my-app/ (original)

# Switch back to old commands:
npm run dev:api    # Uses api/ directory
npm run dev:web    # Uses web/my-app/ directory
```

## Next Steps

1. Install dependencies: `npm install`
2. Build packages: `npm run build`
3. Start development: `npm run dev`
4. Verify everything works
5. Update CI/CD pipelines to use new structure
6. Remove old `api/` and `web/my-app/` directories once verified

## Questions?

See [TURBOREPO_MIGRATION_PLAN.md](plans/TURBOREPO_MIGRATION_PLAN.md) for detailed planning.
