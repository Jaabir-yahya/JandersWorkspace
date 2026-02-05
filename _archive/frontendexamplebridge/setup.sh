#!/bin/bash

# African Business Platform - Quick Setup Script
# This script helps you get started quickly

set -e

echo "============================================"
echo "African Business Platform - Quick Setup"
echo "============================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 18+ from: https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version is too old (found v$NODE_VERSION)${NC}"
    echo "Please upgrade to Node.js 18+ from: https://nodejs.org"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node -v) found${NC}"

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}⚠ pnpm not found. Installing...${NC}"
    npm install -g pnpm
    echo -e "${GREEN}✓ pnpm installed${NC}"
else
    echo -e "${GREEN}✓ pnpm $(pnpm -v) found${NC}"
fi

# Install dependencies
echo ""
echo -e "${BLUE}📦 Installing dependencies...${NC}"
pnpm install

# Setup environment files
echo ""
echo -e "${BLUE}⚙️  Setting up environment variables...${NC}"
if [ ! -f "apps/web/.env.local" ]; then
    cp apps/web/.env.example apps/web/.env.local
    echo -e "${GREEN}✓ Created apps/web/.env.local${NC}"
    echo -e "${YELLOW}⚠ Please edit apps/web/.env.local with your settings${NC}"
else
    echo -e "${YELLOW}⚠ apps/web/.env.local already exists, skipping${NC}"
fi

# Build the project
echo ""
echo -e "${BLUE}🔨 Building the project...${NC}"
pnpm build

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}✓ Setup completed successfully!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "Next steps:"
echo ""
echo "1. Configure your environment:"
echo -e "   ${BLUE}nano apps/web/.env.local${NC}"
echo ""
echo "2. Start the development server:"
echo -e "   ${BLUE}pnpm dev${NC}"
echo ""
echo "3. Open your browser:"
echo -e "   ${BLUE}http://localhost:3000${NC}"
echo ""
echo "For production deployment, see DEPLOYMENT.md"
echo ""
echo -e "${YELLOW}Need help? Check README.md or open an issue on GitHub${NC}"
echo ""
