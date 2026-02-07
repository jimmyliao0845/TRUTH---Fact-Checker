import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  FaBars,
  FaPlay,
  FaTrophy,
  FaArrowLeft,
  FaSearch,
  FaClock,
  FaStar,
  FaBriefcase,
} from "react-icons/fa";
import "./styles.css";
import "./analysis.css";
import GameFinder from "./GameFinder";
import GameScreen from "./GameScreen";
import GameResult from "./GameResult";
import GamesList from "./GamesList";

export default function GamePage() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [gameInProgress, setGameInProgress] = useState(false);
  const [showGameFinder, setShowGameFinder] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [gamesPlayedToday, setGamesPlayedToday] = useState(0);
  const [timingData, setTimingData] = useState(null);

  // Auth check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) navigate("/login");
    });
    return () => unsubscribe();
  }, [navigate]);

  // Load daily games count from localStorage
  useEffect(() => {
    const today = new Date().toDateString();
    const lastDate = localStorage.getItem("lastGamePlayDate");
    const count = localStorage.getItem("gamesPlayedToday");

    // Reset if it's a new day
    if (lastDate !== today) {
      localStorage.setItem("lastGamePlayDate", today);
      localStorage.setItem("gamesPlayedToday", "0");
      setGamesPlayedToday(0);
    } else {
      setGamesPlayedToday(parseInt(count || "0"));
    }
  }, []);

  // Start game
  const handleStartGame = (game) => {
    // Check daily limit
    if (gamesPlayedToday >= 5) {
      alert("❌ You've reached your 5-game daily limit! Come back tomorrow to play more.");
      return;
    }

    setSelectedGame(game);
    setCurrentQuestion(0);
    setScore(0);
    setGameInProgress(true);
    setGameCompleted(false);
    setPointsEarned(0);
    setTimingData(null);
  };

  // Answer question with timing data
  const handleAnswerQuestion = (selectedOption, timing) => {
    const question = selectedGame.questions[currentQuestion];
    const isCorrect = selectedOption === question.correct;
    
    if (isCorrect) {
      setScore(score + 1);
    }

    // Store timing data for final points calculation
    if (timing) {
      setTimingData(timing);
    }

    if (currentQuestion < selectedGame.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Game finished - calculate total points
      calculateGamePoints(score + (isCorrect ? 1 : 0), timing);
      setGameInProgress(false);
      setGameCompleted(true);
    }
  };

  // Calculate game points based on difficulty, correct answers, and time
  const calculateGamePoints = (finalScore, finalTiming) => {
    const difficulty = selectedGame.difficulty;
    const totalQuestions = selectedGame.questions.length;
    
    // Difficulty multiplier: easy=1, medium=3, hard=5
    const difficultyMultiplier = difficulty === "beginner" ? 1 : difficulty === "intermediate" ? 3 : 5;
    
    // Correct answers ratio (0-1)
    const correctRatio = finalScore / totalQuestions;
    
    // Time bonus (0-1, based on if they finished before time ran out)
    const timeBonus = finalTiming?.timeBonus || 0.5;
    
    // Points formula: (100 to 1000 based on difficulty and performance)
    // Min = 200, Max = 1000
    const basePoints = 200 + (correctRatio * 600) + (timeBonus * 200) + (difficultyMultiplier * 100);
    const finalPoints = Math.min(Math.max(Math.round(basePoints), 200), 1000);
    
    setPointsEarned(finalPoints);
    
    // Update daily games count and total points
    const newCount = gamesPlayedToday + 1;
    localStorage.setItem("gamesPlayedToday", newCount.toString());
    setGamesPlayedToday(newCount);
  };

  // Play again
  const handlePlayAgain = () => {
    setCurrentQuestion(0);
    setScore(0);
    setGameInProgress(true);
    setGameCompleted(false);
  };

  // If showing game finder with category, show without sidebar
  if (showGameFinder && selectedCategory) {
    return (
      <GameFinder
        category={selectedCategory}
        onSelectGame={handleStartGame}
        onBack={() => {
          setShowGameFinder(false);
          setSelectedCategory(null);
        }}
      />
    );
  }

  // If game is in progress or completed, show without sidebar
  if (gameInProgress || gameCompleted) {
    return (
      <div style={{ paddingTop: "56px", backgroundColor: "var(--primary-color)", minHeight: "100vh", color: "var(--text-color)" }}>
        <div
          className="flex-grow-1 d-flex flex-column"
          style={{
            minHeight: "calc(100vh - 56px)",
            padding: "2rem",
            backgroundColor: "var(--primary-color)",
            color: "var(--text-color)"
          }}
        >
          {gameInProgress && (
            <GameScreen
              selectedGame={selectedGame}
              currentQuestion={currentQuestion}
              onAnswerQuestion={handleAnswerQuestion}
            />
          )}

          {gameCompleted && (
            <GameResult
              selectedGame={selectedGame}
              score={score}
              pointsEarned={pointsEarned}
              totalQuestions={selectedGame.questions.length}
              gamesPlayedToday={gamesPlayedToday}
              onPlayAgain={handlePlayAgain}
              onReturnHome={() => {
                setGameCompleted(false);
                setSelectedGame(null);
                setShowGameFinder(false);
                setSelectedCategory(null);
              }}
            />
          )}
        </div>

        <style>
          {`
            @keyframes fadeIn {
              from {
                opacity: 0;
              }
              to {
                opacity: 1;
              }
            }
          `}
        </style>
      </div>
    );
  }

  // If showing game finder, show without sidebar
  if (showGameFinder) {
    return (
      <GameFinder
        onSelectGame={handleStartGame}
        onBack={() => setShowGameFinder(false)}
      />
    );
  }

  // Main game selection page with sidebar
  return (
    <div className="d-flex" style={{ paddingTop: "56px", backgroundColor: "var(--primary-color)", minHeight: "100vh", color: "var(--text-color)" }}>
      {/* Sidebar */}
      <div 
        className="d-flex flex-column p-3 border-end"
        style={{
          width: collapsed ? "80px" : "200px",
          backgroundColor: "var(--secondary-color)",
          transition: "width 0.3s ease",
          height: "calc(100vh - 56px)",
          position: "fixed",
          top: "56px",
          left: 0,
          overflowY: "auto",
          boxShadow: "2px 0 10px rgba(0,0,0,0.3)",
          borderRight: `2px solid var(--accent-color)`
        }}
      >
        <div className="d-flex align-items-center justify-content-between mb-3">
          <button
            className="btn btn-sm"
            onClick={() => setCollapsed(!collapsed)}
            style={{ 
              border: "none",
              backgroundColor: "var(--accent-color)",
              color: "var(--primary-color)",
              padding: "6px 10px",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            <FaBars />
          </button>
        </div>
        
        {!collapsed && (
          <div className="white-box p-3 mt-3">
            <div style={{ fontSize: "0.85rem", opacity: 0.8 }}>🎮 Games Hub</div>
            <div style={{ fontSize: "0.75rem", marginTop: "8px", opacity: 0.6 }}>Learn by playing interactive games</div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="d-flex flex-column gap-3 mt-4">
          <button 
            className="btn btn-link text-decoration-none d-flex align-items-center p-2"
            onClick={() => navigate("/analysis-logged")}
            style={{ 
              transition: "all 0.2s",
              color: "var(--text-color)",
              borderRadius: "6px",
              fontSize: "0.95rem",
              fontWeight: "500"
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
            <FaArrowLeft size={18} />
            {!collapsed && <span className="ms-3">Back to Analysis</span>}
          </button>

          <button 
            className="btn btn-link text-decoration-none d-flex align-items-center p-2"
            onClick={() => navigate("/general-user-profile")}
            style={{ 
              color: "var(--text-color)",
              borderRadius: "6px",
              fontSize: "0.95rem",
              fontWeight: "500"
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
            <FaTrophy size={18} />
            {!collapsed && <span className="ms-3">My Stats</span>}
          </button>

          <button 
            className="btn btn-link text-decoration-none d-flex align-items-center p-2"
            onClick={() => navigate("/factcheckerdashboard")}
            style={{ 
              color: "var(--text-color)",
              borderRadius: "6px",
              fontSize: "0.95rem",
              fontWeight: "500"
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
            <FaBriefcase size={18} />
            {!collapsed && <span className="ms-3">Professional Dashboard</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div
        className="flex-grow-1 d-flex flex-column"
        style={{
          marginLeft: collapsed ? "80px" : "200px",
          transition: "margin-left 0.3s ease",
          minHeight: "calc(100vh - 56px)",
          padding: "2rem",
          backgroundColor: "var(--primary-color)",
          color: "var(--text-color)"
        }}
      >
        {/* Header Section */}
        <div className="text-center mb-5" style={{ animation: "fadeIn 0.6s ease-in" }}>
          <h1 className="fw-bold" style={{ fontSize: "2.5rem", color: "var(--text-color)" }}>
            🎮 Learning Games
          </h1>
          <p style={{ color: "var(--text-color)", fontSize: "1.1rem", fontWeight: "500", marginTop: "12px" }}>
            Master fact-checking through interactive challenges
          </p>
        </div>

        {/* Game Categories */}
        <div 
          className="rounded-4 p-5 mb-5 shadow-lg"
          style={{
            maxWidth: "800px",
            width: "100%",
            margin: "0 auto 2rem",
            backgroundColor: "var(--secondary-color)",
            border: "2px solid var(--accent-color)",
            boxShadow: "0 8px 30px rgba(255, 107, 107, 0.2)"
          }}
        >
          <h4 style={{ color: "var(--text-color)", marginBottom: "32px", textAlign: "center", fontWeight: "700" }}>
            Explore Game Categories
          </h4>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            {[
              { id: "image", name: "Image Games", icon: "🖼️", description: "Identify AI & fake images" },
              { id: "text", name: "Text Games", icon: "📰", description: "Detect misinformation" },
              { id: "video", name: "Video Games", icon: "🎬", description: "Spot deepfakes" },
              { id: "audio", name: "Audio Games", icon: "🎙️", description: "Verify audio content" },
              { id: "media", name: "Media Forensics", icon: "🔍", description: "Advanced analysis" },
              { id: "mixed", name: "Mixed Challenge", icon: "🎯", description: "All types combined" },
            ].map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setShowGameFinder(true);
                }}
                style={{
                  padding: "24px",
                  backgroundColor: "var(--primary-color)",
                  color: "var(--text-color)",
                  border: `2px solid var(--accent-color)`,
                  borderRadius: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  textAlign: "center"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--accent-color)";
                  e.currentTarget.style.color = "white";
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(255, 107, 107, 0.3)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--primary-color)";
                  e.currentTarget.style.color = "var(--text-color)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>{category.icon}</div>
                <h6 style={{ marginBottom: "8px", fontWeight: "700" }}>{category.name}</h6>
                <p style={{ fontSize: "0.85rem", opacity: 0.8, marginBottom: 0 }}>{category.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CSS for animations */}
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        `}
      </style>
    </div>
  );
}
