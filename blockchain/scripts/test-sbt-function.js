const { ethers } = require("hardhat");
require("dotenv").config();

async function testSBTFunction() {
  console.log("🧪 Testing isDatasetSBTized function directly...\n");

  try {
    // Connect to Polygon Amoy
    const provider = new ethers.JsonRpcProvider(
      "https://polygon-amoy.g.alchemy.com/v2/KfUG5RUwO2iaiZq8P_r3E"
    );

    // Get contract instance
    const DatasetSBT = await ethers.getContractFactory("DatasetSBT");
    const datasetSBT = DatasetSBT.attach(
      "0x2Bd44D8b04c8A6d4fFeA6E209b24157DE9C17efA"
    ).connect(provider);

    // Test both datasets
    for (let i = 0; i < 2; i++) {
      console.log(`📊 Testing Dataset ID: ${i}`);

      try {
        // Test the function that frontend is calling
        const isSBTized = await datasetSBT.isDatasetSBTized(i);
        console.log(`   isDatasetSBTized(${i}): ${isSBTized}`);

        // Get dataset info
        const dataset = await datasetSBT.datasets(i);
        console.log(`   Provider: ${dataset.provider}`);
        console.log(`   Active: ${dataset.isActive}`);

        // Check provider's balance
        const balance = await datasetSBT.balanceOf(dataset.provider, i);
        console.log(`   Provider SBT Balance: ${balance}`);

        console.log(
          `   ✅ Expected: ${
            isSBTized ? "SBT Protected" : "Not SBT Protected"
          }\n`
        );
      } catch (error) {
        console.log(`   ❌ Error testing dataset ${i}:`, error.message);
        console.log();
      }
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

testSBTFunction();
