const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("HealthchainAmoyModule", (m) => {
  // Deploy DatasetSBT contract first
  const datasetSBT = m.contract("DatasetSBT", [], {
    id: "DatasetSBT",
  });

  // Deploy DatasetMarketplace contract with DatasetSBT address
  const datasetMarketplace = m.contract("DatasetMarketplace", [datasetSBT], {
    id: "DatasetMarketplace",
  });

  // Set marketplace in SBT contract (grants ADMIN_ROLE automatically)
  m.call(datasetSBT, "setMarketplace", [datasetMarketplace], {
    id: "setMarketplace",
  });

  // Register deployer as dataset provider for testing
  m.call(datasetSBT, "registerAsProvider", [], {
    id: "registerAsProvider",
  });

  // Configure payment tokens in marketplace (MATIC as native token)
  const zeroAddress = "0x0000000000000000000000000000000000000000";
  m.call(datasetMarketplace, "updatePaymentToken", [zeroAddress, true], {
    id: "updatePaymentToken",
  });

  return {
    datasetSBT,
    datasetMarketplace,
  };
});
