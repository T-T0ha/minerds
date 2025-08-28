#!/usr/bin/env node

/**
 * IPFS Provider Test Script
 * Run this to test your IPFS configuration before starting the main application
 */

require("dotenv").config();
const ipfsService = require("./services/ipfsService");
const fs = require("fs-extra");
const path = require("path");

async function testIPFSProvider() {
  console.log("🧪 Testing IPFS Provider Configuration...\n");

  try {
    // Test 1: Initialize IPFS Service
    console.log("1️⃣ Initializing IPFS service...");
    await ipfsService.initialize();
    console.log("✅ IPFS service initialized successfully\n");

    // Test 2: Check Provider Status
    console.log("2️⃣ Checking provider status...");
    const status = await ipfsService.getProviderStatus();
    console.log("📋 Provider Status:", JSON.stringify(status, null, 2));
    console.log();

    // Test 3: Health Check
    console.log("3️⃣ Performing health check...");
    const isHealthy = await ipfsService.isHealthy();
    console.log(
      `🏥 Health Status: ${isHealthy ? "✅ Healthy" : "❌ Unhealthy"}\n`
    );

    if (!isHealthy) {
      throw new Error("IPFS provider health check failed");
    }

    // Test 4: Create Test File
    console.log("4️⃣ Creating test file...");
    const testDir = "./test-uploads";
    await fs.ensureDir(testDir);
    const testFilePath = path.join(testDir, "test-file.txt");
    const testContent = `Test file for IPFS upload\nProvider: ${
      process.env.IPFS_PROVIDER
    }\nTimestamp: ${new Date().toISOString()}`;
    await fs.writeFile(testFilePath, testContent);
    console.log("✅ Test file created\n");

    // Test 5: Upload Test File
    console.log("5️⃣ Testing file upload...");
    const uploadResult = await ipfsService.uploadFile(testFilePath, true);
    console.log("📤 Upload Result:", {
      ipfsHash: uploadResult.ipfsHash,
      encrypted: uploadResult.encrypted,
      provider: uploadResult.provider,
      fileSize: uploadResult.fileSize,
      originalSize: uploadResult.originalSize,
    });
    console.log();

    // Test 6: Download and Verify
    console.log("6️⃣ Testing file download...");
    const downloadedData = await ipfsService.getFile(
      uploadResult.ipfsHash,
      uploadResult.encryptionKey
    );
    const downloadedContent = downloadedData.toString();

    if (downloadedContent === testContent) {
      console.log("✅ File download and decryption successful");
      console.log("📄 Content verified successfully\n");
    } else {
      throw new Error("Downloaded content does not match original");
    }

    // Test 7: Gateway URL
    console.log("7️⃣ Testing gateway URL...");
    const gatewayUrl = ipfsService.getGatewayUrl(uploadResult.ipfsHash);
    console.log("🌐 Gateway URL:", gatewayUrl);
    console.log(
      "ℹ️  Note: Encrypted files cannot be viewed directly via gateway\n"
    );

    // Test 8: File Info
    console.log("8️⃣ Getting file information...");
    try {
      const fileInfo = await ipfsService.getFileInfo(uploadResult.ipfsHash);
      console.log("📊 File Info:", JSON.stringify(fileInfo, null, 2));
    } catch (error) {
      console.log(
        "ℹ️  File info not available (this is normal for some providers)"
      );
    }
    console.log();

    // Test 9: Cleanup
    console.log("9️⃣ Cleaning up test files...");
    await fs.remove(testDir);
    console.log("🧹 Cleanup completed\n");

    // Success Summary
    console.log("🎉 ALL TESTS PASSED! 🎉");
    console.log("✅ Your IPFS configuration is working correctly");
    console.log("✅ Ready for team testing");
    console.log("\n📋 Configuration Summary:");
    console.log(`   Provider: ${process.env.IPFS_PROVIDER}`);
    console.log(`   Status: ${status.status}`);
    console.log(`   Health: ${isHealthy ? "Healthy" : "Unhealthy"}`);
  } catch (error) {
    console.error("\n❌ IPFS TEST FAILED:");
    console.error("Error:", error.message);
    console.error("\n🔧 Troubleshooting Tips:");

    if (process.env.IPFS_PROVIDER === "pinata") {
      console.error("- Check your PINATA_JWT in .env file");
      console.error("- Verify your Pinata account is active");
      console.error("- Ensure you have enough storage quota");
    } else if (process.env.IPFS_PROVIDER === "infura") {
      console.error("- Check your INFURA_PROJECT_ID and INFURA_PROJECT_SECRET");
      console.error("- Verify your Infura project is active");
      console.error("- Check your API quotas");
    } else {
      console.error("- Ensure local IPFS node is running (ipfs daemon)");
      console.error("- Check IPFS_API_URL in .env file");
      console.error("- Verify firewall settings");
    }

    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testIPFSProvider();
}

module.exports = testIPFSProvider;
