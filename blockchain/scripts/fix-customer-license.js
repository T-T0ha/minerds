const { ethers } = require("hardhat");

async function main() {
  console.log("🔧 Manual License Issuer for Customer");

  // Get the deployed contracts
  const [deployer] = await ethers.getSigners();

  const sbtAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const marketplaceAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

  const DatasetSBT = await ethers.getContractFactory("DatasetSBT");
  const datasetSBT = DatasetSBT.attach(sbtAddress);

  // Customer who bought dataset #0 but doesn't have access
  const customerAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // Test Account #1
  const datasetId = 0; // "tohagggq" dataset
  const licenseDuration = 30 * 24 * 60 * 60; // 30 days

  console.log("📋 Current Status Check:");
  console.log("Customer Address:", customerAddress);
  console.log("Dataset ID:", datasetId);

  // Check if customer already has a license
  const hasLicense = await datasetSBT.hasValidLicense(
    customerAddress,
    datasetId
  );
  console.log("Has Valid License:", hasLicense);

  if (!hasLicense) {
    console.log("🚀 Issuing manual license...");

    try {
      // Issue license as admin (deployer has admin role)
      const tx = await datasetSBT.issueLicense(
        datasetId,
        customerAddress,
        licenseDuration
      );
      await tx.wait();

      console.log("✅ License issued successfully!");
      console.log("Transaction hash:", tx.hash);

      // Verify the license was issued
      const hasLicenseAfter = await datasetSBT.hasValidLicense(
        customerAddress,
        datasetId
      );
      console.log("License verified:", hasLicenseAfter);
    } catch (error) {
      console.error("❌ Failed to issue license:", error.message);
    }
  } else {
    console.log("✅ Customer already has a valid license");
  }

  // Check marketplace setup
  console.log("\n🔍 Marketplace Setup Check:");
  const marketplaceContract = await datasetSBT.marketplaceContract();
  console.log("Marketplace in SBT contract:", marketplaceContract);
  console.log("Expected marketplace address:", marketplaceAddress);
  console.log(
    "Marketplace correctly set:",
    marketplaceContract.toLowerCase() === marketplaceAddress.toLowerCase()
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
