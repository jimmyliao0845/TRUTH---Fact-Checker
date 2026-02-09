import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function UserManagement() {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "Juan Dela Cruz",
      email: "juan@example.com",
      role: "General User",
      status: "Active",
    },
    {
      id: 2,
      name: "Maria Santos",
      email: "maria@example.com",
      role: "Professional User",
      status: "Pending Verification",
    },
    {
      id: 3,
      name: "Admin Account",
      email: "admin@example.com",
      role: "Administrator",
      status: "Active",
    },
  ]);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter((user) => user.id !== id));
    }
  };

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div
        className="d-flex flex-column p-3 text-white"
        style={{
          width: "240px",
          minHeight: "100vh",
          backgroundColor: "var(--sidebar-color)",
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
      <div
        className="flex-grow-1 p-4"
        style={{ background: "var(--primary-color)", minHeight: "100vh" }}
      >
        <h2 className="fw-bold mb-4 text-dark">User Management</h2>

        <div className="card shadow-sm border-0">
          <div className="card-body">
            <table className="table align-middle table-striped">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user, index) => (
                    <tr key={user.id}>
                      <td>{index + 1}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span
                          className={`badge ${
                            user.role === "Administrator"
                              ? "bg-danger"
                              : user.role === "Professional User"
                              ? "bg-info"
                              : "bg-secondary"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            user.status === "Active"
                              ? "bg-success"
                              : user.status === "Pending Verification"
                              ? "bg-warning text-dark"
                              : "bg-secondary"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="text-center">
                        <button className="btn btn-sm btn-outline-primary me-2">
                          <i className="fas fa-eye"></i>
                        </button>
                        <button className="btn btn-sm btn-outline-success me-2">
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(user.id)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-3">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
