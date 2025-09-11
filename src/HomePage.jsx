import React from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./styles.css";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div>
      {/* Main home page content */}
      <div className="main-content">
        <h1>T.R.U.T.H.</h1>
        <div className="subtitle">DeepFake or AI Checker</div>
        <button
          className="try-btn"
          onClick={() => navigate("/analysis")}
        >
          Try T.R.U.T.H.
        </button>
      </div>

      {/* About section */}
      <section>
        <h2>About T.R.U.T.H.</h2>
        <p>
          Introducing T.R.U.T.H., an AI-powered platform designed to ensure the
          integrity and authenticity of digital content.
        </p>
        <div className="features-title">Features:</div>
        <ul>
          <li>
            <strong>Image or Video Checker</strong> -{" "}
            <span>For registered users only</span>
          </li>
          <li>
            <strong>Text Checker</strong>
          </li>
        </ul>
      </section>
    </div>
  );
}
