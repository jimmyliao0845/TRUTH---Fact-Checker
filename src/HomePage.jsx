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
  const [loading, setLoading] = useState(true);

  // Check authentication and email verification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await user.reload();
        if (!user.emailVerified) {
          // Redirect unverified users back to register
          navigate("/register", { replace: true });
        } else {
          setLoading(false);
        }
      } else {
        // Not logged in, redirect to login
        navigate("/login", { replace: true });
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Typewriter effect for main title
  useEffect(() => {
    if (loading) return;
    
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
  }, [loading]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: "56px" }}>
      {/* Hero Section */}
      <div className="hero-section" style={{
        minHeight: "calc(100vh - 56px)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        textAlign: "center",
        padding: "2rem"
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
              onClick={() => navigate("/analysis")}
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
      <section className="container py-5">
        <div className="text-center mb-5">
          <h2 className="display-4 fw-bold mb-3">About T.R.U.T.H.</h2>
          <p className="lead text-muted" style={{ maxWidth: "800px", margin: "0 auto" }}>
            An AI-powered platform designed to ensure the integrity and authenticity of digital content in an era of sophisticated manipulation.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="row g-4 mt-4">
          {/* Image/Video Checker Card */}
          <div className="col-md-6">
            <div className="card h-100 border-0 shadow-sm hover-lift" style={{ transition: "transform 0.3s ease" }}>
              <div className="card-body p-4">
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                    <i className="bi bi-camera-video-fill text-primary fs-3"></i>
                  </div>
                  <h4 className="card-title mb-0 fw-bold">Image & Video Checker</h4>
                </div>
                <p className="card-text text-muted">
                  Advanced deepfake detection using state-of-the-art neural networks to identify manipulated visual content.
                </p>
                <div className="mt-3">
                  <span className="badge bg-warning text-dark">
                    <i className="bi bi-lock-fill me-1"></i> Registered Users Only
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Text Checker Card */}
          <div className="col-md-6">
            <div className="card h-100 border-0 shadow-sm hover-lift" style={{ transition: "transform 0.3s ease" }}>
              <div className="card-body p-4">
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                    <i className="bi bi-file-text-fill text-success fs-3"></i>
                  </div>
                  <h4 className="card-title mb-0 fw-bold">Text Checker</h4>
                </div>
                <p className="card-text text-muted">
                  Detect AI-generated text and distinguish between human-written and machine-generated content with high accuracy.
                </p>
                <div className="mt-3">
                  <span className="badge bg-success">
                    <i className="bi bi-check-circle-fill me-1"></i> Free for All
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* CTA Section */}
      <section className="py-5 bg-dark text-white text-center">
        <div className="container">
          <h2 className="display-5 fw-bold mb-3">Ready to Verify Your Content?</h2>
          <p className="lead mb-4"></p>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <button
              className="btn btn-primary btn-lg px-5"
              onClick={() => navigate("/register")}
            >
              Get Started Free
            </button>
            <button
              className="btn btn-outline-light btn-lg px-5"
              onClick={() => navigate("/analysis")}
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
          }

          .typing-cursor {
            font-weight: 300;
          }
        `}
      </style>
    </div>
  );
}