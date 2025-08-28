const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Healthcare Data Provenance", function () {
  let datasetSBT, marketplace;
  let owner, provider, customer;

  beforeEach(async function () {
    [owner, provider, customer] = await ethers.getSigners();

    // Deploy DatasetSBT
    const DatasetSBT = await ethers.getContractFactory("DatasetSBT");
    datasetSBT = await DatasetSBT.deploy();
    await datasetSBT.deployed();

    // Deploy Marketplace
    const DatasetMarketplace = await ethers.getContractFactory(
      "DatasetMarketplace"
    );
    marketplace = await DatasetMarketplace.deploy(datasetSBT.address);
    await marketplace.deployed();

    // Grant roles
    const ADMIN_ROLE = await datasetSBT.ADMIN_ROLE();
    const DATASET_PROVIDER_ROLE = await datasetSBT.DATASET_PROVIDER_ROLE();

    await datasetSBT.grantRole(ADMIN_ROLE, marketplace.address);
    await datasetSBT.grantRole(DATASET_PROVIDER_ROLE, provider.address);
  });

  describe("Dataset Registration", function () {
    it("Should register a new dataset", async function () {
      const ipfsHash = "QmTestHash123";
      const metadata = '{"name":"Test Dataset","type":"medical"}';
      const licenseTerms = "Research use only";
      const price = ethers.utils.parseEther("0.1");

      await expect(
        datasetSBT
          .connect(provider)
          .registerDataset(ipfsHash, metadata, licenseTerms, price)
      ).to.emit(datasetSBT, "DatasetRegistered");

      const dataset = await datasetSBT.datasets(0);
      expect(dataset.ipfsHash).to.equal(ipfsHash);
      expect(dataset.provider).to.equal(provider.address);
      expect(dataset.price).to.equal(price);
    });
  });

  describe("Dataset Licensing", function () {
    beforeEach(async function () {
      // Register a test dataset
      await datasetSBT
        .connect(provider)
        .registerDataset(
          "QmTestHash123",
          '{"name":"Test Dataset"}',
          "Research use only",
          ethers.utils.parseEther("0.1")
        );
    });

    it("Should purchase dataset license", async function () {
      const datasetId = 0;
      const licenseDuration = 30 * 24 * 60 * 60; // 30 days
      const price = ethers.utils.parseEther("0.1");

      await expect(
        marketplace.connect(customer).purchaseDatasetLicense(
          datasetId,
          ethers.constants.AddressZero, // ETH payment
          licenseDuration,
          { value: price }
        )
      ).to.emit(marketplace, "DatasetPurchased");

      // Check if customer has valid license
      const hasLicense = await marketplace.canAccessDataset(
        customer.address,
        datasetId
      );
      expect(hasLicense).to.be.true;
    });

    it("Should prevent transfers of SBT", async function () {
      const datasetId = 0;
      const licenseDuration = 30 * 24 * 60 * 60;
      const price = ethers.utils.parseEther("0.1");

      // Purchase license
      await marketplace
        .connect(customer)
        .purchaseDatasetLicense(
          datasetId,
          ethers.constants.AddressZero,
          licenseDuration,
          { value: price }
        );

      // Try to transfer SBT (should fail)
      await expect(
        datasetSBT.connect(customer).safeTransferFrom(
          customer.address,
          owner.address,
          0, // license ID
          1,
          "0x"
        )
      ).to.be.revertedWith("SBT: Transfer not allowed");
    });
  });
});
