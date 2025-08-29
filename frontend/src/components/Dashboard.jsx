import React, { useState, useEffect } from "react";
import { useWeb3 } from "../context/Web3Context";
import "./Dashboard.css";

const Dashboard = () => {
  const { account, isConnected } = useWeb3();
  const [stats, setStats] = useState({
    totalDatasets: 12,
    myLicenses: 3,
    pendingAttestations: 5,
    totalTransactions: 89,
    myEarnings: "2.45",
    governanceTokens: 150,
  });

  const [recentActivity] = useState([
    {
      id: 1,
      type: "license_purchased",
      dataset: "COVID-19 Patient Records",
      amount: "0.5 ETH",
      timestamp: "2 hours ago",
      status: "completed",
    },
    {
      id: 2,
      type: "attestation_submitted",
      dataset: "Genomic Sequencing Data",
      action: "Quality Verified",
      timestamp: "1 day ago",
      status: "pending",
    },
    {
      id: 3,
      type: "dataset_uploaded",
      dataset: "MRI Brain Scans",
      earnings: "+0.1 ETH",
      timestamp: "3 days ago",
      status: "active",
    },
  ]);

  if (!isConnected) {
    return (
      <div className="dashboard-container">
        <div className="connect-prompt">
          <div className="connect-icon">🔗</div>
          <h2>Connect Your Wallet</h2>
          <p>Please connect your wallet to access the dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Dashboard</h1>
          <p>
            Welcome back, {account?.slice(0, 8)}...{account?.slice(-6)}
          </p>
        </div>
        <div className="user-role-badge">
          <span className="role-icon">👨‍🔬</span>
          <span>Verified Researcher</span>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{stats.totalDatasets}</h3>
            <p>Available Datasets</p>
            <div className="stat-trend">+2 this week</div>
          </div>
        </div>

        <div className="stat-card secondary">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>{stats.myLicenses}</h3>
            <p>My Licenses</p>
            <div className="stat-trend">Active</div>
          </div>
        </div>

        <div className="stat-card accent">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.pendingAttestations}</h3>
            <p>Pending Attestations</p>
            <div className="stat-trend">Review Required</div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>{stats.myEarnings} ETH</h3>
            <p>Total Earnings</p>
            <div className="stat-trend">+0.3 ETH this month</div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="content-section">
          <div className="section-header">
            <h2>Recent Activity</h2>
            <button className="view-all-btn">View All</button>
          </div>

          <div className="activity-list">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon">
                  {activity.type === "license_purchased" && "🛒"}
                  {activity.type === "attestation_submitted" && "✍️"}
                  {activity.type === "dataset_uploaded" && "📤"}
                </div>
                <div className="activity-content">
                  <div className="activity-title">
                    {activity.type === "license_purchased" &&
                      "License Purchased"}
                    {activity.type === "attestation_submitted" &&
                      "Attestation Submitted"}
                    {activity.type === "dataset_uploaded" && "Dataset Uploaded"}
                  </div>
                  <div className="activity-dataset">{activity.dataset}</div>
                  <div className="activity-timestamp">{activity.timestamp}</div>
                </div>
                <div className="activity-meta">
                  {activity.amount && (
                    <div className="activity-amount">{activity.amount}</div>
                  )}
                  {activity.earnings && (
                    <div className="activity-earnings">{activity.earnings}</div>
                  )}
                  <div className={`activity-status ${activity.status}`}>
                    {activity.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sidebar-section">
          <div className="governance-card">
            <div className="card-header">
              <h3>🏛️ DAO Governance</h3>
            </div>
            <div className="governance-content">
              <div className="governance-stat">
                <span className="governance-value">
                  {stats.governanceTokens}
                </span>
                <span className="governance-label">Governance Tokens</span>
              </div>
              <div className="governance-actions">
                <button className="governance-btn primary">
                  Vote on Proposals
                </button>
                <button className="governance-btn secondary">
                  Submit Attestation
                </button>
              </div>
            </div>
          </div>

          <div className="quick-actions">
            <h3>Quick Actions</h3>
            <div className="action-buttons">
              <button className="action-btn">
                <span className="action-icon">📤</span>
                Upload Dataset
              </button>
              <button className="action-btn">
                <span className="action-icon">🔍</span>
                Browse Marketplace
              </button>
              <button className="action-btn">
                <span className="action-icon">📊</span>
                View Analytics
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
