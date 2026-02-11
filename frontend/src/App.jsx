import { Routes, Route } from "react-router-dom";

// Pages
import Home from "./pages/Home.jsx";
import Auth from "./pages/Auth.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import MoodDetect from "./pages/MoodDetect.jsx";
import Music from "./pages/Music.jsx";
import TodoPlanner from "./pages/TodoPlanner.jsx";

// Protection
import ProtectedRoute from "./components/ProtectedRoute.jsx";

function App() {
  return (
    <Routes>

      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/mood-detect" element={<MoodDetect />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/todo" element={<TodoPlanner />} />
      <Route path="/music" element={<Music />} />

      {/* Redirects for backwards compatibility */}
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={<Auth />} />
      <Route path="/register" element={<Auth />} />
      <Route path="/detect" element={<MoodDetect />} />

      {/* Catch all */}
      <Route path="*" element={<Home />} />
    </Routes>
  );
}

export default App;
