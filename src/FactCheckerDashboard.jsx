import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaBars, FaSearch, FaFileAlt, FaCheckCircle, FaBook, FaBrain, FaVideo, FaInfoCircle } from "react-icons/fa";
import "./FactCheckerDashboard.css";

export default function FactCheckerDashboard() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  // ✅ Auth Check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) navigate("/login");
    });
    return () => unsubscribe();
  }, [navigate]);

  // ✅ Smooth scroll
  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="d-flex" style={{ height: "100vh", backgroundColor: "#f8f9fa" }}>
      {/* Sidebar */}
      <div
        className="d-flex flex-column p-3 border-end"
        style={{
          width: collapsed ? "80px" : "250px",
          backgroundColor: "#d9d9d9",
          transition: "width 0.3s ease",
          position: "fixed",
          height: "100vh",
        }}
      >
        {/* Sidebar Header */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          
          <button
            className="btn btn-outline-dark btn-sm"
            onClick={() => setCollapsed(!collapsed)}
            style={{ border: "none" }}
          >
            <FaBars />
          </button>
        </div>

        {/* Sidebar Buttons */}
        <ul className="nav flex-column">
          <li>
            <button
              className="btn sidebar-btn text-start"
              onClick={() => scrollToSection("search")}
            >
              <FaSearch className="me-2" />
              {!collapsed && "Advanced Search & Claim Extraction"}
            </button>
          </li>
          <li>
            <button
              className="btn sidebar-btn text-start"
              onClick={() => scrollToSection("semantic")}
            >
              <FaCheckCircle className="me-2" />
              {!collapsed && "Semantic Fact Checking"}
            </button>
          </li>
          <li>
            <button
              className="btn sidebar-btn text-start"
              onClick={() => scrollToSection("citation")}
            >
              <FaBook className="me-2" />
              {!collapsed && "Citation Generator"}
            </button>
          </li>
          <li>
            <button
              className="btn sidebar-btn text-start"
              onClick={() => scrollToSection("report")}
            >
              <FaBrain className="me-2" />
              {!collapsed && "AI-Assisted Report Builder"}
            </button>
          </li>
          <li>
            <button
              className="btn sidebar-btn text-start"
              onClick={() => scrollToSection("deepfake")}
            >
              <FaVideo className="me-2" />
              {!collapsed && "Deepfake Detection Tools"}
            </button>
          </li>
          <li>
            <button
              className="btn sidebar-btn text-start"
              onClick={() => scrollToSection("metadata")}
            >
              <FaInfoCircle className="me-2" />
              {!collapsed && "Metadata & Provenance Analysis"}
            </button>
          </li>
        </ul>

        {!collapsed && (
          <div className="mt-auto small text-muted">
            Verified professionals workspace
          </div>
        )}
      </div>

      {/* Main Content */}
      <div
        className="flex-grow-1 overflow-auto p-4"
        style={{
          marginLeft: collapsed ? "80px" : "250px",
          transition: "margin-left 0.3s ease",
          backgroundColor: "#fff",
        }}
      >
        <section id="search" className="mb-5">
          <h3>🔍 Advanced Search & Claim Extraction</h3>
          <p>Extract factual statements from uploaded documents and online sources.</p>
        </section>

        <section id="semantic" className="mb-5">
          <h3>✅ Semantic Fact Checking</h3>
          <p>Cross-verify claims using trusted databases and verified news sources.</p>
        </section>

        <section id="citation" className="mb-5">
          <h3>📚 Citation Generator</h3>
          <p>Automatically generate citations from verified sources for each claim.</p>
        </section>

        <section id="report" className="mb-5">
          <h3>🧠 AI-Assisted Report Builder</h3>
          <p>Compile fact-check reports automatically with structured evidence.</p>
        </section>

        <section id="deepfake" className="mb-5">
          <h3>🎥 Deepfake Detection Tools</h3>
          <p>Analyze videos and images to verify authenticity and detect manipulation.</p>
        </section>

        <section id="metadata" className="mb-5">
          <h3>🧾 Metadata & Provenance Analysis</h3>
          <p>Inspect file metadata and digital provenance for reliability assessment.</p>
        </section>
      </div>

      {/* Sidebar Button Styles */}
      <style>
        {`
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
        `}
      </style>
    </div>
  );
}
