# Team Setup Guide for Minerds Healthcare Data Provenance Platform

## Overview

This guide helps your team set up the project for testing from multiple locations using different IPFS providers.

## Quick Start Options

### Option 1: Pinata Cloud IPFS (Recommended for Team Testing)

**Best for:** Team members testing from different locations without local IPFS setup

#### Setup Steps:

1. **Get Pinata Account:**

   - Visit [pinata.cloud](https://pinata.cloud)
   - Sign up for free account (1GB free storage)
   - Go to API Keys section
   - Generate new JWT token

2. **Configure Environment:**

   ```bash
   # In backend/.env file
   IPFS_PROVIDER=pinata
   PINATA_JWT=your_jwt_token_here
   PINATA_GATEWAY=https://gateway.pinata.cloud
   ```

3. **Benefits:**
   - ✅ No local IPFS installation needed
   - ✅ Global accessibility
   - ✅ Automatic file pinning
   - ✅ Web dashboard for file management
   - ✅ Fast CDN delivery

### Option 2: Infura IPFS

**Best for:** Teams wanting enterprise-grade infrastructure

#### Setup Steps:

1. **Get Infura Account:**

   - Visit [infura.io](https://infura.io)
   - Sign up and create new project
   - Select IPFS service
   - Get Project ID and Secret

2. **Configure Environment:**
   ```bash
   # In backend/.env file
   IPFS_PROVIDER=infura
   INFURA_PROJECT_ID=your_project_id
   INFURA_PROJECT_SECRET=your_project_secret
   INFURA_ENDPOINT=https://ipfs.infura.io:5001
   ```

### Option 3: Local IPFS Node

**Best for:** Development and testing with full control

#### Setup Steps:

1. **Install IPFS:**

   ```bash
   # Download from https://ipfs.tech/install/
   # Or use package manager:
   npm install -g ipfs
   ```

2. **Initialize and Start:**

   ```bash
   ipfs init
   ipfs daemon
   ```

3. **Configure Environment:**
   ```bash
   # In backend/.env file
   IPFS_PROVIDER=local
   IPFS_API_URL=http://127.0.0.1:5001
   IPFS_GATEWAY_URL=http://127.0.0.1:8080
   ```

## Project Setup for Team Members

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd "Minerds Prototype"
```

### 2. Backend Setup

```bash
cd backend
npm install
```

### 3. Configure Environment

Create `.env` file in backend folder:

```bash
# Blockchain Configuration
HARDHAT_NETWORK=localhost
CONTRACT_ADDRESS=<deployed_contract_address>

# Choose ONE IPFS provider configuration:

# Option A: Pinata (Recommended for team testing)
IPFS_PROVIDER=pinata
PINATA_JWT=your_pinata_jwt_token
PINATA_GATEWAY=https://gateway.pinata.cloud

# Option B: Infura
# IPFS_PROVIDER=infura
# INFURA_PROJECT_ID=your_project_id
# INFURA_PROJECT_SECRET=your_project_secret

# Option C: Local IPFS
# IPFS_PROVIDER=local
# IPFS_API_URL=http://127.0.0.1:5001
# IPFS_GATEWAY_URL=http://127.0.0.1:8080

# Security
ENCRYPTION_KEY=your-32-character-encryption-key
JWT_SECRET=your-jwt-secret-for-api

# Server Configuration
PORT=3001
```

### 4. Blockchain Setup

```bash
cd ../blockchain
npm install
npx hardhat node  # Start local blockchain
```

### 5. Deploy Contracts

```bash
# In another terminal
npx hardhat run scripts/deploy.js --network localhost
```

### 6. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev  # Start development server
```

### 7. Start Backend

```bash
cd ../backend
npm start
```

## Testing the Setup

### 1. Check IPFS Connection

Visit `http://localhost:3001/api/ipfs/status` to verify IPFS provider connection.

### 2. Test File Upload

1. Open frontend at `http://localhost:5173`
2. Connect MetaMask wallet
3. Upload a test dataset
4. Verify file appears in IPFS (check Pinata dashboard if using Pinata)

### 3. Test Cross-Team Access

- Team member A uploads dataset
- Team member B should be able to access the same IPFS hash
- Verify through IPFS gateway URLs

## IPFS Provider Comparison

| Feature          | Local IPFS       | Pinata       | Infura     |
| ---------------- | ---------------- | ------------ | ---------- |
| Setup Complexity | High             | Low          | Medium     |
| Global Access    | No               | Yes          | Yes        |
| Free Tier        | Unlimited        | 1GB          | 5GB        |
| Web Dashboard    | No               | Yes          | Yes        |
| CDN Delivery     | No               | Yes          | Yes        |
| Reliability      | Depends on local | High         | Very High  |
| Best For         | Development      | Team Testing | Production |

## Troubleshooting

### Common Issues:

1. **IPFS Connection Failed**

   - Check provider credentials in `.env`
   - Verify internet connection
   - Try different provider

2. **File Upload Fails**

   - Check file size limits
   - Verify encryption is working
   - Check backend logs

3. **MetaMask Connection Issues**
   - Ensure local blockchain is running
   - Check network configuration
   - Import test accounts from Hardhat

### Support Commands:

```bash
# Check IPFS status
curl http://localhost:3001/api/ipfs/status

# View backend logs
cd backend && npm start

# Reset Hardhat accounts
cd blockchain && npx hardhat clean
```

## Security Notes

- **Never commit** `.env` files with real API keys
- Use **test accounts only** for development
- **Encrypt sensitive data** before IPFS upload
- **Rotate API keys** regularly for production

## Team Collaboration Tips

1. **Share Environment Template:** Create `.env.example` with dummy values
2. **Use Pinata for Testing:** Most reliable for distributed team testing
3. **Document Contract Addresses:** Share deployed contract addresses in team chat
4. **Monitor IPFS Usage:** Check storage limits on cloud providers

## Next Steps

1. **Choose your IPFS provider** based on team needs
2. **Set up shared Pinata account** for team testing (recommended)
3. **Deploy to testnet** for broader testing
4. **Configure CI/CD** for automated deployments

For questions or issues, check the project documentation or create an issue in the repository.
