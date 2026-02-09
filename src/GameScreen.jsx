import React, { useState, useEffect } from "react";
import { FaPlay, FaClock } from "react-icons/fa";

export default function GameScreen({ selectedGame, currentQuestion, onAnswerQuestion, onGameFinish }) {
  const [timeLeft, setTimeLeft] = useState(10);
  const [answered, setAnswered] = useState(false);
  const question = selectedGame.questions[currentQuestion];

  // 10-second timer per question
  useEffect(() => {
    setTimeLeft(10);
    setAnswered(false);
  }, [currentQuestion]);

  useEffect(() => {
    if (answered || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setAnswered(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, answered]);

  // Auto-advance when time runs out
  useEffect(() => {
    if (timeLeft === 0 && answered) {
      setTimeout(() => {
        onAnswerQuestion(null, { timeLeft: 0 }); // null = timeout
      }, 500);
    }
  }, [timeLeft, answered, onAnswerQuestion]);

  const handleAnswer = (optionIdx) => {
    if (answered) return;
    setAnswered(true);
    
    // Pass timing data for points calculation
    const difficulty = selectedGame.difficulty;
    const difficultyMultiplier = difficulty === "beginner" ? 1 : difficulty === "intermediate" ? 3 : 5;
    const timeBonus = timeLeft / 10; // 0-1 based on remaining time
    
    onAnswerQuestion(optionIdx, { 
      difficulty, 
      timeBonus, 
      timeLeft, 
      difficultyMultiplier 
    });
  };

  return (
    <div className="w-100" style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div 
        className="shadow-lg"
        style={{
          backgroundColor: "var(--secondary-color)",
          borderRadius: "16px",
          border: "2px solid var(--accent-color)",
          overflow: "hidden",
          boxShadow: "0 8px 30px rgba(255, 107, 107, 0.2)"
        }}
      >
        <div 
          style={{
            backgroundColor: "var(--accent-color)",
            color: "white",
            padding: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <h5 style={{ marginBottom: 0, fontWeight: "700", fontSize: "1.3rem" }}>
            {selectedGame.title}
          </h5>
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            {/* Timer */}
            <div
              style={{
                backgroundColor: timeLeft <= 3 ? "var(--accent-color)" : "rgba(255,255,255,0.2)",
                padding: "8px 16px",
                borderRadius: "20px",
                fontSize: "1.1rem",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <FaClock /> {timeLeft}s
            </div>
            {/* Question Counter */}
            <div
              style={{
                backgroundColor: "rgba(255,255,255,0.2)",
                padding: "8px 16px",
                borderRadius: "20px",
                fontSize: "0.9rem",
                fontWeight: "600"
              }}
            >
              {currentQuestion + 1} / {selectedGame.questions.length}
            </div>
          </div>
        </div>

        <div style={{ padding: "32px" }}>
          {/* Progress Bar */}
          <div style={{ marginBottom: "32px" }}>
            <div 
              style={{
                width: "100%",
                height: "25px",
                backgroundColor: "var(--secondary-color)",
                borderRadius: "12px",
                overflow: "hidden"
              }}
            >
              <div
                style={{
                  width: `${((currentQuestion + 1) / selectedGame.questions.length) * 100}%`,
                  height: "100%",
                  backgroundColor: "var(--accent-color)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "600",
                  fontSize: "0.85rem",
                  transition: "width 0.3s ease"
                }}
              >
                {Math.round(((currentQuestion + 1) / selectedGame.questions.length) * 100)}%
              </div>
            </div>
          </div>

          {/* Question */}
          <div style={{ marginBottom: "32px" }}>
            {question.image && (
              <img
                src={question.image}
                alt="Question"
                style={{ width: "100%", borderRadius: "12px", marginBottom: "20px" }}
              />
            )}
            {question.text && (
              <h6 style={{ color: "var(--text-color)", fontWeight: "600", fontSize: "1.2rem", marginBottom: "20px" }}>
                {question.text}
              </h6>
            )}
          </div>

          {/* Options */}
          <div space="3">
            {question.options.map((option, idx) => (
              <button
                key={idx}
                disabled={answered}
                style={{
                  width: "100%",
                  padding: "16px",
                  marginBottom: "12px",
                  border: `2px solid var(--accent-color)`,
                  backgroundColor: "var(--secondary-color)",
                  color: "var(--text-color)",
                  borderRadius: "12px",
                  fontWeight: "600",
                  cursor: answered ? "not-allowed" : "pointer",
                  opacity: answered ? 0.6 : 1,
                  transition: "all 0.2s"
                }}
                onClick={() => handleAnswer(idx)}
                onMouseOver={(e) => {
                  if (!answered) {
                    e.currentTarget.style.backgroundColor = "var(--accent-color)";
                    e.currentTarget.style.color = "white";
                  }
                }}
                onMouseOut={(e) => {
                  if (!answered) {
                    e.currentTarget.style.backgroundColor = "var(--secondary-color)";
                    e.currentTarget.style.color = "var(--text-color)";
                  }
                }}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
