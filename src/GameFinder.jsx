import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaSearch } from "react-icons/fa";
import GamesList from "./GamesList";
import { SAMPLE_TUTORIALS } from "./sampleAdminData";

export default function GameFinder({ category, onSelectGame, onBack }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popularity");
  const [allGames, setAllGames] = useState([]);

  // Sample professional games
  const sampleGames = [
    {
      id: 101,
      category: "image",
      title: "Advanced Deepfake Analysis",
      description: "Professional-level deepfake detection techniques",
      difficulty: "advanced",
      duration: "30 mins",
      questions: 20,
      rating: 4.9,
      players: 2100,
      thumbnail: "🎬",
      maker: "Dr. Sarah Chen",
      createdDate: new Date("2024-01-15"),
      views: 5200,
    },
    {
      id: 102,
      category: "image",
      title: "Real vs Fake Images",
      description: "Identify AI-generated images from real photographs",
      difficulty: "beginner",
      duration: "10 mins",
      questions: 10,
      rating: 4.8,
      players: 1250,
      thumbnail: "🖼️",
      maker: "Prof. James Mitchell",
      createdDate: new Date("2024-02-01"),
      views: 4100,
    },
    {
      id: 103,
      category: "text",
      title: "Truth or Misinformation",
      description: "Identify misleading or false information in text",
      difficulty: "intermediate",
      duration: "15 mins",
      questions: 15,
      rating: 4.6,
      players: 890,
      thumbnail: "📰",
      maker: "Dr. Elena Rodriguez",
      createdDate: new Date("2024-01-28"),
      views: 3900,
    },
    {
      id: 104,
      category: "text",
      title: "Misinformation Detection Masterclass",
      description: "Expert strategies for identifying false claims",
      difficulty: "advanced",
      duration: "25 mins",
      questions: 18,
      rating: 4.8,
      players: 1500,
      thumbnail: "📖",
      maker: "Prof. Maria Santos",
      createdDate: new Date("2024-02-05"),
      views: 3200,
    },
    {
      id: 105,
      category: "video",
      title: "Synthetic Media Recognition",
      description: "Learn to spot AI-generated content",
      difficulty: "beginner",
      duration: "15 mins",
      questions: 12,
      rating: 4.6,
      players: 2800,
      thumbnail: "🤖",
      maker: "Dr. Alex Kumar",
      createdDate: new Date("2024-02-10"),
      views: 6200,
    },
    {
      id: 106,
      category: "video",
      title: "Video Manipulation Detection",
      description: "Spot edited videos and frame manipulation",
      difficulty: "intermediate",
      duration: "20 mins",
      questions: 16,
      rating: 4.7,
      players: 1600,
      thumbnail: "🎥",
      maker: "Prof. Robert Chang",
      createdDate: new Date("2024-01-20"),
      views: 3800,
    },
    {
      id: 107,
      category: "audio",
      title: "Voice Deepfake Detection",
      description: "Identify AI-generated voices and audio manipulation",
      difficulty: "intermediate",
      duration: "18 mins",
      questions: 14,
      rating: 4.7,
      players: 980,
      thumbnail: "🎙️",
      maker: "Dr. Lisa Wong",
      createdDate: new Date("2024-02-03"),
      views: 2900,
    },
    {
      id: 108,
      category: "media",
      title: "Media Forensics 101",
      description: "Learn techniques for identifying manipulated media",
      difficulty: "advanced",
      duration: "20 mins",
      questions: 20,
      rating: 4.9,
      players: 650,
      thumbnail: "🔍",
      maker: "Prof. Mark Anderson",
      createdDate: new Date("2024-01-10"),
      views: 4500,
    },
    {
      id: 109,
      category: "mixed",
      title: "Expert Fact-Checker Challenge",
      description: "Test your skills across all media types",
      difficulty: "advanced",
      duration: "40 mins",
      questions: 25,
      rating: 4.8,
      players: 520,
      thumbnail: "🏆",
      maker: "Dr. Global Experts",
      createdDate: new Date("2024-02-08"),
      views: 5800,
    },
  ];

  // Load games from localStorage, combine with samples and admin tutorials
  useEffect(() => {
    try {
      const publishedGames = JSON.parse(localStorage.getItem("published_games_v1") || "[]");
      // Convert dates back to Date objects
      const gamesWithDates = publishedGames.map((g) => ({
        ...g,
        createdDate: g.createdDate ? new Date(g.createdDate) : new Date(g.createdAt || new Date()),
      }));
      
      // Convert SAMPLE_TUTORIALS to game format
      const adminTutorials = SAMPLE_TUTORIALS.map((t) => ({
        ...t,
        createdDate: t.createdAt?.toDate?.() || new Date(t.createdAt) || new Date(0),
      }));
      
      // Combine all games: sample professional games + admin tutorials + user-published games
      setAllGames([...sampleGames, ...adminTutorials, ...gamesWithDates]);
    } catch (error) {
      console.error("Error loading games from localStorage:", error);
      setAllGames([...sampleGames, ...SAMPLE_TUTORIALS.map((t) => ({
        ...t,
        createdDate: t.createdAt?.toDate?.() || new Date(t.createdAt) || new Date(0),
      }))]);
    }
  }, []);

  // Category display names
  const categoryNames = {
    image: "🖼️ Image Games",
    text: "📰 Text Games",
    video: "🎬 Video Games",
    audio: "🎙️ Audio Games",
    media: "🔍 Media Forensics",
    mixed: "🎯 Mixed Challenge",
  };

  // Filter games by category and search
  const filteredGames = allGames
    .filter((game) => game.category === category)
    .filter((game) =>
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.maker.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "popularity":
          return b.players - a.players;
        case "views":
          return b.views - a.views;
        case "rating":
          return b.rating - a.rating;
        case "newest":
          return (b.createdDate || new Date()) - (a.createdDate || new Date());
        default:
          return 0;
      }
    });

  return (
    <div style={{ backgroundColor: "var(--secondary-color)", minHeight: "100vh" }}>
      {/* Header */}
      <div className="p-4" style={{ borderBottom: "1px solid var(--accent-color)" }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="mb-0">{categoryNames[category] || category}</h2>
          <button className="btn btn-outline-secondary" onClick={onBack}>
            <FaArrowLeft className="me-2" /> Back
          </button>
        </div>

        {/* Search and Sort */}
        <div className="row g-2">
          <div className="col-md-8">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <FaSearch />
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search by game title or creator..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="col-md-4">
            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="popularity">Most Popular</option>
              <option value="views">Most Viewed</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Games List */}
      <div className="p-4">
        {filteredGames.length > 0 ? (
          <GamesList games={filteredGames} onSelectGame={onSelectGame} />
        ) : (
          <div className="alert alert-info" role="alert">
            <p className="mb-0">
              No games found in {categoryNames[category]}. Try adjusting your search or check back later!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
