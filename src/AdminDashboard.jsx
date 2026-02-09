import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
import "./styles.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { auth, db } from "./firebase";
import { collection, getDocs, getDoc, updateDoc, doc, query, orderBy } from "firebase/firestore";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend);

export default function AdminDashboard() {
  const [currentUserRole, setCurrentUserRole] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalActionType, setModalActionType] = useState(""); // "promote" or "demote"
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [growthLabels, setGrowthLabels] = useState([]);
  const [growthValues, setGrowthValues] = useState([]);
  const [newUsersMonth, setNewUsersMonth] = useState(0);
  const [currentUserEmail, setCurrentUserEmail] = useState("");

  const userGrowthData = {
  labels: growthLabels,
  datasets: [
    {
      label: "New Users",
      data: growthValues,
      borderColor: "var(--info-color)",
      backgroundColor: "var(--info-color-light)",
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
        backgroundColor: ["var(--success-color)", "var(--error-color)", "var(--neutral-color)"],
      },
    ],
  };

  // Fetch users from Firestore
  const fetchUsers = async () => {
    try {
      const q = query(collection(db, "users"), orderBy("created_at", "desc"));
      const snapshot = await getDocs(q);
  
      const userList = [];
      snapshot.forEach((doc) => userList.push({ id: doc.id, ...doc.data() }));
  
      setUsers(userList);
      setLoading(false);
  
      // ===== ANALYTICS CALCULATION =====
      const now = new Date();
      const month = now.getMonth();
      const year = now.getFullYear();
  
      const growthMap = new Map();
  
      // Pre-fill last 6 months
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
  
        const key = d.toLocaleString("default", {
          month: "short",
          year: "numeric",
        });
  
        growthMap.set(key, 0);
      }
  
      let newMonthCount = 0;
  
      userList.forEach((u) => {
        const created = new Date(u.created_at);
  
        const key = created.toLocaleString("default", {
          month: "short",
          year: "numeric",
        });
  
        if (growthMap.has(key)) {
          growthMap.set(key, growthMap.get(key) + 1);
        }
  
        if (created.getMonth() === month && created.getFullYear() === year) {
          newMonthCount++;
        }
      });
  
      setGrowthLabels([...growthMap.keys()]);
      setGrowthValues([...growthMap.values()]);
      setNewUsersMonth(newMonthCount);
  
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };


  useEffect(() => {
    fetchUsers();
  
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setCurrentUserEmail(user.email);
    
        try {
          const userDocRef = doc(db, "users", user.uid); // DocumentReference
          const userDoc = await getDoc(userDocRef);     // <-- use getDoc instead of getDocs
          if (userDoc.exists()) {
            setCurrentUserRole(userDoc.data().role);
          }
        } catch (err) {
          console.error("Failed to fetch current user role:", err);
        }
      }
    });
  
    return () => unsubscribe();
  }, []);

  // Promote/Demote user role
  const toggleRole = async (user) => {
    try {
      const newRole = user.role === "admin" ? "user" : "admin";
      await updateDoc(doc(db, "users", user.id), { role: newRole });
      setUsers(users.map((u) => (u.id === user.id ? { ...u, role: newRole } : u)));
    } catch (err) {
      console.error("Failed to update role:", err);
    }
  };

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
            <Link
              to="/admin-dashboard"
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
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link
              to="/admin/users"
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
              <i className="fas fa-users me-2"></i> Users
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link
              to="/admin/tutorials"
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
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link
              to="/admin/reviews"
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
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link
              to="/admin/analytics"
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
            </Link>
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
        <h2 className="fw-bold mb-4" style={{ color: "var(--text-color)" }}>
          Dashboard Overview
        </h2>

        {/* Stats Summary */}
        <div className="row mb-4">
          <div className="col-md-4">
            <div
              className="card shadow-sm p-3 text-center"
              style={{
                backgroundColor: "var(--secondary-color)",
                border: "2px solid var(--accent-color)",
              }}
            >
              <h6 style={{ color: "var(--text-color)" }}>Total Users</h6>
              <h3 className="fw-bold" style={{ color: "var(--accent-color)" }}>
                {users.length}
              </h3>
            </div>
          </div>
          <div className="col-md-4">
            <div
              className="card shadow-sm p-3 text-center"
              style={{
                backgroundColor: "var(--secondary-color)",
                border: "2px solid var(--accent-color)",
              }}
            >
              <h6 style={{ color: "var(--text-color)" }}>Active Users</h6>
              <h3 className="fw-bold" style={{ color: "var(--accent-color)" }}>
                {newUsersMonth}
              </h3>
            </div>
          </div>
          <div className="col-md-4">
            <div
              className="card shadow-sm p-3 text-center"
              style={{
                backgroundColor: "var(--secondary-color)",
                border: "2px solid var(--accent-color)",
              }}
            >
              <h6 style={{ color: "var(--text-color)" }}>New Users This Month</h6>
              <h3 className="fw-bold" style={{ color: "var(--accent-color)" }}>
                {newUsersMonth}
              </h3>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="row">
          <div className="col-md-6 mb-4">
            <div
              className="card shadow-sm p-3"
              style={{
                backgroundColor: "var(--secondary-color)",
                border: "2px solid var(--accent-color)",
              }}
            >
              <h6 className="mb-3 text-center" style={{ color: "var(--text-color)" }}>
                User Growth
              </h6>
              <Line data={userGrowthData} />
            </div>
          </div>
          <div className="col-md-6 mb-4">
            <div
              className="card shadow-sm p-3"
              style={{
                backgroundColor: "var(--secondary-color)",
                border: "2px solid var(--accent-color)",
              }}
            >
              <h6 className="mb-3 text-center" style={{ color: "var(--text-color)" }}>
                Review Statistics
              </h6>
              <Bar data={reviewData} />
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div id="users-table" className="mt-5">
          <h3 className="fw-bold mb-3" style={{ color: "var(--text-color)" }}>
            Registered Users
          </h3>
          {loading ? (
            <p style={{ color: "var(--text-color)" }}>Loading users...</p>
          ) : (
            <div className="table-responsive rounded shadow-sm" style={{ border: "2px solid var(--accent-color)" }}>
              <table
                className="table table-striped mb-0 text-center align-middle admin-dashboard-table"
                style={{ backgroundColor: "var(--secondary-color)" }}
              >
                <thead style={{ backgroundColor: "var(--accent-color)" }}>
                  <tr>
                    <th style={{ color: "var(--primary-color)" }}>Name</th>
                    <th style={{ color: "var(--primary-color)" }}>Email</th>
                    <th style={{ color: "var(--primary-color)" }}>Role</th>
                    <th style={{ color: "var(--primary-color)" }}>Provider</th>
                    <th style={{ color: "var(--primary-color)" }}>Created At</th>
                    <th style={{ color: "var(--primary-color)" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const isCurrentUser = user.email === currentUserEmail;

                    // Disable button if:
                    // 1. User is trying to change their own role
                    // 2. User is superadmin (cannot touch)
                    // 3. User is admin and currentUser is not superadmin
                    const disableButton =
                      isCurrentUser || // cannot change self
                      user.role === "superadmin" || // cannot touch superadmin
                      (user.role === "admin" && currentUserRole !== "superadmin"); // only superadmin can touch admin

                    // Determine button label
                    let buttonLabel = "";
                    if (user.role === "user") buttonLabel = "Promote";
                    else if (user.role === "admin") buttonLabel = "Demote";
                    else if (user.role === "superadmin") buttonLabel = "Demote";

                    return (
                      <tr
                        key={user.id}
                        style={{
                          color: "var(--text-color)",
                          borderBottom: "2px solid var(--accent-color)",
                          opacity: 0.9,
                        }}
                      >
                        <td>
                          <div className="cell-content">{user.name}</div>
                        </td>
                        <td>
                          <div className="cell-content">{user.email}</div>
                        </td>
                        <td>
                          <div className="cell-content">{user.role}</div>
                        </td>
                        <td>
                          <div className="cell-content">{user.provider}</div>
                        </td>
                        <td>
                          <div className="cell-content">
                            {new Date(user.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td>
                          <div className="cell-content">
                            <button
                              style={{
                                backgroundColor: "transparent",
                                color: "var(--accent-color)",
                                border: "2px solid var(--accent-color)",
                                padding: "6px 12px",
                                borderRadius: "4px",
                                cursor: disableButton ? "not-allowed" : "pointer",
                                opacity: disableButton ? 0.5 : 1,
                              }}
                              onMouseOver={(e) => {
                                if (!disableButton) {
                                  e.currentTarget.style.backgroundColor = "var(--accent-color)";
                                  e.currentTarget.style.color = "var(--primary-color)";
                                }
                              }}
                              onMouseOut={(e) => {
                                if (!disableButton) {
                                  e.currentTarget.style.backgroundColor = "transparent";
                                  e.currentTarget.style.color = "var(--accent-color)";
                                }
                              }}
                              onClick={() => {
                                if (!disableButton) {
                                  setSelectedUser(user);
                                  setModalActionType(
                                    user.role === "user" ? "promote" : "demote"
                                  );
                                  setShowModal(true);
                                }
                              }}
                              disabled={disableButton}
                              title={
                                disableButton
                                  ? "You cannot change this user's role"
                                  : ""
                              }
                            >
                              {buttonLabel}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Confirmation Modal */}
        <div
          className={`modal fade dashboard-modal ${showModal ? "show d-block" : ""}`}
          tabIndex="-1"
          style={{
            backgroundColor: showModal ? "rgba(0,0,0,0.5)" : "transparent",
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content"
              style={{
                backgroundColor: "var(--secondary-color)",
                color: "var(--text-color)",
                border: "2px solid var(--accent-color)",
              }}
            >
              <div
                className="modal-header"
                style={{
                  backgroundColor: "var(--accent-color)",
                  borderColor: "var(--accent-color)",
                }}
              >
                <h5
                  className="modal-title"
                  style={{ color: "var(--primary-color)" }}
                >
                  {modalActionType === "promote"
                    ? "Confirm Promotion"
                    : "Confirm Demotion"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                  style={{
                    filter: "invert(1)",
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <p style={{ color: "var(--text-color)" }}>
                  Are you sure you want to {modalActionType} this user:{" "}
                  <strong>{selectedUser?.name}</strong>?
                </p>
              </div>
              <div className="modal-footer" style={{ borderColor: "var(--accent-color)" }}>
                <button
                  className="btn"
                  onClick={() => setShowModal(false)}
                  style={{
                    backgroundColor: "transparent",
                    color: "var(--accent-color)",
                    border: "2px solid var(--accent-color)",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--accent-color)";
                    e.currentTarget.style.color = "var(--primary-color)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "var(--accent-color)";
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn"
                  onClick={() => {
                    toggleRole(selectedUser);
                    setShowModal(false);
                  }}
                  style={{
                    backgroundColor: "var(--accent-color)",
                    color: "var(--primary-color)",
                    border: "2px solid var(--accent-color)",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--primary-color)";
                    e.currentTarget.style.color = "var(--accent-color)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--accent-color)";
                    e.currentTarget.style.color = "var(--primary-color)";
                  }}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
