const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log(
    "🚀 Deploying Healthcare Data Provenance Contracts to Polygon Amoy..."
  );

  // Get the ContractFactory and Signers
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log("📊 Deployment Information:");
  console.log("- Network:", network.name || "amoy");
  console.log("- Chain ID:", network.chainId.toString());
  console.log("- Deployer account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("- Account balance:", ethers.formatEther(balance), "MATIC");

  // Check if account has sufficient balance (at least 0.1 MATIC for deployment)
  const minBalance = ethers.parseEther("0.1");
  if (balance < minBalance) {
    throw new Error(
      `❌ Insufficient balance. Need at least 0.1 MATIC, but have ${ethers.formatEther(
        balance
      )} MATIC`
    );
  }

  console.log("\n🏗️  Starting contract deployment...\n");

  // Deploy DatasetSBT contract
  console.log("📋 Deploying DatasetSBT...");
  const DatasetSBT = await ethers.getContractFactory("DatasetSBT");

  // Estimate gas for deployment
  const sbtDeployTx = await DatasetSBT.getDeployTransaction();
  const sbtEstimatedGas = await ethers.provider.estimateGas(sbtDeployTx);
  console.log("- Estimated gas for DatasetSBT:", sbtEstimatedGas.toString());

  const datasetSBT = await DatasetSBT.deploy();
  console.log("- Transaction hash:", datasetSBT.deploymentTransaction().hash);
  console.log("- Waiting for confirmation...");

  await datasetSBT.waitForDeployment();
  const sbtAddress = await datasetSBT.getAddress();
  console.log("✅ DatasetSBT deployed to:", sbtAddress);

  // Deploy DatasetMarketplace contract
  console.log("\n🏪 Deploying DatasetMarketplace...");
  const DatasetMarketplace = await ethers.getContractFactory(
    "DatasetMarketplace"
  );

  // Estimate gas for marketplace deployment
  const marketplaceDeployTx = await DatasetMarketplace.getDeployTransaction(
    sbtAddress
  );
  const marketplaceEstimatedGas = await ethers.provider.estimateGas(
    marketplaceDeployTx
  );
  console.log(
    "- Estimated gas for DatasetMarketplace:",
    marketplaceEstimatedGas.toString()
  );

  const marketplace = await DatasetMarketplace.deploy(sbtAddress);
  console.log("- Transaction hash:", marketplace.deploymentTransaction().hash);
  console.log("- Waiting for confirmation...");

  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log("✅ DatasetMarketplace deployed to:", marketplaceAddress);

  console.log("\n🔧 Setting up contract integrations...");

  // Set marketplace in SBT contract (grants ADMIN_ROLE automatically)
  console.log("- Setting marketplace in SBT contract...");
  const setMarketplaceTx = await datasetSBT.setMarketplace(marketplaceAddress);
  await setMarketplaceTx.wait();
  console.log("✅ Marketplace granted ADMIN_ROLE in SBT contract");

  // Register deployer as dataset provider for testing
  console.log("- Registering deployer as dataset provider...");
  const registerTx = await datasetSBT.registerAsProvider();
  await registerTx.wait();
  console.log("✅ Deployer registered as dataset provider");

  // Configure payment tokens in marketplace (MATIC as native token)
  console.log("- Configuring payment tokens...");
  const updateTokenTx = await marketplace.updatePaymentToken(
    ethers.ZeroAddress,
    true
  );
  await updateTokenTx.wait();
  console.log("✅ MATIC added as supported payment token");

  // Verify role configuration
  console.log("\n🔍 Verifying deployment...");
  const isProvider = await datasetSBT.isDatasetProvider(deployer.address);
  console.log("- Deployer is dataset provider:", isProvider);

  const platformFee = await marketplace.platformFee();
  console.log("- Platform fee:", platformFee.toString(), "basis points");

  console.log("\n🎉 Deployment Complete!");
  console.log("========================================");
  console.log("Network: Polygon Amoy Testnet");
  console.log("Chain ID:", network.chainId.toString());
  console.log("DatasetSBT address:", sbtAddress);
  console.log("DatasetMarketplace address:", marketplaceAddress);
  console.log("Deployer address:", deployer.address);
  console.log("========================================");

  // Save deployment info to file
  const deploymentInfo = {
    network: "amoy",
    chainId: network.chainId.toString(),
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      DatasetSBT: {
        address: sbtAddress,
        deploymentTx: datasetSBT.deploymentTransaction().hash,
      },
      DatasetMarketplace: {
        address: marketplaceAddress,
        deploymentTx: marketplace.deploymentTransaction().hash,
      },
    },
    gasUsed: {
      DatasetSBT: sbtEstimatedGas.toString(),
      DatasetMarketplace: marketplaceEstimatedGas.toString(),
    },
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const deploymentFile = path.join(deploymentsDir, `amoy-${Date.now()}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log("📄 Deployment info saved to:", deploymentFile);

  console.log("\n📋 Environment Variables for Backend:");
  console.log("========================================");
  console.log(
    `BLOCKCHAIN_RPC_URL=${
      process.env.AMOY_RPC_URL || "https://rpc-amoy.polygon.technology"
    }`
  );
  console.log(`DATASET_SBT_ADDRESS=${sbtAddress}`);
  console.log(`MARKETPLACE_ADDRESS=${marketplaceAddress}`);
  console.log("========================================");

  console.log("\n🔗 Verify Contracts on PolygonScan:");
  console.log(`DatasetSBT: https://amoy.polygonscan.com/address/${sbtAddress}`);
  console.log(
    `DatasetMarketplace: https://amoy.polygonscan.com/address/${marketplaceAddress}`
  );

  console.log("\n🎯 Next Steps:");
  console.log("1. 🔍 Verify contracts on PolygonScan");
  console.log("2. 📝 Update backend .env with new addresses");
  console.log("3. 🔄 Update frontend contract addresses");
  console.log("4. 💰 Get test MATIC from Polygon faucet");
  console.log("5. 🧪 Test the application on Amoy testnet");

  console.log("\n💡 Useful Links:");
  console.log("- Polygon Amoy Faucet: https://faucet.polygon.technology/");
  console.log("- Amoy Explorer: https://amoy.polygonscan.com/");
  console.log("- Add Amoy to MetaMask: https://polygon.technology/");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
