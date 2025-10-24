import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // ✅ added useNavigate
import { auth } from "./firebase";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./styles.css";
import "./night-mode.css";
import "./social-login.css";

export default function LoginPage() {
  const navigate = useNavigate(); // ✅ initialize navigate
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isNightMode, setIsNightMode] = useState(
    localStorage.getItem("theme") === "night"
  );

  const googleProvider = new GoogleAuthProvider();
  const githubProvider = new GithubAuthProvider();

  useEffect(() => {
    document.body.classList.toggle("night-mode", isNightMode);
    localStorage.setItem("theme", isNightMode ? "night" : "day");
  }, [isNightMode]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/"); // ✅ replaced window.location.href
    } catch (err) {
      alert(err.message);
    }
  };

  const handleProviderLogin = async (provider) => {
    try {
      await signInWithPopup(auth, provider);
      navigate("/"); // ✅ replaced window.location.href
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
    <div className="container-fuild">
      <div className="row justify-content-center align-items-center vh-100 overflow-auto flex-wrap">
        <div className="col-lg-4 mx-auto">
          <form
            onSubmit={handleLogin}
            className="d-flex justify-content-center align-items-center"
          >
            <div className="d-flex flex-column justify-content-lg-center p-4 p-lg-0 pb-0 flex-fill">
              <div className="mx-auto mb-5 text-center">
                <img
                  src="/assets/digima_logo.svg"
                  alt="logo"
                  className="img-fluid"
                  style={{ width: "120px" }}
                />
              </div>
              <div className="card border-0 p-lg-3 shadow-lg">
                <div className="card-body">
                  <div
                    className="toggle-switch"
                    onClick={() => setIsNightMode(!isNightMode)}
                  >
                    <div className="toggle-circle">
                      {isNightMode ? "☀️" : "🌙"}
                    </div>
                  </div>
                  <div className="text-center mb-3">
                    <h5>Sign In</h5>
                  </div>

                  {/* Email */}
                  <div className="mb-3">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  {/* Password */}
                  <div className="mb-1">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  {/* Forgot Password Link */}
                  <div className="text-end mb-3">
                    <Link to="/forgot-password" className="small">
                      Forgot Password?
                    </Link>
                  </div>

                  {/* Sign In Button */}
                  <div className="mb-1">
                    <button type="submit" className="btn btn-dark w-100">
                      Sign In
                    </button>
                  </div>

                  <div className="login-or"></div>
                  <span className="span-or">Or:</span>

                  {/* Social Buttons */}
                  <div className="d-flex align-items-center justify-content-center flex-wrap">
                    <div className="text-center me-2 flex-fill">
                      <button
                        type="button"
                        onClick={() => handleProviderLogin(githubProvider)}
                        className="register-social-btn w-100 d-flex align-items-center justify-content-center"
                        style={{
                          borderRadius: "10px",
                          padding: "10px",
                          height: "50px",
                          fontWeight: "500",
                        }}
                      >
                        <img
                          src="/assets/github.svg"
                          alt="GitHub"
                          style={{
                            width: "24px",
                            height: "24px",
                            marginRight: "10px",
                          }}
                        />
                        Continue with GitHub
                      </button>
                    </div>

                    <div className="text-center me-2 flex-fill mt-2 mt-md-0">
                      <button
                        type="button"
                        onClick={() => handleProviderLogin(googleProvider)}
                        className="register-social-btn w-100 d-flex align-items-center justify-content-center"
                        style={{
                          borderRadius: "10px",
                          padding: "10px",
                          height: "50px",
                          fontWeight: "500",
                        }}
                      >
                        <img
                          src="/assets/google.svg"
                          alt="Google"
                          style={{
                            width: "24px",
                            height: "24px",
                            marginRight: "10px",
                          }}
                        />
                        Continue with Google
                      </button>
                    </div>
                  </div>

                  {/* Sign Up Link */}
                  <div className="text-center mt-3">
                    <h6>
                      Don’t have an account yet?{" "}
                      <Link to="/register">Sign up</Link>
                    </h6>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
