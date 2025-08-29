# Polygon Amoy Deployment Configuration

# =====================================

## 🚀 Deployed Contract Addresses (Polygon Amoy Testnet)

- **DatasetSBT**: `0x093DD3884F108Aaf85a712694663548Fca309C16`
- **DatasetMarketplace**: `0x2B8d92030c68640147B8e032BE483C435C24305b`
- **Deployer**: `0x80D387Dc5a93a5aD2BDB7Df8eD81f0D021a52950`

## 🔧 Network Configuration

- **Network**: Polygon Amoy Testnet
- **Chain ID**: 80002
- **RPC URL**: `https://polygon-amoy.g.alchemy.com/v2/KfUG5RUwO2iaiZq8P_r3E`
- **Currency**: MATIC
- **Block Explorer**: https://amoy.polygonscan.com/

## 📋 Updated Files

### Backend Configuration

- **File**: `backend/.env`
- **Updated**: Contract addresses and RPC URL for Polygon Amoy

### Frontend Configuration

- **File**: `frontend/src/contracts/contracts.js`
- **Updated**: Contract addresses and network config for Polygon Amoy
- **File**: `frontend/src/config/testWallets.js`
- **Updated**: Wallet configuration for Amoy testnet

## 🔗 Contract Links

- **DatasetSBT on PolygonScan**: https://amoy.polygonscan.com/address/0x093DD3884F108Aaf85a712694663548Fca309C16
- **DatasetMarketplace on PolygonScan**: https://amoy.polygonscan.com/address/0x2B8d92030c68640147B8e032BE483C435C24305b

## 🎯 Next Steps

1. **Get Test MATIC**: Visit https://faucet.polygon.technology/ to get test MATIC
2. **Add Amoy to MetaMask**:

   - Network Name: Polygon Amoy Testnet
   - RPC URL: https://polygon-amoy.g.alchemy.com/v2/KfUG5RUwO2iaiZq8P_r3E
   - Chain ID: 80002
   - Currency Symbol: MATIC
   - Block Explorer: https://amoy.polygonscan.com/

3. **Restart Services**:

   ```bash
   # Backend
   cd backend && npm start

   # Frontend
   cd frontend && npm run dev
   ```

4. **Test the Application**:
   - Connect MetaMask to Polygon Amoy
   - Use the deployed contract addresses
   - Test dataset upload, purchase, and curator features

## 🔍 Contract Verification (Optional)

To verify contracts on PolygonScan:

```bash
cd blockchain
npx hardhat verify --network amoy 0x093DD3884F108Aaf85a712694663548Fca309C16
npx hardhat verify --network amoy 0x2B8d92030c68640147B8e032BE483C435C24305b 0x093DD3884F108Aaf85a712694663548Fca309C16
```

## 🛡️ Security Notes

- The private key is included for testing purposes only
- Never use this key on mainnet or with real funds
- For production, use proper key management and hardware wallets
