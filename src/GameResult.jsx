import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaStar, FaArrowLeft, FaPlay, FaComment } from "react-icons/fa";

export default function GameResult({ 
  selectedGame, 
  score, 
  pointsEarned = 0, 
  totalQuestions = 10,
  gamesPlayedToday = 0,
  onPlayAgain, 
  onReturnHome 
}) {
  const navigate = useNavigate();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const accuracy = ((score / totalQuestions) * 100).toFixed(1);
  const gamesRemaining = 5 - gamesPlayedToday;

  const handleSubmitReview = () => {
    if (!reviewComment.trim()) {
      alert("Please write a review comment.");
      return;
    }

    // Save review to localStorage
    const reviews = JSON.parse(localStorage.getItem("game_reviews") || "[]");
    reviews.push({
      gameId: selectedGame.id,
      gameName: selectedGame.title,
      rating: reviewRating,
      comment: reviewComment,
      date: new Date().toISOString(),
      playerId: "current-user" // TODO: use actual user ID from Firebase
    });
    localStorage.setItem("game_reviews", JSON.stringify(reviews));

    alert("✅ Review submitted successfully!");
    setShowReviewForm(false);
    setReviewComment("");
    setReviewRating(5);
  };

  return (
    <div style={{ maxWidth: "700px", margin: "2rem auto", width: "100%" }}>
      <div 
        className="text-center shadow-lg"
        style={{
          backgroundColor: "var(--secondary-color)",
          borderRadius: "16px",
          border: "2px solid var(--accent-color)",
          padding: "40px",
          animation: "fadeIn 0.5s ease-in",
          boxShadow: "0 8px 30px rgba(255, 107, 107, 0.2)"
        }}
      >
        <div style={{ fontSize: "64px", marginBottom: "20px" }}>
          🎉
        </div>
        <h4 style={{ color: "var(--text-color)", fontWeight: "700", marginBottom: "20px" }}>
          {selectedGame.title} - Complete!
        </h4>

        {/* Score & Accuracy */}
        <div style={{ marginBottom: "32px", padding: "24px", backgroundColor: "var(--primary-color)", borderRadius: "12px" }}>
          <p style={{ fontSize: "24px", marginBottom: "12px" }}>
            <strong style={{ color: "var(--accent-color)" }}>Score: {score}/{totalQuestions}</strong>
          </p>
          <p style={{ fontSize: "20px", color: "var(--text-color)", marginBottom: "16px" }}>
            Accuracy: <strong style={{ color: "var(--accent-color)" }}>{accuracy}%</strong>
          </p>
        </div>

        {/* Points Earned */}
        <div style={{ marginBottom: "32px", padding: "24px", backgroundColor: "var(--primary-color)", borderRadius: "12px", border: "2px solid var(--accent-color)" }}>
          <p style={{ fontSize: "18px", color: "var(--text-color)", marginBottom: "8px" }}>
            Points Earned
          </p>
          <p style={{ fontSize: "48px", color: "var(--accent-color)", fontWeight: "700", marginBottom: 0 }}>
            +{pointsEarned}
          </p>
          <p style={{ fontSize: "12px", color: "var(--text-color)", marginTop: "8px", opacity: 0.7 }}>
            {gamesRemaining > 0 ? `${gamesRemaining} games remaining today` : "Daily limit reached - come back tomorrow!"}
          </p>
        </div>

        {/* Review Section */}
        {!showReviewForm ? (
          <button
            style={{
              width: "100%",
              padding: "16px",
              backgroundColor: "var(--primary-color)",
              color: "var(--text-color)",
              border: `2px solid var(--accent-color)`,
              borderRadius: "12px",
              fontWeight: "600",
              cursor: "pointer",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "all 0.2s"
            }}
            onClick={() => setShowReviewForm(true)}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "var(--accent-color)";
              e.currentTarget.style.color = "white";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "var(--primary-color)";
              e.currentTarget.style.color = "var(--text-color)";
            }}
          >
            <FaComment /> Leave a Review
          </button>
        ) : (
          <div style={{ 
            backgroundColor: "var(--primary-color)", 
            padding: "20px", 
            borderRadius: "12px", 
            marginBottom: "16px",
            border: `2px solid var(--accent-color)`
          }}>
            <h6 style={{ color: "var(--text-color)", marginBottom: "16px", fontWeight: "700" }}>
              Share Your Feedback
            </h6>

            {/* Rating */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ color: "var(--text-color)", display: "block", marginBottom: "8px", fontWeight: "600" }}>
                Rating
              </label>
              <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewRating(star)}
                    style={{
                      fontSize: "28px",
                      cursor: "pointer",
                      backgroundColor: "transparent",
                      border: "none",
                      opacity: star <= reviewRating ? 1 : 0.3,
                      transition: "all 0.2s"
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = "scale(1.2)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ color: "var(--text-color)", display: "block", marginBottom: "8px", fontWeight: "600" }}>
                Your Comment
              </label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="What did you think about this game?"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: `1px solid var(--accent-color)`,
                  backgroundColor: "var(--secondary-color)",
                  color: "var(--text-color)",
                  fontFamily: "inherit",
                  resize: "vertical",
                  minHeight: "80px"
                }}
              />
            </div>

            {/* Review Actions */}
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={handleSubmitReview}
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor: "var(--accent-color)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.opacity = "0.9";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.opacity = "1";
                }}
              >
                Submit Review
              </button>
              <button
                onClick={() => {
                  setShowReviewForm(false);
                  setReviewComment("");
                }}
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor: "transparent",
                  color: "var(--text-color)",
                  border: `1px solid var(--text-color)`,
                  borderRadius: "8px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "16px", marginTop: "20px" }}>
          {gamesRemaining > 0 && (
            <button
              style={{
                flex: 1,
                padding: "16px",
                backgroundColor: "var(--accent-color)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 0.2s"
              }}
              onClick={onPlayAgain}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "var(--primary-color)";
                e.currentTarget.style.color = "var(--accent-color)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "var(--accent-color)";
                e.currentTarget.style.color = "white";
              }}
            >
              <FaPlay /> Play Again
            </button>
          )}
          <button
            style={{
              flex: 1,
              padding: "16px",
              backgroundColor: "var(--primary-color)",
              color: "var(--text-color)",
              border: `2px solid var(--accent-color)`,
              borderRadius: "12px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "all 0.2s"
            }}
            onClick={onReturnHome}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "var(--accent-color)";
              e.currentTarget.style.color = "white";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "var(--primary-color)";
              e.currentTarget.style.color = "var(--text-color)";
            }}
          >
            <FaArrowLeft /> Return to Games
          </button>
        </div>
      </div>
    </div>
  );
}
