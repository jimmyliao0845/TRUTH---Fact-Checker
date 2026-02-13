import React, { useState, useEffect } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/bootstrap.css";
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
import { ColorThemeManager } from "./ColorManager/Marketplace";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./styles.css";

export default function RegisterPage() {
  const navigate = useNavigate();

  // Form states
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState("user");
  const [isNightMode, setIsNightMode] = useState(
    localStorage.getItem("theme") === "night"
  );
  const [currentUserRole, setCurrentUserRole] = useState("user");
  const [awaitingVerification, setAwaitingVerification] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  // Notifications
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [fadeOut, setFadeOut] = useState(false);

  const googleProvider = new GoogleAuthProvider();
  const githubProvider = new GithubAuthProvider();

  // Check if user came back unverified
  useEffect(() => {
    const checkUser = async () => {
      const user = auth.currentUser;
      if (user && !user.emailVerified) {
        await user.reload();
        if (!user.emailVerified) {
          setAwaitingVerification(true);
          setUserEmail(user.email || "");
        }
      }
    };
    checkUser();
  }, []);

  useEffect(() => {
    if (isNightMode) {
      document.body.classList.add("night-mode");
    } else {
      document.body.classList.remove("night-mode");
    }
  }, [isNightMode]);

  // Fetch current user role and check email verification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check if email is verified
        await user.reload(); // Refresh user data
        
        // If user is not verified and on awaiting verification screen, keep them there
        if (!user.emailVerified && awaitingVerification) {
          // Don't allow navigation away
          return;
        }
        
        if (user.emailVerified && awaitingVerification) {
          // Email verified! Redirect to home
          navigate("/", { replace: true });
        }
        
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
  }, [awaitingVerification, navigate]);

  // Prevent navigation away from verification screen
  useEffect(() => {
    if (awaitingVerification && auth.currentUser && !auth.currentUser.emailVerified) {
      const handleBeforeUnload = (e) => {
        e.preventDefault();
        e.returnValue = '';
      };
      
      window.addEventListener('beforeunload', handleBeforeUnload);
      
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [awaitingVerification]);

  // Auto fade alerts
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

  // Firestore save
  const saveUserToFirestore = async (user, provider) => {
    if (!user || !user.uid) return;

    const userRef = doc(db, "users", user.uid);

    try {
      await setDoc(
        userRef,
        {
          name: user.displayName || name || "",
          email: user.email || email || "",
          phone: phone || user.phoneNumber || "",
          role: role,
          provider: provider || "email",
          avatar_url: user.photoURL || null,
          updated_at: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (err) {
      console.error("Firestore error:", err);
    }
  };

  // Email/password register with email verification
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
      
      // Send email verification
      await sendEmailVerification(userCred.user);

      setSuccessMsg("Registration successful! Please check your email to verify your account.");
      setUserEmail(email);
      setAwaitingVerification(true);

      // Save to Firestore with phone number
      await saveUserToFirestore(userCred.user, "email");
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

  // Resend verification email
  const handleResendVerification = async () => {
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        setSuccessMsg("Verification email resent! Please check your inbox.");
      }
    } catch (err) {
      setErrorMsg("Failed to resend email. Please try again.");
    }
  };

  // Check verification status manually
  const handleCheckVerification = async () => {
    try {
      if (auth.currentUser) {
        await auth.currentUser.reload();
        if (auth.currentUser.emailVerified) {
          setSuccessMsg("Email verified! Redirecting...");
          setTimeout(() => navigate("/"), 1500);
        } else {
          setErrorMsg("Email not verified yet. Please check your inbox and click the verification link.");
        }
      }
    } catch (err) {
      setErrorMsg("Error checking verification status.");
    }
  };

  // Social login
  const handleProviderLogin = async (provider) => {
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("OAuth sign-in successful:", result.user.email);
      const user = result.user;

      const providerName = provider.providerId.includes("google") ? "google" : "github";

      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);

      const avatarURL = user.photoURL || "/assets/default-avatar.png";

      if (!docSnap.exists()) {
        await setDoc(userRef, {
          name: user.displayName || "",
          email: user.email || "",
          phone: user.phoneNumber || "",
          role: "user",
          provider: providerName,
          avatar_url: avatarURL,
          created_at: new Date().toISOString(),
        });
      } else {
        await setDoc(userRef, { avatar_url: avatarURL }, { merge: true });
      }

      navigate("/");
    } catch (err) {
      console.error("OAuth Error Code:", err.code);
      console.error("OAuth Error Message:", err.message);
      
      if (err.code === "auth/cancelled-popup-request" || err.code === "auth/popup-closed-by-user") {
        console.log("Popup closed by user");
        return;
      }
      
      if (err.code === "auth/unauthorized-domain") {
        setErrorMsg(
          "This domain is not authorized. Please check Firebase Console > Authentication > Settings > Authorized domains."
        );
        return;
      }
      
      if (err.code === "auth/operation-not-supported-in-this-environment") {
        setErrorMsg(
          "OAuth is not properly configured. Google/GitHub OAuth apps need to be set up properly."
        );
        return;
      }
      
      setErrorMsg(err.message);
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
                <div className="mx-auto mb-5 text-center mt-5">
                  <img
                    src="/assets/digima_logo.svg"
                    alt="Logo"
                    className="img-fluid"
                    style={{ width: "clamp(80px, 15vw, 140px)", height: "auto" }}
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

                    {!awaitingVerification ? (
                      <>
                        <div className="text-center mb-3">
                          <h5 className="mb-2">Sign Up</h5>
                          {errorMsg && (
                            <div
                              className={`alert alert-danger py-2 text-center fade-alert ${
                                fadeOut ? "hide" : ""
                              }`}
                              role="alert"
                            >
                              {errorMsg}
                            </div>
                          )}
                          {successMsg && (
                            <div
                              className={`alert alert-success py-2 text-center fade-alert ${
                                fadeOut ? "hide" : ""
                              }`}
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

                        {/* PHONE INPUT - Optional profile info only */}
                        <div className="mb-3">
                          <label className="form-label">Phone Number (Optional)</label>
                          <PhoneInput
                            country={"ph"}
                            value={phone}
                            onChange={(phone) => setPhone(phone)}
                            countryCodeEditable={false}
                            inputStyle={{ width: "100%" }}
                            masks={{ ph: '... ... ....' }}
                            enableSearch={true}
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

                        <div style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "clamp(0.75rem, 2vw, 1rem)",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "100%"
                        }}>
                          <button
                            type="button"
                            onClick={() => handleProviderLogin(githubProvider)}
                            className="register-social-btn d-flex align-items-center justify-content-center"
                            style={{
                              width: "100%",
                              maxWidth: "100%",
                              height: "clamp(44px, 10vw, 50px)",
                              padding: "clamp(0.6rem, 2vw, 0.75rem)",
                              cursor: "pointer"
                            }}
                          >
                            <img
                              className="img-fluid"
                              src="/assets/github.svg"
                              alt="GitHub"
                              style={{
                                width: "clamp(20px, 5vw, 24px)",
                                height: "clamp(20px, 5vw, 24px)",
                                marginRight: "clamp(0.5rem, 2vw, 0.75rem)"
                              }}
                            />
                            <span className="ms-2">GitHub</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleProviderLogin(googleProvider)}
                            className="register-social-btn d-flex align-items-center justify-content-center"
                            style={{
                              width: "100%",
                              maxWidth: "100%",
                              height: "clamp(44px, 10vw, 50px)",
                              padding: "clamp(0.6rem, 2vw, 0.75rem)",
                              cursor: "pointer"
                            }}
                          >
                            <img
                              className="img-fluid"
                              src="/assets/google.svg"
                              alt="Google"
                              style={{
                                width: "clamp(20px, 5vw, 24px)",
                                height: "clamp(20px, 5vw, 24px)",
                                marginRight: "clamp(0.5rem, 2vw, 0.75rem)"
                              }}
                            />
                            <span className="ms-2">Google</span>
                          </button>
                        </div>

                        <div className="text-center pt-3">
                          <h6 className="fw-normal fs-14 mb-0">
                            Already have an account?
                            <Link to="/login" className="hover-a">
                              {" "}
                              Sign In
                            </Link>
                          </h6>
                        </div>
                      </>
                    ) : (
                      /* VERIFICATION WAITING SCREEN */
                      <div className="text-center py-4">
                        <div className="mb-4">
                          <i className="bi bi-envelope-check" style={{ fontSize: "4rem", color: "var(--accent-color)" }}></i>
                        </div>
                        <h5 className="mb-3">Verify Your Email</h5>
                        <p className="mb-3">
                          We've sent a verification link to:<br />
                          <strong>{userEmail}</strong>
                        </p>
                        <p className="text-muted mb-4">
                          Please check your inbox and click the verification link to continue.
                        </p>

                        {errorMsg && (
                          <div
                            className={`alert alert-danger py-2 text-center fade-alert ${
                              fadeOut ? "hide" : ""
                            }`}
                            role="alert"
                          >
                            {errorMsg}
                          </div>
                        )}
                        {successMsg && (
                          <div
                            className={`alert alert-success py-2 text-center fade-alert ${
                              fadeOut ? "hide" : ""
                            }`}
                            role="alert"
                          >
                            {successMsg}
                          </div>
                        )}

                        <button
                          type="button"
                          className="btn btn-primary w-100 mb-2"
                          onClick={handleCheckVerification}
                        >
                          I've Verified My Email
                        </button>

                        <button
                          type="button"
                          className="btn btn-outline-secondary w-100"
                          onClick={handleResendVerification}
                        >
                          Resend Verification Email
                        </button>

                        <div className="text-center pt-3">
                          <h6 className="fw-normal fs-14 mb-0">
                            Wrong email?
                            <button
                              className="btn btn-link p-0 ms-1 hover-a"
                              style={{ textDecoration: "none" }}
                              onClick={() => {
                                // Reset theme to default (Black) on logout
                                ColorThemeManager.resetToDefault();
                                
                                setAwaitingVerification(false);
                                auth.signOut();
                              }}
                            >
                              Sign up again
                            </button>
                          </h6>
                        </div>
                      </div>
                    )}
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