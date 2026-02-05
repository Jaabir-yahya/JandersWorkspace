#!/bin/bash

# Project Bridge Solo Dev Setup Script
# Run this to set up your environment

echo "bridge: 🚀 Setting up Project Bridge..."

# 1. Install dependencies
echo "bridge: 📦 Installing dependencies..."
npm install

# 2. Setup Env Files
echo "bridge: ⚙️  Setting up environment files..."
if [ ! -f .env ]; then
  cp .env.example .env
  echo "bridge: ✅ Created .env"
fi

if [ ! -f apps/api/.env ]; then
  cp apps/api/.env.example apps/api/.env
  echo "bridge: ✅ Created apps/api/.env"
fi

# 3. Database Setup
echo "bridge: 🗄️  Setting up database (local Docker)..."
npm run db:local
echo "bridge: ⏳ Waiting for database to start..."
sleep 5

# 4. Generate Prisma Client
echo "bridge: 🔮 Generating Prisma Client..."
cd packages/database && npx prisma generate && cd ../..

# 5. Build
echo "bridge: 🏗️  Building project..."
npm run build

echo "bridge: 🎉 Setup complete! Run 'npm run dev' to start."
