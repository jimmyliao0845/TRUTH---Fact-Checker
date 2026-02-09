// UserFeedbackPage.jsx
import React, { useEffect, useMemo, useState } from "react";
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
  FaSearch,
  FaTrashAlt,
  FaFilter,
  FaEye,
  FaArrowLeft,
} from "react-icons/fa";

/**
 * UserFeedbackPage.jsx
 * Professional view of feedback/reviews left by general users.
 *
 * - Hybrid layout: table + detail modal (card)
 * - Pagination (default 5 per page)
 * - Filters: rating, tutorial, date range
 * - Search: username, tutorial_title, comment
 *
 * Data:
 * - stored in localStorage key "tutorial_reviews" (array)
 * - fields: feedback_id, tutorial_id, tutorial_title, user_id, username, rating, comment, date_posted
 *
 * Replace localStorage operations with API calls when backend is ready:
 *  - fetchReviewsFromServer()
 *  - deleteReviewOnServer(feedback_id)
 *  - flagReviewOnServer(feedback_id)
 */

export default function UserFeedbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // Auth guard
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) navigate("/login");
    });
    return () => unsubscribe();
  }, [navigate]);

  // Load reviews (mock from localStorage or sample)
  const loadReviews = () => {
    const raw = JSON.parse(localStorage.getItem("tutorial_reviews_v2") || "null");
    if (raw && Array.isArray(raw)) return raw;
    // sample fallback
    const sample = [
      {
        feedback_id: "fb-1001",
        tutorial_id: "tut-001",
        tutorial_title: "Spot the Deepfake - Images",
        user_id: "u-201",
        username: "anna91",
        rating: 5,
        comment: "Great tutorial! Clear explanations.",
        date_posted: "2025-07-10T12:10:00Z",
      },
      {
        feedback_id: "fb-1002",
        tutorial_id: "tut-002",
        tutorial_title: "Detect AI Text Patterns",
        user_id: "u-305",
        username: "mark_x",
        rating: 4,
        comment: "Helpful but some items were ambiguous.",
        date_posted: "2025-07-12T09:30:00Z",
      },
      {
        feedback_id: "fb-1003",
        tutorial_id: "tut-001",
        tutorial_title: "Spot the Deepfake - Images",
        user_id: "u-412",
        username: "linda",
        rating: 3,
        comment: "Good but could use more examples.",
        date_posted: "2025-07-13T18:00:00Z",
      },
    ];
    localStorage.setItem("tutorial_reviews_v2", JSON.stringify(sample));
    return sample;
  };

  const [reviews, setReviews] = useState(() => loadReviews());

  // Filters & search state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRating, setFilterRating] = useState(""); // "", "5","4","3","2","1"
  const [filterTutorial, setFilterTutorial] = useState(""); // tutorial_id or ""
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [viewMode, setViewMode] = useState("table"); // table or cards (kept for hybrid)
  const [selectedReview, setSelectedReview] = useState(null);

  // Pagination
  const [pageSize, setPageSize] = useState(5); // 4-7 per page allowed; default 5
  const [currentPage, setCurrentPage] = useState(1);

  // Derived tutorial options for filter
  const tutorialOptions = useMemo(() => {
    const map = {};
    reviews.forEach((r) => {
      if (!map[r.tutorial_id]) map[r.tutorial_id] = r.tutorial_title;
    });
    return Object.entries(map).map(([id, title]) => ({ id, title }));
  }, [reviews]);

  // Filtering + Searching
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return reviews.filter((r) => {
      if (filterRating && String(r.rating) !== String(filterRating)) return false;
      if (filterTutorial && r.tutorial_id !== filterTutorial) return false;
      if (dateFrom) {
        if (new Date(r.date_posted) < new Date(dateFrom)) return false;
      }
      if (dateTo) {
        // include the day of dateTo
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        if (new Date(r.date_posted) > end) return false;
      }
      if (!q) return true;
      // search username, tutorial_title, comment
      const hay = `${r.username} ${r.tutorial_title} ${r.comment}`.toLowerCase();
      return hay.includes(q);
    });
  }, [reviews, searchQuery, filterRating, filterTutorial, dateFrom, dateTo]);

  // Pagination math
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages, currentPage]);

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  // Actions: delete (local) and placeholders for API calls
  const deleteReview = (feedback_id) => {
    if (!window.confirm("Delete this review? This action is irreversible in local demo.")) return;
    // TODO: call deleteReviewOnServer(feedback_id)
    const updated = reviews.filter((r) => r.feedback_id !== feedback_id);
    setReviews(updated);
    localStorage.setItem("tutorial_reviews_v2", JSON.stringify(updated));
  };

  const flagReview = (feedback_id) => {
    // placeholder: flag on server or mark in local data
    alert(`Review ${feedback_id} flagged for admin review (demo).`);
    // TODO: flagReviewOnServer(feedback_id)
  };

  // Helpers
  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  // UI Component: Table Row
  const FeedbackRow = ({ r }) => (
    <tr
      key={r.feedback_id}
      style={{
        color: "var(--text-color)",
        borderBottom: "2px solid var(--accent-color)",
        opacity: 0.9,
      }}
    >
      <td>
        <button
          className="btn btn-link p-0"
          onClick={() => setSelectedReview(r)}
          style={{ color: "var(--accent-color)", textDecoration: "none" }}
        >
          {r.feedback_id}
        </button>
      </td>
      <td>{r.username}</td>
      <td>{r.tutorial_title}</td>
      <td>{r.rating} / 5</td>
      <td className="text-truncate" style={{ maxWidth: 240 }}>{r.comment}</td>
      <td>{formatDate(r.date_posted)}</td>
      <td>
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm"
            onClick={() => setSelectedReview(r)}
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
            <FaEye />&nbsp;View
          </button>
          <button
            className="btn btn-sm"
            onClick={() => deleteReview(r.feedback_id)}
            style={{
              backgroundColor: "transparent",
              color: "var(--error-color)",
              border: "2px solid var(--error-color)",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "var(--error-color)";
              e.currentTarget.style.color = "var(--white-color)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#dc3545";
            }}
          >
            <FaTrashAlt />
          </button>
          <button
            className="btn btn-sm"
            onClick={() => flagReview(r.feedback_id)}
            style={{
              backgroundColor: "transparent",
              color: "var(--warning-color)",
              border: "2px solid var(--warning-color)",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "var(--warning-color)";
              e.currentTarget.style.color = "var(--primary-color)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "var(--warning-color)";
            }}
          >
            Flag
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="d-flex" style={{ backgroundColor: "var(--primary-color)", paddingTop: "56px", minHeight: "100vh" }}>
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
            className="app-sidebar-item"
            onClick={() => navigate("/factcheckerdashboard")}
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
            className="app-sidebar-item"
            onClick={() => navigate("/professional/linked-users")}
          >
            <FaUsers size={20} />
            <span className="app-sidebar-label">Linked Users</span>
          </button>

          <button 
            className={`app-sidebar-item ${location.pathname === "/professional/user-feedback" ? "active" : ""}`}
            onClick={() => location.pathname !== "/professional/user-feedback" && navigate("/professional/user-feedback")}
            disabled={location.pathname === "/professional/user-feedback"}
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

      {/* Main container */}
      <div className={`app-main-content ${collapsed ? 'with-collapsed-sidebar' : ''}`}>
        {/* Navbar (notifications) */}
        <nav
          className="navbar navbar-light d-flex justify-content-end align-items-center px-4 py-2 shadow-sm"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 1000,
            backgroundColor: "var(--primary-color)",
            borderBottom: "2px solid var(--accent-color)",
          }}
        >
          <div className="d-flex align-items-center gap-3">
            <div className="input-group" style={{ width: 320 }}>
              <span className="input-group-text" style={{ backgroundColor: "var(--secondary-color)", borderColor: "var(--accent-color)", color: "var(--text-color)" }}>
                <FaSearch />
              </span>
              <input
                className="form-control"
                placeholder="Search username, tutorial, comment..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                style={{
                  backgroundColor: "var(--secondary-color)",
                  borderColor: "var(--accent-color)",
                  color: "var(--text-color)",
                }}
              />
            </div>
            <div className="dropdown">
              <i className="bi bi-bell fs-5" style={{ cursor: "pointer", color: "var(--text-color)" }}></i>
            </div>
          </div>
        </nav>

        {/* Page content */}
        <div className="container-fluid py-4 px-5" style={{ backgroundColor: "var(--primary-color)", color: "var(--text-color)" }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="fw-bold" style={{ color: "var(--text-color)" }}>User Feedback</h2>
            <div className="d-flex gap-2 align-items-center">
              <div className="d-flex align-items-center me-2">
                <FaFilter className="me-2" style={{ color: "var(--text-color)" }} />
                <small style={{ color: "var(--text-color)" }}>Filters</small>
              </div>
              <div className="d-flex gap-2">
                <select 
                  className="form-select form-select-sm"
                  value={filterRating}
                  onChange={(e) => { setFilterRating(e.target.value); setCurrentPage(1); }}
                  style={{
                    backgroundColor: "var(--secondary-color)",
                    borderColor: "var(--accent-color)",
                    color: "var(--text-color)",
                  }}
                >
                  <option value="">All ratings</option>
                  <option value="5">5 ★</option>
                  <option value="4">4 ★</option>
                  <option value="3">3 ★</option>
                  <option value="2">2 ★</option>
                  <option value="1">1 ★</option>
                </select>

                <select
                  className="form-select form-select-sm"
                  value={filterTutorial}
                  onChange={(e) => { setFilterTutorial(e.target.value); setCurrentPage(1); }}
                  style={{
                    backgroundColor: "var(--secondary-color)",
                    borderColor: "var(--accent-color)",
                    color: "var(--text-color)",
                  }}
                >
                  <option value="">All tutorials</option>
                  {tutorialOptions.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
                </select>

                <input
                  className="form-control form-control-sm"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }}
                  style={{
                    backgroundColor: "var(--secondary-color)",
                    borderColor: "var(--accent-color)",
                    color: "var(--text-color)",
                  }}
                />
                <input
                  className="form-control form-control-sm"
                  type="date"
                  value={dateTo}
                  onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }}
                  style={{
                    backgroundColor: "var(--secondary-color)",
                    borderColor: "var(--accent-color)",
                    color: "var(--text-color)",
                  }}
                />

                <select
                  className="form-select form-select-sm"
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                  style={{
                    backgroundColor: "var(--secondary-color)",
                    borderColor: "var(--accent-color)",
                    color: "var(--text-color)",
                  }}
                >
                  <option value={4}>4 / page</option>
                  <option value={5}>5 / page</option>
                  <option value={6}>6 / page</option>
                  <option value={7}>7 / page</option>
                </select>
              </div>
            </div>
          </div>

          {/* Hybrid: Table + cards (table primary) */}
          <div className="card shadow-sm p-3 mb-3" style={{ backgroundColor: "var(--secondary-color)", border: "2px solid var(--accent-color)" }}>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0" style={{ backgroundColor: "var(--secondary-color)" }}>
                <thead style={{ backgroundColor: "var(--accent-color)" }}>
                  <tr>
                    <th style={{ color: "var(--primary-color)" }}>ID</th>
                    <th style={{ color: "var(--primary-color)" }}>User</th>
                    <th style={{ color: "var(--primary-color)" }}>Tutorial</th>
                    <th style={{ color: "var(--primary-color)" }}>Rating</th>
                    <th style={{ color: "var(--primary-color)" }}>Comment</th>
                    <th style={{ color: "var(--primary-color)" }}>Date</th>
                    <th style={{ color: "var(--primary-color)" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center" style={{ color: "var(--text-color)" }}>
                        No reviews found.
                      </td>
                    </tr>
                  )}
                  {pageItems.map((r) => (
                    <tr
                      key={r.feedback_id}
                      style={{
                        color: "var(--text-color)",
                        borderBottom: "2px solid var(--accent-color)",
                        opacity: 0.9,
                      }}
                    >
                      <td>
                        <button
                          className="btn btn-link p-0"
                          onClick={() => setSelectedReview(r)}
                          style={{ color: "var(--accent-color)", textDecoration: "none" }}
                        >
                          {r.feedback_id}
                        </button>
                      </td>
                      <td>{r.username}</td>
                      <td>{r.tutorial_title}</td>
                      <td>{r.rating} / 5</td>
                      <td className="text-truncate" style={{ maxWidth: 240 }}>
                        {r.comment}
                      </td>
                      <td>{formatDate(r.date_posted)}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm"
                            onClick={() => setSelectedReview(r)}
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
                            <FaEye /> View
                          </button>
                          <button
                            className="btn btn-sm"
                            onClick={() => deleteReview(r.feedback_id)}
                            style={{
                              backgroundColor: "transparent",
                              color: "var(--error-color)",
                              border: "2px solid var(--error-color)",
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.backgroundColor = "var(--error-color)";
                              e.currentTarget.style.color = "var(--white-color)";
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.backgroundColor = "transparent";
                              e.currentTarget.style.color = "var(--error-color)";
                            }}
                          >
                            <FaTrashAlt />
                          </button>
                          <button
                            className="btn btn-sm"
                            onClick={() => flagReview(r.feedback_id)}
                            style={{
                              backgroundColor: "transparent",
                              color: "var(--warning-color)",
                              border: "2px solid var(--warning-color)",
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.backgroundColor = "var(--warning-color)";
                              e.currentTarget.style.color = "var(--primary-color)";
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.backgroundColor = "transparent";
                              e.currentTarget.style.color = "var(--warning-color)";
                            }}
                          >
                            Flag
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination controls */}
          <div className="d-flex justify-content-between align-items-center">
            <div className="small" style={{ color: "var(--text-color)" }}>
              Showing {pageItems.length} of {totalItems} review(s)
            </div>
            <nav>
              <ul className="pagination mb-0">
                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    style={{
                      backgroundColor: currentPage === 1 ? "var(--secondary-color)" : "var(--secondary-color)",
                      borderColor: "var(--accent-color)",
                      color: "var(--text-color)",
                    }}
                  >
                    Prev
                  </button>
                </li>
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <li
                    key={idx}
                    className={`page-item ${currentPage === idx + 1 ? "active" : ""}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(idx + 1)}
                      style={{
                        backgroundColor: currentPage === idx + 1 ? "var(--accent-color)" : "var(--secondary-color)",
                        borderColor: "var(--accent-color)",
                        color: currentPage === idx + 1 ? "var(--primary-color)" : "var(--text-color)",
                      }}
                    >
                      {idx + 1}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    style={{
                      backgroundColor: currentPage === totalPages ? "var(--secondary-color)" : "var(--secondary-color)",
                      borderColor: "var(--accent-color)",
                      color: "var(--text-color)",
                    }}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Detail Modal (card view) */}
        {selectedReview && (
          <div style={modalBackdrop}>
            <div style={{ ...modalCard, backgroundColor: "var(--secondary-color)", borderColor: "var(--accent-color)", border: "2px solid var(--accent-color)" }}>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h5 className="mb-1" style={{ color: "var(--text-color)" }}>
                    {selectedReview.tutorial_title}
                  </h5>
                  <div className="small" style={{ color: "var(--text-color)", opacity: 0.7 }}>
                    By: {selectedReview.username} • {formatDate(selectedReview.date_posted)}
                  </div>
                </div>
                <div>
                  <button
                    className="btn btn-sm me-2"
                    onClick={() => { navigator.clipboard.writeText(JSON.stringify(selectedReview)); alert("Copied review JSON (demo)."); }}
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
                    Copy
                  </button>
                  <button
                    className="btn btn-sm"
                    onClick={() => { deleteReview(selectedReview.feedback_id); setSelectedReview(null); }}
                    style={{
                      backgroundColor: "transparent",
                      color: "var(--error-color)",
                      border: "2px solid var(--error-color)",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--error-color)";
                      e.currentTarget.style.color = "var(--white-color)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "var(--error-color)";
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <hr style={{ borderColor: "var(--accent-color)", opacity: 0.3 }} />

              <div className="mb-3">
                <strong style={{ color: "var(--text-color)" }}>Rating:</strong>{" "}
                <span style={{ color: "var(--text-color)" }}>{selectedReview.rating} / 5</span>
              </div>
              <div className="mb-3">
                <strong style={{ color: "var(--text-color)" }}>Comment:</strong>
                <p style={{ color: "var(--text-color)" }}>{selectedReview.comment}</p>
              </div>

              <div className="mb-3">
                <strong style={{ color: "var(--text-color)" }}>Tutorial ID:</strong>{" "}
                <span style={{ color: "var(--text-color)", opacity: 0.7 }}>{selectedReview.tutorial_id}</span>
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button
                  className="btn"
                  onClick={() => setSelectedReview(null)}
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
                  Close
                </button>
                <button
                  className="btn"
                  onClick={() => { flagReview(selectedReview.feedback_id); setSelectedReview(null); }}
                  style={{
                    backgroundColor: "transparent",
                    color: "var(--warning-color)",
                    border: "2px solid var(--warning-color)",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--warning-color)";
                    e.currentTarget.style.color = "var(--primary-color)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "var(--warning-color)";
                  }}
                >
                  Flag
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* sidebar button CSS */}
      <style>{`
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
        .sidebar-btn:hover { background-color: #000; color: #fff; }
      `}</style>
    </div>
  );
}

/* lightweight modal styles */
const modalBackdrop = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.35)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 2200,
};

const modalCard = {
  width: "820px",
  maxWidth: "95%",
  background: "var(--secondary-color)",
  borderRadius: 8,
  padding: 20,
  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
};
