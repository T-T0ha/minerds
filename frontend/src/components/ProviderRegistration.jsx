import React, { useState, useEffect } from "react";
import { useWeb3 } from "../context/Web3Context";
import "./ProviderRegistration.css";

const ProviderRegistration = () => {
  const { account, isConnected, datasetSBTContract } = useWeb3();
  const [isProvider, setIsProvider] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  // Check if user is already a provider
  const checkProviderStatus = async () => {
    if (!account || !datasetSBTContract) return;

    try {
      setChecking(true);
      console.log("Checking provider status on blockchain...");

      // Check directly from smart contract
      const isProviderOnChain = await datasetSBTContract.isDatasetProvider(
        account
      );
      setIsProvider(isProviderOnChain);

      console.log("Provider status:", isProviderOnChain);
    } catch (error) {
      console.error("Error checking provider status:", error);

      // Fallback to backend check
      try {
        const response = await fetch(
          `http://localhost:3001/api/provider-status/${account}`
        );

        if (response.ok) {
          const result = await response.json();
          setIsProvider(result.isProvider);
        }
      } catch (backendError) {
        console.warn(
          "Both blockchain and backend provider checks failed:",
          backendError
        );
      }
    } finally {
      setChecking(false);
    }
  };

  // Register as dataset provider
  const registerAsProvider = async () => {
    if (!account) {
      alert("Please connect your wallet first");
      return;
    }

    if (!datasetSBTContract) {
      alert("Smart contract not loaded. Please refresh the page.");
      return;
    }

    try {
      setLoading(true);
      console.log("Registering as provider on blockchain...");

      // Call the smart contract directly
      const tx = await datasetSBTContract.registerAsProvider();
      console.log("Transaction submitted:", tx.hash);

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);

      if (receipt.status === 1) {
        setIsProvider(true);
        alert(
          "Successfully registered as a dataset provider on blockchain! You can now upload datasets."
        );

        // Also call backend to sync (optional)
        try {
          const response = await fetch(
            "http://localhost:3001/api/register-provider",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ userAddress: account }),
            }
          );

          if (response.ok) {
            console.log("Backend registration synced");
          }
        } catch (backendError) {
          console.warn(
            "Backend sync failed, but blockchain registration successful:",
            backendError
          );
        }
      } else {
        throw new Error("Transaction failed");
      }
    } catch (error) {
      console.error("Error registering as provider:", error);
      alert(
        "Error registering as provider: " + (error.reason || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (account && datasetSBTContract) {
      checkProviderStatus();
    }
  }, [account, datasetSBTContract]);

  if (!isConnected) {
    return (
      <div className="provider-registration-container">
        <h2>Become a Dataset Provider</h2>
        <p>Please connect your wallet to register as a dataset provider.</p>
      </div>
    );
  }

  if (checking) {
    return (
      <div className="provider-registration-container">
        <h2>Become a Dataset Provider</h2>
        <p>Checking provider status...</p>
      </div>
    );
  }

  if (isProvider) {
    return (
      <div className="provider-registration-container">
        <div className="success-message">
          <h2>✅ You're a Registered Provider!</h2>
          <p>You can now upload datasets and earn from license sales.</p>

          <div className="provider-actions">
            <h3>What you can do now:</h3>
            <ul>
              <li>📤 Upload encrypted datasets to IPFS</li>
              <li>💰 Set pricing for your data licenses</li>
              <li>📊 Track sales and usage analytics</li>
              <li>🔄 Update dataset versions</li>
            </ul>

            <p className="next-step">
              Go to the <strong>"Upload Dataset"</strong> tab to start uploading
              your first dataset!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="provider-registration-container">
      <h2>🚀 Become a Dataset Provider</h2>
      <p className="intro-text">
        Join our healthcare data marketplace and monetize your datasets while
        contributing to medical research and innovation.
      </p>

      <div className="benefits-grid">
        <div className="benefit-card">
          <h3>🔒 Secure Storage</h3>
          <p>
            Your datasets are encrypted and stored on IPFS with blockchain
            verification
          </p>
        </div>

        <div className="benefit-card">
          <h3>💰 Earn Revenue</h3>
          <p>Set your own prices and earn from every license sale</p>
        </div>

        <div className="benefit-card">
          <h3>🌐 Global Reach</h3>
          <p>Reach researchers and organizations worldwide</p>
        </div>

        <div className="benefit-card">
          <h3>📊 Full Control</h3>
          <p>Maintain ownership while controlling access and usage</p>
        </div>
      </div>

      <div className="requirements-section">
        <h3>Requirements</h3>
        <ul className="requirements-list">
          <li>✅ Connected wallet (MetaMask recommended)</li>
          <li>✅ Valid healthcare datasets</li>
          <li>✅ Compliance with data protection regulations</li>
          <li>✅ Agreement to platform terms</li>
        </ul>
      </div>

      <div className="registration-action">
        <button
          className={`register-button ${loading ? "loading" : ""}`}
          onClick={registerAsProvider}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Registering on Blockchain...
            </>
          ) : (
            "Register as Provider (Free)"
          )}
        </button>

        <p className="disclaimer">
          Registration is free and stored on the blockchain. You'll need to
          confirm the transaction in your wallet.
        </p>
      </div>
    </div>
  );
};

export default ProviderRegistration;
