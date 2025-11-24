/* Sidebar for admin dashboard*/
import React from "react";
import { Link } from "react-router-dom";
import "./AdminDashboard.css";

export default function Sidebar() {
  return (
    <div className="sidebar">
      <h2 className="sidebar-title">Admin Panel</h2>
      <ul className="sidebar-nav">
        <li><Link to="/admin-dashboard">Dashboard</Link></li>
        <li><Link to="/admin-user-management">User Management</Link></li>
        <li><Link to="/admin-tutorials">Tutorials</Link></li>
        <li><Link to="/admin-reviews">Reviews</Link></li>
        <li><Link to="/admin-analytics">Analytics</Link></li>
      </ul>

      <style>{`
        .sidebar {
          width: 230px;
          background: #1d3557;
          color: white;
          height: 100vh;
          position: fixed;
          padding: 1rem;
        }
        .sidebar-title {
          font-size: 1.4rem;
          font-weight: bold;
          margin-bottom: 1rem;
        }
        .sidebar-nav {
          list-style: none;
          padding: 0;
        }
        .sidebar-nav li {
          margin: 0.8rem 0;
        }
        .sidebar-nav a {
          color: #f1faee;
          text-decoration: none;
          transition: 0.2s;
        }
        .sidebar-nav a:hover {
          color: #a8dadc;
        }
      `}</style>
    </div>
  );
}
