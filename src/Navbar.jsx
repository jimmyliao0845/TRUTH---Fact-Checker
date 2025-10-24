import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function Navbar() {
  const [user, setUser] = useState(null);

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
    <nav className="navbar navbar-expand-lg navbar-dark bg-custom position-relative">
      <div className="container-fluid">

        {/* Left: Brand */}
        <Link className="navbar-brand" to="/">T.R.U.T.H.</Link>

        {/* Center: Nav Links */}
        <div
          className="d-none d-lg-flex position-absolute top-50 start-50 translate-middle"
        >
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

        {/* Right: Auth Buttons */}
        <div className="d-flex align-items-center ms-auto">
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
                role="button"
                tabIndex="0"
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
                    <i className="bi bi-box-arrow-in-right me-2"></i> Sign Out
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
