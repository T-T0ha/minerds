#!/bin/bash

# Polygon Amoy Deployment Script
# ==============================

echo "🚀 Deploying to Polygon Amoy Testnet..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "📋 Copy .env.amoy to .env and fill in your private key:"
    echo "   cp .env.amoy .env"
    echo "   # Then edit .env and add your PRIVATE_KEY"
    exit 1
fi

# Check if PRIVATE_KEY is set
if ! grep -q "PRIVATE_KEY=" .env || grep -q "PRIVATE_KEY=your_private_key_here" .env; then
    echo "❌ PRIVATE_KEY not configured in .env file!"
    echo "📋 Please set your private key in .env file"
    exit 1
fi

echo "✅ Environment configured"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Compile contracts
echo "🔨 Compiling contracts..."
npx hardhat compile

if [ $? -ne 0 ]; then
    echo "❌ Contract compilation failed!"
    exit 1
fi

echo "✅ Contracts compiled successfully"

# Deploy using custom script
echo "🚀 Deploying contracts to Polygon Amoy..."
npx hardhat run scripts/deploy-amoy.js --network amoy

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Deployment completed successfully!"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Copy the contract addresses from above"
    echo "2. Update your backend .env file with the new addresses"
    echo "3. Update your frontend contract configuration"
    echo "4. Verify contracts on PolygonScan (optional)"
    echo ""
    echo "🔗 Useful Links:"
    echo "- Polygon Amoy Explorer: https://amoy.polygonscan.com/"
    echo "- Get test MATIC: https://faucet.polygon.technology/"
else
    echo "❌ Deployment failed!"
    exit 1
fi
