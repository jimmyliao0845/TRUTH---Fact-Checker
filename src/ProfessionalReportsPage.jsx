import React, { useEffect, useMemo, useState } from "react";
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
  FaSearch,
  FaTrashAlt,
  FaEye,
  FaFileCsv,
  FaDownload,
} from "react-icons/fa";

import "./FactCheckerDashboard.css";

/**
 * LocalStorage key: organized_reports
 * Each report structure:
 * {
 *   report_id: "R-20250710-1001",
 *   professional_id: "u-99",
 *   title: "Report for Anna - Protest Photo",
 *   summary: "AI-generated content detected",
 *   date_created: "2025-07-13T12:10:00Z",
 *   logs: [
 *      { log_id, filename, file_type, result_label, score, date_processed }
 *   ]
 * }
 */

export default function ProfessionalReportsPage() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  // Auth guard
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) navigate("/login");
    });
    return () => unsub();
  }, [navigate]);

  // Load reports or seed example
  const loadReports = () => {
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
  };

  const [reports, setReports] = useState(() => loadReports());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // Pagination
  const [pageSize] = useState(8);
  const [page, setPage] = useState(1);

  // Filtering + searching
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return reports.filter((r) => {
      if (!q) return true;
      const hay = `${r.report_id} ${r.title} ${r.summary}`.toLowerCase();
      return hay.includes(q);
    });
  }, [reports, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPageReports = filtered.slice((page - 1) * pageSize, page * pageSize);

  const formatDate = (iso) => new Date(iso).toLocaleString();

  // Save updates to storage
  const saveReports = (newData) => {
    setReports(newData);
    localStorage.setItem("organized_reports", JSON.stringify(newData));
  };

  // Delete report
  const deleteReport = (id) => {
    if (!window.confirm("Delete report? This cannot be undone.")) return;
    const updated = reports.filter((r) => r.report_id !== id);
    saveReports(updated);
    setSelectedReport(null);
  };

  // Export JSON/CSV placeholder
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

  return (
    <div className="d-flex" style={{ backgroundColor: "#f8f9fa", paddingTop: "56px" }}>
      
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
        }}
      >
        <div className="d-flex align-items-center justify-content-between mb-3">
          <button className="btn btn-outline-dark btn-sm" onClick={() => setCollapsed(!collapsed)}>
            <FaBars />
          </button>
        </div>

        <ul className="nav flex-column">
          <li>
            <button className="btn sidebar-btn text-start" onClick={() => navigate("/professional/dashboard")}>
              <FaTachometerAlt className="me-2" /> {!collapsed && "Dashboard"}
            </button>
          </li>

          <li>
            <button className="btn sidebar-btn text-start" onClick={() => navigate("/professional/create-tutorial")}>
              <FaPlusCircle className="me-2" /> {!collapsed && "Create Tutorial"}
            </button>
          </li>

          <li>
            <button className="btn sidebar-btn text-start" onClick={() => navigate("/professional/manage-tutorial")}>
              <FaEdit className="me-2" /> {!collapsed && "Manage Tutorial"}
            </button>
          </li>

          <li>
            <button className="btn sidebar-btn text-start" onClick={() => navigate("/professional/reports")}>
              <FaChartBar className="me-2" /> {!collapsed && "Organized Reports"}
            </button>
          </li>

          <li>
            <button className="btn sidebar-btn text-start" onClick={() => navigate("/professional/linked-users")}>
              <FaUsers className="me-2" /> {!collapsed && "Linked Users"}
            </button>
          </li>

          <li>
            <button className="btn sidebar-btn text-start" onClick={() => navigate("/professional/feedback")}>
              <FaCommentDots className="me-2" /> {!collapsed && "User Feedback"}
            </button>
          </li>

          <li>
            <button className="btn sidebar-btn text-start" onClick={() => navigate("/professional/logs")}>
              <FaClipboardList className="me-2" /> {!collapsed && "Verification Data Logs"}
            </button>
          </li>

          <li>
            <button className="btn sidebar-btn text-start" onClick={() => navigate("/professional/profile")}>
              <FaUserCog className="me-2" /> {!collapsed && "Profile Settings"}
            </button>
          </li>
        </ul>

        {!collapsed && <div className="mt-auto small text-muted">Verified professionals workspace</div>}
      </div>

      {/* MAIN CONTENT */}
      <div
        className="flex-grow-1"
        style={{
          marginLeft: collapsed ? "80px" : "250px",
          transition: "margin-left 0.3s ease",
        }}
      >
        {/* NAVBAR */}
        <nav
          className="navbar navbar-light bg-light d-flex justify-content-end align-items-center px-4 py-2 shadow-sm"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 1000,
            borderBottom: "1px solid #ddd",
          }}
        >
          <div style={{ width: "100%", maxWidth: 900 }}>
            <div className="input-group">
              <span className="input-group-text bg-white"><FaSearch /></span>
              <input
                className="form-control"
                placeholder="Search report title or summary..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>
        </nav>

        {/* CONTENT */}
        <div className="container-fluid py-4 px-5">
          <h2 className="fw-bold mb-4">Organized Reports</h2>

          {/* LIST OF REPORTS */}
          <div className="row">
            {currentPageReports.length === 0 && (
              <div className="text-muted text-center py-5">
                No reports found.
              </div>
            )}

            {currentPageReports.map((r) => (
              <div key={r.report_id} className="col-md-6 col-lg-4 mb-4">
                <div className="card shadow-sm h-100">
                  <div className="card-body d-flex flex-column">
                    <h5 className="fw-bold">{r.title}</h5>
                    <div className="text-muted small mb-2">{formatDate(r.date_created)}</div>
                    <p className="small">{r.summary}</p>

                    <div className="mt-auto d-flex justify-content-between">
                      <button className="btn btn-sm btn-outline-primary" onClick={() => setSelectedReport(r)}>
                        <FaEye /> View
                      </button>

                      <button className="btn btn-sm btn-outline-danger" onClick={() => deleteReport(r.report_id)}>
                        <FaTrashAlt /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* PAGINATION */}
          <div className="d-flex justify-content-center">
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
        </div>

        {/* REPORT DETAIL MODAL */}
        {selectedReport && (
          <div style={modalBackdrop}>
            <div style={modalCard}>
              <h4 className="fw-bold">{selectedReport.title}</h4>
              <div className="text-muted small mb-3">
                Created: {formatDate(selectedReport.date_created)}
              </div>

              {/* Logs inside report */}
              <div className="mb-3">
                <h6>Verification Entries</h6>
                <table className="table table-sm table-bordered">
                  <thead>
                    <tr>
                      <th>Log ID</th>
                      <th>File</th>
                      <th>Type</th>
                      <th>Result</th>
                      <th>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedReport.logs.map((l) => (
                      <tr key={l.log_id}>
                        <td>{l.log_id}</td>
                        <td>{l.filename}</td>
                        <td>{l.file_type}</td>
                        <td>{l.result_label}</td>
                        <td>{Math.round(l.score * 100)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-3">
                <button className="btn btn-outline-secondary" onClick={() => setSelectedReport(null)}>
                  Close
                </button>

                <button className="btn btn-primary" onClick={() => exportCSV(selectedReport)}>
                  <FaDownload className="me-1" /> Export CSV
                </button>
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

const modalBackdrop = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.3)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 2000,
};

const modalCard = {
  background: "#fff",
  borderRadius: 8,
  width: "900px",
  maxWidth: "95%",
  padding: 20,
  boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
};
