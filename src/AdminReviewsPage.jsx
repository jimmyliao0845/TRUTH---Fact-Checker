import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

export default function AdminReviewsPage() {
  const [filter, setFilter] = useState("MP");

  const reviews = [
    {
      id: 1,
      user: "Juan Dela Cruz",
      tutorial: "How to Analyze Fake News",
      rating: 5,
      feedback: "Very informative and helpful!",
      date: "2025-10-25",
    },
    {
      id: 2,
      user: "Maria Santos",
      tutorial: "Fact-Checking Basics",
      rating: 4,
      feedback: "Good but could be more detailed.",
      date: "2025-10-27",
    },
    {
      id: 3,
      user: "Alex Reyes",
      tutorial: "Deepfake Detection Tips",
      rating: 5,
      feedback: "Loved it! Super insightful.",
      date: "2025-11-02",
    },
  ];

  const sortedReviews = [...reviews].sort((a, b) => {
    if (filter === "TR") return b.rating - a.rating;
    if (filter === "RM" || filter === "RU")
      return new Date(b.date) - new Date(a.date);
    return 0;
  });

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div
        className="d-flex flex-column p-3"
        style={{
          width: "240px",
          minHeight: "100vh",
          backgroundColor: "var(--secondary-color)",
          borderRight: "2px solid var(--accent-color)",
          boxShadow: "2px 0 10px rgba(0,0,0,0.3)",
          color: "var(--text-color)",
        }}
      >
        <h4 className="text-center mb-4 fw-semibold" style={{ color: "var(--text-color)" }}>
          Admin Panel
        </h4>

        <ul className="nav flex-column">
          <li className="nav-item mb-2">
            <a
              href="/admin-dashboard"
              style={{
                color: "var(--text-color)",
                backgroundColor: "transparent",
                padding: "10px",
                borderRadius: "4px",
                display: "inline-block",
                textDecoration: "none",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "var(--accent-color)";
                e.currentTarget.style.color = "var(--primary-color)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "var(--text-color)";
              }}
            >
              <i className="fas fa-home me-2"></i> Dashboard
            </a>
          </li>
          <li className="nav-item mb-2">
            <a
              href="/admin/users"
              style={{
                color: "var(--text-color)",
                backgroundColor: "transparent",
                padding: "10px",
                borderRadius: "4px",
                display: "inline-block",
                textDecoration: "none",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "var(--accent-color)";
                e.currentTarget.style.color = "var(--primary-color)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "var(--text-color)";
              }}
            >
              <i className="fas fa-users me-2"></i> Users
            </a>
          </li>
          <li className="nav-item mb-2">
            <a
              href="/admin/tutorials"
              style={{
                color: "var(--text-color)",
                backgroundColor: "transparent",
                padding: "10px",
                borderRadius: "4px",
                display: "inline-block",
                textDecoration: "none",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "var(--accent-color)";
                e.currentTarget.style.color = "var(--primary-color)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "var(--text-color)";
              }}
            >
              <i className="fas fa-chalkboard-teacher me-2"></i> Tutorials
            </a>
          </li>
          <li className="nav-item mb-2">
            <a
              href="/admin/reviews"
              style={{
                color: "var(--primary-color)",
                backgroundColor: "var(--accent-color)",
                padding: "10px",
                borderRadius: "4px",
                display: "inline-block",
                textDecoration: "none",
              }}
            >
              <i className="fas fa-comment-dots me-2"></i> Reviews
            </a>
          </li>
          <li className="nav-item mb-2">
            <a
              href="/admin/analytics"
              style={{
                color: "var(--text-color)",
                backgroundColor: "transparent",
                padding: "10px",
                borderRadius: "4px",
                display: "inline-block",
                textDecoration: "none",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "var(--accent-color)";
                e.currentTarget.style.color = "var(--primary-color)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "var(--text-color)";
              }}
            >
              <i className="fas fa-chart-line me-2"></i> Analytics
            </a>
          </li>
        </ul>

        <hr style={{ borderColor: "var(--accent-color)" }} />
        <div className="mt-auto text-center">
          <a
            href="/"
            style={{
              color: "var(--text-color)",
              textDecoration: "none",
              padding: "10px",
              borderRadius: "4px",
              display: "inline-block",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "var(--accent-color)";
              e.currentTarget.style.color = "var(--primary-color)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "var(--text-color)";
            }}
          >
            <i className="fas fa-sign-out-alt me-2"></i> Logout
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div
        className="flex-grow-1 p-4"
        style={{
          backgroundColor: "var(--primary-color)",
          minHeight: "100vh",
          color: "var(--text-color)",
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="fw-bold" style={{ color: "var(--text-color)" }}>
            User Reviews
          </h2>

          <select
            className="form-select w-auto"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              backgroundColor: "var(--secondary-color)",
              borderColor: "var(--accent-color)",
              color: "var(--text-color)",
            }}
          >
            <option value="TR">Top Rated</option>
            <option value="RM">Recently Made</option>
          </select>
        </div>

        <div
          className="card shadow-sm"
          style={{
            backgroundColor: "var(--secondary-color)",
            border: "2px solid var(--accent-color)",
          }}
        >
          <div className="card-body">
            <table className="table table-striped align-middle" style={{ backgroundColor: "var(--secondary-color)" }}>
              <thead style={{ backgroundColor: "var(--accent-color)" }}>
                <tr>
                  <th style={{ color: "var(--primary-color)" }}>#</th>
                  <th style={{ color: "var(--primary-color)" }}>User</th>
                  <th style={{ color: "var(--primary-color)" }}>Tutorial</th>
                  <th style={{ color: "var(--primary-color)" }}>Rating</th>
                  <th style={{ color: "var(--primary-color)" }}>Feedback</th>
                  <th style={{ color: "var(--primary-color)" }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {sortedReviews.map((review, index) => (
                  <tr
                    key={review.id}
                    style={{
                      color: "var(--text-color)",
                      borderBottom: "2px solid var(--accent-color)",
                      opacity: 0.9,
                    }}
                  >
                    <td>{index + 1}</td>
                    <td>{review.user}</td>
                    <td>{review.tutorial}</td>
                    <td>{review.rating} ⭐</td>
                    <td>{review.feedback}</td>
                    <td>{review.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
