import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import "bootstrap/dist/css/bootstrap.min.css";
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
import "./FactCheckerDashboard.css";

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

  // ✅ Smooth scroll
  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="d-flex" style={{ backgroundColor: "#f8f9fa", paddingTop: "56px" }}>
      {/* Sidebar */}
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
          zIndex: 900
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

        {/* Sidebar Menu */}
        <ul className="nav flex-column">
<<<<<<< HEAD
          <li><button className="btn sidebar-btn text-start" onClick={() => navigate("/factcheckerdashboard")}><FaTachometerAlt className="me-2" />{!collapsed && "Dashboard"}</button></li>
          <li><button className="btn sidebar-btn text-start" onClick={() => navigate("/professional/create-tutorial")}><FaPlusCircle className="me-2" />{!collapsed && "Create Tutorial"}</button></li>
          <li><button className={`btn sidebar-btn text-start ${location.pathname === "/professional/manage-tutorial" ? "active" : ""}`} onClick={() => location.pathname !== "/professional/manage-tutorial" && navigate("/professional/manage-tutorial")} disabled={location.pathname === "/professional/manage-tutorial"}><FaEdit className="me-2" />{!collapsed && "Manage Tutorial"}</button></li>
          <li><button className="btn sidebar-btn text-start" onClick={() => navigate("/professional/reports")}><FaChartBar className="me-2" />{!collapsed && "Organized Reports"}</button></li>
          <li><button className="btn sidebar-btn text-start" onClick={() => navigate("/professional/linked-users")}><FaUsers className="me-2" />{!collapsed && "Linked Users"}</button></li>
          <li><button className="btn sidebar-btn text-start" onClick={() => navigate("/professional/user-feedback")}><FaCommentDots className="me-2" />{!collapsed && "User Feedback"}</button></li>
          <li><button className="btn sidebar-btn text-start" onClick={() => navigate("/professional/verification-logs")}><FaClipboardList className="me-2" />{!collapsed && "Verification Logs"}</button></li>
          <li><button className="btn sidebar-btn text-start" onClick={() => navigate("/professional/profile")}><FaUserCog className="me-2" />{!collapsed && "Profile"}</button></li>

          {/* Go Back to Analysis Page */}
=======
          <li>
            <button
              className="btn sidebar-btn text-start"
              onClick={() => navigate("/factcheckerdashboard")}
            >
              <FaTachometerAlt className="me-2" />
              {!collapsed && "Dashboard"}
            </button>
          </li>

          <li>
            <button 
              className="btn sidebar-btn text-start"
              onClick={() => navigate("/professional/create-tutorial")}
            >
              <FaPlusCircle className="me-2" />
              {!collapsed && "Create Tutorial"}
            </button>
          </li>

          <li>
            <button
              className={`btn sidebar-btn text-start ${location.pathname === "/professional/manage-tutorial" ? "active" : ""}`}
              onClick={() => location.pathname !== "/professional/manage-tutorial" && navigate("/professional/manage-tutorial")}
              disabled={location.pathname === "/professional/manage-tutorial"}
            >
              <FaEdit className="me-2" />
              {!collapsed && "Manage Tutorial"}
            </button>
          </li>

          <li>
            <button
              className="btn sidebar-btn text-start"
              onClick={() => navigate("/professional/reports")}
            >
              <FaChartBar className="me-2" />
              {!collapsed && "Organized Reports"}
            </button>
          </li>

          <li>
            <button
              className="btn sidebar-btn text-start"
              onClick={() => navigate("/professional/linked-users")}
            >
              <FaUsers className="me-2" />
              {!collapsed && "Linked Users"}
            </button>
          </li>

          <li>
            <button
              className="btn sidebar-btn text-start"
              onClick={() => navigate("/professional/user-feedback")}
            >
              <FaCommentDots className="me-2" />
              {!collapsed && "User Feedback"}
            </button>
          </li>

          <li>
            <button
              className="btn sidebar-btn text-start"
              onClick={() => navigate("/professional/verification-logs")}
            >
              <FaClipboardList className="me-2" />
              {!collapsed && "Verification Logs"}
            </button>
          </li>

          <li>
            <button
              className="btn sidebar-btn text-start"
              onClick={() => navigate("/professional/profile")}
            >
              <FaUserCog className="me-2" />
              {!collapsed && "Profile"}
            </button>
          </li>

          {/* 🚀 NEW BUTTON: Go Back to Analysis Page */}
>>>>>>> main
          <li className="mt-4 border-top pt-2">
            <button
              className="btn sidebar-btn text-start"
              onClick={() => navigate("/analysis")}
            >
              <FaArrowLeft className="me-2" />
              {!collapsed && "Go Back to Analysis Page"}
            </button>
          </li>
        </ul>


        {!collapsed && (
          <div className="mt-4 small text-muted">
            Verified professionals workspace
          </div>
        )}
      </div>

      {/* Main Content */}
      <div
        className="flex-grow-1"
        style={{
          marginLeft: collapsed ? "80px" : "250px",
          transition: "margin-left 0.3s ease",
          minHeight: "100vh",
        }}
      >
        {/* Local Navbar (Notification Bell) */}
        <nav
          className="navbar navbar-light bg-light d-flex justify-content-end align-items-center px-4 py-2 shadow-sm"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 1000,
            borderBottom: "1px solid #ddd",
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
                backgroundColor: "#fff",
                borderRadius: "10px",
                border: "1px solid #ddd",
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
            <h2>Tutorial Management</h2>
            <select
              className="form-select w-auto"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="MP">Most Played (MP)</option>
              <option value="TR">Top Rated (TR)</option>
              <option value="RU">Recently Used/Made (RU/RM)</option>
            </select>
          </div>

          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead className="table-dark">
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
                        className={`badge ${
                          item.tag === "MP"
                            ? "bg-primary"
                            : item.tag === "TR"
                            ? "bg-success"
                            : "bg-warning text-dark"
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

      {/* Sidebar Styles */}
      <style>
        {`
          .sidebar-btn {
            background: none;
            border: none;
            color: #000;
            padding: 10px 12px;
            border-radius: 5px;
            width: 100%;
            text-align: left;
            transition: all 0.2s ease-in-out;
            font-weight: 500;
          }
          .sidebar-btn:hover, .sidebar-btn.active {
            background-color: #000;
            color: #fff;
          }
        `}
      </style>
    </div>
  );
}
