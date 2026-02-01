# GitHub Actions Workflows

This directory contains GitHub Actions workflows for CI/CD automation.

## Workflows

### 1. CI Workflow (`ci.yml`)
**Purpose**: Continuous Integration - build and test on every push/PR

**Triggers**:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs**:
- Install dependencies
- Generate Prisma client
- Build the application
- Run linting
- Type checking
- Unit tests

### 2. Deploy API to Railway (`deploy-api.yml`)
**Purpose**: Deploy the NestJS API to Railway

**Triggers**:
- Push to `main` branch with changes in:
  - `apps/api/**`
  - `packages/database/**`
  - `packages/types/**`
  - `.github/workflows/deploy-api.yml`
- Manual trigger (`workflow_dispatch`)

**Required Secrets**:
- `RAILWAY_API_TOKEN`: Railway API token for deployment

**Jobs**:
- Install dependencies
- Generate Prisma client
- Build application
- Deploy to Railway using Railway CLI
- Run database migrations

### 3. Deploy Frontend to Vercel (`deploy-frontend.yml`)
**Purpose**: Deploy the Next.js frontend to Vercel

**Triggers**:
- Push to `main` branch with changes in:
  - `apps/bridge-manual/**`
  - `packages/**`
  - `.github/workflows/deploy-frontend.yml`
- Manual trigger (`workflow_dispatch`)

**Required Secrets**:
- `VERCEL_TOKEN`: Vercel API token for deployment

**Jobs**:
- Install Vercel CLI
- Pull environment information
- Build project artifacts
- Deploy to Vercel

## Required GitHub Secrets

To use these workflows, you need to configure the following secrets in your GitHub repository:

### Railway Deployment
1. Go to Railway Dashboard → Account Settings → Tokens
2. Generate a new token
3. Add to GitHub: Settings → Secrets and variables → Actions → New repository secret
4. Name: `RAILWAY_API_TOKEN`

### Vercel Deployment
1. Go to Vercel Dashboard → Settings → Tokens
2. Generate a new token
3. Add to GitHub: Settings → Secrets and variables → Actions → New repository secret
4. Name: `VERCEL_TOKEN`

## Environment Variables

### API Environment Variables (Railway)
The following environment variables should be configured in Railway:

- `DATABASE_URL`: PostgreSQL connection string
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key
- `JWT_SECRET`: Secret for JWT token signing
- `API_PORT`: Port for the API server (default: 3000)
- `NODE_ENV`: Environment (production)

### Frontend Environment Variables (Vercel)
The following environment variables should be configured in Vercel:

- `NEXT_PUBLIC_API_URL`: URL of the deployed API
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key

## Manual Deployment

You can trigger manual deployments from the GitHub Actions tab:

1. Go to your repository on GitHub
2. Click on "Actions" tab
3. Select the workflow you want to run
4. Click "Run workflow"
5. Select the branch and click "Run workflow"

## Troubleshooting

### Build Failures

If builds are failing:

1. **Check local build first**:
   ```bash
   # API
   cd apps/api && npm run build

   # Frontend
   cd apps/bridge-manual && npm run build
   ```

2. **Verify secrets are set correctly**

3. **Check workflow logs** in GitHub Actions for specific error messages

### Railway Deployment Issues

- Ensure `RAILWAY_API_TOKEN` has the correct permissions
- Verify the service name matches (`api` in the workflow)
- Check Railway dashboard for deployment logs

### Vercel Deployment Issues

- Ensure `VERCEL_TOKEN` is valid and not expired
- Verify Vercel project is linked correctly
- Check Vercel dashboard for deployment logs
