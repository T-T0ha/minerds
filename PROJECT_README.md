# 🏥 Healthcare Data Provenance Framework

A blockchain-based platform for secure healthcare dataset tokenization and licensing using Soul-Bound Tokens (SBTs).

## 🚀 Quick Start

### Prerequisites

- Node.js 22.x or later
- MetaMask wallet extension
- Git

### 1. Clone and Setup

```bash
git clone <repository-url>
cd "Minerds Prototype"
```

### 2. Start Blockchain (Terminal 1)

```bash
cd blockchain
npm install
npx hardhat node
```

### 3. Deploy Contracts (Terminal 2)

```bash
cd blockchain
npx hardhat run scripts/deploy.js --network localhost
```

### 4. Start Frontend (Terminal 3)

```bash
cd frontend
npm install
npm run dev
```

### 5. Access Application

- Frontend: http://localhost:5173
- Blockchain: http://127.0.0.1:8545

## 📁 Project Structure

```
Healthcare Data Provenance Framework/
├── blockchain/                 # Smart contracts & deployment
│   ├── contracts/             # Solidity contracts
│   │   ├── DatasetSBT.sol     # Soul-Bound Token for datasets
│   │   └── DatasetMarketplace.sol # Licensing marketplace
│   ├── scripts/               # Deployment scripts
│   ├── test/                  # Contract tests
│   └── hardhat.config.js      # Hardhat configuration
├── frontend/                   # React application
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── Header.jsx     # Wallet connection
│   │   │   ├── DatasetMarketplace.jsx # Browse datasets
│   │   │   ├── DatasetUpload.jsx # Upload new datasets
│   │   │   └── MyLicenses.jsx # View owned licenses
│   │   ├── context/           # React contexts
│   │   │   └── Web3Context.jsx # Blockchain integration
│   │   └── contracts/         # Contract ABIs & addresses
│   └── package.json
└── README.md
```

## 🔧 Core Features

### ✅ **Implemented (Prototype)**

- **Dataset Tokenization**: Convert datasets to non-transferable SBTs
- **Secure Marketplace**: Purchase dataset licenses with ETH
- **Wallet Integration**: MetaMask connection and transaction handling
- **License Management**: View and manage owned dataset licenses
- **Provider Interface**: Upload and register new datasets
- **Real-time Updates**: Blockchain state synchronization

### 🚧 **IPFS Storage (Backend Required)**

The current prototype simulates IPFS upload. For production, implement:

```javascript
// Backend API (Express.js)
app.post("/upload-dataset", async (req, res) => {
  // 1. Validate user permissions
  // 2. Upload file to IPFS (Pinata/Infura)
  // 3. Call smart contract registerDataset()
  // 4. Return IPFS hash and transaction details
});

app.get("/dataset/:id", async (req, res) => {
  // 1. Verify SBT ownership via smart contract
  // 2. If valid, serve encrypted IPFS content
  // 3. Log access for audit trail
});
```

## 🛠 Smart Contracts

### DatasetSBT.sol

- **Purpose**: Soul-Bound Token for dataset licensing
- **Key Functions**:
  - `registerDataset()` - Register new dataset with IPFS hash
  - `issueLicense()` - Issue non-transferable license to buyer
  - `hasValidLicense()` - Check user access permissions
  - `updateDataset()` - Version control for datasets

### DatasetMarketplace.sol

- **Purpose**: Secure marketplace for dataset licensing
- **Key Functions**:
  - `purchaseDatasetLicense()` - Buy dataset access with ETH
  - `getDatasetInfo()` - Retrieve dataset metadata
  - `canAccessDataset()` - Verify access permissions
  - Platform fee management and revenue sharing

## 🌐 Usage Guide

### For Data Providers

1. **Connect Wallet**: Use MetaMask to connect
2. **Upload Dataset**: Go to "Upload Dataset" tab
3. **Set Pricing**: Define license terms and price
4. **Register**: Upload creates IPFS hash and blockchain record
5. **Earn Revenue**: Receive payments from license sales

### For Researchers/Customers

1. **Browse Marketplace**: View available datasets
2. **Purchase License**: Buy access with ETH payment
3. **Download Data**: Access granted datasets via "My Licenses"
4. **Verify Authenticity**: All data provenance on blockchain

### For Developers

1. **Smart Contract Integration**:

   ```javascript
   import { ethers } from "ethers";
   import {
     CONTRACT_ADDRESSES,
     MARKETPLACE_ABI,
   } from "./contracts/contracts.js";

   const contract = new ethers.Contract(
     CONTRACT_ADDRESSES.MARKETPLACE,
     MARKETPLACE_ABI,
     signer
   );
   ```

2. **Check Dataset Access**:
   ```javascript
   const hasAccess = await contract.canAccessDataset(userAddress, datasetId);
   ```

## 🔐 Security Features

- **Non-transferable SBTs**: Prevents license trading/resale
- **Role-based Access Control**: Provider and admin permissions
- **Reentrancy Protection**: Secure payment handling
- **OpenZeppelin Contracts**: Audited, battle-tested code
- **Immutable Records**: Tamper-proof dataset provenance

## 🚀 Deployment

### Local Development

```bash
# Start local blockchain
npx hardhat node

# Deploy contracts
npx hardhat run scripts/deploy.js --network localhost

# Start frontend
npm run dev
```

### Polygon Testnet (Mumbai)

```bash
# Configure .env with Mumbai RPC and private key
npx hardhat run scripts/deploy.js --network mumbai
```

### Production (Polygon Mainnet)

```bash
# Configure .env with Polygon RPC and private key
npx hardhat run scripts/deploy.js --network polygon
```

## 🔮 Future Enhancements

### Phase 2

- **DAO Governance**: Community curation and attestation
- **Advanced Analytics**: Dataset usage and quality metrics
- **Multi-token Support**: USDC, USDT, DAI payments
- **Batch Operations**: Bulk dataset management

### Phase 3

- **Cross-chain Compatibility**: Multi-blockchain support
- **AI/ML Integration**: Automated quality validation
- **Regulatory Compliance**: HIPAA, GDPR, EU AI Act automation
- **Enterprise Features**: Institutional onboarding and SSO

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for secure healthcare data sharing**
