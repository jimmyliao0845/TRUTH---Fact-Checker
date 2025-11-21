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
} from "chart.js";
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
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) navigate("/login");
    });
    return () => unsubscribe();
  }, [navigate]);

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

          {/* 🔥 LINKED USERS BUTTON */}
          <li>
            <button
              className="btn sidebar-btn text-start"
              onClick={() => scrollToSection("linked-users")}
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
              {!collapsed && "Verification Logs"}
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
              style={{ cursor: "pointer" }}
            ></i>
            <ul className="dropdown-menu dropdown-menu-end p-2 shadow-lg">
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

        {/* ===================== */}
        {/* DASHBOARD OVERVIEW    */}
        {/* ===================== */}
        <div className="container-fluid py-4 px-5" id="search">
          <h2 className="fw-bold mb-4 text-dark">Dashboard Overview</h2>

          {/* Cards */}
          <div className="row mb-4">
            <div className="col-md-4">
              <div className="card shadow-sm p-3 border-0 text-center">
                <h6 className="text-muted">Total Users</h6>
                <h3 className="fw-bold text-primary">1,200</h3>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card shadow-sm p-3 border-0 text-center">
                <h6 className="text-muted">Active Users</h6>
                <h3 className="fw-bold text-success">870</h3>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card shadow-sm p-3 border-0 text-center">
                <h6 className="text-muted">New Users This Month</h6>
                <h3 className="fw-bold text-info">145</h3>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="row">
            <div className="col-md-6 mb-4">
              <div className="card shadow-sm p-3">
                <h6 className="text-muted mb-3 text-center">User Growth</h6>
                <Line data={userGrowthData} />
              </div>
            </div>

            <div className="col-md-6 mb-4">
              <div className="card shadow-sm p-3">
                <h6 className="text-muted mb-3 text-center">
                  Review Statistics
                </h6>
                <Bar data={reviewData} />
              </div>
            </div>
          </div>
        </div>

        {/* ====================== */}
        {/* MANAGE TUTORIAL        */}
        {/* ====================== */}
        <div
          id="semantic"
          className="container-fluid py-5 px-5"
          style={{ minHeight: "100vh", backgroundColor: "#fff" }}
        >
          <h2 className="fw-bold mb-4 text-dark">Manage Tutorial</h2>

          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="text-muted">Sort by:</h6>
            <select className="form-select w-auto">
              <option>Recent Activity</option>
              <option>Date Created</option>
              <option>Most Viewed</option>
            </select>
          </div>

          <div
            className="table-responsive border rounded shadow-sm"
            style={{ maxHeight: "400px", overflowY: "auto" }}
          >
            <table className="table table-striped mb-0 text-center align-middle">
              <thead className="table-dark">
                <tr>
                  <th>Tutorial Title</th>
                  <th>Views</th>
                  <th>Date Created</th>
                  <th>Recent Status</th>
                  <th>Edit or Delete</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>Sample Title</td>
                  <td>********</td>
                  <td>Mon / Dy / Yr</td>
                  <td>********</td>
                  <td>
                    <button
                      className="btn btn-outline-primary btn-sm me-2"
                      data-bs-toggle="modal"
                      data-bs-target="#editTutorialModal"
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button className="btn btn-outline-danger btn-sm">
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ====================== */}
        {/* 🔥 LINKED USERS SECTION */}
        {/* ====================== */}
        <div
          id="linked-users"
          className="container-fluid py-5 px-5"
          style={{ minHeight: "100vh", backgroundColor: "#fff" }}
        >
          <h2 className="fw-bold mb-4 text-dark">Manage Linked User</h2>

          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="text-muted">Sort by:</h6>
            <select className="form-select w-auto">
              <option>Recent Activity</option>
              <option>Date Created</option>
              <option>Most Active</option>
            </select>
          </div>

          <div
            className="table-responsive border rounded shadow-sm"
            style={{ maxHeight: "420px", overflowY: "auto" }}
          >
            <table className="table table-striped mb-0 text-center align-middle">
              <thead className="table-dark">
                <tr>
                  <th>User Name</th>
                  <th>No. of Entries</th>
                  <th>Date Created</th>
                  <th>Account Status</th>
                  <th>Unlink User</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>Sample Name</td>
                  <td>********</td>
                  <td>Mn / Dy / Yr</td>
                  <td>********</td>
                  <td>
                    <button className="btn btn-outline-danger btn-sm rounded-circle">
                      <i className="bi bi-x-lg"></i>
                    </button>
                  </td>
                </tr>

                <tr>
                  <td colSpan="5" style={{ height: "60px" }}></td>
                </tr>
                <tr>
                  <td colSpan="5" style={{ height: "60px" }}></td>
                </tr>
                <tr>
                  <td colSpan="5" style={{ height: "60px" }}></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SIDEBAR HOVER CSS */}
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
