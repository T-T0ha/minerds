// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title DatasetSBT
 * @dev Soul-Bound Token (SBT) for healthcare datasets
 * Non-transferable tokens representing dataset licenses
 */
contract DatasetSBT is ERC1155, AccessControl {
    using Strings for uint256;

    bytes32 public constant DATASET_PROVIDER_ROLE = keccak256("DATASET_PROVIDER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    struct Dataset {
        string ipfsHash;        // IPFS hash of the dataset
        string metadata;        // JSON metadata
        string licenseTerms;    // License terms
        address provider;       // Dataset provider
        uint256 price;          // Price in wei
        bool isActive;          // Dataset status
        uint256 version;        // Dataset version
        uint256 createdAt;      // Creation timestamp
    }

    struct License {
        uint256 datasetId;      // Dataset ID
        address licensee;       // License holder
        uint256 issuedAt;       // Issue timestamp
        uint256 expiresAt;      // Expiration timestamp
        bool isActive;          // License status
    }

    // Mappings
    mapping(uint256 => Dataset) public datasets;
    mapping(uint256 => License) public licenses;
    mapping(address => uint256[]) public userLicenses;
    
    uint256 private _datasetIdCounter;
    uint256 private _licenseIdCounter;

    // Events
    event DatasetRegistered(uint256 indexed datasetId, address indexed provider, string ipfsHash);
    event LicenseIssued(uint256 indexed licenseId, uint256 indexed datasetId, address indexed licensee);
    event DatasetUpdated(uint256 indexed datasetId, string newIpfsHash, uint256 version);

    constructor() ERC1155("") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(DATASET_PROVIDER_ROLE, msg.sender); // Allow deployer to be a provider
    }

    /**
     * @dev Set marketplace contract address and grant it admin role
     */
    function setMarketplace(address _marketplace) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(ADMIN_ROLE, _marketplace);
    }

    /**
     * @dev Allow users to register as dataset providers (self-registration)
     */
    function registerAsProvider() external {
        _grantRole(DATASET_PROVIDER_ROLE, msg.sender);
    }

    /**
     * @dev Check if address has provider role
     */
    function isDatasetProvider(address _address) external view returns (bool) {
        return hasRole(DATASET_PROVIDER_ROLE, _address);
    }

    /**
     * @dev Register a new dataset
     */
    function registerDataset(
        string memory _ipfsHash,
        string memory _metadata,
        string memory _licenseTerms,
        uint256 _price
    ) external onlyRole(DATASET_PROVIDER_ROLE) returns (uint256) {
        uint256 datasetId = _datasetIdCounter++;
        
        datasets[datasetId] = Dataset({
            ipfsHash: _ipfsHash,
            metadata: _metadata,
            licenseTerms: _licenseTerms,
            provider: msg.sender,
            price: _price,
            isActive: true,
            version: 1,
            createdAt: block.timestamp
        });

        emit DatasetRegistered(datasetId, msg.sender, _ipfsHash);
        return datasetId;
    }

    /**
     * @dev Issue a license for a dataset (called by marketplace)
     */
    function issueLicense(
        uint256 _datasetId,
        address _licensee,
        uint256 _duration
    ) external onlyRole(ADMIN_ROLE) returns (uint256) {
        require(datasets[_datasetId].isActive, "Dataset not active");
        
        uint256 licenseId = _licenseIdCounter++;
        uint256 expiresAt = block.timestamp + _duration;
        
        licenses[licenseId] = License({
            datasetId: _datasetId,
            licensee: _licensee,
            issuedAt: block.timestamp,
            expiresAt: expiresAt,
            isActive: true
        });

        userLicenses[_licensee].push(licenseId);
        
        // Mint SBT to licensee
        _mint(_licensee, licenseId, 1, "");
        
        emit LicenseIssued(licenseId, _datasetId, _licensee);
        return licenseId;
    }

    /**
     * @dev Update dataset with new version
     */
    function updateDataset(
        uint256 _datasetId,
        string memory _newIpfsHash,
        string memory _newMetadata
    ) external {
        require(datasets[_datasetId].provider == msg.sender, "Not dataset provider");
        
        datasets[_datasetId].ipfsHash = _newIpfsHash;
        datasets[_datasetId].metadata = _newMetadata;
        datasets[_datasetId].version++;
        
        emit DatasetUpdated(_datasetId, _newIpfsHash, datasets[_datasetId].version);
    }

    /**
     * @dev Check if user has valid license for dataset
     */
    function hasValidLicense(address _user, uint256 _datasetId) external view returns (bool) {
        uint256[] memory userLicenseIds = userLicenses[_user];
        
        for (uint256 i = 0; i < userLicenseIds.length; i++) {
            License memory license = licenses[userLicenseIds[i]];
            if (license.datasetId == _datasetId && 
                license.isActive && 
                license.expiresAt > block.timestamp) {
                return true;
            }
        }
        return false;
    }

    /**
     * @dev Get user's licenses
     */
    function getUserLicenses(address _user) external view returns (uint256[] memory) {
        return userLicenses[_user];
    }

    /**
     * @dev Override transfer functions to make tokens non-transferable (SBT)
     */
    function safeTransferFrom(
        address,
        address,
        uint256,
        uint256,
        bytes memory
    ) public pure override {
        revert("SBT: Transfer not allowed");
    }

    function safeBatchTransferFrom(
        address,
        address,
        uint256[] memory,
        uint256[] memory,
        bytes memory
    ) public pure override {
        revert("SBT: Transfer not allowed");
    }

    /**
     * @dev Grant dataset provider role
     */
    function grantDatasetProviderRole(address _provider) external onlyRole(ADMIN_ROLE) {
        _grantRole(DATASET_PROVIDER_ROLE, _provider);
    }

    // Required override
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
