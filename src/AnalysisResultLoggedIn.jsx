import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import "bootstrap/dist/css/bootstrap.min.css";
// Added FaBriefcase to the imports
import { FaBars, FaDownload, FaShare, FaRedo, FaGamepad, FaCommentAlt, FaBriefcase } from "react-icons/fa";

export default function AnalysisResultLoggedIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  const mainContentRef = useRef(null);
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  
  // Get data from location state
  const textInput = location.state?.textInput || "";
  const fileName = location.state?.fileName || "";
  const filePreview = location.state?.filePreview || "";
  const fileType = location.state?.fileType || "";
  const existingResult = location.state?.result || null;
  
  const [displayText, setDisplayText] = useState(textInput);
  const [displayPreview, setDisplayPreview] = useState(filePreview);
  const [displayFileName, setDisplayFileName] = useState(fileName);
  const [displayFileType, setDisplayFileType] = useState(fileType);
  const [analysisResult, setAnalysisResult] = useState(existingResult);
  const [isLoading, setIsLoading] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Auth check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/analysis");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Swipe gesture handler for mobile sidebar
  const handleSwipe = useCallback((direction) => {
    if (direction === "right") {
      setSidebarVisible(true);
    } else if (direction === "left") {
      setSidebarVisible(false);
    }
  }, []);

  // Set up touch listeners for swipe on mobile
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e) => {
      touchStartX = e.changedTouches[0].clientX;
      touchStartY = e.changedTouches[0].clientY;
    };

    const handleTouchEnd = (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      
      const diffX = touchStartX - touchEndX;
      const diffY = touchStartY - touchEndY;

      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        const direction = diffX > 0 ? 'left' : 'right';
        handleSwipe(direction);
      }
    };

    const element = mainContentRef.current;
    if (element) {
      element.addEventListener('touchstart', handleTouchStart, false);
      element.addEventListener('touchend', handleTouchEnd, false);
    }

    return () => {
      if (element) {
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [handleSwipe]);

  // Check for valid data on mount and clear if invalid (page refresh scenario)
  useEffect(() => {
    if (filePreview && filePreview.startsWith('blob:')) {
      fetch(filePreview)
        .then(() => {
          if (!existingResult && fileName && filePreview) {
            handleInitialAnalysis();
          }
        })
        .catch(() => {
          console.log("🔄 Page refreshed - clearing stale data");
          setDisplayText("");
          setDisplayPreview("");
          setDisplayFileName("");
          setDisplayFileType("");
          setAnalysisResult(null);
        });
    } else if (!existingResult && fileName && filePreview) {
      handleInitialAnalysis();
    } else if (!filePreview && !textInput && existingResult) {
      console.log("🔄 Page refreshed - clearing orphaned results");
      setAnalysisResult(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Toast notification
  const showNotification = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Initial analysis for data passed from previous page
  const handleInitialAnalysis = async () => {
    // Handle text input (typed text)
    if (textInput && !fileName) {
      console.log("📝 Analyzing text input...");
      await detectText(textInput);
      return;
    }
  
    // Handle file uploads
    if (fileName && filePreview) {
      // Images
      if (fileType.startsWith("image/")) {
        console.log("🖼️ Analyzing image...");
        await detectImage(filePreview, fileName);
      } 
      // Videos (mock data for now)
      else if (fileType.startsWith("video/")) {
        console.log("🎥 Analyzing video (mock data)...");
        setIsLoading(true);
        setTimeout(() => {
          const mockData = {
            summary: {
              ai: Math.floor(Math.random() * 20),
              human: Math.floor(Math.random() * 50) + 40,
              mixed: Math.floor(Math.random() * 30)
            },
            status: "Complete (Mock Data - Video detection not yet supported)"
          };
          setAnalysisResult(mockData);
          setIsLoading(false);
        }, 1500);
      }
      // Documents (DOCX, PDF, TXT, etc.)
      else if (
        fileType.includes("document") || 
        fileType.includes("word") || 
        fileType.includes("pdf") ||
        fileType.includes("text") ||
        fileName.endsWith(".docx") ||
        fileName.endsWith(".pdf") ||
        fileName.endsWith(".txt")
      ) {
        console.log("📄 Analyzing document...");
        // Convert blob URL to actual blob
        const response = await fetch(filePreview);
        const blob = await response.blob();
        await detectDocument(blob, fileName);
      }
      // Unknown file type
      else {
        console.log("⚠️ Unknown file type:", fileType);
        showNotification("⚠️ Unsupported file type");
        setAnalysisResult({
          summary: { ai: 0, human: 0, mixed: 0 },
          status: `Unsupported file type: ${fileType}`,
          error: true
        });
      }
    }
  };

  // Image detection function
  const detectImage = async (preview, name) => {
    try {
      setIsLoading(true);
      console.log("🔍 Starting Copyleaks image detection...");
  
      const response = await fetch(preview);
      const blob = await response.blob();
  
      const formData = new FormData();
      formData.append("file", blob, name);
  
      const res = await fetch("http://localhost:5000/api/detect/image", {
        method: "POST",
        body: formData,
      });
  
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `API Error: ${res.status}`);
      }
  
      const data = await res.json();
      console.log("✅ Copyleaks detection complete:", data);
  
      // Parse the response from backend
      const aiPercent = data.ai_probability || 0;
      const humanPercent = data.human_probability || 0;
      const mixedPercent = Math.max(0, 100 - aiPercent - humanPercent);
  
      const resultData = {
        summary: {
          ai: aiPercent,
          human: humanPercent,
          mixed: mixedPercent
        },
        status: "Complete",
        model: data.model || "ai-image-1-ultra",
        scanId: data.scanId,
        timestamp: data.timestamp || new Date().toISOString(),
        imageInfo: data.imageInfo
      };
      
      setAnalysisResult(resultData);
      setIsLoading(false);
      showNotification("✅ Analysis complete!");
      
    } catch (err) {
      console.error("❌ Copyleaks detection error:", err);
      showNotification(`❌ Analysis failed: ${err.message}`);
      
      // Show error state instead of mock data in production
      const errorData = {
        summary: {
          ai: 0,
          human: 0,
          mixed: 0
        },
        status: `Error: ${err.message}`,
        error: true
      };
      setAnalysisResult(errorData);
      setIsLoading(false);
    }
  };
  
  const detectText = async (text) => {
    try {
      setIsLoading(true);
      console.log("🔍 Starting Copyleaks text detection...");
  
      const res = await fetch("http://localhost:5000/api/detect/text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });
  
      const data = await res.json();
      console.log("Backend response:", data);
  
      if (!res.ok) {
        throw new Error(data.message || data.error || `API Error: ${res.status}`);
      }
  
      console.log("✅ Copyleaks text detection complete:", data);
  
      const aiPercent = data.ai_probability || 0;
      const humanPercent = data.human_probability || 0;
      const mixedPercent = data.mixed_probability || Math.max(0, 100 - aiPercent - humanPercent);
  
      const resultData = {
        summary: {
          ai: aiPercent,
          human: humanPercent,
          mixed: mixedPercent
        },
        status: "Complete",
        scanId: data.scanId,
        timestamp: data.timestamp || new Date().toISOString()
      };
      
      setAnalysisResult(resultData);
      setIsLoading(false);
      showNotification("✅ Text analysis complete!");
      
    } catch (err) {
      console.error("❌ Text detection error:", err);
      showNotification(`❌ Analysis failed: ${err.message}`);
      
      const errorData = {
        summary: { ai: 0, human: 0, mixed: 0 },
        status: `Error: ${err.message}`,
        error: true
      };
      setAnalysisResult(errorData);
      setIsLoading(false);
    }
  };

  const detectDocument = async (fileBlob, fileName) => {
    try {
      setIsLoading(true);
      console.log("🔍 Starting document detection for:", fileName);
  
      const formData = new FormData();
      formData.append("file", fileBlob, fileName);
  
      const res = await fetch("http://localhost:5000/api/detect/document", {
        method: "POST",
        body: formData,
      });
  
      const data = await res.json();
      console.log("Backend response:", data);
  
      if (!res.ok) {
        throw new Error(data.message || data.error || `API Error: ${res.status}`);
      }
  
      console.log("✅ Document detection complete:", data);
  
      const aiPercent = data.ai_probability || 0;
      const humanPercent = data.human_probability || 0;
      const mixedPercent = data.mixed_probability || Math.max(0, 100 - aiPercent - humanPercent);
  
      const resultData = {
        summary: {
          ai: aiPercent,
          human: humanPercent,
          mixed: mixedPercent
        },
        status: "Complete",
        scanId: data.scanId,
        timestamp: data.timestamp || new Date().toISOString(),
        documentInfo: data.documentInfo
      };
      
      setAnalysisResult(resultData);
      setIsLoading(false);
      showNotification("✅ Document analysis complete!");
      
    } catch (err) {
      console.error("❌ Document detection error:", err);
      showNotification(`❌ Analysis failed: ${err.message}`);
      
      const errorData = {
        summary: { ai: 0, human: 0, mixed: 0 },
        status: `Error: ${err.message}`,
        error: true
      };
      setAnalysisResult(errorData);
      setIsLoading(false);
    }
  };

  // Get percentages
  const getAnalysisPercentages = () => {
    if (analysisResult?.summary) {
      return {
        ai: analysisResult.summary.ai || 0,
        human: analysisResult.summary.human || 0,
        mixed: analysisResult.summary.mixed || 0
      };
    }
    return { ai: 0, human: 0, mixed: 0 };
  };

  const percentages = getAnalysisPercentages();

  // Determine overall verdict
  const getVerdict = () => {
    if (percentages.human > percentages.ai && percentages.human > percentages.mixed) {
      return { text: "Likely Human-Written", color: "var(--success-color)", icon: "✓" };
    } else if (percentages.ai > percentages.human && percentages.ai > percentages.mixed) {
      return { text: "Likely AI-Generated", color: "var(--error-color)", icon: "⚠" };
    } else {
      return { text: "Mixed Content", color: "var(--warning-color)", icon: "◐" };
    }
  };

  const verdict = getVerdict();

  // Download result as text file
  const handleDownloadResult = () => {
    if (!analysisResult) {
      showNotification("No result to download!");
      return;
    }

    const resultText = `
T.R.U.T.H Analysis Report
========================
Generated: ${new Date().toLocaleString()}

INPUT CONTENT:
${displayText || displayFileName || "File uploaded"}

ANALYSIS RESULTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- AI-Generated:    ${percentages.ai}%
- Human-Written:   ${percentages.human}%
- Mixed Content:   ${percentages.mixed}%

VERDICT: ${verdict.text}
Status: ${analysisResult.status || "Complete"}

REMARKS:
${remarks || "No remarks provided"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Report generated by T.R.U.T.H Detection System
    `.trim();

    const blob = new Blob([resultText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `TRUTH-Report-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showNotification("Report downloaded successfully!");
  };

  // Share result (copy to clipboard)
  const handleShareResult = () => {
    if (!analysisResult) {
      showNotification("No result to share!");
      return;
    }

    const shareText = `T.R.U.T.H Analysis Results:\n━━━━━━━━━━━━━━━━━━━━━━\n🤖 AI: ${percentages.ai}% | 👤 Human: ${percentages.human}% | ◐ Mixed: ${percentages.mixed}%\n\nVerdict: ${verdict.text}`;
    navigator.clipboard.writeText(shareText).then(() => {
      showNotification("Results copied to clipboard!");
    }).catch(() => {
      showNotification("Failed to copy results");
    });
  };

  // Another entry - navigate back to analysis page
  const handleAnotherEntry = () => {
    navigate("/analysis-logged");
  };

  return (
    <div className="d-flex" style={{ paddingTop: "56px", background: "var(--primary-color)", minHeight: "100vh", color: "var(--text-color)" }}>
      {/* Toast Notification */}
      {showToast && (
        <div 
          style={{
            position: "fixed",
            top: "80px",
            right: "20px",
            zIndex: 9999,
            backgroundColor: "var(--success-color)",
            color: "var(--white-color)",
            padding: "15px 25px",
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            animation: "slideIn 0.3s ease-out"
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* Sidebar Overlay for Mobile */}
      <div 
        className={`sidebar-overlay ${sidebarVisible ? 'visible' : ''}`}
        onClick={() => setSidebarVisible(false)}
      />

      {/* Sidebar */}
            <div 
                    className={`d-flex flex-column p-3 border-end ${sidebarVisible ? 'visible' : ''}`}
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
                      borderRight: `2px solid var(--accent-color)`,
                      zIndex: 1050
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
                        <div style={{ fontSize: "0.85rem", opacity: 0.8 }}>📋 Analysis History</div>
                        <div style={{ fontSize: "0.75rem", marginTop: "8px", opacity: 0.6 }}>Your previous analyses appear here</div>
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
            
                      {/* NEW BUTTON INSERTED HERE */}
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
        ref={mainContentRef}
        className="flex-grow-1 d-flex flex-column align-items-center justify-content-center"
        style={{
          marginLeft: collapsed ? "80px" : "200px",
          transition: "margin-left 0.3s ease",
          minHeight: "calc(100vh - 56px)",
          padding: "2rem"
        }}
      >
        {/* Header */}
        <div className="text-center mb-4" style={{ animation: "fadeIn 0.6s ease-in" }}>
          <h2 className="fw-bold d-inline-flex align-items-center gap-2" style={{ color: "var(--text-color)" }}>
            <span>Analyze with</span>
            <img 
              src="/assets/digima_logo.svg" 
              alt="T.R.U.T.H Logo" 
              style={{ width: "45px", height: "45px" }}
            />
            <span style={{ 
              background: "black",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>T.R.U.T.H</span>
          </h2>
        </div>

        {/* Main Content Box */}
        <div 
          className="rounded-4 p-4"
          style={{ 
            width: "95%", 
            maxWidth: "1300px",
            backgroundColor: "var(--primary-color)",
            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
            animation: "fadeInUp 0.6s ease-out"
          }}
        >
          {/* Verdict Badge */}
          {analysisResult && (
            <div className="text-center mb-4">
              <div 
                className="d-inline-block px-4 py-2 rounded-pill"
                style={{
                  backgroundColor: `${verdict.color}15`,
                  border: `2px solid ${verdict.color}`,
                  color: verdict.color,
                  fontWeight: "600",
                  fontSize: "1.1rem"
                }}
              >
                {verdict.icon} {verdict.text}
              </div>
            </div>
          )}

          {/* Grid Layout - 3 Boxes */}
          <div className="row g-4 mb-4">
            {/* Your Input - Left Box */}
            <div className="col-lg-6">
              <div 
                className="rounded-3 p-4 h-100"
                style={{ 
                  minHeight: "350px",
                  background: "var(--primary-color)",
                  border: `2px solid var(--secondary-color)`
                }}
              >
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h5 className="fw-bold mb-0" style={{ color: "var(--text-color)" }}>
                    📄 Your Input
                  </h5>
                  {displayFileName && (
                    <span className="badge bg-secondary">{displayFileType.split('/')[0]}</span>
                  )}
                </div>
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "280px" }}>
                  {displayPreview ? (
                    displayFileType.startsWith("image/") ? (
                      <img
                        src={displayPreview}
                        alt="Preview"
                        className="img-fluid rounded-3"
                        style={{ 
                          maxHeight: "280px", 
                          maxWidth: "100%",
                          boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
                        }}
                      />
                    ) : displayFileType.startsWith("video/") ? (
                      <video
                        controls
                        src={displayPreview}
                        className="rounded-3"
                        style={{ 
                          maxHeight: "280px", 
                          maxWidth: "100%",
                          boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
                        }}
                      />
                    ) : (
                      <div className="text-center p-3">
                        <div className="mb-3" style={{ fontSize: "3rem" }}>📎</div>
                        <h6 className="fw-bold">File Uploaded</h6>
                        <p className="text-muted small">{displayFileName}</p>
                      </div>
                    )
                  ) : (
                    <div className="text-center p-4" style={{ maxHeight: "280px", overflowY: "auto", width: "100%" }}>
                      <p style={{ 
                        fontSize: "0.95rem", 
                        lineHeight: "1.8",
                        color: "var(--hint-text-color)",
                        textAlign: "left",
                        whiteSpace: "pre-wrap"
                      }}>
                        {displayText || "Your input content will appear here..."}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Input Analysis and Remarks */}
            <div className="col-lg-6">
              <div className="d-flex flex-column gap-4 h-100">
                {/* Input Analysis - Top Right Box */}
                <div 
                  className="rounded-3 p-4"
                  style={{ 
                    flex: 1,
                    background: "white",
                    border: "2px solid #e9ecef"
                  }}
                >
                  <h5 className="fw-bold mb-3" style={{ color: "var(--text-color)" }}>
                    📊 Analysis Results
                  </h5>
                  {isLoading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary mb-3" style={{ width: "3rem", height: "3rem" }} role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="text-muted fw-semibold">Analyzing your content...</p>
                      <p className="text-muted small">This may take a few moments</p>
                    </div>
                  ) : analysisResult ? (
                    <div>
                      {/* AI-Generated */}
                      <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="fw-semibold" style={{ color: "var(--text-color)" }}>
                            🤖 AI-Generated
                          </span>
                          <span className="fw-bold fs-5" style={{ color: "var(--text-color)" }}>
                            {percentages.ai}%
                          </span>
                        </div>
                        <div className="progress" style={{ height: "14px", borderRadius: "10px", backgroundColor: "var(--progress-danger-bg)" }}>
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{ 
                              width: `${percentages.ai}%`,
                              background: "linear-gradient(90deg, var(--error-color) 0%, #c82333 100%)",
                              transition: "width 1s ease-in-out"
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Human-Written */}
                      <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="fw-semibold" style={{ color: "var(--text-color)" }}>
                            👤 Human-Written
                          </span>
                          <span className="fw-bold fs-5" style={{ color: "var(--text-color)" }}>
                            {percentages.human}%
                          </span>
                        </div>
                        <div className="progress" style={{ height: "14px", borderRadius: "10px", backgroundColor: "var(--progress-success-bg)" }}>
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{ 
                              width: `${percentages.human}%`,
                              background: "linear-gradient(90deg, var(--success-color) 0%, #218838 100%)",
                              transition: "width 1s ease-in-out"
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Mixed */}
                      <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="fw-semibold" style={{ color: "var(--text-color)" }}>
                            ◐ Mixed Content
                          </span>
                          <span className="fw-bold fs-5" style={{ color: "var(--text-color)" }}>
                            {percentages.mixed}%
                          </span>
                        </div>
                        <div className="progress" style={{ height: "14px", borderRadius: "10px", backgroundColor: "var(--progress-warning-bg)" }}>
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{ 
                              width: `${percentages.mixed}%`,
                              background: "linear-gradient(90deg, var(--warning-color) 0%, #e0a800 100%)",
                              transition: "width 1s ease-in-out"
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="text-center mt-4 p-3" style={{ backgroundColor: "var(--secondary-color)", borderRadius: "10px" }}>
                        <p className="text-muted mb-1 small">Analysis Status</p>
                        <p className="fw-bold mb-0" style={{ color: "var(--accent-color)" }}>
                          ✓ {analysisResult.status || "Complete"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📈</div>
                      <p className="text-muted">
                        Analysis results will appear here
                      </p>
                    </div>
                  )}
                </div>

                {/* Remarks - Bottom Right Box */}
                <div 
                  className="rounded-3 p-4"
                  style={{ 
                    flex: 1,
                    background: "white",
                    border: "2px solid #e9ecef"
                  }}
                >
                  <h5 className="fw-bold mb-3" style={{ color: "var(--text-color)" }}>
                    📝 Remarks
                  </h5>
                  <div
                    className="border-0 shadow-sm p-3"
                    style={{ 
                      height: "calc(100% - 50px)",
                      fontSize: "0.95rem",
                      backgroundColor: "var(--secondary-color)",
                      borderRadius: "10px",
                      overflowY: "auto",
                      color: "var(--text-color)"
                    }}
                  >
                    <p className="mb-2"><strong>Status:</strong> {analysisResult?.status || "Complete"}</p>
                    <p className="mb-2"><strong>Scan ID:</strong> {analysisResult?.scanId || "N/A"}</p>
                    <p className="mb-2"><strong>Timestamp:</strong> {analysisResult?.timestamp ? new Date(analysisResult.timestamp).toLocaleString() : "N/A"}</p>
                    <hr className="my-3" />
                    <p className="mb-1"><strong>Result:</strong> {verdict.text}</p>
                    <p className="mb-0 small text-muted">Based on the analysis, this content shows {percentages.human}% human characteristics and {percentages.ai}% AI-generated patterns.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="d-flex justify-content-center gap-3 mt-4 flex-wrap">
            <button 
              className="btn btn-lg px-5 py-3 d-flex align-items-center gap-2"
              onClick={handleDownloadResult}
              disabled={!analysisResult}
              style={{
                background: "black",
                border: "none",
                borderRadius: "15px",
                color: "white",
                fontWeight: "600",
                transition: "all 0.3s ease"
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
              <FaDownload /> Download Report
            </button>
            <button 
              className="btn btn-lg px-5 py-3 d-flex align-items-center gap-2"
              onClick={handleShareResult}
              disabled={!analysisResult}
              style={{
                background: "black",
                border: "none",
                borderRadius: "15px",
                color: "white",
                fontWeight: "600",
                transition: "all 0.3s ease"
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
              <FaShare /> Share Results
            </button>
            <button 
              className="btn btn-lg px-5 py-3 d-flex align-items-center gap-2"
              onClick={handleAnotherEntry}
              style={{
                background: "black",
                border: "none",
                borderRadius: "15px",
                color: "white",
                fontWeight: "600",
                transition: "all 0.3s ease"
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
              <FaRedo /> New Analysis
            </button>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
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
          
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          
          .btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        `}
      </style>
    </div>
  );
}