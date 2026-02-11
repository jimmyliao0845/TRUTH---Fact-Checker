import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  serverTimestamp 
} from "firebase/firestore";
import { auth, db } from "./firebase";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./styles.css";

export default function AdminCMS() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("tutorials");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Content states
  const [tutorials, setTutorials] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [pages, setPages] = useState([]);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    status: "draft",
    featured: false,
    thumbnail: "",
    tags: "",
    excerpt: "",
    slug: ""
  });

  // Content type configurations
  const CONTENT_TYPES = {
    tutorials: {
      collection: "cms_tutorials",
      fields: ["title", "content", "category", "status", "thumbnail", "tags", "excerpt"],
      categories: ["Introduction", "Verification", "Fact-Checking", "Media Analysis", "Advanced"]
    },
    announcements: {
      collection: "cms_announcements", 
      fields: ["title", "content", "status", "featured"],
      categories: []
    },
    pages: {
      collection: "cms_pages",
      fields: ["title", "content", "status", "slug"],
      categories: []
    }
  };

  // Auth guard
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }
      fetchContent();
    });
    return () => unsubscribe();
  }, [navigate]);

  // Fetch all content
  const fetchContent = async () => {
    setLoading(true);
    try {
      // Fetch tutorials
      const tutorialsQuery = query(
        collection(db, "cms_tutorials"), 
        orderBy("createdAt", "desc")
      );
      const tutorialsSnap = await getDocs(tutorialsQuery);
      setTutorials(tutorialsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      // Fetch announcements
      const announcementsQuery = query(
        collection(db, "cms_announcements"),
        orderBy("createdAt", "desc")
      );
      const announcementsSnap = await getDocs(announcementsQuery);
      setAnnouncements(announcementsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      // Fetch pages
      const pagesQuery = query(
        collection(db, "cms_pages"),
        orderBy("createdAt", "desc")
      );
      const pagesSnap = await getDocs(pagesQuery);
      setPages(pagesSnap.docs.map(d => ({ id: d.id, ...d.data() })));

    } catch (err) {
      console.error("Failed to fetch content:", err);
    }
    setLoading(false);
  };

  // Get current content list based on active tab
  const getCurrentContent = () => {
    switch (activeTab) {
      case "tutorials": return tutorials;
      case "announcements": return announcements;
      case "pages": return pages;
      default: return [];
    }
  };

  // Create or update content
  const handleSave = async () => {
    const config = CONTENT_TYPES[activeTab];
    
    if (!formData.title.trim()) {
      alert("Please enter a title");
      return;
    }

    try {
      const data = {
        ...formData,
        updatedAt: serverTimestamp(),
        tags: formData.tags ? formData.tags.split(",").map(t => t.trim()) : []
      };

      if (editingItem) {
        // Update existing
        await updateDoc(doc(db, config.collection, editingItem.id), data);
      } else {
        // Create new
        data.createdAt = serverTimestamp();
        data.views = 0;
        data.rating = 0;
        await addDoc(collection(db, config.collection), data);
      }

      setShowModal(false);
      resetForm();
      fetchContent();
    } catch (err) {
      console.error("Failed to save:", err);
      alert("Failed to save content");
    }
  };

  // Delete content
  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.title}"?`)) return;
    
    const config = CONTENT_TYPES[activeTab];
    try {
      await deleteDoc(doc(db, config.collection, item.id));
      fetchContent();
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  // Toggle publish status
  const toggleStatus = async (item) => {
    const config = CONTENT_TYPES[activeTab];
    const newStatus = item.status === "published" ? "draft" : "published";
    
    try {
      await updateDoc(doc(db, config.collection, item.id), { 
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      fetchContent();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  // Open modal for editing
  const openEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title || "",
      content: item.content || "",
      category: item.category || "",
      status: item.status || "draft",
      featured: item.featured || false,
      thumbnail: item.thumbnail || "",
      tags: Array.isArray(item.tags) ? item.tags.join(", ") : "",
      excerpt: item.excerpt || "",
      slug: item.slug || ""
    });
    setShowModal(true);
  };

  // Open modal for creating new
  const openCreate = () => {
    setEditingItem(null);
    resetForm();
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      category: "",
      status: "draft",
      featured: false,
      thumbnail: "",
      tags: "",
      excerpt: "",
      slug: ""
    });
  };

  // Render content table
  const renderTable = () => {
    const content = getCurrentContent();
    
    if (loading) {
      return <div className="text-center py-5"><i className="fas fa-spinner fa-spin fa-2x"></i></div>;
    }

    if (content.length === 0) {
      return (
        <div className="text-center py-5" style={{ color: "var(--text-color)" }}>
          <i className="fas fa-inbox fa-3x mb-3" style={{ opacity: 0.5 }}></i>
          <p>No {activeTab} found. Create your first one!</p>
        </div>
      );
    }

    return (
      <div className="table-responsive">
        <table className="table" style={{ backgroundColor: "var(--secondary-color)" }}>
          <thead style={{ backgroundColor: "var(--accent-color)" }}>
            <tr>
              <th style={{ color: "var(--primary-color)", padding: "12px" }}>Title</th>
              {activeTab === "tutorials" && (
                <th style={{ color: "var(--primary-color)", padding: "12px" }}>Category</th>
              )}
              <th style={{ color: "var(--primary-color)", padding: "12px" }}>Status</th>
              <th style={{ color: "var(--primary-color)", padding: "12px" }}>Created</th>
              <th style={{ color: "var(--primary-color)", padding: "12px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {content.map((item) => (
              <tr key={item.id} style={{ borderBottom: "1px solid var(--accent-color)" }}>
                <td style={{ color: "var(--text-color)", padding: "12px" }}>
                  {item.title}
                  {item.featured && <span className="badge bg-warning ms-2">Featured</span>}
                </td>
                {activeTab === "tutorials" && (
                  <td style={{ color: "var(--text-color)", padding: "12px" }}>{item.category}</td>
                )}
                <td style={{ padding: "12px" }}>
                  <span 
                    className={`badge ${item.status === "published" ? "bg-success" : "bg-secondary"}`}
                    style={{ cursor: "pointer" }}
                    onClick={() => toggleStatus(item)}
                  >
                    {item.status}
                  </span>
                </td>
                <td style={{ color: "var(--text-color)", padding: "12px" }}>
                  {item.createdAt?.toDate?.()?.toLocaleDateString() || "N/A"}
                </td>
                <td style={{ padding: "12px" }}>
                  <button 
                    className="btn btn-sm me-2"
                    style={{ backgroundColor: "var(--accent-color)", color: "var(--primary-color)" }}
                    onClick={() => openEdit(item)}
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(item)}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Render editor modal
  const renderModal = () => {
    if (!showModal) return null;
    
    const config = CONTENT_TYPES[activeTab];

    return (
      <div 
        className="modal show d-block" 
        style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
        onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
      >
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div 
            className="modal-content"
            style={{ 
              backgroundColor: "var(--secondary-color)", 
              border: "2px solid var(--accent-color)" 
            }}
          >
            <div className="modal-header" style={{ borderBottom: "1px solid var(--accent-color)" }}>
              <h5 className="modal-title" style={{ color: "var(--text-color)" }}>
                {editingItem ? "Edit" : "Create"} {activeTab.slice(0, -1)}
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={() => setShowModal(false)}
              ></button>
            </div>
            
            <div className="modal-body">
              {/* Title */}
              <div className="mb-3">
                <label className="form-label" style={{ color: "var(--text-color)" }}>Title *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{
                    backgroundColor: "var(--primary-color)",
                    borderColor: "var(--accent-color)",
                    color: "var(--text-color)"
                  }}
                />
              </div>

              {/* Category (for tutorials) */}
              {config.fields.includes("category") && config.categories.length > 0 && (
                <div className="mb-3">
                  <label className="form-label" style={{ color: "var(--text-color)" }}>Category</label>
                  <select
                    className="form-select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{
                      backgroundColor: "var(--primary-color)",
                      borderColor: "var(--accent-color)",
                      color: "var(--text-color)"
                    }}
                  >
                    <option value="">Select category...</option>
                    {config.categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Slug (for pages) */}
              {activeTab === "pages" && (
                <div className="mb-3">
                  <label className="form-label" style={{ color: "var(--text-color)" }}>
                    URL Slug (e.g., "about-us")
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.slug}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-")
                    })}
                    style={{
                      backgroundColor: "var(--primary-color)",
                      borderColor: "var(--accent-color)",
                      color: "var(--text-color)"
                    }}
                  />
                </div>
              )}

              {/* Excerpt */}
              {config.fields.includes("excerpt") && (
                <div className="mb-3">
                  <label className="form-label" style={{ color: "var(--text-color)" }}>
                    Excerpt (Short description)
                  </label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    style={{
                      backgroundColor: "var(--primary-color)",
                      borderColor: "var(--accent-color)",
                      color: "var(--text-color)"
                    }}
                  />
                </div>
              )}

              {/* Content - Rich Text Area */}
              <div className="mb-3">
                <label className="form-label" style={{ color: "var(--text-color)" }}>Content</label>
                <div className="mb-2">
                  <div className="btn-group btn-group-sm">
                    <button 
                      type="button" 
                      className="btn"
                      style={{ backgroundColor: "var(--primary-color)", color: "var(--text-color)", border: "1px solid var(--accent-color)" }}
                      onClick={() => {
                        const textarea = document.getElementById("content-editor");
                        const start = textarea.selectionStart;
                        const end = textarea.selectionEnd;
                        const text = formData.content;
                        const selected = text.substring(start, end);
                        setFormData({
                          ...formData,
                          content: text.substring(0, start) + `**${selected}**` + text.substring(end)
                        });
                      }}
                    >
                      <i className="fas fa-bold"></i>
                    </button>
                    <button 
                      type="button" 
                      className="btn"
                      style={{ backgroundColor: "var(--primary-color)", color: "var(--text-color)", border: "1px solid var(--accent-color)" }}
                      onClick={() => {
                        const textarea = document.getElementById("content-editor");
                        const start = textarea.selectionStart;
                        const end = textarea.selectionEnd;
                        const text = formData.content;
                        const selected = text.substring(start, end);
                        setFormData({
                          ...formData,
                          content: text.substring(0, start) + `*${selected}*` + text.substring(end)
                        });
                      }}
                    >
                      <i className="fas fa-italic"></i>
                    </button>
                    <button 
                      type="button" 
                      className="btn"
                      style={{ backgroundColor: "var(--primary-color)", color: "var(--text-color)", border: "1px solid var(--accent-color)" }}
                      onClick={() => {
                        setFormData({
                          ...formData,
                          content: formData.content + "\n## Heading\n"
                        });
                      }}
                    >
                      <i className="fas fa-heading"></i>
                    </button>
                    <button 
                      type="button" 
                      className="btn"
                      style={{ backgroundColor: "var(--primary-color)", color: "var(--text-color)", border: "1px solid var(--accent-color)" }}
                      onClick={() => {
                        setFormData({
                          ...formData,
                          content: formData.content + "\n- List item\n"
                        });
                      }}
                    >
                      <i className="fas fa-list"></i>
                    </button>
                    <button 
                      type="button" 
                      className="btn"
                      style={{ backgroundColor: "var(--primary-color)", color: "var(--text-color)", border: "1px solid var(--accent-color)" }}
                      onClick={() => {
                        setFormData({
                          ...formData,
                          content: formData.content + "\n[Link text](https://example.com)\n"
                        });
                      }}
                    >
                      <i className="fas fa-link"></i>
                    </button>
                  </div>
                </div>
                <textarea
                  id="content-editor"
                  className="form-control"
                  rows={10}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write your content here... (Markdown supported)"
                  style={{
                    backgroundColor: "var(--primary-color)",
                    borderColor: "var(--accent-color)",
                    color: "var(--text-color)",
                    fontFamily: "monospace"
                  }}
                />
              </div>

              {/* Thumbnail URL */}
              {config.fields.includes("thumbnail") && (
                <div className="mb-3">
                  <label className="form-label" style={{ color: "var(--text-color)" }}>
                    Thumbnail URL
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.thumbnail}
                    onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    style={{
                      backgroundColor: "var(--primary-color)",
                      borderColor: "var(--accent-color)",
                      color: "var(--text-color)"
                    }}
                  />
                </div>
              )}

              {/* Tags */}
              {config.fields.includes("tags") && (
                <div className="mb-3">
                  <label className="form-label" style={{ color: "var(--text-color)" }}>
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="fact-checking, tutorial, beginner"
                    style={{
                      backgroundColor: "var(--primary-color)",
                      borderColor: "var(--accent-color)",
                      color: "var(--text-color)"
                    }}
                  />
                </div>
              )}

              {/* Status */}
              <div className="mb-3">
                <label className="form-label" style={{ color: "var(--text-color)" }}>Status</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  style={{
                    backgroundColor: "var(--primary-color)",
                    borderColor: "var(--accent-color)",
                    color: "var(--text-color)"
                  }}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              {/* Featured toggle (for announcements) */}
              {config.fields.includes("featured") && (
                <div className="form-check mb-3">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="featured-check"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  />
                  <label 
                    className="form-check-label" 
                    htmlFor="featured-check"
                    style={{ color: "var(--text-color)" }}
                  >
                    Featured (show prominently)
                  </label>
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ borderTop: "1px solid var(--accent-color)" }}>
              <button 
                type="button" 
                className="btn"
                style={{ backgroundColor: "var(--primary-color)", color: "var(--text-color)", border: "1px solid var(--accent-color)" }}
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn"
                style={{ backgroundColor: "var(--accent-color)", color: "var(--primary-color)" }}
                onClick={handleSave}
              >
                <i className="fas fa-save me-2"></i>
                {editingItem ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="d-flex" style={{ backgroundColor: "var(--primary-color)", minHeight: "100vh" }}>
      {/* Sidebar */}
      <div
        className="d-flex flex-column p-3"
        style={{
          width: "240px",
          minHeight: "100vh",
          backgroundColor: "var(--secondary-color)",
          borderRight: "2px solid var(--accent-color)",
          boxShadow: "2px 0 10px rgba(0,0,0,0.3)",
          color: "var(--text-color)"
        }}
      >
        <h4 className="text-center mb-4 fw-semibold" style={{ color: "var(--text-color)" }}>
          <i className="fas fa-edit me-2"></i>CMS
        </h4>

        <ul className="nav flex-column">
          <li className="nav-item mb-2">
            <a
              href="/admin-dashboard"
              className="nav-link"
              style={{
                color: "var(--text-color)",
                padding: "10px 12px",
                borderRadius: "5px",
                display: "block",
                textDecoration: "none"
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
              <i className="fas fa-arrow-left me-2"></i> Back to Admin
            </a>
          </li>
          
          <hr style={{ borderColor: "var(--accent-color)" }} />
          
          {["tutorials", "announcements", "pages"].map((tab) => (
            <li className="nav-item mb-2" key={tab}>
              <button
                className="nav-link w-100 text-start"
                style={{
                  color: activeTab === tab ? "var(--primary-color)" : "var(--text-color)",
                  backgroundColor: activeTab === tab ? "var(--accent-color)" : "transparent",
                  padding: "10px 12px",
                  borderRadius: "5px",
                  border: "none"
                }}
                onClick={() => setActiveTab(tab)}
              >
                <i className={`fas fa-${
                  tab === "tutorials" ? "book" : 
                  tab === "announcements" ? "bullhorn" : 
                  "file-alt"
                } me-2`}></i>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-auto">
          <div 
            className="p-3 rounded"
            style={{ backgroundColor: "var(--primary-color)", border: "1px solid var(--accent-color)" }}
          >
            <small style={{ color: "var(--text-color)", opacity: 0.8 }}>
              <i className="fas fa-info-circle me-1"></i>
              Content is stored in Firestore and updates in real-time.
            </small>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow-1 p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold mb-0" style={{ color: "var(--text-color)" }}>
            <i className={`fas fa-${
              activeTab === "tutorials" ? "book" : 
              activeTab === "announcements" ? "bullhorn" : 
              "file-alt"
            } me-2`}></i>
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </h2>
          <button
            className="btn"
            style={{ backgroundColor: "var(--accent-color)", color: "var(--primary-color)" }}
            onClick={openCreate}
          >
            <i className="fas fa-plus me-2"></i>
            Create New
          </button>
        </div>

        {/* Stats */}
        <div className="row mb-4">
          <div className="col-md-4">
            <div 
              className="p-3 rounded"
              style={{ 
                backgroundColor: "var(--secondary-color)", 
                border: "1px solid var(--accent-color)" 
              }}
            >
              <h5 style={{ color: "var(--text-color)" }}>Total</h5>
              <h2 style={{ color: "var(--accent-color)" }}>{getCurrentContent().length}</h2>
            </div>
          </div>
          <div className="col-md-4">
            <div 
              className="p-3 rounded"
              style={{ 
                backgroundColor: "var(--secondary-color)", 
                border: "1px solid var(--accent-color)" 
              }}
            >
              <h5 style={{ color: "var(--text-color)" }}>Published</h5>
              <h2 style={{ color: "var(--success-color)" }}>
                {getCurrentContent().filter(c => c.status === "published").length}
              </h2>
            </div>
          </div>
          <div className="col-md-4">
            <div 
              className="p-3 rounded"
              style={{ 
                backgroundColor: "var(--secondary-color)", 
                border: "1px solid var(--accent-color)" 
              }}
            >
              <h5 style={{ color: "var(--text-color)" }}>Drafts</h5>
              <h2 style={{ color: "var(--neutral-color)" }}>
                {getCurrentContent().filter(c => c.status === "draft").length}
              </h2>
            </div>
          </div>
        </div>

        {/* Content Table */}
        <div 
          className="rounded"
          style={{ 
            backgroundColor: "var(--secondary-color)", 
            border: "2px solid var(--accent-color)",
            overflow: "hidden"
          }}
        >
          {renderTable()}
        </div>
      </main>

      {/* Modal */}
      {renderModal()}
    </div>
  );
}
