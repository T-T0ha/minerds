# 🏥 Healthcare Data Provenance Framework - Prototype

A blockchain-based framework for secure healthcare dataset tokenization and licensing using Soul-Bound Tokens (SBTs) with full IPFS storage integration.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- IPFS Desktop or IPFS CLI
- MetaMask wallet extension

### 1. Automated Setup

```bash
# Windows
./setup.bat

# Linux/Mac
./setup.sh
```

### 2. Manual Setup

```bash
# Install all dependencies
cd blockchain && npm install && cd ..
cd frontend && npm install && cd ..
cd backend && npm install && cd ..

# Start IPFS (if using CLI)
ipfs daemon

# Start blockchain (Terminal 1)
cd blockchain && npx hardhat node

# Deploy contracts (Terminal 2)
cd blockchain && npx hardhat run scripts/deploy.js --network localhost

# Start backend (Terminal 3)
cd backend && npm run dev

# Start frontend (Terminal 4)
cd frontend && npm run dev
```

### 3. Access Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Blockchain RPC**: http://127.0.0.1:8545

## 📁 Complete Architecture

```
Healthcare Data Provenance Framework/
├── blockchain/                    # Smart contracts & deployment
│   ├── contracts/                # Solidity contracts
│   │   ├── DatasetSBT.sol        # Soul-Bound Token for datasets
│   │   └── DatasetMarketplace.sol # Licensing marketplace
│   ├── scripts/deploy.js         # Contract deployment
│   └── hardhat.config.js         # Blockchain configuration
├── backend/                      # IPFS storage & API
│   ├── services/                 # Core business logic
│   │   ├── ipfsService.js        # IPFS file operations
│   │   └── blockchainService.js  # Smart contract integration
│   ├── middleware/               # Authentication & validation
│   └── server.js                 # Express.js API server
├── frontend/                     # React Web Application
│   ├── src/components/           # UI components
│   │   ├── Header.jsx            # Wallet connection
│   │   ├── DatasetMarketplace.jsx # Browse & purchase datasets
│   │   ├── DatasetUpload.jsx     # Upload new datasets
│   │   └── MyLicenses.jsx        # View owned licenses
│   ├── src/context/              # React state management
│   │   └── Web3Context.jsx       # Blockchain integration
│   └── src/config/               # Configuration
│       └── testWallets.js        # Hardhat test accounts
└── README.md                     # This file
```

## 🔧 Core Features (Fully Implemented)

### ✅ **Dataset Tokenization**

- Upload healthcare datasets to IPFS
- Automatic registration as Soul-Bound Tokens
- Immutable provenance tracking on blockchain

### ✅ **IPFS Storage Integration**

- Decentralized file storage via IPFS
- Automatic file pinning for availability
- Secure access control via blockchain verification

### ✅ **Licensing Marketplace**

- Browse available datasets with metadata
- Purchase licenses with ETH payments
- Non-transferable SBT license tokens

### ✅ **Access Control**

- Blockchain-based license verification
- Secure dataset downloads for license holders
- Provider role management

### ✅ **Test Wallet Integration**

- Pre-configured Hardhat test accounts
- Easy switching between test wallets
- No MetaMask required for testing

## 🛠 Technology Stack

### Blockchain Layer

- **Hardhat**: Ethereum development environment
- **Solidity**: Smart contract development
- **OpenZeppelin**: Secure contract templates
- **Polygon**: Layer 2 scaling solution

### Storage Layer

- **IPFS**: Decentralized file storage
- **Pinning**: File persistence guarantee

### Backend Layer

- **Node.js**: Runtime environment
- **Express.js**: Web API framework
- **ethers.js**: Blockchain interaction
- **Multer**: File upload handling

### Frontend Layer

- **React**: User interface framework
- **Vite**: Fast development build tool
- **ethers.js**: Web3 integration
- **CSS3**: Modern styling

## 🔐 Security Features

- **Non-transferable SBTs**: Prevents license trading/resale
- **Role-based Access Control**: Provider and admin permissions
- **File Type Validation**: Only allowed formats accepted
- **Rate Limiting**: API abuse prevention
- **Input Sanitization**: XSS protection
- **CORS Protection**: Secure cross-origin requests

## 📊 Complete Data Flow

### Upload Process

