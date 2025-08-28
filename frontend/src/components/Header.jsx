import React from "react";
import { useWeb3 } from "../context/Web3Context";
import "./Header.css";

const Header = () => {
  const {
    account,
    loading,
    error,
    initWeb3,
    initTestWallet,
    switchTestWallet,
    disconnect,
    isConnected,
    isTestMode,
    testWalletIndex,
    testWallets,
    isDevelopment,
  } = useWeb3();

  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleTestWalletChange = (e) => {
    const walletIndex = parseInt(e.target.value);
    switchTestWallet(walletIndex);
  };

  const getCurrentWalletName = () => {
    if (isTestMode && testWallets[testWalletIndex]) {
      return testWallets[testWalletIndex].name;
    }
    return "MetaMask";
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <h1>🏥 HealthChain</h1>
          <p>Healthcare Data Provenance Platform</p>
        </div>

        <div className="wallet-section">
          {error && <div className="error-message">{error}</div>}

          {!isConnected ? (
            <div className="connect-options">
              <button
                className="connect-button"
                onClick={initWeb3}
                disabled={loading}
              >
                {loading ? "Connecting..." : "Connect MetaMask"}
              </button>

              {isDevelopment && (
                <>
                  <span className="separator">or</span>
                  <button
                    className="test-wallet-button"
                    onClick={() => initTestWallet(0)}
                    disabled={loading}
                  >
                    {loading ? "Connecting..." : "Use Test Wallet"}
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="wallet-info">
              <div className="account-info">
                <span className="account-label">{getCurrentWalletName()}:</span>
                <span className="account-address">
                  {formatAddress(account)}
                </span>
              </div>

              {isTestMode && isDevelopment && (
                <div className="test-wallet-selector">
                  <select
                    value={testWalletIndex}
                    onChange={handleTestWalletChange}
                    className="wallet-dropdown"
                  >
                    {testWallets.map((wallet, index) => (
                      <option key={index} value={index}>
                        {wallet.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button className="disconnect-button" onClick={disconnect}>
                Disconnect
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
