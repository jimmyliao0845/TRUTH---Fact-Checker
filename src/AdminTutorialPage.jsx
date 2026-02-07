import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./styles.css";

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
   <div className="d-flex" style={{ backgroundColor: "var(--primary-color)", minHeight: "100vh" }}>
      {/* Sidebar */}
      <div
        className="d-flex flex-column p-3"
        style={{
          width: "240px",
          minHeight: "100vh",
          backgroundColor: "var(--secondary-color)",
          borderRight: `2px solid var(--accent-color)`,
          boxShadow: "2px 0 10px rgba(0,0,0,0.3)",
          color: "var(--text-color)"
        }}
      >
        <h4 className="text-center mb-4 fw-semibold" style={{ color: "var(--text-color)" }}>Admin Panel</h4>

        <ul className="nav flex-column">
          <li className="nav-item mb-2">
            <a 
              href="/admin-dashboard" 
              className="nav-link"
              style={{
                color: "var(--text-color)",
                textDecoration: "none",
                padding: "10px 12px",
                borderRadius: "5px",
                backgroundColor: "transparent",
                transition: "all 0.2s ease-in-out",
                display: "block"
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
              className="nav-link"
              style={{
                color: "var(--text-color)",
                textDecoration: "none",
                padding: "10px 12px",
                borderRadius: "5px",
                backgroundColor: "transparent",
                transition: "all 0.2s ease-in-out",
                display: "block"
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
              className="nav-link"
              style={{
                color: "var(--text-color)",
                textDecoration: "none",
                padding: "10px 12px",
                borderRadius: "5px",
                backgroundColor: "var(--accent-color)",
                color: "var(--primary-color)",
                transition: "all 0.2s ease-in-out",
                display: "block"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "var(--accent-color)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "var(--accent-color)";
                e.currentTarget.style.color = "var(--primary-color)";
              }}
            >
              <i className="fas fa-chalkboard-teacher me-2"></i> Tutorials
            </a>
          </li>
          <li className="nav-item mb-2">
            <a 
              href="/admin/reviews" 
              className="nav-link"
              style={{
                color: "var(--text-color)",
                textDecoration: "none",
                padding: "10px 12px",
                borderRadius: "5px",
                backgroundColor: "transparent",
                transition: "all 0.2s ease-in-out",
                display: "block"
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
              <i className="fas fa-comment-dots me-2"></i> Reviews
            </a>
          </li>
          <li className="nav-item mb-2">
            <a 
              href="/admin/analytics" 
              className="nav-link"
              style={{
                color: "var(--text-color)",
                textDecoration: "none",
                padding: "10px 12px",
                borderRadius: "5px",
                backgroundColor: "transparent",
                transition: "all 0.2s ease-in-out",
                display: "block"
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
      </div>
      {/* Main Content */}
      <main 
        className="admin-content"
        style={{
          flex: 1,
          backgroundColor: "var(--primary-color)",
          color: "var(--text-color)",
          padding: "20px"
        }}
      >
        <div 
          className="admin-header"
          style={{
            marginBottom: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <h2 style={{ color: "var(--text-color)" }}>Tutorial Management</h2>
          <select
            className="sort-select"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            style={{
              backgroundColor: "var(--secondary-color)",
              borderColor: "var(--accent-color)",
              color: "var(--text-color)",
              padding: "8px 12px",
              borderRadius: "4px"
            }}
          >
            <option value="MP">Most Played (MP)</option>
            <option value="TR">Top Rated (TR)</option>
            <option value="RU">Recently Used/Made (RU/RM)</option>
          </select>
        </div>

        <div 
          className="table-container"
          style={{
            borderRadius: "8px",
            border: `2px solid var(--accent-color)`,
            overflow: "hidden"
          }}
        >
          <table 
            className="admin-table"
            style={{
              width: "100%",
              borderCollapse: "collapse",
              backgroundColor: "var(--secondary-color)"
            }}
          >
            <thead style={{ backgroundColor: "var(--accent-color)" }}>
              <tr>
                <th style={{ padding: "12px", color: "var(--primary-color)", textAlign: "left" }}>Tutorial Title</th>
                <th style={{ padding: "12px", color: "var(--primary-color)", textAlign: "left" }}>Category</th>
                <th style={{ padding: "12px", color: "var(--primary-color)", textAlign: "left" }}>Views</th>
                <th style={{ padding: "12px", color: "var(--primary-color)", textAlign: "left" }}>Rating</th>
                <th style={{ padding: "12px", color: "var(--primary-color)", textAlign: "left" }}>Date Added</th>
                <th style={{ padding: "12px", color: "var(--primary-color)", textAlign: "left" }}>Tag</th>
              </tr>
            </thead>
            <tbody>
              {sortedTutorials.map((item, index) => (
                <tr 
                  key={index}
                  style={{
                    borderBottom: `1px solid var(--accent-color)`,
                    opacity: 0.9,
                    color: "var(--text-color)"
                  }}
                >
                  <td style={{ padding: "12px" }}>{item.title}</td>
                  <td style={{ padding: "12px" }}>{item.category}</td>
                  <td style={{ padding: "12px" }}>{item.views}</td>
                  <td style={{ padding: "12px" }}>{item.rating.toFixed(1)} ⭐</td>
                  <td style={{ padding: "12px" }}>{item.date}</td>
                  <td style={{ padding: "12px" }}>
                    <span
                      className="tag"
                      style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        backgroundColor: 
                          item.tag === "MP" ? "var(--accent-color)" :
                          item.tag === "TR" ? "#28a745" :
                          "#ffc107",
                        color: 
                          item.tag === "MP" ? "var(--primary-color)" :
                          item.tag === "TR" ? "white" :
                          "black",
                        fontSize: "12px",
                        fontWeight: "500"
                      }}
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
