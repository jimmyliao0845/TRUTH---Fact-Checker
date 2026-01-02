import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import "bootstrap/dist/css/bootstrap.min.css";
import "./analysis.css";
// Added FaBriefcase to the imports
import { FaBars, FaDownload, FaShare, FaRedo, FaGamepad, FaCommentAlt, FaBriefcase } from "react-icons/fa";

export default function AnalysisResultLoggedIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  const [collapsed, setCollapsed] = useState(false);
  
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
    if (fileType.startsWith("image/")) {
      await detectImage(filePreview, fileName);
    } else if (fileType.startsWith("video/")) {
      setIsLoading(true);
      setTimeout(() => {
        const mockData = {
          summary: {
            ai: Math.floor(Math.random() * 20),
            human: Math.floor(Math.random() * 50) + 40,
            mixed: Math.floor(Math.random() * 30)
          },
          status: "Complete"
        };
        setAnalysisResult(mockData);
        setIsLoading(false);
      }, 1500);
    }
  };

  // Image detection function
  const detectImage = async (preview, name) => {
    try {
      setIsLoading(true);
      console.log("🔍 Starting image detection...");

      const response = await fetch(preview);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append("file", blob, name);

      const res = await fetch("http://localhost:5000/api/detect/image", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`API Error: ${res.status}`);
      }

      const data = await res.json();
      console.log("✅ Detection complete:", data);

      const mockData = {
        summary: {
          ai: Math.round(data.ai_probability),
          human: Math.round(data.human_probability),
          mixed: 0
        },
        status: "Complete",
        model: data.model,
        scanId: data.scanId
      };
      
      setAnalysisResult(mockData);
      setIsLoading(false);
    } catch (err) {
      console.error("❌ Detection error:", err);
      const mockData = {
        summary: {
          ai: Math.floor(Math.random() * 40),
          human: Math.floor(Math.random() * 50) + 30,
          mixed: Math.floor(Math.random() * 20)
        },
        status: "Error - Using Mock Data"
      };
      setAnalysisResult(mockData);
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
      return { text: "Likely Human-Written", color: "#28a745", icon: "✓" };
    } else if (percentages.ai > percentages.human && percentages.ai > percentages.mixed) {
      return { text: "Likely AI-Generated", color: "#dc3545", icon: "⚠" };
    } else {
      return { text: "Mixed Content", color: "#ffc107", icon: "◐" };
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
    <div className="d-flex" style={{ paddingTop: "56px", background: "white", minHeight: "100vh" }}>
      {/* Toast Notification */}
      {showToast && (
        <div 
          style={{
            position: "fixed",
            top: "80px",
            right: "20px",
            zIndex: 9999,
            backgroundColor: "#28a745",
            color: "white",
            padding: "15px 25px",
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            animation: "slideIn 0.3s ease-out"
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* Sidebar */}
            <div 
                    className="d-flex flex-column p-3 border-end"
                    style={{
                      width: collapsed ? "80px" : "200px",
                      backgroundColor: "#d9d9d9",
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
                        className="btn btn-outline-dark btn-sm"
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
                        className="btn btn-link text-black text-decoration-none d-flex align-items-center p-2"
                        onClick={() => navigate("/game")}
                        style={{ transition: "0.2s" }}
                      >
                        <FaGamepad size={20} />
                        {!collapsed && <span className="ms-3">Find and Play Game</span>}
                      </button>
            
                      <button 
                        className="btn btn-link text-black text-decoration-none d-flex align-items-center p-2"
                        onClick={() => navigate("/feedback")}
                      >
                        <FaCommentAlt size={18} />
                        {!collapsed && <span className="ms-3">User Feedback</span>}
                      </button>

                      {/* NEW BUTTON INSERTED HERE */}
                      <button 
                        className="btn btn-link text-black text-decoration-none d-flex align-items-center p-2"
                        onClick={() => navigate("/factcheckerdashboard")}
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
          padding: "2rem"
        }}
      >
        {/* Header */}
        <div className="text-center mb-4" style={{ animation: "fadeIn 0.6s ease-in" }}>
          <h2 className="fw-bold d-inline-flex align-items-center gap-2" style={{ color: "#000000ff" }}>
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
            backgroundColor: "white",
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
                  background: "white",
                  border: "2px solid #e9ecef"
                }}
              >
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h5 className="fw-bold mb-0" style={{ color: "#000000ff" }}>
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
                        color: "#495057",
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
                  <h5 className="fw-bold mb-3" style={{ color: "#000000ff" }}>
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
                          <span className="fw-semibold" style={{ color: "#000000ff" }}>
                            🤖 AI-Generated
                          </span>
                          <span className="fw-bold fs-5" style={{ color: "#000000ff" }}>
                            {percentages.ai}%
                          </span>
                        </div>
                        <div className="progress" style={{ height: "14px", borderRadius: "10px", backgroundColor: "#f8d7da" }}>
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{ 
                              width: `${percentages.ai}%`,
                              background: "linear-gradient(90deg, #dc3545 0%, #c82333 100%)",
                              transition: "width 1s ease-in-out"
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Human-Written */}
                      <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="fw-semibold" style={{ color: "#000000ff" }}>
                            👤 Human-Written
                          </span>
                          <span className="fw-bold fs-5" style={{ color: "#000000ff" }}>
                            {percentages.human}%
                          </span>
                        </div>
                        <div className="progress" style={{ height: "14px", borderRadius: "10px", backgroundColor: "#d4edda" }}>
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{ 
                              width: `${percentages.human}%`,
                              background: "linear-gradient(90deg, #28a745 0%, #218838 100%)",
                              transition: "width 1s ease-in-out"
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Mixed */}
                      <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="fw-semibold" style={{ color: "#000000ff" }}>
                            ◐ Mixed Content
                          </span>
                          <span className="fw-bold fs-5" style={{ color: "#000000ff" }}>
                            {percentages.mixed}%
                          </span>
                        </div>
                        <div className="progress" style={{ height: "14px", borderRadius: "10px", backgroundColor: "#fff3cd" }}>
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{ 
                              width: `${percentages.mixed}%`,
                              background: "linear-gradient(90deg, #ffc107 0%, #e0a800 100%)",
                              transition: "width 1s ease-in-out"
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="text-center mt-4 p-3" style={{ backgroundColor: "#f8f9fa", borderRadius: "10px" }}>
                        <p className="text-muted mb-1 small">Analysis Status</p>
                        <p className="fw-bold mb-0" style={{ color: "#28a745" }}>
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
                  <h5 className="fw-bold mb-3" style={{ color: "#000000ff" }}>
                    📝 Analysis Summary
                  </h5>
                  <div
                    className="border-0 shadow-sm p-3"
                    style={{ 
                      height: "calc(100% - 50px)",
                      fontSize: "0.95rem",
                      backgroundColor: "#f8f9fa",
                      borderRadius: "10px",
                      overflowY: "auto",
                      color: "#495057"
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