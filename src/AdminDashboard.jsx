import React from "react";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend);

export default function AdminDashboard() {
  const userGrowthData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "New Users",
        data: [80, 120, 150, 180, 200, 240],
        borderColor: "#007bff",
        backgroundColor: "rgba(0,123,255,0.2)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const reviewData = {
    labels: ["Positive", "Negative", "Neutral"],
    datasets: [
      {
        label: "Reviews",
        data: [400, 100, 40],
        backgroundColor: ["#198754", "#dc3545", "#6c757d"],
      },
    ],
  };

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

        <hr className="border-secondary" />

        <div className="mt-auto text-center">
          <a href="/" className="text-white text-decoration-none">
            <i className="fas fa-sign-out-alt me-2"></i> Logout
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-fluid py-4 px-5" style={{ background: "#f8f9fa", minHeight: "100vh" }}>
        <h2 className="fw-bold mb-4 text-dark">Dashboard Overview</h2>

        {/* Stats Summary */}
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
            <div className="card shadow-sm p-3 border-0">
              <h6 className="text-muted mb-3 text-center">User Growth</h6>
              <Line data={userGrowthData} />
            </div>
          </div>
          <div className="col-md-6 mb-4">
            <div className="card shadow-sm p-3 border-0">
              <h6 className="text-muted mb-3 text-center">Review Statistics</h6>
              <Bar data={reviewData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
