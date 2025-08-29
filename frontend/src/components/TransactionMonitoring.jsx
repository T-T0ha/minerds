import React, { useState, useEffect } from "react";
import "./TransactionMonitoring.css";

const TransactionMonitoring = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedTimeframe, setSelectedTimeframe] = useState("24h");
  const [realTimeData, setRealTimeData] = useState([]);

  // Mock real-time transaction data
  const mockTransactions = [
    {
      id: "tx_001",
      type: "dataset_purchase",
      dataset: "Climate Data 2024",
      buyer: "0x742d...a8f3",
      seller: "0x1a3b...d4e5",
      amount: "2.5 ETH",
      timestamp: new Date(Date.now() - 30000),
      status: "completed",
      gasUsed: "0.0023 ETH",
      blockNumber: 18945672,
    },
    {
      id: "tx_002",
      type: "license_grant",
      dataset: "Medical Imaging Set",
      buyer: "0x8f2c...b9a1",
      seller: "0x3d4e...f5a2",
      amount: "1.8 ETH",
      timestamp: new Date(Date.now() - 120000),
      status: "pending",
      gasUsed: "0.0019 ETH",
      blockNumber: null,
    },
    {
      id: "tx_003",
      type: "attestation",
      dataset: "Financial Markets Data",
      attester: "0x5b6c...a7d8",
      provider: "0x9e0f...c1b2",
      amount: "0.1 ETH",
      timestamp: new Date(Date.now() - 300000),
      status: "completed",
      gasUsed: "0.0015 ETH",
      blockNumber: 18945651,
    },
    {
      id: "tx_004",
      type: "governance_vote",
      proposal: "Reduce Platform Fees",
      voter: "0x742d...a8f3",
      amount: "0 ETH",
      timestamp: new Date(Date.now() - 450000),
      status: "completed",
      gasUsed: "0.0008 ETH",
      blockNumber: 18945642,
    },
    {
      id: "tx_005",
      type: "dataset_upload",
      dataset: "IoT Sensor Data Collection",
      provider: "0x4c5d...e6f7",
      amount: "0.05 ETH",
      timestamp: new Date(Date.now() - 600000),
      status: "failed",
      gasUsed: "0.0012 ETH",
      blockNumber: null,
      error: "Insufficient gas",
    },
  ];

  // Mock analytics data
  const analyticsData = {
    "24h": {
      totalTransactions: 1247,
      totalVolume: "156.3 ETH",
      averageGas: "0.0018 ETH",
      successRate: 96.2,
      topDatasets: [
        { name: "Climate Data 2024", transactions: 23, volume: "45.2 ETH" },
        { name: "Medical Imaging Set", transactions: 18, volume: "32.1 ETH" },
        {
          name: "Financial Markets Data",
          transactions: 15,
          volume: "28.7 ETH",
        },
      ],
    },
    "7d": {
      totalTransactions: 8934,
      totalVolume: "1,234.7 ETH",
      averageGas: "0.0021 ETH",
      successRate: 95.8,
      topDatasets: [
        { name: "Climate Data 2024", transactions: 156, volume: "312.4 ETH" },
        { name: "Medical Imaging Set", transactions: 142, volume: "287.3 ETH" },
        {
          name: "Financial Markets Data",
          transactions: 128,
          volume: "241.8 ETH",
        },
      ],
    },
    "30d": {
      totalTransactions: 34567,
      totalVolume: "4,892.1 ETH",
      averageGas: "0.0024 ETH",
      successRate: 94.7,
      topDatasets: [
        { name: "Climate Data 2024", transactions: 623, volume: "1,245.7 ETH" },
        {
          name: "Medical Imaging Set",
          transactions: 578,
          volume: "1,134.2 ETH",
        },
        {
          name: "Financial Markets Data",
          transactions: 512,
          volume: "987.6 ETH",
        },
      ],
    },
  };

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        // 30% chance of new transaction
        const newTx = {
          id: `tx_${Date.now()}`,
          type: ["dataset_purchase", "license_grant", "attestation"][
            Math.floor(Math.random() * 3)
          ],
          dataset: ["New Dataset", "Research Data", "Analysis Set"][
            Math.floor(Math.random() * 3)
          ],
          amount: `${(Math.random() * 5).toFixed(2)} ETH`,
          timestamp: new Date(),
          status: Math.random() > 0.1 ? "completed" : "pending",
          gasUsed: `${(Math.random() * 0.005).toFixed(4)} ETH`,
          blockNumber:
            Math.random() > 0.1
              ? Math.floor(Math.random() * 1000000) + 18945000
              : null,
        };
        setRealTimeData((prev) => [newTx, ...prev.slice(0, 9)]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "#48bb78";
      case "pending":
        return "#ed8936";
      case "failed":
        return "#f56565";
      default:
        return "#a0aec0";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "dataset_purchase":
        return "🛒";
      case "license_grant":
        return "📜";
      case "attestation":
        return "✅";
      case "governance_vote":
        return "🗳️";
      case "dataset_upload":
        return "📤";
      default:
        return "📋";
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return timestamp.toLocaleDateString();
  };

  const filteredTransactions = [...mockTransactions, ...realTimeData].filter(
    (tx) => {
      if (activeFilter === "all") return true;
      return tx.type === activeFilter;
    }
  );

  const currentAnalytics = analyticsData[selectedTimeframe];

  return (
    <div className="transaction-monitoring">
      <div className="monitoring-header">
        <div className="header-content">
          <h1>Transaction Monitoring</h1>
          <p>Real-time insights into blockchain activity and platform usage</p>
        </div>
        <div className="live-indicator">
          <div className="live-dot"></div>
          <span>Live</span>
        </div>
      </div>

      <div className="analytics-overview">
        <div className="timeframe-selector">
          {["24h", "7d", "30d"].map((period) => (
            <button
              key={period}
              className={`timeframe-btn ${
                selectedTimeframe === period ? "active" : ""
              }`}
              onClick={() => setSelectedTimeframe(period)}
            >
              {period}
            </button>
          ))}
        </div>

        <div className="analytics-grid">
          <div className="analytics-card">
            <div className="card-icon">📊</div>
            <div className="card-content">
              <h3>{currentAnalytics.totalTransactions.toLocaleString()}</h3>
              <p>Total Transactions</p>
              <span className="trend positive">+12.5% vs prev period</span>
            </div>
          </div>

          <div className="analytics-card">
            <div className="card-icon">💰</div>
            <div className="card-content">
              <h3>{currentAnalytics.totalVolume}</h3>
              <p>Trading Volume</p>
              <span className="trend positive">+8.3% vs prev period</span>
            </div>
          </div>

          <div className="analytics-card">
            <div className="card-icon">⛽</div>
            <div className="card-content">
              <h3>{currentAnalytics.averageGas}</h3>
              <p>Avg Gas Cost</p>
              <span className="trend negative">-2.1% vs prev period</span>
            </div>
          </div>

          <div className="analytics-card">
            <div className="card-icon">✅</div>
            <div className="card-content">
              <h3>{currentAnalytics.successRate}%</h3>
              <p>Success Rate</p>
              <span className="trend positive">+1.2% vs prev period</span>
            </div>
          </div>
        </div>
      </div>

      <div className="monitoring-content">
        <div className="transactions-section">
          <div className="section-header">
            <h2>Recent Transactions</h2>
            <div className="transaction-filters">
              {[
                { key: "all", label: "All", icon: "📋" },
                { key: "dataset_purchase", label: "Purchases", icon: "🛒" },
                { key: "license_grant", label: "Licenses", icon: "📜" },
                { key: "attestation", label: "Attestations", icon: "✅" },
                { key: "governance_vote", label: "Governance", icon: "🗳️" },
              ].map((filter) => (
                <button
                  key={filter.key}
                  className={`filter-btn ${
                    activeFilter === filter.key ? "active" : ""
                  }`}
                  onClick={() => setActiveFilter(filter.key)}
                >
                  {filter.icon} {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="transactions-list">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="transaction-item">
                <div className="transaction-icon">
                  {getTypeIcon(transaction.type)}
                </div>

                <div className="transaction-details">
                  <div className="transaction-main">
                    <h4 className="transaction-title">
                      {transaction.type
                        .replace("_", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </h4>
                    <p className="transaction-description">
                      {transaction.dataset || transaction.proposal}
                    </p>
                  </div>

                  <div className="transaction-participants">
                    {transaction.buyer && (
                      <div className="participant">
                        <span className="participant-label">Buyer:</span>
                        <span className="participant-address">
                          {transaction.buyer}
                        </span>
                      </div>
                    )}
                    {transaction.seller && (
                      <div className="participant">
                        <span className="participant-label">Seller:</span>
                        <span className="participant-address">
                          {transaction.seller}
                        </span>
                      </div>
                    )}
                    {transaction.attester && (
                      <div className="participant">
                        <span className="participant-label">Attester:</span>
                        <span className="participant-address">
                          {transaction.attester}
                        </span>
                      </div>
                    )}
                    {transaction.voter && (
                      <div className="participant">
                        <span className="participant-label">Voter:</span>
                        <span className="participant-address">
                          {transaction.voter}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="transaction-metadata">
                  <div className="transaction-amount">{transaction.amount}</div>
                  <div
                    className="transaction-status"
                    style={{
                      backgroundColor: `${getStatusColor(
                        transaction.status
                      )}20`,
                      color: getStatusColor(transaction.status),
                    }}
                  >
                    {transaction.status}
                  </div>
                  <div className="transaction-time">
                    {formatTimeAgo(transaction.timestamp)}
                  </div>
                  {transaction.blockNumber && (
                    <div className="transaction-block">
                      Block #{transaction.blockNumber}
                    </div>
                  )}
                  <div className="transaction-gas">
                    Gas: {transaction.gasUsed}
                  </div>
                  {transaction.error && (
                    <div className="transaction-error">
                      Error: {transaction.error}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="insights-sidebar">
          <div className="insights-card">
            <h3>Top Datasets ({selectedTimeframe})</h3>
            <div className="dataset-rankings">
              {currentAnalytics.topDatasets.map((dataset, index) => (
                <div key={index} className="dataset-rank">
                  <div className="rank-number">#{index + 1}</div>
                  <div className="rank-content">
                    <div className="dataset-name">{dataset.name}</div>
                    <div className="dataset-stats">
                      <span>{dataset.transactions} txns</span>
                      <span>{dataset.volume}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="insights-card">
            <h3>Network Health</h3>
            <div className="health-metrics">
              <div className="health-item">
                <div className="health-label">Block Time</div>
                <div className="health-value good">12.3s</div>
              </div>
              <div className="health-item">
                <div className="health-label">Pending Txns</div>
                <div className="health-value normal">47</div>
              </div>
              <div className="health-item">
                <div className="health-label">Gas Price</div>
                <div className="health-value normal">23 gwei</div>
              </div>
              <div className="health-item">
                <div className="health-label">TPS</div>
                <div className="health-value good">3.7</div>
              </div>
            </div>
          </div>

          <div className="insights-card">
            <h3>Platform Insights</h3>
            <div className="insight-item">
              <div className="insight-icon">📈</div>
              <div className="insight-text">
                Dataset purchases have increased by 25% this week
              </div>
            </div>
            <div className="insight-item">
              <div className="insight-icon">🔒</div>
              <div className="insight-text">
                All transactions completed with 100% security
              </div>
            </div>
            <div className="insight-item">
              <div className="insight-icon">⚡</div>
              <div className="insight-text">
                Average transaction time: 2.3 seconds
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionMonitoring;
