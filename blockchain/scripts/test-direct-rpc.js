const { ethers } = require("ethers");

async function main() {
  console.log("🔍 Testing Network Connection");

  // Test the Alchemy RPC directly
  const rpcUrl = "https://polygon-amoy.g.alchemy.com/v2/KfUG5RUwO2iaiZq8P_r3E";
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  console.log("🌐 RPC URL:", rpcUrl);

  try {
    const network = await provider.getNetwork();
    console.log("📡 Network:", {
      chainId: network.chainId.toString(),
      name: network.name,
    });

    const blockNumber = await provider.getBlockNumber();
    console.log("📦 Latest Block:", blockNumber);

    // Test contract connection
    const contractAddress = "0x2Bd44D8b04c8A6d4fFeA6E209b24157DE9C17efA";
    const code = await provider.getCode(contractAddress);
    console.log("📋 Contract Code Length:", code.length);
    console.log("🔍 Has Code:", code !== "0x");

    if (code !== "0x") {
      // Create contract instance
      const abi = [
        "function datasetCounter() external view returns (uint256)",
        "function datasets(uint256) external view returns (string memory ipfsHash, string memory metadata, string memory licenseTerms, address provider, uint256 price, bool isActive, uint256 version, uint256 createdAt)",
        "function isDatasetSBTized(uint256 _datasetId) external view returns (bool)",
      ];

      const contract = new ethers.Contract(contractAddress, abi, provider);

      const counter = await contract.datasetCounter();
      console.log("📊 Dataset Counter:", counter.toString());

      for (let i = 0; i < counter; i++) {
        const dataset = await contract.datasets(i);
        console.log(`🗂️  Dataset ${i}:`, {
          provider: dataset.provider,
          isActive: dataset.isActive,
          price: dataset.price.toString(),
        });

        const isSBTized = await contract.isDatasetSBTized(i);
        console.log(`  🎫 SBT Status: ${isSBTized}`);
      }
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
