const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const multer = require("multer");
const path = require("path");
const fs = require("fs-extra");
require("dotenv").config();

// Import our custom modules
const ipfsService = require("./services/ipfsService");
const blockchainService = require("./services/blockchainService");
const authMiddleware = require("./middleware/auth");
const { validateFileUpload } = require("./middleware/validation");

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api/", limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = "./uploads";
    await fs.ensureDir(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [".csv", ".json", ".xml", ".txt", ".pdf"];
    const fileExt = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(fileExt)) {
      return cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only CSV, JSON, XML, TXT, and PDF files are allowed."
        )
      );
    }
  },
});

// Routes

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// IPFS status check
app.get("/api/ipfs/status", async (req, res) => {
  try {
    const status = await ipfsService.getProviderStatus();
    const isHealthy = await ipfsService.isHealthy();

    res.json({
      ...status,
      healthy: isHealthy,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      provider: process.env.IPFS_PROVIDER || "unknown",
      status: "error",
      healthy: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Upload dataset to IPFS and register on blockchain
app.post(
  "/api/upload-dataset",
  upload.single("dataset"),
  validateFileUpload,
  async (req, res) => {
    try {
      const { metadata, licenseTerms, price, providerAddress } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      console.log("Uploading dataset to IPFS:", file.originalname);

      // Upload file to IPFS with encryption
      const uploadResult = await ipfsService.uploadFile(file.path, true); // Enable encryption
      console.log("IPFS Upload Result:", uploadResult);

      // Clean up temporary file
      await fs.unlink(file.path);

      // Store encryption key securely (in production, use proper key management)
      const encryptedMetadata = {
        ...JSON.parse(metadata),
        encrypted: uploadResult.encrypted,
        originalSize: uploadResult.originalSize,
        encryptedSize: uploadResult.fileSize,
      };

      // Register dataset on blockchain (encryption key stored off-chain for security)
      const txResult = await blockchainService.registerDataset(
        uploadResult.ipfsHash,
        JSON.stringify(encryptedMetadata),
        licenseTerms,
        price,
        providerAddress
      );

      res.json({
        success: true,
        ipfsHash: uploadResult.ipfsHash,
        transactionHash: txResult.hash,
        datasetId: txResult.datasetId,
        encrypted: uploadResult.encrypted,
        encryptionKey: uploadResult.encryptionKey, // In production, store this securely
        message:
          "Dataset uploaded to IPFS (encrypted) and registered on blockchain",
      });
    } catch (error) {
      console.error("Upload error:", error);

      // Clean up file if it exists
      if (req.file && req.file.path) {
        try {
          await fs.unlink(req.file.path);
        } catch (cleanupError) {
          console.error("File cleanup error:", cleanupError);
        }
      }

      res.status(500).json({
        error: "Upload failed",
        details: error.message,
      });
    }
  }
);

// Get dataset from IPFS (with access control)
app.get("/api/dataset/:datasetId", async (req, res) => {
  try {
    const { datasetId } = req.params;
    const { userAddress } = req.query;

    if (!userAddress) {
      return res.status(400).json({ error: "User address required" });
    }

    // Check if user has valid license
    const hasAccess = await blockchainService.canAccessDataset(
      userAddress,
      datasetId
    );

    if (!hasAccess) {
      return res.status(403).json({
        error: "Access denied",
        message: "You do not have a valid license for this dataset",
      });
    }

    // Get dataset info from blockchain
    const datasetInfo = await blockchainService.getDatasetInfo(datasetId);

    if (!datasetInfo || !datasetInfo.ipfsHash) {
      return res.status(404).json({ error: "Dataset not found" });
    }

    // Fetch file from IPFS
    const fileData = await ipfsService.getFile(datasetInfo.ipfsHash);

    // Set appropriate headers
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="dataset-${datasetId}"`
    );

    res.send(fileData);
  } catch (error) {
    console.error("Dataset retrieval error:", error);
    res.status(500).json({
      error: "Failed to retrieve dataset",
      details: error.message,
    });
  }
});

// Get dataset metadata (public info)
app.get("/api/dataset-info/:datasetId", async (req, res) => {
  try {
    const { datasetId } = req.params;

    const datasetInfo = await blockchainService.getDatasetInfo(datasetId);

    if (!datasetInfo) {
      return res.status(404).json({ error: "Dataset not found" });
    }

    // Return metadata without IPFS hash (for security)
    res.json({
      datasetId,
      metadata: datasetInfo.metadata,
      licenseTerms: datasetInfo.licenseTerms,
      provider: datasetInfo.provider,
      price: datasetInfo.price,
      isActive: datasetInfo.isActive,
      version: datasetInfo.version,
      createdAt: datasetInfo.createdAt,
    });
  } catch (error) {
    console.error("Dataset info error:", error);
    res.status(500).json({
      error: "Failed to retrieve dataset info",
      details: error.message,
    });
  }
});

// List all available datasets
app.get("/api/datasets", async (req, res) => {
  try {
    const datasets = await blockchainService.getAllDatasets();
    res.json(datasets);
  } catch (error) {
    console.error("Datasets listing error:", error);
    res.status(500).json({
      error: "Failed to retrieve datasets",
      details: error.message,
    });
  }
});

// Verify user license
app.get("/api/verify-license/:datasetId/:userAddress", async (req, res) => {
  try {
    const { datasetId, userAddress } = req.params;

    const hasLicense = await blockchainService.hasValidLicense(
      userAddress,
      datasetId
    );

    res.json({
      hasLicense,
      datasetId,
      userAddress,
    });
  } catch (error) {
    console.error("License verification error:", error);
    res.status(500).json({
      error: "Failed to verify license",
      details: error.message,
    });
  }
});

// Get user's licenses
app.get("/api/user-licenses/:userAddress", async (req, res) => {
  try {
    const { userAddress } = req.params;

    const licenses = await blockchainService.getUserLicenses(userAddress);

    res.json(licenses);
  } catch (error) {
    console.error("User licenses error:", error);
    res.status(500).json({
      error: "Failed to retrieve user licenses",
      details: error.message,
    });
  }
});

// Register user as dataset provider
app.post("/api/register-provider", async (req, res) => {
  try {
    const { userAddress } = req.body;

    if (!userAddress) {
      return res.status(400).json({ error: "User address required" });
    }

    // Check if already a provider
    const isProvider = await blockchainService.isDatasetProvider(userAddress);
    if (isProvider) {
      return res.json({
        success: true,
        message: "User is already a registered dataset provider",
        isProvider: true,
      });
    }

    // Register as provider
    const result = await blockchainService.registerAsProvider();

    res.json({
      success: true,
      message: "Successfully registered as dataset provider",
      transactionHash: result.hash,
      blockNumber: result.blockNumber,
      isProvider: true,
    });
  } catch (error) {
    console.error("Provider registration error:", error);
    res.status(500).json({
      error: "Failed to register as provider",
      details: error.message,
    });
  }
});

// Check if user is a dataset provider
app.get("/api/is-provider/:userAddress", async (req, res) => {
  try {
    const { userAddress } = req.params;

    const isProvider = await blockchainService.isDatasetProvider(userAddress);

    res.json({
      userAddress,
      isProvider,
      message: isProvider
        ? "User is a registered dataset provider"
        : "User is not a dataset provider",
    });
  } catch (error) {
    console.error("Provider check error:", error);
    res.status(500).json({
      error: "Failed to check provider status",
      details: error.message,
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);

  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "File too large" });
    }
  }

  res.status(500).json({
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development"
        ? error.message
        : "Something went wrong",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Start server
async function startServer() {
  try {
    // Initialize IPFS service (critical)
    await ipfsService.initialize();
    console.log("✅ IPFS Service initialized successfully");

    // Initialize blockchain service (optional for demo)
    try {
      await blockchainService.initialize();
      console.log("✅ Blockchain Service initialized successfully");
    } catch (blockchainError) {
      console.warn(
        "⚠️ Blockchain Service failed to initialize:",
        blockchainError.message
      );
      console.warn("⚠️ Server will continue without blockchain functionality");
    }

    app.listen(PORT, () => {
      console.log(`🚀 Healthcare Data Backend running on port ${PORT}`);
      console.log(`📁 IPFS Gateway: ${process.env.IPFS_GATEWAY_URL}`);
      console.log(
        `⛓️  Blockchain RPC: ${
          process.env.BLOCKCHAIN_RPC_URL || "Not connected"
        }`
      );
      console.log(`🌐 Frontend can connect at: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully");
  process.exit(0);
});

startServer();
