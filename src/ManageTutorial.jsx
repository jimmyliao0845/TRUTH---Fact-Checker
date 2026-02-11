import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";
import {
  FaBars,
  FaTachometerAlt,
  FaPlusCircle,
  FaEdit,
  FaChartBar,
  FaUsers,
  FaCommentDots,
  FaClipboardList,
  FaUserCog,
  FaArrowLeft,
} from "react-icons/fa";

export default function ManageTutorial() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // ✅ Auth check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) navigate("/login");
    });
    return () => unsubscribe();
  }, [navigate]);

  // ✅ Sorting state
  const [sortOption, setSortOption] = useState("MP");

  // ✅ Dummy tutorial data
  const tutorials = [
    { title: "How to Spot Misinformation", category: "Fact-Checking", views: 520, rating: 4.8, date: "2025-10-12", tag: "MP" },
    { title: "Evaluating News Sources", category: "Research", views: 300, rating: 4.5, date: "2025-09-30", tag: "TR" },
    { title: "AI Deepfake Detection Basics", category: "Tech", views: 450, rating: 4.7, date: "2025-10-01", tag: "RU" },
    { title: "Understanding Media Bias", category: "Education", views: 700, rating: 4.9, date: "2025-08-21", tag: "MP" },
    { title: "Cross-verifying Sources Online", category: "Research", views: 290, rating: 4.6, date: "2025-09-11", tag: "TR" },
  ];

  // ✅ Derived sorted tutorials
  const sortedTutorials = useMemo(() => {
    let sorted = [...tutorials];
    switch (sortOption) {
      case "MP":
        sorted.sort((a, b) => b.views - a.views);
        break;
      case "TR":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case "RU":
        sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      default:
        break;
    }
    return sorted;
  }, [sortOption, tutorials]);

  return (
    <div className="d-flex" style={{ backgroundColor: "var(--primary-color)", paddingTop: "56px", minHeight: "100vh" }}>
      {/* Sidebar */}
      <div className={`app-sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <button 
            className="app-sidebar-toggle"
            onClick={() => setCollapsed(!collapsed)}
          >
            <FaBars />
          </button>
        </div>

        {/* Sidebar Menu */}
        <div className="d-flex flex-column gap-1">
          <button
            className="app-sidebar-item"
            onClick={() => navigate("/factcheckerdashboard")}
          >
            <FaTachometerAlt size={20} />
            <span className="app-sidebar-label">Dashboard</span>
          </button>

          <button 
            className="app-sidebar-item"
            onClick={() => navigate("/professional/create-tutorial")}
          >
            <FaPlusCircle size={20} />
            <span className="app-sidebar-label">Create Tutorial</span>
          </button>

          <button
            className={`app-sidebar-item ${location.pathname === "/professional/manage-tutorial" ? 'active' : ''}`}
            onClick={() => location.pathname !== "/professional/manage-tutorial" && navigate("/professional/manage-tutorial")}
            disabled={location.pathname === "/professional/manage-tutorial"}
          >
            <FaEdit size={20} />
            <span className="app-sidebar-label">Manage Tutorial</span>
          </button>

          <button
            className="app-sidebar-item"
            onClick={() => navigate("/professional/reports")}
          >
            <FaChartBar size={20} />
            <span className="app-sidebar-label">Organized Reports</span>
          </button>

          <button
            className="app-sidebar-item"
            onClick={() => navigate("/professional/linked-users")}
          >
            <FaUsers size={20} />
            <span className="app-sidebar-label">Linked Users</span>
          </button>

          <button
            className="app-sidebar-item"
            onClick={() => navigate("/professional/user-feedback")}
          >
            <FaCommentDots size={20} />
            <span className="app-sidebar-label">User Feedback</span>
          </button>

          <button
            className="app-sidebar-item"
            onClick={() => navigate("/professional/verification-logs")}
          >
            <FaClipboardList size={20} />
            <span className="app-sidebar-label">Verification Logs</span>
          </button>

          {/* Go Back to Analysis Page */}
          <div style={{ borderTop: "1px solid var(--accent-color)", marginTop: "1rem", paddingTop: "1rem" }}>
            <button
              className="app-sidebar-item"
              onClick={() => navigate("/analysis")}
            >
              <FaArrowLeft size={20} />
              <span className="app-sidebar-label">Go Back to Analysis</span>
            </button>
          </div>
        </div>

        {!collapsed && (
          <div className="mt-4 small" style={{ color: "var(--text-color)", opacity: 0.7 }}>
            Verified professionals workspace
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className={`app-main-content ${collapsed ? 'with-collapsed-sidebar' : ''}`}>
        {/* Local Navbar (Notification Bell) */}
        <nav
          className="navbar d-flex justify-content-end align-items-center px-4 py-2 shadow-sm"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 1000,
            backgroundColor: "var(--primary-color)",
            borderBottom: `1px solid var(--accent-color)`,
          }}
        >
          <div className="dropdown">
            <i
              className="bi bi-bell fs-5 text-dark"
              data-bs-toggle="dropdown"
                                  aria-expanded="false"
              style={{ cursor: "pointer" }}
            ></i>
            <ul
              className="dropdown-menu dropdown-menu-end p-2 shadow-lg"
              style={{
                backgroundColor: "var(--secondary-color)",
                borderRadius: "10px",
                border: "1px solid var(--accent-color)",
                minWidth: "250px",
              }}
            >
              <li className="fw-bold text-dark px-2">Notifications</li>
              <li><hr className="dropdown-divider" /></li>
              <li><span className="dropdown-item text-muted">No new notifications</span></li>
            </ul>
          </div>
        </nav>

        {/* Main Tutorial Management Table */}
        <main className="admin-content p-4">
          <div className="admin-header d-flex justify-content-between align-items-center mb-3">
            <h2 style={{ color: "var(--text-color)" }}>Tutorial Management</h2>
            <select
              className="form-select w-auto"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              style={{
                backgroundColor: "var(--secondary-color)",
                borderColor: "var(--accent-color)",
                color: "var(--text-color)"
              }}
            >
              <option value="MP">Most Played (MP)</option>
              <option value="TR">Top Rated (TR)</option>
              <option value="RU">Recently Used/Made (RU/RM)</option>
            </select>
          </div>

          <div className="table-responsive" style={{ borderRadius: "8px", border: `2px solid var(--accent-color)`, backgroundColor: "var(--secondary-color)" }}>
            <table className="table table-striped table-hover mb-0" style={{ color: "var(--text-color)" }}>
              <thead style={{ backgroundColor: "var(--accent-color)", color: "var(--primary-color)" }}>
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
                  <tr key={index} style={{ borderColor: "var(--accent-color)", opacity: 0.9 }}>
                    <td>{item.title}</td>
                    <td>{item.category}</td>
                    <td>{item.views}</td>
                    <td>{item.rating.toFixed(1)} ⭐</td>
                    <td>{item.date}</td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: item.tag === "MP" ? "var(--accent-color)" : item.tag === "TR" ? "var(--success-color)" : "var(--warning-color)",
                          color: item.tag === "MP" ? "var(--primary-color)" : item.tag === "RU" ? "var(--white-color)" : "var(--primary-color)"
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

      {/* Sidebar Styles */}
      <style>
        {`
          .sidebar-btn {
            background: none;
            border: none;
            color: var(--text-color);
            padding: 10px 12px;
            border-radius: 5px;
            width: 100%;
            text-align: left;
            transition: all 0.2s ease-in-out;
            font-weight: 500;
          }
        `}
      </style>
    </div>
  );
}