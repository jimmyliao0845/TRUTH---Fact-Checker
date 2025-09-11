import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import "bootstrap/dist/css/bootstrap.min.css";
import "./analysis.css";

export default function AnalysisPageNotLoggedIn() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/analysis-logged");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      alert("Only DOCX files are allowed!");
      return;
    }

    console.log("Selected file:", file);
    navigate("/upload");
  };

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

      {/* Main Content */}
      <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center">
        <h1 className="fw-bold mb-4 text-center">Analyze With T.R.U.T.H.</h1>

        <div
          className="bg-light p-4 rounded shadow-sm"
          style={{ width: "60%", textAlign: "center" }}
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
              onClick={() => fileInputRef.current.click()}
            >
              Upload Docs
            </button>

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
