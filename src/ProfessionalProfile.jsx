// ProfessionalProfile.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, updateEmail, updatePassword } from "firebase/auth"; // placeholders
import { auth } from "./firebase"; // adjust path if needed
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
  FaCamera,
  FaSave,
  FaTimes,
  FaSearch,
  FaBookmark,
} from "react-icons/fa";
import "./FactCheckerDashboard.css";

/**
 * ProfessionalProfile.jsx
 *
 * - Social-media style profile page for professional users (BIG header, tabs)
 * - Tabs: Posts | Organized Reports | Feedback & Reviews | Bookmarks
 * - Edit profile modal with image upload preview
 * - LocalStorage mocks (replace with Supabase / Firebase integration)
 * - Auth guard using Firebase auth (redirect to /login if not signed in)
 *
 * LocalStorage keys used for demo:
 * - pro_profile_v2
 * - tutorials_created_v2
 * - organized_reports
 * - tutorial_reviews_v2
 * - bookmarks_v2
 *
 * Replace localStorage functions with proper API calls (Supabase, Firebase, your backend)
 */

export default function ProfessionalProfile() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  // auth guard
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) navigate("/login");
      // optionally load profile using user.uid
    });
    return () => unsub();
  }, [navigate]);

  // ---------- MOCK DATA LOADING (replace with API calls) ----------
  const loadProfile = () => {
    const p = JSON.parse(localStorage.getItem("pro_profile_v2") || "null");
    if (p) return p;
    const sample = {
      pro_id: "prof-100",
      displayName: "Dr. Jane Analyst",
      email: "jane.analyst@example.com",
      caption: "Fact-checker • Media Forensics • Educator",
      avatarUrl: "", // optional URL
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem("pro_profile_v2", JSON.stringify(sample));
    return sample;
  };

  const loadTutorials = () => {
    const t = JSON.parse(localStorage.getItem("tutorials_created_v2") || "null");
    if (t) return t;
    const sample = [
      { tutorial_id: "tut-001", title: "Spot the Deepfake - Images", category: "image", plays: 120, rating: 4.8, date_created: "2025-07-10T09:00:00Z" },
      { tutorial_id: "tut-002", title: "Detect AI Text Patterns", category: "text", plays: 85, rating: 4.2, date_created: "2025-07-12T10:30:00Z" },
    ];
    localStorage.setItem("tutorials_created_v2", JSON.stringify(sample));
    return sample;
  };

  const loadReports = () => {
    const r = JSON.parse(localStorage.getItem("organized_reports") || "null");
    if (r) return r;
    const sample = [
      {
        report_id: "R-20250713-2001",
        title: "Verification Summary - Sample Media",
        summary: "Mixed results across text and image checks",
        date_created: "2025-07-13T14:00:00Z",
        logs_count: 2,
      },
    ];
    localStorage.setItem("organized_reports", JSON.stringify(sample));
    return sample;
  };

  const loadReviews = () => {
    const v = JSON.parse(localStorage.getItem("tutorial_reviews_v2") || "null");
    if (v) return v;
    const sample = [
      { feedback_id: "fb-1001", tutorial_id: "tut-001", tutorial_title: "Spot the Deepfake - Images", username: "anna91", rating: 5, comment: "Great!", date_posted: "2025-07-10T12:10:00Z" },
      { feedback_id: "fb-1002", tutorial_id: "tut-002", tutorial_title: "Detect AI Text Patterns", username: "mark_x", rating: 4, comment: "Helpful", date_posted: "2025-07-12T09:30:00Z" },
    ];
    localStorage.setItem("tutorial_reviews_v2", JSON.stringify(sample));
    return sample;
  };

  const loadBookmarks = () => {
    const b = JSON.parse(localStorage.getItem("bookmarks_v2") || "null");
    if (b) return b;
    const sample = [
      { id: "bm-001", type: "tutorial", ref_id: "tut-001", title: "Spot the Deepfake - Images", date_saved: "2025-07-14T10:00:00Z" },
    ];
    localStorage.setItem("bookmarks_v2", JSON.stringify(sample));
    return sample;
  };

  // ---------- STATE ----------
  const [profile, setProfile] = useState(() => loadProfile());
  const [tutorials, setTutorials] = useState(() => loadTutorials());
  const [reports, setReports] = useState(() => loadReports());
  const [reviews, setReviews] = useState(() => loadReviews());
  const [bookmarks, setBookmarks] = useState(() => loadBookmarks());

  const [activeTab, setActiveTab] = useState("posts"); // posts | reports | reviews | bookmarks

  // search / filters for tabs
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState(""); // for posts: image/text/mixed
  const [filterRating, setFilterRating] = useState(""); // for reviews
  const [pageSize] = useState(5); // 4-7 per page allowed; choose 5
  const [page, setPage] = useState(1);

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editDraft, setEditDraft] = useState(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState("");

  // ---------- HELPERS ----------
  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleDateString();
    } catch {
      return iso;
    }
  };

  const saveProfileToStorage = (newProfile) => {
    setProfile(newProfile);
    localStorage.setItem("pro_profile_v2", JSON.stringify(newProfile));
  };

  // ---------- EDIT PROFILE HANDLERS ----------
  const openEdit = () => {
    setEditDraft({ ...profile });
    setAvatarPreviewUrl(profile.avatarUrl || "");
    setEditOpen(true);
  };

  const handleAvatarFile = (file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarPreviewUrl(url);
    setEditDraft((d) => ({ ...d, avatarFile: file, avatarUrl: url }));
  };

  const saveProfileChanges = async () => {
    // TODO: wire this to your backend / Supabase or Firebase (profile metadata)
    // Example placeholders:
    // if (editDraft.email && editDraft.email !== profile.email) await updateEmail(auth.currentUser, editDraft.email)
    // if (editDraft.newPassword) await updatePassword(auth.currentUser, editDraft.newPassword)

    const updated = {
      ...profile,
      displayName: editDraft.displayName,
      caption: editDraft.caption,
      avatarUrl: editDraft.avatarUrl || avatarPreviewUrl,
      email: editDraft.email || profile.email,
    };

    // If you want to upload the avatar file to cloud storage, do it here and replace avatarUrl with the returned URL.
    // e.g., uploadAvatarToCloud(editDraft.avatarFile).then(url => updated.avatarUrl = url)

    saveProfileToStorage(updated);
    setEditOpen(false);
    alert("Profile changes saved (demo). Replace with backend integration.");
  };

  // ---------- TAB DATA (filtered) ----------
  const tabItems = useMemo(() => {
    if (activeTab === "posts") {
      const q = searchQuery.trim().toLowerCase();
      return tutorials.filter((t) => {
        if (filterCategory && t.category !== filterCategory) return false;
        if (!q) return true;
        return `${t.title}`.toLowerCase().includes(q);
      });
    }
    if (activeTab === "reports") {
      const q = searchQuery.trim().toLowerCase();
      return reports.filter((r) => (q ? `${r.title} ${r.summary}`.toLowerCase().includes(q) : true));
    }
    if (activeTab === "reviews") {
      const q = searchQuery.trim().toLowerCase();
      return reviews.filter((rv) => {
        if (filterRating && String(rv.rating) !== String(filterRating)) return false;
        if (!q) return true;
        return `${rv.username} ${rv.tutorial_title} ${rv.comment}`.toLowerCase().includes(q);
      });
    }
    if (activeTab === "bookmarks") {
      const q = searchQuery.trim().toLowerCase();
      return bookmarks.filter((b) => (q ? `${b.title}`.toLowerCase().includes(q) : true));
    }
    return [];
  }, [activeTab, tutorials, reports, reviews, bookmarks, searchQuery, filterCategory, filterRating]);

  const totalPages = Math.max(1, Math.ceil(tabItems.length / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  const visibleItems = tabItems.slice((page - 1) * pageSize, page * pageSize);

  // ---------- ACTIONS (bookmarks, delete demo) ----------
  const toggleBookmark = (item) => {
    const exists = bookmarks.find((b) => b.ref_id === item.tutorial_id || b.ref_id === item.report_id);
    if (exists) {
      const updated = bookmarks.filter((b) => b.ref_id !== exists.ref_id);
      setBookmarks(updated);
      localStorage.setItem("bookmarks_v2", JSON.stringify(updated));
      return;
    }
    const newBm = { id: `bm-${Date.now()}`, type: item.tutorial_id ? "tutorial" : "report", ref_id: item.tutorial_id || item.report_id, title: item.title || item.title, date_saved: new Date().toISOString() };
    const merged = [newBm, ...bookmarks];
    setBookmarks(merged);
    localStorage.setItem("bookmarks_v2", JSON.stringify(merged));
  };

  const deleteTutorial = (tutorial_id) => {
    if (!window.confirm("Delete tutorial (local demo)?")) return;
    const updated = tutorials.filter((t) => t.tutorial_id !== tutorial_id);
    setTutorials(updated);
    localStorage.setItem("tutorials_created_v2", JSON.stringify(updated));
  };

  const deleteReport = (report_id) => {
    if (!window.confirm("Delete report (local demo)?")) return;
    const updated = reports.filter((r) => r.report_id !== report_id);
    setReports(updated);
    localStorage.setItem("organized_reports", JSON.stringify(updated));
  };

  // ---------- RENDER ----------
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
            <button className="btn sidebar-btn text-start" onClick={() => navigate("/professional/feedback")}>
              <FaCommentDots className="me-2" />
              {!collapsed && "User Feedback"}
            </button>
          </li>
          <li>
            <button className="btn sidebar-btn text-start" onClick={() => navigate("/professional/logs")}>
              <FaClipboardList className="me-2" />
              {!collapsed && "Verification Data Logs"}
            </button>
          </li>
          <li>
            <button className="btn sidebar-btn text-start" onClick={() => navigate("/professional/profile")}>
              <FaUserCog className="me-2" />
              {!collapsed && "Profile Settings"}
            </button>
          </li>
        </ul>

        {!collapsed && <div className="mt-auto small text-muted">Verified professionals workspace</div>}
      </div>

      {/* Main */}
      <div
        className="flex-grow-1"
        style={{
          marginLeft: collapsed ? "80px" : "250px",
          transition: "margin-left 0.3s ease",
          minHeight: "100vh",
        }}
      >
        {/* Top Navbar */}
        <nav
          className="navbar navbar-light bg-white d-flex justify-content-between align-items-center px-4 py-3 shadow-sm"
          style={{ position: "sticky", top: 0, zIndex: 1000 }}
        >
          <div className="d-flex align-items-center gap-3">
            <div style={{ width: 360 }}>
              <div className="input-group">
                <span className="input-group-text bg-white"><FaSearch /></span>
                <input className="form-control" placeholder="Search in active tab..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }} />
              </div>
            </div>
          </div>

          <div className="d-flex align-items-center gap-3">
            <div className="small text-muted">Professional Profile</div>
          </div>
        </nav>

        {/* Profile header */}
        <div className="container-fluid py-4 px-5">
          <div className="card mb-4 shadow-sm">
            <div className="row g-0 align-items-center">
              <div className="col-md-3 d-flex justify-content-center p-4">
                <div style={{ position: "relative", width: 150, height: 150 }}>
                  <img
                    src={profile.avatarUrl || avatarPreviewUrl || "https://via.placeholder.com/150?text=Avatar"}
                    alt="avatar"
                    style={{ width: 150, height: 150, objectFit: "cover", borderRadius: "50%", border: "3px solid #fff", boxShadow: "0 6px 18px rgba(0,0,0,0.08)" }}
                  />
                  <button className="btn btn-sm btn-light" style={{ position: "absolute", right: -6, bottom: -6, borderRadius: 8 }} onClick={openEdit}>
                    <FaCamera /> Edit
                  </button>
                </div>
              </div>

              <div className="col-md-6 p-4">
                <h3 className="mb-1">{profile.displayName}</h3>
                <div className="mb-2 text-muted">{profile.caption}</div>
                <div>
                  <span className="badge bg-primary me-2">Professional</span>
                  <small className="text-muted">Member since {formatDate(profile.createdAt)}</small>
                </div>
              </div>

              <div className="col-md-3 p-4 d-flex justify-content-end">
                <div className="text-end">
                  <button className="btn btn-outline-secondary mb-2" onClick={() => { setProfile(loadProfile()); alert("Reloaded (demo)."); }}>
                    Refresh
                  </button>
                  <div>
                    <button className="btn btn-primary" onClick={openEdit}><FaEdit /> Edit Profile</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="card shadow-sm p-3 mb-4">
            <ul className="nav nav-tabs">
              <li className="nav-item">
                <button className={`nav-link ${activeTab === "posts" ? "active" : ""}`} onClick={() => { setActiveTab("posts"); setPage(1); }}>
                  Posts ({tutorials.length})
                </button>
              </li>
              <li className="nav-item">
                <button className={`nav-link ${activeTab === "reports" ? "active" : ""}`} onClick={() => { setActiveTab("reports"); setPage(1); }}>
                  Organized Reports ({reports.length})
                </button>
              </li>
              <li className="nav-item">
                <button className={`nav-link ${activeTab === "messages" ? "active" : ""}`} onClick={() => { setActiveTab("messages"); setPage(1); }}>
                  Messages ({reports.length})
                </button>
              </li>
              <li className="nav-item">
                <button className={`nav-link ${activeTab === "reviews" ? "active" : ""}`} onClick={() => { setActiveTab("reviews"); setPage(1); }}>
                  Feedback & Reviews ({reviews.length})
                </button>
              </li>
              <li className="nav-item">
                <button className={`nav-link ${activeTab === "bookmarks" ? "active" : ""}`} onClick={() => { setActiveTab("bookmarks"); setPage(1); }}>
                  Bookmarks ({bookmarks.length})
                </button>
              </li>
            </ul>

            {/* Active tab content */}
            <div className="p-3">
              {/* Posts tab */}
              {activeTab === "posts" && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex gap-2">
                      <select className="form-select form-select-sm" value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}>
                        <option value="">All categories</option>
                        <option value="image">Image</option>
                        <option value="text">Text</option>
                        <option value="mixed">Mixed</option>
                      </select>
                    </div>

                    <div>
                      <small className="text-muted">Showing {visibleItems.length} of {tabItems.length}</small>
                    </div>
                  </div>

                  <div className="row">
                    {visibleItems.map((t) => (
                      <div key={t.tutorial_id} className="col-md-4 mb-3">
                        <div className="card h-100">
                          <div className="card-body d-flex flex-column">
                            <h6 className="fw-semibold">{t.title}</h6>
                            <div className="small text-muted mb-2">{t.category} • {t.plays} plays</div>
                            <div className="mt-auto d-flex justify-content-between align-items-center">
                              <div>
                                <button className="btn btn-sm btn-outline-primary me-2" onClick={() => navigate(`/tutorial/preview/${t.tutorial_id}`)}>Preview</button>
                                <button className="btn btn-sm btn-outline-secondary" onClick={() => navigate(`/professional/edit-tutorial/${t.tutorial_id}`)}>Edit</button>
                              </div>
                              <div className="d-flex gap-2 align-items-center">
                                <button className="btn btn-sm btn-outline-danger" onClick={() => deleteTutorial(t.tutorial_id)}>Delete</button>
                                <button className="btn btn-sm btn-light" onClick={() => toggleBookmark(t)}><FaBookmark /></button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* pagination */}
                  <div className="d-flex justify-content-center mt-3">
                    <ul className="pagination">
                      <li className={`page-item ${page === 1 ? "disabled" : ""}`}><button className="page-link" onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button></li>
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <li key={i} className={`page-item ${page === i + 1 ? "active" : ""}`}><button className="page-link" onClick={() => setPage(i + 1)}>{i + 1}</button></li>
                      ))}
                      <li className={`page-item ${page === totalPages ? "disabled" : ""}`}><button className="page-link" onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</button></li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Reports tab */}
              {activeTab === "reports" && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div></div>
                    <div><small className="text-muted">Showing {visibleItems.length} of {tabItems.length}</small></div>
                  </div>

                  <div className="row">
                    {visibleItems.map((r) => (
                      <div key={r.report_id} className="col-md-6 mb-3">
                        <div className="card h-100">
                          <div className="card-body d-flex flex-column">
                            <h6 className="fw-semibold">{r.title}</h6>
                            <div className="small text-muted mb-2">Created {formatDate(r.date_created)}</div>
                            <div className="small mb-3">{r.summary}</div>
                            <div className="mt-auto d-flex justify-content-between align-items-center">
                              <div><small className="text-muted">{r.logs_count} entries</small></div>
                              <div className="d-flex gap-2">
                                <button className="btn btn-sm btn-outline-primary" onClick={() => navigate(`/professional/report/${r.report_id}`)}>Open</button>
                                <button className="btn btn-sm btn-outline-danger" onClick={() => deleteReport(r.report_id)}>Delete</button>
                                <button className="btn btn-sm btn-light" onClick={() => toggleBookmark(r)}><FaBookmark /></button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* pagination */}
                  <div className="d-flex justify-content-center mt-3">
                    <ul className="pagination">
                      <li className={`page-item ${page === 1 ? "disabled" : ""}`}><button className="page-link" onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button></li>
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <li key={i} className={`page-item ${page === i + 1 ? "active" : ""}`}><button className="page-link" onClick={() => setPage(i + 1)}>{i + 1}</button></li>
                      ))}
                      <li className={`page-item ${page === totalPages ? "disabled" : ""}`}><button className="page-link" onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</button></li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Reviews tab */}
              {activeTab === "reviews" && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex gap-2">
                      <select className="form-select form-select-sm" value={filterRating} onChange={(e) => { setFilterRating(e.target.value); setPage(1); }}>
                        <option value="">All ratings</option>
                        <option value="5">5 ★</option>
                        <option value="4">4 ★</option>
                        <option value="3">3 ★</option>
                        <option value="2">2 ★</option>
                        <option value="1">1 ★</option>
                      </select>
                    </div>
                    <div><small className="text-muted">Showing {visibleItems.length} of {tabItems.length}</small></div>
                  </div>

                  <div className="row">
                    {visibleItems.map((rv) => (
                      <div key={rv.feedback_id} className="col-md-12 mb-3">
                        <div className="card">
                          <div className="card-body d-flex justify-content-between align-items-start">
                            <div>
                              <div className="fw-semibold">{rv.tutorial_title} <small className="text-muted">by {rv.username}</small></div>
                              <div className="small text-muted mb-2">{rv.rating} / 5 • {formatDate(rv.date_posted)}</div>
                              <div>{rv.comment}</div>
                            </div>
                            <div className="d-flex flex-column align-items-end gap-2">
                              <button className="btn btn-sm btn-outline-danger" onClick={() => {
                                if (window.confirm("Delete review (demo)?")) {
                                  const updated = reviews.filter((x) => x.feedback_id !== rv.feedback_id);
                                  setReviews(updated); localStorage.setItem("tutorial_reviews_v2", JSON.stringify(updated));
                                }
                              }}>Delete</button>
                              <button className="btn btn-sm btn-light" onClick={() => toggleBookmark({ report_id: rv.feedback_id, title: `Review: ${rv.tutorial_title}` })}><FaBookmark /></button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* pagination */}
                  <div className="d-flex justify-content-center mt-3">
                    <ul className="pagination">
                      <li className={`page-item ${page === 1 ? "disabled" : ""}`}><button className="page-link" onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button></li>
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <li key={i} className={`page-item ${page === i + 1 ? "active" : ""}`}><button className="page-link" onClick={() => setPage(i + 1)}>{i + 1}</button></li>
                      ))}
                      <li className={`page-item ${page === totalPages ? "disabled" : ""}`}><button className="page-link" onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</button></li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Bookmarks tab */}
              {activeTab === "bookmarks" && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div></div>
                    <div><small className="text-muted">Showing {visibleItems.length} of {tabItems.length}</small></div>
                  </div>

                  <div className="row">
                    {visibleItems.map((b) => (
                      <div key={b.id} className="col-md-4 mb-3">
                        <div className="card h-100">
                          <div className="card-body d-flex flex-column">
                            <h6 className="fw-semibold">{b.title}</h6>
                            <div className="small text-muted mb-2">{b.type} • Saved {formatDate(b.date_saved)}</div>
                            <div className="mt-auto d-flex justify-content-between">
                              <button className="btn btn-sm btn-outline-primary" onClick={() => alert("Open bookmarked item (demo)")}>Open</button>
                              <button className="btn btn-sm btn-outline-danger" onClick={() => {
                                if (!window.confirm("Remove bookmark?")) return;
                                const updated = bookmarks.filter((x) => x.id !== b.id);
                                setBookmarks(updated);
                                localStorage.setItem("bookmarks_v2", JSON.stringify(updated));
                              }}>Remove</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="d-flex justify-content-center mt-3">
                    <ul className="pagination">
                      <li className={`page-item ${page === 1 ? "disabled" : ""}`}><button className="page-link" onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button></li>
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <li key={i} className={`page-item ${page === i + 1 ? "active" : ""}`}><button className="page-link" onClick={() => setPage(i + 1)}>{i + 1}</button></li>
                      ))}
                      <li className={`page-item ${page === totalPages ? "disabled" : ""}`}><button className="page-link" onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</button></li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit modal */}
        {editOpen && (
          <div style={modalBackdrop}>
            <div style={modalCard}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5>Edit Profile</h5>
                <button className="btn btn-sm btn-light" onClick={() => setEditOpen(false)}><FaTimes /></button>
              </div>

              <div className="row g-3">
                <div className="col-md-4 text-center">
                  <div style={{ position: "relative", display: "inline-block" }}>
                    <img src={avatarPreviewUrl || profile.avatarUrl || "https://via.placeholder.com/150?text=Avatar"} alt="avatar" style={{ width: 140, height: 140, objectFit: "cover", borderRadius: "50%" }} />
                    <div style={{ position: "absolute", right: -4, bottom: -4 }}>
                      <label className="btn btn-sm btn-primary mb-0">
                        <FaCamera /> Upload <input type="file" accept="image/*" hidden onChange={(e) => handleAvatarFile(e.target.files[0])} />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="col-md-8">
                  <label className="form-label">Display Name</label>
                  <input className="form-control mb-2" value={editDraft.displayName} onChange={(e) => setEditDraft({ ...editDraft, displayName: e.target.value })} />

                  <label className="form-label">Caption / Bio</label>
                  <textarea className="form-control mb-2" rows={3} value={editDraft.caption} onChange={(e) => setEditDraft({ ...editDraft, caption: e.target.value })} />

                  <label className="form-label">Email (change placeholder)</label>
                  <input className="form-control mb-2" value={editDraft.email || profile.email} onChange={(e) => setEditDraft({ ...editDraft, email: e.target.value })} />

                  <label className="form-label">New Password (optional)</label>
                  <input className="form-control mb-2" type="password" placeholder="Enter new password to update (optional)" onChange={(e) => setEditDraft({ ...editDraft, newPassword: e.target.value })} />
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-3">
                <button className="btn btn-outline-secondary" onClick={() => setEditOpen(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={saveProfileChanges}><FaSave className="me-1" /> Save Changes</button>
              </div>
            </div>
          </div>
        )}

      </div>

      <style>{`
        .sidebar-btn { background: none; border: none; color: #000; padding: 10px 12px; border-radius: 5px; width: 100%; text-align: left; transition: all 0.2s ease-in-out; font-weight: 500; }
        .sidebar-btn:hover { background-color: #000; color: #fff; }
      `}</style>
    </div>
  );
}

/* Modal styles */
const modalBackdrop = { position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2200 };
const modalCard = { width: "920px", maxWidth: "95%", background: "#fff", borderRadius: 8, padding: 20, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" };
