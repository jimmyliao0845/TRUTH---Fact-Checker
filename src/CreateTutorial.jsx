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
  FaSave,
  FaUpload,
  FaCloudUploadAlt,
  FaArrowLeft,
} from "react-icons/fa";
import "./FactCheckerDashboard.css";

/**
 * CreateTutorialFull.jsx
 * Full Create Tutorial page with:
 * - Tutorial info header
 * - 10-question builder
 * - Content selector modal (Organized Reports or Upload)
 * - Preview box
 * - Save draft / Publish buttons
 *
 * Backend placeholders:
 * - saveDraftToServer(tutorial)
 * - publishTutorialToServer(tutorial)
 * - fetchOrganizedReports() -> load from server (here: localStorage)
 *
 * NOTE: Replace localStorage usage with real API / DB when integrating backend.
 */

export default function CreateTutorialFull() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  // Auth guard
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) navigate("/login");
    });
    return () => unsubscribe();
  }, [navigate]);

  // Sample organized reports (mock) - replace with API call
  const fetchOrganizedReports = () => {
    // Try to get stored organized reports or verification logs
    const fromStorage = JSON.parse(localStorage.getItem("organized_reports") || "[]");
    if (fromStorage.length) return fromStorage;
    // Provide fallback samples
    return [
      { id: "R-20250701-1", title: "Election image verification", type: "image", summary: "photo from social", previewText: "", previewImage: "" },
      { id: "R-20250702-2", title: "Article excerpt (text)", type: "text", summary: "suspicious claims", previewText: "Sample suspicious sentence", previewImage: "" },
    ];
  };

  // Tutorial state
  const [tutorial, setTutorial] = useState({
    id: null,
    title: "",
    description: "",
    category: "text", // 'text' or 'image' or 'mixed'
    questions: Array.from({ length: 10 }).map(() => ({
      contentType: "text", // 'text' or 'image'
      text: "",
      imageFile: null,
      imageUrl: "", // object URL for preview
      sourceReportId: null, // if selected from Organized Reports
      answer: "human", // 'human' or 'ai'
      explanation: "",
    })),
    status: "draft",
    createdAt: new Date().toISOString(),
  });

  // modal control
  const [modalOpenIndex, setModalOpenIndex] = useState(null);
  const [reportsList, setReportsList] = useState([]);

  useEffect(() => {
    setReportsList(fetchOrganizedReports());
  }, []);

  // Load draft if exists
  useEffect(() => {
    const draft = JSON.parse(localStorage.getItem("tutorial_draft_v2") || "null");
    if (draft) setTutorial(draft);
  }, []);

  // Helpers
  const updateQuestionField = (idx, field, value) => {
    setTutorial((t) => {
      const q = [...t.questions];
      q[idx] = { ...q[idx], [field]: value };
      return { ...t, questions: q };
    });
  };

  const handleImageSelect = (idx, file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setTutorial((t) => {
      const q = [...t.questions];
      q[idx] = { ...q[idx], imageFile: file, imageUrl: url, contentType: "image", text: "", sourceReportId: null };
      return { ...t, questions: q };
    });
  };

  const handleTextSelect = (idx, text) => {
    setTutorial((t) => {
      const q = [...t.questions];
      q[idx] = { ...q[idx], text, contentType: "text", imageFile: null, imageUrl: "", sourceReportId: null };
      return { ...t, questions: q };
    });
  };

  const handleSelectFromReport = (idx, report) => {
    // Reports may contain previewText or previewImage; adapt accordingly
    setTutorial((t) => {
      const q = [...t.questions];
      q[idx] = {
        ...q[idx],
        sourceReportId: report.id,
        text: report.previewText || "",
        imageUrl: report.previewImage || "",
        contentType: report.type === "image" ? "image" : "text",
        imageFile: null,
      };
      return { ...t, questions: q };
    });
    setModalOpenIndex(null);
  };

  // Save draft (local + placeholder for server)
  const saveDraft = () => {
    localStorage.setItem("tutorial_draft_v2", JSON.stringify(tutorial));
    // TODO: call saveDraftToServer(tutorial) when backend ready
    // saveDraftToServer(tutorial).then(...).catch(...)
    alert("Draft saved locally.");
  };

  // Publish (local + placeholder for server)
  const publishTutorial = () => {
    const publishPayload = { ...tutorial, status: "published", publishedAt: new Date().toISOString() };
    // TODO: integrate with backend: publishTutorialToServer(publishPayload)
    // Example:
    // publishTutorialToServer(publishPayload).then(resp => { ... })
    // For now store in published_tutorials localStorage (demo)
    const existing = JSON.parse(localStorage.getItem("published_tutorials_v2") || "[]");
    existing.unshift(publishPayload);
    localStorage.setItem("published_tutorials_v2", JSON.stringify(existing));
    localStorage.removeItem("tutorial_draft_v2");
    setTutorial(publishPayload);
    alert("Tutorial published (local demo).");
  };

  const clearImageUrlObject = (idx) => {
    setTutorial((t) => {
      const q = [...t.questions];
      if (q[idx].imageUrl) {
        URL.revokeObjectURL(q[idx].imageUrl);
      }
      q[idx] = { ...q[idx], imageFile: null, imageUrl: "" };
      return { ...t, questions: q };
    });
  };

  // Minimal validation before publish
  const validateBeforePublish = () => {
    if (!tutorial.title.trim()) {
      alert("Please enter a tutorial title.");
      return false;
    }
    // simple: ensure each question has either text or image or report source
    for (let i = 0; i < tutorial.questions.length; i++) {
      const q = tutorial.questions[i];
      if (!q.text && !q.imageUrl && !q.sourceReportId) {
        if (!window.confirm(`Item ${i + 1} is empty. Publish anyway?`)) return false;
      }
    }
    return true;
  };

  // Render
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
        }}
      >
        <div className="d-flex align-items-center justify-content-between mb-3">
          <button className="btn btn-outline-dark btn-sm" onClick={() => setCollapsed(!collapsed)} style={{ border: "none" }}>
            <FaBars />
          </button>
        </div>

        <ul className="nav flex-column">
                  <li>
                    <button
                      className="btn sidebar-btn text-start"
                      onClick={() => navigate("/factcheckerdashboard")}
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
                      className="btn sidebar-btn text-start"
                      onClick={() => navigate("/factcheckerdashboard/linked-users")}
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
        {/* Notification Navbar */}
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
            <i className="bi bi-bell fs-5 text-dark" style={{ cursor: "pointer" }}></i>
            <ul
              className="dropdown-menu dropdown-menu-end p-2 shadow-lg"
              style={{
                backgroundColor: "#fff",
                borderRadius: "10px",
                border: "1px solid #ddd",
                minWidth: "250px",
              }}
            >
              <li className="fw-bold text-dark px-2">Notifications</li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li>
                <span className="dropdown-item text-muted">No new notifications</span>
              </li>
            </ul>
          </div>
        </nav>

        {/* Page Content */}
        <div className="container-fluid py-4 px-5" id="create-tutorial">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="fw-bold mb-0">Create Tutorial</h2>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary" onClick={saveDraft}>
                <FaSave className="me-2" /> Save Draft
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (validateBeforePublish()) publishTutorial();
                }}
              >
                Publish Tutorial
              </button>
            </div>
          </div>

          {/* Tutorial info card */}
          <div className="card shadow-sm p-4 mb-4">
            <h5 className="fw-semibold mb-3">Tutorial Information</h5>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Title</label>
                <input className="form-control" value={tutorial.title} onChange={(e) => setTutorial({ ...tutorial, title: e.target.value })} />
              </div>

              <div className="col-md-6">
                <label className="form-label">Category</label>
                <select className="form-select" value={tutorial.category} onChange={(e) => setTutorial({ ...tutorial, category: e.target.value })}>
                  <option value="text">Text Classification</option>
                  <option value="image">Image Classification</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>

              <div className="col-12">
                <label className="form-label">Description</label>
                <textarea className="form-control" rows={3} value={tutorial.description} onChange={(e) => setTutorial({ ...tutorial, description: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="card shadow-sm p-4 mb-4">
            <h5 className="fw-semibold mb-3">Questions (10)</h5>

            {tutorial.questions.map((q, i) => (
              <div key={i} className="mb-4 p-3 border rounded bg-white">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="mb-0">Item {i + 1}</h6>
                    <small className="text-muted">Select content below or paste/upload</small>
                  </div>

                  <div className="d-flex gap-2">
                    <button className="btn btn-outline-primary btn-sm" onClick={() => setModalOpenIndex(i)}>
                      <FaCloudUploadAlt className="me-1" /> Select Content
                    </button>
                    {q.imageUrl && (
                      <button className="btn btn-outline-danger btn-sm" onClick={() => clearImageUrlObject(i)}>
                        Remove Image
                      </button>
                    )}
                  </div>
                </div>

                {/* Preview */}
                <div className="mt-3 border p-3 rounded bg-light">
                  <p className="small text-muted mb-2">Preview</p>

                  {/* text preview */}
                  {q.contentType === "text" && q.text && <div className="text-dark">{q.text}</div>}
                  {/* image preview */}
                  {q.imageUrl && (
                    <img src={q.imageUrl} alt={`preview-${i}`} style={{ maxWidth: "100%", borderRadius: 8 }} />
                  )}

                  {!q.text && !q.imageUrl && <div className="text-muted">No content selected yet.</div>}
                </div>

                {/* Correct answer */}
                <div className="row mt-3 g-3">
                  <div className="col-md-4">
                    <label className="form-label">Correct Answer</label>
                    <select className="form-select" value={q.answer} onChange={(e) => updateQuestionField(i, "answer", e.target.value)}>
                      <option value="human">Human-made</option>
                      <option value="ai">AI-generated</option>
                    </select>
                  </div>

                  <div className="col-md-8">
                    <label className="form-label">Explanation (shown after answering)</label>
                    <input className="form-control" value={q.explanation} onChange={(e) => updateQuestionField(i, "explanation", e.target.value)} placeholder="Short explanation to teach users" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer actions */}
          <div className="d-flex justify-content-between align-items-center">
            <div className="text-muted small">Tip: Use organized reports to reuse previous verification content.</div>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary" onClick={saveDraft}>
                <FaSave className="me-1" /> Save Draft
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (validateBeforePublish()) publishTutorial();
                }}
              >
                Publish Tutorial
              </button>
            </div>
          </div>
        </div>

        {/* Modal: Content selector */}
        {modalOpenIndex !== null && (
          <ContentSelectorModal
            index={modalOpenIndex}
            onClose={() => setModalOpenIndex(null)}
            reports={reportsList}
            onSelectReport={(report) => handleSelectFromReport(modalOpenIndex, report)}
            onUploadImage={(file) => handleImageSelect(modalOpenIndex, file)}
            onPasteText={(text) => handleTextSelect(modalOpenIndex, text)}
          />
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
        .sidebar-btn:hover {
          background-color: #000;
          color: #fff;
        }
      `}</style>
    </div>
  );
}

/* ------------------------------
   ContentSelectorModal Component
   ------------------------------
   - tabs: Reports / Upload
   - onSelectReport(report) -> select report
   - onUploadImage(file) -> select image file
   - onPasteText(text) -> paste text
*/
function ContentSelectorModal({ index, onClose, reports, onSelectReport, onUploadImage, onPasteText }) {
  const [activeTab, setActiveTab] = useState("reports");
  const [uploadText, setUploadText] = useState("");
  const [previewImageUrl, setPreviewImageUrl] = useState("");

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewImageUrl(url);
    onUploadImage(file);
  };

  const applyText = () => {
    onPasteText(uploadText);
    onClose();
  };

  return (
    <div className="modal-backdrop" style={backdropStyle}>
      <div className="modal-dialog modal-lg" role="document" style={modalDialogStyle}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Select Content for Item {index + 1}</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            <ul className="nav nav-tabs mb-3">
              <li className="nav-item">
                <button className={`nav-link ${activeTab === "reports" ? "active" : ""}`} onClick={() => setActiveTab("reports")}>
                  From Organized Reports
                </button>
              </li>
              <li className="nav-item">
                <button className={`nav-link ${activeTab === "upload" ? "active" : ""}`} onClick={() => setActiveTab("upload")}>
                  Upload from Device
                </button>
              </li>
            </ul>

            {activeTab === "reports" && (
              <div>
                <p className="small text-muted">Select an existing entry from organized reports:</p>
                <div className="list-group">
                  {reports.length === 0 && <div className="text-muted">No organized reports found.</div>}
                  {reports.map((r) => (
                    <button
                      key={r.id}
                      className="list-group-item list-group-item-action d-flex justify-content-between align-items-start"
                      onClick={() => {
                        onSelectReport(r);
                        onClose();
                      }}
                    >
                      <div>
                        <div className="fw-semibold">{r.title}</div>
                        <div className="small text-muted">{r.summary || r.previewText || "(no summary)"}</div>
                      </div>
                      <div className="small text-muted">{r.type}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "upload" && (
              <div>
                <p className="small text-muted">Paste text or upload an image from your device:</p>

                <label className="form-label">Paste Text</label>
                <textarea className="form-control mb-3" rows={3} value={uploadText} onChange={(e) => setUploadText(e.target.value)} placeholder="Paste text here..." />

                <div className="mb-3">
                  <label className="form-label">Upload Image</label>
                  <input type="file" accept="image/*" className="form-control mb-2" onChange={onFileChange} />
                  {previewImageUrl && <img src={previewImageUrl} alt="preview" style={{ maxWidth: "100%", borderRadius: 8 }} />}
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button className="btn btn-outline-secondary" onClick={() => { setUploadText(""); setPreviewImageUrl(""); }}>
                    Clear
                  </button>
                  <button className="btn btn-dark" onClick={() => { applyText(); }}>
                    Use Pasted Text
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <small className="text-muted me-auto">Tip: choose content from organized reports to avoid re-uploading the same sources.</small>
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* simple styles for modal */
const backdropStyle = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 2000,
};

const modalDialogStyle = {
  maxWidth: "900px",
  width: "95%",
};
