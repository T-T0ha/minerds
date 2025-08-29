import React, { useState, useEffect } from "react";
import "./DatasetFeedbackDisplay.css";

const DatasetFeedbackDisplay = ({ datasetId, datasetTitle }) => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [summary, setSummary] = useState({
    totalFeedback: 0,
    positiveValidations: 0,
    issuesReported: 0,
    averageRating: 0,
  });

  // Mock feedback data (in real implementation, this would come from backend/blockchain)
  const mockFeedback = [
    {
      id: 1,
      userAddress: "0x742d35Cc6632C0532925a3b8D45C7C3",
      feedbackType: "positive_validation",
      severity: "low",
      description:
        "Excellent dataset quality. Data is well-structured and complete for our research needs.",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      verified: true,
      curatorBadge: "Senior Curator",
      helpfulVotes: 8,
    },
    {
      id: 2,
      userAddress: "0x8ba1f109551bD432803012645Hac136c",
      feedbackType: "quality_issue",
      severity: "medium",
      description:
        "Some data points appear to have inconsistent formatting in columns 5-7. Overall good quality but needs minor cleanup.",
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      verified: true,
      curatorBadge: "Verified Curator",
      helpfulVotes: 3,
    },
    {
      id: 3,
      userAddress: "0x9F2f109551bD432803012645Hac136d",
      feedbackType: "positive_validation",
      severity: "low",
      description:
        "Perfect for machine learning applications. Clean, labeled data with comprehensive metadata.",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      verified: true,
      curatorBadge: "Expert Curator",
      helpfulVotes: 12,
    },
    {
      id: 4,
      userAddress: "0x1A3f109551bD432803012645Hac136e",
      feedbackType: "completeness_issue",
      severity: "low",
      description:
        "Minor issue: Missing some optional metadata fields, but core data is complete and accurate.",
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      verified: true,
      curatorBadge: "Certified Curator",
      helpfulVotes: 5,
    },
  ];

  useEffect(() => {
    loadFeedback();
  }, [datasetId]);

  const loadFeedback = async () => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // In real implementation, fetch from backend:
      // const response = await fetch(`http://localhost:3001/api/datasets/${datasetId}/feedback`);
      // const feedbackData = await response.json();

      setFeedback(mockFeedback);

      // Calculate summary
      const totalFeedback = mockFeedback.length;
      const positiveValidations = mockFeedback.filter(
        (f) => f.feedbackType === "positive_validation"
      ).length;
      const issuesReported = mockFeedback.filter(
        (f) => f.feedbackType !== "positive_validation"
      ).length;

      setSummary({
        totalFeedback,
        positiveValidations,
        issuesReported,
        averageRating: ((positiveValidations / totalFeedback) * 5).toFixed(1),
      });
    } catch (error) {
      console.error("Failed to load feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFeedbackIcon = (type) => {
    switch (type) {
      case "positive_validation":
        return "✅";
      case "quality_issue":
        return "⚠️";
      case "accuracy_concern":
        return "🎯";
      case "completeness_issue":
        return "📋";
      case "privacy_violation":
        return "🔒";
      default:
        return "💬";
    }
  };

  const getFeedbackLabel = (type) => {
    switch (type) {
      case "positive_validation":
        return "Positive Validation";
      case "quality_issue":
        return "Quality Issue";
      case "accuracy_concern":
        return "Accuracy Concern";
      case "completeness_issue":
        return "Completeness Issue";
      case "privacy_violation":
        return "Privacy Violation";
      default:
        return "General Feedback";
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "low":
        return "#28a745";
      case "medium":
        return "#ffc107";
      case "high":
        return "#dc3545";
      default:
        return "#6c757d";
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return `${Math.floor(diffInHours / (24 * 7))}w ago`;
    }
  };

  const displayedFeedback = showAll ? feedback : feedback.slice(0, 2);

  if (loading) {
    return (
      <div className="feedback-display loading">
        <div className="loading-spinner">Loading feedback...</div>
      </div>
    );
  }

  if (feedback.length === 0) {
    return (
      <div className="feedback-display empty">
        <p>No curator feedback available yet.</p>
        <small>Be the first to purchase and provide feedback!</small>
      </div>
    );
  }

  return (
    <div className="feedback-display">
      <div className="feedback-header">
        <h4>🎯 Curator Feedback ({summary.totalFeedback})</h4>
        <div className="feedback-summary">
          <div className="summary-stats">
            <span className="stat positive">
              ✅ {summary.positiveValidations} Positive
            </span>
            <span className="stat issues">
              ⚠️ {summary.issuesReported} Issues
            </span>
            <span className="stat rating">⭐ {summary.averageRating}/5.0</span>
          </div>
        </div>
      </div>

      <div className="feedback-list">
        {displayedFeedback.map((item) => (
          <div key={item.id} className="feedback-item">
            <div className="feedback-item-header">
              <div className="feedback-type">
                <span className="type-icon">
                  {getFeedbackIcon(item.feedbackType)}
                </span>
                <span className="type-label">
                  {getFeedbackLabel(item.feedbackType)}
                </span>
                <span
                  className="severity-badge"
                  style={{ backgroundColor: getSeverityColor(item.severity) }}
                >
                  {item.severity}
                </span>
              </div>
              <div className="feedback-meta">
                <span className="curator-badge">{item.curatorBadge}</span>
                <span className="timestamp">
                  {formatTimeAgo(item.timestamp)}
                </span>
              </div>
            </div>

            <div className="feedback-content">
              <p>{item.description}</p>
            </div>

            <div className="feedback-footer">
              <div className="curator-info">
                <span className="curator-address">
                  {item.userAddress.slice(0, 6)}...{item.userAddress.slice(-4)}
                </span>
                {item.verified && (
                  <span className="verified-badge">✓ Verified</span>
                )}
              </div>
              <div className="feedback-actions">
                <button className="helpful-btn" title="Mark as helpful">
                  👍 {item.helpfulVotes}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {feedback.length > 2 && (
        <button className="show-more-btn" onClick={() => setShowAll(!showAll)}>
          {showAll ? "Show Less" : `Show All ${feedback.length} Reviews`}
        </button>
      )}
    </div>
  );
};

export default DatasetFeedbackDisplay;
