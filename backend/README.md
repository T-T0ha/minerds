# Healthcare Data Provenance Backend

IPFS storage and blockchain integration backend for the Healthcare Data Provenance Platform.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- IPFS Desktop or IPFS CLI
- Running Hardhat blockchain node
- Deployed smart contracts

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup IPFS

**Option A: IPFS Desktop (Recommended for development)**

1. Download and install [IPFS Desktop](https://github.com/ipfs/ipfs-desktop)
2. Start IPFS Desktop
3. API runs on `http://127.0.0.1:5001`
4. Gateway runs on `http://127.0.0.1:8080`

**Option B: IPFS CLI**

```bash
# Install IPFS CLI
npm install -g ipfs

# Initialize IPFS
ipfs init

# Start IPFS daemon
ipfs daemon
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 4. Start Backend Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 📡 API Endpoints

### Health Check

```http
GET /api/health
```

### Dataset Management

#### Upload Dataset

```http
POST /api/upload-dataset
Content-Type: multipart/form-data

Fields:
- dataset: File (CSV, JSON, XML, TXT, PDF)
- metadata: JSON string with dataset information
- licenseTerms: String describing license terms
- price: Number (in ETH)
- providerAddress: Ethereum address of data provider
```

#### Get Dataset (Access Controlled)

```http
GET /api/dataset/:datasetId?userAddress=0x...
```

#### Get Dataset Info (Public)

```http
GET /api/dataset-info/:datasetId
```

#### List All Datasets

```http
GET /api/datasets
```

### License Management

#### Verify License

```http
GET /api/verify-license/:datasetId/:userAddress
```

#### Get User Licenses

```http
GET /api/user-licenses/:userAddress
```

## 🏗 Architecture

### Services

#### IPFS Service (`services/ipfsService.js`)

- File upload to IPFS
- File retrieval from IPFS
- JSON metadata handling
- File pinning for persistence
- Gateway URL generation

#### Blockchain Service (`services/blockchainService.js`)

- Smart contract interaction
- Dataset registration
- License verification
- User access control
- Transaction handling

### Middleware

#### Authentication (`middleware/auth.js`)

- JWT token validation (production)
- Wallet address validation
- Role-based access control

#### Validation (`middleware/validation.js`)

- File upload validation
- Input sanitization
- Parameter validation
- Data format checking

## 🔐 Security Features

- **File Type Validation**: Only allowed file types accepted
- **Size Limits**: 100MB maximum file size
- **Rate Limiting**: Prevents API abuse
- **Input Sanitization**: XSS protection
- **Access Control**: Blockchain-based license verification
- **CORS Protection**: Configured for frontend domains

## 🛠 Configuration

### Environment Variables

```bash
# Server
PORT=3001

# IPFS
IPFS_API_URL=http://127.0.0.1:5001
IPFS_GATEWAY_URL=http://127.0.0.1:8080

# Blockchain
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=0x...
DATASET_SBT_ADDRESS=0x...
MARKETPLACE_ADDRESS=0x...

# Security
JWT_SECRET=your-secret-key
ENCRYPTION_KEY=your-32-char-key

# Limits
MAX_FILE_SIZE=100MB
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 📊 File Flow

1. **Upload Request**: Frontend sends multipart form data
2. **Validation**: File type, size, and metadata validation
3. **IPFS Storage**: File uploaded to IPFS network
4. **Pinning**: File pinned for persistence
5. **Blockchain Registration**: IPFS hash stored on blockchain
6. **Response**: IPFS hash and transaction details returned

## 🔍 Access Control Flow

1. **Access Request**: User requests dataset download
2. **License Check**: Verify user has valid SBT license
3. **IPFS Retrieval**: Fetch file from IPFS if authorized
4. **Secure Delivery**: Stream file to authorized user

## 🧪 Testing

### Manual Testing with curl

#### Upload Dataset

```bash
curl -X POST http://localhost:3001/api/upload-dataset \
  -F "dataset=@test-file.csv" \
  -F "metadata={\"title\":\"Test Dataset\",\"description\":\"Sample data\"}" \
  -F "licenseTerms=Academic use only" \
  -F "price=0.1" \
  -F "providerAddress=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
```

#### Download Dataset

```bash
curl "http://localhost:3001/api/dataset/1?userAddress=0x70997970C51812dc3A010C7d01b50e0d17dc79C8" \
  -o downloaded-dataset.csv
```

## 🚀 Production Deployment

### Docker Setup (Future)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

### Environment Setup

- Use production IPFS node or Pinata/Infura
- Configure proper JWT secrets
- Enable HTTPS with reverse proxy
- Set up monitoring and logging

## 🔧 Troubleshooting

### Common Issues

#### IPFS Connection Failed

```bash
# Check IPFS daemon status
ipfs swarm peers

# Restart IPFS daemon
ipfs daemon
```

#### Blockchain Connection Failed

```bash
# Check Hardhat node is running
curl -X POST http://127.0.0.1:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

#### Contract Not Found

- Verify contract addresses in .env
- Ensure contracts are deployed
- Check network configuration

## 📝 API Response Examples

### Successful Upload

```json
{
  "success": true,
  "ipfsHash": "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
  "transactionHash": "0x123...abc",
  "datasetId": "1",
  "message": "Dataset uploaded to IPFS and registered on blockchain"
}
```

### Error Response

```json
{
  "error": "Upload failed",
  "details": "IPFS connection failed"
}
```

---

**Built for secure healthcare data sharing with IPFS and blockchain technology** 🏥⛓️
