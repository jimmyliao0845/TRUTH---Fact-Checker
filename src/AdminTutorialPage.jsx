import React, { useState } from "react";
import "./AdminDashboard.css"; // reuse your existing admin CSS
import { Link } from "react-router-dom";

export default function AdminTutorialPage() {
  const [sortOption, setSortOption] = useState("MP");

  const tutorials = [
    {
      title: "Getting Started with TRUTH",
      category: "Introduction",
      views: 1245,
      rating: 4.8,
      date: "2025-11-01",
      tag: "MP",
    },
    {
      title: "Fact Checking Tutorial",
      category: "Verification",
      views: 860,
      rating: 4.9,
      date: "2025-10-28",
      tag: "TR",
    },
    {
      title: "Test",
      category: "Test",
      views: 300,
      rating: 4.2,
      date: "2025-11-05",
      tag: "RU",
    },
  ];

  const sortedTutorials = [...tutorials].sort((a, b) => {
    if (sortOption === "MP") return b.views - a.views;
    if (sortOption === "TR") return b.rating - a.rating;
    if (sortOption === "RU") return new Date(b.date) - new Date(a.date);
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
            <a href="/admin-dashboard" className="nav-link text-white active">
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
            <a href="/admin/reviews" className="nav-link text-white">
              <i className="fas fa-comment-dots me-2"></i> Reviews
            </a>
          </li>
          <li className="nav-item mb-2">
            <a href="/admin/analytics" className="nav-link text-white">
              <i className="fas fa-chart-line me-2"></i> Analytics
            </a>
          </li>
        </ul>
      </div>
      {/* Main Content */}
      <main className="admin-content">
        <div className="admin-header">
          <h2>Tutorial Management</h2>
          <select
            className="sort-select"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="MP">Most Played (MP)</option>
            <option value="TR">Top Rated (TR)</option>
            <option value="RU">Recently Used/Made (RU/RM)</option>
          </select>
        </div>

        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tutorial Title</th>
                <th>Category</th>
                <th>Views</th>
                <th>Rating</th>
                <th>Date Added</th>
                <th>Tag</th>
              </tr>
            </thead>
            <tbody>
              {sortedTutorials.map((item, index) => (
                <tr key={index}>
                  <td>{item.title}</td>
                  <td>{item.category}</td>
                  <td>{item.views}</td>
                  <td>{item.rating.toFixed(1)} ⭐</td>
                  <td>{item.date}</td>
                  <td>
                    <span
                      className={`tag ${
                        item.tag === "MP"
                          ? "tag-mp"
                          : item.tag === "TR"
                          ? "tag-tr"
                          : "tag-ru"
                      }`}
                    >
                      {item.tag}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
