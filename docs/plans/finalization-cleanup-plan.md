# Finalization & Cleanup Plan

## Objective
Prepare codebase for Phase 3 lock with comprehensive documentation cleanup, code organization, and production readiness.

---

## Phase 1: Documentation Cleanup & Organization

### 1.1 Document Hierarchy Restructure

**Current State:**
```
docs/
├── API_CONTRACT.md
├── DEPLOYMENT_CHECKLIST.md
├── GOAL_CHECKLIST.md
├── openapi.yaml
├── PHASE_1_SPEC.md
├── PHASE_2_SPEC.md
├── PHASE_3_COMPLETE.md
├── PHASE_3_COMPLETION_PLAN.md
├── PHASE_3_FRONTEND_STRATEGY.md
├── PHASE_3_MASTER.md
├── PRD.md
└── _ARCHIVED/
```

**Proposed Structure:**
```
docs/
├── README.md                    # Entry point - what's in this folder
├── 00-PROJECT-OVERVIEW.md       # High-level project summary
├── 01-ARCHITECTURE.md           # System architecture & decisions
├── 02-API-REFERENCE/
│   ├── README.md               # API overview
│   ├── openapi.yaml            # OpenAPI spec
│   └── endpoints.md            # Detailed endpoint docs
├── 03-DATABASE/
│   ├── schema.md               # Schema documentation
│   ├── migrations.md           # Migration guide
│   └── functions.md            # Database functions
├── 04-DEPLOYMENT/
│   ├── setup.md                # Local setup guide
│   ├── deployment.md           # Production deployment
│   └── environment.md          # Environment variables
├── 05-DEVELOPMENT/
│   ├── workflow.md             # Development workflow
│   ├── testing.md              # Testing guide
│   └── conventions.md          # Code conventions
├── 99-PHASES/
│   ├── phase-1.md              # Phase 1 retrospective
│   ├── phase-2.md              # Phase 2 retrospective
│   └── phase-3.md              # Phase 3 retrospective
└── _ARCHIVED/                  # Old docs (already exists)
```

### 1.2 Document Consolidation Plan

**KEEP (Current & Active):**
- `API_CONTRACT.md` → Move to `02-API-REFERENCE/endpoints.md`
- `DEPLOYMENT_CHECKLIST.md` → Move to `04-DEPLOYMENT/deployment.md`
- `GOAL_CHECKLIST.md` → Consolidate into `99-PHASES/phase-3.md`
- `openapi.yaml` → Move to `02-API-REFERENCE/`

**ARCHIVE (Historical/Planning):**
- `PHASE_1_SPEC.md` → `99-PHASES/phase-1.md` (retrospective format)
- `PHASE_2_SPEC.md` → `99-PHASES/phase-2.md` (retrospective format)
- `PHASE_3_COMPLETION_PLAN.md` → Archive (superseded by this plan)
- `PHASE_3_FRONTEND_STRATEGY.md` → Archive (implemented)
- `PHASE_3_MASTER.md` → Consolidate into `99-PHASES/phase-3.md`
- `PHASE_3_COMPLETE.md` → Consolidate into `99-PHASES/phase-3.md`
- `PRD.md` → Archive (historical)

**CREATE NEW:**
- `README.md` - Docs index
- `00-PROJECT-OVERVIEW.md` - Executive summary
- `01-ARCHITECTURE.md` - Technical architecture
- `02-API-REFERENCE/README.md` - API guide
- `03-DATABASE/schema.md` - Schema docs
- `04-DEPLOYMENT/setup.md` - Setup instructions
- `05-DEVELOPMENT/workflow.md` - Dev workflow

---

## Phase 2: Code Cleanup & Organization

### 2.1 API Code Organization

**Current Issues to Address:**

1. **DTO Consolidation**
   - Some DTOs may be unused
   - Check for duplicates
   - Ensure naming consistency

2. **Service Layer Review**
   - `transactions.service.ts` is large (500+ lines)
   - Consider splitting if >1000 lines
   - Check for dead code

3. **Controller Organization**
   - Verify all endpoints are documented
   - Check for unused imports
   - Ensure consistent error handling

**Cleanup Tasks:**
```bash
# Remove unused imports
# Standardize error messages
# Add JSDoc comments to public methods
# Organize imports (external → internal → relative)
```

### 2.2 Frontend Code Organization

**Current Issues to Address:**

1. **Component Structure**
   - `web/my-app/components/ui/` - 50+ shadcn components
   - `web/my-app/app/` - Page components
   - Verify all components are used

