import React from "react";
import { FaPlay, FaClock, FaStar } from "react-icons/fa";

export default function GamesList({ games, onSelectGame }) {
  return (
    <div className="w-100">
      {/* Games Grid */}
      <div className="row" style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {games.map((game) => (
          <div key={game.id} className="col-md-6 col-lg-4 mb-4">
            <div 
              className="h-100 shadow-lg"
              style={{
                backgroundColor: "var(--secondary-color)",
                borderRadius: "16px",
                overflow: "hidden",
                border: "2px solid var(--accent-color)",
                transition: "all 0.3s ease",
                cursor: "pointer"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow = "0 8px 30px rgba(255, 107, 107, 0.3)";
                e.currentTarget.style.backgroundColor = "var(--primary-color)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
                e.currentTarget.style.backgroundColor = "var(--secondary-color)";
              }}
            >
              <div
                style={{
                  padding: "24px",
                  backgroundColor:
                    game.difficulty === "beginner"
                      ? "var(--info-color-light)"
                      : game.difficulty === "intermediate"
                      ? "var(--warning-color-light)"
                      : "var(--error-color-light)",
                  textAlign: "center"
                }}
              >
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>
                  {game.thumbnail}
                </div>
                <h5 style={{ color: "var(--accent-color)", fontWeight: "700", marginBottom: "12px", fontSize: "1.2rem" }}>
                  {game.title}
                </h5>
                <p style={{ color: "var(--text-color)", fontSize: "0.9rem", marginBottom: "16px", fontWeight: "500" }}>
                  {game.description}
                </p>

                <div style={{ marginBottom: "16px" }}>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                    <span 
                      style={{
                        display: "inline-block",
                        padding: "6px 12px",
                        backgroundColor: "var(--accent-color)",
                        color: "white",
                        borderRadius: "20px",
                        fontSize: "0.8rem",
                        fontWeight: "600"
                      }}
                    >
                      {game.difficulty}
                    </span>
                    <span 
                      style={{
                        display: "inline-block",
                        padding: "6px 12px",
                        backgroundColor: "var(--secondary-color)",
                        color: "var(--text-color)",
                        borderRadius: "20px",
                        fontSize: "0.8rem",
                        fontWeight: "600"
                      }}
                    >
                      <FaClock style={{ marginRight: "4px" }} />
                      {game.duration}
                    </span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-around", fontSize: "0.85rem", color: "var(--text-color)", fontWeight: "600" }}>
                    <span>
                      <FaStar style={{ marginRight: "4px", color: "var(--accent-color)" }} />
                      {game.rating}
                    </span>
                    <span>{game.players} players</span>
                  </div>
                </div>

                <button
                  className="btn btn-lg w-100"
                  onClick={() => onSelectGame(game)}
                  style={{
                    backgroundColor: "var(--accent-color)",
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    fontWeight: "600",
                    padding: "12px",
                    transition: "all 0.2s",
                    marginTop: "12px"
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--primary-color)";
                    e.currentTarget.style.color = "var(--accent-color)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--accent-color)";
                    e.currentTarget.style.color = "white";
                  }}
                >
                  <FaPlay style={{ marginRight: "8px" }} />
                  Play Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {games.length === 0 && (
        <div 
          className="text-center p-5"
          style={{
            maxWidth: "600px",
            margin: "2rem auto",
            backgroundColor: "var(--secondary-color)",
            borderRadius: "16px",
            border: "2px solid var(--accent-color)",
            boxShadow: "0 4px 12px rgba(255, 107, 107, 0.2)"
          }}
        >
          <p style={{ color: "var(--text-color)", fontSize: "1.1rem", fontWeight: "500" }}>
            ℹ️ No games found matching your search. Try adjusting your filters!
          </p>
        </div>
      )}
    </div>
  );
}
