# Turborepo Migration Plan

## Executive Summary

This document outlines the evaluation and migration plan for adopting Turborepo to optimize the Project Bridge monorepo. Turborepo will provide faster builds, better caching, and improved developer experience.

## Current State Analysis

### Existing Structure

```
JandersWorkspace/
├── api/                    # NestJS backend
│   ├── package.json
│   ├── src/
│   └── dist/
├── web/my-app/            # Next.js frontend
│   ├── package.json
│   ├── app/
│   └── .next/
├── package.json           # Root with npm scripts
└── node_modules/          # Duplicated across projects
```

### Current Pain Points

| Issue | Impact | Current Workaround |
|-------|--------|-------------------|
| No shared build cache | Slow CI builds | None |
| Duplicate dependencies | Large node_modules | Manual deduplication |
| No parallel task execution | Slow dev startup | `concurrently` package |
| No dependency graph | Build order issues | Manual script ordering |
| No workspace linking | Version mismatches | Careful manual updates |

### Build Times (Current)

| Task | Time | Notes |
|------|------|-------|
| Clean install | ~3 min | Both api + web |
| Dev startup | ~45 sec | Concurrent |
| Production build | ~2 min | Sequential |
| CI pipeline | ~5 min | No caching |

## Turborepo Benefits

### 1. Incremental Builds
Only rebuild what changed:
```
API unchanged + Web changed = Only rebuild web
```

### 2. Remote Caching
Share build cache across team and CI:
```
Developer A builds → Cache → Developer B uses cache
```

### 3. Parallel Execution
Run independent tasks concurrently:
```
lint:api + lint:web + test:api + test:web → All at once
```

### 4. Dependency Graph
Automatic task ordering:
```
build:api must complete before build:web (if web depends on api types)
```

### 5. Workspace Management
Single package manager, shared configs:
```
npm install @shared/types → Available in all workspaces
```

## Migration Strategy

### Phase 1: Preparation (Week 1)

#### 1.1 Audit Dependencies

```bash
# Check for version mismatches
npm ls react
npm ls typescript
npm ls @types/node

# Identify shared dependencies
# These should move to root or shared packages
```

#### 1.2 Standardize Node Versions

```json
// package.json (root)
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  },
  "packageManager": "npm@9.8.0"
}
```

#### 1.3 Create Shared Configs Package

```
packages/
└── config/
    ├── eslint/
    │   ├── base.js
    │   ├── nestjs.js
    │   └── next.js
    ├── typescript/
    │   ├── base.json
    │   ├── nestjs.json
    │   └── next.json
    └── package.json
```

### Phase 2: Turborepo Setup (Week 2)

#### 2.1 Initialize Turborepo

```bash
# Install turbo globally
npm install -g turbo

# Or use npx
npx turbo@latest
```

#### 2.2 Create Root Configuration

```json
// package.json (root)
{
  "name": "project-bridge",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "type-check": "turbo run type-check",
    "clean": "turbo run clean && rm -rf node_modules"
  },
  "devDependencies": {
    "turbo": "^1.11.0"
  }
}
```

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "outputs": []
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "type-check": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "clean": {
      "cache": false
    }
  }
}
```

#### 2.3 Restructure Directories

```
JandersWorkspace/
├── apps/
│   ├── api/                    # Formerly /api
│   │   ├── package.json
│   │   ├── src/
│   │   └── turbo.json         # App-specific config
│   └── web/                   # Formerly /web/my-app
│       ├── package.json
│       ├── app/
│       └── turbo.json
├── packages/
│   ├── config/                # Shared configs
│   │   ├── eslint/
│   │   ├── typescript/
│   │   └── package.json
│   ├── database/              # Shared Prisma schema
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── package.json
│   ├── types/                 # Shared TypeScript types
│   │   ├── src/
│   │   │   ├── api.ts
│   │   │   ├── entities.ts
│   │   │   └── index.ts
│   │   └── package.json
│   └── ui/                    # Shared UI components (future)
│       ├── src/
│       └── package.json
├── package.json               # Root config
├── turbo.json                 # Turbo pipeline
└── pnpm-workspace.yaml       # If switching to pnpm
```

### Phase 3: Package Migration (Week 3)

#### 3.1 API App Configuration

```json
// apps/api/package.json
{
  "name": "@project-bridge/api",
  "version": "1.0.0",
  "scripts": {
    "build": "nest build",
    "dev": "nest start --watch",
    "start": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\"",
    "test": "jest",
    "type-check": "tsc --noEmit",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    // ... existing deps
    "@project-bridge/database": "workspace:*",
    "@project-bridge/types": "workspace:*"
  },
  "devDependencies": {
    "@project-bridge/config": "workspace:*"
  }
}
```

```json
// apps/api/turbo.json
{
  "extends": ["//"],
  "pipeline": {
    "build": {
      "env": [
        "DATABASE_URL",
        "DIRECT_URL",
        "SUPABASE_URL",
        "SUPABASE_SERVICE_KEY"
      ]
    }
  }
}
```

#### 3.2 Web App Configuration

```json
// apps/web/package.json
{
  "name": "@project-bridge/web",
  "version": "1.0.0",
  "scripts": {
    "build": "next build",
    "dev": "next dev --port 3001",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "clean": "rm -rf .next"
  },
  "dependencies": {
    // ... existing deps
    "@project-bridge/types": "workspace:*"
  },
  "devDependencies": {
    "@project-bridge/config": "workspace:*"
  }
}
```

#### 3.3 Database Package

```json
// packages/database/package.json
{
  "name": "@project-bridge/database",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "generate": "prisma generate",
    "migrate": "prisma migrate dev",
    "deploy": "prisma migrate deploy",
    "studio": "prisma studio",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "@prisma/client": "^5.0.0"
  },
  "devDependencies": {
    "prisma": "^5.0.0",
    "typescript": "^5.0.0"
  }
}
```

```typescript
// packages/database/src/index.ts
export { PrismaClient } from '@prisma/client';
export * from '@prisma/client';