2. **Lib Organization**
   - `api-client.ts` - API calls
   - `types.ts` - TypeScript definitions
   - `helpers.ts` - Utilities
   - Check for circular dependencies

3. **Dead Code Removal**
   - Unused imports
   - Commented-out code
   - Old console.log statements

**Cleanup Tasks:**
```bash
# Find unused exports
npx ts-prune -p web/my-app/tsconfig.json

# Check for console.log
grep -r "console.log" web/my-app/app/ --include="*.ts" --include="*.tsx"

# Organize imports
```

### 2.3 Database Cleanup

**Migration Consolidation:**
```
db/migrations/
├── 20260129_consolidated_migration.sql    # Keep
├── 20260129_create_txn_schema.sql         # Keep
└── 20260130_create_create_transaction_fn.sql  # Keep

supabase/migrations/
├── 20260130100000_create_create_transaction_fn.sql     # Keep
├── 20260201100000_fix_create_transaction_fn2.sql       # Keep
└── 20260202_fix_create_transaction_phase3.sql          # Keep
```

**Create:**
- `db/migrations/README.md` - Migration guide
- `db/seeds/` - Seed data for development
- `db/verify/` - Verification scripts

---

## Phase 3: Configuration & Tooling

### 3.1 Root-Level Configuration

**Create/Update:**

1. **Root package.json** (enhanced)
```json
{
  "name": "project-bridge",
  "version": "1.0.0",
  "description": "African Informal Economy Ledger - Headless Truth Ledger",
  "private": true,
  "scripts": {
    "dev": "concurrently \"npm:dev:api\" \"npm:dev:web\"",
    "dev:api": "cd api && npm run start:dev",
    "dev:web": "cd web/my-app && npm run dev",
    "build": "npm run build:api && npm run build:web",
    "build:api": "cd api && npm run build",
    "build:web": "cd web/my-app && npm run build",
    "test": "npm run test:api && npm run test:web",
    "test:api": "cd api && npm run test",
    "test:web": "cd web/my-app && npm test",
    "test:integration": "jest tests/integration/",
    "lint": "cd api && npm run lint && cd ../web/my-app && npm run lint",
    "format": "prettier --write \"**/*.{ts,tsx,js,json,md}\"",
    "setup": "npm install && cd api && npm install && cd ../web/my-app && npm install",
    "clean": "rm -rf api/dist web/my-app/.next",
    "tunnel": "ngrok http 3001",
    "tunnel:api": "ngrok http 3000",
    "docs:serve": "npx serve docs/",
    "health-check": "node scripts/health-check.js"
  },
  "devDependencies": {
    "concurrently": "^8.2.0",
    "prettier": "^3.0.0",
    "@types/node": "^20.0.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

2. **.nvmrc** - Node version specification
```
20.11.0
```

3. **.editorconfig** - Consistent editor settings
```ini
root = true

