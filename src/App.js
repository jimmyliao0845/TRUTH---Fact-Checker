import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Navbar";
import HomePage from "./HomePage";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import ForgotPasswordPage from "./ForgotPasswordPage";
import ForgotPasswordStep2 from "./ForgotPasswordStep2";
import AnalysisPageNotLoggedIn from "./AnalysisPageNotLoggedIn";
import AnalysisPageLoggedIn from "./AnalysisPageLoggedIn";
import AnalysisResultLoggedIn from "./AnalysisResultLoggedIn";
import AnalysisResultNotloggedIn from "./AnalysisResultNotloggedIn"; // ✅ Fixed import
import ProtectedRoute from "./ProtectedRoute";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Home */}
        <Route path="/" element={<HomePage />} />

        {/* Auth Pages */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route
          path="/forgot-password-step-2"
          element={<ForgotPasswordStep2 />}
        />

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
          element={<AnalysisResultNotloggedIn />} // ✅ Fixed usage
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
      </Routes>
    </Router>
  );
}

export default App;
