const { ethers } = require("hardhat");
require("dotenv").config();

async function checkSBTStatus() {
  console.log("🔍 Checking SBT Status for All Datasets...\n");

  try {
    // Get deployed contract addresses (Updated)
    const DATASET_SBT_ADDRESS =
      process.env.DATASET_SBT_ADDRESS ||
      "0x2Bd44D8b04c8A6d4fFeA6E209b24157DE9C17efA";
    const DATASET_MARKETPLACE_ADDRESS =
      process.env.MARKETPLACE_ADDRESS ||
      "0x7ba515227AD1eC6d9Fb70c0fE72531c438911F14";

    console.log("📋 Contract Addresses:");
    console.log(`   DatasetSBT: ${DATASET_SBT_ADDRESS}`);
    console.log(`   DatasetMarketplace: ${DATASET_MARKETPLACE_ADDRESS}\n`);

    // Connect to Polygon Amoy
    const provider = new ethers.JsonRpcProvider(
      "https://polygon-amoy.g.alchemy.com/v2/KfUG5RUwO2iaiZq8P_r3E"
    );

    // Get contract instances
    const DatasetSBT = await ethers.getContractFactory("DatasetSBT");
    const datasetSBT = DatasetSBT.attach(DATASET_SBT_ADDRESS).connect(provider);

    const DatasetMarketplace = await ethers.getContractFactory(
      "DatasetMarketplace"
    );
    const marketplace = DatasetMarketplace.attach(
      DATASET_MARKETPLACE_ADDRESS
    ).connect(provider);

    // Get total number of datasets
    const datasetCounter = await datasetSBT.datasetCounter();
    console.log(`📊 Total Datasets Registered: ${datasetCounter}\n`);

    if (datasetCounter.toString() === "0") {
      console.log("ℹ️  No datasets found.");
      return;
    }

    // Check each dataset
    for (let i = 0; i < datasetCounter; i++) {
      console.log(`🗂️  Dataset ID: ${i}`);

      try {
        // Get dataset info
        const dataset = await datasetSBT.datasets(i);
        console.log(`   Provider: ${dataset.provider}`);
        console.log(`   Price: ${ethers.formatEther(dataset.price)} ETH`);
        console.log(`   Active: ${dataset.isActive}`);

        // Check if dataset is SBT-ized (provider owns the SBT)
        const isSBTized = await datasetSBT.isDatasetSBTized(i);
        console.log(
          `   🎫 SBT Status: ${
            isSBTized
              ? "✅ SBT Protected (Provider Owned)"
              : "❌ Not SBT Protected"
          }`
        );

        if (isSBTized) {
          // Check provider's SBT balance for this dataset
          const providerBalance = await datasetSBT.balanceOf(
            dataset.provider,
            i
          );
          console.log(`   🔒 Provider SBT Balance: ${providerBalance}`);
        }

        // Get user licenses for this dataset
        const licenseCounter = await datasetSBT.licenseCounter();
        let customerCount = 0;

        console.log(`   👥 Customer Licenses:`);
        for (let j = 0; j < licenseCounter; j++) {
          try {
            const license = await datasetSBT.licenses(j);
            if (
              license.datasetId.toString() === i.toString() &&
              license.isActive
            ) {
              customerCount++;
              const isExpired =
                license.expiresAt < Math.floor(Date.now() / 1000);
              console.log(
                `      Customer ${customerCount}: ${license.licensee} ${
                  isExpired ? "(EXPIRED)" : "(ACTIVE)"
                }`
              );
            }
          } catch (err) {
            // License might not exist
          }
        }

        if (customerCount === 0) {
          console.log(`      No active customer licenses`);
        }
      } catch (error) {
        console.log(`   ❌ Error checking dataset ${i}:`, error.message);
      }

      console.log(); // Empty line for readability
    }
  } catch (error) {
    console.error("❌ Error checking SBT status:", error);
  }
}

// Run the check
if (require.main === module) {
  checkSBTStatus()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { checkSBTStatus };
