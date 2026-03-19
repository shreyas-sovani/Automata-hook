#!/bin/bash

# Complete Setup Script for AutomataHook Hackathon Project

set -e

echo "🚀 AutomataHook Hackathon Project Setup"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check prerequisites
echo -e "${BLUE}Step 1: Checking Prerequisites${NC}"
echo "================================"

if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}❌ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node --version)${NC}"

if ! command -v npm &> /dev/null; then
    echo -e "${YELLOW}❌ npm not found. Please install npm${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm $(npm --version)${NC}"

echo ""

# Step 2: Backend Setup
echo -e "${BLUE}Step 2: Backend Setup${NC}"
echo "====================="

if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
else
    echo -e "${GREEN}✅ Backend dependencies already installed${NC}"
fi

echo -e "${GREEN}✅ Backend ready${NC}"
echo ""

# Step 3: Frontend Setup
echo -e "${BLUE}Step 3: Frontend Setup${NC}"
echo "======================"

if [ ! -d "frontend" ]; then
    echo -e "${YELLOW}⚠️  Frontend directory not found${NC}"
else
    cd frontend
    
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing frontend dependencies..."
        npm install
    else
        echo -e "${GREEN}✅ Frontend dependencies already installed${NC}"
    fi
    
    cd ..
    echo -e "${GREEN}✅ Frontend ready${NC}"
fi

echo ""

# Step 4: Display setup summary
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✨ Setup Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""

echo -e "${BLUE}📝 Quick Start Guide:${NC}"
echo ""
echo "1️⃣  Run Backend Tests:"
echo "   ${YELLOW}npm test${NC}"
echo ""
echo "2️⃣  Start Frontend Dashboard:"
echo "   ${YELLOW}cd frontend && npm run dev${NC}"
echo ""
echo "3️⃣  Open in Browser:"
echo "   ${YELLOW}http://localhost:3000${NC}"
echo ""
echo "4️⃣  Deploy to Production:"
echo "   ${YELLOW}npm run build && cd frontend && npm run build${NC}"
echo ""

echo -e "${BLUE}📊 Project Structure:${NC}"
echo "   • Smart Contracts: src/contracts/"
echo "   • Tests: test/AutomataEcosystem.test.ts"
echo "   • Frontend: frontend/"
echo "   • Documentation: PRD v3.1.md, README_HACKATHON.md"
echo ""

echo -e "${BLUE}🔗 Important Links:${NC}"
echo "   • Dashboard: http://localhost:3000 (after npm run dev in frontend)"
echo "   • Unichain Sepolia: https://sepolia.etherscan.io"
echo "   • Reactive Lasna: https://lasna.reactscan.net"
echo "   • Reactive RPC: https://lasna-rpc.rnk.dev/"
echo ""

echo -e "${GREEN}Ready to go! 🎉${NC}"
