import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      alert("Signed out successfully");
    } catch (error) {
      console.error("Sign-out error:", error);
    }
  };

  return (
    <nav 
      className="navbar navbar-expand-lg navbar-dark bg-custom px-3"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1050,
      }}
    >
      <div className="container-fluid d-flex align-items-center justify-content-between">
        {/* Left: Brand */}
        <Link className="navbar-brand fw-bold" to="/">
          T.R.U.T.H.
        </Link>

        {/* Center: (optional tools dropdown placeholder) */}
        <div className="d-none d-lg-flex position-absolute top-50 start-50 translate-middle">
          <ul className="navbar-nav">
            <li className="nav-item dropdown">
              <ul
                className="dropdown-menu shadow-lg"
                style={{
                  backgroundColor: "#09090d",
                  borderRadius: "10px",
                  border: "2px solid #3a305033",
                }}
              >
                <li>
                  <Link className="dropdown-item text-white" to="/deepfake">
                    DeepFake Checker
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item text-white" to="/plagiarism">
                    Plagiarism Checker
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item text-white" to="/fact-checker">
                    Fact Checker
                  </Link>
                </li>
              </ul>
            </li>
          </ul>
        </div>

        {/* Right Side: Buttons / Profile */}
        <div className="d-flex align-items-center">
          {/* 🔁 Dashboard ↔ Analysis Button */}
          {user && (
            <>
              {location.pathname !== "/fact-checker-dashboard" ? (
                <Link
                  to="/fact-checker-dashboard"
                  className="btn btn-outline-light rounded-pill px-3 py-1 me-3"
                >
                  <i className="bi bi-speedometer2 me-1"></i> Dashboard
                </Link>
              ) : (
                <Link
                  to="/analysis-logged"
                  className="btn btn-outline-primary rounded-pill px-3 py-1 me-3"
                >
                  <i className="bi bi-arrow-left-circle me-1"></i> Back to Analysis
                </Link>
              )}
            </>
          )}

          {/* Auth Buttons or Profile */}
          {!user ? (
            <>
              <Link
                to="/login"
                id="login-btn"
                className="btn btn-outline-light rounded-pill px-4 py-2 me-2"
              >
                Log In
              </Link>
              <Link
                to="/register"
                id="signup-btn"
                className="btn btn-light rounded-pill px-4 py-2"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <div className="dropdown">
              <img
                src={user.photoURL || "/assets/default-avatar.png"}
                alt="Profile"
                className="rounded-circle"
                width="40"
                height="40"
                style={{ cursor: "pointer" }}
                data-bs-toggle="dropdown"
                aria-expanded="false"
              />
              <ul
                className="dropdown-menu dropdown-menu-end p-3 shadow-lg"
                style={{
                  backgroundColor: "#09090d",
                  borderRadius: "10px",
                  border: "2px solid #3a305033",
                }}
              >
                <li>
                  <button
                    className="btn bg-custom btn-outline-light text-white btn-sm w-100 d-flex align-items-center justify-content-start mb-2"
                  >
                    <i className="bi bi-gear me-2"></i> Settings
                  </button>
                  <button
                    className="btn bg-custom btn-outline-light text-white btn-sm w-100 d-flex align-items-center justify-content-start"
                    onClick={handleSignOut}
                  >
                    <i className="bi bi-box-arrow-right me-2"></i> Sign Out
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}