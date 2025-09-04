import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import "bootstrap/dist/css/bootstrap.min.css";
import "./analysis.css";

export default function AnalysisPageLoggedIn() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if NOT logged in
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/analysis");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div className="analysis-sidebar d-flex flex-column align-items-center justify-content-start p-3">
        {/* Home Icon */}
        <div className="mb-4">
          <a href="/analysis-logged">
            <img src="/assets/digima_logo.svg" width="50" alt="home" />
          </a>
        </div>
        <div className="white-box p-3 mt-3">
          <p>Welcome back! You’re logged in.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="analysis-main position-relative flex-grow-1">
        <div className="analysis-container">
          <h1 className="fw-bold mb-4">Analyze With DiGiMa</h1>

          <div
            className="bg-light p-4 rounded shadow-sm"
            style={{ width: "60%" }}
          >
            <label htmlFor="text-input" className="form-label">
              Enter your Text
            </label>
            <textarea
              id="text-input"
              className="form-control mb-3"
              rows="4"
            ></textarea>

            <div className="d-flex justify-content-center gap-3 flex-wrap">
              <button
                className="btn btn-dark px-4"
                onClick={() => navigate("/analysis-result-logged-in")}
              >
                Enter Input
              </button>
              <button
                className="btn btn-dark px-4"
                onClick={() => navigate("/upload")}
              >
                Upload Docs
              </button>
              <button
                className="btn btn-dark px-4"
                onClick={() => navigate("/upload")}
              >
                Upload Image
              </button>
              <button
                className="btn btn-dark px-4"
                onClick={() => navigate("/upload")}
              >
                Upload Video
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
