#!/bin/bash

# AutomataHook Frontend - Functional Live Dashboard

echo "🚀 Starting AutomataHook Live Dashboard"
echo "========================================"
echo ""

cd "$(dirname "$0")" || exit

# Install deps if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    cat > .env.local << EOF
# AutomataHook Frontend Configuration

# Private key for transactions (optional - for real integration)
PRIVATE_KEY=

# RPC Endpoints
UNICHAIN_RPC=https://sepolia.unichain.org
REACTIVE_RPC=https://lasna-rpc.rnk.dev/

# Contract Addresses (update with your deployed ones)
SWAP_EMITTER_ADDRESS=0x1234567890123456789012345678901234567890
BRAIN_ADDRESS=0xaBcDef0123456789aBcDef0123456789aBcDef01
HOOK_ADDRESS=0x9876543210987654321098765432109876543210
REACTIVE_PROXY=0x0000000000000000000000000000000000fffFfF
EOF
    echo "✅ Created .env.local"
fi

echo "✨ Starting development server..."
echo "🌐 Open http://localhost:3000"
echo ""
echo "Available at:"
echo "  http://localhost:3000"
echo ""
echo "To stop the server: Press Ctrl+C"
echo ""

npm run dev
