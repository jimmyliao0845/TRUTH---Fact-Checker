import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import "bootstrap/dist/css/bootstrap.min.css";
// Added FaBriefcase to imports
import { FaBars, FaKeyboard, FaCloudUploadAlt, FaGamepad, FaCommentAlt, FaBriefcase } from "react-icons/fa";

export default function AnalysisPageLoggedIn() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [showLogo, setShowLogo] = useState(false);
  const [showTruth, setShowTruth] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/analysis");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Typewriter effect
  useEffect(() => {
    const text = "Analyze with ";
    let currentIndex = 0;

    const typeInterval = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayedText(text.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typeInterval);
        setTimeout(() => {
          setShowLogo(true);
          setTimeout(() => setShowTruth(true), 200);
        }, 300);
      }
    }, 80);

    return () => clearInterval(typeInterval);
  }, []);

  // Handle text submission with API
    const handleSubmit = async () => {
    if (!inputText.trim()) {
      setAlertMessage("Please enter some text first!");
      setAlertType("error");
      setTimeout(() => {
        setAlertMessage("");
        setAlertType("");
      }, 3000);
      return;
    }
  
    setIsLoading(true);
  
    try {
      // Call YOUR backend, not Copyleaks directly
      const response = await fetch("http://localhost:5000/api/detect/text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputText }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || data.error || "Analysis failed");
      }
  
      console.log("✅ Backend response:", data);
      
      // Transform backend response to match expected format
      const resultData = {
        text: inputText,
        scanId: data.scanId,
        summary: {
          ai: data.ai_probability || 0,
          human: data.human_probability || 0,
          mixed: data.mixed_probability || 0
        },
        status: "Success",
        timestamp: data.timestamp || new Date().toISOString()
      };
      
      navigate("/analysis-result-logged-in", { 
        state: { 
          result: resultData, 
          textInput: inputText,
          fileName: "",
          filePreview: "",
          fileType: ""
        } 
      });
      
    } catch (error) {
      console.error("❌ Error calling backend:", error);
      alert(`Analysis failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  // Handle file upload (images, videos, DOCX)
  // Handle file upload (images, videos, DOCX, PDF, TXT)
const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
      "application/pdf",                                                         // PDF
      "text/plain",                                                              // TXT
      "image/jpeg",
      "image/png",
      "video/mp4",
      "video/quicktime",
      "video/x-matroska",
      "video/webm"
    ];
  
    if (!allowedTypes.includes(file.type)) {
      setAlertMessage("Only DOCX, PDF, TXT, images (JPG, PNG only), and videos (MP4, MOV, MKV, WEBM) are allowed!");
      setAlertType("error");
      setTimeout(() => {
        setAlertMessage("");
        setAlertType("");
      }, 4000);
      return;
    }
  
    console.log("Selected file:", file);
  
    const filePreview = URL.createObjectURL(file);
  
    navigate("/analysis-result-logged-in", {
      state: {
        textInput: "",
        fileName: file.name,
        filePreview: filePreview,
        fileType: file.type,
        result: null
      }
    });
  };

  return (
    <div className="d-flex" style={{ paddingTop: "56px", backgroundColor: "var(--primary-color)", minHeight: "100vh", color: "var(--text-color)" }}>
      {/* Custom Alert */}
      {alertMessage && (
        <div className={`custom-alert custom-alert-${alertType}`} style={{
          position: "fixed",
          top: "70px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1050,
          animation: "slideDown 0.3s ease-out",
          backgroundColor: alertType === "error" ? "var(--accent-color)" : "var(--secondary-color)",
          color: "var(--text-color)",
          border: `2px solid var(--accent-color)`
        }}>
          <div className="d-flex align-items-center justify-content-between">
            <span>{alertMessage}</span>
            <button 
              onClick={() => setAlertMessage("")}
              style={{
                background: "none",
                border: "none",
                color: "inherit",
                cursor: "pointer",
                fontSize: "1.5rem",
                marginLeft: "15px"
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
      
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
                <div className="p-3 mt-3" style={{ 
                  backgroundColor: "var(--background-color)",
                  borderRadius: "8px",
                  border: `1px solid var(--accent-color)`,
                  opacity: 0.9
                }}>
                  <div style={{ fontSize: "0.85rem", opacity: 0.9, color: "var(--text-color)" }}>📋 Analysis History</div>
                  <div style={{ fontSize: "0.75rem", marginTop: "8px", opacity: 0.7, color: "var(--text-color)" }}>Your previous analyses appear here</div>
                </div>
              )}
              
              {/* Action Buttons Integration */}
              <div className="d-flex flex-column gap-3 mt-2">
                <button 
                  className="btn btn-link text-decoration-none d-flex align-items-center p-2"
                  onClick={() => navigate("/game")}
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
                  <FaGamepad size={20} />
                  {!collapsed && <span className="ms-3">Find and Play Game</span>}
                </button>
      


                {/* UPDATED BUTTON ROUTE */}
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
                  {!collapsed && <span className="ms-3">Go to Professional Dashboard</span>}
                </button>
              </div>
            </div>
      {/* Main Content */}
      <div 
        className="flex-grow-1 d-flex flex-column align-items-center justify-content-center"
        style={{
          marginLeft: collapsed ? "80px" : "200px",
          transition: "margin-left 0.3s ease",
          minHeight: "calc(100vh - 56px)",
          padding: "2rem",
          backgroundColor: "var(--primary-color)",
          color: "var(--text-color)"
        }}
      >
        {/* Header with Typewriter Effect */}
        <div className="text-center mb-5" style={{ minHeight: "100px", animation: "fadeIn 0.6s ease-in" }}>
          <h1 className="fw-bold d-inline-flex align-items-center justify-content-center gap-2" style={{ fontSize: "2.5rem", color: "var(--text-color)" }}>
            <span>{displayedText}</span>
            {showLogo && (
              <img 
                src="/assets/digima_logo.svg" 
                alt="T.R.U.T.H Logo" 
                style={{
                  width: "60px",
                  height: "60px",
                  animation: "fadeIn 0.5s ease-in"
                }}
              />
            )}
            {showTruth && (
              <span style={{ animation: "fadeIn 0.5s ease-in" }}>     
                T.R.U.T.H
              </span>
            )}
          </h1>
          <p className="mt-2" style={{ color: "var(--text-color)", opacity: 0.8 }}>Trusted Recognition Using Trained Heuristics</p>
        </div>

        {/* Input Card */}
        <div
          className="rounded-4 p-5 shadow-lg"
          style={{ 
            width: "70%", 
            maxWidth: "900px",
            backgroundColor: "white",
            animation: "fadeInUp 0.6s ease-out",
            border: "2px solid black"
          }}
        >
          <div className="text-center mb-4">
            <h4 className="fw-bold" style={{ color: "#333333" }}>
              🔍 Start Your Analysis
            </h4>
            <p style={{ color: "var(--hint-text-color)" }}>Enter text or upload a file to detect AI-generated content</p>
          </div>

          {/* Text Input */}
          <div className="mb-4">
            <label htmlFor="text-input" className="form-label fw-semibold" style={{ color: "var(--text-color)" }}>
              <FaKeyboard className="me-2" />
              Enter Your Text
            </label>
            <textarea
              id="text-input"
              className="form-control"
              rows="6"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type or paste your text here for analysis..."
              disabled={isLoading}
              style={{
                fontSize: "1rem",
                borderRadius: "12px",
                backgroundColor: "var(--secondary-color)",
                border: `2px solid var(--accent-color)`,
                color: "var(--text-color)",
                resize: "none"
              }}
            ></textarea>
            <div className="text-end mt-2">
              <small style={{ color: "var(--hint-text-color)" }}>{inputText.length} characters</small>
            </div>
          </div>

          {/* Buttons */}
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <button 
              className="btn btn-lg px-5 py-3 d-flex align-items-center gap-2"
              onClick={handleSubmit}
              disabled={isLoading || !inputText.trim()}
              style={{
                backgroundColor: "var(--accent-color)",
                border: "2px solid var(--accent-color)",
                borderRadius: "50px",
                color: "var(--primary-color)",
                fontWeight: "600",
                transition: "all 0.3s ease",
                minWidth: "200px"
              }}
              onMouseOver={(e) => {
                if (!isLoading && inputText.trim()) {
                  e.currentTarget.style.backgroundColor = "var(--primary-color)";
                  e.currentTarget.style.color = "var(--accent-color)";
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "var(--accent-color)";
                e.currentTarget.style.color = "var(--primary-color)";
              }}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Analyzing...
                </>
              ) : (
                <>
                  <FaKeyboard /> Analyze Text
                </>
              )}
            </button>

            <button
              className="btn btn-lg px-5 py-3 d-flex align-items-center gap-2"
              onClick={() => fileInputRef.current.click()}
              disabled={isLoading}
              style={{
                backgroundColor: "var(--accent-color)",
                border: "2px solid var(--accent-color)",
                borderRadius: "50px",
                color: "var(--primary-color)",
                fontWeight: "600",
                transition: "all 0.3s ease",
                minWidth: "200px"
              }}
              onMouseOver={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = "var(--primary-color)";
                  e.currentTarget.style.color = "var(--accent-color)";
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "var(--accent-color)";
                e.currentTarget.style.color = "var(--primary-color)";
              }}
            >
              <FaCloudUploadAlt /> Upload File
            </button>

            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              accept=".docx,.pdf,.txt,.jpg,.jpeg,.png,.mp4,.mov,.mkv,.webm,application/pdf"
              onChange={handleFileUpload}
            />
          </div>

          {/* Supported Files Info */}
          <div className="text-center mt-4">
            <small style={{ color: "var(--hint-text-color)" }}>
              📄 5 Text Verifications (max 200 words) • 1 Image Verification (JPG, PNG) • 1 Video Verification (MP4, MOV, MKV, WEBM - under file size limit)
            </small>
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

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
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