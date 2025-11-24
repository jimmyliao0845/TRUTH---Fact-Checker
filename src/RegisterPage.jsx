import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
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
  const [role, setRole] = useState("user"); // added role state
  const [isNightMode, setIsNightMode] = useState(
    localStorage.getItem("theme") === "night"
  );
  const [currentUserRole, setCurrentUserRole] = useState("user"); // fetch current user role

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [fadeOut, setFadeOut] = useState(false);

  const googleProvider = new GoogleAuthProvider();
  const githubProvider = new GithubAuthProvider();

  // Fetch current user role from Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docSnap = await getDoc(doc(db, "users", user.uid));
          if (docSnap.exists()) {
            setCurrentUserRole(docSnap.data().role || "user");
          }
        } catch (err) {
          console.error("Error fetching current user role:", err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (errorMsg || successMsg) {
      const timer = setTimeout(() => {
        setErrorMsg("");
        setSuccessMsg("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg, successMsg]);

  useEffect(() => {
    if (errorMsg || successMsg) {
      setFadeOut(false);
      const fadeTimer = setTimeout(() => setFadeOut(true), 4000);
      const clearTimer = setTimeout(() => {
        setErrorMsg("");
        setSuccessMsg("");
        setFadeOut(false);
      }, 4500);
      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(clearTimer);
      };
    }
  }, [errorMsg, successMsg]);

  const saveUserToFirestore = async (user, provider) => {
    if (!user || !user.uid) return;

    const userRef = doc(db, "users", user.uid);

    try {
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
        await setDoc(userRef, {
          name: user.displayName || name || "",
          email: user.email || email || "",
          role: role, // use selected role
          provider: provider || "email",
          avatar_url: user.photoURL || null,
          created_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error("Firestore error:", err);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (password !== confirm) {
      setErrorMsg("Passwords do not match");
      return;
    }

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCred.user, { displayName: name });
      await sendEmailVerification(userCred.user);

      setSuccessMsg("Registration successful! Please check your email to verify your account.");

      await saveUserToFirestore(userCred.user, "email");
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

      const providerName = provider.providerId.includes("google") ? "google" : "github";
      await saveUserToFirestore(user, providerName);

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

  const isAdmin = currentUserRole === "admin";

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
                      {errorMsg && (
                        <div
                          className={`alert alert-danger py-2 text-center fade-alert ${fadeOut ? "hide" : ""}`}
                          role="alert"
                        >
                          {errorMsg}
                        </div>
                      )}
                      {successMsg && (
                        <div
                          className={`alert alert-success py-2 text-center fade-alert ${fadeOut ? "hide" : ""}`}
                          role="alert"
                        >
                          {successMsg}
                        </div>
                      )}
                    </div>

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

                    {/* Only admins can assign role */}
                    {isAdmin && (
                      <div className="mb-3">
                        <label className="form-label">Role</label>
                        <select
                          className="form-select"
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    )}

                    <div className="mb-1">
                      <button type="submit" className="btn btn-signup w-100">
                        Sign Up
                      </button>
                    </div>

                    <div className="login-or">
                      <span className="span-or">Or:</span>
                    </div>

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
