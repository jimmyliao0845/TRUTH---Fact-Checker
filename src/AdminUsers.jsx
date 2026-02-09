import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./styles.css";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("recent");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const q = query(collection(db, "users"), orderBy("created_at", "desc"));
        const snapshot = await getDocs(q);
        const userList = [];
        snapshot.forEach((doc) => userList.push({ id: doc.id, ...doc.data() }));
        setUsers(userList);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const sortedUsers = [...users].sort((a, b) => {
    if (sortBy === "recent") {
      return new Date(b.created_at) - new Date(a.created_at);
    } else if (sortBy === "name") {
      return (a.name || "").localeCompare(b.name || "");
    }
    return 0;
  });

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div
        className="d-flex flex-column p-3"
        style={{
          width: "240px",
          minHeight: "100vh",
          backgroundColor: "var(--secondary-color)",
          borderRight: "2px solid var(--accent-color)",
          boxShadow: "2px 0 10px rgba(0,0,0,0.3)",
          color: "var(--text-color)",
        }}
      >
        <h4 className="text-center mb-4 fw-semibold" style={{ color: "var(--text-color)" }}>
          Admin Panel
        </h4>
        <ul className="nav flex-column">
          <li className="nav-item mb-2">
            <a
              href="/admin-dashboard"
              style={{
                color: "var(--text-color)",
                backgroundColor: "transparent",
                padding: "10px",
                borderRadius: "4px",
                display: "inline-block",
                textDecoration: "none",
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
              style={{
                color: "var(--primary-color)",
                backgroundColor: "var(--accent-color)",
                padding: "10px",
                borderRadius: "4px",
                display: "inline-block",
                textDecoration: "none",
              }}
            >
              <i className="fas fa-users me-2"></i> Users
            </a>
          </li>
          <li className="nav-item mb-2">
            <a
              href="/admin/tutorials"
              style={{
                color: "var(--text-color)",
                backgroundColor: "transparent",
                padding: "10px",
                borderRadius: "4px",
                display: "inline-block",
                textDecoration: "none",
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
              <i className="fas fa-chalkboard-teacher me-2"></i> Tutorials
            </a>
          </li>
          <li className="nav-item mb-2">
            <a
              href="/admin/reviews"
              style={{
                color: "var(--text-color)",
                backgroundColor: "transparent",
                padding: "10px",
                borderRadius: "4px",
                display: "inline-block",
                textDecoration: "none",
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
              style={{
                color: "var(--text-color)",
                backgroundColor: "transparent",
                padding: "10px",
                borderRadius: "4px",
                display: "inline-block",
                textDecoration: "none",
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
        <hr style={{ borderColor: "var(--accent-color)" }} />
        <div className="mt-auto text-center">
          <a
            href="/"
            style={{
              color: "var(--text-color)",
              textDecoration: "none",
              padding: "10px",
              borderRadius: "4px",
              display: "inline-block",
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
            <i className="fas fa-sign-out-alt me-2"></i> Logout
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div
        className="container-fluid py-4 px-5"
        style={{
          backgroundColor: "var(--primary-color)",
          minHeight: "100vh",
          color: "var(--text-color)",
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold" style={{ color: "var(--text-color)" }}>
            User Management
          </h2>
          <select
            className="form-select w-auto"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              backgroundColor: "var(--secondary-color)",
              borderColor: "var(--accent-color)",
              color: "var(--text-color)",
            }}
          >
            <option value="recent">Most Recent</option>
            <option value="name">By Name</option>
          </select>
        </div>

        {loading ? (
          <p style={{ color: "var(--text-color)" }}>Loading users...</p>
        ) : (
          <div className="table-responsive rounded shadow-sm" style={{ border: "2px solid var(--accent-color)" }}>
            <table
              className="table table-striped mb-0 text-center align-middle"
              style={{ backgroundColor: "var(--secondary-color)" }}
            >
              <thead style={{ backgroundColor: "var(--accent-color)" }}>
                <tr>
                  <th style={{ color: "var(--primary-color)" }}>Name</th>
                  <th style={{ color: "var(--primary-color)" }}>Email</th>
                  <th style={{ color: "var(--primary-color)" }}>Role</th>
                  <th style={{ color: "var(--primary-color)" }}>Provider</th>
                  <th style={{ color: "var(--primary-color)" }}>Created At</th>
                  <th style={{ color: "var(--primary-color)" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {sortedUsers.map((user) => (
                  <tr
                    key={user.id}
                    style={{
                      color: "var(--text-color)",
                      borderBottom: "2px solid var(--accent-color)",
                      opacity: 0.9,
                    }}
                  >
                    <td>{user.name || "N/A"}</td>
                    <td>{user.email}</td>
                    <td>
                      <span
                        style={{
                          backgroundColor: user.role === "admin" ? "var(--accent-color)" : "transparent",
                          color: user.role === "admin" ? "var(--primary-color)" : "var(--accent-color)",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          border: user.role === "admin" ? "none" : "1px solid var(--accent-color)",
                        }}
                      >
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td>{user.provider || "Email"}</td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td>
                      <span style={{ color: "var(--success-color)", fontWeight: "bold" }}>Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
