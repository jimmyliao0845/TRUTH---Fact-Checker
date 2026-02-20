import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import LoadingScreen from "./LoadingScreen";
import OfflineBanner from "./components/OfflineBanner";
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
import ProfessionalReportsPage from "./ProfessionalReportsPage";
import UserProfile from "./UserProfile";
import LinkedUser from "./LinkedUser";

// ✅ Unified Admin Panel (CMS)
import AdminPanel from "./AdminPanel";

// ✅ CMS Frontend Viewer
import { TutorialList, TutorialView, CMSPage, AnnouncementsBanner } from "./TutorialViewer";

// ✅ General User Pages
import GamePage from "./GamePage";

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
      <OfflineBanner />
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
        <Route path="/professional/reports" element={<ProfessionalReportsPage />} />
        <Route path="/professional/linked-users" element={<LinkedUser />} />
        
        {/* User Profile - Unified Route */}
        <Route path="/user/profile" element={<UserProfile />} />

        {/* ✅ Unified Admin Panel */}
        <Route path="/admin" element={<AdminPanel />} />

        {/* ✅ CMS Content Pages (Frontend) */}
        <Route path="/tutorials" element={<TutorialList />} />
        <Route path="/tutorials/:id" element={<TutorialView />} />
        <Route path="/page/:slug" element={<CMSPage />} />

        {/* ✅ General User Pages */}
        <Route path="/game" element={<GamePage />} />
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