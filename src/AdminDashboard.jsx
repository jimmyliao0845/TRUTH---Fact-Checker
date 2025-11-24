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
import "@fortawesome/fontawesome-free/css/all.min.css";
import { auth, db } from "./firebase";
import { collection, getDocs, updateDoc, doc, query, orderBy } from "firebase/firestore";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend);

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [growthLabels, setGrowthLabels] = useState([]);
  const [growthValues, setGrowthValues] = useState([]);
  const [newUsersMonth, setNewUsersMonth] = useState(0);

  const userGrowthData = {
  labels: growthLabels,
  datasets: [
    {
      label: "New Users",
      data: growthValues,
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
      <div className="d-flex flex-column p-3 text-white" style={{ width: "240px", minHeight: "100vh", backgroundColor: "#20232a" }}>
        <h4 className="text-center mb-4 fw-semibold">Admin Panel</h4>
        <ul className="nav flex-column">
          <li className="nav-item mb-2">
            <Link to="/admin-dashboard" className="nav-link text-white">
              <i className="fas fa-home me-2"></i> Dashboard
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/admin/users" className="nav-link text-white">
              <i className="fas fa-users me-2"></i> Users
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/admin/tutorials" className="nav-link text-white">
              <i className="fas fa-chalkboard-teacher me-2"></i> Tutorials
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/admin/reviews" className="nav-link text-white">
              <i className="fas fa-comment-dots me-2"></i> Reviews
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/admin/analytics" className="nav-link text-white">
              <i className="fas fa-chart-line me-2"></i> Analytics
            </Link>
          </li>
        </ul>
        <hr className="border-secondary" />
        <div className="mt-auto text-center">
          <a href="/" className="text-white text-decoration-none"><i className="fas fa-sign-out-alt me-2"></i> Logout</a>
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
              <h3 className="fw-bold text-primary">{users.length}</h3>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card shadow-sm p-3 border-0 text-center">
              <h6 className="text-muted">Active Users</h6>
              <h3 className="fw-bold text-success">{newUsersMonth}</h3>
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
              <h6 className="text-muted mb-3 text-center">Review Statistics</h6>
              <Bar data={reviewData} />
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div id="users-table" className="mt-5">
          <h3 className="fw-bold mb-3 text-dark">Registered Users</h3>
          {loading ? (
            <p>Loading users...</p>
          ) : (
            <div className="table-responsive border rounded shadow-sm">
              <table className="table table-striped mb-0 text-center align-middle">
                <thead className="table-dark">
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Provider</th>
                    <th>Created At</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>{user.provider}</td>
                      <td>{new Date(user.created_at).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => toggleRole(user)}
                        >
                          {user.role === "admin" ? "Demote" : "Promote"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
