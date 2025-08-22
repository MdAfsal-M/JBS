#!/bin/bash

echo "🚀 Deploying Backend to Render..."

# Check if render CLI is installed
if ! command -v render &> /dev/null; then
    echo "📦 Installing Render CLI..."
    npm install -g @render/cli
fi

# Login to Render (if not already logged in)
echo "🔐 Checking Render login status..."
render whoami

if [ $? -ne 0 ]; then
    echo "🔑 Please login to Render..."
    render login
fi

# Deploy to Render
echo "🌐 Deploying to Render..."
cd backend
render deploy

if [ $? -eq 0 ]; then
    echo "🎉 Backend deployed successfully!"
    echo "📝 Don't forget to update the VITE_API_URL in your frontend environment variables"
else
    echo "❌ Render deployment failed!"
    exit 1
fi
