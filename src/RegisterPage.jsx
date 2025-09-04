import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./register.css";
import "./styles.css";
import "./night-mode.css";
import "./social-login.css";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isNightMode, setIsNightMode] = useState(
    localStorage.getItem("theme") === "night"
  );

  const googleProvider = new GoogleAuthProvider();
  const githubProvider = new GithubAuthProvider();

  useEffect(() => {
    document.body.classList.toggle("night-mode", isNightMode);
    localStorage.setItem("theme", isNightMode ? "night" : "light");
  }, [isNightMode]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      alert("Passwords do not match");
      return;
    }
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCred.user, { displayName: name });
      alert("Registration successful!");
      window.location.href = "/";
    } catch (err) {
      alert(err.message);
    }
  };

  const handleProviderLogin = async (provider) => {
    try {
      await signInWithPopup(auth, provider);
      window.location.href = "/";
    } catch (err) {
      if (
        err.code === "auth/cancelled-popup-request" ||
        err.code === "auth/popup-closed-by-user"
      ) {
        console.log("Popup closed by user");
        return;
      }
      alert(err.message);
    }
  };

  return (
    <div className="container-fluid">
      <div className="w-100 overflow-hidden position-relative flex-wrap d-block vh-100">
        <div className="row justify-content-center align-items-center vh-100 overflow-auto flex-wrap">
          <div className="col-lg-4 mx-auto register-container">
            <form
              onSubmit={handleRegister}
              className="d-flex justify-content-center align-items-center"
            >
              <div className="d-flex flex-column justify-content-lg-center p-4 p-lg-0 pb-0 flex-fill">
                <div className="mx-auto mb-5 text-center">
                  <img
                    src="/assets/digima_logo.svg"
                    alt="Logo"
                    className="img-fluid"
                    style={{ width: "120px", height: "auto" }}
                  />
                </div>
                <div className="card border-0 p-lg-3 shadow-lg rounded-2">
                  <div className="card-body">
                    <div className="register-toggle-wrapper">
                      <div
                        className="toggle-switch"
                        onClick={() => setIsNightMode(!isNightMode)}
                      >
                        <div className="toggle-circle">
                          {isNightMode ? "☀️" : "🌙"}
                        </div>
                      </div>
                    </div>
                    <div className="text-center mb-3">
                      <h5 className="mb-2">Sign Up</h5>
                    </div>

                    {/* Full Name */}
                    <div className="mb-3">
                      <label className="form-label">Full Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>

                    {/* Email */}
                    <div className="mb-3">
                      <label className="form-label">Email Address</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="Enter Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    {/* Password */}
                    <div className="mb-3">
                      <label className="form-label">Password</label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="**************"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>

                    {/* Confirm Password */}
                    <div className="mb-3">
                      <label className="form-label">Confirm Password</label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="**************"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        required
                      />
                    </div>

                    {/* Terms */}
                    <div className="d-flex align-items-center justify-content-between mb-3 register-terms">
                      <div className="form-check form-check-md mb-0">
                        <input
                          className="form-check-input"
                          id="remember_me"
                          type="checkbox"
                        />
                        <label htmlFor="remember_me" className="form-check-label mt-0">
                          I agree to the
                        </label>
                        <div className="d-inline-flex">
                          <a href="#" className="me-1">
                            Terms of Service
                          </a>{" "}
                          and{" "}
                          <a href="#" className="ms-1">
                            Privacy Policy
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Sign Up Button */}
                    <div className="mb-1">
                      <button type="submit" className="btn btn-signup w-100">
                        Sign Up
                      </button>
                    </div>

                    {/* OR Separator */}
                    <div className="login-or">
                      <span className="span-or">Or:</span>
                    </div>

                    {/* Social Login Buttons */}
                    <div className="d-flex align-items-center justify-content-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleProviderLogin(githubProvider)}
                        className="register-social-btn w-100 d-flex align-items-center justify-content-center"
                      >
                        <img
                          className="img-fluid m-1"
                          src="/assets/github.svg"
                          alt="GitHub"
                          style={{ width: "24px", height: "24px" }}
                        />
                        <span className="ms-2">GitHub</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleProviderLogin(googleProvider)}
                        className="register-social-btn w-100 d-flex align-items-center justify-content-center"
                      >
                        <img
                          className="img-fluid m-1"
                          src="/assets/google.svg"
                          alt="Google"
                          style={{ width: "24px", height: "24px" }}
                        />
                        <span className="ms-2">Google</span>
                      </button>
                    </div>

                    {/* Sign In Link */}
                    <div className="text-center pt-3">
                      <h6 className="fw-normal fs-14 mb-0">
                        Already have an account?
                        <Link to="/login" className="hover-a"> Sign In</Link>
                      </h6>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
