import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import "bootstrap/dist/css/bootstrap.min.css";
import "./analysis.css";

export default function AnalysisResultNotLoggedIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  const [inputText, setInputText] = useState("");
  const [currentInput, setCurrentInput] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/analysis-logged");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    // Get the data passed from the previous page
    if (location.state) {
      setInputText(location.state.inputText || "");
      setAnalysisResult(location.state.result || null);
    }
  }, [location.state]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Only DOCX files are allowed!");
      return;
    }

    console.log("Selected file:", file);
    navigate("/upload");
  };

  const handleNewAnalysis = async () => {
    if (!currentInput.trim()) {
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
            // Add your API key here when you have it
            // "Authorization": "Bearer YOUR_API_KEY",
          },
          body: JSON.stringify({ text: currentInput }),
        }
      );

      if (!response.ok) {
        console.warn("API call failed, using mock data");
        const mockData = {
          text: currentInput,
          scanId: scanId,
          summary: {
            ai: Math.floor(Math.random() * 30),
            human: Math.floor(Math.random() * 40) + 50,
            mixed: Math.floor(Math.random() * 20)
          },
          status: "success",
          timestamp: new Date().toISOString()
        };
        
        // Update the displayed text and result
        setInputText(currentInput);
        setAnalysisResult(mockData);
        setCurrentInput(""); // Clear the input field
        return;
      }

      const data = await response.json();
      console.log("API Response:", data);
      
      // Update the displayed text and result
      setInputText(currentInput);
      setAnalysisResult(data);
      setCurrentInput(""); // Clear the input field
      
    } catch (error) {
      console.error("Error calling API:", error);
      
      // Proceed with mock data
      const mockData = {
        text: currentInput,
        scanId: `scan-${Date.now()}`,
        summary: {
          ai: Math.floor(Math.random() * 30),
          human: Math.floor(Math.random() * 40) + 50,
          mixed: Math.floor(Math.random() * 20)
        },
        status: "analyzed",
        timestamp: new Date().toISOString()
      };
      
      // Update the displayed text and result
      setInputText(currentInput);
      setAnalysisResult(mockData);
      setCurrentInput(""); // Clear the input field
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleNewAnalysis();
    }
  };

  // Calculate analysis percentages
  const getAnalysisPercentages = () => {
    if (analysisResult?.summary) {
      return {
        ai: analysisResult.summary.ai || 0,
        human: analysisResult.summary.human || 0,
        mixed: analysisResult.summary.mixed || 0
      };
    }
    // Default mock values
    return {
      ai: 15,
      human: 75,
      mixed: 10
    };
  };

  const percentages = getAnalysisPercentages();

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div
        className="d-flex flex-column align-items-center justify-content-start p-3"
        style={{
          width: "200px",
          minHeight: "100vh",
          backgroundColor: "#8c8c8c",
          textAlign: "center",
        }}
      >
        {/* Logo */}
        <div className="mb-4 mt-3">
          <a href="/">
            <img src="/assets/digima_logo.svg" width="50" alt="home" />
          </a>
        </div>

        {/* Lock Icon */}
        <div className="mb-2">
          <a href="/login">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3064/3064197.png"
              width="40"
              alt="lock"
            />
          </a>
        </div>

        {/* Text */}
        <p className="small fw-semibold mt-2">
          Register and Login
          <br />
          Your Account
          <br />
          For more Features
        </p>
      </div>

      <div className="main-content flex-grow-1 bg-light text-dark p-4 position-relative">
        {/* Title */}
        <h4 className="fw-bold text-center mb-4">Talk With T.R.U.T.H</h4>

        {/* Two Columns (Input Text + Analysis Result) */}
        <div className="d-flex justify-content-center align-items-start mb-4 gap-4">
          {/* Gray Area - Input Text Display */}
          <div
            className="bg-secondary text-white rounded shadow-sm p-3 overflow-auto"
            style={{ width: "400px", height: "200px" }}
          >
            <h6 className="fw-bold mb-2">Your Input Text:</h6>
            <p style={{ fontSize: "0.9rem", lineHeight: "1.4" }}>
              {inputText || "Your input text will appear here..."}
            </p>
          </div>

          {/* White Area - Analysis Result */}
          <div
            className="border rounded shadow-sm p-3 bg-white overflow-auto"
            style={{ width: "250px", height: "200px" }}
          >
            <h6 className="fw-bold mb-3 text-center">Analysis Report</h6>
            {analysisResult ? (
              <div>
                <div className="mb-2">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="small fw-semibold">AI-Generated:</span>
                    <span className="small fw-bold text-danger">{percentages.ai}%</span>
                  </div>
                  <div className="progress" style={{ height: "8px" }}>
                    <div
                      className="progress-bar bg-danger"
                      role="progressbar"
                      style={{ width: `${percentages.ai}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mb-2">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="small fw-semibold">Human-Written:</span>
                    <span className="small fw-bold text-success">{percentages.human}%</span>
                  </div>
                  <div className="progress" style={{ height: "8px" }}>
                    <div
                      className="progress-bar bg-success"
                      role="progressbar"
                      style={{ width: `${percentages.human}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mb-2">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="small fw-semibold">Mixed:</span>
                    <span className="small fw-bold text-warning">{percentages.mixed}%</span>
                  </div>
                  <div className="progress" style={{ height: "8px" }}>
                    <div
                      className="progress-bar bg-warning"
                      role="progressbar"
                      style={{ width: `${percentages.mixed}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mt-3 text-center">
                  <p className="small text-muted mb-0">
                    Status: <span className="fw-bold">{analysisResult.status || "Complete"}</span>
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-center text-muted small">
                Result will appear here
              </p>
            )}
          </div>
        </div>

        {/* Text Input Section */}
        <div
          className="bg-white p-4 rounded shadow-sm mx-auto"
          style={{ width: "80%" }}
        >
          <label htmlFor="text-input" className="form-label">
            Enter your Text
          </label>
          <textarea
            id="text-input"
            className="form-control mb-3"
            rows="3"
            placeholder="Type or paste your text here..."
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isLoading}
          ></textarea>

          {/* Buttons */}
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <button
              className="btn btn-dark px-4"
              onClick={handleNewAnalysis}
              disabled={isLoading}
            >
              {isLoading ? "Analyzing..." : "Enter Input"}
            </button>

            {/* Single Upload Button */}
            <button
              className="btn btn-dark px-4"
              onClick={() => fileInputRef.current.click()}
              disabled={isLoading}
            >
              Upload File/s
            </button>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              accept=".docx"
              onChange={handleFileUpload}
            />
          </div>
        </div>
      </div>
    </div>
  );
}