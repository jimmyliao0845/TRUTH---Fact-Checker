import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import "./FactCheckerDashboard.css";

export default function GeneralUserProfile() {
  const navigate = useNavigate();
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
          zIndex: 900,
        }}
      >
        <div className="d-flex align-items-center justify-content-between mb-3">
          <button
            className="btn btn-outline-dark btn-sm"
            onClick={() => setCollapsed(!collapsed)}
            style={{ border: "none" }}
          >
            <FaBars />
          </button>
        </div>

        {/* Sidebar Menu */}
        <ul className="nav flex-column">
          <li>
            <button
              className={`btn sidebar-btn text-start ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => setActiveTab("profile")}
              disabled={activeTab === "profile"}
            >
              <FaUser className="me-2" />
              {!collapsed && "My Profile"}
            </button>
          </li>

          <li>
            <button
              className={`btn sidebar-btn text-start ${activeTab === "submissions" ? "active" : ""}`}
              onClick={() => setActiveTab("submissions")}
              disabled={activeTab === "submissions"}
            >
              <FaHistory className="me-2" />
              {!collapsed && "Submissions"}
            </button>
          </li>

          <li>
            <button
              className={`btn sidebar-btn text-start ${activeTab === "games" ? "active" : ""}`}
              onClick={() => setActiveTab("games")}
              disabled={activeTab === "games"}
            >
              <FaTrophy className="me-2" />
              {!collapsed && "Game Stats"}
            </button>
          </li>

          <li>
            <button
              className={`btn sidebar-btn text-start ${activeTab === "messages" ? "active" : ""}`}
              onClick={() => setActiveTab("messages")}
              disabled={activeTab === "messages"}
            >
              <FaCommentDots className="me-2" />
              {!collapsed && "Messages"}
            </button>
          </li>

          <li>
            <button
              className={`btn sidebar-btn text-start ${activeTab === "settings" ? "active" : ""}`}
              onClick={() => setActiveTab("settings")}
              disabled={activeTab === "settings"}
            >
              <FaCog className="me-2" />
              {!collapsed && "Settings"}
            </button>
          </li>

          <li className="mt-4 border-top pt-2">
            <button
              className="btn sidebar-btn text-start"
              onClick={() => navigate("/analysis-logged")}
            >
              <FaArrowLeft className="me-2" />
              {!collapsed && "Back to Analysis"}
            </button>
          </li>
        </ul>

        {!collapsed && (
          <div className="mt-auto small text-muted">
            General User Portal
          </div>
        )}
      </div>

      {/* MAIN CONTENT */}
      <div
        className="flex-grow-1"
        style={{
          marginLeft: collapsed ? "80px" : "250px",
          transition: "margin-left 0.3s ease",
          minHeight: "100vh",
        }}
      >
        {/* NAVBAR */}
        <nav
          className="navbar navbar-light bg-light d-flex justify-content-between align-items-center px-4 py-2 shadow-sm"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 1000,
            borderBottom: "1px solid #ddd",
          }}
        >
          <h5 className="mb-0">
            {activeTab === "profile" && "My Profile"}
            {activeTab === "submissions" && "My Submissions"}
            {activeTab === "games" && "Game Statistics"}
            {activeTab === "messages" && "Messages"}
            {activeTab === "settings" && "Settings"}
          </h5>
          {activeTab !== "messages" && (
            <div style={{ width: 300 }}>
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <FaSearch />
                </span>
                <input
                  className="form-control"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          )}
        </nav>

        {/* CONTENT */}
        <div className="p-4">
          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <div className="container">
              <div className="row">
                <div className="col-md-4">
                  <div className="card shadow-sm">
                    <div className="card-body text-center">
                      <div
                        style={{
                          width: "100px",
                          height: "100px",
                          backgroundColor: "#0d6efd",
                          borderRadius: "50%",
                          margin: "0 auto 1rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontSize: "48px",
                        }}
                      >
                        <FaUser />
                      </div>
                      <h5>{profile.displayName}</h5>
                      <p className="text-muted small">{profile.email}</p>
                      <p className="text-muted small">Joined {profile.joinDate}</p>
                      <hr />
                      <p className="mb-1">
                        <strong>{profile.totalSubmissions}</strong> Submissions
                      </p>
                      <p className="mb-1">
                        <strong>{profile.gamesPlayed}</strong> Games Played
                      </p>
                      <p>
                        <strong>{profile.accuracyScore}%</strong> Accuracy
                      </p>
                      <button className="btn btn-primary btn-sm w-100">
                        Edit Profile
                      </button>
                    </div>
                  </div>
                </div>

                <div className="col-md-8">
                  <div className="card shadow-sm mb-3">
                    <div className="card-header bg-primary text-white">
                      <h6 className="mb-0">About Me</h6>
                    </div>
                    <div className="card-body">
                      <p>{profile.bio}</p>
                      <button className="btn btn-outline-primary btn-sm">
                        Edit Bio
                      </button>
                    </div>
                  </div>

                  <div className="card shadow-sm">
                    <div className="card-header bg-primary text-white">
                      <h6 className="mb-0">Badges & Achievements</h6>
                    </div>
                    <div className="card-body">
                      <div className="d-flex gap-2 flex-wrap">
                        {profile.badges.map((badge, idx) => (
                          <span key={idx} className="badge bg-success">
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
              <div className="card shadow-sm">
                <div className="card-header bg-primary text-white">
                  <h6 className="mb-0">Submission History ({filteredSubmissions.length})</h6>
                </div>
                <div className="card-body">
                  {filteredSubmissions.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-striped table-hover">
                        <thead className="table-dark">
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
                            <tr key={sub.id}>
                              <td>{sub.title}</td>
                              <td>
                                <span className="badge bg-info">{sub.type}</span>
                              </td>
                              <td>{sub.date}</td>
                              <td>
                                <span
                                  className={`badge ${
                                    sub.result === "AI-generated"
                                      ? "bg-warning text-dark"
                                      : "bg-success"
                                  }`}
                                >
                                  {sub.result}
                                </span>
                              </td>
                              <td>
                                <div className="progress" style={{ height: "20px" }}>
                                  <div
                                    className="progress-bar"
                                    style={{ width: `${sub.confidence}%` }}
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
                    <p className="text-muted">No submissions found.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* GAMES TAB */}
          {activeTab === "games" && (
            <div className="container">
              <div className="card shadow-sm">
                <div className="card-header bg-primary text-white">
                  <h6 className="mb-0">Game Statistics ({gameStats.length})</h6>
                </div>
                <div className="card-body">
                  {gameStats.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-striped table-hover">
                        <thead className="table-dark">
                          <tr>
                            <th>Game Name</th>
                            <th>Score</th>
                            <th>Accuracy</th>
                            <th>Date Played</th>
                          </tr>
                        </thead>
                        <tbody>
                          {gameStats.map((game) => (
                            <tr key={game.gameId}>
                              <td>{game.gameName}</td>
                              <td>
                                <span className="badge bg-primary">{game.score}</span>
                              </td>
                              <td>
                                <div className="progress" style={{ height: "20px" }}>
                                  <div
                                    className="progress-bar"
                                    style={{ width: `${game.accuracy}%` }}
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
                    <p className="text-muted">No games played yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* MESSAGES TAB */}
          {activeTab === "messages" && (
            <div className="container">
              <div className="row">
                <div className="col-md-4">
                  <div className="card shadow-sm">
                    <div className="card-header bg-primary text-white">
                      <h6 className="mb-0">Conversations</h6>
                    </div>
                    <div className="card-body p-0">
                      {conversations.map((conv) => (
                        <div
                          key={conv.id}
                          className="p-3 border-bottom"
                          style={{ cursor: "pointer" }}
                        >
                          <p className="mb-1 fw-bold">{conv.name}</p>
                          <p className="mb-0 small text-muted">{conv.lastMessage}</p>
                          <small className="text-muted">{conv.timestamp}</small>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="col-md-8">
                  <div className="card shadow-sm">
                    <div className="card-header bg-primary text-white">
                      <h6 className="mb-0">Select a conversation to view messages</h6>
                    </div>
                    <div className="card-body text-center text-muted">
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
              <div className="card shadow-sm">
                <div className="card-header bg-primary text-white">
                  <h6 className="mb-0">Account Settings</h6>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label className="form-label">Email Notifications</label>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="notif1"
                        defaultChecked
                      />
                      <label className="form-check-label" htmlFor="notif1">
                        Notify me on new game releases
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="notif2"
                        defaultChecked
                      />
                      <label className="form-check-label" htmlFor="notif2">
                        Notify me on feedback received
                      </label>
                    </div>
                  </div>
                  <hr />
                  <div className="mb-3">
                    <label className="form-label">Privacy</label>
                    <select className="form-select">
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
      </div>
    </div>
  );
}
