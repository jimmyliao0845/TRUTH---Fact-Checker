import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
} from "react-icons/fa";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";

// 🔥 Firestore imports
import { getFirestore, collection, getDocs } from "firebase/firestore";

import "./FactCheckerDashboard.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function FactCheckerDashboard() {
  const navigate = useNavigate();
  const db = getFirestore();

  const [collapsed, setCollapsed] = useState(false);

  // 🔥 Firestore user metrics
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [newUsersMonth, setNewUsersMonth] = useState(0);

  // ✓ Auth check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) navigate("/login");
    });
    return () => unsubscribe();
  }, [navigate]);

  // 🔥 Fetch Firestore user analytics
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const snapshot = await getDocs(collection(db, "users"));
        const users = snapshot.docs.map((doc) => doc.data());

        const now = new Date();
        const month = now.getMonth();
        const year = now.getFullYear();

        let total = users.length;
        let active = 0;
        let newMonth = 0;

        users.forEach((u) => {
          const created = new Date(u.created_at);

          // New users in current month
          if (created.getMonth() === month && created.getFullYear() === year) {
            newMonth++;
          }

          // Active users (created in last 30 days)
          const days = (now - created) / (1000 * 60 * 60 * 24);
          if (days <= 30) active++;
        });

        setTotalUsers(total);
        setActiveUsers(active);
        setNewUsersMonth(newMonth);
      } catch (e) {
        console.error("Failed to load Firestore users:", e);
      }
    };

    loadUsers();
  }, [db]);

  // Dummy charts (unchanged)
  const userGrowthData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Users",
        data: [120, 200, 300, 450, 600, 750],
        borderColor: "#007bff",
        backgroundColor: "rgba(0,123,255,0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const reviewData = {
    labels: ["Positive", "Neutral", "Negative"],
    datasets: [
      {
        label: "Reviews",
        data: [85, 10, 5],
        backgroundColor: ["#28a745", "#ffc107", "#dc3545"],
      },
    ],
  };

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      className="d-flex"
      style={{ backgroundColor: "#f8f9fa", paddingTop: "56px" }}
    >
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
          <li>
            <button
              className="btn sidebar-btn text-start"
              onClick={() => scrollToSection("search")}
            >
              <FaTachometerAlt className="me-2" />
              {!collapsed && "Dashboard"}
            </button>
          </li>

          <li>
            <button className="btn sidebar-btn text-start">
              <FaPlusCircle className="me-2" />
              {!collapsed && "Create Tutorial"}
            </button>
          </li>

          <li>
            <button
              className="btn sidebar-btn text-start"
              onClick={() => scrollToSection("semantic")}
            >
              <FaEdit className="me-2" />
              {!collapsed && "Manage Tutorial"}
            </button>
          </li>

          <li>
            <button
              className="btn sidebar-btn text-start"
              onClick={() => scrollToSection("report")}
            >
              <FaChartBar className="me-2" />
              {!collapsed && "Organized Reports"}
            </button>
          </li>

          <li>
            <button
              className="btn sidebar-btn text-start"
              onClick={() => scrollToSection("deepfake")}
            >
              <FaUsers className="me-2" />
              {!collapsed && "Linked Users"}
            </button>
          </li>

          <li>
            <button
              className="btn sidebar-btn text-start"
              onClick={() => scrollToSection("feedback")}
            >
              <FaCommentDots className="me-2" />
              {!collapsed && "User Feedback"}
            </button>
          </li>

          <li>
            <button
              className="btn sidebar-btn text-start"
              onClick={() => scrollToSection("logs")}
            >
              <FaClipboardList className="me-2" />
              {!collapsed && "Verification Data Logs"}
            </button>
          </li>

          <li>
            <button
              className="btn sidebar-btn text-start"
              onClick={() => scrollToSection("profile")}
            >
              <FaUserCog className="me-2" />
              {!collapsed && "Profile Settings"}
            </button>
          </li>
        </ul>

        {!collapsed && (
          <div className="mt-auto small text-muted">
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
        {/* Navbar */}
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
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li>
                <span className="dropdown-item text-muted">
                  No new notifications
                </span>
              </li>
            </ul>
          </div>
        </nav>

        {/* Dashboard Overview */}
        <div className="container-fluid py-4 px-5" id="search">
          <h2 className="fw-bold mb-4 text-dark">Dashboard Overview</h2>

          <div className="row mb-4">
            <div className="col-md-4">
              <div className="card shadow-sm p-3 border-0 text-center">
                <h6 className="text-muted">Total Users</h6>
                <h3 className="fw-bold text-primary">{totalUsers}</h3>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card shadow-sm p-3 border-0 text-center">
                <h6 className="text-muted">Active Users</h6>
                <h3 className="fw-bold text-success">{activeUsers}</h3>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card shadow-sm p-3 border-0 text-center">
                <h6 className="text-muted">New Users This Month</h6>
                <h3 className="fw-bold text-info">{newUsersMonth}</h3>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="row">
            <div className="col-md-6 mb-4">
              <div className="card shadow-sm p-3 border-0">
                <h6 className="text-muted mb-3 text-center">User Growth</h6>
                <Line data={userGrowthData} />
              </div>
            </div>

            <div className="col-md-6 mb-4">
              <div className="card shadow-sm p-3 border-0">
                <h6 className="text-muted mb-3 text-center">
                  Review Statistics
                </h6>
                <Bar data={reviewData} />
              </div>
            </div>
          </div>
        </div>

        {/* The rest of your file is unchanged */}
        {/* Manage Tutorial, Modals, Styling */}
      </div>

      {/* Sidebar Button Styles */}
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

          .sidebar-btn:hover {
            background-color: #000;
            color: #fff;
          }
        `}
      </style>
    </div>
  );
}
