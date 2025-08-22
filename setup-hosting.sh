#!/bin/bash

echo "🚀 Setting up JBS Platform Hosting..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Install Netlify CLI
echo "📦 Installing Netlify CLI..."
npm install -g netlify-cli

# Install Render CLI
echo "📦 Installing Render CLI..."
npm install -g @render/cli

# Make deployment scripts executable
echo "🔧 Making deployment scripts executable..."
chmod +x deploy-frontend.sh
chmod +x deploy-backend.sh

# Install project dependencies
echo "📦 Installing frontend dependencies..."
npm install

echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

echo ""
echo "🎉 Hosting setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Create accounts on Netlify and Render"
echo "2. Login to both platforms:"
echo "   - netlify login"
echo "   - render login"
echo "3. Update environment variables in env.production files"
echo "4. Deploy backend first: ./deploy-backend.sh"
echo "5. Deploy frontend: ./deploy-frontend.sh"
echo ""
echo "📖 See DEPLOYMENT_GUIDE.md for detailed instructions"
echo ""
