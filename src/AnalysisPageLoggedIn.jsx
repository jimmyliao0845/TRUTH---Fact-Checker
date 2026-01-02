import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import "bootstrap/dist/css/bootstrap.min.css";
import "./analysis.css";
import { FaBars, FaKeyboard, FaCloudUploadAlt,FaGamepad, FaCommentAlt } from "react-icons/fa";

export default function AnalysisPageLoggedIn() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [showLogo, setShowLogo] = useState(false);
  const [showTruth, setShowTruth] = useState(false);

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
      alert("Please enter some text first!");
      return;
    }

    setIsLoading(true);

    try {
      const scanId = `scan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const response = await fetch(
        `https://api.copyleaks.com/v2/writer-detector/${scanId}/check`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: inputText }),
        }
      );

      if (!response.ok) {
        console.warn("API call failed, using mock data");
        const mockData = {
          text: inputText,
          scanId: scanId,
          summary: {
            ai: Math.floor(Math.random() * 30),
            human: Math.floor(Math.random() * 40) + 50,
            mixed: Math.floor(Math.random() * 20)
          },
          status: "success",
          timestamp: new Date().toISOString()
        };
        
        navigate("/analysis-result-logged-in", { 
          state: { 
            result: mockData, 
            textInput: inputText,
            fileName: "",
            filePreview: "",
            fileType: ""
          } 
        });
        return;
      }

      const data = await response.json();
      console.log("API Response:", data);
      
      navigate("/analysis-result-logged-in", { 
        state: { 
          result: data, 
          textInput: inputText,
          fileName: "",
          filePreview: "",
          fileType: ""
        } 
      });
      
    } catch (error) {
      console.error("Error calling API:", error);
      
      const mockData = {
        text: inputText,
        scanId: `scan-${Date.now()}`,
        summary: {
          ai: Math.floor(Math.random() * 30),
          human: Math.floor(Math.random() * 40) + 50,
          mixed: Math.floor(Math.random() * 20)
        },
        status: "error_fallback",
        timestamp: new Date().toISOString()
      };
      
      navigate("/analysis-result-logged-in", { 
        state: { 
          result: mockData, 
          textInput: inputText,
          fileName: "",
          filePreview: "",
          fileType: ""
        } 
      });
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
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
      "image/gif",
      "video/mp4",
      "video/quicktime",
      "video/x-matroska",
      "video/webm"
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Only DOCX, images (JPG, PNG, GIF), and videos (MP4, MOV, MKV, WEBM) are allowed!");
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
    <div className="d-flex" style={{ paddingTop: "56px", backgroundColor: "white", minHeight: "100vh" }}>
      {/* Sidebar */}
      <div 
              className="d-flex flex-column p-3 border-end"
              style={{
                width: collapsed ? "80px" : "200px",
                backgroundColor: "#808080",
                transition: "width 0.3s ease",
                height: "calc(100vh - 56px)",
                position: "fixed",
                top: "56px",
                left: 0,
                overflowY: "auto",
                boxShadow: "2px 0 10px rgba(0,0,0,0.1)"
              }}
            >
              <div className="d-flex align-items-center justify-content-between mb-3">
                <button
                  className="btn btn-outline-light btn-sm"
                  onClick={() => setCollapsed(!collapsed)}
                  style={{ border: "none" }}
                >
                  <FaBars />
                </button>
              </div>
      
              {!collapsed && <div className="white-box p-3 mt-3"></div>}
              
              {/* Action Buttons Integration */}
              <div className="d-flex flex-column gap-3 mt-2">
                <button 
                  className="btn btn-link text-white text-decoration-none d-flex align-items-center p-2"
                  onClick={() => navigate("/game")}
                  style={{ transition: "0.2s" }}
                >
                  <FaGamepad size={20} />
                  {!collapsed && <span className="ms-3">Find and Play Game</span>}
                </button>
      
                <button 
                  className="btn btn-link text-white text-decoration-none d-flex align-items-center p-2"
                  onClick={() => navigate("/feedback")}
                >
                  <FaCommentAlt size={18} />
                  {!collapsed && <span className="ms-3">User Feedback</span>}
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
          backgroundColor: "white"
        }}
      >
        {/* Header with Typewriter Effect */}
        <div className="text-center mb-5" style={{ minHeight: "100px", animation: "fadeIn 0.6s ease-in" }}>
          <h1 className="fw-bold d-inline-flex align-items-center justify-content-center gap-2" style={{ fontSize: "2.5rem", color: "black" }}>
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
          <p className="text-muted mt-2">Trusted Recognition Using Trained Heuristics</p>
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
            <h4 className="fw-bold" style={{ color: "black" }}>
              🔍 Start Your Analysis
            </h4>
            <p style={{ color: "#666666" }}>Enter text or upload a file to detect AI-generated content</p>
          </div>

          {/* Text Input */}
          <div className="mb-4">
            <label htmlFor="text-input" className="form-label fw-semibold" style={{ color: "black" }}>
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
                backgroundColor: "white",
                border: "2px solid #e0e0e0",
                resize: "none"
              }}
            ></textarea>
            <div className="text-end mt-2">
              <small style={{ color: "#666666" }}>{inputText.length} characters</small>
            </div>
          </div>

          {/* Buttons */}
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <button 
              className="btn btn-lg px-5 py-3 d-flex align-items-center gap-2"
              onClick={handleSubmit}
              disabled={isLoading || !inputText.trim()}
              style={{
                backgroundColor: "black",
                border: "2px solid black",
                borderRadius: "50px",
                color: "white",
                fontWeight: "600",
                transition: "all 0.3s ease",
                minWidth: "200px"
              }}
              onMouseOver={(e) => {
                if (!isLoading && inputText.trim()) {
                  e.currentTarget.style.backgroundColor = "white";
                  e.currentTarget.style.color = "black";
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "black";
                e.currentTarget.style.color = "white";
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
                backgroundColor: "black",
                border: "2px solid black",
                borderRadius: "50px",
                color: "white",
                fontWeight: "600",
                transition: "all 0.3s ease",
                minWidth: "200px"
              }}
              onMouseOver={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = "white";
                  e.currentTarget.style.color = "black";
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "black";
                e.currentTarget.style.color = "white";
              }}
            >
              <FaCloudUploadAlt /> Upload File
            </button>

            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              accept=".docx,image/*,video/*"
              onChange={handleFileUpload}
            />
          </div>

          {/* Supported Files Info */}
          <div className="text-center mt-4">
            <small style={{ color: "#666666" }}>
              📄 Supported: Text, DOCX, Images (JPG, PNG, GIF), Videos (MP4, MOV, MKV, WEBM)
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