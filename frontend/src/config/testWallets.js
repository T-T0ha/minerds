// Polygon Amoy testnet configuration
// You can use these accounts for testing on Polygon Amoy
// Make sure to get test MATIC from the faucet: https://faucet.polygon.technology/

export const TEST_WALLETS = [
  {
    address: "0x80D387Dc5a93a5aD2BDB7Df8eD81f0D021a52950",
    privateKey:
      "0x089fd43efc0f45e21f773df72d0d5e24fa4a195c372aca7f75ca49b782de4ef8",
    name: "Main Account (Deployer)",
    balance: "16.46 MATIC",
  },
  // Add more accounts as needed for testing
];

// Helper function to get test wallet by index
export const getTestWallet = (index = 0) => {
  if (index >= TEST_WALLETS.length) {
    throw new Error(
      `Test wallet index ${index} not available. Max index: ${
        TEST_WALLETS.length - 1
      }`
    );
  }
  return TEST_WALLETS[index];
};

// Check if we're on Polygon Amoy testnet
export const isAmoyTestnet = () => {
  return window.ethereum?.chainId === "0x13882"; // 80002 in hex
};

// Get RPC URL for Polygon Amoy
export const getAmoyRpcUrl = () => {
  return "https://polygon-amoy.g.alchemy.com/v2/KfUG5RUwO2iaiZq8P_r3E";
};
