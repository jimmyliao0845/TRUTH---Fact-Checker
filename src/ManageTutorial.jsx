import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { SAMPLE_TUTORIALS } from "./sampleAdminData";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";
import {
  FaBars,
  FaTachometerAlt,
  FaPlusCircle,
  FaEdit,
  FaChartBar,
  FaUsers,
  FaClipboardList,
  FaArrowLeft,
  FaEye,
  FaTrash,
} from "react-icons/fa";

export default function ManageTutorial() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTutorial, setSelectedTutorial] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [allGames, setAllGames] = useState([]);

  // ✅ Auth check and load user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
      } else {
        setCurrentUser(user);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // ✅ Load games from localStorage (user-created) + SAMPLE_TUTORIALS (admin)
  useEffect(() => {
    try {
      // Load user-created games from localStorage
      const userGames = JSON.parse(localStorage.getItem("admin_games_created") || "[]");
      
      // Combine with sample tutorials
      const combined = [...SAMPLE_TUTORIALS, ...userGames];
      
      // Sort by created date descending
      combined.sort((a, b) => {
        const aDate = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
        const bDate = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
        return bDate - aDate;
      });
      
      setAllGames(combined);
    } catch (error) {
      console.error("Error loading games:", error);
      setAllGames(SAMPLE_TUTORIALS);
    }
  }, []);

  // ✅ Sorting state
  const [sortOption, setSortOption] = useState("date");

  // ✅ Derived sorted tutorials
  const sortedTutorials = useMemo(() => {
    let sorted = [...allGames];
    switch (sortOption) {
      case "views":
        sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case "rating":
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "date":
        sorted.sort((a, b) => {
          const aDate = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
          const bDate = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
          return bDate - aDate;
        });
        break;
      case "difficulty":
        const diffOrder = { "beginner": 1, "intermediate": 2, "advanced": 3 };
        sorted.sort((a, b) => (diffOrder[b.difficulty] || 0) - (diffOrder[a.difficulty] || 0));
        break;
      case "players":
        sorted.sort((a, b) => (b.players || 0) - (a.players || 0));
        break;
      default:
        break;
    }
    return sorted;
  }, [sortOption, allGames]);

  // ✅ Check if current user is the creator
  const isCreator = (game) => {
    if (!currentUser) return false;
    return game.creatorId === currentUser.uid || game.creatorEmail === currentUser.email;
  };

  return (
    <div className="d-flex" style={{ backgroundColor: "var(--primary-color)", paddingTop: "56px", minHeight: "100vh" }}>
      {/* Sidebar */}
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
            className="app-sidebar-item"
            onClick={() => navigate("/factcheckerdashboard")}
          >
            <FaTachometerAlt size={20} />
            <span className="app-sidebar-label">Dashboard</span>
          </button>

          <button 
            className="app-sidebar-item"
            onClick={() => navigate("/professional/create-tutorial")}
          >
            <FaPlusCircle size={20} />
            <span className="app-sidebar-label">Create Game</span>
          </button>

          <button
            className={`app-sidebar-item ${location.pathname === "/professional/manage-tutorial" ? 'active' : ''}`}
            onClick={() => location.pathname !== "/professional/manage-tutorial" && navigate("/professional/manage-tutorial")}
            disabled={location.pathname === "/professional/manage-tutorial"}
          >
            <FaEdit size={20} />
            <span className="app-sidebar-label">Manage Games</span>
          </button>

          <button
            className="app-sidebar-item"
            onClick={() => navigate("/professional/reports")}
          >
            <FaChartBar size={20} />
            <span className="app-sidebar-label">Reports</span>
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
            onClick={() => navigate("/professional/verification-logs")}
          >
            <FaClipboardList size={20} />
            <span className="app-sidebar-label">Verification Logs</span>
          </button>

          {/* Go Back to Analysis Page */}
          <div style={{ borderTop: "1px solid var(--accent-color)", marginTop: "1rem", paddingTop: "1rem" }}>
            <button
              className="app-sidebar-item"
              onClick={() => navigate("/analysis")}
            >
              <FaArrowLeft size={20} />
              <span className="app-sidebar-label">Back to Analysis</span>
            </button>
          </div>
        </div>

        {!collapsed && (
          <div className="mt-4 small" style={{ color: "var(--text-color)", opacity: 0.7 }}>
            Professional workspace
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className={`app-main-content ${collapsed ? 'with-collapsed-sidebar' : ''}`}>
        {/* Local Navbar */}
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
          <h5 style={{ color: "var(--text-color)", margin: 0 }}>
            <i className="fas fa-gamepad me-2" style={{ color: "var(--accent-color)" }}></i>
            My Games
          </h5>
          <div style={{ fontSize: "2rem", color: "var(--accent-color)", cursor: "pointer" }}>
            🎮
          </div>
        </nav>

        {/* Main Tutorial Management Content */}
        <main className="admin-content p-4">
          {/* Header with title and controls */}
          <div style={{ marginBottom: "2rem" }}>
            <h2 className="fw-bold mb-2" style={{ color: "var(--text-color)" }}>
              <i className="fas fa-book me-2" style={{ color: "var(--accent-color)" }}></i>
              Game Management
            </h2>
            <p style={{ color: "var(--text-color)", opacity: 0.7, marginBottom: 0 }}>
              View, manage, and track your published games
            </p>
          </div>

          {/* Stats Cards */}
          <div style={{ 
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "1rem", 
            marginBottom: "2rem"
          }}>
            <div style={{ 
              padding: "1rem",
              borderRadius: "8px",
              backgroundColor: "var(--secondary-color)", 
              border: "2px solid var(--accent-color)"
            }}>
              <h6 style={{ color: "var(--accent-color)", marginBottom: "0.5rem", fontSize: "0.85rem", fontWeight: "600", textTransform: "uppercase" }}>Total Games</h6>
              <h3 style={{ color: "var(--text-color)", marginBottom: 0 }}>{sortedTutorials.length}</h3>
            </div>
            <div style={{ 
              padding: "1rem",
              borderRadius: "8px",
              backgroundColor: "var(--secondary-color)", 
              border: "2px solid var(--success-color)"
            }}>
              <h6 style={{ color: "var(--success-color)", marginBottom: "0.5rem", fontSize: "0.85rem", fontWeight: "600", textTransform: "uppercase" }}>Published</h6>
              <h3 style={{ color: "var(--success-color)", marginBottom: 0 }}>{sortedTutorials.filter(t => t.status === "published").length}</h3>
            </div>
            <div style={{ 
              padding: "1rem",
              borderRadius: "8px",
              backgroundColor: "var(--secondary-color)", 
              border: "2px solid #ffc107"
            }}>
              <h6 style={{ color: "#ffc107", marginBottom: "0.5rem", fontSize: "0.85rem", fontWeight: "600", textTransform: "uppercase" }}>Avg Rating</h6>
              <h3 style={{ color: "#ffc107", marginBottom: 0 }}>{(sortedTutorials.reduce((sum, t) => sum + (t.rating || 0), 0) / sortedTutorials.length).toFixed(1)} ⭐</h3>
            </div>
            <div style={{ 
              padding: "1rem",
              borderRadius: "8px",
              backgroundColor: "var(--secondary-color)", 
              border: "2px solid var(--info-color)"
            }}>
              <h6 style={{ color: "var(--info-color)", marginBottom: "0.5rem", fontSize: "0.85rem", fontWeight: "600", textTransform: "uppercase" }}>Total Plays</h6>
              <h3 style={{ color: "var(--info-color)", marginBottom: 0 }}>{sortedTutorials.reduce((sum, t) => sum + (t.players || 0), 0)}</h3>
            </div>
          </div>

          {/* Controls */}
          <div style={{ 
            display: "flex", 
            gap: "1rem", 
            marginBottom: "1.5rem",
            alignItems: "center",
            flexWrap: "wrap"
          }}>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              style={{
                padding: "0.7rem 1rem",
                backgroundColor: "var(--primary-color)",
                borderColor: "var(--accent-color)",
                border: "2px solid var(--accent-color)",
                color: "var(--text-color)",
                borderRadius: "8px",
                fontWeight: "500"
              }}
            >
              <option value="date">📅 Recently Added</option>
              <option value="views">👁️ Most Viewed</option>
              <option value="rating">⭐ Top Rated</option>
              <option value="difficulty">📊 Difficulty</option>
              <option value="players">🎮 Most Played</option>
            </select>
          </div>

          {/* Tutorials Table */}
          <div className="rounded" style={{ 
            backgroundColor: "var(--secondary-color)", 
            border: "2px solid var(--accent-color)", 
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}>
            {sortedTutorials.length === 0 ? (
              <div className="text-center py-5">
                <i className="fas fa-inbox fa-3x mb-3" style={{ color: "var(--accent-color)", opacity: 0.5 }}></i>
                <p style={{ color: "var(--text-color)", fontSize: "1.05rem" }}>No games created yet</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table admin-dashboard-table mb-0">
                  <thead style={{ backgroundColor: "var(--primary-color)" }}>
                    <tr>
                      <th>Game Title</th>
                      <th>Category</th>
                      <th>Difficulty</th>
                      <th>Duration</th>
                      <th>Players</th>
                      <th>Rating</th>
                      <th>Views</th>
                      <th>Status</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedTutorials.map((tutorial, index) => (
                      <tr key={tutorial.id || index} style={{ opacity: tutorial.status === "draft" ? 0.75 : 1 }}>
                        <td>
                          <strong>{tutorial.title}</strong>
                          <div style={{ fontSize: "1.5rem" }}>{tutorial.thumbnail}</div>
                        </td>
                        <td>
                          <span style={{ 
                            backgroundColor: "var(--primary-color)", 
                            padding: "0.3rem 0.6rem", 
                            borderRadius: "4px", 
                            fontSize: "0.85rem",
                            display: "inline-block"
                          }}>
                            {tutorial.category}
                          </span>
                        </td>
                        <td>
                          <span style={{ textTransform: "capitalize", fontWeight: "500" }}>
                            {tutorial.difficulty || "N/A"}
                          </span>
                        </td>
                        <td>{tutorial.duration || "N/A"}</td>
                        <td>
                          <strong style={{ color: "var(--info-color)" }}>{tutorial.players || 0}</strong>
                        </td>
                        <td>
                          <span style={{ color: "#ffc107", fontWeight: "bold", fontSize: "0.95rem" }}>
                            {(tutorial.rating || 0).toFixed(1)} ⭐
                          </span>
                        </td>
                        <td>
                          <i className="fas fa-eye me-1" style={{ color: "var(--accent-color)" }}></i>
                          <strong>{tutorial.views || 0}</strong>
                        </td>
                        <td>
                          <span 
                            className={`badge ${tutorial.status === "published" ? "bg-success" : "bg-secondary"}`}
                            style={{ fontSize: "0.85rem" }}
                          >
                            {tutorial.status === "published" ? "✓ Published" : "📝 Draft"}
                          </span>
                        </td>
                        <td style={{ textAlign: "end" }}>
                          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", justifyContent: "flex-end" }}>
                            <button 
                              className="btn admin-action-btn"
                              title="View Game"
                              onClick={() => {
                                setSelectedTutorial(tutorial);
                                setShowViewModal(true);
                              }}
                            >
                              <FaEye />
                            </button>
                            {/* Edit Button - Creator Only */}
                            <button 
                              className="btn admin-action-btn"
                              title={isCreator(tutorial) ? "Edit Game" : "You can only edit your own games"}
                              onClick={() => isCreator(tutorial) ? alert("Edit game feature coming soon") : null}
                              style={{
                                opacity: isCreator(tutorial) ? 1 : 0.3,
                                cursor: isCreator(tutorial) ? "pointer" : "not-allowed"
                              }}
                              disabled={!isCreator(tutorial)}
                            >
                              <FaEdit />
                            </button>
                            {/* Delete Button - Creator Only */}
                            <button 
                              className="btn admin-action-btn"
                              title={isCreator(tutorial) ? "Delete Game" : "You can only delete your own games"}
                              onClick={() => isCreator(tutorial) ? alert("Delete game feature coming soon") : null}
                              style={{
                                opacity: isCreator(tutorial) ? 1 : 0.3,
                                cursor: isCreator(tutorial) ? "pointer" : "not-allowed"
                              }}
                              disabled={!isCreator(tutorial)}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* View Tutorial Modal */}
      {showViewModal && selectedTutorial && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2000,
          padding: "1rem"
        }}>
          <div style={{
            backgroundColor: "var(--secondary-color)",
            borderRadius: "12px",
            border: "2px solid var(--accent-color)",
            padding: "2rem",
            maxWidth: "600px",
            maxHeight: "90vh",
            overflowY: "auto",
            width: "100%"
          }}>
            {/* Close button */}
            <button
              onClick={() => setShowViewModal(false)}
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                background: "none",
                border: "none",
                fontSize: "1.5rem",
                color: "var(--accent-color)",
                cursor: "pointer"
              }}
            >
              ✕
            </button>

            {/* Modal Content */}
            <div style={{ marginBottom: "1rem" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
                {selectedTutorial.thumbnail}
              </div>
              <h3 style={{ color: "var(--text-color)", marginBottom: "0.5rem", fontWeight: "bold" }}>
                {selectedTutorial.title}
              </h3>
              <p style={{ color: "var(--text-color)", opacity: 0.8, marginBottom: "1rem" }}>
                {selectedTutorial.description}
              </p>
            </div>

            {/* Details Grid */}
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "1fr 1fr", 
              gap: "1rem",
              marginBottom: "1.5rem"
            }}>
              <div style={{ 
                backgroundColor: "var(--primary-color)", 
                padding: "1rem", 
                borderRadius: "8px" 
              }}>
                <h6 style={{ color: "var(--accent-color)", fontSize: "0.85rem", marginBottom: "0.5rem" }}>Category</h6>
                <p style={{ color: "var(--text-color)", fontWeight: "bold", marginBottom: 0 }}>
                  {selectedTutorial.category}
                </p>
              </div>
              <div style={{ 
                backgroundColor: "var(--primary-color)", 
                padding: "1rem", 
                borderRadius: "8px" 
              }}>
                <h6 style={{ color: "var(--accent-color)", fontSize: "0.85rem", marginBottom: "0.5rem" }}>Difficulty</h6>
                <p style={{ color: "var(--text-color)", fontWeight: "bold", marginBottom: 0, textTransform: "capitalize" }}>
                  {selectedTutorial.difficulty}
                </p>
              </div>
              <div style={{ 
                backgroundColor: "var(--primary-color)", 
                padding: "1rem", 
                borderRadius: "8px" 
              }}>
                <h6 style={{ color: "var(--accent-color)", fontSize: "0.85rem", marginBottom: "0.5rem" }}>Duration</h6>
                <p style={{ color: "var(--text-color)", fontWeight: "bold", marginBottom: 0 }}>
                  {selectedTutorial.duration}
                </p>
              </div>
              <div style={{ 
                backgroundColor: "var(--primary-color)", 
                padding: "1rem", 
                borderRadius: "8px" 
              }}>
                <h6 style={{ color: "var(--accent-color)", fontSize: "0.85rem", marginBottom: "0.5rem" }}>Rating</h6>
                <p style={{ color: "#ffc107", fontWeight: "bold", marginBottom: 0 }}>
                  {(selectedTutorial.rating || 0).toFixed(1)} ⭐
                </p>
              </div>
              <div style={{ 
                backgroundColor: "var(--primary-color)", 
                padding: "1rem", 
                borderRadius: "8px" 
              }}>
                <h6 style={{ color: "var(--accent-color)", fontSize: "0.85rem", marginBottom: "0.5rem" }}>Views</h6>
                <p style={{ color: "var(--text-color)", fontWeight: "bold", marginBottom: 0 }}>
                  {selectedTutorial.views || 0}
                </p>
              </div>
              <div style={{ 
                backgroundColor: "var(--primary-color)", 
                padding: "1rem", 
                borderRadius: "8px" 
              }}>
                <h6 style={{ color: "var(--accent-color)", fontSize: "0.85rem", marginBottom: "0.5rem" }}>Players</h6>
                <p style={{ color: "var(--text-color)", fontWeight: "bold", marginBottom: 0 }}>
                  {selectedTutorial.players || 0}
                </p>
              </div>
            </div>

            {/* Questions Preview */}
            <div style={{ 
              backgroundColor: "var(--primary-color)", 
              padding: "1rem", 
              borderRadius: "8px",
              marginBottom: "1.5rem"
            }}>
              <h6 style={{ color: "var(--accent-color)", marginBottom: "1rem", fontWeight: "bold" }}>
                Questions ({selectedTutorial.questions?.length || 0})
              </h6>
              {selectedTutorial.questions?.slice(0, 3).map((q, idx) => (
                <div key={idx} style={{ marginBottom: "0.75rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--accent-color)" }}>
                  <p style={{ color: "var(--text-color)", fontSize: "0.9rem", marginBottom: "0.3rem" }}>
                    <strong>Q{idx + 1}:</strong> {q.text}
                  </p>
                  <p style={{ color: "var(--text-color)", opacity: 0.7, fontSize: "0.85rem", marginBottom: 0 }}>
                    Options: {q.options.length} • Correct: #{q.correct + 1}
                  </p>
                </div>
              ))}
              {(selectedTutorial.questions?.length || 0) > 3 && (
                <p style={{ color: "var(--accent-color)", fontSize: "0.85rem", marginBottom: 0 }}>
                  ... and {selectedTutorial.questions.length - 3} more questions
                </p>
              )}
            </div>

            {/* Made by */}
            <div style={{ 
              backgroundColor: "var(--primary-color)", 
              padding: "1rem", 
              borderRadius: "8px",
              marginBottom: "1.5rem",
              border: isCreator(selectedTutorial) ? "2px solid var(--accent-color)" : "none"
            }}>
              <h6 style={{ color: "var(--accent-color)", marginBottom: "0.5rem", fontWeight: "bold" }}>
                Created By {isCreator(selectedTutorial) && "👤 (You)"}
              </h6>
              <p style={{ color: "var(--text-color)", marginBottom: "0.3rem" }}>
                {selectedTutorial.maker || "Creator"}
              </p>
              {isCreator(selectedTutorial) && selectedTutorial.creatorEmail && (
                <p style={{ color: "var(--text-color)", opacity: 0.7, fontSize: "0.85rem", marginBottom: 0 }}>
                  {selectedTutorial.creatorEmail}
                </p>
              )}
            </div>

            {/* Status Badge */}
            <div style={{ 
              backgroundColor: selectedTutorial.status === "published" ? "rgba(40, 167, 69, 0.1)" : "rgba(108, 117, 125, 0.1)",
              border: `2px solid ${selectedTutorial.status === "published" ? "var(--success-color)" : "var(--neutral-color)"}`,
              padding: "1rem", 
              borderRadius: "8px"
            }}>
              <span 
                className={`badge ${selectedTutorial.status === "published" ? "bg-success" : "bg-secondary"}`}
                style={{ fontSize: "0.95rem" }}
              >
                {selectedTutorial.status === "published" ? "✓ Published" : "📝 Draft"}
              </span>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowViewModal(false)}
              style={{
                width: "100%",
                marginTop: "1.5rem",
                padding: "0.75rem 1rem",
                backgroundColor: "var(--primary-color)",
                border: "2px solid var(--accent-color)",
                color: "var(--text-color)",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "var(--accent-color)";
                e.target.style.color = "var(--primary-color)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "var(--primary-color)";
                e.target.style.color = "var(--text-color)";
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}