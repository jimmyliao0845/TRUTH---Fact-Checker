import React, { useEffect, useState } from "react";
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
  FaSave,
  FaUpload,
  FaCloudUploadAlt,
  FaArrowLeft,
} from "react-icons/fa";

/**
 * CreateTutorial.jsx (Game Creator for GamePage)
 * Professionals create fact-checking/learning games that appear in GameFinder
 * Games are published to localStorage "published_games_v1"
 */

export default function CreateTutorialFull() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // Game categories
  const GAME_CATEGORIES = [
    { id: "image", name: "Image Games", icon: "🖼️" },
    { id: "text", name: "Text Games", icon: "📰" },
    { id: "video", name: "Video Games", icon: "🎬" },
    { id: "audio", name: "Audio Games", icon: "🎙️" },
    { id: "media", name: "Media Forensics", icon: "🔍" },
    { id: "mixed", name: "Mixed Challenge", icon: "🎯" },
  ];

  const DIFFICULTY_LEVELS = ["beginner", "intermediate", "advanced"];

  // Auth guard and get user info
  const [currentUser, setCurrentUser] = useState(null);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
      } else {
        setCurrentUser(user);
        // Auto-populate maker field with user's display name or email
        setGame(prev => ({
          ...prev,
          maker: user.displayName || user.email || "Anonymous Creator",
          creatorId: user.uid,
          creatorEmail: user.email
        }));
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Game state
  const [game, setGame] = useState({
    id: null,
    title: "",
    description: "",
    category: "text",
    difficulty: "beginner",
    duration: "15 mins",
    thumbnail: "📚",
    maker: "",
    creatorId: null,
    creatorEmail: null,
    questions: Array.from({ length: 10 }).map(() => ({
      contentType: "text",
      text: "",
      image: null,
      imageUrl: "",
      options: ["", "", "", ""],
      correct: 0,
      explanation: "",
    })),
    status: "draft",
    createdAt: new Date().toISOString(),
  });

  // Load draft if exists
  useEffect(() => {
    const draft = JSON.parse(localStorage.getItem("game_draft_v1" || "null"));
    if (draft) setGame(draft);
  }, []);

  // Image upload handler
  const handleImageUpload = (idx, event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const url = URL.createObjectURL(file);
    const newQs = [...game.questions];
    newQs[idx] = { ...newQs[idx], image: file, imageUrl: url };
    setGame({ ...game, questions: newQs });
  };

  // Clear image for a question
  const clearImageUrlObject = (idx) => {
    const newQs = [...game.questions];
    if (newQs[idx].imageUrl) {
      URL.revokeObjectURL(newQs[idx].imageUrl);
    }
    newQs[idx] = { ...newQs[idx], image: null, imageUrl: "" };
    setGame({ ...game, questions: newQs });
  };

  // Save draft locally
  const saveDraft = () => {
    localStorage.setItem("game_draft_v1", JSON.stringify(game));
    alert("Game draft saved locally.");
  };

  // Validation before publish
  const validateBeforePublish = () => {
    if (!game.title.trim()) {
      alert("Please enter a game title.");
      return false;
    }

    if (!game.description.trim()) {
      alert("Please enter a game description.");
      return false;
    }

    // Check questions
    for (let i = 0; i < game.questions.length; i++) {
      const q = game.questions[i];
      if (!q.text.trim()) {
        alert(`Question ${i + 1}: Please enter question text.`);
        return false;
      }

      // Check all options are filled
      if (q.options.some((opt) => !opt.trim())) {
        alert(`Question ${i + 1}: Please fill all answer options.`);
        return false;
      }

      if (!q.explanation.trim()) {
        alert(`Question ${i + 1}: Please enter an explanation.`);
        return false;
      }
    }

    return true;
  };

  // Publish game
  const publishGame = () => {
    if (!validateBeforePublish()) {
      return;
    }

    const createdDateTime = new Date();
    const gameId = `game-${Date.now()}`;
    
    const publishPayload = {
      id: gameId,
      title: game.title,
      description: game.description,
      category: game.category,
      difficulty: game.difficulty,
      duration: game.duration,
      thumbnail: game.thumbnail,
      maker: game.maker,
      creatorId: currentUser?.uid,
      creatorEmail: currentUser?.email,
      questions: game.questions.map((q) => ({
        text: q.text,
        image: q.image,
        imageUrl: q.imageUrl,
        contentType: q.contentType,
        options: q.options,
        correct: q.correct,
        explanation: q.explanation,
      })),
      status: "published",
      createdAt: createdDateTime.toISOString(),
      createdDate: createdDateTime,
      rating: 4.5,
      players: 0,
      views: 0,
      featured: false
    };

    // Save to published games in localStorage (for GameFinder)
    const existing = JSON.parse(localStorage.getItem("published_games_v1") || "[]");
    existing.unshift(publishPayload);
    localStorage.setItem("published_games_v1", JSON.stringify(existing));
    
    // Save to admin games Created (for ManageTutorial with creator info)
    const adminGames = JSON.parse(localStorage.getItem("admin_games_created") || "[]");
    adminGames.unshift(publishPayload);
    localStorage.setItem("admin_games_created", JSON.stringify(adminGames));
    
    // Clear draft
    localStorage.removeItem("game_draft_v1");
    
    alert(`✅ Game "${game.title}" published successfully!\nIt will appear in the ${game.category} category on GameFinder and in Manage Games.`);
    
    // Reset form
    setGame({
      id: null,
      title: "",
      description: "",
      category: "text",
      difficulty: "beginner",
      duration: "15 mins",
      thumbnail: "📚",
      maker: currentUser?.displayName || currentUser?.email || "Anonymous Creator",
      creatorId: currentUser?.uid,
      creatorEmail: currentUser?.email,
      questions: Array.from({ length: 10 }).map(() => ({
        contentType: "text",
        text: "",
        image: null,
        imageUrl: "",
        options: ["", "", "", ""],
        correct: 0,
        explanation: "",
      })),
      status: "draft",
      createdAt: new Date().toISOString(),
    });
  };

  // Render
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
            className={`app-sidebar-item ${location.pathname === "/professional/create-tutorial" ? 'active' : ''}`}
            onClick={() => location.pathname !== "/professional/create-tutorial" && navigate("/professional/create-tutorial")}
            disabled={location.pathname === "/professional/create-tutorial"}
          >
            <FaPlusCircle size={20} />
            <span className="app-sidebar-label">Create Tutorial</span>
          </button>

          <button
            className="app-sidebar-item"
            onClick={() => navigate("/professional/manage-tutorial")}
          >
            <FaEdit size={20} />
            <span className="app-sidebar-label">Manage Tutorial</span>
          </button>

          <button
            className="app-sidebar-item"
            onClick={() => navigate("/professional/reports")}
          >
            <FaChartBar size={20} />
            <span className="app-sidebar-label">Organized Reports</span>
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
              <span className="app-sidebar-label">Go Back to Analysis</span>
            </button>
          </div>
        </div>

        {!collapsed && (
          <div className="mt-4 small" style={{ color: "var(--text-color)", opacity: 0.7 }}>
            Verified professionals workspace
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className={`app-main-content ${collapsed ? 'with-collapsed-sidebar' : ''}`}>
        <div className="container-fluid">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="fw-bold mb-0" style={{ color: "var(--text-color)" }}>Create Game</h2>
              <small style={{ color: "var(--text-color)", opacity: 0.7 }}>Build and publish games that will appear in GameFinder</small>
            </div>
            <div className="d-flex gap-2">
              <button 
                className="btn"
                onClick={saveDraft}
                style={{
                  backgroundColor: "var(--secondary-color)",
                  color: "var(--accent-color)",
                  border: `2px solid var(--accent-color)`,
                  borderRadius: "8px",
                  fontWeight: "600"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--accent-color)";
                  e.currentTarget.style.color = "var(--secondary-color)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--secondary-color)";
                  e.currentTarget.style.color = "var(--accent-color)";
                }}
              >
                <FaSave className="me-2" /> Save Draft
              </button>
              <button 
                className="btn"
                onClick={publishGame}
                style={{
                  backgroundColor: "var(--accent-color)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "600"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--primary-color)";
                  e.currentTarget.style.color = "var(--accent-color)";
                  e.currentTarget.style.border = `2px solid var(--accent-color)`;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--accent-color)";
                  e.currentTarget.style.color = "white";
                  e.currentTarget.style.border = "none";
                }}
              >
                <FaCloudUploadAlt className="me-2" /> Publish Game
              </button>
            </div>
          </div>

          {/* Game info card */}
          <div className="app-card">
            <h5 className="fw-semibold mb-3" style={{ color: "var(--accent-color)" }}>Game Information</h5>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Game Title</label>
                <input 
                  className="form-control" 
                  value={game.title} 
                  onChange={(e) => setGame({ ...game, title: e.target.value })}
                  placeholder="e.g., Real vs Fake Images Challenge"
                  style={{
                    backgroundColor: "var(--primary-color)",
                    borderColor: "var(--accent-color)",
                    color: "var(--text-color)"
                  }}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label fw-semibold">Category</label>
                <select 
                  className="form-select" 
                  value={game.category} 
                  onChange={(e) => setGame({ ...game, category: e.target.value })}
                  style={{
                    backgroundColor: "var(--primary-color)",
                    borderColor: "var(--accent-color)",
                    color: "var(--text-color)"
                  }}
                >
                  {GAME_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label fw-semibold">Difficulty</label>
                <select 
                  className="form-select" 
                  value={game.difficulty} 
                  onChange={(e) => setGame({ ...game, difficulty: e.target.value })}
                  style={{
                    backgroundColor: "var(--primary-color)",
                    borderColor: "var(--accent-color)",
                    color: "var(--text-color)"
                  }}
                >
                  {DIFFICULTY_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold">Game Description</label>
                <textarea 
                  className="form-control" 
                  rows={3} 
                  value={game.description} 
                  onChange={(e) => setGame({ ...game, description: e.target.value })}
                  placeholder="Describe the educational objective and gameplay..."
                  style={{
                    backgroundColor: "var(--primary-color)",
                    borderColor: "var(--accent-color)",
                    color: "var(--text-color)"
                  }}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Duration (minutes)</label>
                <input 
                  className="form-control" 
                  type="number" 
                  min="1"
                  value={game.duration.replace(' mins', '') || "15"} 
                  onChange={(e) => setGame({ ...game, duration: `${e.target.value} mins` })}
                  style={{
                    backgroundColor: "var(--primary-color)",
                    borderColor: "var(--accent-color)",
                    color: "var(--text-color)"
                  }}
                />
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="app-card">
            <h5 className="fw-semibold mb-3" style={{ color: "var(--accent-color)" }}>Questions ({game.questions.length})</h5>
            <p className="text-muted mb-4">Create multiple-choice questions for your game. Each question needs 4 options with one correct answer.</p>

            {game.questions.map((q, i) => (
              <div key={i} className="mb-4 p-3 border rounded" style={{ backgroundColor: "var(--primary-color)", borderLeft: "4px solid var(--accent-color)" }}>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <h6 className="mb-0" style={{ color: "var(--text-color)" }}>Question {i + 1}</h6>
                  {q.text && <span className="badge bg-success">Complete</span>}
                </div>

                {/* Question content */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Question Text</label>
                  <textarea 
                    className="form-control" 
                    rows={2}
                    value={q.text}
                    onChange={(e) => {
                      const newQs = [...game.questions];
                      newQs[i] = { ...newQs[i], text: e.target.value };
                      setGame({ ...game, questions: newQs });
                    }}
                    placeholder="Write your question here..."
                    style={{
                      backgroundColor: "var(--secondary-color)",
                      borderColor: "var(--accent-color)",
                      color: "var(--text-color)"
                    }}
                  />
                </div>

                {/* Content type toggle */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Content Type</label>
                  <div className="btn-group w-100" role="group">
                    <input 
                      type="radio" 
                      className="btn-check" 
                      name={`contentType-${i}`}
                      id={`text-${i}`}
                      value="text"
                      checked={q.contentType === "text"}
                      onChange={(e) => {
                        const newQs = [...game.questions];
                        newQs[i] = { ...newQs[i], contentType: "text", imageUrl: "" };
                        setGame({ ...game, questions: newQs });
                      }}
                    />
                    <label className="btn btn-outline-primary" htmlFor={`text-${i}`}>Text Only</label>

                    <input 
                      type="radio" 
                      className="btn-check" 
                      name={`contentType-${i}`}
                      id={`image-${i}`}
                      value="image"
                      checked={q.contentType === "image"}
                      onChange={(e) => {
                        const newQs = [...game.questions];
                        newQs[i] = { ...newQs[i], contentType: "image" };
                        setGame({ ...game, questions: newQs });
                      }}
                    />
                    <label className="btn btn-outline-primary" htmlFor={`image-${i}`}>With Image</label>
                  </div>
                </div>

                {/* Image upload for image-based questions */}
                {q.contentType === "image" && (
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Upload Image</label>
                    <input 
                      type="file" 
                      className="form-control"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(i, e)}
                      style={{
                        backgroundColor: "var(--secondary-color)",
                        borderColor: "var(--accent-color)",
                        color: "var(--text-color)"
                      }}
                    />
                    {q.imageUrl && (
                      <div className="mt-2">
                        <img 
                          src={q.imageUrl} 
                          alt={`Q${i+1}`}
                          style={{ maxWidth: "200px", borderRadius: "8px" }}
                        />
                        <button 
                          className="btn btn-sm btn-outline-danger ms-2"
                          onClick={() => clearImageUrlObject(i)}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Answer options */}
                <div className="mb-3">
                  <label className="form-label fw-semibold mb-2">Answer Options</label>
                  <div className="row g-2">
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} className="col-12">
                        <div className="input-group">
                          <input 
                            type="radio"
                            className="btn-check"
                            name={`correct-${i}`}
                            id={`correct-${i}-${optIdx}`}
                            checked={q.correct === optIdx}
                            onChange={() => {
                              const newQs = [...game.questions];
                              newQs[i] = { ...newQs[i], correct: optIdx };
                              setGame({ ...game, questions: newQs });
                            }}
                          />
                          <label 
                            className="btn btn-outline-secondary flex-shrink-0"
                            htmlFor={`correct-${i}-${optIdx}`}
                            style={{ minWidth: "50px" }}
                          >
                            {q.correct === optIdx ? "✓ Correct" : `Option ${optIdx + 1}`}
                          </label>
                          <input 
                            type="text"
                            className="form-control"
                            value={opt}
                            onChange={(e) => {
                              const newQs = [...game.questions];
                              newQs[i].options[optIdx] = e.target.value;
                              setGame({ ...game, questions: newQs });
                            }}
                            placeholder={`Enter option ${optIdx + 1}`}
                            style={{
                              backgroundColor: "var(--secondary-color)",
                              borderColor: "var(--accent-color)",
                              color: "var(--text-color)"
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Explanation */}
                <div>
                  <label className="form-label fw-semibold">Explanation (shown after answer)</label>
                  <textarea 
                    className="form-control"
                    rows={2}
                    value={q.explanation}
                    onChange={(e) => {
                      const newQs = [...game.questions];
                      newQs[i] = { ...newQs[i], explanation: e.target.value };
                      setGame({ ...game, questions: newQs });
                    }}
                    placeholder="Explain the correct answer to help players learn..."
                    style={{
                      backgroundColor: "var(--secondary-color)",
                      borderColor: "var(--accent-color)",
                      color: "var(--text-color)"
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Footer actions */}
          <div className="d-flex justify-content-between align-items-center">
            <div className="text-muted small">💡 Tip: Create clear questions with 4 distinct options for the best player experience.</div>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-outline-secondary"
                onClick={saveDraft}
                style={{
                  borderColor: "var(--accent-color)",
                  color: "var(--accent-color)"
                }}
              >
                <FaSave className="me-2" /> Save Draft
              </button>
              <button 
                className="btn"
                onClick={publishGame}
                style={{
                  backgroundColor: "var(--accent-color)",
                  color: "white"
                }}
              >
                <FaCloudUploadAlt className="me-2" /> Publish
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
