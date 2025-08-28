import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import {
  CONTRACT_ADDRESSES,
  DATASET_SBT_ABI,
  MARKETPLACE_ABI,
  NETWORK_CONFIG,
} from "../contracts/contracts";
import {
  TEST_WALLETS,
  getTestWallet,
  isDevelopment,
  getLocalRpcUrl,
} from "../config/testWallets";

const Web3Context = createContext();

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
};

export const Web3Provider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [datasetSBTContract, setDatasetSBTContract] = useState(null);
  const [marketplaceContract, setMarketplaceContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isTestMode, setIsTestMode] = useState(false);
  const [testWalletIndex, setTestWalletIndex] = useState(0);

  // Initialize Web3 with test wallet
  const initTestWallet = async (walletIndex = 0) => {
    try {
      setLoading(true);
      setError(null);

      if (!isDevelopment()) {
        throw new Error("Test wallets can only be used in development mode");
      }

      // Get test wallet
      const testWallet = getTestWallet(walletIndex);

      // Create provider and signer for local Hardhat network
      const web3Provider = new ethers.JsonRpcProvider(getLocalRpcUrl());
      const web3Signer = new ethers.Wallet(testWallet.privateKey, web3Provider);

      // Create contract instances
      const sbtContract = new ethers.Contract(
        CONTRACT_ADDRESSES.DATASET_SBT,
        DATASET_SBT_ABI,
        web3Signer
      );

      const marketContract = new ethers.Contract(
        CONTRACT_ADDRESSES.MARKETPLACE,
        MARKETPLACE_ABI,
        web3Signer
      );

      setProvider(web3Provider);
      setSigner(web3Signer);
      setAccount(testWallet.address);
      setDatasetSBTContract(sbtContract);
      setMarketplaceContract(marketContract);
      setIsTestMode(true);
      setTestWalletIndex(walletIndex);

      console.log(
        `Connected to test wallet: ${testWallet.name} (${testWallet.address})`
      );
    } catch (err) {
      setError(err.message);
      console.error("Test wallet initialization error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Switch test wallet
  const switchTestWallet = async (walletIndex) => {
    if (isTestMode) {
      await initTestWallet(walletIndex);
    }
  };
  // Initialize Web3 with MetaMask
  const initWeb3 = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!window.ethereum) {
        throw new Error("MetaMask is not installed");
      }

      // Request account access
      await window.ethereum.request({ method: "eth_requestAccounts" });

      // Create provider and signer
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const web3Signer = await web3Provider.getSigner();
      const userAccount = await web3Signer.getAddress();

      // Check if we're on the correct network
      const network = await web3Provider.getNetwork();
      if (Number(network.chainId) !== NETWORK_CONFIG.chainId) {
        await switchToLocalNetwork();
      }

      // Create contract instances
      const sbtContract = new ethers.Contract(
        CONTRACT_ADDRESSES.DATASET_SBT,
        DATASET_SBT_ABI,
        web3Signer
      );

      const marketContract = new ethers.Contract(
        CONTRACT_ADDRESSES.MARKETPLACE,
        MARKETPLACE_ABI,
        web3Signer
      );

      setProvider(web3Provider);
      setSigner(web3Signer);
      setAccount(userAccount);
      setDatasetSBTContract(sbtContract);
      setMarketplaceContract(marketContract);
      setIsTestMode(false);
    } catch (err) {
      setError(err.message);
      console.error("Web3 initialization error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Switch to local Hardhat network
  const switchToLocalNetwork = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${NETWORK_CONFIG.chainId.toString(16)}` }],
      });
    } catch (switchError) {
      // If network doesn't exist, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: `0x${NETWORK_CONFIG.chainId.toString(16)}`,
              chainName: NETWORK_CONFIG.chainName,
              nativeCurrency: NETWORK_CONFIG.nativeCurrency,
              rpcUrls: NETWORK_CONFIG.rpcUrls,
              blockExplorerUrls: NETWORK_CONFIG.blockExplorerUrls,
            },
          ],
        });
      } else {
        throw switchError;
      }
    }
  };

  // Disconnect wallet
  const disconnect = () => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setDatasetSBTContract(null);
    setMarketplaceContract(null);
    setError(null);
    setIsTestMode(false);
    setTestWalletIndex(0);
  };

  // Listen for account changes (only for MetaMask)
  useEffect(() => {
    if (window.ethereum && !isTestMode) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          disconnect();
        } else if (accounts[0] !== account) {
          initWeb3();
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, [account, isTestMode]);

  const value = {
    provider,
    signer,
    account,
    datasetSBTContract,
    marketplaceContract,
    loading,
    error,
    initWeb3,
    initTestWallet,
    switchTestWallet,
    disconnect,
    isConnected: !!account,
    isTestMode,
    testWalletIndex,
    testWallets: TEST_WALLETS,
    isDevelopment: isDevelopment(),
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};
