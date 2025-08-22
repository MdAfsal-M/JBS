#!/bin/bash

echo "🚀 Deploying Frontend to Netlify..."

# Build the project
echo "📦 Building project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Deploy to Netlify
    echo "🌐 Deploying to Netlify..."
    npx netlify deploy --prod --dir=dist
    
    if [ $? -eq 0 ]; then
        echo "🎉 Frontend deployed successfully!"
        echo "📝 Don't forget to update the FRONTEND_URL in your backend environment variables"
    else
        echo "❌ Netlify deployment failed!"
        exit 1
    fi
else
    echo "❌ Build failed!"
    exit 1
fi
