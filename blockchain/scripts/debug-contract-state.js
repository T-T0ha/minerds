const { ethers } = require("ethers");

// DatasetSBT Contract ABI
const DATASET_SBT_ABI = [
  "function datasetCounter() external view returns (uint256)",
  "function datasets(uint256) external view returns (string memory ipfsHash, string memory metadata, string memory licenseTerms, address provider, uint256 price, bool isActive, uint256 version, uint256 createdAt)",
  "function licenses(uint256) external view returns (uint256 datasetId, address licensee, uint256 issuedAt, uint256 expiresAt, bool isActive)",
  "function hasValidLicense(address _user, uint256 _datasetId) external view returns (bool)",
  "function getUserLicenses(address _user) external view returns (uint256[] memory)",
];

async function main() {
  console.log("🔍 Debug Contract State");

  // Connect directly to the local blockchain
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  const sbtAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const datasetSBT = new ethers.Contract(sbtAddress, DATASET_SBT_ABI, provider);

  // Check dataset counter
  const counter = await datasetSBT.datasetCounter();
  console.log(`📊 Total datasets: ${counter}`);

  // Check each dataset
  for (let i = 0; i < counter; i++) {
    try {
      const dataset = await datasetSBT.datasets(i);
      console.log(`\n📋 Dataset ${i}:`);
      console.log(`  - Active: ${dataset.isActive}`);
      console.log(`  - Provider: ${dataset.provider}`);
      console.log(`  - Price: ${ethers.formatEther(dataset.price)} ETH`);
      console.log(`  - IPFS: ${dataset.ipfsHash.slice(0, 20)}...`);
      console.log(`  - Metadata: ${dataset.metadata.slice(0, 50)}...`);
    } catch (error) {
      console.log(`❌ Failed to get dataset ${i}: ${error.message}`);
    }
  }

  // Check specific customer's licenses
  const customerAddress = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"; // Test Account #2 (Customer 3)
  console.log(`\n👤 Customer ${customerAddress} licenses:`);

  try {
    const licenseIds = await datasetSBT.getUserLicenses(customerAddress);
    console.log(`📋 License IDs: [${licenseIds.join(", ")}]`);

    for (const licenseId of licenseIds) {
      try {
        const license = await datasetSBT.licenses(licenseId);
        console.log(`\n🎫 License ${licenseId}:`);
        console.log(`  - Dataset ID: ${license.datasetId}`);
        console.log(`  - Licensee: ${license.licensee}`);
        console.log(`  - Active: ${license.isActive}`);
        console.log(
          `  - Issued: ${new Date(
            Number(license.issuedAt) * 1000
          ).toISOString()}`
        );
        console.log(
          `  - Expires: ${new Date(
            Number(license.expiresAt) * 1000
          ).toISOString()}`
        );

        // Check if user has valid license for this dataset
        const hasValidLicense = await datasetSBT.hasValidLicense(
          customerAddress,
          license.datasetId
        );
        console.log(`  - Has Valid License: ${hasValidLicense}`);
      } catch (error) {
        console.log(`❌ Failed to get license ${licenseId}: ${error.message}`);
      }
    }
  } catch (error) {
    console.log(`❌ Failed to get customer licenses: ${error.message}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
