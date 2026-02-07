import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";
import {
  FaBars,
  FaUser,
  FaHistory,
  FaTrophy,
  FaCommentDots,
  FaCog,
  FaArrowLeft,
  FaSearch,
  FaBookmark,
  FaThumbsUp,
  FaShare,
  FaTachometerAlt,
  FaPlusCircle,
  FaEdit,
  FaChartBar,
  FaUsers,
  FaClipboardList,
  FaUserCog,
  FaRegBookmark,
  FaLandmark,
  FaStar,
  FaBook,
  FaBell,
} from "react-icons/fa";

export default function UserProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [searchQuery, setSearchQuery] = useState("");

  // Determine if professional or general user based on route
  const isProfessional = location.pathname === "/professional/profile";

  // Auth check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) navigate("/login");
    });
    return () => unsubscribe();
  }, [navigate]);

  // ========== UTILITY FUNCTIONS ==========
  const load = (key, fallback) => {
    const v = JSON.parse(localStorage.getItem(key) || "null");
    if (v) return v;
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  };

  const save = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  // ========== GENERAL USER DATA ==========
  const [generalProfile] = useState({
    userId: "user-100",
    displayName: "John Analyzer",
    email: "john@example.com",
    joinDate: "2025-01-15",
    totalSubmissions: 24,
    gamesPlayed: 12,
    accuracyScore: 85,
    badges: ["First Submission", "Game Master", "Active Contributor"],
    bio: "Passionate about identifying AI content and media literacy",
    avatarUrl: "",
  });

  const [generalSubmissions] = useState([
    {
      id: 1,
      type: "text",
      title: "News Article Analysis",
      date: "2025-02-01",
      result: "Human-made",
      confidence: 95,
    },
    {
      id: 2,
      type: "image",
      title: "Portrait Image",
      date: "2025-01-28",
      result: "AI-generated",
      confidence: 87,
    },
    {
      id: 3,
      type: "document",
      title: "Research Paper",
      date: "2025-01-25",
      result: "Human-made",
      confidence: 92,
    },
  ]);

  const [generalGameStats] = useState([
    {
      gameId: 1,
      gameName: "Real vs Fake Images",
      score: 95,
      accuracy: 90,
      date: "2025-01-30",
    },
    {
      gameId: 2,
      gameName: "Truth or Misinformation",
      score: 87,
      accuracy: 82,
      date: "2025-01-28",
    },
    {
      gameId: 3,
      gameName: "Media Forensics 101",
      score: 92,
      accuracy: 88,
      date: "2025-01-25",
    },
  ]);

  const [generalConversations] = useState([
    {
      id: 1,
      name: "Dr. Jane Analyst (Professional)",
      lastMessage: "Thanks for your feedback!",
      timestamp: "2 hours ago",
    },
    {
      id: 2,
      name: "System Admin",
      lastMessage: "Your account has been verified",
      timestamp: "1 day ago",
    },
  ]);

  // ========== PROFESSIONAL USER DATA ==========
  const [profProfile] = useState(() =>
    load("pro_profile_v4", {
      pro_id: "prof-100",
      displayName: "Dr. Jane Analyst",
      caption: "Fact-checker • Media Forensics • Educator",
      avatarUrl: "",
    })
  );

  const [posts, setPosts] = useState(() =>
    load("posts_v4", [
      {
        id: "post-1",
        author: "Dr. Jane Analyst",
        time: "2 hrs ago",
        content: "New techniques for media forensics are available!",
        liked: false,
        bookmarked: true,
      },
      {
        id: "post-2",
        author: "Dr. Jane Analyst",
        time: "1 day ago",
        content: "Check out my latest fact-check tutorial.",
        liked: false,
        bookmarked: false,
      },
    ])
  );

  const [reviews, setReviews] = useState(() =>
    load("reviews_v4", [
      {
        id: "rev-1",
        reviewer: "John Doe",
        tutorial: "Media Forensics 101",
        time: "3 days ago",
        comment: "Very insightful tutorial!",
        bookmarked: false,
      },
      {
        id: "rev-2",
        reviewer: "Alice Smith",
        tutorial: "Fact-Checking Basics",
        time: "1 week ago",
        comment: "Helped me a lot with verification.",
        bookmarked: true,
      },
    ])
  );

  const [bookmarks, setBookmarks] = useState(() =>
    load("bookmarks_v3", [
      {
        type: "post",
        id: "post-101",
        author: "Dr. Jane Analyst",
        time: "Jan 24, 2026",
        content: "Understanding the basics of media forensics and fact-checking.",
      },
      {
        type: "review",
        id: "review-201",
        reviewer: "John Doe",
        tutorial: "Fact-Checking Tutorial 1",
        time: "Jan 22, 2026",
        comment: "This tutorial was very informative and practical!",
      },
    ])
  );

  const [conversations, setConversations] = useState(() =>
    load("messages_v4", [{ id: "admin", name: "System Admin", messages: [] }])
  );
  const [activeConversationId, setActiveConversationId] = useState("admin");
  const [newMessage, setNewMessage] = useState("");
  const [addContactInput, setAddContactInput] = useState("");

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );

  // ========== PROFESSIONAL USER FUNCTIONS ==========
  const sendMessage = () => {
    if (!newMessage.trim()) return;
    const updated = conversations.map((c) =>
      c.id === activeConversationId
        ? { ...c, messages: [...c.messages, { sender: "You", text: newMessage }] }
        : c
    );
    setConversations(updated);
    save("messages_v4", updated);
    setNewMessage("");
  };

  const toggleBookmark = (type, id) => {
    if (type === "post") {
      const updated = posts.map((p) =>
        p.id === id ? { ...p, bookmarked: !p.bookmarked } : p
      );
      setPosts(updated);
      save("posts_v4", updated);

      const postItem = posts.find((p) => p.id === id);
      if (postItem?.bookmarked) {
        setBookmarks(bookmarks.filter((b) => b.id !== id));
      } else {
        setBookmarks([...bookmarks, { ...postItem, type: "post" }]);
      }
      save("bookmarks_v3", bookmarks);
    } else if (type === "review") {
      const updated = reviews.map((r) =>
        r.id === id ? { ...r, bookmarked: !r.bookmarked } : r
      );
      setReviews(updated);
      save("reviews_v4", updated);

      const revItem = reviews.find((r) => r.id === id);
      if (revItem?.bookmarked) {
        setBookmarks(bookmarks.filter((b) => b.id !== id));
      } else {
        setBookmarks([...bookmarks, { ...revItem, type: "review" }]);
      }
      save("bookmarks_v3", bookmarks);
    }
  };

  const removeBookmark = (id) => {
    setBookmarks(bookmarks.filter((b) => b.id !== id));
    save("bookmarks_v3", bookmarks);

    setPosts(posts.map((p) => (p.id === id ? { ...p, bookmarked: false } : p)));
    setReviews(
      reviews.map((r) => (r.id === id ? { ...r, bookmarked: false } : r))
    );
    save("posts_v4", posts);
    save("reviews_v4", reviews);
  };

  // ========== FILTERING ==========
  const filteredSubmissions = generalSubmissions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const items = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (activeTab === "posts") return posts.filter((p) => p.content.toLowerCase().includes(q));
    if (activeTab === "reviews") return reviews.filter((r) => r.comment.toLowerCase().includes(q));
    if (activeTab === "bookmarks") return bookmarks.filter((b) => (b.content || b.comment).toLowerCase().includes(q));
    return [];
  }, [activeTab, posts, reviews, bookmarks, searchQuery]);

  // ========== RENDER ==========
  return (
    <div className="d-flex" style={{ 
      backgroundColor: "var(--primary-color)", 
      paddingTop: "56px",
      minHeight: "100vh",
      color: "var(--text-color)"
    }}>
      {/* ========== UNIFIED SIDEBAR ========== */}
      <div className={`app-sidebar ${collapsed ? 'collapsed' : ''}`}
        style={!isProfessional ? {
          background: "linear-gradient(135deg, var(--secondary-color) 0%, rgba(0,123,255,0.05) 100%)",
        } : {}}>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <button
            className="app-sidebar-toggle"
            onClick={() => setCollapsed(!collapsed)}
          >
            <FaBars />
          </button>
        </div>

        {/* Title Section */}
        {!collapsed && !isProfessional && (
          <div className="mb-4 text-center" style={{
            fontSize: "12px",
            fontWeight: "700",
            color: "var(--accent-color)",
            textTransform: "uppercase",
            letterSpacing: "1px",
            opacity: 0.8
          }}>
            My Dashboard
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="d-flex flex-column gap-1">
          {isProfessional ? (
            // Professional User Tabs
            <>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-color)", opacity: 0.5, paddingLeft: "12px", textTransform: "uppercase" }}>
                {!collapsed && "Workspace"}
              </div>
              {[
                { id: "dashboard", label: "Dashboard", icon: FaTachometerAlt, action: () => navigate("/factcheckerdashboard") },
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`app-sidebar-item ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={tab.action}
                >
                  <tab.icon size={20} />
                  <span className="app-sidebar-label">{tab.label}</span>
                </button>
              ))}

              <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-color)", opacity: 0.5, paddingLeft: "12px", textTransform: "uppercase", marginTop: "1rem" }}>
                {!collapsed && "Content"}
              </div>
              {[
                { id: "posts", label: "Posts", icon: FaClipboardList },
                { id: "messages", label: "Messages", icon: FaCommentDots },
                { id: "reviews", label: "Reviews", icon: FaThumbsUp },
                { id: "bookmarks", label: "Bookmarks", icon: FaBookmark },
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`app-sidebar-item ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                  disabled={activeTab === tab.id}
                >
                  <tab.icon size={20} />
                  <span className="app-sidebar-label">{tab.label}</span>
                </button>
              ))}

              <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-color)", opacity: 0.5, paddingLeft: "12px", textTransform: "uppercase", marginTop: "1rem" }}>
                {!collapsed && "Management"}
              </div>
              {[
                { id: "verification-logs", label: "Verification Logs", icon: FaClipboardList },
                { id: "tutorials", label: "Manage Tutorials", icon: FaBook },
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`app-sidebar-item ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                  disabled={activeTab === tab.id}
                >
                  <tab.icon size={20} />
                  <span className="app-sidebar-label">{tab.label}</span>
                </button>
              ))}

              <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-color)", opacity: 0.5, paddingLeft: "12px", textTransform: "uppercase", marginTop: "1rem" }}>
                {!collapsed && "Settings"}
              </div>
              {[
                { id: "settings", label: "Settings", icon: FaCog },
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`app-sidebar-item ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                  disabled={activeTab === tab.id}
                >
                  <tab.icon size={20} />
                  <span className="app-sidebar-label">{tab.label}</span>
                </button>
              ))}
            </>
          ) : (
            // General User Tabs
            <>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-color)", opacity: 0.5, paddingLeft: "12px", textTransform: "uppercase" }}>
                {!collapsed && "Profile"}
              </div>
              {[
                { id: "profile", label: "My Profile", icon: FaUser },
                { id: "achievements", label: "Achievements", icon: FaStar },
                { id: "settings", label: "Settings", icon: FaCog },
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`app-sidebar-item ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                  disabled={activeTab === tab.id}
                >
                  <tab.icon size={20} />
                  <span className="app-sidebar-label">{tab.label}</span>
                </button>
              ))}

              <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-color)", opacity: 0.5, paddingLeft: "12px", textTransform: "uppercase", marginTop: "1rem" }}>
                {!collapsed && "Activity"}
              </div>
              {[
                { id: "submissions", label: "Submissions", icon: FaHistory },
                { id: "games", label: "Game Stats", icon: FaTrophy },
                { id: "bookmarks", label: "Bookmarks", icon: FaBookmark },
                { id: "leaderboard", label: "Leaderboard", icon: FaLandmark },
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`app-sidebar-item ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                  disabled={activeTab === tab.id}
                >
                  <tab.icon size={20} />
                  <span className="app-sidebar-label">{tab.label}</span>
                </button>
              ))}

              <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-color)", opacity: 0.5, paddingLeft: "12px", textTransform: "uppercase", marginTop: "1rem" }}>
                {!collapsed && "Social"}
              </div>
              {[
                { id: "messages", label: "Messages", icon: FaCommentDots },
                { id: "community", label: "Community", icon: FaUsers },
                { id: "notifications", label: "Notifications", icon: FaBell },
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`app-sidebar-item ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                  disabled={activeTab === tab.id}
                >
                  <tab.icon size={20} />
                  <span className="app-sidebar-label">{tab.label}</span>
                </button>
              ))}

              <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-color)", opacity: 0.5, paddingLeft: "12px", textTransform: "uppercase", marginTop: "1rem" }}>
                {!collapsed && "Learning"}
              </div>
              {[
                { id: "tutorials", label: "Tutorials", icon: FaBook },
                { id: "learning-path", label: "Learning Path", icon: FaChartBar },
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`app-sidebar-item ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                  disabled={activeTab === tab.id}
                >
                  <tab.icon size={20} />
                  <span className="app-sidebar-label">{tab.label}</span>
                </button>
              ))}
            </>
          )}
        </div>

        {/* Back Button */}
        <div style={{ borderTop: "1px solid var(--accent-color)", marginTop: "1rem", paddingTop: "1rem" }}>
          <button
            className="app-sidebar-item"
            onClick={() => navigate(isProfessional ? "/analysis" : "/analysis-logged")}
          >
            <FaArrowLeft size={20} />
            <span className="app-sidebar-label">{isProfessional ? "Go Back" : "Back to Analysis"}</span>
          </button>
        </div>

        {!collapsed && (
          <div className="mt-auto small" style={{ opacity: 0.7, color: "var(--text-color)", fontSize: "11px", marginTop: "1rem" }}>
            {isProfessional ? "Professional workspace" : "Learner Portal"}
          </div>
        )}
      </div>

      {/* ========== UNIFIED MAIN CONTENT ========== */}
      <div className={`app-main-content ${collapsed ? 'with-collapsed-sidebar' : ''}`}>
        <nav 
          className="navbar shadow-sm px-4"
          style={{
            backgroundColor: "var(--primary-color)",
            borderBottom: `1px solid var(--accent-color)`
          }}
        >
          <h5 className="mb-0" style={{ color: "var(--text-color)" }}>
            {isProfessional ? (
              <>
                {activeTab === "dashboard" && "Dashboard"}
                {activeTab === "profile" && "My Profile"}
                {activeTab === "posts" && "Posts"}
                {activeTab === "messages" && "Messages"}
                {activeTab === "reviews" && "Reviews"}
                {activeTab === "bookmarks" && "Bookmarks"}
                {activeTab === "verification-logs" && "Verification Logs"}
                {activeTab === "tutorials" && "Manage Tutorials"}
                {activeTab === "settings" && "Settings"}
              </>
            ) : (
              <>
                {activeTab === "profile" && "My Profile"}
                {activeTab === "submissions" && "My Submissions"}
                {activeTab === "games" && "Game Statistics"}
                {activeTab === "messages" && "Messages"}
                {activeTab === "settings" && "Settings"}
                {activeTab === "achievements" && "My Achievements"}
                {activeTab === "bookmarks" && "My Bookmarks"}
                {activeTab === "leaderboard" && "Global Leaderboard"}
                {activeTab === "community" && "Community"}
                {activeTab === "notifications" && "Notifications"}
                {activeTab === "tutorials" && "Learning Tutorials"}
                {activeTab === "learning-path" && "Your Learning Path"}
              </>
            )}
          </h5>
          {activeTab !== "messages" && (
            <div style={{ width: 360 }}>
              <div className="input-group">
                <span 
                  className="input-group-text"
                  style={{
                    backgroundColor: "var(--secondary-color)",
                    borderColor: "var(--accent-color)",
                    color: "var(--text-color)"
                  }}
                >
                  <FaSearch />
                </span>
                <input
                  className="form-control"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    backgroundColor: "var(--secondary-color)",
                    borderColor: "var(--accent-color)",
                    color: "var(--text-color)"
                  }}
                />
              </div>
            </div>
          )}
        </nav>

        <div className="container-fluid p-4">
          {/* PROFESSIONAL PROFILE HEADER */}
          {isProfessional && activeTab === "profile" && (
            <div 
              className="card shadow-sm mb-4 p-4"
              style={{
                backgroundColor: "var(--secondary-color)",
                borderColor: "var(--accent-color)",
                border: "2px solid var(--accent-color)"
              }}
            >
              <div className="d-flex align-items-center gap-4">
                <img
                  src={profProfile.avatarUrl || "https://via.placeholder.com/120"}
                  alt="avatar"
                  className="rounded-circle"
                  width={120}
                  height={120}
                  style={{ border: `2px solid var(--accent-color)` }}
                />
                <div>
                  <h4 className="mb-1" style={{ color: "var(--text-color)" }}>{profProfile.displayName}</h4>
                  <div style={{ color: "rgba(255,255,255,0.7)" }}>{profProfile.caption}</div>
                </div>
              </div>
            </div>
          )}

          {/* GENERAL USER PROFILE HEADER */}
          {!isProfessional && activeTab === "profile" && (
            <div className="row mb-4">
              <div className="col-md-4">
                <div 
                  className="card shadow-sm"
                  style={{
                    backgroundColor: "var(--secondary-color)",
                    border: `2px solid var(--accent-color)`,
                    color: "var(--text-color)"
                  }}
                >
                  <div className="card-body text-center">
                    <div
                      style={{
                        width: "100px",
                        height: "100px",
                        backgroundColor: "var(--accent-color)",
                        borderRadius: "50%",
                        margin: "0 auto 1rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--primary-color)",
                        fontSize: "48px",
                      }}
                    >
                      <FaUser />
                    </div>
                    <h5 style={{ color: "var(--text-color)" }}>{generalProfile.displayName}</h5>
                    <p style={{ color: "var(--text-color)", opacity: 0.7 }} className="small">{generalProfile.email}</p>
                    <p style={{ color: "var(--text-color)", opacity: 0.7 }} className="small">Joined {generalProfile.joinDate}</p>
                    <hr style={{ borderColor: "var(--accent-color)", opacity: 0.3 }} />
                    <p className="mb-1" style={{ color: "var(--text-color)" }}>
                      <strong>{generalProfile.totalSubmissions}</strong> Submissions
                    </p>
                    <p className="mb-1" style={{ color: "var(--text-color)" }}>
                      <strong>{generalProfile.gamesPlayed}</strong> Games Played
                    </p>
                    <p style={{ color: "var(--text-color)" }}>
                      <strong>{generalProfile.accuracyScore}%</strong> Accuracy
                    </p>
                    <button 
                      className="btn btn-sm w-100"
                      style={{
                        backgroundColor: "var(--accent-color)",
                        color: "var(--primary-color)",
                        border: `1px solid var(--accent-color)`
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "var(--accent-color)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = "var(--accent-color)";
                        e.currentTarget.style.color = "var(--primary-color)";
                      }}
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>

              <div className="col-md-8">
                <div 
                  className="card shadow-sm mb-3"
                  style={{
                    backgroundColor: "var(--secondary-color)",
                    border: `2px solid var(--accent-color)`,
                    color: "var(--text-color)"
                  }}
                >
                  <div 
                    className="card-header"
                    style={{
                      backgroundColor: "var(--accent-color)",
                      color: "var(--primary-color)"
                    }}
                  >
                    <h6 className="mb-0">About Me</h6>
                  </div>
                  <div className="card-body">
                    <p>{generalProfile.bio}</p>
                    <button 
                      className="btn btn-sm"
                      style={{
                        backgroundColor: "transparent",
                        border: `1px solid var(--accent-color)`,
                        color: "var(--accent-color)"
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
                      Edit Bio
                    </button>
                  </div>
                </div>

                <div 
                  className="card shadow-sm"
                  style={{
                    backgroundColor: "var(--secondary-color)",
                    border: `2px solid var(--accent-color)`,
                    color: "var(--text-color)"
                  }}
                >
                  <div 
                    className="card-header"
                    style={{
                      backgroundColor: "var(--accent-color)",
                      color: "var(--primary-color)"
                    }}
                  >
                    <h6 className="mb-0">Badges & Achievements</h6>
                  </div>
                  <div className="card-body">
                    <div className="d-flex gap-2 flex-wrap">
                      {generalProfile.badges.map((badge, idx) => (
                        <span 
                          key={idx} 
                          className="badge"
                          style={{
                            backgroundColor: "var(--accent-color)",
                            color: "var(--primary-color)"
                          }}
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT - PROFESSIONAL POSTS/REVIEWS/BOOKMARKS */}
          {isProfessional && (activeTab === "posts" || activeTab === "reviews" || activeTab === "bookmarks") && (
            <div className="row">
              {items.map((item) => (
                <div key={item.id} className="col-md-6 mb-3">
                  <div
                    className="card shadow-sm"
                    style={{
                      backgroundColor: "var(--secondary-color)",
                      border: `2px solid var(--accent-color)`,
                      color: "var(--text-color)"
                    }}
                  >
                    <div className="card-body">
                      <h6 className="card-title" style={{ color: "var(--text-color)" }}>
                        {item.author || item.reviewer}
                      </h6>
                      <small style={{ opacity: 0.7 }}>{item.time}</small>
                      <p className="card-text mt-2">{item.content || item.comment}</p>
                      {activeTab !== "bookmarks" && (
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm"
                            onClick={() => toggleBookmark(activeTab === "posts" ? "post" : "review", item.id)}
                            style={{
                              backgroundColor: item.bookmarked ? "var(--accent-color)" : "transparent",
                              color: item.bookmarked ? "var(--primary-color)" : "var(--text-color)",
                              border: `1px solid var(--accent-color)`,
                            }}
                          >
                            <FaRegBookmark size={16} /> Bookmark
                          </button>
                        </div>
                      )}
                      {activeTab === "bookmarks" && (
                        <button
                          className="btn btn-sm"
                          onClick={() => removeBookmark(item.id)}
                          style={{
                            backgroundColor: "transparent",
                            color: "var(--accent-color)",
                            border: `1px solid var(--accent-color)`,
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PROFESSIONAL MESSAGES TAB */}
          {isProfessional && activeTab === "messages" && (
            <div className="row" style={{ minHeight: 450 }}>
              <div className="col-md-4" style={{ borderRight: `1px solid var(--accent-color)` }}>
                <input
                  className="form-control mb-2"
                  placeholder="Add Account ID or Name"
                  value={addContactInput}
                  onChange={(e) => setAddContactInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && addContactInput.trim()) {
                      const updated = [
                        ...conversations,
                        { id: addContactInput.toLowerCase(), name: addContactInput, messages: [] },
                      ];
                      setConversations(updated);
                      save("messages_v4", updated);
                      setAddContactInput("");
                    }
                  }}
                  style={{
                    backgroundColor: "var(--secondary-color)",
                    borderColor: "var(--accent-color)",
                    color: "var(--text-color)"
                  }}
                />
                <ul className="list-group">
                  {conversations.map((c) => (
                    <li
                      key={c.id}
                      className="list-group-item"
                      onClick={() => setActiveConversationId(c.id)}
                      style={{ 
                        cursor: "pointer",
                        backgroundColor: c.id === activeConversationId ? "var(--accent-color)" : "var(--secondary-color)",
                        color: c.id === activeConversationId ? "var(--primary-color)" : "var(--text-color)",
                        border: `1px solid var(--accent-color)`,
                        transition: "all 0.2s"
                      }}
                      onMouseOver={(e) => {
                        if (c.id !== activeConversationId) {
                          e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
                        }
                      }}
                      onMouseOut={(e) => {
                        if (c.id !== activeConversationId) {
                          e.currentTarget.style.backgroundColor = "var(--secondary-color)";
                        }
                      }}
                    >
                      {c.name}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="col-md-8 d-flex flex-column">
                <div 
                  className="flex-grow-1 rounded p-3 mb-2 overflow-auto"
                  style={{
                    backgroundColor: "var(--secondary-color)",
                    border: `2px solid var(--accent-color)`
                  }}
                >
                  {activeConversation?.messages.map((m, i) => (
                    <div key={i} className="mb-2" style={{ color: "var(--text-color)" }}>
                      <strong>{m.sender}:</strong> {m.text}
                    </div>
                  ))}
                </div>

                <div className="d-flex gap-2">
                  <input
                    className="form-control"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    style={{
                      backgroundColor: "var(--secondary-color)",
                      borderColor: "var(--accent-color)",
                      color: "var(--text-color)"
                    }}
                  />
                  <button 
                    className="btn"
                    onClick={sendMessage}
                    style={{
                      backgroundColor: "var(--accent-color)",
                      color: "var(--primary-color)",
                      fontWeight: "600",
                      transition: "all 0.2s",
                      borderRadius: "6px"
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
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PROFESSIONAL VERIFICATION LOGS TAB */}
          {isProfessional && activeTab === "verification-logs" && (
            <div 
              className="card shadow-sm"
              style={{
                backgroundColor: "var(--secondary-color)",
                border: `2px solid var(--accent-color)`,
                color: "var(--text-color)"
              }}
            >
              <div 
                className="card-header"
                style={{
                  backgroundColor: "var(--accent-color)",
                  color: "var(--primary-color)"
                }}
              >
                <h6 className="mb-0">Verification Logs</h6>
              </div>
              <div className="card-body">
                <p style={{ color: "var(--text-color)" }}>View your verification history and logs here.</p>
              </div>
            </div>
          )}

          {/* PROFESSIONAL SETTINGS TAB */}
          {isProfessional && activeTab === "settings" && (
            <div 
              className="card shadow-sm"
              style={{
                backgroundColor: "var(--secondary-color)",
                border: `2px solid var(--accent-color)`,
                color: "var(--text-color)"
              }}
            >
              <div 
                className="card-header"
                style={{
                  backgroundColor: "var(--accent-color)",
                  color: "var(--primary-color)"
                }}
              >
                <h6 className="mb-0">Settings</h6>
              </div>
              <div className="card-body">
                <p style={{ color: "var(--text-color)" }}>Professional settings coming soon...</p>
              </div>
            </div>
          )}

          {/* GENERAL USER SUBMISSIONS TAB */}
          {!isProfessional && activeTab === "submissions" && (
            <div 
              className="card shadow-sm"
              style={{
                backgroundColor: "var(--secondary-color)",
                border: `2px solid var(--accent-color)`,
                color: "var(--text-color)"
              }}
            >
              <div 
                className="card-header"
                style={{
                  backgroundColor: "var(--accent-color)",
                  color: "var(--primary-color)"
                }}
              >
                <h6 className="mb-0">Submission History ({filteredSubmissions.length})</h6>
              </div>
              <div className="card-body">
                {filteredSubmissions.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-striped table-hover" style={{ color: "var(--text-color)" }}>
                      <thead style={{ backgroundColor: "var(--accent-color)", color: "var(--primary-color)" }}>
                        <tr>
                          <th>Title</th>
                          <th>Type</th>
                          <th>Date</th>
                          <th>Result</th>
                          <th>Confidence</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSubmissions.map((sub) => (
                          <tr key={sub.id} style={{ borderColor: "var(--accent-color)" }}>
                            <td>{sub.title}</td>
                            <td><span className="badge" style={{backgroundColor: "var(--accent-color)", color: "var(--primary-color)"}}>{sub.type}</span></td>
                            <td>{sub.date}</td>
                            <td>
                              <span className="badge" style={{backgroundColor: sub.result === "AI-generated" ? "#ffc107" : "var(--accent-color)", color: sub.result === "AI-generated" ? "#000" : "var(--primary-color)"}}>
                                {sub.result}
                              </span>
                            </td>
                            <td>{sub.confidence}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={{ color: "var(--text-color)" }}>No submissions found</p>
                )}
              </div>
            </div>
          )}

          {/* GENERAL USER GAMES TAB */}
          {!isProfessional && activeTab === "games" && (
            <div className="row">
              {generalGameStats.map((game) => (
                <div key={game.gameId} className="col-md-4 mb-3">
                  <div className="card shadow-sm" style={{backgroundColor: "var(--secondary-color)", border: `2px solid var(--accent-color)`, color: "var(--text-color)"}}>
                    <div className="card-body">
                      <h6 className="card-title" style={{ color: "var(--text-color)" }}>{game.gameName}</h6>
                      <p className="mb-1" style={{ color: "var(--text-color)" }}><strong>Score:</strong> {game.score}</p>
                      <p className="mb-1" style={{ color: "var(--text-color)" }}><strong>Accuracy:</strong> {game.accuracy}%</p>
                      <p style={{ color: "var(--text-color)", opacity: 0.7 }} className="small">Played on {game.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SHARED MESSAGES TAB - Both Users */}
          {activeTab === "messages" && !isProfessional && (
            <div 
              className="card shadow-sm"
              style={{
                backgroundColor: "var(--secondary-color)",
                border: `2px solid var(--accent-color)`,
                color: "var(--text-color)"
              }}
            >
              <div 
                className="card-header"
                style={{
                  backgroundColor: "var(--accent-color)",
                  color: "var(--primary-color)"
                }}
              >
                <h6 className="mb-0">Recent Conversations ({generalConversations.length})</h6>
              </div>
              <div className="card-body">
                {generalConversations.map((conv) => (
                  <div key={conv.id} className="mb-3 p-3" style={{backgroundColor: "var(--primary-color)", border: `1px solid var(--accent-color)`, borderRadius: "6px", cursor: "pointer"}}>
                    <h6 style={{ color: "var(--text-color)", marginBottom: "4px" }}>{conv.name}</h6>
                    <p style={{ color: "var(--text-color)", opacity: 0.7, marginBottom: "4px" }} className="small">{conv.lastMessage}</p>
                    <small style={{ color: "var(--text-color)", opacity: 0.5 }}>{conv.timestamp}</small>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GENERAL USER ACHIEVEMENTS TAB */}
          {!isProfessional && activeTab === "achievements" && (
            <div className="row">
              {generalProfile.badges.map((badge, idx) => (
                <div key={idx} className="col-md-4 mb-3">
                  <div className="card shadow-sm text-center" style={{backgroundColor: "var(--secondary-color)", border: `2px solid var(--accent-color)`, color: "var(--text-color)"}}>
                    <div className="card-body">
                      <div style={{fontSize: "48px", color: "var(--accent-color)", marginBottom: "1rem"}}><FaStar /></div>
                      <h6 style={{ color: "var(--text-color)" }}>{badge}</h6>
                      <p style={{ color: "var(--text-color)", opacity: 0.7, margin: 0 }} className="small">Achievement Unlocked</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SHARED BOOKMARKS TAB */}
          {activeTab === "bookmarks" && (
            <div 
              className="card shadow-sm"
              style={{
                backgroundColor: "var(--secondary-color)",
                border: `2px solid var(--accent-color)`,
                color: "var(--text-color)"
              }}
            >
              <div 
                className="card-header"
                style={{
                  backgroundColor: "var(--accent-color)",
                  color: "var(--primary-color)"
                }}
              >
                <h6 className="mb-0">{isProfessional ? "Bookmarks" : "Your Bookmarks"}</h6>
              </div>
              <div className="card-body">
                {isProfessional ? (
                  bookmarks.length > 0 ? (
                    <div className="row">
                      {bookmarks.map((item) => (
                        <div key={item.id} className="col-md-6 mb-3">
                          <div className="card shadow-sm" style={{backgroundColor: "var(--primary-color)", border: `1px solid var(--accent-color)`, color: "var(--text-color)"}}>
                            <div className="card-body">
                              <h6>{item.author || item.reviewer}</h6>
                              <small style={{ opacity: 0.7 }}>{item.time}</small>
                              <p className="card-text mt-2">{item.content || item.comment}</p>
                              <button className="btn btn-sm" onClick={() => removeBookmark(item.id)} style={{backgroundColor: "transparent", color: "var(--accent-color)", border: `1px solid var(--accent-color)`}}>Remove</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: "var(--text-color)" }}>No bookmarks yet.</p>
                  )
                ) : (
                  <p style={{ color: "var(--text-color)" }}>You haven't bookmarked any content yet. Start bookmarking your favorite submissions and tutorials!</p>
                )}
              </div>
            </div>
          )}

          {/* GENERAL USER LEADERBOARD TAB */}
          {!isProfessional && activeTab === "leaderboard" && (
            <div 
              className="card shadow-sm"
              style={{
                backgroundColor: "var(--secondary-color)",
                border: `2px solid var(--accent-color)`,
                color: "var(--text-color)"
              }}
            >
              <div 
                className="card-header"
                style={{
                  backgroundColor: "var(--accent-color)",
                  color: "var(--primary-color)"
                }}
              >
                <h6 className="mb-0">Global Leaderboard</h6>
              </div>
              <div className="card-body">
                <table className="table" style={{ color: "var(--text-color)" }}>
                  <thead style={{ backgroundColor: "var(--accent-color)", color: "var(--primary-color)" }}>
                    <tr>
                      <th>Rank</th>
                      <th>User</th>
                      <th>Score</th>
                      <th>Accuracy</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1</td>
                      <td>Alex Chen</td>
                      <td>2450</td>
                      <td>94%</td>
                    </tr>
                    <tr>
                      <td>2</td>
                      <td>Sarah Smith</td>
                      <td>2380</td>
                      <td>91%</td>
                    </tr>
                    <tr>
                      <td>3</td>
                      <td style={{ fontWeight: "bold" }}>You (John Analyzer)</td>
                      <td style={{ fontWeight: "bold" }}>2100</td>
                      <td style={{ fontWeight: "bold" }}>85%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* GENERAL USER COMMUNITY TAB */}
          {!isProfessional && activeTab === "community" && (
            <div 
              className="card shadow-sm"
              style={{
                backgroundColor: "var(--secondary-color)",
                border: `2px solid var(--accent-color)`,
                color: "var(--text-color)"
              }}
            >
              <div 
                className="card-header"
                style={{
                  backgroundColor: "var(--accent-color)",
                  color: "var(--primary-color)"
                }}
              >
                <h6 className="mb-0">Community</h6>
              </div>
              <div className="card-body">
                <p style={{ color: "var(--text-color)" }}>Connect with other learners in the community. Discuss findings, share insights, and collaborate on fact-checking tasks.</p>
                <button className="btn" style={{backgroundColor: "var(--accent-color)", color: "var(--primary-color)"}}>Join Community</button>
              </div>
            </div>
          )}

          {/* GENERAL USER NOTIFICATIONS TAB */}
          {!isProfessional && activeTab === "notifications" && (
            <div 
              className="card shadow-sm"
              style={{
                backgroundColor: "var(--secondary-color)",
                border: `2px solid var(--accent-color)`,
                color: "var(--text-color)"
              }}
            >
              <div 
                className="card-header"
                style={{
                  backgroundColor: "var(--accent-color)",
                  color: "var(--primary-color)"
                }}
              >
                <h6 className="mb-0">Notifications</h6>
              </div>
              <div className="card-body">
                <p style={{ color: "var(--text-color)" }}>You're all caught up! No new notifications at this time.</p>
              </div>
            </div>
          )}

          {/* SHARED TUTORIALS TAB */}
          {activeTab === "tutorials" && (
            <div className="row">
              {[
                { id: 1, title: "Getting Started with TRUTH", category: "Introduction", difficulty: "Beginner" },
                { id: 2, title: "Fact-Checking Basics", category: "Verification", difficulty: "Beginner" },
                { id: 3, title: "Advanced Media Forensics", category: "Expert", difficulty: "Advanced" },
              ].map((tut) => (
                <div key={tut.id} className="col-md-4 mb-3">
                  <div className="card shadow-sm" style={{backgroundColor: "var(--secondary-color)", border: `2px solid var(--accent-color)`, color: "var(--text-color)"}}>
                    <div className="card-header" style={{backgroundColor: "var(--accent-color)", color: "var(--primary-color)"}}>
                      <h6 className="mb-0">{tut.title}</h6>
                    </div>
                    <div className="card-body">
                      <p style={{ color: "var(--text-color)", marginBottom: "8px" }} className="small"><strong>Category:</strong> {tut.category}</p>
                      <p style={{ color: "var(--text-color)", marginBottom: "12px" }} className="small"><strong>Level:</strong> {tut.difficulty}</p>
                      <button className="btn btn-sm" style={{backgroundColor: "var(--accent-color)", color: "var(--primary-color)", width: "100%"}}>Start Learning</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* GENERAL USER LEARNING PATH TAB */}
          {!isProfessional && activeTab === "learning-path" && (
            <div 
              className="card shadow-sm"
              style={{
                backgroundColor: "var(--secondary-color)",
                border: `2px solid var(--accent-color)`,
                color: "var(--text-color)"
              }}
            >
              <div 
                className="card-header"
                style={{
                  backgroundColor: "var(--accent-color)",
                  color: "var(--primary-color)"
                }}
              >
                <h6 className="mb-0">Your Learning Path</h6>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <h6 style={{ color: "var(--text-color)" }}>Foundation Phase</h6>
                  <div style={{ height: "8px", backgroundColor: "var(--primary-color)", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{height: "100%", width: "75%", backgroundColor: "var(--accent-color)"}} />
                  </div>
                  <small style={{ color: "var(--text-color)", opacity: 0.7 }}>75% Complete - 3 of 4 courses done</small>
                </div>
                <div>
                  <h6 style={{ color: "var(--text-color)" }}>Advanced Phase</h6>
                  <div style={{ height: "8px", backgroundColor: "var(--primary-color)", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{height: "100%", width: "30%", backgroundColor: "var(--accent-color)"}} />
                  </div>
                  <small style={{ color: "var(--text-color)", opacity: 0.7 }}>30% Complete - 1 of 3 courses done</small>
                </div>
              </div>
            </div>
          )}

          {/* SHARED SETTINGS TAB */}
          {activeTab === "settings" && !isProfessional && (
            <div 
              className="card shadow-sm"
              style={{
                backgroundColor: "var(--secondary-color)",
                border: `2px solid var(--accent-color)`,
                color: "var(--text-color)"
              }}
            >
              <div 
                className="card-header"
                style={{
                  backgroundColor: "var(--accent-color)",
                  color: "var(--primary-color)"
                }}
              >
                <h6 className="mb-0">Settings</h6>
              </div>
              <div className="card-body">
                <p style={{ color: "var(--text-color)" }}>Settings management coming soon...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
