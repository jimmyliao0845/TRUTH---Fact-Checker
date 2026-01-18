import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

import "./FactCheckerDashboard.css";

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
        borderColor: "#007bff",
        backgroundColor: "rgba(0,123,255,0.3)",
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
        backgroundColor: ["#28a745", "#ffc107", "#dc3545"],
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
      style={{ backgroundColor: "#f8f9fa", paddingTop: "56px" }}
    >
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
          zIndex: 900
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
              className="btn sidebar-btn text-start"
              onClick={() => scrollToSection("dashboard")}
            >
              <FaTachometerAlt className="me-2" />
              {!collapsed && "Dashboard"}
            </button>
          </li>

          <li>
            <button className="btn sidebar-btn text-start">
              <FaPlusCircle className="me-2" />
              {!collapsed && "Create Tutorial"}
            </button>
          </li>

          <li>
            <button
              className="btn sidebar-btn text-start"
              onClick={() => scrollToSection("manage-tutorial")} 
            >
              <FaEdit className="me-2" />
              {!collapsed && "Manage Tutorial"}
            </button>
          </li>

          <li>
            <button
              className="btn sidebar-btn text-start"
              onClick={() => scrollToSection("report")}
            >
              <FaChartBar className="me-2" />
              {!collapsed && "Organized Reports"}
            </button>
          </li>

          <li>
            <button
              className="btn sidebar-btn text-start"
              onClick={() => scrollToSection("linked-users")}
            >
              <FaUsers className="me-2" />
              {!collapsed && "Linked Users"}
            </button>
          </li>

          <li>
            <button
              className="btn sidebar-btn text-start"
              onClick={() => scrollToSection("feedback")}
            >
              <FaCommentDots className="me-2" />
              {!collapsed && "User Feedback"}
            </button>
          </li>

          <li>
            <button
              className="btn sidebar-btn text-start"
              onClick={() => scrollToSection("logs")}
            >
              <FaClipboardList className="me-2" />
              {!collapsed && "Verification Logs"}
            </button>
          </li>

          <li>
            <button
              className="btn sidebar-btn text-start"
              onClick={() => scrollToSection("profile")}
            >
              <FaUserCog className="me-2" />
              {!collapsed && "Profile Settings"}
            </button>
          </li>

          {/* 🚀 NEW BUTTON: Go Back to Analysis Page (Updated: Removed text-danger) */}
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

      {/* Main Content */}
      <div
        className="flex-grow-1"
        style={{
          marginLeft: collapsed ? "80px" : "250px",
          transition: "margin-left 0.3s ease",
          minHeight: "100vh",
        }}
      >
        {/* Navbar */}
        <nav
          className="navbar navbar-light bg-light d-flex justify-content-end align-items-center px-4 py-2 shadow-sm"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 1000,
            borderBottom: "1px solid #ddd",
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
          <h2 className="fw-bold mb-4 text-dark">Dashboard Overview</h2>

          {/* Cards */}
          <div className="row mb-4">
            <div className="col-md-4">
              <div className="card shadow-sm p-3 border-0 text-center">
                <h6 className="text-muted">Total Users</h6>
                <h3 className="fw-bold text-primary">{totalUsers}</h3>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card shadow-sm p-3 border-0 text-center">
                <h6 className="text-muted">Active Users</h6>
                <h3 className="fw-bold text-success">{activeUsers}</h3>
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
              <div className="card shadow-sm p-3">
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

        {/* 🚀 MANAGE TUTORIAL SECTION */}
        <div 
          className="container-fluid py-4 px-5" 
          id="manage-tutorial"
          style={{ minHeight: "80vh" }} 
        >
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold text-dark">Manage Tutorial</h2>
            
            <div className="d-flex align-items-center">
              <span className="fw-bold me-2">Sort by:</span>
              <select
                className="form-select rounded-pill text-center shadow-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  backgroundColor: "#d0d0d0",
                  color: "#000",
                  border: "none",
                  width: "auto",
                  minWidth: "160px",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                <option value="Recent Activity">Recent Activity</option>
                <option value="Date Created">Date Created</option>
              </select>
            </div>
          </div>

          <div className="table-responsive bg-white shadow-sm p-3" style={{ border: "1px solid #000", borderRadius: "0px" }}>
            <table className="table table-bordered border-dark text-center align-middle mb-0">
              <thead>
                <tr style={{ borderBottom: "3px solid #000" }}>
                  <th className="py-3" style={{ fontSize: "1.1rem" }}>Tutorial<br/>Title</th>
                  <th className="py-3" style={{ fontSize: "1.1rem" }}>Views</th>
                  <th className="py-3" style={{ fontSize: "1.1rem" }}>Date<br/>Created</th>
                  <th className="py-3" style={{ fontSize: "1.1rem" }}>Recent<br/>Status</th>
                  <th className="py-3" style={{ fontSize: "1.1rem" }}>Edit or<br/>Delete</th>
                </tr>
              </thead>
              <tbody>
                {tutorials.map((item) => (
                  <tr key={item.id} style={{ height: "60px" }}>
                    <td className="fw-bold">{item.title}</td>
                    <td className="fw-bold">{item.views}</td>
                    <td className="fw-bold">{item.date}</td>
                    <td className="fw-bold">{item.status}</td>
                    <td>
                      {item.title && (
                        <div className="d-flex justify-content-center gap-3">
                          <button 
                            className="btn btn-light border border-dark rounded-circle p-2"
                            onClick={() => handleEditClick(item)}
                          >
                            <FaPen size={18} />
                          </button>
                          <button className="btn btn-light border border-dark rounded-circle p-2">
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
            <h2 className="fw-bold text-dark">Manage Linked User</h2>
            
            <div className="d-flex align-items-center">
              <span className="fw-bold me-2">Sort by:</span>
              <select
                className="form-select rounded-pill text-center shadow-sm"
                value={linkedSortBy}
                onChange={(e) => setLinkedSortBy(e.target.value)}
                style={{
                  backgroundColor: "#d0d0d0",
                  color: "#000",
                  border: "none",
                  width: "auto",
                  minWidth: "160px",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                <option value="Recent Activity">Recent Activity</option>
                <option value="Date Created">Date Created</option>
              </select>
            </div>
          </div>

          <div className="table-responsive bg-white shadow-sm p-3" style={{ border: "1px solid #000", borderRadius: "0px" }}>
            <table className="table table-bordered border-dark text-center align-middle mb-0">
              <thead>
                <tr style={{ borderBottom: "3px solid #000" }}>
                  <th className="py-3" style={{ fontSize: "1.1rem", width: "20%" }}>User<br/>Name</th>
                  <th className="py-3" style={{ fontSize: "1.1rem", width: "20%" }}>No. of<br/>Entries</th>
                  <th className="py-3" style={{ fontSize: "1.1rem", width: "20%" }}>Date<br/>Created</th>
                  <th className="py-3" style={{ fontSize: "1.1rem", width: "20%" }}>Account<br/>Status</th>
                  <th className="py-3" style={{ fontSize: "1.1rem", width: "20%" }}>Unlink<br/>User</th>
                </tr>
              </thead>
              <tbody>
                {linkedUsersData.map((user) => (
                  <tr key={user.id} style={{ height: "80px" }}>
                    <td className="fw-bold">{user.name && user.name}</td>
                    <td className="fw-bold">{user.entries}</td>
                    <td className="fw-bold">{user.date}</td>
                    <td className="fw-bold">{user.status}</td>
                    <td>
                      {user.name && (
                          <button className="btn p-0 border-0">
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
            <div className="modal-content" style={{ backgroundColor: "#ffffffff" }}>
              {/* Modal Header */}
              <div className="modal-header border-0 pb-1">
                <h5 className="modal-title fw-bold">Edit Tutorial</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={handleCloseModal}
                ></button>
              </div>

              {/* Modal Body */}
              <div className="modal-body px-4 py-3">
                {/* Tutorial Title */}
                <div className="mb-3">
                  <label className="form-label fw-bold">Tutorial Title :</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    defaultValue={editingTutorial?.title || ""}
                    style={{ backgroundColor: "#ffffffff" }}
                  />
                </div>

                {/* Table */}
                <div className="table-responsive">
                  <table className="table table-bordered border-dark bg-white mb-0">
                    <thead>
                      <tr>
                        <th className="text-center" style={{ width: "8%" }}>Item no.</th>
                        <th className="text-center" style={{ width: "20%" }}>Image / Video</th>
                        <th className="text-center" style={{ width: "20%" }}>Image / Video<br/>with pointers</th>
                        <th className="text-center" style={{ width: "26%" }}>Remarks</th>
                        <th className="text-center" style={{ width: "26%" }}>Hints or Tips</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Row 1 */}
                      <tr>
                        <td className="text-center align-middle fw-bold">1</td>
                        <td className="text-center align-middle">
                          <div className="d-flex flex-column align-items-center gap-2">
                            <div 
                              className="border border-dark rounded d-flex align-items-center justify-content-center"
                              style={{ width: "80px", height: "60px", backgroundColor: "#e0e0e0" }}
                            >
                              <i className="bi bi-image text-muted" style={{ fontSize: "2rem" }}></i>
                            </div>
                            <div className="d-flex gap-2">
                              <button className="btn btn-sm btn-light border border-dark rounded-circle">
                                <i className="bi bi-plus"></i>
                              </button>
                              <button className="btn btn-sm btn-light border border-dark rounded-circle">
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="text-center align-middle">
                          <small className="text-muted">Sample Image<br/>with pointer</small>
                        </td>
                        <td className="align-middle">
                          <textarea 
                            className="form-control border-dark" 
                            rows="3"
                            style={{ resize: "none" }}
                          ></textarea>
                        </td>
                        <td className="align-middle">
                          <textarea 
                            className="form-control border-dark" 
                            rows="3"
                            style={{ resize: "none" }}
                          ></textarea>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Save Button */}
                <div className="text-end mt-3">
                  <button 
                    className="btn btn-dark px-4 py-2"
                    onClick={handleCloseModal}
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
            color: #000;
            padding: 10px 12px;
            border-radius: 5px;
            width: 100%;
            text-align: left;
            transition: all 0.2s ease-in-out;
            font-weight: 500;
          }

          .sidebar-btn:hover {
            background-color: #000;
            color: #fff;
          }
          
          /* Custom table adjustments */
          .table-bordered > :not(caption) > * > * {
            border-width: 2px;
          }
          
          .form-select:focus {
            box-shadow: 0 0 0 0.25rem rgba(100, 100, 100, 0.25);
            border-color: #a0a0a0;
          }
        `}
      </style>
    </div>
  );
}