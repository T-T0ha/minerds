const { ethers } = require("ethers");

// DatasetSBT Contract ABI
const DATASET_SBT_ABI = [
  "function datasetCounter() external view returns (uint256)",
  "function datasets(uint256) external view returns (string memory ipfsHash, string memory metadata, string memory licenseTerms, address provider, uint256 price, bool isActive, uint256 version, uint256 createdAt)",
  "function licenses(uint256) external view returns (uint256 datasetId, address licensee, uint256 issuedAt, uint256 expiresAt, bool isActive)",
  "function hasValidLicense(address _user, uint256 _datasetId) external view returns (bool)",
  "function getUserLicenses(address _user) external view returns (uint256[] memory)",
  "function tokenURI(uint256 tokenId) external view returns (string memory)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function balanceOf(address owner) external view returns (uint256)",
];

async function checkDatasetSBTStatus() {
  console.log("🔍 Checking Dataset SBT Status on Polygon Amoy");

  // Connect to Polygon Amoy
  const provider = new ethers.JsonRpcProvider(
    "https://polygon-amoy.g.alchemy.com/v2/KfUG5RUwO2iaiZq8P_r3E"
  );
  const sbtAddress = "0x093DD3884F108Aaf85a712694663548Fca309C16";
  const datasetSBT = new ethers.Contract(sbtAddress, DATASET_SBT_ABI, provider);

  try {
    // Check total number of datasets (SBTs)
    const counter = await datasetSBT.datasetCounter();
    console.log(`📊 Total SBT Datasets: ${counter}`);

    if (counter == 0) {
      console.log("❌ No datasets have been SBT-ized yet");
      return;
    }

    // Check each dataset
    for (let i = 0; i < counter; i++) {
      console.log(`\n🎫 Dataset SBT #${i}:`);

      try {
        // Get dataset info
        const dataset = await datasetSBT.datasets(i);
        console.log(`  📋 IPFS Hash: ${dataset.ipfsHash}`);
        console.log(`  ⚡ Active: ${dataset.isActive}`);
        console.log(`  👤 Provider: ${dataset.provider}`);
        console.log(`  💰 Price: ${ethers.formatEther(dataset.price)} MATIC`);
        console.log(
          `  📅 Created: ${new Date(
            Number(dataset.createdAt) * 1000
          ).toISOString()}`
        );

        // Parse metadata
        try {
          const metadata = JSON.parse(dataset.metadata);
          console.log(`  📝 Name: ${metadata.name || "Unnamed"}`);
          console.log(`  🏷️  Type: ${metadata.type || "Unknown"}`);
          console.log(`  📁 File: ${metadata.fileName || "Unknown"}`);
        } catch (e) {
          console.log(`  📝 Metadata: ${dataset.metadata.slice(0, 50)}...`);
        }

        // Check if this is a valid SBT (has owner)
        try {
          const owner = await datasetSBT.ownerOf(i);
          console.log(`  🏆 SBT Owner: ${owner}`);
          console.log(`  ✅ Status: FULLY SBT-IZED`);
        } catch (error) {
          console.log(`  ❌ Status: NOT PROPERLY SBT-IZED (No owner)`);
        }
      } catch (error) {
        console.log(`  ❌ Error reading dataset ${i}: ${error.message}`);
      }
    }

    // Check specific user's SBT licenses
    const testUser = "0x80D387Dc5a93a5aD2BDB7Df8eD81f0D021a52950"; // Deployer address
    console.log(`\n👤 Checking SBT licenses for: ${testUser}`);

    try {
      const balance = await datasetSBT.balanceOf(testUser);
      console.log(`🎫 Total SBT Licenses owned: ${balance}`);

      const licenseIds = await datasetSBT.getUserLicenses(testUser);
      console.log(`📋 License IDs: [${licenseIds.join(", ")}]`);

      for (const licenseId of licenseIds) {
        const license = await datasetSBT.licenses(licenseId);
        console.log(`\n🎟️  License SBT #${licenseId}:`);
        console.log(`  📊 Dataset ID: ${license.datasetId}`);
        console.log(`  👤 Licensee: ${license.licensee}`);
        console.log(`  ⚡ Active: ${license.isActive}`);
        console.log(
          `  📅 Issued: ${new Date(
            Number(license.issuedAt) * 1000
          ).toISOString()}`
        );
        console.log(
          `  ⏰ Expires: ${new Date(
            Number(license.expiresAt) * 1000
          ).toISOString()}`
        );
      }
    } catch (error) {
      console.log(`❌ Error checking user licenses: ${error.message}`);
    }
  } catch (error) {
    console.error("❌ Error checking SBT status:", error.message);
  }
}

// Additional utility functions
async function checkSpecificDataset(datasetId) {
  console.log(`\n🔍 Checking specific Dataset #${datasetId} SBT status`);

  const provider = new ethers.JsonRpcProvider(
    "https://polygon-amoy.g.alchemy.com/v2/KfUG5RUwO2iaiZq8P_r3E"
  );
  const sbtAddress = "0x093DD3884F108Aaf85a712694663548Fca309C16";
  const datasetSBT = new ethers.Contract(sbtAddress, DATASET_SBT_ABI, provider);

  try {
    // Check if dataset exists
    const dataset = await datasetSBT.datasets(datasetId);

    if (!dataset.isActive) {
      console.log("❌ Dataset does not exist or is inactive");
      return false;
    }

    console.log("✅ Dataset exists on blockchain");
    console.log(`📋 IPFS: ${dataset.ipfsHash}`);
    console.log(`💰 Price: ${ethers.formatEther(dataset.price)} MATIC`);

    // Check if it has a valid SBT owner
    try {
      const owner = await datasetSBT.ownerOf(datasetId);
      console.log(`🏆 SBT Owner: ${owner}`);
      console.log("✅ Status: FULLY SBT-IZED");
      return true;
    } catch (error) {
      console.log("❌ Status: NOT PROPERLY SBT-IZED");
      return false;
    }
  } catch (error) {
    console.log(`❌ Dataset #${datasetId} not found: ${error.message}`);
    return false;
  }
}

// Export functions for use in other scripts
module.exports = {
  checkDatasetSBTStatus,
  checkSpecificDataset,
};

// Run if called directly
if (require.main === module) {
  checkDatasetSBTStatus()
    .then(() => {
      console.log("\n✅ SBT status check completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ SBT status check failed:", error);
      process.exit(1);
    });
}
