const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Debugging Frontend Issue");

  const datasetSBTAddress = "0x2Bd44D8b04c8A6d4fFeA6E209b24157DE9C17efA";
  const marketplaceAddress = "0x7ba515227AD1eC6d9Fb70c0fE72531c438911F14";

  // Connect to contracts
  const DatasetSBT = await ethers.getContractFactory("DatasetSBT");
  const datasetSBT = DatasetSBT.attach(datasetSBTAddress);

  console.log("📋 Contract Address:", datasetSBTAddress);

  // Check what the contract returns for each dataset
  for (let datasetId = 0; datasetId <= 1; datasetId++) {
    console.log(`\n🔍 Dataset ${datasetId}:`);

    try {
      // Get dataset info from contract
      const datasetInfo = await datasetSBT.datasets(datasetId);
      console.log(`  📋 Contract Data:`, {
        provider: datasetInfo.provider,
        isActive: datasetInfo.isActive,
        price: datasetInfo.price.toString(),
      });

      // Check SBT status
      const isSBTized = await datasetSBT.isDatasetSBTized(datasetId);
      console.log(`  🎫 Is SBTized: ${isSBTized}`);

      // Check provider's SBT balance
      if (
        datasetInfo.provider !== "0x0000000000000000000000000000000000000000"
      ) {
        const balance = await datasetSBT.balanceOf(
          datasetInfo.provider,
          datasetId
        );
        console.log(`  💰 Provider SBT Balance: ${balance.toString()}`);
      } else {
        console.log(`  ❌ Provider is zero address!`);
      }
    } catch (error) {
      console.error(`  ❌ Error checking dataset ${datasetId}:`, error.message);
    }
  }

  // Get total supply to see how many datasets exist
  try {
    const counter = await datasetSBT.datasetCounter();
    console.log(`\n📊 Total datasets in contract: ${counter.toString()}`);
  } catch (error) {
    console.error("❌ Error getting dataset counter:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
