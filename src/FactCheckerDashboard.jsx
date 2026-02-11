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
  FaPen,
  FaFileAlt,
  FaTimesCircle,
  FaArrowLeft // Imported this icon
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
  Filler
} from "chart.js";

// 🔥 Firestore imports
import { getFirestore, collection, getDocs } from "firebase/firestore";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function FactCheckerDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const db = getFirestore();

  const [collapsed, setCollapsed] = useState(false);
  
  // 🔥 State for Manage Tutorial Sorting
  const [sortBy, setSortBy] = useState("Recent Activity");
  
  // 🔥 State for Linked Users Sorting
  const [linkedSortBy, setLinkedSortBy] = useState("Recent Activity");

  // 🔥 Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTutorial, setEditingTutorial] = useState(null);

  // 🔥 Firestore user metrics
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [newUsersMonth, setNewUsersMonth] = useState(0);
  const [userGrowthLabels, setUserGrowthLabels] = useState([]);
  const [userGrowthValues, setUserGrowthValues] = useState([]);

  // Dummy data for the Tutorial Table
  const tutorials = [
    {
      id: 1,
      title: "Sample Title",
      views: "*********",
      date: "Mon /Dy /Yr",
      status: "*********",
    },
    {
      id: 2,
      title: "How to Verify Images",
      views: "*********",
      date: "Mon /Dy /Yr",
      status: "*********",
    },
    {
      id: 3,
      title: "Deepfake Detection",
      views: "*********",
      date: "Mon /Dy /Yr",
      status: "*********",
    },
    { id: 4, title: "", views: "", date: "", status: "" },
    { id: 5, title: "", views: "", date: "", status: "" },
  ];

  // 🔥 Dummy Data for Linked Users (Matching your Image)
  const linkedUsersData = [
    { id: 1, name: "Sample Name", entries: "*********", date: "Mn /Dy /Yr", status: "*********" },
    { id: 2, name: "", entries: "", date: "", status: "" },
    { id: 3, name: "", entries: "", date: "", status: "" },
    { id: 4, name: "", entries: "", date: "", status: "" },
  ];

  // ✓ Auth check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) navigate("/login");
    });
    return () => unsubscribe();
  }, [navigate]);

  // 🔥 Fetch Firestore user analytics
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const snapshot = await getDocs(collection(db, "users"));
        const users = snapshot.docs.map((doc) => doc.data());

        const now = new Date();
        const month = now.getMonth();
        const year = now.getFullYear();

        let total = users.length;
        let active = 0;
        let newMonth = 0;

        // --- USER GROWTH LAST 6 MONTHS ---
        const growthMap = new Map();

        for (let i = 5; i >= 0; i--) {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          const key = d.toLocaleString("default", {
            month: "short",
            year: "numeric",
          });
          growthMap.set(key, 0);
        }

        users.forEach((u) => {
          const created = new Date(u.created_at);
          const key = created.toLocaleString("default", {
            month: "short",
            year: "numeric",
          });

          if (growthMap.has(key)) {
            growthMap.set(key, growthMap.get(key) + 1);
          }

          if (created.getMonth() === month && created.getFullYear() === year) {
            newMonth++;
          }

          const days = (now - created) / (1000 * 60 * 60 * 24);
          if (days <= 30) active++;
        });

        setUserGrowthLabels([...growthMap.keys()]);
        setUserGrowthValues([...growthMap.values()]);
        setTotalUsers(total);
        setActiveUsers(active);
        setNewUsersMonth(newMonth);

      } catch (e) {
        console.error("Failed to load Firestore users:", e);
      }
    };

    loadUsers();
  }, [db]);

  const userGrowthData = {
    labels: userGrowthLabels,
    datasets: [
      {
        label: "New Users",
        data: userGrowthValues,
        borderColor: "var(--info-color)",
        backgroundColor: "var(--info-color-light)",
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
        backgroundColor: ["var(--success-color)", "var(--warning-color)", "var(--error-color)"],
      },
    ],
  };

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  const handleEditClick = (tutorial) => {
    setEditingTutorial(tutorial);
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setEditingTutorial(null);
  };

  return (
    <div
      className="d-flex"
      style={{ 
        backgroundColor: "var(--primary-color)", 
        paddingTop: "56px",
        minHeight: "100vh",
        color: "var(--text-color)"
      }}
    >
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
            onClick={() => location.pathname !== "/factcheckerdashboard" && scrollToSection("dashboard")}
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
            onClick={() => scrollToSection("manage-tutorial")} 
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
            className="app-sidebar-item"
            onClick={() => scrollToSection("linked-users")}
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

          <div style={{ borderTop: "1px solid var(--accent-color)", marginTop: "1rem", paddingTop: "1rem" }}>
            <button
              className="app-sidebar-item"
              onClick={() => navigate("/analysis")}
            >
              <FaArrowLeft size={20} />
              <span className="app-sidebar-label">Go Back to Analysis</span>
            </button>
          </div>
        </div>

        {!collapsed && (
          <div className="mt-auto small" style={{ opacity: 0.7, color: "var(--text-color)" }}>
            Professional workspace
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className={`app-main-content ${collapsed ? 'with-collapsed-sidebar' : ''}`}>
        {/* Navbar - THEME AWARE */}
        <nav
          className="navbar d-flex justify-content-end align-items-center px-4 py-2 shadow-sm"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 1000,
            backgroundColor: "var(--primary-color)",
            borderBottom: `1px solid var(--accent-color)`
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
              <li><hr className="dropdown-divider" /></li>
              <li>
                <span className="dropdown-item text-muted">
                  No new notifications
                </span>
              </li>
            </ul>
          </div>
        </nav>

        {/* Dashboard Overview */}
        <div className="container-fluid py-4 px-5" id="dashboard">
          <h2 className="fw-bold mb-4" style={{ color: "var(--text-color)" }}>
            Dashboard Overview
          </h2>

          {/* Cards */}
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
                  {totalUsers}
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
                  {activeUsers}
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
        </div>

        {/* 🚀 MANAGE TUTORIAL SECTION */}
        <div 
          className="container-fluid py-4 px-5" 
          id="manage-tutorial"
          style={{ minHeight: "80vh" }} 
        >
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold" style={{ color: "var(--text-color)" }}>
              Manage Tutorial
            </h2>
            
            <div className="d-flex align-items-center">
              <span className="fw-bold me-2" style={{ color: "var(--text-color)" }}>
                Sort by:
              </span>
              <select
                className="form-select rounded-pill text-center shadow-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  backgroundColor: "var(--secondary-color)",
                  color: "var(--text-color)",
                  border: "2px solid var(--accent-color)",
                  width: "auto",
                  minWidth: "160px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                <option value="Recent Activity">Recent Activity</option>
                <option value="Date Created">Date Created</option>
              </select>
            </div>
          </div>

          <div
            className="table-responsive shadow-sm p-3"
            style={{
              backgroundColor: "var(--secondary-color)",
              border: "2px solid var(--accent-color)",
              borderRadius: "8px",
            }}
          >
            <table
              className="table table-bordered text-center align-middle mb-0"
              style={{
                backgroundColor: "var(--secondary-color)",
                borderColor: "var(--accent-color)",
              }}
            >
              <thead style={{ backgroundColor: "var(--accent-color)" }}>
                <tr>
                  <th className="py-3" style={{ fontSize: "1.1rem", color: "var(--primary-color)" }}>
                    Tutorial<br />
                    Title
                  </th>
                  <th className="py-3" style={{ fontSize: "1.1rem", color: "var(--primary-color)" }}>
                    Views
                  </th>
                  <th className="py-3" style={{ fontSize: "1.1rem", color: "var(--primary-color)" }}>
                    Date<br />
                    Created
                  </th>
                  <th className="py-3" style={{ fontSize: "1.1rem", color: "var(--primary-color)" }}>
                    Recent<br />
                    Status
                  </th>
                  <th className="py-3" style={{ fontSize: "1.1rem", color: "var(--primary-color)" }}>
                    Edit or<br />
                    Delete
                  </th>
                </tr>
              </thead>
              <tbody>
                {tutorials.map((item) => (
                  <tr
                    key={item.id}
                    style={{
                      height: "60px",
                      color: "var(--text-color)",
                      borderBottomColor: "var(--accent-color)",
                      opacity: 0.9,
                    }}
                  >
                    <td className="fw-bold">{item.title}</td>
                    <td className="fw-bold">{item.views}</td>
                    <td className="fw-bold">{item.date}</td>
                    <td className="fw-bold">{item.status}</td>
                    <td>
                      {item.title && (
                        <div className="d-flex justify-content-center gap-3">
                          <button
                            className="btn p-2"
                            onClick={() => handleEditClick(item)}
                            style={{
                              backgroundColor: "transparent",
                              color: "var(--accent-color)",
                              border: "2px solid var(--accent-color)",
                              borderRadius: "50%",
                              padding: "8px",
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
                            <FaPen size={18} />
                          </button>
                          <button
                            className="btn p-2"
                            style={{
                              backgroundColor: "transparent",
                              color: "var(--accent-color)",
                              border: "2px solid var(--accent-color)",
                              borderRadius: "50%",
                              padding: "8px",
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
                            <FaFileAlt size={18} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================================== */}
        {/* 🔥 NEW SECTION: MANAGE LINKED USER (Based on your Image)  */}
        {/* ========================================================== */}
        <div 
          className="container-fluid py-4 px-5" 
          id="linked-users" // ID matches the Sidebar Button
          style={{ minHeight: "90vh" }} 
        >
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold" style={{ color: "var(--text-color)" }}>
              Manage Linked User
            </h2>
            
            <div className="d-flex align-items-center">
              <span className="fw-bold me-2" style={{ color: "var(--text-color)" }}>
                Sort by:
              </span>
              <select
                className="form-select rounded-pill text-center shadow-sm"
                value={linkedSortBy}
                onChange={(e) => setLinkedSortBy(e.target.value)}
                style={{
                  backgroundColor: "var(--secondary-color)",
                  color: "var(--text-color)",
                  border: "2px solid var(--accent-color)",
                  width: "auto",
                  minWidth: "160px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                <option value="Recent Activity">Recent Activity</option>
                <option value="Date Created">Date Created</option>
              </select>
            </div>
          </div>

          <div
            className="table-responsive shadow-sm p-3"
            style={{
              backgroundColor: "var(--secondary-color)",
              border: "2px solid var(--accent-color)",
              borderRadius: "8px",
            }}
          >
            <table
              className="table table-bordered text-center align-middle mb-0"
              style={{
                backgroundColor: "var(--secondary-color)",
                borderColor: "var(--accent-color)",
              }}
            >
              <thead style={{ backgroundColor: "var(--accent-color)" }}>
                <tr>
                  <th
                    className="py-3"
                    style={{
                      fontSize: "1.1rem",
                      width: "20%",
                      color: "var(--primary-color)",
                    }}
                  >
                    User<br />
                    Name
                  </th>
                  <th
                    className="py-3"
                    style={{
                      fontSize: "1.1rem",
                      width: "20%",
                      color: "var(--primary-color)",
                    }}
                  >
                    No. of<br />
                    Entries
                  </th>
                  <th
                    className="py-3"
                    style={{
                      fontSize: "1.1rem",
                      width: "20%",
                      color: "var(--primary-color)",
                    }}
                  >
                    Date<br />
                    Created
                  </th>
                  <th
                    className="py-3"
                    style={{
                      fontSize: "1.1rem",
                      width: "20%",
                      color: "var(--primary-color)",
                    }}
                  >
                    Account<br />
                    Status
                  </th>
                  <th
                    className="py-3"
                    style={{
                      fontSize: "1.1rem",
                      width: "20%",
                      color: "var(--primary-color)",
                    }}
                  >
                    Unlink<br />
                    User
                  </th>
                </tr>
              </thead>
              <tbody>
                {linkedUsersData.map((user) => (
                  <tr
                    key={user.id}
                    style={{
                      height: "80px",
                      color: "var(--text-color)",
                      borderBottomColor: "var(--accent-color)",
                      opacity: 0.9,
                    }}
                  >
                    <td className="fw-bold">{user.name && user.name}</td>
                    <td className="fw-bold">{user.entries}</td>
                    <td className="fw-bold">{user.date}</td>
                    <td className="fw-bold">{user.status}</td>
                    <td>
                      {user.name && (
                        <button
                          className="btn p-0 border-0"
                          style={{ color: "var(--accent-color)", cursor: "pointer" }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.color = "var(--error-color)";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.color = "var(--accent-color)";
                          }}
                        >
                          <FaTimesCircle size={28} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* 🚀 EDIT TUTORIAL MODAL (Existing functionality) */}
      {showEditModal && (
        <div 
          className="modal fade show d-block" 
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={handleCloseModal}
        >
          <div 
            className="modal-dialog modal-xl modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="modal-content"
              style={{
                backgroundColor: "var(--secondary-color)",
                border: "2px solid var(--accent-color)",
                color: "var(--text-color)",
              }}
            >
              {/* Modal Header */}
              <div
                className="modal-header border-0 pb-1"
                style={{
                  backgroundColor: "var(--accent-color)",
                  borderBottom: "2px solid var(--accent-color)",
                }}
              >
                <h5 className="modal-title fw-bold" style={{ color: "var(--primary-color)" }}>
                  Edit Tutorial
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={handleCloseModal}
                  style={{
                    filter: "invert(1)",
                  }}
                ></button>
              </div>

              {/* Modal Body */}
              <div className="modal-body px-4 py-3" style={{ backgroundColor: "var(--secondary-color)" }}>
                {/* Tutorial Title */}
                <div className="mb-3">
                  <label className="form-label fw-bold" style={{ color: "var(--text-color)" }}>
                    Tutorial Title :
                  </label>
                  <input 
                    type="text" 
                    className="form-control"
                    defaultValue={editingTutorial?.title || ""}
                    style={{
                      backgroundColor: "var(--secondary-color)",
                      color: "var(--text-color)",
                      borderColor: "var(--accent-color)",
                    }}
                  />
                </div>

                {/* Table */}
                <div className="table-responsive">
                  <table
                    className="table table-bordered mb-0"
                    style={{
                      backgroundColor: "var(--secondary-color)",
                      borderColor: "var(--accent-color)",
                    }}
                  >
                    <thead style={{ backgroundColor: "var(--accent-color)" }}>
                      <tr>
                        <th className="text-center" style={{ width: "8%", color: "var(--primary-color)" }}>
                          Item no.
                        </th>
                        <th className="text-center" style={{ width: "20%", color: "var(--primary-color)" }}>
                          Image / Video
                        </th>
                        <th className="text-center" style={{ width: "20%", color: "var(--primary-color)" }}>
                          Image / Video<br />
                          with pointers
                        </th>
                        <th className="text-center" style={{ width: "26%", color: "var(--primary-color)" }}>
                          Remarks
                        </th>
                        <th className="text-center" style={{ width: "26%", color: "var(--primary-color)" }}>
                          Hints or Tips
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Row 1 */}
                      <tr style={{ color: "var(--text-color)", borderBottomColor: "var(--accent-color)" }}>
                        <td className="text-center align-middle fw-bold" style={{ color: "var(--text-color)" }}>
                          1
                        </td>
                        <td className="text-center align-middle">
                          <div className="d-flex flex-column align-items-center gap-2">
                            <div 
                              className="border rounded d-flex align-items-center justify-content-center"
                              style={{
                                width: "80px",
                                height: "60px",
                                backgroundColor: "var(--primary-color)",
                                borderColor: "var(--accent-color)",
                              }}
                            >
                              <i
                                className="bi bi-image"
                                style={{
                                  fontSize: "2rem",
                                  color: "var(--text-color)",
                                  opacity: 0.5,
                                }}
                              ></i>
                            </div>
                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-sm"
                                style={{
                                  backgroundColor: "transparent",
                                  color: "var(--accent-color)",
                                  border: "2px solid var(--accent-color)",
                                  borderRadius: "50%",
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
                                <i className="bi bi-plus"></i>
                              </button>
                              <button
                                className="btn btn-sm"
                                style={{
                                  backgroundColor: "transparent",
                                  color: "var(--accent-color)",
                                  border: "2px solid var(--accent-color)",
                                  borderRadius: "50%",
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
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="text-center align-middle" style={{ color: "var(--text-color)", opacity: 0.7 }}>
                          <small>Sample Image<br />
                          with pointer</small>
                        </td>
                        <td className="align-middle">
                          <textarea 
                            className="form-control"
                            rows="3"
                            style={{
                              resize: "none",
                              backgroundColor: "var(--primary-color)",
                              color: "var(--text-color)",
                              borderColor: "var(--accent-color)",
                            }}
                          ></textarea>
                        </td>
                        <td className="align-middle">
                          <textarea 
                            className="form-control"
                            rows="3"
                            style={{
                              resize: "none",
                              backgroundColor: "var(--primary-color)",
                              color: "var(--text-color)",
                              borderColor: "var(--accent-color)",
                            }}
                          ></textarea>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Save Button */}
                <div className="text-end mt-3">
                  <button 
                    className="btn px-4 py-2"
                    onClick={handleCloseModal}
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
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR HOVER CSS */}
      <style>
        {`
          .sidebar-btn {
            background: none;
            border: none;
            color: var(--text-color-light);
            padding: 10px 12px;
            border-radius: 5px;
            width: 100%;
            text-align: left;
            transition: all 0.2s ease-in-out;
            font-weight: 500;
          }

          .sidebar-btn:hover {
            background-color: var(--text-color-light);
            color: var(--white-color);
          }
          
          /* Custom table adjustments */
          .table-bordered > :not(caption) > * > * {
            border-width: 2px;
          }
          
          .form-select:focus {
            box-shadow: 0 0 0 0.25rem rgba(100, 100, 100, 0.25);
            border-color: var(--neutral-color);
          }
        `}
      </style>
    </div>
  );
}