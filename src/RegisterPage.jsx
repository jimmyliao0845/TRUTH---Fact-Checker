import { supabase } from "./supabaseClient";
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
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
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isNightMode, setIsNightMode] = useState(
    localStorage.getItem("theme") === "night"
  );

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [fadeOut, setFadeOut] = useState(false);

  const googleProvider = new GoogleAuthProvider();
  const githubProvider = new GithubAuthProvider();
  

  useEffect(() => {
    if (errorMsg || successMsg) {
      const timer = setTimeout(() => {
        setErrorMsg("");
        setSuccessMsg("");
      }, 5000); // 5 seconds
      return () => clearTimeout(timer);
    }
  }, [errorMsg, successMsg]);



  useEffect(() => {
    if (errorMsg || successMsg) {
      setFadeOut(false); // reset fade
      const fadeTimer = setTimeout(() => setFadeOut(true), 4000); // start fade at 4s
      const clearTimer = setTimeout(() => {
        setErrorMsg("");
        setSuccessMsg("");
        setFadeOut(false); // reset
      }, 4500); // remove message after 4.5s
      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(clearTimer);
      };
    }
  }, [errorMsg, successMsg]);


  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");   // clear previous errors
    setSuccessMsg(""); // clear previous success
  
    if (password !== confirm) {
      setErrorMsg("Passwords do not match");
      return;
    }
  
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCred.user, { displayName: name });
  
      // Send verification email
      await sendEmailVerification(userCred.user);
      setSuccessMsg("Registration successful! Please check your email to verify your account.");
  
      // Insert into Supabase
      const { error } = await supabase.from("Users").insert([
        {
          auth_id: userCred.user.uid,
          email: email,
          role: "user",
          provider: "email",
          avatar_url: null,
          created_at: new Date().toISOString(),
        },
      ]);
  
      if (error) console.error("Supabase insert error:", error);
  
      navigate("/"); 
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setErrorMsg("This email is already registered. Try logging in instead.");
      } else if (err.code === "auth/invalid-email") {
        setErrorMsg("Please enter a valid email address.");
      } else if (err.code === "auth/weak-password") {
        setErrorMsg("Password should be at least 6 characters.");
      } else {
        setErrorMsg(err.message);
      }
    }
  };

  const handleProviderLogin = async (provider) => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // ✅ Upsert provider user to Supabase
      await supabase.from("users").upsert(
        {
          auth_id: user.uid,          // Firebase UID
          email: user.email,          // User email
          name: user.displayName,
          role: "user",               // Default role
          provider: provider.providerId.includes("google") ? "google" : "github",
          avatar_url: user.photoURL,  // Profile picture
        },
        { onConflict: "auth_id" }     // Prevent duplicate users
      );

      navigate("/");
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
                      {/* Error Message */}
                        {errorMsg && (
                          <div
                            className={`alert alert-danger py-2 text-center fade-alert ${fadeOut ? "hide" : ""}`}
                            role="alert"
                          >
                            {errorMsg}
                          </div>
                        )}
                        
                        {/* Success Message */}
                        {successMsg && (
                          <div
                            className={`alert alert-success py-2 text-center fade-alert ${fadeOut ? "hide" : ""}`}
                            role="alert"
                          >
                            {successMsg}
                          </div>
                        )}
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
                          <a
                            href="/terms"
                            className="me-1"
                            onClick={(e) => e.preventDefault()}
                          >
                            Terms of Service
                          </a>
                          and
                          <a
                            href="/privacy"
                            className="ms-1"
                            onClick={(e) => e.preventDefault()}
                          >
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
