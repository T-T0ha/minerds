const { ethers } = require("ethers");

// Contract ABIs
const DATASET_SBT_ABI = [
  "function registerDataset(string memory _ipfsHash, string memory _metadata, string memory _licenseTerms, uint256 _price) external returns (uint256)",
  "function datasets(uint256) external view returns (string memory ipfsHash, string memory metadata, string memory licenseTerms, address provider, uint256 price, bool isActive, uint256 version, uint256 createdAt)",
  "function hasValidLicense(address _user, uint256 _datasetId) external view returns (bool)",
  "function getUserLicenses(address _user) external view returns (uint256[] memory)",
  "function registerAsProvider() external",
  "function isDatasetProvider(address _address) external view returns (bool)",
  "function setMarketplace(address _marketplace) external",
  "function DATASET_PROVIDER_ROLE() external view returns (bytes32)",
  "function datasetCounter() external view returns (uint256)",
  "event DatasetRegistered(uint256 indexed datasetId, address indexed provider, string ipfsHash)",
  "event LicenseIssued(uint256 indexed licenseId, uint256 indexed datasetId, address indexed licensee)",
];

const MARKETPLACE_ABI = [
  "function purchaseDatasetLicense(uint256 _datasetId, address _paymentToken, uint256 _licenseDuration) external payable",
  "function getDatasetInfo(uint256 _datasetId) external view returns (string memory ipfsHash, string memory metadata, string memory licenseTerms, address provider, uint256 price, bool isActive, uint256 version, uint256 createdAt)",
  "function canAccessDataset(address _user, uint256 _datasetId) external view returns (bool)",
  "function platformFee() external view returns (uint256)",
  "event DatasetPurchased(uint256 indexed purchaseId, uint256 indexed datasetId, address indexed buyer, uint256 amount, address paymentToken)",
];