1. **Provider uploads dataset** → Frontend form submission
2. **File validation** → Backend validates format and size
3. **IPFS storage** → File uploaded to IPFS network
4. **Blockchain registration** → IPFS hash stored in smart contract
5. **Confirmation** → Provider receives transaction receipt

### Purchase Process

1. **Customer browses marketplace** → Frontend loads datasets from backend
2. **License purchase** → ETH payment to smart contract
3. **SBT issuance** → Non-transferable license token minted
4. **Access granted** → Customer can download dataset

### Download Process

1. **Access request** → Customer requests dataset download
2. **License verification** → Backend checks SBT ownership
3. **IPFS retrieval** → File fetched from IPFS if authorized
4. **Secure delivery** → File streamed to authorized user

## 🧪 Testing with Test Wallets

The platform includes pre-configured Hardhat test accounts for easy testing:

### Available Test Accounts

- **Account #0 (Admin)**: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- **Account #1 (Provider)**: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
- **Account #2 (Customer)**: `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`

### Test Workflow

1. Click "Use Test Wallet" in header (development mode)
2. Switch between accounts using dropdown
3. Upload datasets as Provider account
4. Purchase licenses as Customer account
5. Download datasets with valid licenses

## 🚀 Production Deployment

### IPFS Production Setup

```bash
# Option 1: Pinata (Recommended)
# Sign up at https://pinata.cloud
# Update .env with Pinata credentials

# Option 2: Infura IPFS
# Sign up at https://infura.io
# Update .env with Infura project details

# Option 3: Self-hosted IPFS cluster
# Set up IPFS cluster for redundancy
```

### Blockchain Deployment

```bash
# Deploy to Polygon Mumbai (Testnet)
npx hardhat run scripts/deploy.js --network mumbai

# Deploy to Polygon Mainnet (Production)
npx hardhat run scripts/deploy.js --network polygon
```

### Backend Production

- Configure production IPFS provider
- Set up proper JWT authentication
- Enable HTTPS with reverse proxy
- Configure monitoring and logging

## 📡 API Endpoints

### Dataset Management

- `POST /api/upload-dataset` - Upload dataset to IPFS & blockchain
- `GET /api/datasets` - List all available datasets
- `GET /api/dataset/:id` - Download dataset (access controlled)
- `GET /api/dataset-info/:id` - Get dataset metadata (public)

### License Management

- `GET /api/verify-license/:datasetId/:userAddress` - Verify license
- `GET /api/user-licenses/:userAddress` - Get user's licenses

### System

- `GET /api/health` - Health check endpoint

## 🤝 Smart Contract Integration

### DatasetSBT.sol

```solidity
// Register new dataset
function registerDataset(
    string memory _ipfsHash,
    string memory _metadata,
    string memory _licenseTerms,
    uint256 _price
) external returns (uint256)

// Check user license
function hasValidLicense(
    address _user,
    uint256 _datasetId
) external view returns (bool)
```

### DatasetMarketplace.sol

```solidity
// Purchase dataset license
function purchaseDatasetLicense(
    uint256 _datasetId,
    address _paymentToken,
    uint256 _licenseDuration
) external payable

// Verify access rights
function canAccessDataset(
    address _user,
    uint256 _datasetId
) external view returns (bool)
```

## 🔮 Future Enhancements

### Phase 2 Features

- **DAO Governance**: Community dataset curation
- **Advanced Analytics**: Usage metrics and quality scores
- **Multi-token Payments**: USDC, USDT, DAI support
- **Batch Operations**: Bulk dataset management

### Phase 3 Features

- **Cross-chain Support**: Multi-blockchain compatibility
- **AI/ML Integration**: Automated quality validation
- **Regulatory Compliance**: HIPAA, GDPR automation
- **Enterprise Features**: SSO and institutional onboarding

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

#### IPFS Connection Failed

```bash
# Check IPFS status
ipfs swarm peers

# Restart IPFS daemon
ipfs daemon
```

#### Blockchain Connection Failed

```bash
# Verify Hardhat node is running
curl -X POST http://127.0.0.1:8545
  -H "Content-Type: application/json"
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

#### Frontend Not Loading

```bash
# Clear cache and restart
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

**🏥 Built for secure healthcare data sharing with blockchain and IPFS** ⛓️
