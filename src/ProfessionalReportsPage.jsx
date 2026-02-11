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
  FaDownload,
  FaArrowLeft,
} from "react-icons/fa";

export default function ProfessionalReportsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // --- AUTH GUARD ---
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) navigate("/login");
    });
    return () => unsub();
  }, [navigate]);

  // --- REPORTS STATES ---
  const [reports, setReports] = useState(() => loadReports());
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("time-newest");
  const [selectedReport, setSelectedReport] = useState(null);
  const [viewMode, setViewMode] = useState("history");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(8);

  // --- ORGANIZER STATES ---
  const [selectedAccount, setSelectedAccount] = useState("");
  const [organizerTitle, setOrganizerTitle] = useState("");
  const [organizerSummary, setOrganizerSummary] = useState("");
  const [organizerLogs, setOrganizerLogs] = useState([]);
  const [selectedLogs, setSelectedLogs] = useState([]);

  // --- ORGANIZER FUNCTIONS ---
  const addLogToReport = (log) => {
    if (!selectedLogs.some((l) => l.log_id === log.log_id)) {
      setSelectedLogs([...selectedLogs, log]);
    }
  };

  const removeLog = (index) => {
    const copy = [...selectedLogs];
    copy.splice(index, 1);
    setSelectedLogs(copy);
  };

  const moveLog = (index, direction) => {
    const copy = [...selectedLogs];
    [copy[index], copy[index + direction]] = [copy[index + direction], copy[index]];
    setSelectedLogs(copy);
  };

  const saveOrganizedReport = () => {
    if (!selectedAccount || !organizerTitle || selectedLogs.length === 0) {
      alert("Please select an account, add a title, and include at least one entry.");
      return;
    }

    const newReport = {
      report_id: `R-${Date.now()}`,
      professional_id: selectedAccount,
      title: organizerTitle,
      summary: organizerSummary,
      date_created: new Date().toISOString(),
      logs: selectedLogs,
    };

    const updatedReports = [newReport, ...reports];
    saveReports(updatedReports);

    setSelectedAccount("");
    setOrganizerTitle("");
    setOrganizerSummary("");
    setOrganizerLogs([]);
    setSelectedLogs([]);
    setViewMode("history");
  };

  // --- HELPER FUNCTIONS ---
  function loadReports() {
    const raw = JSON.parse(localStorage.getItem("organized_reports") || "null");
    if (raw && Array.isArray(raw)) return raw;

    const sample = [
      {
        report_id: "R-20250713-2001",
        professional_id: "prof-100",
        title: "Verification Summary - Sample Media",
        summary: "Contains AI-generated and human-made results",
        date_created: "2025-07-13T14:00:00Z",
        logs: [
          {
            log_id: "log-1001",
            filename: "protest_photo.jpg",
            file_type: "image",
            result_label: "AI-generated",
            score: 0.92,
            date_processed: "2025-07-10T12:10:00Z",
          },
          {
            log_id: "log-1002",
            filename: "article_excerpt.txt",
            file_type: "text",
            result_label: "Human-made",
            score: 0.12,
            date_processed: "2025-07-12T09:30:00Z",
          },
        ],
      },
    ];

    localStorage.setItem("organized_reports", JSON.stringify(sample));
    return sample;
  }

  const saveReports = (newData) => {
    setReports(newData);
    localStorage.setItem("organized_reports", JSON.stringify(newData));
  };

  const deleteReport = (id) => {
    if (!window.confirm("Delete report? This cannot be undone.")) return;
    const updated = reports.filter((r) => r.report_id !== id);
    saveReports(updated);
    setSelectedReport(null);
  };

  const exportCSV = (report) => {
    const header = ["log_id", "filename", "file_type", "result_label", "score", "date_processed"];
    const rows = report.logs.map((l) => [
      l.log_id,
      l.filename,
      l.file_type,
      l.result_label,
      l.score,
      l.date_processed,
    ]);

    const csv =
      header.join(",") +
      "\n" +
      rows.map((r) => r.map((x) => `"${x}"`).join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${report.title.replace(/\s+/g, "_")}.csv`;
    a.click();
  };

  const formatDate = (iso) => new Date(iso).toLocaleString();

  // --- FILTERING + SORTING + PAGINATION ---
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = reports.filter((r) => {
      if (!q) return true;
      return `${r.report_id} ${r.title} ${r.summary}`.toLowerCase().includes(q);
    });

    list.sort((a, b) => {
      switch (sortOption) {
        case "time-newest":
          return new Date(b.date_created) - new Date(a.date_created);
        case "time-oldest":
          return new Date(a.date_created) - new Date(b.date_created);
        case "account-az":
          return (a.professional_id || "").localeCompare(b.professional_id || "");
        case "account-za":
          return (b.professional_id || "").localeCompare(a.professional_id || "");
        case "type":
          return (a.logs[0]?.file_type || "").localeCompare(b.logs[0]?.file_type || "");
        default:
          return 0;
      }
    });

    return list;
  }, [reports, searchQuery, sortOption]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPageReports = filtered.slice((page - 1) * pageSize, page * pageSize);

  // --- JSX ---
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
            className={`app-sidebar-item ${location.pathname === "/professional/reports" ? 'active' : ''}`}
            onClick={() => location.pathname !== "/professional/reports" && navigate("/professional/reports")}
            disabled={location.pathname === "/professional/reports"}
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
              <span className="app-sidebar-label">Go Back</span>
            </button>
          </div>
        </div>

        {!collapsed && (
          <div className="mt-auto small" style={{ opacity: 0.7, color: "var(--text-color)" }}>
            Professional workspace
          </div>
        )}
      </div>

      {/* MAIN CONTENT */}
      <div className={`app-main-content ${collapsed ? 'with-collapsed-sidebar' : ''}`}>
        {/* NAVBAR */}
        <nav
          className="navbar d-flex justify-content-end align-items-center px-4 py-2 shadow-sm"
          style={{ 
            position: "sticky", 
            top: 0, 
            zIndex: 1000, 
            backgroundColor: "var(--primary-color)",
            borderBottom: `1px solid var(--accent-color)`
          }}
        ></nav>

        {/* CONTENT */}
        <div className="container-fluid py-4 px-5">
          <h2 className="fw-bold mb-4" style={{ color: "var(--text-color)" }}>Organized Reports</h2>
          <div className="d-flex gap-2 mb-4">
            <button
              className="btn"
              onClick={() => setViewMode("organize")}
              style={{
                backgroundColor: viewMode === "organize" ? "var(--accent-color)" : "transparent",
                color: viewMode === "organize" ? "var(--primary-color)" : "var(--accent-color)",
                border: `1px solid var(--accent-color)`
              }}
              onMouseOver={(e) => {
                if (viewMode !== "organize") {
                  e.currentTarget.style.backgroundColor = "var(--accent-color)";
                  e.currentTarget.style.color = "var(--primary-color)";
                }
              }}
              onMouseOut={(e) => {
                if (viewMode !== "organize") {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "var(--accent-color)";
                }
              }}
            >
              Create Report
            </button>
            <button
              className="btn"
              onClick={() => setViewMode("history")}
              style={{
                backgroundColor: viewMode === "history" ? "var(--accent-color)" : "transparent",
                color: viewMode === "history" ? "var(--primary-color)" : "var(--accent-color)",
                border: `1px solid var(--accent-color)`
              }}
              onMouseOver={(e) => {
                if (viewMode !== "history") {
                  e.currentTarget.style.backgroundColor = "var(--accent-color)";
                  e.currentTarget.style.color = "var(--primary-color)";
                }
              }}
              onMouseOut={(e) => {
                if (viewMode !== "history") {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "var(--accent-color)";
                }
              }}
            >
              Organized Report History
            </button>
          </div>

          {viewMode === "organize" && (
          <div 
            className="card shadow-sm p-4 mb-4"
            style={{
              backgroundColor: "var(--secondary-color)",
              border: `2px solid var(--accent-color)`,
              color: "var(--text-color)"
            }}
          >
            <h4>Create Organized Report</h4>

            {/* Select account */}
            <div className="mb-3">
              <label className="form-label">Select Professional Account</label>
              <select
                className="form-select"
                value={selectedAccount}
                onChange={(e) => {
                  setSelectedAccount(e.target.value);
                  // Optional: load logs for this account
                  const accountLogs = reports
                    .filter((r) => r.professional_id === e.target.value)
                    .flatMap((r) => r.logs);
                  setOrganizerLogs(accountLogs);
                }}
                style={{
                  backgroundColor: "var(--primary-color)",
                  borderColor: "var(--accent-color)",
                  color: "var(--text-color)"
                }}
              >
                <option value="">-- Select account --</option>
                {[...new Set(reports.map((r) => r.professional_id))].map((acc) => (
                  <option key={acc} value={acc}>
                    {acc}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div className="mb-3">
              <label className="form-label">Report Title</label>
              <input
                className="form-control"
                value={organizerTitle}
                onChange={(e) => setOrganizerTitle(e.target.value)}
              />
            </div>

            {/* Summary */}
            <div className="mb-3">
              <label className="form-label">Report Summary</label>
              <textarea
                className="form-control"
                value={organizerSummary}
                onChange={(e) => setOrganizerSummary(e.target.value)}
              />
            </div>

            {/* Available logs */}
            {organizerLogs.length > 0 && (
              <div className="mb-3">
                <h6>Available Logs for Account</h6>
                <div className="d-flex flex-wrap gap-2">
                  {organizerLogs.map((log) => (
                    <button
                      key={log.log_id}
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => addLogToReport(log)}
                      disabled={selectedLogs.some((l) => l.log_id === log.log_id)}
                    >
                      {log.filename}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Selected logs */}
            {selectedLogs.length > 0 && (
              <div className="mb-3">
                <h6>Selected Logs</h6>
                {selectedLogs.map((log, idx) => (
                  <div key={log.log_id} className="d-flex align-items-center mb-2">
                    <span className="me-2">{log.filename}</span>
                    <button
                      className="btn btn-sm btn-outline-secondary me-1"
                      onClick={() => moveLog(idx, -1)}
                      disabled={idx === 0}
                    >
                      ↑
                    </button>
                    <button
                      className="btn btn-sm btn-outline-secondary me-1"
                      onClick={() => moveLog(idx, 1)}
                      disabled={idx === selectedLogs.length - 1}
                    >
                      ↓
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => removeLog(idx)}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Save button */}
            <button
              className="btn"
              onClick={saveOrganizedReport}
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
              Save Report
            </button>
          </div>
        )}

          {/* --- HISTORY VIEW --- */}
          {viewMode === "history" && (
            <>
              {/* Search + Sort */}
              <div className="mb-4 d-flex gap-2 align-items-center">
                <div style={{ maxWidth: 500, flexGrow: 1 }}>
                  <div className="input-group">
                    <span className="input-group-text" style={{ backgroundColor: "var(--secondary-color)", borderColor: "var(--accent-color)", color: "var(--text-color)" }}>
                      <FaSearch />
                    </span>
                    <input
                      className="form-control"
                      placeholder="Search report title or summary..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setPage(1);
                      }}
                      style={{
                        backgroundColor: "var(--primary-color)",
                        borderColor: "var(--accent-color)",
                        color: "var(--text-color)",
                      }}
                    />
                  </div>
                </div>
                <select
                  className="form-select w-auto"
                  value={sortOption}
                  onChange={(e) => {
                    setSortOption(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="time-newest">Time: Newest First</option>
                  <option value="time-oldest">Time: Oldest First</option>
                  <option value="account-az">Linked Account: A → Z</option>
                  <option value="account-za">Linked Account: Z → A</option>
                </select>
              </div>

              {/* SINGLE REPORT VIEW */}
              {selectedReport ? (
                <div className="card shadow-sm p-4 mb-4">
                  <h4>{selectedReport.title}</h4>
                  <p className="text-muted">Created: {formatDate(selectedReport.date_created)}</p>
                  <p>{selectedReport.summary}</p>

                  <h6>Verification Entries Preview</h6>
                  <div className="d-flex flex-column gap-3">
                    {selectedReport.logs.map((log) => (
                      <div key={log.log_id} className="border p-3 rounded">
                        <strong>{log.filename}</strong> ({log.file_type}) — {log.result_label} - Score:{" "}
                        {Math.round(log.score * 100)}%
                        <div className="mt-2">
                          {log.file_type === "image" && (
                            <img src={log.filename} alt={log.filename} style={{ maxWidth: "100%", borderRadius: 5 }} />
                          )}
                          {log.file_type === "video" && (
                            <video controls style={{ maxWidth: "100%", borderRadius: 5 }}>
                              <source src={log.filename} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                          )}
                          {log.file_type === "text" && (
                            <pre style={{ background: "var(--secondary-color)", color: "var(--text-color)", padding: "10px", borderRadius: 5, border: "2px solid var(--accent-color)" }}>
                              {log.filename}
                            </pre>
                          )}
                          {["other", undefined].includes(log.file_type) && <span>{log.filename}</span>}
                        </div>
                        <small className="text-muted">Processed: {formatDate(log.date_processed)}</small>
                      </div>
                    ))}
                  </div>

                  <div className="d-flex justify-content-end gap-2 mt-3">
                    <button
                      className="btn"
                      onClick={() => setSelectedReport(null)}
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
                      onClick={() => exportCSV(selectedReport)}
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
                      <FaDownload className="me-1" /> Export CSV
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-5 text-muted">Select a report to view its details.</div>
              )}

              {/* REPORT LIST */}
              <div className="row mt-4">
                {currentPageReports.length === 0 ? (
                  <div className="col-12 text-center text-muted py-4">No reports found.</div>
                ) : (
                  currentPageReports.map((r) => (
                    <div key={r.report_id} className="col-md-6 col-lg-4 mb-3">
                      <div className="card h-100">
                        <div className="card-body d-flex flex-column justify-content-between">
                          <h6>{r.title}</h6>
                          <small className="text-muted">{formatDate(r.date_created)}</small>
                          <button className="btn btn-sm btn-outline-primary mt-2" onClick={() => setSelectedReport(r)}>
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* PAGINATION */}
              <div className="d-flex justify-content-center mt-4">
                <ul className="pagination">
                  <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                    <button className="page-link" onClick={() => setPage((p) => Math.max(1, p - 1))}>
                      Prev
                    </button>
                  </li>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <li key={i} className={`page-item ${page === i + 1 ? "active" : ""}`}>
                      <button className="page-link" onClick={() => setPage(i + 1)}>
                        {i + 1}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
                    <button className="page-link" onClick={() => setPage((p) => p + 1)}>
                      Next
                    </button>
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
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
        .sidebar-btn:hover { background-color: var(--text-color-light); color: var(--white-color); }
      `}</style>
    </div>
  );
}
