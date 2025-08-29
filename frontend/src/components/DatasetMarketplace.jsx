import React, { useState, useEffect } from "react";
import { useWeb3 } from "../context/Web3Context";
import { ethers } from "ethers";
import "./DatasetMarketplace.css";

const DatasetMarketplace = () => {
  const { marketplaceContract, datasetSBTContract, account, isConnected } =
    useWeb3();
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState(null);

  // Load datasets from backend API
  const loadDatasets = async () => {
    try {
      setLoading(true);

      const response = await fetch("http://localhost:3001/api/datasets");
      if (!response.ok) {
        throw new Error("Failed to fetch datasets");
      }

      const backendDatasets = await response.json();

      // For each dataset, check if user has access
      const datasetsWithAccess = await Promise.all(
        backendDatasets.map(async (dataset) => {
          let hasAccess = false;
          if (account && dataset.datasetId) {
            try {
              const accessResponse = await fetch(
                `http://localhost:3001/api/verify-license/${dataset.datasetId}/${account}`
              );
              if (accessResponse.ok) {
                const accessData = await accessResponse.json();
                hasAccess = accessData.hasLicense;
              }
            } catch (error) {
              console.warn(
                "Failed to check access for dataset",
                dataset.datasetId
              );
            }
          }

          return {
            id: dataset.datasetId,
            ipfsHash: dataset.ipfsHash,
            metadata: JSON.parse(dataset.metadata || "{}"),
            licenseTerms: dataset.licenseTerms,
            provider: dataset.provider,
            price: dataset.price,
            isActive: dataset.isActive,
            version: Number(dataset.version),
            createdAt: new Date(dataset.createdAt),
            hasAccess,
          };
        })
      );

      setDatasets(datasetsWithAccess);
    } catch (error) {
      console.error("Error loading datasets:", error);
    } finally {
      setLoading(false);
    }
  };

  // Download dataset from IPFS via backend
  const downloadDataset = async (datasetId) => {
    if (!account) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3001/api/dataset/${datasetId}?userAddress=${account}`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Download failed");
      }

      // Create blob and download file
      const blob = await response.blob();

      // Get filename from headers (try multiple approaches)
      let filename = `dataset-${datasetId}`;

      // Try Content-Disposition header first
      const contentDisposition = response.headers.get("Content-Disposition");
      const originalFilename = response.headers.get("X-Original-Filename");

      console.log("Content-Disposition:", contentDisposition);
      console.log("X-Original-Filename:", originalFilename);

      if (originalFilename) {
        filename = originalFilename;
        console.log("Using X-Original-Filename:", filename);
      } else if (contentDisposition) {
        // Try multiple regex patterns for filename extraction
        const patterns = [
          /filename\*?=['"]?([^'";\s]+)['"]?/i,
          /filename=['"]([^'"]+)['"]/i,
          /filename=([^;,\s]+)/i,
        ];

        for (const pattern of patterns) {
          const match = contentDisposition.match(pattern);
          if (match && match[1]) {
            filename = match[1];
            console.log(
              "Extracted filename from Content-Disposition:",
              filename
            );
            break;
          }
        }
      }

      console.log("Final filename for download:", filename);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      alert("Dataset downloaded successfully!");
    } catch (error) {
      console.error("Error downloading dataset:", error);
      alert("Error downloading dataset: " + error.message);
    }
  };

  // Purchase dataset license
  const purchaseDataset = async (datasetId, price) => {
    if (!marketplaceContract || !account) return;

    try {
      setPurchasing(datasetId);

      const licenseDuration = 30 * 24 * 60 * 60; // 30 days
      const priceWei = ethers.parseEther(price);

      const tx = await marketplaceContract.purchaseDatasetLicense(
        datasetId,
        ethers.ZeroAddress, // ETH payment
        licenseDuration,
        { value: priceWei }
      );

      await tx.wait();

      // Reload datasets to update access status
      await loadDatasets();

      alert("Dataset license purchased successfully!");
    } catch (error) {
      console.error("Error purchasing dataset:", error);
      alert("Error purchasing dataset: " + error.message);
    } finally {
      setPurchasing(null);
    }
  };

  useEffect(() => {
    loadDatasets();
  }, [account]);

  if (!isConnected) {
    return (
      <div className="marketplace-container">
        <h2>Dataset Marketplace</h2>
        <p>Please connect your wallet to view available datasets.</p>
      </div>
    );
  }

  return (
    <div className="marketplace-container">
      <div className="marketplace-header">
        <h2>Dataset Marketplace</h2>
        <button
          className="refresh-button"
          onClick={loadDatasets}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading datasets...</div>
      ) : datasets.length === 0 ? (
        <div className="no-datasets">
          <p>No datasets available yet.</p>
          <p>Upload a dataset to get started!</p>
        </div>
      ) : (
        <div className="datasets-grid">
          {datasets.map((dataset) => (
            <div key={dataset.id} className="dataset-card">
              <div className="dataset-header">
                <h3>{dataset.metadata.name || `Dataset #${dataset.id}`}</h3>
                <span className="dataset-version">v{dataset.version}</span>
              </div>

              <div className="dataset-info">
                <p>
                  <strong>Type:</strong>{" "}
                  {dataset.metadata.type || "Medical Data"}
                </p>
                <p>
                  <strong>Description:</strong>{" "}
                  {dataset.metadata.description || "No description available"}
                </p>
                <p>
                  <strong>Provider:</strong> {dataset.provider.slice(0, 8)}...
                </p>
                <p>
                  <strong>Price:</strong> {dataset.price} ETH
                </p>
                <p>
                  <strong>License:</strong> {dataset.licenseTerms}
                </p>
                <p>
                  <strong>Created:</strong>{" "}
                  {dataset.createdAt.toLocaleDateString()}
                </p>

                {/* Blockchain Information */}
                <div className="blockchain-info">
                  <h4>📋 Blockchain Details:</h4>
                  <p>
                    <strong>Dataset ID:</strong> #{dataset.id}
                  </p>
                  <p>
                    <strong>IPFS Hash:</strong>{" "}
                    <span className="hash-text" title={dataset.ipfsHash}>
                      {dataset.ipfsHash.slice(0, 12)}...
                    </span>
                  </p>
                  {dataset.metadata.encrypted && (
                    <p>
                      <strong>Encryption:</strong> ✅ Encrypted
                    </p>
                  )}
                  {dataset.metadata.fileSize && (
                    <p>
                      <strong>File Size:</strong>{" "}
                      {(dataset.metadata.fileSize / 1024 / 1024).toFixed(2)} MB
                    </p>
                  )}
                </div>
              </div>

              <div className="dataset-actions">
                {dataset.hasAccess ? (
                  <div className="access-granted">
                    <span className="access-badge">✅ Access Granted</span>
                    <button
                      className="download-button"
                      onClick={() => downloadDataset(dataset.id)}
                    >
                      Download Dataset
                    </button>
                  </div>
                ) : (
                  <button
                    className="purchase-button"
                    onClick={() => purchaseDataset(dataset.id, dataset.price)}
                    disabled={purchasing === dataset.id}
                  >
                    {purchasing === dataset.id
                      ? "Purchasing..."
                      : `Purchase License - ${dataset.price} ETH`}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DatasetMarketplace;
