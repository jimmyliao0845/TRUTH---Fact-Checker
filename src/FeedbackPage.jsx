import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  FaBars,
  FaStar,
  FaArrowLeft,
  FaSearch,
  FaCommentDots,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import "./FactCheckerDashboard.css";

export default function FeedbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  // Auth check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) navigate("/login");
    });
    return () => unsubscribe();
  }, [navigate]);

  // Pending feedback requests
  const [pendingFeedback] = useState([
    {
      id: 1,
      type: "tutorial",
      title: "Real vs Fake Images - Tutorial",
      creator: "Dr. Jane Analyst",
      submittedDate: "2025-02-01",
      content:
        "I completed the tutorial 'Real vs Fake Images'. Please provide your feedback on the learning experience.",
      categories: ["content", "difficulty", "engagement"],
    },
    {
      id: 2,
      type: "game",
      title: "Truth or Misinformation - Game",
      creator: "Professional Team",
      submittedDate: "2025-01-28",
      content:
        "You played the 'Truth or Misinformation' game. We'd love to hear your thoughts!",
      categories: ["fun", "difficulty", "learning"],
    },
    {
      id: 3,
      type: "content",
      title: "Content Analysis Feature Feedback",
      creator: "System",
      submittedDate: "2025-01-25",
      content:
        "Please provide feedback on your content analysis submission experience.",
      categories: ["usability", "accuracy", "speed"],
    },
  ]);

  // Submitted feedback
  const [submittedFeedback] = useState([
    {
      id: 101,
      type: "tutorial",
      title: "Media Forensics 101",
      submittedDate: "2025-01-20",
      rating: 5,
      comment: "Excellent tutorial! Very informative and well-structured.",
      status: "submitted",
    },
    {
      id: 102,
      type: "game",
      title: "Deepfake Detection",
      submittedDate: "2025-01-15",
      rating: 4,
      comment:
        "Fun game, but some questions were a bit too challenging for beginners.",
      status: "submitted",
    },
    {
      id: 103,
      type: "content",
      title: "Image Analysis",
      submittedDate: "2025-01-10",
      rating: 4,
      comment: "Quick and accurate analysis. Great tool!",
      status: "submitted",
    },
  ]);

  // Form state
  const [feedbackForm, setFeedbackForm] = useState({
    rating: 5,
    categories: [],
    comment: "",
  });

  // Filter feedback
  const filteredPending = pendingFeedback.filter((f) =>
    f.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSubmitted = submittedFeedback.filter((f) =>
    f.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle form submission
  const handleSubmitFeedback = () => {
    if (!feedbackForm.comment.trim()) {
      alert("Please enter your feedback");
      return;
    }

    // TODO: Send feedback to backend
    console.log("Submitting feedback:", feedbackForm);
    setShowFeedbackForm(false);
    setSelectedFeedback(null);
    alert("Thank you! Your feedback has been submitted.");
  };

  // Toggle category
  const toggleCategory = (category) => {
    setFeedbackForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  return (
    <div className="d-flex" style={{ backgroundColor: "var(--secondary-color)", paddingTop: "56px" }}>
      {/* SIDEBAR */}
      <div
        className="d-flex flex-column p-3 border-end"
        style={{
          width: collapsed ? "80px" : "250px",
          backgroundColor: "#d9d9d9",
          transition: "width 0.3s ease",
          height: "calc(100vh - 56px)",
          position: "fixed",
          top: "56px",
          left: 0,
          overflowY: "auto",
          zIndex: 900,
        }}
      >
        <div className="d-flex align-items-center justify-content-between mb-3">
          <button
            className="btn btn-outline-dark btn-sm"
            onClick={() => setCollapsed(!collapsed)}
            style={{ border: "none" }}
          >
            <FaBars />
          </button>
        </div>

        <ul className="nav flex-column">
          <li>
            <button
              className={`btn sidebar-btn text-start ${
                activeTab === "pending" ? "active" : ""
              }`}
              onClick={() => {
                setActiveTab("pending");
                setSelectedFeedback(null);
                setShowFeedbackForm(false);
              }}
              disabled={activeTab === "pending"}
            >
              <FaCommentDots className="me-2" />
              {!collapsed && "Pending Feedback"}
            </button>
          </li>

          <li>
            <button
              className={`btn sidebar-btn text-start ${
                activeTab === "submitted" ? "active" : ""
              }`}
              onClick={() => {
                setActiveTab("submitted");
                setSelectedFeedback(null);
                setShowFeedbackForm(false);
              }}
              disabled={activeTab === "submitted"}
            >
              <FaCheckCircle className="me-2" />
              {!collapsed && "My Feedback"}
            </button>
          </li>

          <li className="mt-4 border-top pt-2">
            <button
              className={`btn sidebar-btn text-start ${location.pathname === "/analysis-logged" ? "active" : ""}`}
              onClick={() => navigate("/analysis-logged")}
              disabled={location.pathname === "/analysis-logged"}
            >
              <FaArrowLeft className="me-2" />
              {!collapsed && "Back to Analysis"}
            </button>
          </li>
        </ul>

        {!collapsed && (
          <div className="mt-auto small text-muted">
            Feedback Portal
          </div>
        )}
      </div>

      {/* MAIN CONTENT */}
      <div
        className="flex-grow-1"
        style={{
          marginLeft: collapsed ? "80px" : "250px",
          transition: "margin-left 0.3s ease",
          minHeight: "100vh",
        }}
      >
        {/* NAVBAR */}
        <nav
          className="navbar navbar-light bg-light d-flex justify-content-between align-items-center px-4 py-2 shadow-sm"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 1000,
            borderBottom: "1px solid #ddd",
          }}
        >
          <h5 className="mb-0">
            {activeTab === "pending" && "Pending Feedback"}
            {activeTab === "submitted" && "My Feedback History"}
          </h5>
          {!showFeedbackForm && (
            <div style={{ width: 300 }}>
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <FaSearch />
                </span>
                <input
                  className="form-control"
                  placeholder="Search feedback..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          )}
        </nav>

        {/* CONTENT */}
        <div className="p-4">
          {activeTab === "pending" && !showFeedbackForm ? (
            <div className="container">
              {filteredPending.length > 0 ? (
                <div className="row">
                  {filteredPending.map((feedback) => (
                    <div key={feedback.id} className="col-md-6 col-lg-4 mb-4">
                      <div className="card shadow-sm h-100">
                        <div className="card-body d-flex flex-column">
                          <span className="badge bg-info mb-2 align-self-start">
                            {feedback.type}
                          </span>
                          <h6 className="card-title">{feedback.title}</h6>
                          <p className="text-muted small">
                            By {feedback.creator}
                          </p>
                          <p className="card-text flex-grow-1">
                            {feedback.content}
                          </p>

                          <div className="mb-3">
                            <small className="text-muted">Categories:</small>
                            <div>
                              {feedback.categories.map((cat) => (
                                <span
                                  key={cat}
                                  className="badge bg-secondary me-1 mb-1"
                                >
                                  {cat}
                                </span>
                              ))}
                            </div>
                          </div>

                          <small className="text-muted mb-3">
                            Requested on {feedback.submittedDate}
                          </small>

                          <button
                            className="btn btn-primary w-100"
                            onClick={() => {
                              setSelectedFeedback(feedback);
                              setShowFeedbackForm(true);
                              setFeedbackForm({
                                rating: 5,
                                categories: [],
                                comment: "",
                              });
                            }}
                          >
                            Provide Feedback
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="alert alert-info">
                  No pending feedback requests at the moment.
                </div>
              )}
            </div>
          ) : activeTab === "pending" && showFeedbackForm ? (
            // Feedback Form
            <div className="container">
              <div className="row">
                <div className="col-lg-8 offset-lg-2">
                  <div className="card shadow-sm">
                    <div className="card-header bg-primary text-white">
                      <h5 className="mb-0">
                        Feedback: {selectedFeedback.title}
                      </h5>
                    </div>

                    <div className="card-body">
                      <div className="mb-4">
                        <label className="form-label">
                          <strong>Rating</strong>
                        </label>
                        <div className="d-flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              className={`btn ${
                                feedbackForm.rating >= star
                                  ? "btn-warning"
                                  : "btn-outline-warning"
                              }`}
                              onClick={() =>
                                setFeedbackForm((prev) => ({
                                  ...prev,
                                  rating: star,
                                }))
                              }
                              style={{ width: "50px", height: "50px" }}
                            >
                              <FaStar />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="form-label">
                          <strong>Select Categories (Optional)</strong>
                        </label>
                        <div>
                          {selectedFeedback.categories.map((category) => (
                            <div key={category} className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`cat-${category}`}
                                checked={feedbackForm.categories.includes(
                                  category
                                )}
                                onChange={() => toggleCategory(category)}
                              />
                              <label
                                className="form-check-label"
                                htmlFor={`cat-${category}`}
                              >
                                {category}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="form-label">
                          <strong>Your Feedback</strong>
                        </label>
                        <textarea
                          className="form-control"
                          rows="5"
                          placeholder="Share your thoughts, suggestions, or comments..."
                          value={feedbackForm.comment}
                          onChange={(e) =>
                            setFeedbackForm((prev) => ({
                              ...prev,
                              comment: e.target.value,
                            }))
                          }
                        />
                        <small className="text-muted">
                          Minimum 10 characters
                        </small>
                      </div>

                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-primary flex-grow-1"
                          onClick={handleSubmitFeedback}
                          disabled={feedbackForm.comment.length < 10}
                        >
                          Submit Feedback
                        </button>
                        <button
                          className="btn btn-outline-secondary flex-grow-1"
                          onClick={() => {
                            setShowFeedbackForm(false);
                            setSelectedFeedback(null);
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === "submitted" ? (
            // Submitted Feedback History
            <div className="container">
              {filteredSubmitted.length > 0 ? (
                <div className="row">
                  {filteredSubmitted.map((feedback) => (
                    <div key={feedback.id} className="col-md-6 col-lg-4 mb-4">
                      <div className="card shadow-sm h-100">
                        <div className="card-body d-flex flex-column">
                          <span className="badge bg-success mb-2 align-self-start">
                            <FaCheckCircle className="me-1" />
                            Submitted
                          </span>
                          <h6 className="card-title">{feedback.title}</h6>

                          <div className="mb-3">
                            <div className="d-flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <FaStar
                                  key={star}
                                  className={
                                    star <= feedback.rating
                                      ? "text-warning"
                                      : "text-muted"
                                  }
                                />
                              ))}
                            </div>
                            <small className="text-muted">
                              {feedback.rating} out of 5 stars
                            </small>
                          </div>

                          <p className="card-text flex-grow-1">
                            {feedback.comment}
                          </p>

                          <small className="text-muted">
                            Submitted on {feedback.submittedDate}
                          </small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="alert alert-info">
                  You haven't submitted any feedback yet.
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
