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
          background: var(--sidebar-color);
          color: var(--text-color);
          height: 100vh;
          position: fixed;
          padding: 1rem;
          transition: background-color 0.3s ease, color 0.3s ease;
        }
        .sidebar-title {
          font-size: 1.4rem;
          font-weight: bold;
          margin-bottom: 1rem;
          color: var(--text-color);
        }
        .sidebar-nav {
          list-style: none;
          padding: 0;
        }
        .sidebar-nav li {
          margin: 0.8rem 0;
        }
        .sidebar-nav a {
          color: var(--text-color);
          text-decoration: none;
          transition: 0.2s;
          display: block;
          padding: 8px 8px;
          border-radius: 4px;
        }
        .sidebar-nav a:hover {
          background-color: var(--accent-color);
          color: #ffffff;
        }
      `}</style>
    </div>
  );
}
