import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import "bootstrap/dist/css/bootstrap.min.css";
import "./analysis.css";

export default function AnalysisPageNotLoggedIn() {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/analysis-logged");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div className="analysis-sidebar d-flex flex-column justify-content-start align-items-center">
        <div className="mb-4">
          <a href="/">
            <img src="/assets/digima_logo.svg" width="50" alt="home" />
          </a>
        </div>
        <div className="mb-4">
          <a href="/login">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3064/3064197.png"
              width="40"
              alt="lock"
            />
          </a>
        </div>
        <p className="small fw-semibold text-center">
          Register and Login
          <br />
          Your Account
          <br />
          For more Features
        </p>
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
      
            <div className="d-flex justify-content-center gap-3">
              <button
                className="btn btn-dark px-4"
                onClick={() => navigate("/analysis-result-not-login")}
              >
                Enter Input
              </button>
              <button
                className="btn btn-dark px-4"
                onClick={() => navigate("/upload")}
              >
                Upload Docs
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
