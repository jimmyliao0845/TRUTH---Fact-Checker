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

    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Only DOCX are allowed!");
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

      <div className="main-content flex-grow-1 bg-light text-dark p-4 position-relative">
        {/* Title */}
        <h4 className="fw-bold text-center mb-4">Talk With T.R.U.T.H</h4>

        {/* Two Columns (Chat + Box) */}
        <div className="d-flex justify-content-center align-items-start mb-4 gap-4">
          <div
            className="bg-secondary rounded shadow-sm"
            style={{ width: "400px", height: "200px" }}
          ></div>
          <div
            className="border rounded shadow-sm"
            style={{ width: "200px", height: "200px" }}
          ></div>
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
          ></textarea>

          {/* Buttons */}
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <button
              className="btn btn-dark px-4"
              onClick={() => navigate("/analysis-result-logged-in")}
            >
              Enter Input
            </button>

            {/* Single Upload Button */}
            <button
              className="btn btn-dark px-4"
              onClick={() => fileInputRef.current.click()}
            >
              Upload File/s
            </button>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              accept=".docx,image/*,video/*"
              onChange={handleFileUpload}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
