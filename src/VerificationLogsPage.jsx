import React, { useEffect, useMemo, useState } from "react";
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
  FaSearch,
  FaTrashAlt,
  FaFileCsv,
  FaEye,
  FaPlus,
  FaArrowLeft,
} from "react-icons/fa";
import "./FactCheckerDashboard.css";

/**
 * VerificationLogsPage.jsx
 * - Professional view for verification logs submitted by general users
 * - LocalStorage-backed demo with placeholders for server integration
 *
 * LocalStorage keys used:
 * - verification_logs_v2 (array of logs)
 * - organized_reports (array) <-- when "Add to Report" is used
 *
 * Each log format:
 * {
 *   log_id: "log-1001",
 *   user_id: "u-201",
 *   username: "anna91",
 *   filename: "img1.jpg",
 *   file_type: "image" | "video" | "text",
 *   result_label: "AI-generated" | "Human-made" | "Possible manipulation",
 *   score: 0.86, // 0..1
 *   source: "R-20250701-1" || "https://... (link) ",
 *   metadata: { exif: {...}, frame_count: 123 } // optional
 *   date_processed: "2025-07-10T12:10:00Z"
 * }
 */

export default function VerificationLogsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // Auth guard
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) navigate("/login");
    });
    return () => unsub();
  }, [navigate]);

  // Load or seed sample logs
  const loadLogs = () => {
    const raw = JSON.parse(localStorage.getItem("verification_logs_v2") || "null");
    if (raw && Array.isArray(raw)) return raw;
    const sample = [
      {
        log_id: "log-1001",
        user_id: "u-201",
        username: "anna91",
        filename: "protest_photo.jpg",
        file_type: "image",
        result_label: "AI-generated",
        score: 0.92,
        source: "R-20250701-1",
        metadata: { exif: { camera: "Canon EOS 5D", gps: null }, notes: "high color smoothing" },
        date_processed: "2025-07-10T12:10:00Z",
      },
      {
        log_id: "log-1002",
        user_id: "u-305",
        username: "mark_x",
        filename: "article_excerpt.txt",
        file_type: "text",
        result_label: "Human-made",
        score: 0.12,
        source: "",
        metadata: { language: "en", length: 432 },
        date_processed: "2025-07-12T09:30:00Z",
      },
      {
        log_id: "log-1003",
        user_id: "u-412",
        username: "linda",
        filename: "deepfake_clip.mp4",
        file_type: "video",
        result_label: "Possible manipulation",
        score: 0.58,
        source: "https://social.example/video/abc",
        metadata: { frames: 240, fps: 30 },
        date_processed: "2025-07-13T18:00:00Z",
      },
    ];
    localStorage.setItem("verification_logs_v2", JSON.stringify(sample));
    return sample;
  };

  const [logs, setLogs] = useState(() => loadLogs());
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterFileType, setFilterFileType] = useState(""); // "", image, video, text
  const [filterLabel, setFilterLabel] = useState(""); // "", AI-generated, Human-made, Possible manipulation
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [detailLog, setDetailLog] = useState(null);

  // Derived values
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return logs.filter((l) => {
      if (filterFileType && l.file_type !== filterFileType) return false;
      if (filterLabel && l.result_label !== filterLabel) return false;
      if (dateFrom && new Date(l.date_processed) < new Date(dateFrom)) return false;
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        if (new Date(l.date_processed) > end) return false;
      }
      if (!q) return true;
      const hay = `${l.log_id} ${l.username} ${l.filename} ${l.source}`.toLowerCase();
      return hay.includes(q);
    });
  }, [logs, searchQuery, filterFileType, filterLabel, dateFrom, dateTo]);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages, currentPage]);

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  // Row selection
  const toggleSelect = (id) => {
    setSelectedIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const selectAllOnPage = () => {
    const ids = pageItems.map((p) => p.log_id);
    const allSelected = ids.every((id) => selectedIds.includes(id));
    if (allSelected) {
      // unselect these
      setSelectedIds((s) => s.filter((id) => !ids.includes(id)));
    } else {
      setSelectedIds((s) => Array.from(new Set([...s, ...ids])));
    }
  };

  // Actions
  const deleteLog = (log_id) => {
    if (!window.confirm("Delete this log? This removes it locally (demo).")) return;
    // TODO: call deleteLogOnServer(log_id)
    const updated = logs.filter((l) => l.log_id !== log_id);
    setLogs(updated);
    localStorage.setItem("verification_logs_v2", JSON.stringify(updated));
    setSelectedIds((s) => s.filter((id) => id !== log_id));
  };

  const addSelectedToReport = () => {
    if (!selectedIds.length) return alert("No logs selected.");
    const selectedLogs = logs.filter((l) => selectedIds.includes(l.log_id));
    // Save to organized_reports localStorage (demo)
    const existing = JSON.parse(localStorage.getItem("organized_reports") || "[]");
    const toAdd = selectedLogs.map((l) => ({
      id: `R-${Date.now()}-${l.log_id}`,
      title: `Report from ${l.username} - ${l.filename}`,
      type: l.file_type,
      summary: l.result_label,
      previewText: l.metadata?.text || "",
      previewImage: l.file_type === "image" ? l.filename : "",
      date_created: new Date().toISOString(),
      original_logs: selectedLogs.map((s) => s.log_id),
    }));
    const merged = [...toAdd, ...existing];
    localStorage.setItem("organized_reports", JSON.stringify(merged));
    alert(`Added ${toAdd.length} log(s) to Organized Reports (local demo).`);
    // optionally clear selection
    setSelectedIds([]);
  };

  const exportSelectedCSV = () => {
    if (!selectedIds.length) return alert("Select logs to export.");
    const rows = [
      ["log_id", "username", "filename", "file_type", "result_label", "score", "source", "date_processed"],
      ...logs
        .filter((l) => selectedIds.includes(l.log_id))
        .map((l) => [l.log_id, l.username, l.filename, l.file_type, l.result_label, l.score, l.source, l.date_processed]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `verification_logs_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const viewLogDetail = (log) => {
    setDetailLog(log);
  };

  const closeDetail = () => setDetailLog(null);

  // Utility
  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  // Quick server-placeholder functions (commented)
  // const fetchVerificationLogs = async () => { /* call your API here */ };
  // const deleteLogOnServer = async (id) => { /* call API */ };
  // const exportLogsToServer = async (ids) => { /* call API */ };

  return (
    <div className="d-flex" style={{ backgroundColor: "#f8f9fa", paddingTop: "56px" }}>
      {/* Sidebar */}
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
          <button className="btn btn-outline-dark btn-sm" onClick={() => setCollapsed(!collapsed)} style={{ border: "none" }}>
            <FaBars />
          </button>
        </div>

        <ul className="nav flex-column">
          <li>
            <button className="btn sidebar-btn text-start" onClick={() => navigate("/professional/dashboard")}>
              <FaTachometerAlt className="me-2" />
              {!collapsed && "Dashboard"}
            </button>
          </li>
          <li>
            <button className="btn sidebar-btn text-start" onClick={() => navigate("/professional/create-tutorial")}>
              <FaPlusCircle className="me-2" />
              {!collapsed && "Create Tutorial"}
            </button>
          </li>
          <li>
            <button className="btn sidebar-btn text-start" onClick={() => navigate("/professional/manage-tutorial")}>
              <FaEdit className="me-2" />
              {!collapsed && "Manage Tutorial"}
            </button>
          </li>
          <li>
            <button className="btn sidebar-btn text-start" onClick={() => navigate("/professional/reports")}>
              <FaChartBar className="me-2" />
              {!collapsed && "Organized Reports"}
            </button>
          </li>
          <li>
            <button className="btn sidebar-btn text-start" onClick={() => navigate("/professional/linked-users")}>
              <FaUsers className="me-2" />
              {!collapsed && "Linked Users"}
            </button>
          </li>
          <li>
            <button className="btn sidebar-btn text-start" onClick={() => navigate("/professional/user-feedback")}>
              <FaCommentDots className="me-2" />
              {!collapsed && "User Feedback"}
            </button>
          </li>
          <li>
            <button 
              className={`btn sidebar-btn text-start ${location.pathname === "/professional/verification-logs" ? "active" : ""}`}
              onClick={() => location.pathname !== "/professional/verification-logs" && navigate("/professional/verification-logs")}
              disabled={location.pathname === "/professional/verification-logs"}
            >
              <FaClipboardList className="me-2" />
              {!collapsed && "Verification Logs"}
            </button>
          </li>
          <li>
            <button className="btn sidebar-btn text-start" onClick={() => navigate("/professional/profile")}>
              <FaUserCog className="me-2" />
              {!collapsed && "Profile"}
            </button>
          </li>

          {/* Go Back to Analysis Page */}
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

        {!collapsed && <div className="mt-auto small text-muted">Verified professionals workspace</div>}
      </div>

      {/* Main content */}
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
          <div className="d-flex align-items-center gap-3" style={{ width: "100%", maxWidth: 900 }}>
            <div className="input-group" style={{ width: "100%" }}>
              <span className="input-group-text bg-white"><FaSearch /></span>
              <input className="form-control" placeholder="Search log id, user, filename, source..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
            </div>
          </div>
        </nav>

        <div className="container-fluid py-4 px-5">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="fw-bold">Verification Data Logs</h2>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary" onClick={() => { setSelectedIds([]); setFilterFileType(""); setFilterLabel(""); setDateFrom(""); setDateTo(""); setSearchQuery(""); }}>
                Clear Filters
              </button>
              <button className="btn btn-primary" onClick={() => exportSelectedCSV()}>
                <FaFileCsv className="me-1" /> Export Selected
              </button>
              <button className="btn btn-success" onClick={() => addSelectedToReport()}>
                <FaPlus className="me-1" /> Add to Report
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="card shadow-sm p-3 mb-3">
            <div className="row g-2 align-items-center">
              <div className="col-md-3">
                <label className="form-label small mb-1">File type</label>
                <select className="form-select form-select-sm" value={filterFileType} onChange={(e) => { setFilterFileType(e.target.value); setCurrentPage(1); }}>
                  <option value="">All</option>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="text">Text</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label small mb-1">Result Label</label>
                <select className="form-select form-select-sm" value={filterLabel} onChange={(e) => { setFilterLabel(e.target.value); setCurrentPage(1); }}>
                  <option value="">All</option>
                  <option value="AI-generated">AI-generated</option>
                  <option value="Human-made">Human-made</option>
                  <option value="Possible manipulation">Possible manipulation</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label small mb-1">Date From</label>
                <input type="date" className="form-control form-control-sm" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }} />
              </div>
              <div className="col-md-3">
                <label className="form-label small mb-1">Date To</label>
                <input type="date" className="form-control form-control-sm" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }} />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="card shadow-sm p-3 mb-3">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}><input type="checkbox" checked={pageItems.every((p) => selectedIds.includes(p.log_id)) && pageItems.length > 0} onChange={selectAllOnPage} /></th>
                    <th>Log ID</th>
                    <th>User</th>
                    <th>File</th>
                    <th>Type</th>
                    <th>Result</th>
                    <th>Score</th>
                    <th>Source</th>
                    <th>Date</th>
                    <th style={{ width: 220 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.length === 0 && (
                    <tr><td colSpan="10" className="text-muted text-center">No logs found.</td></tr>
                  )}
                  {pageItems.map((l) => (
                    <tr key={l.log_id}>
                      <td><input type="checkbox" checked={selectedIds.includes(l.log_id)} onChange={() => toggleSelect(l.log_id)} /></td>
                      <td><button className="btn btn-link p-0" onClick={() => viewLogDetail(l)}>{l.log_id}</button></td>
                      <td>{l.username}</td>
                      <td>{l.filename}</td>
                      <td>{l.file_type}</td>
                      <td>{l.result_label}</td>
                      <td>{(Number(l.score) * 100).toFixed(0)}%</td>
                      <td style={{ maxWidth: 140 }} className="text-truncate">{l.source}</td>
                      <td>{formatDate(l.date_processed)}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <button className="btn btn-sm btn-outline-primary" onClick={() => viewLogDetail(l)}><FaEye /> View</button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => deleteLog(l.log_id)}><FaTrashAlt /> Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="d-flex justify-content-between align-items-center">
            <div className="small text-muted">Showing {pageItems.length} of {totalItems} log(s)</div>
            <nav>
              <ul className="pagination mb-0">
                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>Prev</button>
                </li>
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <li key={idx} className={`page-item ${currentPage === idx + 1 ? "active" : ""}`}>
                    <button className="page-link" onClick={() => setCurrentPage(idx + 1)}>{idx + 1}</button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}>Next</button>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Detail modal */}
        {detailLog && (
          <div style={detailBackdrop}>
            <div style={detailCard}>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h5 className="mb-1">Log {detailLog.log_id}</h5>
                  <div className="small text-muted">User: {detailLog.username} • {formatDate(detailLog.date_processed)}</div>
                </div>
                <div>
                  <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => { navigator.clipboard.writeText(JSON.stringify(detailLog)); alert("Copied JSON (demo)"); }}>Copy JSON</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => { deleteLog(detailLog.log_id); setDetailLog(null); }}>Delete</button>
                </div>
              </div>

              <hr />

              <div className="row">
                <div className="col-md-6">
                  <dl>
                    <dt>Filename</dt>
                    <dd>{detailLog.filename}</dd>
                    <dt>Type</dt>
                    <dd>{detailLog.file_type}</dd>
                    <dt>Result</dt>
                    <dd>{detailLog.result_label} ({(Number(detailLog.score) * 100).toFixed(0)}%)</dd>
                    <dt>Source</dt>
                    <dd className="text-truncate" style={{ maxWidth: 380 }}>{detailLog.source}</dd>
                  </dl>
                </div>
                <div className="col-md-6">
                  <h6>Metadata</h6>
                  <pre style={{ maxHeight: 200, overflow: "auto", background: "#f8f9fa", padding: 12, borderRadius: 6 }}>
                    {JSON.stringify(detailLog.metadata || {}, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="mt-3 d-flex justify-content-end gap-2">
                <button className="btn btn-outline-secondary" onClick={() => setDetailLog(null)}>Close</button>
                <button className="btn btn-primary" onClick={() => { alert("Export (demo)"); }}>Export Log</button>
              </div>
            </div>
          </div>
        )}

      </div>

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

/* Modal styles */
const detailBackdrop = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.35)",
  zIndex: 2200,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const detailCard = {
  width: "880px",
  maxWidth: "95%",
  background: "#fff",
  borderRadius: 8,
  padding: 20,
  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
};
