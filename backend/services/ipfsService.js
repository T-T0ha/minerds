const fs = require("fs-extra");
const path = require("path");
const FormData = require("form-data");
const axios = require("axios");
const encryptionService = require("./encryptionService");

class IPFSService {
  constructor() {
    this.isInitialized = false;
    this.provider = process.env.IPFS_PROVIDER || "local";
    this.pinataJWT = process.env.PINATA_JWT;
    this.pinataGateway =
      process.env.PINATA_GATEWAY_URL || "https://gateway.pinata.cloud";
  }

  async initialize() {
    try {
      if (this.provider === "pinata") {
        await this.initializePinata();
      } else {
        throw new Error(
          `Provider ${this.provider} not supported in this simplified version. Use Pinata for team testing.`
        );
      }

      this.isInitialized = true;
      console.log(
        `✅ IPFS Service initialized with provider: ${this.provider}`
      );
    } catch (error) {
      console.error("❌ Failed to initialize IPFS:", error.message);
      throw new Error("IPFS initialization failed");
    }
  }

  async initializePinata() {
    if (!this.pinataJWT) {
      throw new Error("PINATA_JWT environment variable is required");
    }

    // Test Pinata connection
    const response = await axios.get(
      "https://api.pinata.cloud/data/testAuthentication",
      {
        headers: {
          Authorization: `Bearer ${this.pinataJWT}`,
        },
      }
    );

    console.log("✅ Connected to Pinata IPFS:", response.data.message);
  }

  async uploadFile(filePath, encrypt = true) {
    if (!this.isInitialized) {
      throw new Error("IPFS service not initialized");
    }

    try {
      console.log("📤 Uploading file to IPFS:", filePath);

      // Read file
      const fileBuffer = await fs.readFile(filePath);
      let uploadData = fileBuffer;
      let encryptionKey = null;

      // Encrypt file if requested
      if (encrypt) {
        console.log("🔐 Encrypting file before IPFS upload...");
        const encryptionResult = encryptionService.encryptFile(fileBuffer);
        uploadData = encryptionResult.encryptedData;
        encryptionKey = encryptionResult.keyHex;
        console.log("✅ File encrypted successfully");
      }

      // Upload to Pinata
      const ipfsHash = await this.uploadToPinata(
        uploadData,
        path.basename(filePath)
      );
      console.log("✅ File uploaded to IPFS:", ipfsHash);

      return {
        ipfsHash,
        encryptionKey, // null if not encrypted
        fileSize: uploadData.length,
        originalSize: fileBuffer.length,
        encrypted: encrypt,
        provider: this.provider,
      };
    } catch (error) {
      console.error("❌ IPFS upload failed:", error);
      throw new Error(`IPFS upload failed: ${error.message}`);
    }
  }

