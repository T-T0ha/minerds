import React, { useState } from "react";
import { ethers } from "ethers";
import "./OwnershipVerification.css";

const OwnershipVerification = () => {
  const [datasetId, setDatasetId] = useState("");
  const [providerAddress, setProviderAddress] = useState("");
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Contract configuration for Polygon Amoy (Updated)
  const DATASET_SBT_ADDRESS = "0x2Bd44D8b04c8A6d4fFeA6E209b24157DE9C17efA";
  const RPC_URL = "https://polygon-amoy.g.alchemy.com/v2/KfUG5RUwO2iaiZq8P_r3E";

  const DATASET_SBT_ABI = [
    "function isDatasetSBTized(uint256 _datasetId) external view returns (bool)",
    "function getDatasetOwner(uint256 _datasetId) external view returns (address)",
    "function balanceOf(address account, uint256 id) external view returns (uint256)",
    "function datasets(uint256) external view returns (string memory ipfsHash, string memory metadata, string memory licenseTerms, address provider, uint256 price, bool isActive, uint256 version, uint256 createdAt)",
    "function datasetCounter() external view returns (uint256)",
  ];

  const verifyOwnership = async () => {
    if (!datasetId || !providerAddress) {
      setError("Please enter both Dataset ID and Provider Address");
      return;
    }

    // Validate Ethereum address
    if (!ethers.isAddress(providerAddress)) {
      setError("Invalid Ethereum address format");
      return;
    }

    setLoading(true);
    setError("");
    setVerificationResult(null);

    try {
      // Connect to Polygon Amoy (public RPC)
      const provider = new ethers.JsonRpcProvider(RPC_URL);
      const datasetSBT = new ethers.Contract(
        DATASET_SBT_ADDRESS,
        DATASET_SBT_ABI,
        provider
      );

      // Check if dataset exists
      const datasetCounter = await datasetSBT.datasetCounter();
      if (parseInt(datasetId) >= parseInt(datasetCounter.toString())) {
        setError(
          `Dataset ID ${datasetId} does not exist. Total datasets: ${datasetCounter.toString()}`
        );
        setLoading(false);
        return;
      }

      // Get dataset information
      const dataset = await datasetSBT.datasets(datasetId);
      const [
        ipfsHash,
        metadata,
        licenseTerms,
        actualProvider,
        price,
        isActive,
        version,
        createdAt,
      ] = dataset;

      // Verify SBT status
      const isSBTized = await datasetSBT.isDatasetSBTized(datasetId);

      // Get the official owner
      const officialOwner = await datasetSBT.getDatasetOwner(datasetId);

      // Check SBT balance
      const sbtBalance = await datasetSBT.balanceOf(officialOwner, datasetId);

      // Parse metadata for additional info
      let parsedMetadata = {};
      try {
        parsedMetadata = JSON.parse(metadata);
      } catch (e) {
        parsedMetadata = { raw: metadata };
      }

      // Build verification result
      const result = {
        datasetExists: true,
        datasetActive: isActive,
        isSBTProtected: isSBTized,
        officialOwner: officialOwner,
        providedAddress: providerAddress,
        addressMatches:
          officialOwner.toLowerCase() === providerAddress.toLowerCase(),
        hasSBT: sbtBalance > 0,
        sbtBalance: sbtBalance.toString(),
        datasetInfo: {
          ipfsHash: ipfsHash,
          price: ethers.formatEther(price),
          version: version.toString(),
          createdAt: new Date(Number(createdAt) * 1000).toISOString(),
          name: parsedMetadata.name || "Unknown",
          type: parsedMetadata.type || "Unknown",
          encrypted: parsedMetadata.encrypted || false,
        },
      };

      // Overall validation
      result.isFullyValid =
        result.datasetExists &&
        result.datasetActive &&
        result.isSBTProtected &&
        result.addressMatches &&
        result.hasSBT;

      setVerificationResult(result);
    } catch (error) {
      console.error("Verification error:", error);
      setError(`Verification failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setDatasetId("");
    setProviderAddress("");
    setVerificationResult(null);
    setError("");
  };

  return (
    <div className="verification-container">
      <div className="verification-header">
        <h2>🔍 Dataset Ownership Verification</h2>
        <p>
          Verify the authenticity and ownership of any dataset on the
          blockchain. This tool provides public, trustless verification of
          SBT-protected datasets.
        </p>
      </div>

      <div className="verification-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="datasetId">Dataset ID *</label>
            <input
              type="number"
              id="datasetId"
              value={datasetId}
              onChange={(e) => setDatasetId(e.target.value)}
              placeholder="e.g., 0"
              min="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="providerAddress">Provider Address *</label>
            <input
              type="text"
              id="providerAddress"
              value={providerAddress}
              onChange={(e) => setProviderAddress(e.target.value)}
              placeholder="0x..."
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            onClick={verifyOwnership}
            disabled={loading || !datasetId || !providerAddress}
            className="verify-button"
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Verifying...
              </>
            ) : (
              "🔍 Verify Ownership"
            )}
          </button>

          <button onClick={resetForm} className="reset-button">
            🔄 Reset
          </button>
        </div>

        {error && <div className="error-message">❌ {error}</div>}
      </div>

      {verificationResult && (
        <div className="verification-results">
          <h3>Verification Results</h3>

          <div
            className={`result-summary ${
              verificationResult.isFullyValid ? "valid" : "invalid"
            }`}
          >
            {verificationResult.isFullyValid ? (
              <div className="valid-result">
                ✅ <strong>OWNERSHIP VERIFIED</strong>
                <p>This dataset is legitimately owned and SBT-protected.</p>
              </div>
            ) : (
              <div className="invalid-result">
                ❌ <strong>OWNERSHIP NOT VERIFIED</strong>
                <p>Issues found with ownership verification.</p>
              </div>
            )}
          </div>

          <div className="verification-details">
            <div className="detail-section">
              <h4>🎫 SBT Protection Status</h4>
              <div className="detail-item">
                <span className="label">Dataset Protected:</span>
                <span
                  className={`value ${
                    verificationResult.isSBTProtected ? "success" : "error"
                  }`}
                >
                  {verificationResult.isSBTProtected ? "✅ Yes" : "❌ No"}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">SBT Balance:</span>
                <span
                  className={`value ${
                    verificationResult.hasSBT ? "success" : "error"
                  }`}
                >
                  {verificationResult.sbtBalance}{" "}
                  {verificationResult.hasSBT ? "✅" : "❌"}
                </span>
              </div>
            </div>

            <div className="detail-section">
              <h4>👤 Ownership Details</h4>
              <div className="detail-item">
                <span className="label">Official Owner:</span>
                <span className="value address">
                  {verificationResult.officialOwner}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Provided Address:</span>
                <span className="value address">
                  {verificationResult.providedAddress}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Address Match:</span>
                <span
                  className={`value ${
                    verificationResult.addressMatches ? "success" : "error"
                  }`}
                >
                  {verificationResult.addressMatches
                    ? "✅ Match"
                    : "❌ No Match"}
                </span>
              </div>
            </div>

            <div className="detail-section">
              <h4>📊 Dataset Information</h4>
              <div className="detail-item">
                <span className="label">Name:</span>
                <span className="value">
                  {verificationResult.datasetInfo.name}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Type:</span>
                <span className="value">
                  {verificationResult.datasetInfo.type}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Price:</span>
                <span className="value">
                  {verificationResult.datasetInfo.price} MATIC
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Version:</span>
                <span className="value">
                  {verificationResult.datasetInfo.version}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Created:</span>
                <span className="value">
                  {new Date(
                    verificationResult.datasetInfo.createdAt
                  ).toLocaleDateString()}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Encrypted:</span>
                <span className="value">
                  {verificationResult.datasetInfo.encrypted
                    ? "🔐 Yes"
                    : "🔓 No"}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Active:</span>
                <span
                  className={`value ${
                    verificationResult.datasetActive ? "success" : "error"
                  }`}
                >
                  {verificationResult.datasetActive
                    ? "✅ Active"
                    : "❌ Inactive"}
                </span>
              </div>
            </div>

            <div className="detail-section">
              <h4>🔗 Blockchain Details</h4>
              <div className="detail-item">
                <span className="label">IPFS Hash:</span>
                <span className="value hash">
                  {verificationResult.datasetInfo.ipfsHash.slice(0, 20)}...
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Network:</span>
                <span className="value">Polygon Amoy Testnet</span>
              </div>
              <div className="detail-item">
                <span className="label">Contract:</span>
                <span className="value address">{DATASET_SBT_ADDRESS}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="verification-info">
        <h4>ℹ️ About This Tool</h4>
        <ul>
          <li>
            ✅ <strong>Public & Trustless:</strong> Verifies ownership directly
            from blockchain
          </li>
          <li>
            🔒 <strong>No Wallet Required:</strong> Read-only verification using
            public RPC
          </li>
          <li>
            🌐 <strong>Transparent:</strong> All data comes from immutable smart
            contracts
          </li>
          <li>
            ⚡ <strong>Real-time:</strong> Shows current ownership status
          </li>
          <li>
            🛡️ <strong>Anti-fraud:</strong> Detects fake or transferred datasets
          </li>
        </ul>
      </div>
    </div>
  );
};

export default OwnershipVerification;
