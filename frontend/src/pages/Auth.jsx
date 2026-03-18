import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";
import Navbar from "../components/Navbar";
import Logo from "../components/Logo";
import axiosInstance from "../api/axiosInstance";
import { saveUser, clearUser, getUser } from "../utils/auth";
import { useAuth } from "../context/AuthContext";
import SEO from "../components/SEO";

function Auth() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    if (getUser()) navigate("/dashboard");
  }, [navigate]);

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    setLoading(true);
    try {
      const { data } = await axiosInstance.post("/api/auth/google", {
        credential: credentialResponse.credential,
      });
      if (!data.success) throw new Error(data.error || "Authentication failed");
      saveUser(data.user);
      login(data.user);
      navigate("/dashboard");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Google sign-in failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google sign-in was cancelled or failed. Please try again.");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative pt-20">
      <SEO title="Sign In" description="Sign in to ECHONA with your Google account for AI mood detection and music therapy." />
      <Navbar />

      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -left-32 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-32 -right-32 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-slate-900 shadow-soft rounded-2xl border border-slate-800 p-8 sm:p-10">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
            className="flex justify-center mb-8"
          >
            <Logo size="large" showText={false} />
          </motion.div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-100 mb-2">Welcome to ECHONA</h1>
            <p className="text-slate-400 text-sm">Sign in to access your wellness workspace</p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
            >
              <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </motion.div>
          )}

          {/* Google Sign-In Button */}
          <div className="flex flex-col items-center gap-4">
            {loading ? (
              <div className="flex items-center gap-3 py-4 text-slate-300">
                <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Signing you in…</span>
              </div>
            ) : (
              <div className="w-full flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap={false}
                  theme="filled_black"
                  shape="rectangular"
                  size="large"
                  text="continue_with"
                  logo_alignment="left"
                />
              </div>
            )}

            <p className="text-xs text-slate-400 text-center mt-2">
              By continuing, you agree to ECHONA’s Terms of Service and Privacy Policy.
              We only access your Google profile name, email, and avatar.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <span className="text-xs text-slate-400">
              <span className="text-primary-700 font-bold">ECHONA</span> · Mental Wellness Platform
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Auth;

