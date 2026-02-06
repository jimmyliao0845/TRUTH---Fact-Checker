import React, { useEffect, useState } from "react";
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
  FaTrash,
  FaCheck,
} from "react-icons/fa";
import "./FactCheckerDashboard.css";

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
    <div className="d-flex" style={{ backgroundColor: "var(--secondary-color)", paddingTop: "56px" }}>
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
          zIndex: 900,
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
              className={`btn sidebar-btn text-start ${location.pathname === "/factcheckerdashboard" ? "active" : ""}`}
              onClick={() => location.pathname !== "/factcheckerdashboard" && navigate("/factcheckerdashboard")}
              disabled={location.pathname === "/factcheckerdashboard"}
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
              className="btn sidebar-btn text-start"
              onClick={() => navigate("/professional/manage-tutorial")}
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
              className={`btn sidebar-btn text-start ${location.pathname === "/professional/linked-users" ? "active" : ""}`}
              onClick={() => location.pathname !== "/professional/linked-users" && navigate("/professional/linked-users")}
              disabled={location.pathname === "/professional/linked-users"}
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
          className="navbar navbar-light bg-light d-flex justify-content-between align-items-center px-4 py-2 shadow-sm"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 1000,
            borderBottom: "1px solid #ddd",
          }}
        >
          <h5 className="mb-0">Linked Users Management</h5>
        </nav>

        {/* MAIN CONTENT */}
        <main className="p-4">
          {/* Alert Messages */}
          {message && (
            <div
              className={`alert ${
                messageType === "success" ? "alert-success" : "alert-danger"
              } alert-dismissible fade show`}
              role="alert"
            >
              {message}
              <button
                type="button"
                className="btn-close"
                onClick={() => setMessage("")}
                aria-label="Close"
              ></button>
            </div>
          )}

          {/* Link New User Section */}
          <div className="card mb-4 shadow-sm">
            <div className="card-header bg-primary text-white">
              <h6 className="mb-0">Link New User</h6>
            </div>
            <div className="card-body">
              <p className="text-muted small">
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
                    />
                    <button
                      className="btn btn-primary"
                      onClick={handleLinkUser}
                      disabled={loading}
                    >
                      {loading ? "Linking..." : "Link User"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Linked Users Table */}
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h6 className="mb-0">
                Your Linked Users ({linkedUsers.length})
              </h6>
            </div>
            <div className="card-body">
              {linkedUsers.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead className="table-dark">
                      <tr>
                        <th>Account ID</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Linked Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {linkedUsers.map((user) => (
                        <tr key={user.id}>
                          <td>
                            <code>{user.accountId}</code>
                          </td>
                          <td>{user.username}</td>
                          <td>{user.email}</td>
                          <td>{user.linkedDate}</td>
                          <td>
                            <span
                              className={`badge ${
                                user.status === "active"
                                  ? "bg-success"
                                  : "bg-warning text-dark"
                              }`}
                            >
                              {user.status}
                            </span>
                          </td>
                          <td>
                            {user.status === "pending" && (
                              <button
                                className="btn btn-sm btn-success me-2"
                                onClick={() => handleApproveUser(user.id)}
                                title="Approve User"
                              >
                                <FaCheck />
                              </button>
                            )}
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleRemoveUser(user.id)}
                              title="Remove User"
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
                <p className="text-muted text-center py-4">
                  No linked users yet. Add one to get started!
                </p>
              )}
            </div>
          </div>

          {/* Information Section */}
          <div className="alert alert-info mt-4" role="alert">
            <h6 className="alert-heading">ℹ️ How Linking Works</h6>
            <ul className="mb-0">
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