  async uploadToPinata(data, filename) {
    const formData = new FormData();
    formData.append("file", data, filename);

    const pinataMetadata = JSON.stringify({
      name: filename,
      keyvalues: {
        uploadedAt: new Date().toISOString(),
        encrypted: "true",
      },
    });
    formData.append("pinataMetadata", pinataMetadata);

    const pinataOptions = JSON.stringify({
      cidVersion: 0,
    });
    formData.append("pinataOptions", pinataOptions);

    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        headers: {
          "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
          Authorization: `Bearer ${this.pinataJWT}`,
        },
      }
    );

    return response.data.IpfsHash;
  }

  async uploadJSON(data) {
    if (!this.isInitialized) {
      throw new Error("IPFS service not initialized");
    }

    try {
      const jsonString = JSON.stringify(data, null, 2);

      const formData = new FormData();
      formData.append("file", Buffer.from(jsonString, "utf8"), "metadata.json");

      const pinataMetadata = JSON.stringify({
        name: "metadata.json",
        keyvalues: {
          type: "metadata",
          uploadedAt: new Date().toISOString(),
        },
      });
      formData.append("pinataMetadata", pinataMetadata);

      const response = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          headers: {
            "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
            Authorization: `Bearer ${this.pinataJWT}`,
          },
        }
      );

      const ipfsHash = response.data.IpfsHash;
      console.log("✅ JSON uploaded to IPFS:", ipfsHash);

      return ipfsHash;
    } catch (error) {
      console.error("❌ IPFS JSON upload failed:", error);
      throw new Error(`IPFS JSON upload failed: ${error.message}`);
    }
  }

  async getFile(ipfsHash, decryptionKey = null) {
    if (!this.isInitialized) {
      throw new Error("IPFS service not initialized");
    }

    try {
      console.log("📥 Retrieving file from IPFS:", ipfsHash);

      // Use Pinata gateway for retrieval
      const response = await axios.get(
        `${this.pinataGateway}/ipfs/${ipfsHash}`,
        {
          responseType: "arraybuffer",
          timeout: 30000, // 30 second timeout
        }
      );

      let fileBuffer = Buffer.from(response.data);
      console.log(
        "✅ File retrieved from IPFS, size:",
        fileBuffer.length,
        "bytes"
      );

      // Decrypt file if key is provided
      if (decryptionKey) {
        console.log("🔓 Decrypting file...");
        fileBuffer = encryptionService.decryptFile(fileBuffer, decryptionKey);
        console.log(
          "✅ File decrypted successfully, original size:",
          fileBuffer.length,
          "bytes"
        );
      }

      return fileBuffer;
    } catch (error) {
      console.error("❌ IPFS retrieval failed:", error);
      throw new Error(`IPFS retrieval failed: ${error.message}`);
    }
  }

  async getJSON(ipfsHash) {
    try {
      const file = await this.getFile(ipfsHash);
      const jsonString = file.toString("utf8");
      return JSON.parse(jsonString);
    } catch (error) {
      console.error("❌ IPFS JSON retrieval failed:", error);
      throw new Error(`IPFS JSON retrieval failed: ${error.message}`);
    }
  }

  async pinFile(ipfsHash) {
    // Files uploaded to Pinata are automatically pinned
    console.log("📌 File automatically pinned on Pinata:", ipfsHash);
  }

  async unpinFile(ipfsHash) {
    try {
      await axios.delete(`https://api.pinata.cloud/pinning/unpin/${ipfsHash}`, {
        headers: {
          Authorization: `Bearer ${this.pinataJWT}`,
        },
      });
      console.log("📌 File unpinned from Pinata:", ipfsHash);
    } catch (error) {
      console.warn("⚠️  Failed to unpin file:", error.message);
    }
  }

  async getFileInfo(ipfsHash) {
    try {
      // Use Pinata API to get file info
      const response = await axios.get(
        `https://api.pinata.cloud/data/pinList?hashContains=${ipfsHash}`,
        {
          headers: {
            Authorization: `Bearer ${this.pinataJWT}`,
          },
        }
      );

      const fileInfo = response.data.rows.find(
        (item) => item.ipfs_pin_hash === ipfsHash
      );
      return {
        hash: ipfsHash,
        size: fileInfo ? fileInfo.size : "unknown",
        pinned: fileInfo ? true : false,
        provider: "pinata",
        metadata: fileInfo ? fileInfo.metadata : null,
      };
    } catch (error) {
      console.error("❌ Failed to get file info:", error);
      throw new Error(`Failed to get file info: ${error.message}`);
    }
  }

  getGatewayUrl(ipfsHash) {
    return `${this.pinataGateway}/ipfs/${ipfsHash}`;
  }

  async getProviderStatus() {
    try {
      if (!this.isInitialized) {
        return { provider: this.provider, status: "not_initialized" };
      }

      const response = await axios.get(
        "https://api.pinata.cloud/data/testAuthentication",
        {
          headers: {
            Authorization: `Bearer ${this.pinataJWT}`,
          },
        }
      );

      return {
        provider: "pinata",
        status: "connected",
        message: response.data.message,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        provider: this.provider,
        status: "error",
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async isHealthy() {
    try {
      if (!this.isInitialized) return false;

      const response = await axios.get(
        "https://api.pinata.cloud/data/testAuthentication",
        {
          headers: {
            Authorization: `Bearer ${this.pinataJWT}`,
          },
        }
      );
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}

module.exports = new IPFSService();

module.exports = new IPFSService();
