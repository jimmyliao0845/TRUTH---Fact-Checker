import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { 
  collection, 
  getDocs, 
  getDoc,
  doc, 
  query, 
  where,
  orderBy,
  updateDoc,
  increment
} from "firebase/firestore";
import { db } from "./firebase";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./styles.css";

/**
 * Simple Markdown renderer
 * Converts basic markdown to HTML
 */
const renderMarkdown = (text) => {
  if (!text) return "";
  
  let html = text
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: var(--accent-color)">$1</a>')
    // Lists
    .replace(/^\- (.*$)/gim, '<li>$1</li>')
    // Line breaks
    .replace(/\n/gim, '<br />');
  
  // Wrap consecutive li elements in ul
  html = html.replace(/(<li>.*<\/li>)(<br \/>)?(<li>)/g, '$1$3');
  html = html.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');
  html = html.replace(/<\/ul><ul>/g, '');
  
  return html;
};

/**
 * TutorialList - Shows all published tutorials
 */
export function TutorialList() {
  const navigate = useNavigate();
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchTutorials();
  }, []);

  const fetchTutorials = async () => {
    try {
      const q = query(
        collection(db, "cms_tutorials"),
        where("status", "==", "published"),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setTutorials(list);
      
      // Extract unique categories
      const cats = [...new Set(list.map(t => t.category).filter(Boolean))];
      setCategories(cats);
    } catch (err) {
      console.error("Failed to fetch tutorials:", err);
    }
    setLoading(false);
  };

  // Filter tutorials
  const filteredTutorials = tutorials.filter(t => {
    const matchesSearch = t.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div 
        className="d-flex justify-content-center align-items-center" 
        style={{ minHeight: "100vh", backgroundColor: "var(--primary-color)" }}
      >
        <div className="text-center">
          <i className="fas fa-spinner fa-spin fa-3x mb-3" style={{ color: "var(--accent-color)" }}></i>
          <p style={{ color: "var(--text-color)" }}>Loading tutorials...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "var(--primary-color)", minHeight: "100vh" }}>
      {/* Header */}
      <div 
        className="py-5"
        style={{ 
          backgroundColor: "var(--secondary-color)",
          borderBottom: "2px solid var(--accent-color)"
        }}
      >
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <h1 className="fw-bold mb-2" style={{ color: "var(--text-color)" }}>
                <i className="fas fa-book-open me-3" style={{ color: "var(--accent-color)" }}></i>
                Tutorials
              </h1>
              <p style={{ color: "var(--text-color)", opacity: 0.8 }}>
                Learn fact-checking and media verification skills
              </p>
            </div>
            <div className="col-md-6">
              <div className="d-flex gap-2">
                <div className="input-group">
                  <span 
                    className="input-group-text"
                    style={{ 
                      backgroundColor: "var(--primary-color)", 
                      borderColor: "var(--accent-color)",
                      color: "var(--text-color)"
                    }}
                  >
                    <i className="fas fa-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search tutorials..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      backgroundColor: "var(--primary-color)",
                      borderColor: "var(--accent-color)",
                      color: "var(--text-color)"
                    }}
                  />
                </div>
                <select
                  className="form-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{
                    backgroundColor: "var(--primary-color)",
                    borderColor: "var(--accent-color)",
                    color: "var(--text-color)",
                    width: "auto"
                  }}
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tutorial Grid */}
      <div className="container py-5">
        {filteredTutorials.length === 0 ? (
          <div className="text-center py-5">
            <i className="fas fa-book fa-4x mb-3" style={{ color: "var(--accent-color)", opacity: 0.5 }}></i>
            <h4 style={{ color: "var(--text-color)" }}>No tutorials found</h4>
            <p style={{ color: "var(--text-color)", opacity: 0.7 }}>
              {searchTerm || selectedCategory !== "all" 
                ? "Try adjusting your search or filter" 
                : "Check back later for new content"}
            </p>
          </div>
        ) : (
          <div className="row g-4">
            {filteredTutorials.map((tutorial) => (
              <div key={tutorial.id} className="col-md-6 col-lg-4">
                <div 
                  className="card h-100"
                  style={{ 
                    backgroundColor: "var(--secondary-color)",
                    border: "2px solid var(--accent-color)",
                    cursor: "pointer",
                    transition: "transform 0.2s, box-shadow 0.2s"
                  }}
                  onClick={() => navigate(`/tutorials/${tutorial.id}`)}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-5px)";
                    e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.3)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {/* Thumbnail */}
                  {tutorial.thumbnail ? (
                    <img 
                      src={tutorial.thumbnail} 
                      alt={tutorial.title}
                      className="card-img-top"
                      style={{ height: "160px", objectFit: "cover" }}
                    />
                  ) : (
                    <div 
                      className="card-img-top d-flex align-items-center justify-content-center"
                      style={{ 
                        height: "160px", 
                        backgroundColor: "var(--primary-color)",
                        borderBottom: "1px solid var(--accent-color)"
                      }}
                    >
                      <i className="fas fa-book fa-3x" style={{ color: "var(--accent-color)", opacity: 0.5 }}></i>
                    </div>
                  )}
                  
                  <div className="card-body">
                    {/* Category badge */}
                    {tutorial.category && (
                      <span 
                        className="badge mb-2"
                        style={{ backgroundColor: "var(--accent-color)", color: "var(--primary-color)" }}
                      >
                        {tutorial.category}
                      </span>
                    )}
                    
                    <h5 className="card-title" style={{ color: "var(--text-color)" }}>
                      {tutorial.title}
                    </h5>
                    
                    {tutorial.excerpt && (
                      <p 
                        className="card-text" 
                        style={{ 
                          color: "var(--text-color)", 
                          opacity: 0.8,
                          fontSize: "0.9rem",
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden"
                        }}
                      >
                        {tutorial.excerpt}
                      </p>
                    )}
                  </div>
                  
                  <div 
                    className="card-footer d-flex justify-content-between align-items-center"
                    style={{ 
                      backgroundColor: "var(--primary-color)",
                      borderTop: "1px solid var(--accent-color)"
                    }}
                  >
                    <small style={{ color: "var(--text-color)", opacity: 0.7 }}>
                      <i className="fas fa-eye me-1"></i> {tutorial.views || 0} views
                    </small>
                    <small style={{ color: "var(--text-color)", opacity: 0.7 }}>
                      <i className="fas fa-calendar me-1"></i>
                      {tutorial.createdAt?.toDate?.()?.toLocaleDateString() || "N/A"}
                    </small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back link */}
        <div className="text-center mt-5">
          <Link 
            to="/"
            className="btn"
            style={{ 
              backgroundColor: "var(--secondary-color)", 
              color: "var(--text-color)",
              border: "1px solid var(--accent-color)"
            }}
          >
            <i className="fas fa-arrow-left me-2"></i>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * TutorialView - Shows individual tutorial content
 */
export function TutorialView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tutorial, setTutorial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedTutorials, setRelatedTutorials] = useState([]);

  useEffect(() => {
    fetchTutorial();
  }, [id]);

  const fetchTutorial = async () => {
    try {
      const docRef = doc(db, "cms_tutorials", id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists() && docSnap.data().status === "published") {
        const data = { id: docSnap.id, ...docSnap.data() };
        setTutorial(data);
        
        // Increment view count
        await updateDoc(docRef, {
          views: increment(1)
        });
        
        // Fetch related tutorials (same category)
        if (data.category) {
          const q = query(
            collection(db, "cms_tutorials"),
            where("status", "==", "published"),
            where("category", "==", data.category)
          );
          const snapshot = await getDocs(q);
          const related = snapshot.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(t => t.id !== id)
            .slice(0, 3);
          setRelatedTutorials(related);
        }
      } else {
        setTutorial(null);
      }
    } catch (err) {
      console.error("Failed to fetch tutorial:", err);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div 
        className="d-flex justify-content-center align-items-center" 
        style={{ minHeight: "100vh", backgroundColor: "var(--primary-color)" }}
      >
        <div className="text-center">
          <i className="fas fa-spinner fa-spin fa-3x mb-3" style={{ color: "var(--accent-color)" }}></i>
          <p style={{ color: "var(--text-color)" }}>Loading tutorial...</p>
        </div>
      </div>
    );
  }

  if (!tutorial) {
    return (
      <div 
        className="d-flex justify-content-center align-items-center" 
        style={{ minHeight: "100vh", backgroundColor: "var(--primary-color)" }}
      >
        <div className="text-center">
          <i className="fas fa-exclamation-triangle fa-4x mb-3" style={{ color: "var(--accent-color)" }}></i>
          <h3 style={{ color: "var(--text-color)" }}>Tutorial not found</h3>
          <p style={{ color: "var(--text-color)", opacity: 0.7 }}>
            This tutorial may have been removed or is not available.
          </p>
          <button 
            className="btn mt-3"
            style={{ backgroundColor: "var(--accent-color)", color: "var(--primary-color)" }}
            onClick={() => navigate("/tutorials")}
          >
            <i className="fas fa-arrow-left me-2"></i>
            Back to Tutorials
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "var(--primary-color)", minHeight: "100vh" }}>
      {/* Header */}
      <div 
        style={{ 
          backgroundColor: "var(--secondary-color)",
          borderBottom: "2px solid var(--accent-color)"
        }}
      >
        {/* Thumbnail banner */}
        {tutorial.thumbnail && (
          <div 
            style={{ 
              height: "250px",
              backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${tutorial.thumbnail})`,
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
          />
        )}
        
        <div className="container py-4">
          {/* Back button */}
          <button 
            className="btn btn-sm mb-3"
            style={{ 
              backgroundColor: "var(--primary-color)", 
              color: "var(--text-color)",
              border: "1px solid var(--accent-color)"
            }}
            onClick={() => navigate("/tutorials")}
          >
            <i className="fas fa-arrow-left me-2"></i>
            Back to Tutorials
          </button>
          
          {/* Category */}
          {tutorial.category && (
            <span 
              className="badge mb-2 d-inline-block"
              style={{ backgroundColor: "var(--accent-color)", color: "var(--primary-color)" }}
            >
              {tutorial.category}
            </span>
          )}
          
          {/* Title */}
          <h1 className="fw-bold mb-3" style={{ color: "var(--text-color)" }}>
            {tutorial.title}
          </h1>
          
          {/* Meta info */}
          <div className="d-flex gap-4 flex-wrap" style={{ color: "var(--text-color)", opacity: 0.8 }}>
            <span>
              <i className="fas fa-calendar me-1"></i>
              {tutorial.createdAt?.toDate?.()?.toLocaleDateString() || "N/A"}
            </span>
            <span>
              <i className="fas fa-eye me-1"></i>
              {tutorial.views || 0} views
            </span>
            {tutorial.tags && tutorial.tags.length > 0 && (
              <span>
                <i className="fas fa-tags me-1"></i>
                {tutorial.tags.join(", ")}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-5">
        <div className="row">
          {/* Main content */}
          <div className="col-lg-8">
            <div 
              className="p-4 rounded"
              style={{ 
                backgroundColor: "var(--secondary-color)",
                border: "1px solid var(--accent-color)"
              }}
            >
              {/* Excerpt */}
              {tutorial.excerpt && (
                <p 
                  className="lead mb-4"
                  style={{ 
                    color: "var(--text-color)", 
                    borderLeft: "4px solid var(--accent-color)",
                    paddingLeft: "16px"
                  }}
                >
                  {tutorial.excerpt}
                </p>
              )}
              
              {/* Content */}
              <div 
                className="tutorial-content"
                style={{ 
                  color: "var(--text-color)",
                  lineHeight: 1.8
                }}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(tutorial.content) }}
              />
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="col-lg-4">
            {/* Related tutorials */}
            {relatedTutorials.length > 0 && (
              <div 
                className="p-4 rounded mb-4"
                style={{ 
                  backgroundColor: "var(--secondary-color)",
                  border: "1px solid var(--accent-color)"
                }}
              >
                <h5 className="mb-3" style={{ color: "var(--text-color)" }}>
                  <i className="fas fa-book me-2" style={{ color: "var(--accent-color)" }}></i>
                  Related Tutorials
                </h5>
                {relatedTutorials.map((t) => (
                  <div 
                    key={t.id}
                    className="mb-3 pb-3"
                    style={{ borderBottom: "1px solid var(--accent-color)" }}
                  >
                    <Link 
                      to={`/tutorials/${t.id}`}
                      style={{ 
                        color: "var(--text-color)", 
                        textDecoration: "none",
                        display: "block"
                      }}
                      onMouseOver={(e) => e.currentTarget.style.color = "var(--accent-color)"}
                      onMouseOut={(e) => e.currentTarget.style.color = "var(--text-color)"}
                    >
                      <strong>{t.title}</strong>
                      {t.excerpt && (
                        <p 
                          className="mb-0 mt-1" 
                          style={{ 
                            fontSize: "0.85rem", 
                            opacity: 0.7,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden"
                          }}
                        >
                          {t.excerpt}
                        </p>
                      )}
                    </Link>
                  </div>
                ))}
              </div>
            )}
            
            {/* Tags */}
            {tutorial.tags && tutorial.tags.length > 0 && (
              <div 
                className="p-4 rounded"
                style={{ 
                  backgroundColor: "var(--secondary-color)",
                  border: "1px solid var(--accent-color)"
                }}
              >
                <h5 className="mb-3" style={{ color: "var(--text-color)" }}>
                  <i className="fas fa-tags me-2" style={{ color: "var(--accent-color)" }}></i>
                  Tags
                </h5>
                <div className="d-flex flex-wrap gap-2">
                  {tutorial.tags.map((tag, i) => (
                    <span 
                      key={i}
                      className="badge"
                      style={{ 
                        backgroundColor: "var(--primary-color)",
                        color: "var(--text-color)",
                        border: "1px solid var(--accent-color)"
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * AnnouncementsBanner - Shows featured announcements
 * Can be embedded in other pages
 */
export function AnnouncementsBanner() {
  const [announcements, setAnnouncements] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const q = query(
        collection(db, "cms_announcements"),
        where("status", "==", "published"),
        where("featured", "==", true),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      setAnnouncements(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Failed to fetch announcements:", err);
    }
  };

  // Auto-rotate announcements
  useEffect(() => {
    if (announcements.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(i => (i + 1) % announcements.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [announcements.length]);

  if (announcements.length === 0) return null;

  const current = announcements[currentIndex];

  return (
    <div 
      className="py-2 px-3"
      style={{ 
        backgroundColor: "var(--accent-color)",
        color: "var(--primary-color)"
      }}
    >
      <div className="container d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <i className="fas fa-bullhorn me-2"></i>
          <strong className="me-2">Announcement:</strong>
          <span>{current.title}</span>
        </div>
        {announcements.length > 1 && (
          <div className="d-flex gap-1">
            {announcements.map((_, i) => (
              <span 
                key={i}
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: i === currentIndex ? "var(--primary-color)" : "rgba(0,0,0,0.3)",
                  cursor: "pointer"
                }}
                onClick={() => setCurrentIndex(i)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * CMSPage - Displays a custom page by slug
 */
export function CMSPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPage();
  }, [slug]);

  const fetchPage = async () => {
    try {
      const q = query(
        collection(db, "cms_pages"),
        where("status", "==", "published"),
        where("slug", "==", slug)
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        setPage({ id: doc.id, ...doc.data() });
      } else {
        setPage(null);
      }
    } catch (err) {
      console.error("Failed to fetch page:", err);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div 
        className="d-flex justify-content-center align-items-center" 
        style={{ minHeight: "100vh", backgroundColor: "var(--primary-color)" }}
      >
        <i className="fas fa-spinner fa-spin fa-3x" style={{ color: "var(--accent-color)" }}></i>
      </div>
    );
  }

  if (!page) {
    return (
      <div 
        className="d-flex justify-content-center align-items-center flex-column" 
        style={{ minHeight: "100vh", backgroundColor: "var(--primary-color)" }}
      >
        <i className="fas fa-exclamation-triangle fa-4x mb-3" style={{ color: "var(--accent-color)" }}></i>
        <h3 style={{ color: "var(--text-color)" }}>Page not found</h3>
        <button 
          className="btn mt-3"
          style={{ backgroundColor: "var(--accent-color)", color: "var(--primary-color)" }}
          onClick={() => navigate("/")}
        >
          <i className="fas fa-home me-2"></i>
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "var(--primary-color)", minHeight: "100vh" }}>
      <div className="container py-5">
        <h1 className="fw-bold mb-4" style={{ color: "var(--text-color)" }}>
          {page.title}
        </h1>
        <div 
          className="p-4 rounded"
          style={{ 
            backgroundColor: "var(--secondary-color)",
            border: "1px solid var(--accent-color)"
          }}
        >
          <div 
            style={{ color: "var(--text-color)", lineHeight: 1.8 }}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(page.content) }}
          />
        </div>
      </div>
    </div>
  );
}

// Default export for backwards compatibility
export default TutorialList;
