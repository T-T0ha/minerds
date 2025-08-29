// Contract addresses - Polygon Amoy Testnet (Updated)
export const CONTRACT_ADDRESSES = {
  DATASET_SBT: "0x2Bd44D8b04c8A6d4fFeA6E209b24157DE9C17efA", // Polygon Amoy (New)
  MARKETPLACE: "0x7ba515227AD1eC6d9Fb70c0fE72531c438911F14", // Polygon Amoy (New)
};

// Network configuration - Polygon Amoy Testnet
export const NETWORK_CONFIG = {
  chainId: 80002, // Polygon Amoy testnet
  chainName: "Polygon Amoy Testnet",
  nativeCurrency: {
    name: "MATIC",
    symbol: "MATIC",
    decimals: 18,
  },
  rpcUrls: ["https://polygon-amoy.g.alchemy.com/v2/KfUG5RUwO2iaiZq8P_r3E"],
  blockExplorerUrls: ["https://amoy.polygonscan.com/"],
};

// Simplified ABI for frontend use (Updated with SBT functions)
export const DATASET_SBT_ABI = [
  "function registerAsProvider() external",
  "function isDatasetProvider(address _address) external view returns (bool)",
  "function registerDataset(string memory _ipfsHash, string memory _metadata, string memory _licenseTerms, uint256 _price) external returns (uint256)",
  "function datasets(uint256) external view returns (string memory ipfsHash, string memory metadata, string memory licenseTerms, address provider, uint256 price, bool isActive, uint256 version, uint256 createdAt)",
  "function hasValidLicense(address _user, uint256 _datasetId) external view returns (bool)",
  "function getUserLicenses(address _user) external view returns (uint256[] memory)",
  "function issueLicense(uint256 _datasetId, address _licensee, uint256 _duration) external returns (uint256)",
  "function setMarketplace(address _marketplace) external",
  "function datasetCounter() external view returns (uint256)",
  "function licenseCounter() external view returns (uint256)",
  "function isDatasetSBTized(uint256 _datasetId) external view returns (bool)",
  "function getDatasetOwner(uint256 _datasetId) external view returns (address)",
  "function balanceOf(address account, uint256 id) external view returns (uint256)",
  "function licenses(uint256) external view returns (uint256 datasetId, address licensee, uint256 issuedAt, uint256 expiresAt, bool isActive)",
  "event DatasetRegistered(uint256 indexed datasetId, address indexed provider, string ipfsHash)",
  "event LicenseIssued(uint256 indexed licenseId, uint256 indexed datasetId, address indexed licensee)",
  "event ProviderRegistered(address indexed provider)",
];

export const MARKETPLACE_ABI = [
  "function purchaseDatasetLicense(uint256 _datasetId, address _paymentToken, uint256 _licenseDuration) external payable",
  "function getDatasetInfo(uint256 _datasetId) external view returns (string memory ipfsHash, string memory metadata, string memory licenseTerms, address provider, uint256 price, bool isActive, uint256 version, uint256 createdAt)",
  "function canAccessDataset(address _user, uint256 _datasetId) external view returns (bool)",
  "function platformFee() external view returns (uint256)",
  "event DatasetPurchased(uint256 indexed purchaseId, uint256 indexed datasetId, address indexed buyer, uint256 amount, address paymentToken)",
];
