import React, { useState, useEffect } from "react";
import { useWeb3 } from "../context/Web3Context";
import "./ProviderRegistration.css";

const ProviderRegistration = () => {
  const { account, isConnected } = useWeb3();
  const [isProvider, setIsProvider] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  // Check if user is already a provider
  const checkProviderStatus = async () => {
    if (!account) return;

    try {
      setChecking(true);
      const response = await fetch(
        `http://localhost:3001/api/is-provider/${account}`
      );

      if (response.ok) {
        const data = await response.json();
        setIsProvider(data.isProvider);
      }
    } catch (error) {
      console.error("Error checking provider status:", error);
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

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:3001/api/register-provider",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userAddress: account,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || error.error || "Registration failed");
      }

      const result = await response.json();

      if (result.success) {
        setIsProvider(true);
        alert(
          "Successfully registered as a dataset provider! You can now upload datasets."
        );
      }
    } catch (error) {
      console.error("Error registering as provider:", error);
      alert("Error registering as provider: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (account) {
      checkProviderStatus();
    }
  }, [account]);

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

  return (
    <div className="provider-registration-container">
      <h2>Dataset Provider Registration</h2>

      {isProvider ? (
        <div className="provider-status-success">
          <div className="status-icon">✅</div>
          <h3>You are a registered dataset provider!</h3>
          <p>
            You can now upload datasets to the platform and earn from license
            sales.
          </p>
          <div className="provider-benefits">
            <h4>Your Benefits:</h4>
            <ul>
              <li>Upload and monetize healthcare datasets</li>
              <li>Earn royalties from each license sale</li>
              <li>Maintain full control over your data</li>
              <li>Automatic encryption and IPFS storage</li>
              <li>Immutable provenance tracking</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="provider-registration-form">
          <div className="registration-info">
            <h3>Join our Healthcare Data Ecosystem</h3>
            <p>
              Register as a dataset provider to contribute valuable healthcare
              data to researchers and institutions worldwide.
            </p>

            <div className="benefits-grid">
              <div className="benefit-card">
                <h4>🔐 Secure Storage</h4>
                <p>
                  Your datasets are encrypted and stored on IPFS with blockchain
                  provenance
                </p>
              </div>
              <div className="benefit-card">
                <h4>💰 Earn Revenue</h4>
                <p>
                  Receive payments automatically when researchers license your
                  data
                </p>
              </div>
              <div className="benefit-card">
                <h4>🏥 Help Research</h4>
                <p>
                  Contribute to medical breakthroughs while maintaining data
                  sovereignty
                </p>
              </div>
              <div className="benefit-card">
                <h4>⚡ Easy Management</h4>
                <p>
                  Simple upload process with automatic tokenization and
                  licensing
                </p>
              </div>
            </div>

            <div className="registration-requirements">
              <h4>Requirements:</h4>
              <ul>
                <li>Valid Ethereum wallet connected</li>
                <li>Compliance with HIPAA/GDPR regulations</li>
                <li>Properly anonymized healthcare data</li>
                <li>Clear licensing terms for your datasets</li>
              </ul>
            </div>
          </div>

          <div className="registration-action">
            <button
              className="register-button"
              onClick={registerAsProvider}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Registering...
                </>
              ) : (
                "Register as Dataset Provider"
              )}
            </button>

            <p className="registration-note">
              Registration is free and gives you immediate access to upload
              datasets.
            </p>
          </div>
        </div>
      )}

      <div className="connected-wallet-info">
        <p>
          <strong>Connected Wallet:</strong> {account}
        </p>
      </div>
    </div>
  );
};

export default ProviderRegistration;
