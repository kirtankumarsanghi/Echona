import { Navigate } from "react-router-dom";
import { isLoggedIn } from "../utils/auth";

function ProtectedRoute({ children }) {
  if (!isLoggedIn()) {
    // Token missing or expired — redirect to auth
    return <Navigate to="/auth" replace state={{ reason: "session_expired" }} />;
  }
  return children;
}

export default ProtectedRoute;