class BlockchainService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.datasetSBTContract = null;
    this.marketplaceContract = null;
    this.isInitialized = false;
  }

  async initialize() {
    try {
      // Create provider
      this.provider = new ethers.JsonRpcProvider(
        process.env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:8545"
      );

      // Create signer with private key
      this.signer = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);

      // Create contract instances
      this.datasetSBTContract = new ethers.Contract(
        process.env.DATASET_SBT_ADDRESS,
        DATASET_SBT_ABI,
        this.signer
      );

      this.marketplaceContract = new ethers.Contract(
        process.env.MARKETPLACE_ADDRESS,
        MARKETPLACE_ABI,
        this.signer
      );

      // Test connection
      const network = await this.provider.getNetwork();
      const balance = await this.provider.getBalance(this.signer.address);

      console.log(
        "✅ Connected to blockchain network:",
        network.name || "localhost"
      );
      console.log("💰 Signer balance:", ethers.formatEther(balance), "ETH");
      console.log("📋 DatasetSBT Contract:", process.env.DATASET_SBT_ADDRESS);
      console.log("🏪 Marketplace Contract:", process.env.MARKETPLACE_ADDRESS);

      this.isInitialized = true;
    } catch (error) {
      console.error("❌ Blockchain initialization failed:", error.message);
      throw new Error("Blockchain connection failed");
    }
  }

  async registerDataset(
    ipfsHash,
    metadata,
    licenseTerms,
    price,
    providerAddress
  ) {
    if (!this.isInitialized) {
      throw new Error("Blockchain service not initialized");
    }

    try {
      console.log("📝 Registering dataset on blockchain...");

      // Convert price to wei
      const priceWei = ethers.parseEther(price.toString());

      // Call registerDataset function
      const tx = await this.datasetSBTContract.registerDataset(
        ipfsHash,
        metadata,
        licenseTerms,
        priceWei
      );

      console.log("⏳ Transaction submitted:", tx.hash);

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log("✅ Transaction confirmed:", receipt.hash);

      // Extract dataset ID from event logs
      const event = receipt.logs.find((log) => {
        try {
          const parsedLog = this.datasetSBTContract.interface.parseLog(log);
          return parsedLog.name === "DatasetRegistered";
        } catch (e) {
          return false;
        }
      });

      let datasetId = null;
      if (event) {
        const parsedLog = this.datasetSBTContract.interface.parseLog(event);
        datasetId = parsedLog.args.datasetId.toString();
      }

      return {
        hash: receipt.hash,
        datasetId,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
      };
    } catch (error) {
      console.error("❌ Dataset registration failed:", error);
      throw new Error(`Dataset registration failed: ${error.message}`);
    }
  }

  async getDatasetInfo(datasetId) {
    if (!this.isInitialized) {
      throw new Error("Blockchain service not initialized");
    }

    try {
      const result = await this.datasetSBTContract.datasets(datasetId);

      return {
        ipfsHash: result.ipfsHash,
        metadata: result.metadata,
        licenseTerms: result.licenseTerms,
        provider: result.provider,
        price: ethers.formatEther(result.price),
        isActive: result.isActive,
        version: result.version.toString(),
        createdAt: new Date(Number(result.createdAt) * 1000).toISOString(),
      };
    } catch (error) {
      console.error("❌ Failed to get dataset info:", error);
      throw new Error(`Failed to get dataset info: ${error.message}`);
    }
  }

  async hasValidLicense(userAddress, datasetId) {
    if (!this.isInitialized) {
      throw new Error("Blockchain service not initialized");
    }

    try {
      return await this.datasetSBTContract.hasValidLicense(
        userAddress,
        datasetId
      );
    } catch (error) {
      console.error("❌ License check failed:", error);
      throw new Error(`License check failed: ${error.message}`);
    }
  }

  async canAccessDataset(userAddress, datasetId) {
    if (!this.isInitialized) {
      throw new Error("Blockchain service not initialized");
    }

    try {
      return await this.marketplaceContract.canAccessDataset(
        userAddress,
        datasetId
      );
    } catch (error) {
      console.error("❌ Access check failed:", error);
      throw new Error(`Access check failed: ${error.message}`);
    }
  }

  async getUserLicenses(userAddress) {
    if (!this.isInitialized) {
      throw new Error("Blockchain service not initialized");
    }

    try {
      const licenseIds = await this.datasetSBTContract.getUserLicenses(
        userAddress
      );

      // Get detailed info for each license
      const licenses = [];
      for (const licenseId of licenseIds) {
        try {
          const datasetInfo = await this.getDatasetInfo(licenseId);
          licenses.push({
            licenseId: licenseId.toString(),
            ...datasetInfo,
          });
        } catch (error) {
          console.warn(
            `Failed to get info for license ${licenseId}:`,
            error.message
          );
        }
      }

      return licenses;
    } catch (error) {
      console.error("❌ Failed to get user licenses:", error);
      throw new Error(`Failed to get user licenses: ${error.message}`);
    }
  }

  async getAllDatasets() {
    if (!this.isInitialized) {
      throw new Error("Blockchain service not initialized");
    }

    try {
      // Get total number of datasets
      const counter = await this.datasetSBTContract.datasetCounter();
      const totalDatasets = Number(counter);

      console.log(`📊 Dataset counter: ${totalDatasets}`);

      const datasets = [];

      // Fetch all datasets (starting from ID 1)
      for (let i = 1; i <= totalDatasets; i++) {
        try {
          console.log(`🔍 Fetching dataset ${i}...`);
          const datasetInfo = await this.getDatasetInfo(i);
          console.log(`📋 Dataset ${i} info:`, datasetInfo);

          if (datasetInfo.isActive) {
            console.log(`✅ Dataset ${i} is active, adding to list`);
            datasets.push({
              datasetId: i,
              ...datasetInfo,
            });
          } else {
            console.log(`❌ Dataset ${i} is inactive, skipping`);
          }
        } catch (error) {
          console.warn(`Failed to get dataset ${i}:`, error.message);
        }
      }

      console.log(`📦 Total datasets returned: ${datasets.length}`);
      return datasets;
    } catch (error) {
      console.error("❌ Failed to get all datasets:", error);
      throw new Error(`Failed to get all datasets: ${error.message}`);
    }
  }

  async grantProviderRole(providerAddress) {
    if (!this.isInitialized) {
      throw new Error("Blockchain service not initialized");
    }

    try {
      const tx = await this.datasetSBTContract.grantDatasetProviderRole(
        providerAddress
      );
      const receipt = await tx.wait();

      return {
        hash: receipt.hash,
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      console.error("❌ Failed to grant provider role:", error);
      throw new Error(`Failed to grant provider role: ${error.message}`);
    }
  }

  async registerAsProvider(userAddress = null) {
    if (!this.isInitialized) {
      throw new Error("Blockchain service not initialized");
    }

    try {
      // If userAddress is provided, we're doing it on behalf of them (admin action)
      // Otherwise, use the service's signer (self-registration)
      const contract = userAddress
        ? this.datasetSBTContract.connect(this.provider.getSigner(userAddress))
        : this.datasetSBTContract;

      const tx = await contract.registerAsProvider();
      const receipt = await tx.wait();

      return {
        hash: receipt.hash,
        blockNumber: receipt.blockNumber,
        address: userAddress || this.signer.address,
      };
    } catch (error) {
      console.error("❌ Failed to register as provider:", error);
      throw new Error(`Failed to register as provider: ${error.message}`);
    }
  }

  async isDatasetProvider(address) {
    if (!this.isInitialized) {
      throw new Error("Blockchain service not initialized");
    }

    try {
      return await this.datasetSBTContract.isDatasetProvider(address);
    } catch (error) {
      console.error("❌ Failed to check provider status:", error);
      throw new Error(`Failed to check provider status: ${error.message}`);
    }
  }

  async getBlockchainInfo() {
    if (!this.isInitialized) {
      throw new Error("Blockchain service not initialized");
    }

    try {
      const network = await this.provider.getNetwork();
      const blockNumber = await this.provider.getBlockNumber();
      const balance = await this.provider.getBalance(this.signer.address);

      return {
        network: {
          name: network.name,
          chainId: network.chainId.toString(),
        },
        blockNumber,
        signerAddress: this.signer.address,
        signerBalance: ethers.formatEther(balance),
        contracts: {
          datasetSBT: process.env.DATASET_SBT_ADDRESS,
          marketplace: process.env.MARKETPLACE_ADDRESS,
        },
      };
    } catch (error) {
      console.error("❌ Failed to get blockchain info:", error);
      throw new Error(`Failed to get blockchain info: ${error.message}`);
    }
  }

  async isHealthy() {
    try {
      if (!this.isInitialized) return false;

      await this.provider.getBlockNumber();
      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = new BlockchainService();
