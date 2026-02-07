import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { ColorThemeManager } from "./ColorManager/Marketplace";
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
      // Reset theme to default (Black) on logout
      ColorThemeManager.resetToDefault();
      
      await signOut(auth);
      alert("Signed out successfully");
    } catch (error) {
      console.error("Sign-out error:", error);
    }
  };

  return (
    <nav 
      className="navbar navbar-expand-lg px-3"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1050,
        backgroundColor: "var(--navbar-color)",
        borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
      }}
    >
      <div className="container-fluid d-flex align-items-center justify-content-between">
        {/* Left: Brand */}
        <Link className="navbar-brand fw-bold" to="/" style={{ color: "var(--text-color)" }}>
          T.R.U.T.H.
        </Link>

        {/* Right Side: Buttons / Profile */}
        <div className="d-flex align-items-center">
          {/* Auth Buttons or Profile */}
          {!user ? (
            <>
              <Link
                to="/login"
                className="btn rounded-pill px-4 py-2 me-2"
                style={{
                  backgroundColor: "transparent",
                  color: "var(--text-color)",
                  border: "2px solid var(--text-color)",
                  transition: "all 0.3s ease"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--text-color)";
                  e.currentTarget.style.color = "var(--primary-color)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "var(--text-color)";
                }}
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="btn rounded-pill px-4 py-2"
                style={{
                  backgroundColor: "var(--text-color)",
                  color: "var(--primary-color)",
                  border: "2px solid var(--text-color)",
                  fontWeight: "600",
                  transition: "all 0.3s ease"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "var(--text-color)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--text-color)";
                  e.currentTarget.style.color = "var(--primary-color)";
                }}
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
                  border: "2px solid var(--text-color)",
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
                  backgroundColor: "var(--primary-color)",
                  borderRadius: "10px",
                  border: "2px solid var(--accent-color)",
                }}
              >
                <li>
                  <Link
                    to="/user/profile"
                    className="btn btn-sm w-100 d-flex align-items-center justify-content-start mb-2"
                    style={{
                      backgroundColor: "var(--secondary-color)",
                      color: "var(--text-color)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      transition: "all 0.3s ease"
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--accent-color)";
                      e.currentTarget.style.color = "#ffffff";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--secondary-color)";
                      e.currentTarget.style.color = "var(--text-color)";
                    }}
                  >
                    <i className="bi bi-person me-2"></i> Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="btn btn-sm w-100 d-flex align-items-center justify-content-start mb-2"
                    style={{
                      backgroundColor: "var(--secondary-color)",
                      color: "var(--text-color)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      transition: "all 0.3s ease"
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--accent-color)";
                      e.currentTarget.style.color = "#ffffff";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--secondary-color)";
                      e.currentTarget.style.color = "var(--text-color)";
                    }}
                  >
                    <i className="bi bi-gear me-2"></i> Settings
                  </Link>
                  <button
                    className="btn btn-sm w-100 d-flex align-items-center justify-content-start"
                    style={{
                      backgroundColor: "var(--secondary-color)",
                      color: "var(--text-color)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      transition: "all 0.3s ease"
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--accent-color)";
                      e.currentTarget.style.color = "#ffffff";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--secondary-color)";
                      e.currentTarget.style.color = "var(--text-color)";
                    }}
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
