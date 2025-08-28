const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying Healthcare Data Provenance Contracts...");

  // Get the ContractFactory and Signers
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log(
    "Account balance:",
    ethers.formatEther(await deployer.provider.getBalance(deployer.address))
  );

  // Deploy DatasetSBT contract
  console.log("\nDeploying DatasetSBT...");
  const DatasetSBT = await ethers.getContractFactory("DatasetSBT");
  const datasetSBT = await DatasetSBT.deploy();
  await datasetSBT.waitForDeployment();
  const sbtAddress = await datasetSBT.getAddress();
  console.log("DatasetSBT deployed to:", sbtAddress);

  // Deploy DatasetMarketplace contract
  console.log("\nDeploying DatasetMarketplace...");
  const DatasetMarketplace = await ethers.getContractFactory(
    "DatasetMarketplace"
  );
  const marketplace = await DatasetMarketplace.deploy(sbtAddress);
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log("DatasetMarketplace deployed to:", marketplaceAddress);

  // Set marketplace in SBT contract (grants ADMIN_ROLE automatically)
  console.log("\nSetting up marketplace integration...");
  await datasetSBT.setMarketplace(marketplaceAddress);
  console.log("✅ Marketplace granted ADMIN_ROLE in SBT contract");

  // Allow deployer to register as provider for testing
  console.log("\nRegistering deployer as dataset provider...");
  await datasetSBT.registerAsProvider();
  console.log("✅ Deployer registered as dataset provider");

  // Update payment tokens in marketplace
  console.log("\nConfiguring payment tokens...");
  await marketplace.updatePaymentToken(ethers.ZeroAddress, true); // ETH/MATIC
  console.log("✅ ETH/MATIC added as supported payment token");

  // Display role information
  console.log("\n=== Role Configuration ===");
  const isProvider = await datasetSBT.isDatasetProvider(deployer.address);
  console.log("Deployer is dataset provider:", isProvider);

  console.log("\n=== Deployment Complete ===");
  console.log("DatasetSBT address:", sbtAddress);
  console.log("DatasetMarketplace address:", marketplaceAddress);
  console.log("\n📋 Update your .env file with these addresses:");
  console.log(`DATASET_SBT_ADDRESS=${sbtAddress}`);
  console.log(`MARKETPLACE_ADDRESS=${marketplaceAddress}`);

  console.log("\n🎯 Complete Customer Flow Now Available:");
  console.log("1. ✅ Anyone can register as dataset provider");
  console.log("2. ✅ Providers can upload datasets");
  console.log("3. ✅ Customers can purchase licenses");
  console.log("4. ✅ Customers automatically receive SBT licenses");
  console.log("5. ✅ Customers can access datasets with valid licenses");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
