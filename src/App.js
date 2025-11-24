import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import LoadingScreen from "./LoadingScreen";
import HomePage from "./HomePage";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import ForgotPasswordPage from "./ForgotPasswordPage";
import ForgotPasswordStep2 from "./ForgotPasswordStep2";
import AnalysisPageNotLoggedIn from "./AnalysisPageNotLoggedIn";
import AnalysisPageLoggedIn from "./AnalysisPageLoggedIn";
import AnalysisResultLoggedIn from "./AnalysisResultLoggedIn";
import AnalysisResultNotloggedIn from "./AnalysisResultNotloggedIn";
import ProtectedRoute from "./ProtectedRoute";
import FactCheckerDashboard from "./FactCheckerDashboard";

// ✅ Admin Pages
import AdminDashboard from "./AdminDashboard";
import AdminUsers from "./AdminUsers"; // updated import
import AdminTutorialPage from "./AdminTutorialPage";
import AdminReviewsPage from "./AdminReviewsPage";

// Component to handle loading state on route changes
function AppContent() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Show loading screen when route changes
    setLoading(true);

    // Hide loading screen after a short delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500); // 500ms loading time 

    return () => clearTimeout(timer);
  }, [location.pathname]); // Triggers when route changes

  return (
    <>
      {loading && <LoadingScreen />}
      <Navbar />
      <Routes>
        {/* Home */}
        <Route path="/" element={<HomePage />} />

        {/* Auth Pages */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/forgot-password-step-2" element={<ForgotPasswordStep2 />} />

        {/* Analysis Pages */}
        <Route path="/analysis" element={<AnalysisPageNotLoggedIn />} />
        <Route
          path="/analysis-logged"
          element={
            <ProtectedRoute>
              <AnalysisPageLoggedIn />
            </ProtectedRoute>
          }
        />

        {/* Result Pages */}
        <Route
          path="/analysis-result-not-login"
          element={<AnalysisResultNotloggedIn />}
        />
        <Route
          path="/analysis-result-logged-in"
          element={<AnalysisResultLoggedIn />}
        />

        {/* Upload Page */}
        <Route
          path="/upload"
          element={<h1 className="text-center mt-5">Upload Page</h1>}
        />

        {/* Fact Checker Dashboard */}
        <Route path="/fact-checker-dashboard" element={<FactCheckerDashboard />} />

        {/* ✅ Admin Pages */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} /> {/* updated route */}
        <Route path="/admin/tutorials" element={<AdminTutorialPage />} />
        <Route path="/admin/reviews" element={<AdminReviewsPage />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;