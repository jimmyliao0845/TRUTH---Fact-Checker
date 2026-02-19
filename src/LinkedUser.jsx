import React, { useEffect, useState } from "react";
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
  FaTrash,
  FaCheck,
} from "react-icons/fa";

export default function LinkedUser() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [accountId, setAccountId] = useState("");
  const [linkedUsers, setLinkedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // ✅ Auth check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) navigate("/login");
    });
    return () => unsubscribe();
  }, [navigate]);

  // ✅ Dummy linked users data
  const dummyLinkedUsers = [
    { id: 1, accountId: "ACC-12345", username: "user1", email: "user1@example.com", linkedDate: "2025-01-15", status: "active" },
    { id: 2, accountId: "ACC-67890", username: "user2", email: "user2@example.com", linkedDate: "2025-01-20", status: "active" },
    { id: 3, accountId: "ACC-54321", username: "user3", email: "user3@example.com", linkedDate: "2025-02-01", status: "pending" },
  ];

  useEffect(() => {
    // Load initial linked users
    setLinkedUsers(dummyLinkedUsers);
  }, []);

  // ✅ Link new user by Account Id
  const handleLinkUser = async () => {
    if (!accountId.trim()) {
      setMessage("Please enter an Account ID");
      setMessageType("error");
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      setTimeout(() => {
        const newUser = {
          id: linkedUsers.length + 1,
          accountId: accountId,
          username: `user_${accountId}`,
          email: `${accountId}@example.com`,
          linkedDate: new Date().toISOString().split("T")[0],
          status: "pending",
        };

        setLinkedUsers([...linkedUsers, newUser]);
        setAccountId("");
        setMessage("User linking request sent! Awaiting authentication...");
        setMessageType("success");
      }, 1000);
    } catch (error) {
      setMessage("Error linking user. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Remove linked user
  const handleRemoveUser = (userId) => {
    setLinkedUsers(linkedUsers.filter((user) => user.id !== userId));
    setMessage("User removed successfully");
    setMessageType("success");
  };

  // ✅ Approve pending user
  const handleApproveUser = (userId) => {
    setLinkedUsers(
      linkedUsers.map((user) =>
        user.id === userId ? { ...user, status: "active" } : user
      )
    );
    setMessage("User approved successfully");
    setMessageType("success");
  };

  return (
    <div className="d-flex" style={{ 
      backgroundColor: "var(--primary-color)", 
      paddingTop: "56px",
      minHeight: "100vh",
      color: "var(--text-color)"
    }}>
      {/* SIDEBAR */}
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
            className={`app-sidebar-item ${location.pathname === "/factcheckerdashboard" ? 'active' : ''}`}
            onClick={() => location.pathname !== "/factcheckerdashboard" && navigate("/factcheckerdashboard")}
            disabled={location.pathname === "/factcheckerdashboard"}
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
            className="app-sidebar-item"
            onClick={() => navigate("/professional/manage-tutorial")}
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
            className={`app-sidebar-item ${location.pathname === "/professional/linked-users" ? 'active' : ''}`}
            onClick={() => location.pathname !== "/professional/linked-users" && navigate("/professional/linked-users")}
            disabled={location.pathname === "/professional/linked-users"}
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

          <button
            className="app-sidebar-item"
            onClick={() => navigate("/user/profile")}
          >
            <FaUserCog size={20} />
            <span className="app-sidebar-label">Profile</span>
          </button>

          <div style={{ borderTop: "1px solid var(--accent-color)", marginTop: "1rem", paddingTop: "1rem" }}>
            <button
              className="app-sidebar-item"
              onClick={() => navigate("/analysis")}
            >
              <FaArrowLeft size={20} />
              <span className="app-sidebar-label">Go Back</span>
            </button>
          </div>
        </div>

        {!collapsed && (
          <div className="mt-auto small" style={{ color: "var(--text-color)", opacity: 0.7 }}>
            Professional workspace
          </div>
        )}
      </div>

      {/* MAIN CONTENT */}
      <div className={`app-main-content ${collapsed ? 'with-collapsed-sidebar' : ''}`}>
        {/* NAVBAR - THEME AWARE */}
        <nav
          className="navbar d-flex justify-content-between align-items-center px-4 py-2 shadow-sm"
          style={{
            backgroundColor: "var(--primary-color)",
            borderBottom: `1px solid var(--accent-color)`,
            position: "sticky",
            top: 0,
            zIndex: 1000,
          }}
        >
          <h5 className="mb-0" style={{ color: "var(--text-color)" }}>Linked Users Management</h5>
        </nav>

        {/* MAIN CONTENT */}
        <main className="p-4" style={{ backgroundColor: "var(--primary-color)" }}>
          {/* Alert Messages */}
          {message && (
            <div
              className={`alert alert-dismissible fade show`}
              role="alert"
              style={{
                backgroundColor: messageType === "success" ? "var(--success-color-light)" : "var(--error-color-light)",
                borderColor: messageType === "success" ? "var(--success-color)" : "var(--error-color)",
                color: "var(--text-color)",
              }}
            >
              {message}
              <button
                type="button"
                className="btn-close"
                onClick={() => setMessage("")}
                aria-label="Close"
                style={{
                  filter: "invert(1)",
                }}
              ></button>
            </div>
          )}

          {/* Link New User Section */}
          <div
            className="card mb-4 shadow-sm"
            style={{
              backgroundColor: "var(--secondary-color)",
              border: "2px solid var(--accent-color)",
            }}
          >
            <div
              className="card-header text-white"
              style={{
                backgroundColor: "var(--accent-color)",
                borderColor: "var(--accent-color)",
              }}
            >
              <h6 className="mb-0" style={{ color: "var(--primary-color)" }}>
                Link New User
              </h6>
            </div>
            <div className="card-body" style={{ backgroundColor: "var(--secondary-color)" }}>
              <p className="small" style={{ color: "var(--text-color)", opacity: 0.7 }}>
                Enter the Account ID of the user you want to link. You will need to authenticate the connection.
              </p>
              <div className="row">
                <div className="col-md-8">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter Account ID (e.g., ACC-12345)"
                      value={accountId}
                      onChange={(e) => setAccountId(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleLinkUser()}
                      style={{
                        backgroundColor: "var(--primary-color)",
                        borderColor: "var(--accent-color)",
                        color: "var(--text-color)",
                      }}
                    />
                    <button
                      className="btn"
                      onClick={handleLinkUser}
                      disabled={loading}
                      style={{
                        backgroundColor: "var(--accent-color)",
                        color: "var(--primary-color)",
                        border: "2px solid var(--accent-color)",
                      }}
                      onMouseOver={(e) => {
                        if (!loading) {
                          e.currentTarget.style.backgroundColor = "var(--primary-color)";
                          e.currentTarget.style.color = "var(--accent-color)";
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!loading) {
                          e.currentTarget.style.backgroundColor = "var(--accent-color)";
                          e.currentTarget.style.color = "var(--primary-color)";
                        }
                      }}
                    >
                      {loading ? "Linking..." : "Link User"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Linked Users Table */}
          <div
            className="card shadow-sm"
            style={{
              backgroundColor: "var(--secondary-color)",
              border: "2px solid var(--accent-color)",
            }}
          >
            <div
              className="card-header text-white"
              style={{
                backgroundColor: "var(--accent-color)",
                borderColor: "var(--accent-color)",
              }}
            >
              <h6 className="mb-0" style={{ color: "var(--primary-color)" }}>
                Your Linked Users ({linkedUsers.length})
              </h6>
            </div>
            <div className="card-body" style={{ backgroundColor: "var(--secondary-color)", padding: 0 }}>
              {linkedUsers.length > 0 ? (
                <div className="table-responsive">
                  <table
                    className="table table-striped table-hover mb-0"
                    style={{
                      backgroundColor: "var(--secondary-color)",
                    }}
                  >
                    <thead style={{ backgroundColor: "var(--accent-color)" }}>
                      <tr>
                        <th style={{ color: "var(--primary-color)" }}>Account ID</th>
                        <th style={{ color: "var(--primary-color)" }}>Username</th>
                        <th style={{ color: "var(--primary-color)" }}>Email</th>
                        <th style={{ color: "var(--primary-color)" }}>Linked Date</th>
                        <th style={{ color: "var(--primary-color)" }}>Status</th>
                        <th style={{ color: "var(--primary-color)" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {linkedUsers.map((user) => (
                        <tr
                          key={user.id}
                          style={{
                            color: "var(--text-color)",
                            borderBottomColor: "var(--accent-color)",
                            opacity: 0.9,
                          }}
                        >
                          <td>
                            <code style={{ backgroundColor: "var(--primary-color)", color: "var(--accent-color)" }}>
                              {user.accountId}
                            </code>
                          </td>
                          <td>{user.username}</td>
                          <td>{user.email}</td>
                          <td>{user.linkedDate}</td>
                          <td>
                            <span
                              style={{
                                display: "inline-block",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                backgroundColor:
                                  user.status === "active"
                                    ? "var(--success-color-light)"
                                    : "var(--warning-color-light)",
                                color: user.status === "active" ? "var(--success-color)" : "var(--warning-color)",
                                fontWeight: "bold",
                                fontSize: "0.875rem",
                              }}
                            >
                              {user.status}
                            </span>
                          </td>
                          <td>
                            {user.status === "pending" && (
                              <button
                                className="btn btn-sm me-2"
                                onClick={() => handleApproveUser(user.id)}
                                title="Approve User"
                                style={{
                                  backgroundColor: "var(--success-color-light)",
                                  color: "var(--success-color)",
                                  border: "2px solid var(--success-color)",
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.backgroundColor = "var(--success-color)";
                                  e.currentTarget.style.color = "var(--white-color)";
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.backgroundColor = "var(--success-color-light)";
                                  e.currentTarget.style.color = "var(--success-color)";
                                }}
                              >
                                <FaCheck />
                              </button>
                            )}
                            <button
                              className="btn btn-sm"
                              onClick={() => handleRemoveUser(user.id)}
                              title="Remove User"
                              style={{
                                backgroundColor: "var(--error-color-light)",
                                color: "var(--error-color)",
                                border: "2px solid var(--error-color)",
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = "var(--error-color)";
                                e.currentTarget.style.color = "var(--white-color)";
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = "var(--error-color-light)";
                                e.currentTarget.style.color = "var(--error-color)";
                              }}
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center py-4" style={{ color: "var(--text-color)", opacity: 0.7 }}>
                  No linked users yet. Add one to get started!
                </p>
              )}
            </div>
          </div>

          {/* Information Section */}
          <div
            className="alert mt-4"
            role="alert"
            style={{
              backgroundColor: "rgba(23, 162, 184, 0.1)",
              borderColor: "var(--accent-color)",
              color: "var(--text-color)",
            }}
          >
            <h6 className="alert-heading" style={{ color: "var(--text-color)" }}>
              ℹ️ How Linking Works
            </h6>
            <ul className="mb-0" style={{ color: "var(--text-color)", opacity: 0.9 }}>
              <li>Enter the Account ID of the user you want to link</li>
              <li>
                The user will receive an authentication request on their end
              </li>
              <li>Once they approve, the link will become active</li>
              <li>You can remove linked users at any time</li>
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
}
