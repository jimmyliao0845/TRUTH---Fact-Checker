import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import "bootstrap/dist/css/bootstrap.min.css";
import "./analysis.css";

export default function AnalysisPageLoggedIn() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Redirect if NOT logged in
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/analysis");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/gif",
      "video/mp4",
      "video/webm",
      "video/ogg",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Only DOCX, images, and videos are allowed!");
      return;
    }

    console.log("Selected file:", file);

    // Navigate after selecting a file (optional)
    navigate("/upload");
  };

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div className="analysis-sidebar d-flex flex-column align-items-center justify-content-start p-3">
        <div className="mb-4">
          <a href="/">
            <img src="/assets/digima_logo.svg" width="50" alt="home" />
          </a>
        </div>
        <div className="white-box p-3 mt-3">
        </div>
      </div>

      {/* Main Content */}
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
