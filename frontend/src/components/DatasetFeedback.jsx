import React, { useState } from "react";
import "./DatasetFeedback.css";

const DatasetFeedback = ({ dataset, onClose, userAddress }) => {
  const [feedbackType, setFeedbackType] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("medium");
  const [category, setCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const feedbackTypes = [
    { value: "quality_issue", label: "Data Quality Issue", icon: "⚠️" },
    { value: "accuracy_concern", label: "Accuracy Concern", icon: "🎯" },
    { value: "completeness", label: "Incompleteness", icon: "📊" },
    { value: "privacy_violation", label: "Privacy Violation", icon: "🔒" },
    { value: "licensing_issue", label: "Licensing Issue", icon: "📜" },
    { value: "positive_validation", label: "Positive Validation", icon: "✅" },
  ];

  const severityLevels = [
    {
      value: "low",
      label: "Low",
      color: "#48bb78",
      description: "Minor issue, dataset still usable",
    },
    {
      value: "medium",
      label: "Medium",
      color: "#ed8936",
      description: "Moderate issue affecting usability",
    },
    {
      value: "high",
      label: "High",
      color: "#f56565",
      description: "Major issue requiring immediate attention",
    },
    {
      value: "critical",
      label: "Critical",
      color: "#c53030",
      description: "Critical flaw, dataset should be reviewed",
    },
  ];

  const categories = [
    "Data Formatting",
    "Missing Values",
    "Incorrect Labels",
    "Ethical Concerns",
    "Technical Issues",
    "Documentation",
    "Metadata Accuracy",
    "Sample Quality",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call - in real implementation, this would interact with smart contracts
      const feedbackData = {
        datasetId: dataset.id,
        curatorAddress: userAddress,
        feedbackType,
        description,
        severity,
        category,
        timestamp: new Date().toISOString(),
        // This would generate a feedback token in the real implementation
        feedbackTokenId: `feedback_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
      };

      console.log("Submitting feedback:", feedbackData);

      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 2000));

      alert(
        `Feedback submitted successfully! ${
          feedbackType === "positive_validation"
            ? "You are now eligible for revenue sharing from future sales."
            : "Your concern has been flagged for community review."
        }`
      );
      onClose();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Error submitting feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedSeverity = severityLevels.find((s) => s.value === severity);

  return (
    <div className="feedback-overlay">
      <div className="feedback-modal">
        <div className="feedback-header">
          <h2>Dataset Curation Feedback</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="curator-info">
          <div className="curator-badge">
            <span className="badge-icon">👑</span>
            <div className="badge-content">
              <h3>Dataset Curator</h3>
              <p>
                As a verified dataset buyer, you can now participate in quality
                curation
              </p>
            </div>
          </div>
          <div className="dataset-info">
            <h4>{dataset.title}</h4>
            <p>Provider: {dataset.provider}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="feedback-form">
          <div className="form-section">
            <h3>Feedback Type</h3>
            <div className="feedback-types">
              {feedbackTypes.map((type) => (
                <label
                  key={type.value}
                  className={`feedback-type ${
                    feedbackType === type.value ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="feedbackType"
                    value={type.value}
                    checked={feedbackType === type.value}
                    onChange={(e) => setFeedbackType(e.target.value)}
                    required
                  />
                  <span className="type-icon">{type.icon}</span>
                  <span className="type-label">{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          {feedbackType && feedbackType !== "positive_validation" && (
            <>
              <div className="form-section">
                <h3>Severity Level</h3>
                <div className="severity-selector">
                  {severityLevels.map((level) => (
                    <label
                      key={level.value}
                      className={`severity-option ${
                        severity === level.value ? "selected" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="severity"
                        value={level.value}
                        checked={severity === level.value}
                        onChange={(e) => setSeverity(e.target.value)}
                      />
                      <div className="severity-content">
                        <div
                          className="severity-indicator"
                          style={{ backgroundColor: level.color }}
                        ></div>
                        <div className="severity-info">
                          <span className="severity-label">{level.label}</span>
                          <span className="severity-description">
                            {level.description}
                          </span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-section">
                <h3>Category</h3>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="category-select"
                >
                  <option value="">Select a category...</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="form-section">
            <h3>Description</h3>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                feedbackType === "positive_validation"
                  ? "Describe what makes this dataset valuable and high-quality..."
                  : "Provide detailed information about the issue you've identified..."
              }
              required
              rows="6"
              className="description-textarea"
            />
          </div>

          <div className="incentive-info">
            <div className="incentive-card">
              <h4>🎯 Curation Rewards</h4>
              {feedbackType === "positive_validation" ? (
                <div className="reward-info positive">
                  <p>
                    <strong>Revenue Sharing:</strong> Earn 0.5% from future
                    sales of this dataset
                  </p>
                  <p>
                    <strong>Curator Reputation:</strong> +10 reputation points
                  </p>
                </div>
              ) : feedbackType && feedbackType !== "" ? (
                <div className="reward-info issue">
                  <p>
                    <strong>Issue Resolution Reward:</strong> Up to 2% of
                    dataset value if issue is confirmed
                  </p>
                  <p>
                    <strong>Community Validation:</strong> Additional rewards if
                    other curators upvote your concern
                  </p>
                </div>
              ) : (
                <p>Select a feedback type to see potential rewards</p>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !feedbackType || !description.trim()}
              className="submit-button"
            >
              {isSubmitting ? (
                <>
                  <span className="loading-spinner"></span>
                  Submitting...
                </>
              ) : (
                <>
                  Submit Feedback
                  <span className="submit-icon">🚀</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DatasetFeedback;
