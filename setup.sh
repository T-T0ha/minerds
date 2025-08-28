#!/bin/bash

# Healthcare Data Provenance Platform - Setup Script

echo "🏥 Setting up Healthcare Data Provenance Platform..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if IPFS is available
if ! command -v ipfs &> /dev/null; then
    echo "⚠️  IPFS CLI not found. Please install IPFS Desktop or IPFS CLI."
    echo "   Download: https://github.com/ipfs/ipfs-desktop"
fi

echo "📦 Installing dependencies..."

# Install blockchain dependencies
echo "🔗 Setting up blockchain environment..."
cd blockchain
npm install
cd ..

# Install frontend dependencies
echo "🎨 Setting up frontend..."
cd frontend
npm install
cd ..

# Install backend dependencies
echo "🚀 Setting up backend..."
cd backend
npm install
cd ..

echo "✅ Installation complete!"
echo ""
echo "🚀 Quick Start Guide:"
echo "1. Start IPFS daemon (if using CLI): ipfs daemon"
echo "2. Start blockchain: cd blockchain && npx hardhat node"
echo "3. Deploy contracts: cd blockchain && npx hardhat run scripts/deploy.js --network localhost"
echo "4. Start backend: cd backend && npm run dev"
echo "5. Start frontend: cd frontend && npm run dev"
echo ""
echo "🌐 Access the application at: http://localhost:5173"
echo "📡 Backend API at: http://localhost:3001"
echo "⛓️  Blockchain RPC: http://127.0.0.1:8545"
