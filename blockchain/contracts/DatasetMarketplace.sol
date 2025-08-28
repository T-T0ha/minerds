// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./DatasetSBT.sol";

/**
 * @title DatasetMarketplace
 * @dev Marketplace for licensing healthcare datasets
 */
contract DatasetMarketplace is ReentrancyGuard, Ownable {
    DatasetSBT public datasetSBT;
    
    // Supported payment tokens (stablecoins)
    mapping(address => bool) public supportedTokens;
    
    // Platform fee (in basis points, e.g., 250 = 2.5%)
    uint256 public platformFee = 250;
    uint256 public constant MAX_FEE = 1000; // 10% max
    
    // Marketplace earnings
    mapping(address => uint256) public platformEarnings;

    struct PurchaseRecord {
        uint256 datasetId;
        address buyer;
        uint256 amount;
        address paymentToken;
        uint256 timestamp;
    }

    mapping(uint256 => PurchaseRecord) public purchases;
    uint256 private _purchaseIdCounter;

    // Events
    event DatasetPurchased(
        uint256 indexed purchaseId,
        uint256 indexed datasetId,
        address indexed buyer,
        uint256 amount,
        address paymentToken
    );
    
    event PaymentTokenUpdated(address token, bool supported);
    event PlatformFeeUpdated(uint256 newFee);

    constructor(address _datasetSBT) Ownable(msg.sender) {
        datasetSBT = DatasetSBT(_datasetSBT);
    }

    /**
     * @dev Purchase dataset license
     */
    function purchaseDatasetLicense(
        uint256 _datasetId,
        address _paymentToken,
        uint256 _licenseDuration
    ) external payable nonReentrant {
        (,,,address provider, uint256 price, bool isActive,,) = datasetSBT.datasets(_datasetId);
        
        require(isActive, "Dataset not active");
        require(price > 0, "Invalid price");
        require(_licenseDuration > 0, "Invalid duration");

        uint256 totalAmount;
        
        if (_paymentToken == address(0)) {
            // ETH/MATIC payment
            require(msg.value >= price, "Insufficient payment");
            totalAmount = msg.value;
        } else {
            // ERC20 token payment
            require(supportedTokens[_paymentToken], "Payment token not supported");
            require(IERC20(_paymentToken).transferFrom(msg.sender, address(this), price), 
                    "Token transfer failed");
            totalAmount = price;
        }

        // Calculate platform fee
        uint256 fee = (totalAmount * platformFee) / 10000;
        uint256 providerAmount = totalAmount - fee;

        // Transfer payment to provider
        if (_paymentToken == address(0)) {
            payable(provider).transfer(providerAmount);
            platformEarnings[address(0)] += fee;
        } else {
            require(IERC20(_paymentToken).transfer(provider, providerAmount), 
                    "Provider payment failed");
            platformEarnings[_paymentToken] += fee;
        }

        // Issue license SBT
        uint256 licenseId = datasetSBT.issueLicense(_datasetId, msg.sender, _licenseDuration);

        // Record purchase
        uint256 purchaseId = _purchaseIdCounter++;
        purchases[purchaseId] = PurchaseRecord({
            datasetId: _datasetId,
            buyer: msg.sender,
            amount: totalAmount,
            paymentToken: _paymentToken,
            timestamp: block.timestamp
        });

        emit DatasetPurchased(purchaseId, _datasetId, msg.sender, totalAmount, _paymentToken);
    }

    /**
     * @dev Get dataset info for marketplace display
     */
    function getDatasetInfo(uint256 _datasetId) external view returns (
        string memory ipfsHash,
        string memory metadata,
        string memory licenseTerms,
        address provider,
        uint256 price,
        bool isActive,
        uint256 version,
        uint256 createdAt
    ) {
        return datasetSBT.datasets(_datasetId);
    }

    /**
     * @dev Check if user can access dataset
     */
    function canAccessDataset(address _user, uint256 _datasetId) external view returns (bool) {
        return datasetSBT.hasValidLicense(_user, _datasetId);
    }

    /**
     * @dev Add/remove supported payment token
     */
    function updatePaymentToken(address _token, bool _supported) external onlyOwner {
        supportedTokens[_token] = _supported;
        emit PaymentTokenUpdated(_token, _supported);
    }

    /**
     * @dev Update platform fee
     */
    function updatePlatformFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= MAX_FEE, "Fee too high");
        platformFee = _newFee;
        emit PlatformFeeUpdated(_newFee);
    }

    /**
     * @dev Withdraw platform earnings
     */
    function withdrawEarnings(address _token) external onlyOwner {
        uint256 amount = platformEarnings[_token];
        require(amount > 0, "No earnings to withdraw");
        
        platformEarnings[_token] = 0;
        
        if (_token == address(0)) {
            payable(owner()).transfer(amount);
        } else {
            require(IERC20(_token).transfer(owner(), amount), "Withdrawal failed");
        }
    }

    /**
     * @dev Emergency withdrawal
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    receive() external payable {}
}