[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 2
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false
```

4. **.prettierignore** - Exclude files from formatting
```
node_modules/
dist/
.next/
*.lock
```

### 3.2 Environment Templates

**api/.env.example:**
```bash
# Supabase Configuration
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...

# API Configuration
PORT=3000
NODE_ENV=development
API_VERSION=v1

# Optional: External Services
# REDIS_URL=redis://localhost:6379
# SENTRY_DSN=https://...
# LOG_LEVEL=debug
```

**web/my-app/.env.example:**
```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
API_URL=http://localhost:3000/api/v1

# Supabase (Client-side)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# App Configuration
NEXT_PUBLIC_APP_NAME="Project Bridge"
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_DEFAULT_TENANT_ID=00000000-0000-0000-0000-000000000000

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

### 3.3 Scripts Directory

Create `scripts/` for automation:

```
scripts/
├── setup.sh                    # Initial setup
├── health-check.js             # System health verification
├── db-seed.js                  # Database seeding
├── db-reset.sh                 # Database reset
├── ngrok-config.yml            # ngrok configuration
└── verify-phase3.js            # Phase 3 verification
```

---

## Phase 4: Testing & Verification

### 4.1 Integration Test Suite

**tests/integration/health.test.js:**
```javascript
describe('Phase 3 System Health', () => {
  const API_URL = process.env.API_URL || 'http://localhost:3000';
  const WEB_URL = process.env.WEB_URL || 'http://localhost:3001';

  test('API is running', async () => {
    const res = await fetch(`${API_URL}/api/v1/entities`);
    expect(res.status).toBe(200);
  });

  test('Web is running', async () => {
    const res = await fetch(WEB_URL);
    expect(res.status).toBe(200);
  });

  test('Can create transaction', async () => {
    // Test transaction creation
  });

  test('Can search by SKU (G-010)', async () => {
    // Verify SKU search works
  });

  test('Database functions work', async () => {
    // Test create_transaction RPC
  });
});
```

### 4.2 Verification Scripts

**scripts/verify-phase3.js:**
```javascript
#!/usr/bin/env node
/**
 * Phase 3 Verification Script
 * Run before creating git tag
 */

const checks = [
  'API responds on port 3000',
  'Web responds on port 3001',
  'Database migrations applied',
  'All tests pass',
  'No console.log in production code',
  'Environment files configured',
];

// Implementation...
```

---

## Phase 5: Final Documentation

### 5.1 Main README.md Update

**Structure:**
```markdown
# Project Bridge

## African Informal Economy Ledger

### Quick Start
```bash
npm run setup
npm run dev
```

### Documentation
- [Architecture](docs/01-ARCHITECTURE.md)
- [API Reference](docs/02-API-REFERENCE/)
- [Deployment](docs/04-DEPLOYMENT/)
- [Development](docs/05-DEVELOPMENT/)

### Status
Phase 3: Complete ✅
```

### 5.2 CHANGELOG.md

Create version history:
```markdown
# Changelog

## [1.0.0] - Phase 3 Lock
### Added
- Transaction state machine (DRAFT → POSTED → RECONCILED)
- Three Majors support (RETAIL, SERVICE, RENTAL)
- Entity management with 360° view
- Split payment records
- File attachment system
- Universal Invoice export
- Build infrastructure & ngrok support

### Fixed
- G-010: SKU search functionality
```

### 5.3 CONTRIBUTING.md

For future team members:
```markdown
# Contributing

## Development Workflow
1. Run `npm run dev` to start all services
2. Make changes
3. Run `npm test` before committing
4. Follow conventional commits

## Code Style
- TypeScript strict mode
- Prettier for formatting
- ESLint for linting
```

---

## Phase 6: Git & Release

### 6.1 Git Configuration

**.gitattributes:**
```
* text=auto
*.js text eol=lf
*.ts text eol=lf
*.tsx text eol=lf
*.json text eol=lf
*.md text eol=lf
```

### 6.2 Git Ignore Updates

Ensure `.gitignore` includes:
```
# Dependencies
node_modules/

# Build outputs
dist/
.next/
*.tsbuildinfo

# Environment
.env
.env.local
!.env.example

# Logs
*.log
logs/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Testing
coverage/
.nyc_output/

# Temporary
tmp/
temp/
*.tmp
```

### 6.3 Release Tag

**Command:**
```bash
git tag -a v1.0.0-phase3 -m "Phase 3: Production Ready

Complete African Informal Economy Ledger with:
- Transaction state machine
- Three Majors support
- Entity management
- Split payments
- File attachments
- Build infrastructure

See CHANGELOG.md for details"
```

---

## Execution Checklist

### Documentation
- [ ] Create new docs structure
- [ ] Consolidate existing docs
- [ ] Archive old planning docs
- [ ] Update main README.md
- [ ] Create CHANGELOG.md
- [ ] Create CONTRIBUTING.md

### Code
- [ ] Clean up API unused imports/code
- [ ] Clean up frontend unused components
- [ ] Add JSDoc comments
- [ ] Organize imports
- [ ] Remove console.log statements

### Configuration
- [ ] Root package.json with all scripts
- [ ] .nvmrc for Node version
- [ ] .editorconfig
- [ ] Environment templates
- [ ] Scripts directory

### Testing
- [ ] Integration test suite
- [ ] Health check script
- [ ] Phase 3 verification script

### Git
- [ ] Update .gitignore
- [ ] Add .gitattributes
- [ ] Create git tag
- [ ] Push tag to remote

---

## Timeline Estimate

| Phase | Effort |
|-------|--------|
| Documentation Cleanup | 3-4 hours |
| Code Cleanup | 2-3 hours |
| Configuration | 2 hours |
| Testing | 2 hours |
| Git & Release | 1 hour |
| **Total** | **10-12 hours** |

---

## Next Steps

Would you like me to:
1. **Start implementing** - Switch to Code mode and execute this plan?
2. **Prioritize specific phases** - Which phase first?
3. **Create templates** - Start with documentation structure?
4. **Something else** - Adjust the plan?
