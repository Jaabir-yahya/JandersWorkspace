#!/bin/bash
# Setup script for Project Bridge
# Creates environment files from templates

set -e

echo "🔧 Setting up Project Bridge environment..."
echo ""

# Check if .env files already exist
if [ -f "api/.env" ]; then
  echo "⚠️  api/.env already exists. Skipping..."
else
  cp api/.env.example api/.env
  echo "✅ Created api/.env"
fi

if [ -f "web/my-app/.env.local" ]; then
  echo "⚠️  web/my-app/.env.local already exists. Skipping..."
else
  cp web/my-app/.env.example web/my-app/.env.local
  echo "✅ Created web/my-app/.env.local"
fi

echo ""
echo "📝 Next steps:"
echo "   1. Update api/.env with your Supabase credentials"
echo "   2. Update web/my-app/.env.local with your API URL"
echo "   3. Run 'npm run setup' to install dependencies"
echo "   4. Run 'npm run dev' to start development"
echo ""
echo "📖 See docs/04-DEPLOYMENT/setup.md for detailed instructions"
