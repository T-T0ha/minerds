import React, { useState, useEffect } from "react";
import { useWeb3 } from "../context/Web3Context";
import "./MyLicenses.css";

const MyLicenses = () => {
  const { datasetSBTContract, marketplaceContract, account, isConnected } =
    useWeb3();
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadUserLicenses = async () => {
    if (!account) return;

    try {
      setLoading(true);

      // Get user's licenses from backend
      const response = await fetch(
        `http://localhost:3001/api/user-licenses/${account}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch licenses");
      }

      const backendLicenses = await response.json();

      const processedLicenses = backendLicenses.map((license) => ({
        licenseId: license.licenseId,
        datasetId: license.licenseId, // Simplified assumption for demo
        ipfsHash: license.ipfsHash,
        metadata: JSON.parse(license.metadata || "{}"),
        licenseTerms: license.licenseTerms,
        provider: license.provider,
        price: license.price,
        version: Number(license.version),
        createdAt: new Date(license.createdAt),
        // For demo purposes, assume 30-day license
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isValid: true,
      }));

      setLicenses(processedLicenses);
    } catch (error) {
      console.error("Error loading licenses:", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadDataset = async (license) => {
    if (!account) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3001/api/dataset/${license.datasetId}?userAddress=${account}`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Download failed");
      }

      // Create blob and download file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `${license.metadata.name || "dataset"}-${
        license.datasetId
      }.csv`;
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

  useEffect(() => {
    if (account) {
      loadUserLicenses();
    }
  }, [account]);

  if (!isConnected) {
    return (
      <div className="licenses-container">
        <h2>My Licenses</h2>
        <p>Please connect your wallet to view your dataset licenses.</p>
      </div>
    );
  }

  return (
    <div className="licenses-container">
      <div className="licenses-header">
        <h2>My Dataset Licenses</h2>
        <button
          className="refresh-button"
          onClick={loadUserLicenses}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading your licenses...</div>
      ) : licenses.length === 0 ? (
        <div className="no-licenses">
          <p>You don't have any dataset licenses yet.</p>
          <p>Visit the marketplace to purchase access to datasets!</p>
        </div>
      ) : (
        <div className="licenses-grid">
          {licenses.map((license) => (
            <div key={license.licenseId} className="license-card">
              <div className="license-header">
                <h3>
                  {license.metadata.name || `Dataset #${license.datasetId}`}
                </h3>
                <div className="license-status">
                  {license.isValid ? (
                    <span className="status-valid">✅ Valid</span>
                  ) : (
                    <span className="status-expired">❌ Expired</span>
                  )}
                </div>
              </div>

              <div className="license-info">
                <p>
                  <strong>License ID:</strong> {license.licenseId}
                </p>
                <p>
                  <strong>Dataset ID:</strong> {license.datasetId}
                </p>
                <p>
                  <strong>Type:</strong>{" "}
                  {license.metadata.type || "Medical Data"}
                </p>
                <p>
                  <strong>Provider:</strong> {license.provider.slice(0, 8)}...
                </p>
                <p>
                  <strong>License Terms:</strong> {license.licenseTerms}
                </p>
                <p>
                  <strong>Expires:</strong>{" "}
                  {license.expiresAt.toLocaleDateString()}
                </p>
                <p>
                  <strong>IPFS Hash:</strong> {license.ipfsHash.slice(0, 20)}...
                </p>
              </div>

              <div className="license-actions">
                {license.isValid ? (
                  <button
                    className="download-button"
                    onClick={() => downloadDataset(license)}
                  >
                    Download Dataset
                  </button>
                ) : (
                  <button className="renew-button" disabled>
                    License Expired
                  </button>
                )}
              </div>

              <div className="license-metadata">
                <details>
                  <summary>Dataset Details</summary>
                  <div className="metadata-content">
                    <p>
                      <strong>Description:</strong>{" "}
                      {license.metadata.description || "No description"}
                    </p>
                    <p>
                      <strong>File Size:</strong>{" "}
                      {license.metadata.fileSize
                        ? `${(license.metadata.fileSize / 1024 / 1024).toFixed(
                            2
                          )} MB`
                        : "Unknown"}
                    </p>
                    <p>
                      <strong>Version:</strong> {license.version}
                    </p>
                    <p>
                      <strong>Created:</strong>{" "}
                      {license.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                </details>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyLicenses;
