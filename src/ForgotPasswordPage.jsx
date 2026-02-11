import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 🚀 For demo: navigate straight to step 2
  const handlePasswordReset = (e) => {
    e.preventDefault();
    window.location.href = "/forgot-password-step-2";
  };

  return (
    <div
      className={`min-vh-100 ${isDarkMode ? "bg-dark text-light" : "bg-light text-dark"}`}
    >
      {/* Navbar */}
      <div
        className="d-flex justify-content-between align-items-center p-3 border-bottom"
        style={{ backgroundColor: isDarkMode ? "var(--navbar-color)" : "var(--white-color)" }}
      >
        <div className="d-flex align-items-center gap-2">
          <img
            src="/assets/digima_logo.svg"
            alt="Logo"
            style={{ width: "40px", height: "40px" }}
          />
          <span className="fw-bold fs-5">T.R.U.T.H.</span>
        </div>
        <button
          className="btn btn-sm border"
          onClick={() => setIsDarkMode(!isDarkMode)}
        >
          {isDarkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      {/* Form */}
      <div
        className="container d-flex flex-column justify-content-center align-items-center"
        style={{ minHeight: "80vh" }}
      >
        <h1 className="mb-4 fw-bold">Forgot Password</h1>
        <div
          className="p-4 rounded"
          style={{
            backgroundColor: isDarkMode ? "var(--secondary-color)" : "var(--secondary-color-light)",
            width: "100%",
            maxWidth: "400px",
          }}
        >
          <form onSubmit={handlePasswordReset}>
            <p>Enter your email</p>
            <input
              type="email"
              className="form-control mb-3"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className={`btn w-100 ${
                isDarkMode ? "btn-light text-dark" : "btn-dark text-light"
              }`}
            >
              Send Reset Email
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
