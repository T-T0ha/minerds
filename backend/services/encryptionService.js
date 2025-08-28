const crypto = require("crypto");

class EncryptionService {
  constructor() {
    this.algorithm = "aes-256-cbc";
    this.keyLength = 32; // 256 bits
    this.ivLength = 16; // 128 bits
  }

  // Generate a random encryption key
  generateKey() {
    return crypto.randomBytes(this.keyLength);
  }

  // Encrypt file buffer
  encryptFile(fileBuffer, key = null) {
    try {
      const encryptionKey = key || this.generateKey();
      const iv = crypto.randomBytes(this.ivLength);

      const cipher = crypto.createCipheriv(this.algorithm, encryptionKey, iv);

      const encrypted = Buffer.concat([
        cipher.update(fileBuffer),
        cipher.final(),
      ]);

      // Combine IV + encrypted data
      const encryptedWithMetadata = Buffer.concat([iv, encrypted]);

      return {
        encryptedData: encryptedWithMetadata,
        key: encryptionKey,
        keyHex: encryptionKey.toString("hex"),
      };
    } catch (error) {
      console.error("❌ File encryption failed:", error);
      throw new Error(`File encryption failed: ${error.message}`);
    }
  }

  // Decrypt file buffer
  decryptFile(encryptedBuffer, key) {
    try {
      if (typeof key === "string") {
        key = Buffer.from(key, "hex");
      }

      // Extract IV and encrypted data
      const iv = encryptedBuffer.slice(0, this.ivLength);
      const encrypted = encryptedBuffer.slice(this.ivLength);

      const decipher = crypto.createDecipheriv(this.algorithm, key, iv);

      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
      ]);

      return decrypted;
    } catch (error) {
      console.error("❌ File decryption failed:", error);
      throw new Error(`File decryption failed: ${error.message}`);
    }
  }

  // Encrypt JSON metadata
  encryptMetadata(metadata, key) {
    const metadataString = JSON.stringify(metadata);
    const metadataBuffer = Buffer.from(metadataString, "utf8");

    return this.encryptFile(metadataBuffer, key);
  }

  // Decrypt JSON metadata
  decryptMetadata(encryptedBuffer, key) {
    const decryptedBuffer = this.decryptFile(encryptedBuffer, key);
    const metadataString = decryptedBuffer.toString("utf8");

    return JSON.parse(metadataString);
  }

  // Generate secure hash of file for integrity verification
  generateFileHash(fileBuffer) {
    return crypto.createHash("sha256").update(fileBuffer).digest("hex");
  }

  // Verify file integrity
  verifyFileIntegrity(fileBuffer, expectedHash) {
    const actualHash = this.generateFileHash(fileBuffer);
    return actualHash === expectedHash;
  }
}

module.exports = new EncryptionService();

module.exports = new EncryptionService();
