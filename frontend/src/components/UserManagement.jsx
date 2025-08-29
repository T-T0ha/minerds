import React, { useState } from "react";
import "./UserManagement.css";

const UserManagement = () => {
  const [activeSection, setActiveSection] = useState("roles");

  // Mock user data
  const users = [
    {
      id: 1,
      address: "0x742d35Cc6075C2532C08BB7b23a8a8f3",
      role: "Data Provider",
      status: "verified",
      joinDate: "2024-01-15",
      datasets: 12,
      reputation: 9.2,
      earnings: "145.7 ETH",
      badges: ["Top Provider", "Quality Pioneer", "Community Leader"],
    },
    {
      id: 2,
      address: "0x1a3b45C3512D93F642f64180aa3C2eB8",
      role: "Researcher",
      status: "verified",
      joinDate: "2024-01-08",
      datasets: 0,
      reputation: 8.5,
      purchases: 28,
      spending: "67.3 ETH",
      badges: ["Research Expert", "Active Buyer"],
    },
    {
      id: 3,
      address: "0x8f2c4B9a1D7e6F8c12345678901234a5",
      role: "Attestation Expert",
      status: "verified",
      joinDate: "2024-01-03",
      datasets: 0,
      reputation: 9.8,
      attestations: 156,
      accuracy: "98.7%",
      badges: ["Master Attestor", "Trust Builder", "Quality Guardian"],
    },
    {
      id: 4,
      address: "0x3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a",
      role: "DAO Member",
      status: "active",
      joinDate: "2024-01-20",
      datasets: 3,
      reputation: 7.8,
      proposals: 5,
      votes: 47,
      badges: ["Governance Participant", "Proposal Creator"],
    },
    {
      id: 5,
      address: "0x9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b",
      role: "Platform Admin",
      status: "verified",
      joinDate: "2023-12-01",
      datasets: 0,
      reputation: 10.0,
      modActions: 234,
      disputes: 12,
      badges: ["Administrator", "Platform Guardian", "Dispute Resolver"],
    },
  ];

  const permissions = {
    "Data Provider": [
      "Upload datasets",
      "Set pricing for datasets",
      "Manage dataset licenses",
      "View earnings analytics",
      "Respond to buyer queries",
      "Update dataset metadata",
    ],
    Researcher: [
      "Browse marketplace",
      "Purchase dataset licenses",
      "Download purchased datasets",
      "Rate and review datasets",
      "Submit research proposals",
      "Access research tools",
    ],
    "Attestation Expert": [
      "Review dataset quality",
      "Submit attestation reports",
      "Vote on attestation disputes",
      "Access quality metrics",
      "Earn attestation rewards",
      "Manage expert profile",
    ],
    "DAO Member": [
      "Create governance proposals",
      "Vote on all proposals",
      "Participate in discussions",
      "Access treasury information",
      "Delegate voting power",
      "View governance analytics",
    ],
    "Platform Admin": [
      "Moderate platform content",
      "Resolve user disputes",
      "Manage platform settings",
      "Access all user data",
      "Suspend/ban accounts",
      "Generate platform reports",
    ],
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "verified":
        return "#48bb78";
      case "active":
        return "#4299e1";
      case "pending":
        return "#ed8936";
      case "suspended":
        return "#f56565";
      default:
        return "#a0aec0";
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "Data Provider":
        return "📊";
      case "Researcher":
        return "🔬";
      case "Attestation Expert":
        return "✅";
      case "DAO Member":
        return "🏛️";
      case "Platform Admin":
        return "👑";
      default:
        return "👤";
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "Data Provider":
        return "#667eea";
      case "Researcher":
        return "#4299e1";
      case "Attestation Expert":
        return "#48bb78";
      case "DAO Member":
        return "#ed8936";
      case "Platform Admin":
        return "#9f7aea";
      default:
        return "#a0aec0";
    }
  };

  return (
    <div className="user-management">
      <div className="management-header">
        <div className="header-content">
          <h1>User Management</h1>
          <p>
            Manage roles, permissions, and user activities across the platform
          </p>
        </div>
        <div className="platform-stats">
          <div className="stat-item">
            <span className="stat-value">2,847</span>
            <span className="stat-label">Total Users</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">1,245</span>
            <span className="stat-label">Verified</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">89%</span>
            <span className="stat-label">Active Rate</span>
          </div>
        </div>
      </div>

      <div className="management-navigation">
        <button
          className={`nav-tab ${activeSection === "roles" ? "active" : ""}`}
          onClick={() => setActiveSection("roles")}
        >
          👥 User Roles
        </button>
        <button
          className={`nav-tab ${
            activeSection === "permissions" ? "active" : ""
          }`}
          onClick={() => setActiveSection("permissions")}
        >
          🔒 Permissions
        </button>
        <button
          className={`nav-tab ${activeSection === "analytics" ? "active" : ""}`}
          onClick={() => setActiveSection("analytics")}
        >
          📊 Analytics
        </button>
      </div>

      {activeSection === "roles" && (
        <div className="roles-section">
          <div className="section-header">
            <h2>Platform Users</h2>
            <div className="user-filters">
              <select className="filter-select">
                <option>All Roles</option>
                <option>Data Provider</option>
                <option>Researcher</option>
                <option>Attestation Expert</option>
                <option>DAO Member</option>
                <option>Platform Admin</option>
              </select>
              <select className="filter-select">
                <option>All Status</option>
                <option>Verified</option>
                <option>Active</option>
                <option>Pending</option>
                <option>Suspended</option>
              </select>
            </div>
          </div>

          <div className="users-grid">
            {users.map((user) => (
              <div key={user.id} className="user-card">
                <div className="user-header">
                  <div className="user-avatar">{getRoleIcon(user.role)}</div>
                  <div className="user-info">
                    <div className="user-address">{user.address}</div>
                    <div
                      className="user-role"
                      style={{ color: getRoleColor(user.role) }}
                    >
                      {user.role}
                    </div>
                  </div>
                  <div
                    className="user-status"
                    style={{
                      backgroundColor: `${getStatusColor(user.status)}20`,
                      color: getStatusColor(user.status),
                    }}
                  >
                    {user.status}
                  </div>
                </div>

                <div className="user-metrics">
                  <div className="metric-row">
                    <span className="metric-label">Reputation:</span>
                    <span className="metric-value">{user.reputation}/10</span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Member Since:</span>
                    <span className="metric-value">{user.joinDate}</span>
                  </div>
                  {user.datasets > 0 && (
                    <div className="metric-row">
                      <span className="metric-label">Datasets:</span>
                      <span className="metric-value">{user.datasets}</span>
                    </div>
                  )}
                  {user.earnings && (
                    <div className="metric-row">
                      <span className="metric-label">Earnings:</span>
                      <span className="metric-value">{user.earnings}</span>
                    </div>
                  )}
                  {user.purchases && (
                    <div className="metric-row">
                      <span className="metric-label">Purchases:</span>
                      <span className="metric-value">{user.purchases}</span>
                    </div>
                  )}
                  {user.attestations && (
                    <div className="metric-row">
                      <span className="metric-label">Attestations:</span>
                      <span className="metric-value">{user.attestations}</span>
                    </div>
                  )}
                  {user.proposals && (
                    <div className="metric-row">
                      <span className="metric-label">Proposals:</span>
                      <span className="metric-value">{user.proposals}</span>
                    </div>
                  )}
                </div>

                <div className="user-badges">
                  {user.badges.map((badge, index) => (
                    <span key={index} className="badge">
                      {badge}
                    </span>
                  ))}
                </div>

                <div className="user-actions">
                  <button className="action-btn primary">View Profile</button>
                  <button className="action-btn secondary">Send Message</button>
                  {user.role !== "Platform Admin" && (
                    <button className="action-btn warning">Moderate</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSection === "permissions" && (
        <div className="permissions-section">
          <div className="section-header">
            <h2>Role Permissions</h2>
            <p>Manage what each role can do on the platform</p>
          </div>

          <div className="permissions-grid">
            {Object.entries(permissions).map(([role, perms]) => (
              <div key={role} className="permission-card">
                <div className="permission-header">
                  <div className="role-icon">{getRoleIcon(role)}</div>
                  <h3 style={{ color: getRoleColor(role) }}>{role}</h3>
                </div>

                <div className="permissions-list">
                  {perms.map((permission, index) => (
                    <div key={index} className="permission-item">
                      <span className="permission-check">✅</span>
                      <span className="permission-text">{permission}</span>
                    </div>
                  ))}
                </div>

                <div className="permission-actions">
                  <button className="action-btn secondary">
                    Edit Permissions
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSection === "analytics" && (
        <div className="analytics-section">
          <div className="section-header">
            <h2>User Analytics</h2>
            <p>Insights into user behavior and platform growth</p>
          </div>

          <div className="analytics-grid">
            <div className="analytics-card">
              <h3>User Growth</h3>
              <div className="growth-stat">
                <span className="growth-number">+247</span>
                <span className="growth-label">New users this month</span>
              </div>
              <div className="growth-chart">📈 +18.5% vs last month</div>
            </div>

            <div className="analytics-card">
              <h3>Role Distribution</h3>
              <div className="role-stats">
                <div className="role-stat">
                  <span className="role-name">📊 Data Providers</span>
                  <span className="role-count">1,247 (44%)</span>
                </div>
                <div className="role-stat">
                  <span className="role-name">🔬 Researchers</span>
                  <span className="role-count">892 (31%)</span>
                </div>
                <div className="role-stat">
                  <span className="role-name">✅ Attestors</span>
                  <span className="role-count">456 (16%)</span>
                </div>
                <div className="role-stat">
                  <span className="role-name">🏛️ DAO Members</span>
                  <span className="role-count">234 (8%)</span>
                </div>
                <div className="role-stat">
                  <span className="role-name">👑 Admins</span>
                  <span className="role-count">18 (1%)</span>
                </div>
              </div>
            </div>

            <div className="analytics-card">
              <h3>Activity Metrics</h3>
              <div className="activity-stats">
                <div className="activity-item">
                  <span className="activity-label">Daily Active Users</span>
                  <span className="activity-value">1,847</span>
                </div>
                <div className="activity-item">
                  <span className="activity-label">Average Session Time</span>
                  <span className="activity-value">24.3 min</span>
                </div>
                <div className="activity-item">
                  <span className="activity-label">User Retention (30d)</span>
                  <span className="activity-value">73.2%</span>
                </div>
                <div className="activity-item">
                  <span className="activity-label">Platform Satisfaction</span>
                  <span className="activity-value">4.7/5.0</span>
                </div>
              </div>
            </div>

            <div className="analytics-card full-width">
              <h3>Top Performers</h3>
              <div className="performers-list">
                <div className="performer-item">
                  <span className="performer-rank">#1</span>
                  <span className="performer-address">0x742d...a8f3</span>
                  <span className="performer-role">Data Provider</span>
                  <span className="performer-metric">145.7 ETH earned</span>
                </div>
                <div className="performer-item">
                  <span className="performer-rank">#2</span>
                  <span className="performer-address">0x8f2c...b9a1</span>
                  <span className="performer-role">Attestation Expert</span>
                  <span className="performer-metric">156 attestations</span>
                </div>
                <div className="performer-item">
                  <span className="performer-rank">#3</span>
                  <span className="performer-address">0x1a3b...d4e5</span>
                  <span className="performer-role">Researcher</span>
                  <span className="performer-metric">
                    28 datasets purchased
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
