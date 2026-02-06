import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  FaBars,
  FaPlay,
  FaTrophy,
  FaStar,
  FaArrowLeft,
  FaSearch,
  FaClock,
} from "react-icons/fa";
import "./FactCheckerDashboard.css";

export default function GamePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [gameInProgress, setGameInProgress] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLevel, setFilterLevel] = useState("all");

  // Auth check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) navigate("/login");
    });
    return () => unsubscribe();
  }, [navigate]);

  // Available games
  const [games] = useState([
    {
      id: 1,
      title: "Real vs Fake Images",
      description: "Identify AI-generated images from real photographs",
      difficulty: "beginner",
      duration: "10 mins",
      questions: 10,
      rating: 4.8,
      players: 1250,
      thumbnail: "🖼️",
      questions: [
        {
          id: 1,
          image: "https://via.placeholder.com/400x300?text=Image+1",
          options: ["AI-Generated", "Real Photo"],
          correct: 0,
        },
        {
          id: 2,
          image: "https://via.placeholder.com/400x300?text=Image+2",
          options: ["AI-Generated", "Real Photo"],
          correct: 1,
        },
      ],
    },
    {
      id: 2,
      title: "Truth or Misinformation",
      description: "Identify misleading or false information in text",
      difficulty: "intermediate",
      duration: "15 mins",
      questions: 15,
      rating: 4.6,
      players: 890,
      thumbnail: "📰",
      questions: [
        {
          id: 1,
          text: "The Earth is flat.",
          options: ["True", "False"],
          correct: 1,
        },
        {
          id: 2,
          text: "Vaccines are safe and effective.",
          options: ["True", "False"],
          correct: 0,
        },
      ],
    },
    {
      id: 3,
      title: "Media Forensics 101",
      description: "Learn techniques for identifying manipulated media",
      difficulty: "advanced",
      duration: "20 mins",
      questions: 20,
      rating: 4.9,
      players: 650,
      thumbnail: "🔍",
      questions: [
        {
          id: 1,
          text: "What is digital watermarking?",
          options: [
            "A visible logo on images",
            "Hidden information embedded in digital media",
            "A physical mark on paper",
            "None of the above",
          ],
          correct: 1,
        },
      ],
    },
    {
      id: 4,
      title: "Deepfake Detection",
      description: "Spot deepfakes and manipulated videos",
      difficulty: "advanced",
      duration: "25 mins",
      questions: 12,
      rating: 4.7,
      players: 520,
      thumbnail: "🎬",
      questions: [
        {
          id: 1,
          text: "Deepfakes are typically identified by examining eye movements. True or False?",
          options: ["True", "False"],
          correct: 0,
        },
      ],
    },
  ]);

  // Filter games
  const filteredGames = games.filter((game) => {
    const matchesSearch = game.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterLevel === "all" || game.difficulty === filterLevel;
    return matchesSearch && matchesFilter;
  });

  // Start game
  const handleStartGame = (game) => {
    setSelectedGame(game);
    setCurrentQuestion(0);
    setScore(0);
    setGameInProgress(true);
  };

  // Answer question
  const handleAnswerQuestion = (selectedOption) => {
    const question = selectedGame.questions[currentQuestion];
    if (selectedOption === question.correct) {
      setScore(score + 1);
    }

    if (currentQuestion < selectedGame.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Game finished
      handleGameFinish();
    }
  };

  // Finish game
  const handleGameFinish = () => {
    setGameInProgress(false);
  };

  // Calculate accuracy
  const accuracy = selectedGame
    ? ((score / selectedGame.questions.length) * 100).toFixed(1)
    : 0;

  return (
    <div className="d-flex" style={{ backgroundColor: "var(--secondary-color)", paddingTop: "56px" }}>
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

        <ul className="nav flex-column">
          <li>
            <button
              className={`btn sidebar-btn text-start ${location.pathname === "/game-page" ? "active" : ""}`}
              onClick={() => location.pathname !== "/game-page" && setSelectedGame(null)}
              disabled={location.pathname === "/game-page"}
            >
              <FaPlay className="me-2" />
              {!collapsed && "Games"}
            </button>
          </li>
          <li>
            <button
              className={`btn sidebar-btn text-start ${location.pathname === "/general-user-profile" ? "active" : ""}`}
              onClick={() => navigate("/general-user-profile")}
              disabled={location.pathname === "/general-user-profile"}
            >
              <FaTrophy className="me-2" />
              {!collapsed && "My Stats"}
            </button>
          </li>
          <li className="mt-4 border-top pt-2">
            <button
              className={`btn sidebar-btn text-start ${location.pathname === "/analysis-logged" ? "active" : ""}`}
              onClick={() => navigate("/analysis-logged")}
              disabled={location.pathname === "/analysis-logged"}
            >
              <FaArrowLeft className="me-2" />
              {!collapsed && "Back to Analysis"}
            </button>
          </li>
        </ul>

        {!collapsed && (
          <div className="mt-auto small text-muted">
            Learning Games Portal
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
            {gameInProgress ? "Game in Progress" : "Learning Games"}
          </h5>
          {!gameInProgress && (
            <div style={{ width: 300 }}>
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <FaSearch />
                </span>
                <input
                  className="form-control"
                  placeholder="Search games..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          )}
        </nav>

        {/* CONTENT */}
        <div className="p-4">
          {!gameInProgress ? (
            <div className="container-fluid">
              {/* Filters */}
              <div className="mb-4">
                <div className="btn-group" role="group">
                  <button
                    type="button"
                    className={`btn ${
                      filterLevel === "all"
                        ? "btn-primary"
                        : "btn-outline-primary"
                    }`}
                    onClick={() => setFilterLevel("all")}
                  >
                    All Levels
                  </button>
                  <button
                    type="button"
                    className={`btn ${
                      filterLevel === "beginner"
                        ? "btn-primary"
                        : "btn-outline-primary"
                    }`}
                    onClick={() => setFilterLevel("beginner")}
                  >
                    Beginner
                  </button>
                  <button
                    type="button"
                    className={`btn ${
                      filterLevel === "intermediate"
                        ? "btn-primary"
                        : "btn-outline-primary"
                    }`}
                    onClick={() => setFilterLevel("intermediate")}
                  >
                    Intermediate
                  </button>
                  <button
                    type="button"
                    className={`btn ${
                      filterLevel === "advanced"
                        ? "btn-primary"
                        : "btn-outline-primary"
                    }`}
                    onClick={() => setFilterLevel("advanced")}
                  >
                    Advanced
                  </button>
                </div>
              </div>

              {/* Games Grid */}
              <div className="row">
                {filteredGames.map((game) => (
                  <div key={game.id} className="col-md-6 col-lg-4 mb-4">
                    <div className="card shadow-sm h-100">
                      <div
                        className="card-body d-flex flex-column"
                        style={{
                          backgroundColor:
                            game.difficulty === "beginner"
                              ? "#e7f3ff"
                              : game.difficulty === "intermediate"
                              ? "#fff3cd"
                              : "#f8d7da",
                        }}
                      >
                        <div style={{ fontSize: "48px" }} className="mb-3">
                          {game.thumbnail}
                        </div>
                        <h5 className="card-title">{game.title}</h5>
                        <p className="card-text text-muted small">
                          {game.description}
                        </p>

                        <div className="mb-3">
                          <div className="d-flex gap-2 mb-2">
                            <span className="badge bg-info">
                              {game.difficulty}
                            </span>
                            <span className="badge bg-secondary">
                              <FaClock className="me-1" />
                              {game.duration}
                            </span>
                          </div>

                          <div className="d-flex justify-content-between small text-muted">
                            <span>
                              <FaStar className="me-1 text-warning" />
                              {game.rating}
                            </span>
                            <span>{game.players} players</span>
                          </div>
                        </div>

                        <button
                          className="btn btn-primary mt-auto"
                          onClick={() => handleStartGame(game)}
                        >
                          <FaPlay className="me-2" />
                          Play Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredGames.length === 0 && (
                <div className="alert alert-info">
                  No games found matching your filters.
                </div>
              )}
            </div>
          ) : (
            // Game Screen
            <div className="container">
              <div className="row">
                <div className="col-lg-8 offset-lg-2">
                  <div className="card shadow-sm">
                    <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">{selectedGame.title}</h5>
                      <div>
                        <span className="badge bg-light text-dark">
                          Question {currentQuestion + 1} of{" "}
                          {selectedGame.questions.length}
                        </span>
                      </div>
                    </div>

                    <div className="card-body">
                      {/* Progress Bar */}
                      <div className="progress mb-4" style={{ height: "25px" }}>
                        <div
                          className="progress-bar"
                          style={{
                            width: `${
                              ((currentQuestion + 1) /
                                selectedGame.questions.length) *
                              100
                            }%`,
                          }}
                        >
                          {Math.round(
                            ((currentQuestion + 1) /
                              selectedGame.questions.length) *
                              100
                          )}
                          %
                        </div>
                      </div>

                      {/* Question */}
                      <div className="mb-4">
                        {selectedGame.questions[currentQuestion].image && (
                          <img
                            src={
                              selectedGame.questions[currentQuestion].image
                            }
                            alt="Question"
                            className="img-fluid mb-3 rounded"
                          />
                        )}
                        {selectedGame.questions[currentQuestion].text && (
                          <h6 className="mb-3">
                            {selectedGame.questions[currentQuestion].text}
                          </h6>
                        )}
                      </div>

                      {/* Options */}
                      <div className="gap-3">
                        {selectedGame.questions[currentQuestion].options.map(
                          (option, idx) => (
                            <button
                              key={idx}
                              className="btn btn-outline-primary w-100 mb-2"
                              onClick={() => handleAnswerQuestion(idx)}
                              style={{ padding: "12px" }}
                            >
                              {option}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Game Complete Screen */}
          {!gameInProgress && selectedGame && currentQuestion > 0 && (
            <div className="container mt-5">
              <div className="row">
                <div className="col-lg-6 offset-lg-3">
                  <div className="card shadow-lg text-center">
                    <div
                      className="card-body"
                      style={{ padding: "40px" }}
                    >
                      <div style={{ fontSize: "64px" }} className="mb-3">
                        🎉
                      </div>
                      <h4>Game Complete!</h4>
                      <div className="my-4">
                        <p style={{ fontSize: "24px" }}>
                          <strong>Score: {score}/{selectedGame.questions.length}</strong>
                        </p>
                        <p style={{ fontSize: "20px" }} className="text-muted">
                          Accuracy: <strong>{accuracy}%</strong>
                        </p>
                      </div>

                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-primary flex-grow-1"
                          onClick={() => {
                            setSelectedGame(null);
                            setCurrentQuestion(0);
                            setScore(0);
                          }}
                        >
                          Play Again
                        </button>
                        <button
                          className="btn btn-outline-primary flex-grow-1"
                          onClick={() =>
                            navigate("/general-user-profile")
                          }
                        >
                          View Stats
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
