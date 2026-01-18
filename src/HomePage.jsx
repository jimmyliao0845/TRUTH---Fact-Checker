import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./styles.css";

export default function HomePage() {
  const navigate = useNavigate();
  const [displayedText, setDisplayedText] = useState("");
  const [showContent, setShowContent] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check authentication status (but don't redirect)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await user.reload();
        setIsLoggedIn(user.emailVerified);
      } else {
        setIsLoggedIn(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Typewriter effect for main title
  useEffect(() => {
    const text = "T.R.U.T.H.";
    let currentIndex = 0;

    const typeInterval = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayedText(text.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typeInterval);
        setTimeout(() => setShowContent(true), 300);
      }
    }, 150);

    return () => clearInterval(typeInterval);
  }, []);

  return (
    <div style={{ paddingTop: "56px", backgroundColor: "white" }}>
      {/* Hero Section */}
      <div className="hero-section" style={{
        minHeight: "calc(100vh - 56px)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
        color: "black",
        textAlign: "center",
        padding: "2rem",
        position: "relative"
      }}>
        <h1 className="display-1 fw-bold mb-3" style={{ 
          minHeight: "120px",
          display: "flex",
          alignItems: "center"
        }}>
          {displayedText}
          <span className="typing-cursor" style={{
            animation: "blink 1s infinite",
            marginLeft: "5px"
          }}>|</span>
        </h1>
        
        {showContent && (
          <>
            <p className="lead mb-4" style={{ 
              animation: "fadeInUp 0.8s ease-out",
              maxWidth: "600px"
            }}>
              Detect deepfakes, AI-generated text, and manipulated media with cutting-edge technology
            </p>
            
            <button
              className="btn btn-light btn-lg px-5 py-3 rounded-pill shadow"
              onClick={() => navigate(isLoggedIn ? "/analysis-logged" : "/analysis")}
              style={{ 
                animation: "fadeInUp 1s ease-out",
                fontSize: "1.2rem",
                fontWeight: "600"
              }}
            >
              Try T.R.U.T.H. Now <i className="bi bi-arrow-right ms-2"></i>
            </button>
          </>
        )}
      </div>

      {/* About Section */}
      <section className="container py-5" style={{ backgroundColor: "white" }}>
        <div className="text-center mb-5">
          <h2 className="display-4 fw-bold mb-3" style={{ color: "black" }}>About T.R.U.T.H.</h2>
          <p className="lead" style={{ maxWidth: "800px", margin: "0 auto", color: "#333333" }}>
            An AI-powered platform designed to ensure the integrity and authenticity of digital content in an era of sophisticated manipulation.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="row g-4 mt-4">
          {/* Image/Video Checker Card */}
          <div className="col-md-6">
            <div className="card h-100 hover-lift" 
              style={{ 
                transition: "all 0.3s ease",
                backgroundColor: "white",
                border: "2px solid black"
              }}
            >
              <div className="card-body p-4">
                <div className="d-flex align-items-center mb-3">
                  <div className="p-3 rounded-circle me-3" style={{ 
                    backgroundColor: "black",
                    width: "60px",
                    height: "60px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <i className="bi bi-camera-video-fill fs-3" style={{ color: "white" }}></i>
                  </div>
                  <h4 className="card-title mb-0 fw-bold" style={{ color: "black" }}>Image & Video Checker</h4>
                </div>
                <p className="card-text" style={{ color: "#333333" }}>
                  Advanced deepfake detection using state-of-the-art neural networks to identify manipulated visual content.
                </p>
                <div className="mt-3">
                  <span className="badge" style={{ 
                    backgroundColor: "black", 
                    color: "white",
                    padding: "0.5rem 1rem",
                    fontSize: "0.9rem"
                  }}>
                    <i className="bi bi-lock-fill me-1"></i> Registered Users Only
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Text Checker Card */}
          <div className="col-md-6">
            <div className="card h-100 hover-lift" 
              style={{ 
                transition: "all 0.3s ease",
                backgroundColor: "white",
                border: "2px solid black"
              }}
            >
              <div className="card-body p-4">
                <div className="d-flex align-items-center mb-3">
                  <div className="p-3 rounded-circle me-3" style={{ 
                    backgroundColor: "black",
                    width: "60px",
                    height: "60px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <i className="bi bi-file-text-fill fs-3" style={{ color: "white" }}></i>
                  </div>
                  <h4 className="card-title mb-0 fw-bold" style={{ color: "black" }}>Text Checker</h4>
                </div>
                <p className="card-text" style={{ color: "#333333" }}>
                  Detect AI-generated text and distinguish between human-written and machine-generated content with high accuracy.
                </p>
                <div className="mt-3">
                  <span className="badge" style={{ 
                    backgroundColor: "black", 
                    color: "white",
                    padding: "0.5rem 1rem",
                    fontSize: "0.9rem"
                  }}>
                    <i className="bi bi-check-circle-fill me-1"></i> Free for All
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5 text-center" style={{ 
        backgroundColor: "black",
        color: "white"
      }}>
        <div className="container">
          <h2 className="display-5 fw-bold mb-3">Ready to Verify Your Content?</h2>
          <p className="lead mb-4">Join thousands of users protecting digital authenticity</p>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <button
              className="btn btn-lg px-5 py-3 rounded-pill"
              onClick={() => navigate("/register")}
              style={{
                backgroundColor: "white",
                color: "black",
                border: "2px solid white",
                fontWeight: "600",
                transition: "all 0.3s ease"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "black";
                e.currentTarget.style.color = "white";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "white";
                e.currentTarget.style.color = "black";
              }}
            >
              Get Started Free
            </button>
            <button
              className="btn btn-lg px-5 py-3 rounded-pill"
              onClick={() => navigate(isLoggedIn ? "/analysis-logged" : "/analysis")}
              style={{
                backgroundColor: "transparent",
                color: "white",
                border: "2px solid white",
                fontWeight: "600",
                transition: "all 0.3s ease"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "white";
                e.currentTarget.style.color = "black";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "white";
              }}
            >
              Try Now
            </button>
          </div>
        </div>
      </section>

      {/* CSS Animations */}
      <style>
        {`
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .hover-lift:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.15) !important;
          }

          .typing-cursor {
            font-weight: 300;
          }
        `}
      </style>
    </div>
  );
}