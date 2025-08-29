import React, { useState } from "react";
import "./DAOGovernance.css";

const DAOGovernance = () => {
  const [activeTab, setActiveTab] = useState("proposals");

  // Mock data for demonstration
  const proposals = [
    {
      id: 1,
      title: "Implement New Dataset Quality Standards",
      description:
        "Proposal to introduce stricter quality standards for dataset validation including metadata completeness, data integrity checks, and peer review requirements.",
      author: "0x742d...a8f3",
      type: "governance",
      status: "active",
      votesFor: 1247,
      votesAgainst: 332,
      totalVotes: 1579,
      timeLeft: "2 days",
      created: "2024-01-15",
      quorum: 2000,
      threshold: 0.67,
    },
    {
      id: 2,
      title: "Reduce Platform Transaction Fees",
      description:
        "Motion to reduce platform transaction fees from 2.5% to 1.8% to encourage more dataset providers and increase platform adoption.",
      author: "0x1a3b...d4e5",
      type: "economic",
      status: "active",
      votesFor: 892,
      votesAgainst: 156,
      totalVotes: 1048,
      timeLeft: "5 days",
      created: "2024-01-12",
      quorum: 1500,
      threshold: 0.6,
    },
    {
      id: 3,
      title: "Grant Fund for Educational Datasets",
      description:
        "Allocate 50,000 MIND tokens from treasury to fund educational dataset creation and open-source research initiatives.",
      author: "0x8f2c...b9a1",
      type: "treasury",
      status: "passed",
      votesFor: 2341,
      votesAgainst: 423,
      totalVotes: 2764,
      timeLeft: "Executed",
      created: "2024-01-08",
      quorum: 2500,
      threshold: 0.75,
    },
  ];

  const attestations = [
    {
      id: 1,
      dataset: "Global Climate Dataset 2024",
      provider: "0x742d...a8f3",
      attester: "Dr. Sarah Johnson",
      organization: "MIT Climate Lab",
      status: "verified",
      score: 9.2,
      date: "2024-01-14",
      details:
        "Comprehensive climate data with excellent methodology and documentation",
    },
    {
      id: 2,
      dataset: "Medical Imaging Collection",
      provider: "0x1a3b...d4e5",
      attester: "Prof. Michael Chen",
      organization: "Stanford Medical AI",
      status: "verified",
      score: 8.8,
      date: "2024-01-13",
      details: "High-quality medical images with proper anonymization",
    },
    {
      id: 3,
      dataset: "Financial Markets Data",
      provider: "0x8f2c...b9a1",
      attester: "Dr. Elena Rodriguez",
      organization: "Blockchain Research Institute",
      status: "pending",
      score: null,
      date: "2024-01-15",
      details: "Under review for completeness and accuracy",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "#4299e1";
      case "passed":
        return "#48bb78";
      case "rejected":
        return "#f56565";
      case "pending":
        return "#ed8936";
      case "verified":
        return "#48bb78";
      default:
        return "#a0aec0";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "governance":
        return "⚖️";
      case "economic":
        return "💰";
      case "treasury":
        return "🏛️";
      default:
        return "📋";
    }
  };

  const calculateProgress = (votesFor, totalVotes, quorum) => {
    const participation = (totalVotes / quorum) * 100;
    const approval = totalVotes > 0 ? (votesFor / totalVotes) * 100 : 0;
    return { participation: Math.min(participation, 100), approval };
  };

  return (
    <div className="dao-governance">
      <div className="governance-header">
        <div className="header-content">
          <h1>DAO Governance</h1>
          <p>
            Participate in decentralized decision-making for the Minerds
            ecosystem
          </p>
        </div>
        <div className="governance-stats">
          <div className="stat-item">
            <span className="stat-value">2,847</span>
            <span className="stat-label">Active Voters</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">156</span>
            <span className="stat-label">Proposals</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">12.4M</span>
            <span className="stat-label">MIND Tokens</span>
          </div>
        </div>
      </div>

      <div className="governance-navigation">
        <button
          className={`nav-tab ${activeTab === "proposals" ? "active" : ""}`}
          onClick={() => setActiveTab("proposals")}
        >
          🗳️ Proposals
        </button>
        <button
          className={`nav-tab ${activeTab === "attestations" ? "active" : ""}`}
          onClick={() => setActiveTab("attestations")}
        >
          ✅ Attestations
        </button>
        <button
          className={`nav-tab ${activeTab === "voting-power" ? "active" : ""}`}
          onClick={() => setActiveTab("voting-power")}
        >
          ⚡ Voting Power
        </button>
      </div>

      {activeTab === "proposals" && (
        <div className="proposals-section">
          <div className="section-header">
            <h2>Active Proposals</h2>
            <button className="create-proposal-btn">+ Create Proposal</button>
          </div>

          <div className="proposals-list">
            {proposals.map((proposal) => {
              const { participation, approval } = calculateProgress(
                proposal.votesFor,
                proposal.totalVotes,
                proposal.quorum
              );

              return (
                <div key={proposal.id} className="proposal-card">
                  <div className="proposal-header">
                    <div className="proposal-meta">
                      <span className="proposal-type">
                        {getTypeIcon(proposal.type)} {proposal.type}
                      </span>
                      <span
                        className="proposal-status"
                        style={{
                          backgroundColor: `${getStatusColor(
                            proposal.status
                          )}20`,
                          color: getStatusColor(proposal.status),
                        }}
                      >
                        {proposal.status}
                      </span>
                    </div>
                    <div className="proposal-time">{proposal.timeLeft}</div>
                  </div>

                  <h3 className="proposal-title">{proposal.title}</h3>
                  <p className="proposal-description">{proposal.description}</p>

                  <div className="proposal-voting">
                    <div className="voting-stats">
                      <div className="vote-count">
                        <span className="votes-for">
                          👍 {proposal.votesFor.toLocaleString()}
                        </span>
                        <span className="votes-against">
                          👎 {proposal.votesAgainst.toLocaleString()}
                        </span>
                      </div>
                      <div className="participation">
                        <span>Participation: {participation.toFixed(1)}%</span>
                        <span>Approval: {approval.toFixed(1)}%</span>
                      </div>
                    </div>

                    <div className="progress-bars">
                      <div className="progress-bar">
                        <div className="progress-label">Quorum Progress</div>
                        <div className="progress-track">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${participation}%`,
                              backgroundColor: "#4299e1",
                            }}
                          ></div>
                        </div>
                        <div className="progress-text">
                          {proposal.totalVotes} / {proposal.quorum}
                        </div>
                      </div>

                      <div className="progress-bar">
                        <div className="progress-label">Approval Rate</div>
                        <div className="progress-track">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${approval}%`,
                              backgroundColor: "#48bb78",
                            }}
                          ></div>
                        </div>
                        <div className="progress-text">
                          {(proposal.threshold * 100).toFixed(0)}% required
                        </div>
                      </div>
                    </div>

                    {proposal.status === "active" && (
                      <div className="voting-actions">
                        <button className="vote-btn vote-for">Vote For</button>
                        <button className="vote-btn vote-against">
                          Vote Against
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="proposal-footer">
                    <span className="proposal-author">
                      Proposed by {proposal.author}
                    </span>
                    <span className="proposal-date">
                      Created {proposal.created}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === "attestations" && (
        <div className="attestations-section">
          <div className="section-header">
            <h2>Dataset Attestations</h2>
            <div className="attestation-filters">
              <select className="filter-select">
                <option>All Attestations</option>
                <option>Verified</option>
                <option>Pending</option>
                <option>Rejected</option>
              </select>
            </div>
          </div>

          <div className="attestations-list">
            {attestations.map((attestation) => (
              <div key={attestation.id} className="attestation-card">
                <div className="attestation-header">
                  <h3 className="dataset-title">{attestation.dataset}</h3>
                  <span
                    className="attestation-status"
                    style={{
                      backgroundColor: `${getStatusColor(
                        attestation.status
                      )}20`,
                      color: getStatusColor(attestation.status),
                    }}
                  >
                    {attestation.status}
                  </span>
                </div>

                <div className="attestation-details">
                  <div className="detail-row">
                    <span className="detail-label">Provider:</span>
                    <span className="detail-value">{attestation.provider}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Attester:</span>
                    <span className="detail-value">{attestation.attester}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Organization:</span>
                    <span className="detail-value">
                      {attestation.organization}
                    </span>
                  </div>
                  {attestation.score && (
                    <div className="detail-row">
                      <span className="detail-label">Quality Score:</span>
                      <span className="detail-value score">
                        {attestation.score}/10
                      </span>
                    </div>
                  )}
                </div>

                <p className="attestation-details-text">
                  {attestation.details}
                </p>

                <div className="attestation-footer">
                  <span className="attestation-date">
                    Reviewed {attestation.date}
                  </span>
                  {attestation.status === "verified" && (
                    <div className="verification-badge">✅ Verified</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "voting-power" && (
        <div className="voting-power-section">
          <div className="section-header">
            <h2>Your Voting Power</h2>
          </div>

          <div className="voting-power-overview">
            <div className="power-card">
              <h3>Current Voting Power</h3>
              <div className="power-amount">
                <span className="power-number">15,247</span>
                <span className="power-unit">MIND Tokens</span>
              </div>
              <div className="power-percentage">2.4% of total voting power</div>
            </div>

            <div className="power-breakdown">
              <h3>Power Sources</h3>
              <div className="breakdown-item">
                <span className="source-label">Token Holdings</span>
                <span className="source-amount">12,000 MIND</span>
              </div>
              <div className="breakdown-item">
                <span className="source-label">Dataset Provider Bonus</span>
                <span className="source-amount">2,500 MIND</span>
              </div>
              <div className="breakdown-item">
                <span className="source-label">Attestation Participation</span>
                <span className="source-amount">747 MIND</span>
              </div>
            </div>

            <div className="delegation-section">
              <h3>Delegation</h3>
              <p>Delegate your voting power to trusted community members</p>
              <div className="delegation-controls">
                <input
                  type="text"
                  placeholder="Enter delegate address..."
                  className="delegate-input"
                />
                <button className="delegate-btn">Delegate</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DAOGovernance;
