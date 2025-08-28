const jwt = require("jsonwebtoken");

// Middleware for authentication (placeholder for future implementation)
const authenticateToken = (req, res, next) => {
  // For now, we'll skip JWT authentication in development
  // In production, implement proper JWT token validation

  if (process.env.NODE_ENV === "production") {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Access token required" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ error: "Invalid token" });
      }
      req.user = user;
      next();
    });
  } else {
    // Development mode - skip authentication
    next();
  }
};

// Middleware for wallet address validation
const validateWalletAddress = (req, res, next) => {
  const { providerAddress } = req.body;
  const { userAddress } = req.params;

  const address = providerAddress || userAddress;

  if (address && !isValidEthereumAddress(address)) {
    return res.status(400).json({
      error: "Invalid Ethereum address format",
    });
  }

  next();
};

// Helper function to validate Ethereum address
const isValidEthereumAddress = (address) => {
  const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  return ethAddressRegex.test(address);
};

// Middleware for role-based access control
const requireProviderRole = async (req, res, next) => {
  try {
    const { providerAddress } = req.body;

    if (!providerAddress) {
      return res.status(400).json({
        error: "Provider address required",
      });
    }

    // In a real implementation, you would check if the address has provider role
    // For now, we'll allow all addresses in development
    if (process.env.NODE_ENV !== "production") {
      return next();
    }

    // TODO: Implement blockchain-based role verification
    // const blockchainService = require('../services/blockchainService');
    // const hasRole = await blockchainService.hasProviderRole(providerAddress);
    // if (!hasRole) {
    //   return res.status(403).json({ error: 'Provider role required' });
    // }

    next();
  } catch (error) {
    res.status(500).json({
      error: "Role verification failed",
      details: error.message,
    });
  }
};

module.exports = {
  authenticateToken,
  validateWalletAddress,
  requireProviderRole,
  isValidEthereumAddress,
};
