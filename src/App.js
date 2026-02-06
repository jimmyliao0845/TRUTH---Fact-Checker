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
import CreateTutorial from "./CreateTutorial";
import ManageTutorial from "./ManageTutorial";
import VerificationLogsPage from "./VerificationLogsPage";
import UserFeedbackPage from "./UserFeedbackpage(Professional)";
import ProfessionalReportsPage from "./ProfessionalReportsPage";
import ProfessionalProfile from "./ProfessionalProfile";
import LinkedUser from "./LinkedUser";

// ✅ Admin Pages
import AdminDashboard from "./AdminDashboard";
import AdminUsers from "./AdminUsers"; 
import AdminTutorialPage from "./AdminTutorialPage";
import AdminReviewsPage from "./AdminReviewsPage";
<<<<<<< Updated upstream


// ✅ General User Pages
import GeneralUserProfile from "./GeneralUserProfile";
import GamePage from "./GamePage";
import FeedbackPage from "./FeedbackPage";
=======
import VerificationLogsPage from "./VerificationLogsPage";
import UserFeedbackPage from "./UserFeedbackpage(Professional)";
import ProfessionalReportsPage from "./ProfessionalReportsPage";
import ProfessionalProfile from "./ProfessionalProfile";
import Marketplace from "./ColorManager/Marketplace";
import { ColorThemeManager } from "./ColorManager/Marketplace";
>>>>>>> Stashed changes

// Component to handle loading state on route changes
function AppContent() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load saved theme on app startup
    ColorThemeManager.loadSavedTheme();
  }, []);

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

        {/* ✅ Fact Checker Dashboard - FIXED ROUTE TO MATCH BUTTON */}
        <Route path="/factcheckerdashboard" element={<FactCheckerDashboard />} />     
        <Route path="/professional/create-tutorial" element={<CreateTutorial />} />
        <Route path="/professional/manage-tutorial" element={<ManageTutorial />} />
        <Route path="/professional/verification-logs" element={<VerificationLogsPage />} />
        <Route path="/professional/user-feedback" element={<UserFeedbackPage />} />
        <Route path="/professional/reports" element={<ProfessionalReportsPage />} />
        <Route path="/professional/profile" element={<ProfessionalProfile />} />
        <Route path="/professional/linked-users" element={<LinkedUser />} />  

        {/* Settings */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Marketplace />
            </ProtectedRoute>
          }
        />

        {/* ✅ Admin Pages */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} /> 
        <Route path="/admin/tutorials" element={<AdminTutorialPage />} />
        <Route path="/admin/reviews" element={<AdminReviewsPage />} />

        {/* ✅ General User Pages */}
        <Route path="/general-user-profile" element={<GeneralUserProfile />} />
        <Route path="/game-page" element={<GamePage />} />
        <Route path="/general/feedback" element={<FeedbackPage />} />
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