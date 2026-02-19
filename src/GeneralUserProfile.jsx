import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import "bootstrap/dist/css/bootstrap.min.css";
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
} from "react-icons/fa";

export default function GeneralUserProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [searchQuery, setSearchQuery] = useState("");

  // Auth check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) navigate("/login");
    });
    return () => unsubscribe();
  }, [navigate]);

  // User profile data
  const [profile] = useState({
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

  // Submission history
  const [submissions] = useState([
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

  // Game stats
  const [gameStats] = useState([
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

  // Messages/Conversations
  const [conversations] = useState([
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

  const filteredSubmissions = submissions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Sidebar Overlay for Mobile */}
      <div
        className={`sidebar-overlay ${sidebarVisible ? 'visible' : ''}`}
       onClick={() => setSidebarVisible(false)}
      />

      {/* Sidebar */}
      <div className={`app-sidebar ${collapsed ? 'collapsed' : ''} ${sidebarVisible ? 'visible' : ''}`}>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <button
            className="app-sidebar-toggle"
            onClick={() => setCollapsed(!collapsed)}
          >
            <FaBars />
          </button>
        </div>

        {/* Sidebar Items */}
        <div className="d-flex flex-column gap-1">
          <button
            className={`app-sidebar-item ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
            disabled={activeTab === "profile"}
          >
            <FaUser className="fa-icon" />
            <span className="app-sidebar-label">My Profile</span>
          </button>

          <button
            className={`app-sidebar-item ${activeTab === "submissions" ? "active" : ""}`}
            onClick={() => setActiveTab("submissions")}
            disabled={activeTab === "submissions"}
          >
            <FaHistory className="fa-icon" />
            <span className="app-sidebar-label">Submissions</span>
          </button>

          <button
            className={`app-sidebar-item ${activeTab === "games" ? "active" : ""}`}
            onClick={() => setActiveTab("games")}
            disabled={activeTab === "games"}
          >
            <FaTrophy className="fa-icon" />
            <span className="app-sidebar-label">Game Stats</span>
          </button>

          <button
            className={`app-sidebar-item ${activeTab === "messages" ? "active" : ""}`}
            onClick={() => setActiveTab("messages")}
            disabled={activeTab === "messages"}
          >
            <FaCommentDots className="fa-icon" />
            <span className="app-sidebar-label">Messages</span>
          </button>

          <button
            className={`app-sidebar-item ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
            disabled={activeTab === "settings"}
          >
            <FaCog className="fa-icon" />
            <span className="app-sidebar-label">Settings</span>
          </button>

          <div style={{ borderTop: "1px solid var(--accent-color)", marginTop: "1rem", marginBottom: "1rem" }} />

          <button
            className={`app-sidebar-item ${location.pathname === "/analysis-logged" ? "active" : ""}`}
            onClick={() => navigate("/analysis-logged")}
            disabled={location.pathname === "/analysis-logged"}
          >
            <FaArrowLeft className="fa-icon" />
            <span className="app-sidebar-label">Back to Analysis</span>
          </button>
        </div>

        {!collapsed && (
          <div className="mt-4 small" style={{ color: "var(--text-color)", opacity: 0.7 }}>
            User workspace
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className={`app-main-content ${collapsed ? 'with-collapsed-sidebar' : ''}`}>

        {!collapsed && (
          <div className="mt-auto small text-muted">
            General User Portal
          </div>
        )}
      </div>

      {/* MAIN CONTENT */}
      <main className="app-main-content flex-grow-1">
        {/* NAVBAR */}
        <nav
          className="navbar d-flex justify-content-between align-items-center px-4 py-2 shadow-sm"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 1000,
            backgroundColor: "var(--primary-color)",
            borderBottom: `1px solid var(--accent-color)`,
          }}
        >
          <h5 className="mb-0" style={{ color: "var(--text-color)" }}>
            {activeTab === "profile" && "My Profile"}
            {activeTab === "submissions" && "My Submissions"}
            {activeTab === "games" && "Game Statistics"}
            {activeTab === "messages" && "Messages"}
            {activeTab === "settings" && "Settings"}
          </h5>
          {activeTab !== "messages" && (
            <div style={{ width: 300 }}>
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

        {/* CONTENT */}
        <div className="p-4" style={{ backgroundColor: "var(--primary-color)" }}>
          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <div className="container">
              <div className="row">
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
                      <h5 style={{ color: "var(--text-color)" }}>{profile.displayName}</h5>
                      <p style={{ color: "var(--text-color)", opacity: 0.7 }} className="small">{profile.email}</p>
                      <p style={{ color: "var(--text-color)", opacity: 0.7 }} className="small">Joined {profile.joinDate}</p>
                      <hr style={{ borderColor: "var(--accent-color)", opacity: 0.3 }} />
                      <p className="mb-1" style={{ color: "var(--text-color)" }}>
                        <strong>{profile.totalSubmissions}</strong> Submissions
                      </p>
                      <p className="mb-1" style={{ color: "var(--text-color)" }}>
                        <strong>{profile.gamesPlayed}</strong> Games Played
                      </p>
                      <p style={{ color: "var(--text-color)" }}>
                        <strong>{profile.accuracyScore}%</strong> Accuracy
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
                      <p>{profile.bio}</p>
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
                        {profile.badges.map((badge, idx) => (
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
            </div>
          )}

          {/* SUBMISSIONS TAB */}
          {activeTab === "submissions" && (
            <div className="container">
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
                            <tr key={sub.id} style={{ borderColor: "var(--accent-color)", opacity: 0.3 }}>
                              <td>{sub.title}</td>
                              <td>
                                <span 
                                  className="badge"
                                  style={{
                                    backgroundColor: "var(--accent-color)",
                                    color: "var(--primary-color)"
                                  }}
                                >
                                  {sub.type}
                                </span>
                              </td>
                              <td>{sub.date}</td>
                              <td>
                                <span
                                  className="badge"
                                  style={{
                                    backgroundColor: sub.result === "AI-generated" ? "var(--warning-color)" : "var(--accent-color)",
                                    color: sub.result === "AI-generated" ? "var(--primary-color)" : "var(--text-color-light)"
                                  }}
                                >
                                  {sub.result}
                                </span>
                              </td>
                              <td>
                                <div className="progress" style={{ height: "20px" }}>
                                  <div
                                    className="progress-bar"
                                    style={{ 
                                      width: `${sub.confidence}%`,
                                      backgroundColor: "var(--accent-color)"
                                    }}
                                  >
                                    {sub.confidence}%
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p style={{ color: "var(--text-color)", opacity: 0.7 }}>No submissions found.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* GAMES TAB */}
          {activeTab === "games" && (
            <div className="container">
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
                  <h6 className="mb-0">Game Statistics ({gameStats.length})</h6>
                </div>
                <div className="card-body">
                  {gameStats.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-striped table-hover" style={{ color: "var(--text-color)" }}>
                        <thead style={{ backgroundColor: "var(--accent-color)", color: "var(--primary-color)" }}>
                          <tr>
                            <th>Game Name</th>
                            <th>Score</th>
                            <th>Accuracy</th>
                            <th>Date Played</th>
                          </tr>
                        </thead>
                        <tbody>
                          {gameStats.map((game) => (
                            <tr key={game.gameId} style={{ borderColor: "var(--accent-color)", opacity: 0.3 }}>
                              <td>{game.gameName}</td>
                              <td>
                                <span 
                                  className="badge"
                                  style={{
                                    backgroundColor: "var(--accent-color)",
                                    color: "var(--primary-color)"
                                  }}
                                >
                                  {game.score}
                                </span>
                              </td>
                              <td>
                                <div className="progress" style={{ height: "20px" }}>
                                  <div
                                    className="progress-bar"
                                    style={{ 
                                      width: `${game.accuracy}%`,
                                      backgroundColor: "var(--accent-color)"
                                    }}
                                  >
                                    {game.accuracy}%
                                  </div>
                                </div>
                              </td>
                              <td>{game.date}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p style={{ color: "var(--text-color)", opacity: 0.7 }}>No games played yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* MESSAGES TAB */}
          {activeTab === "messages" && (
            <div className="container">
              <div className="row">
                <div 
                  className="col-md-4"
                  style={{
                    backgroundColor: "var(--secondary-color)",
                    border: `2px solid var(--accent-color)`,
                    borderRadius: "8px"
                  }}
                >
                  <div 
                    className="card shadow-sm"
                    style={{
                      backgroundColor: "var(--secondary-color)",
                      border: "none",
                      color: "var(--text-color)"
                    }}
                  >
                    <div 
                      className="card-header"
                      style={{
                        backgroundColor: "var(--accent-color)",
                        color: "var(--primary-color)",
                        borderBottom: "none"
                      }}
                    >
                      <h6 className="mb-0">Conversations</h6>
                    </div>
                    <div className="card-body p-0">
                      {conversations.map((conv) => (
                        <div
                          key={conv.id}
                          className="p-3"
                          style={{ 
                            cursor: "pointer",
                            borderBottom: `1px solid var(--accent-color)`,
                            color: "var(--text-color)"
                          }}
                        >
                          <p className="mb-1 fw-bold">{conv.name}</p>
                          <p className="mb-0 small" style={{ opacity: 0.7 }}>{conv.lastMessage}</p>
                          <small style={{ opacity: 0.6 }}>{conv.timestamp}</small>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div 
                  className="col-md-8"
                  style={{
                    backgroundColor: "var(--secondary-color)",
                    border: `2px solid var(--accent-color)`,
                    borderRadius: "8px"
                  }}
                >
                  <div 
                    className="card shadow-sm"
                    style={{
                      backgroundColor: "var(--secondary-color)",
                      border: "none",
                      color: "var(--text-color)"
                    }}
                  >
                    <div 
                      className="card-header"
                      style={{
                        backgroundColor: "var(--accent-color)",
                        color: "var(--primary-color)",
                        borderBottom: "none"
                      }}
                    >
                      <h6 className="mb-0">Select a conversation to view messages</h6>
                    </div>
                    <div className="card-body" style={{ color: "var(--text-color)" }}>
                      <p>Click on a conversation to start messaging</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === "settings" && (
            <div className="container">
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
                  <h6 className="mb-0">Account Settings</h6>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label className="form-label" style={{ color: "var(--text-color)" }}>Email Notifications</label>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="notif1"
                        defaultChecked
                        style={{ borderColor: "var(--accent-color)" }}
                      />
                      <label 
                        className="form-check-label" 
                        htmlFor="notif1"
                        style={{ color: "var(--text-color)" }}
                      >
                        Notify me on new game releases
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="notif2"
                        defaultChecked
                        style={{ borderColor: "var(--accent-color)" }}
                      />
                      <label 
                        className="form-check-label" 
                        htmlFor="notif2"
                        style={{ color: "var(--text-color)" }}
                      >
                        Notify me on feedback received
                      </label>
                    </div>
                  </div>
                  <hr style={{ borderColor: "var(--accent-color)", opacity: 0.3 }} />
                  <div className="mb-3">
                    <label className="form-label" style={{ color: "var(--text-color)" }}>Privacy</label>
                    <select 
                      className="form-select"
                      style={{
                        backgroundColor: "var(--primary-color)",
                        borderColor: "var(--accent-color)",
                        color: "var(--text-color)"
                      }}
                    >
                      <option>Public Profile</option>
                      <option>Private Profile</option>
                    </select>
                  </div>
                  <button className="btn btn-primary">Save Settings</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
