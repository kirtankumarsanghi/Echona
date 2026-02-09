import { Routes, Route } from "react-router-dom";

// Pages
import Home from "./pages/Home.jsx";
import Auth from "./pages/Auth.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import MoodDetect from "./pages/MoodDetect.jsx";
import Music from "./pages/Music.jsx";

// Protection
import ProtectedRoute from "./components/ProtectedRoute.jsx";

function App() {
  return (
    <Routes>

      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/login" element={<Auth />} />
      <Route path="/register" element={<Auth />} />

      {/* Private Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/detect"
        element={
          <ProtectedRoute>
            <MoodDetect />
          </ProtectedRoute>
        }
      />

      <Route
        path="/mood-detect"
        element={
          <ProtectedRoute>
            <MoodDetect />
          </ProtectedRoute>
        }
      />

      <Route
        path="/music"
        element={
          <ProtectedRoute>
            <Music />
          </ProtectedRoute>
        }
      />

      {/* Catch all */}
      <Route path="*" element={<h1>404 - Page Not Found</h1>} />
    </Routes>
  );
}

export default App;
