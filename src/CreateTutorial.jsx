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
import "./FactCheckerDashboard.css";

/**
 * CreateTutorial.jsx (Game & Tutorial Creator)
 * Full Create Game/Tutorial page with:
 * - Game info header with category selection
 * - Multiple choice question builder
 * - Content upload (text or image-based)
 * - Preview box
 * - Save draft / Publish buttons
 *
 * NOTE: Games created here will appear in GameFinder and GamesList
 */

export default function CreateTutorialFull() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // Game categories available
  const GAME_CATEGORIES = [
    { id: "image", name: "Image Games", icon: "🖼️" },
    { id: "text", name: "Text Games", icon: "📰" },
    { id: "video", name: "Video Games", icon: "🎬" },
    { id: "audio", name: "Audio Games", icon: "🎙️" },
    { id: "media", name: "Media Forensics", icon: "🔍" },
    { id: "mixed", name: "Mixed Challenge", icon: "🎯" },
  ];

  const DIFFICULTY_LEVELS = ["beginner", "intermediate", "advanced"];

  // Auth guard
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) navigate("/login");
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
    questions: Array.from({ length: 10 }).map(() => ({
      contentType: "text", // 'text' or 'image'
      text: "",
      image: null,
      imageUrl: "", // object URL for preview
      options: ["", "", "", ""],
      correct: 0,
      explanation: "",
    })),
    status: "draft",
    createdAt: new Date().toISOString(),
  });

  // modal control
  const [modalOpenIndex, setModalOpenIndex] = useState(null);

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

  // Publish game
  const publishGame = () => {
    const publishPayload = {
      ...game,
      id: `game-${Date.now()}`,
      status: "published",
      createdAt: new Date().toISOString(),
      rating: 4.5,
      players: 0,
      views: 0,
      questions: game.questions.map((q) => ({
        text: q.text,
        image: q.image,
        imageUrl: q.imageUrl,
        contentType: q.contentType,
        options: q.options,
        correct: q.correct,
        explanation: q.explanation,
      })),
    };

    // Save to published games in localStorage
    const existing = JSON.parse(localStorage.getItem("published_games_v1" || "[]"));
    existing.unshift(publishPayload);
    localStorage.setItem("published_games_v1", JSON.stringify(existing));
    
    // Clear draft
    localStorage.removeItem("game_draft_v1");
    
    alert(`✅ Game "${game.title}" published successfully!\nIt will appear in the ${game.category} category on GameFinder.`);
    
    // Reset form
    setGame({
      id: null,
      title: "",
      description: "",
      category: "text",
      difficulty: "beginner",
      duration: "15 mins",
      thumbnail: "📚",
      maker: "",
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

  // Render
  return (
    <div className="d-flex" style={{ backgroundColor: "var(--secondary-color)", paddingTop: "56px" }}>
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
          zIndex: 900
        }}
      >
        <div className="d-flex align-items-center justify-content-between mb-3">
          <button className="btn btn-outline-dark btn-sm" onClick={() => setCollapsed(!collapsed)} style={{ border: "none" }}>
            <FaBars />
          </button>
        </div>

        {/* Sidebar Menu */}
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
                      className={`btn sidebar-btn text-start ${location.pathname === "/professional/create-tutorial" ? "active" : ""}`}
                      onClick={() => location.pathname !== "/professional/create-tutorial" && navigate("/professional/create-tutorial")}
                      disabled={location.pathname === "/professional/create-tutorial"}
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
                      onClick={() => navigate("/professional/linked-users")}
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
        
                  {/* 🚀 NEW BUTTON: Go Back to Analysis Page */}
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
        <div className="container-fluid py-4 px-5" id="create-game">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="fw-bold mb-0">Create Game</h2>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary" onClick={saveDraft}>
                <FaSave className="me-2" /> Save Draft
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (validateBeforePublish()) publishGame();
                }}
              >
                Publish Game
              </button>
            </div>
          </div>

          {/* Game info card */}
          <div className="card shadow-sm p-4 mb-4" style={{ borderLeft: "4px solid var(--primary-color)" }}>
            <h5 className="fw-semibold mb-3">Game Information</h5>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Game Title</label>
                <input 
                  className="form-control" 
                  value={game.title} 
                  onChange={(e) => setGame({ ...game, title: e.target.value })}
                  placeholder="e.g., Real vs Fake Images Challenge"
                />
              </div>

              <div className="col-md-3">
                <label className="form-label fw-semibold">Category</label>
                <select 
                  className="form-select" 
                  value={game.category} 
                  onChange={(e) => setGame({ ...game, category: e.target.value })}
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
                />
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="card shadow-sm p-4 mb-4">
            <h5 className="fw-semibold mb-3">Questions ({game.questions.length})</h5>
            <p className="text-muted mb-4">Create multiple-choice questions for your game. Each question needs 4 options with one correct answer.</p>

            {game.questions.map((q, i) => (
              <div key={i} className="mb-4 p-3 border rounded" style={{ backgroundColor: "var(--secondary-color)", borderLeft: "4px solid var(--accent-color)" }}>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <h6 className="mb-0">Question {i + 1}</h6>
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
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Footer actions */}
          <div className="d-flex justify-content-between align-items-center">
            <div className="text-muted small">💡 Tip: Create clear questions with 4 distinct options for the best player experience.</div>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary" onClick={saveDraft}>
                <FaSave className="me-1" /> Save Draft
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (validateBeforePublish()) publishGame();
                }}
              >
                Publish Game
              </button>
            </div>
          </div>
        </div>
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
