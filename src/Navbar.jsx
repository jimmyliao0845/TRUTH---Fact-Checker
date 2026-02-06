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
      if (currentUser) {
        setUser({
          ...currentUser,
          avatar: currentUser.photoURL || "/assets/default-avatar.png",
        });
      } else {
        setUser(null);
      }
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

        {/* Right Side: Buttons / Profile */}
        <div className="d-flex align-items-center">
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
                src={user?.avatar || "/assets/default-avatar.png"}
                alt="Profile"
                className="rounded-circle"
                width="42"
                height="42"
                style={{
                  cursor: "pointer",
                  objectFit: "cover",
                  border: "2px solid rgba(255,255,255,0.2)",
                }}
                data-bs-toggle="dropdown"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/assets/default-avatar.png";
                }}
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
                  <Link
                    to="/settings"
                    className="btn bg-custom btn-outline-light text-white btn-sm w-100 d-flex align-items-center justify-content-start mb-2"
                  >
                    <i className="bi bi-gear me-2"></i> Settings
                  </Link>
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
