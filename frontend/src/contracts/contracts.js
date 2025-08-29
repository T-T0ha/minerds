// Contract addresses - Update these after deployment
export const CONTRACT_ADDRESSES = {
  DATASET_SBT: "0x5FbDB2315678afecb367f032d93F642f64180aa3", // Update after deployment
  MARKETPLACE: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512", // Update after deployment
};

// Network configuration
export const NETWORK_CONFIG = {
  chainId: 1337, // Hardhat local network
  chainName: "Hardhat Local",
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: ["http://127.0.0.1:8545"],
  blockExplorerUrls: [""],
};

// Simplified ABI for frontend use
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