// Re-export types for convenience
export type {
  Transaction,
  Entity,
  User,
  // ... etc
} from '@prisma/client';
```

#### 3.4 Types Package

```json
// packages/types/package.json
{
  "name": "@project-bridge/types",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "clean": "rm -rf dist"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

```typescript
// packages/types/src/api.ts
// Shared API types used by both frontend and backend

export interface ApiResponse<T> {
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

// Re-export from database for convenience
export type {
  Transaction,
  Entity,
  // ... etc
} from '@project-bridge/database';
```

### Phase 4: Optimization (Week 4)

#### 4.1 Remote Caching Setup

```bash
# Login to Vercel (free for open source)
npx turbo login

# Link to remote cache
npx turbo link
```

#### 4.2 CI/CD Integration

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          
      - name: Setup Turborepo cache
        uses: dtinth/setup-github-actions-caching-for-turbo@v1
        
      - run: npm ci
      
      - run: npx turbo run build lint test type-check
```

#### 4.3 Environment Variable Handling

```json
// turbo.json
{
  "globalEnv": [
    "NODE_ENV"
  ],
  "pipeline": {
    "build": {
      "env": [
        "DATABASE_URL",
        "NEXT_PUBLIC_API_URL"
      ]
    }
  }
}
```

## Migration Checklist

### Pre-Migration
- [ ] Audit all dependencies for version conflicts
- [ ] Document current build process
- [ ] Create backup branch
- [ ] Set up feature flags for gradual rollout

### Migration
- [ ] Install turbo and configure root
- [ ] Move api/ to apps/api/
- [ ] Move web/my-app/ to apps/web/
- [ ] Create packages/database/
- [ ] Create packages/types/
- [ ] Create packages/config/
- [ ] Update all import paths
- [ ] Update environment variable paths
- [ ] Test all scripts
- [ ] Update CI/CD pipelines
- [ ] Update documentation

### Post-Migration
- [ ] Verify build times improved
- [ ] Test remote caching
- [ ] Monitor for issues
- [ ] Train team on new workflow
- [ ] Archive old structure documentation

## Expected Improvements

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Clean install | 3 min | 2 min | 33% faster |
| Dev startup | 45 sec | 30 sec | 33% faster |
| Production build | 2 min | 45 sec | 62% faster |
| CI pipeline | 5 min | 2 min | 60% faster |
| Incremental build | 2 min | 10 sec | 92% faster |
| Disk usage | 2 GB | 1.2 GB | 40% reduction |

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Build failures | Keep old structure in branch, rollback plan |
| Import path issues | Automated find/replace script |
| CI/CD breakage | Test on feature branch first |
| Team confusion | Documentation + training session |
| Dependency conflicts | Lockfile audit before migration |

## Rollback Plan

If critical issues arise:

```bash
# 1. Revert to backup branch
git checkout pre-turbo-migration

# 2. Or restore from structure backup
cp -r apps/api/* api/
cp -r apps/web/* web/my-app/

# 3. Revert package.json changes
git checkout package.json

# 4. Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Decision: Proceed or Not?

### Recommendation: **PROCEED** ✅

**Rationale**:
1. **Clear Benefits**: 60%+ build time improvement
2. **Low Risk**: Well-established tool, used by Vercel, Next.js
3. **Future-Proof**: Enables shared packages (UI, utils)
4. **Team Size**: Appropriate for 2+ developers
5. **Project Stage**: Phase 3 complete, good time to optimize

**Conditions for Success**:
- [ ] Dedicated 1 week for migration
- [ ] Test thoroughly on staging
- [ ] Team training on new commands
- [ ] Document new workflow

**Alternative**: Keep current structure if:
- Team size < 2
- Build times acceptable
- No plans for shared packages
- Limited time for migration
