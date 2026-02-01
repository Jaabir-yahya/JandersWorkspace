#!/bin/bash
# Setup script for Project Bridge
# Creates environment files from templates

set -e

echo "🔧 Setting up Project Bridge environment..."
echo ""

# Check if root .env exists
if [ -f ".env" ]; then
  echo "⚠️  .env already exists. Skipping..."
else
  cp .env.example .env
  echo "✅ Created .env (root)"
fi

# Check if apps/api .env exists (API loads from apps/api when run via turbo)
if [ -f "apps/api/.env" ]; then
  echo "⚠️  apps/api/.env already exists. Skipping..."
else
  if [ -f "apps/api/.env.example" ]; then
    cp apps/api/.env.example apps/api/.env
    echo "✅ Created apps/api/.env"
  else
    echo "ℹ️  Copy root .env values into apps/api/.env if running API from apps/api"
  fi
fi

# Next.js (bridge-manual) loads .env from apps/bridge-manual; create .env.local with API URL
if [ -f "apps/bridge-manual/.env.local" ]; then
  echo "⚠️  apps/bridge-manual/.env.local already exists. Skipping..."
else
  API_URL="http://localhost:3000"
  if [ -f ".env" ] && grep -q "NEXT_PUBLIC_API_URL=" .env 2>/dev/null; then
    API_URL=$(grep "^NEXT_PUBLIC_API_URL=" .env | cut -d= -f2- | tr -d '"' | tr -d "'" | head -1)
  fi
  echo "NEXT_PUBLIC_API_URL=${API_URL}" > apps/bridge-manual/.env.local
  echo "✅ Created apps/bridge-manual/.env.local (NEXT_PUBLIC_API_URL=${API_URL})"
fi

echo ""
echo "📝 Next steps:"
echo "   1. Edit .env and apps/api/.env with DATABASE_URL, ALLOWED_ORIGINS, etc."
echo "   2. Run: npm run setup  # install deps, generate, build"
echo "   3. Run: cd apps/api && npx prisma migrate dev  # then seed if needed"
echo "   4. Run: npm run dev  # API (3000) + bridge-manual (3001)"
echo ""
echo "📖 See README.md and docs/SOLO_DEV_RECOMMENDATIONS.md for details"
