import React, { useState } from "react";

export default function ForgotPasswordStep2() {
  const [darkMode, setDarkMode] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const toggleTheme = () => setDarkMode(!darkMode);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    alert("Password changed successfully! (Connect backend here)");
  };

  return (
    <div className={darkMode ? "dark-mode" : ""} style={{ minHeight: "100vh" }}>
      {/* Navbar */}
      <div
        className="navbar d-flex justify-content-between align-items-center px-3"
        style={{
          backgroundColor: darkMode ? "#000" : "#fff",
          color: darkMode ? "#fff" : "#000",
          borderBottom: "1px solid #ccc",
        }}
      >
        <div className="logo-container d-flex align-items-center gap-2">
          <img src="/assets/digima_logo.svg" alt="Logo" width="40" height="40" />
          <span>DiGiMa</span>
        </div>
        <div>
          <button
            className="theme-toggle btn btn-sm"
            onClick={toggleTheme}
            style={{
              border: `1px solid ${darkMode ? "#fff" : "#000"}`,
              color: darkMode ? "#fff" : "#000",
            }}
          >
            {darkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="container text-center pt-5">
        <h1 className="fw-bold mb-4">Create New Password</h1>
        <div
          className="form-box p-4 rounded"
          style={{
            backgroundColor: darkMode ? "#333" : "#ddd",
            display: "inline-block",
            minWidth: "320px",
          }}
        >
          <form onSubmit={handleSubmit}>
            <p>New Password</p>
            <input
              type="password"
              placeholder="New Password"
              className="form-control mb-3"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <p>Confirm Password</p>
            <input
              type="password"
              placeholder="Confirm Password"
              className="form-control mb-4"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <button type="submit" className="btn btn-dark w-100">
              Proceed
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
