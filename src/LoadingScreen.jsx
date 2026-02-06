import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function LoadingScreen() {
  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        zIndex: 9999,
      }}
    >
      {/* Spinner */}
      <div
        className="spinner-border" style={{ color: "var(--accent-color)" }}
        role="status"
        style={{ width: "4rem", height: "4rem" }}
      >
        <span className="visually-hidden">Loading...</span>
      </div>
      
      {/* Loading Text */}
      <h4 className="text-light mt-4 fw-bold">Loading...</h4>
      
    </div>
  );
}