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
        className="d-flex flex-column p-3 text-white"
        style={{
          width: "240px",
          minHeight: "100vh",
          backgroundColor: "#20232a",
        }}
      >
        <h4 className="text-center mb-4 fw-semibold">Admin Panel</h4>

        <ul className="nav flex-column">
          <li className="nav-item mb-2">
            <a href="/admin-dashboard" className="nav-link text-white">
              <i className="fas fa-home me-2"></i> Dashboard
            </a>
          </li>
          <li className="nav-item mb-2">
            <a href="/admin/users" className="nav-link text-white">
              <i className="fas fa-users me-2"></i> Users
            </a>
          </li>
          <li className="nav-item mb-2">
            <a href="/admin/tutorials" className="nav-link text-white">
              <i className="fas fa-chalkboard-teacher me-2"></i> Tutorials
            </a>
          </li>
          <li className="nav-item mb-2">
            <a href="/admin/reviews" className="nav-link text-white active">
              <i className="fas fa-comment-dots me-2"></i> Reviews
            </a>
          </li>
          <li className="nav-item mb-2">
            <a href="/admin/analytics" className="nav-link text-white">
              <i className="fas fa-chart-line me-2"></i> Analytics
            </a>
          </li>
        </ul>

        <hr className="border-secondary" />
        <div className="mt-auto text-center">
          <a href="/" className="text-white text-decoration-none">
            <i className="fas fa-sign-out-alt me-2"></i> Logout
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 p-4" style={{ background: "#f8f9fa" }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="fw-bold text-dark">User Reviews</h2>

          <select
            className="form-select w-auto"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="TR">Top Rated</option>
            <option value="RM">Recently Made</option>
          </select>
        </div>

        <div className="card shadow-sm border-0">
          <div className="card-body">
            <table className="table table-striped align-middle">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>User</th>
                  <th>Tutorial</th>
                  <th>Rating</th>
                  <th>Feedback</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {sortedReviews.map((review, index) => (
                  <tr key={review.id}>
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
