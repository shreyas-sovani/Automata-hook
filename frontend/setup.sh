#!/bin/bash

# AutomataHook Frontend - Quick Start Script

echo "🚀 AutomataHook Frontend Setup"
echo "==============================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Navigate to frontend directory
cd "$(dirname "$0")" || exit

echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ npm install failed"
    exit 1
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "📝 To start the development server:"
echo "   npm run dev"
echo ""
echo "🔗 Open http://localhost:3000 in your browser"
echo ""
echo "🏗️  To build for production:"
echo "   npm run build"
echo "   npm start"
