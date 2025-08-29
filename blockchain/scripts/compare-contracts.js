const { ethers } = require("hardhat");
require("dotenv").config();

async function compareContracts() {
  console.log("🔍 Comparing dataset data between old and new contracts...\n");

  try {
    const provider = new ethers.JsonRpcProvider(
      "https://polygon-amoy.g.alchemy.com/v2/KfUG5RUwO2iaiZq8P_r3E"
    );

    const DatasetSBT = await ethers.getContractFactory("DatasetSBT");

    // Old contract (what frontend might be seeing)
    const oldContract = DatasetSBT.attach(
      "0x093DD3884F108Aaf85a712694663548Fca309C16"
    ).connect(provider);

    // New contract (what should be used)
    const newContract = DatasetSBT.attach(
      "0x2Bd44D8b04c8A6d4fFeA6E209b24157DE9C17efA"
    ).connect(provider);

    console.log(
      "📊 OLD CONTRACT (0x093DD3884F108Aaf85a712694663548Fca309C16):"
    );
    try {
      const oldCounter = await oldContract.datasetCounter();
      console.log(`   Dataset Counter: ${oldCounter}`);

      for (let i = 0; i < 2; i++) {
        try {
          const dataset = await oldContract.datasets(i);
          console.log(
            `   Dataset ${i}: Provider=${dataset.provider}, Active=${dataset.isActive}`
          );
        } catch (e) {
          console.log(`   Dataset ${i}: Does not exist`);
        }
      }
    } catch (e) {
      console.log(`   Error accessing old contract: ${e.message}`);
    }

    console.log(
      "\n📊 NEW CONTRACT (0x2Bd44D8b04c8A6d4fFeA6E209b24157DE9C17efA):"
    );
    try {
      const newCounter = await newContract.datasetCounter();
      console.log(`   Dataset Counter: ${newCounter}`);

      for (let i = 0; i < 2; i++) {
        try {
          const dataset = await newContract.datasets(i);
          console.log(
            `   Dataset ${i}: Provider=${dataset.provider}, Active=${dataset.isActive}`
          );
        } catch (e) {
          console.log(`   Dataset ${i}: Does not exist`);
        }
      }
    } catch (e) {
      console.log(`   Error accessing new contract: ${e.message}`);
    }
  } catch (error) {
    console.error("❌ Comparison failed:", error);
  }
}

compareContracts();
