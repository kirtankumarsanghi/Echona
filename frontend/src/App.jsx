import { Routes, Route } from "react-router-dom";

// Pages
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import MoodDetect from "./pages/MoodDetect";
import Music from "./pages/Music";
import TodoPlanner from "./pages/TodoPlanner";
import Callback from "./pages/Callback";

// Protection
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/login" element={<Auth />} />
      <Route path="/callback" element={<Callback />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route path="/mood-detect" element={<ProtectedRoute><MoodDetect /></ProtectedRoute>} />
      <Route path="/music" element={<ProtectedRoute><Music /></ProtectedRoute>} />
      <Route path="/todo" element={<ProtectedRoute><TodoPlanner /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Home />} />
    </Routes>
  );
}

export default App;
