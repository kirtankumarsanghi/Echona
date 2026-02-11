import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import Navbar from "../components/Navbar";
import Logo from "../components/Logo";

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError("");
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";
      const payload = isLogin 
        ? { email: email.trim(), password }
        : { name, email: email.trim(), password };

      console.log("[Auth] Attempting", isLogin ? "login" : "signup");
      console.log("[Auth] Endpoint:", endpoint);
      console.log("[Auth] Backend URL:", axiosInstance.defaults.baseURL);
      
      const response = await axiosInstance.post(endpoint, payload);

      console.log("[Auth] Response status:", response.status);
      console.log("[Auth] Response data:", response.data);

      // Check if response is actually successful
      if (response.status >= 400) {
        throw new Error(response.data?.message || "Authentication failed");
      }

      const { token, user } = response.data;

      if (!token) {
        throw new Error("No token received from server");
      }

      console.log("[Auth] ✓ Token received");
      console.log("[Auth] ✓ User:", user);

      // Clear old data
      localStorage.clear();

      // Store new data
      localStorage.setItem("echona_token", token);
      localStorage.setItem("echona_user", JSON.stringify(user));

      console.log("[Auth] ✓ Credentials stored");

      // Small delay for localStorage sync
      await new Promise(resolve => setTimeout(resolve, 100));

      console.log("[Auth] ✓ Redirecting to dashboard");
      navigate("/dashboard");
    } catch (err) {
      console.error("[Auth] ✗ Error:", err);
      
      let errorMessage = "Authentication failed";
      
      if (err.message && err.message.includes("Cannot connect")) {
        errorMessage = "Cannot connect to server. Please ensure backend is running.";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-6 pt-28">
      
      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 p-10 rounded-2xl shadow-xl w-full max-w-md text-white"
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Logo size="w-20 h-20" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-center mb-6">
          {isLogin ? "Welcome Back 👋" : "Create Your Account ✨"}
        </h1>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Credentials Hint */}
        {isLogin && (
          <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500 rounded-lg text-blue-300 text-xs">
            Demo: admin@echona.com / admin123
          </div>
        )}

        {/* Form Fields */}
        <form className="space-y-4" onSubmit={handleAuth}>

          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />

          {/* Login / Signup Button */}
          <button
            type="submit"
            className="w-full py-3 mt-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Loading..." : isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        {/* Toggle Link */}
        <p className="text-center mt-5">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span
            onClick={toggleForm}
            className="text-blue-400 cursor-pointer hover:underline"
          >
            {isLogin ? "Sign Up" : "Login"}
          </span>
        </p>

        {/* Back Button */}
        <motion.button
          whileHover={{ x: -5, scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/")}
          className="flex items-center gap-2 mx-auto mt-6 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-2xl font-semibold transition-all duration-300 group"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Home</span>
        </motion.button>
      </motion.div>
    </div>
  );
}

export default Auth;
