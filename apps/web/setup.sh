#!/bin/bash

echo "🚀 LedgerFlow Frontend Setup"
echo "=============================="
echo ""

# Check Node.js version
NODE_VERSION=$(node -v 2>/dev/null)
if [ $? -ne 0 ]; then
    echo "❌ Node.js is not installed"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js version: $NODE_VERSION"

# Check if npm is installed
NPM_VERSION=$(npm -v 2>/dev/null)
if [ $? -ne 0 ]; then
    echo "❌ npm is not installed"
    exit 1
fi

echo "✓ npm version: $NPM_VERSION"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✓ Dependencies installed"
echo ""

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cp .env.example .env.local
    echo "✓ .env.local created (please update with your values)"
else
    echo "✓ .env.local already exists"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Quick start commands:"
echo "  npm run dev     - Start development server"
echo "  npm run build   - Build for production"
echo "  npm start       - Start production server"
echo ""
echo "📚 Documentation:"
echo "  README.md         - Project overview and features"
echo "  DEVELOPMENT.md    - Development guide"
echo "  DEPLOYMENT.md     - Deployment instructions"
echo ""
echo "🌐 The app will run on: http://localhost:3000"
echo ""
echo "Happy coding! 🚀"
