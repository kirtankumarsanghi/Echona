import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import Logo from "../components/Logo";
import axiosInstance from "../api/axiosInstance";
import { isLoggedIn, login as authLogin } from "../utils/auth";
import SEO from "../components/SEO";

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [fieldTouched, setFieldTouched] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn()) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError("");
    setSuccess("");
    setValidationErrors({});
    setFieldTouched({});
  };

  const validateField = (field, value) => {
    switch (field) {
      case "name":
        if (!value.trim()) return "Full name is required";
        if (value.trim().length < 2) return "Name must be at least 2 characters";
        return "";
      case "email":
        if (!value.trim()) return "Email address is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Please enter a valid email";
        return "";
      case "password":
        if (!value) return "Password is required";
        if (value.length < 6) return "Must be at least 6 characters";
        return "";
      default:
        return "";
    }
  };

  const handleBlur = (field) => {
    setFieldTouched((prev) => ({ ...prev, [field]: true }));
    const value = field === "name" ? name : field === "email" ? email : password;
    const err = validateField(field, value);
    setValidationErrors((prev) => ({ ...prev, [field]: err }));
  };

  const validateForm = () => {
    const errors = {};
    if (!isLogin) errors.name = validateField("name", name);
    errors.email = validateField("email", email);
    errors.password = validateField("password", password);

    Object.keys(errors).forEach((k) => {
      if (!errors[k]) delete errors[k];
    });

    setValidationErrors(errors);
    setFieldTouched({ name: true, email: true, password: true });
    return Object.keys(errors).length === 0;
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";
      const payload = isLogin
        ? { email: email.trim(), password }
        : { name: name.trim(), email: email.trim(), password };

      const response = await axiosInstance.post(endpoint, payload);
      const { token, user } = response.data;

      if (!token) {
        throw new Error("Authentication failed. Please try again.");
      }

      authLogin(token, user);

      setSuccess(
        isLogin
          ? "Welcome back! Redirecting to your dashboard..."
          : "Account created successfully! Redirecting..."
      );

      setTimeout(() => navigate("/dashboard"), 1200);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    if (!password) return { width: "0%", color: "bg-neutral-700", label: "" };
    if (password.length < 4) return { width: "25%", color: "bg-red-500", label: "Weak" };
    if (password.length < 6) return { width: "50%", color: "bg-orange-500", label: "Fair" };
    if (password.length < 8) return { width: "75%", color: "bg-yellow-500", label: "Good" };
    return { width: "100%", color: "bg-emerald-500", label: "Strong" };
  };

  const pwStrength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 relative pt-20">
      <SEO title={isLogin ? "Sign In" : "Create Account"} description="Sign in or create your ECHONA account for AI mood detection and music therapy." />
      <Navbar />
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-indigo-600/15 to-indigo-700/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-32 -right-32 w-96 h-96 bg-gradient-to-tl from-violet-600/15 to-violet-700/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-indigo-900/20 to-violet-900/20 rounded-full blur-3xl"
        />
      </div>



      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-neutral-900/80 backdrop-blur-xl shadow-2xl rounded-2xl border border-neutral-700/50 p-8 sm:p-10">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
            className="flex justify-center mb-8"
          >
            <Logo size="large" showText={false} />
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? "login" : "signup"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-center mb-8"
            >
              <h1 className="text-2xl font-bold text-neutral-100 mb-2">{isLogin ? "Welcome back" : "Create your account"}</h1>
              <p className="text-neutral-400 text-sm">
                {isLogin
                  ? "Sign in to continue your wellness journey"
                  : "Start your journey to better mental wellness"}
              </p>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-400 font-medium">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-3">
                  <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-emerald-400 font-medium">{success}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form className="space-y-5" onSubmit={handleAuth} noValidate>
            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mb-4"
                >
                  <label className="block text-neutral-300 text-sm font-semibold mb-2">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (fieldTouched.name) {
                          setValidationErrors((prev) => ({ ...prev, name: validateField("name", e.target.value) }));
                        }
                      }}
                      onBlur={() => handleBlur("name")}
                      className={`w-full px-4 py-3 rounded-xl bg-neutral-800/60 border border-neutral-700 text-neutral-100 placeholder-neutral-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all pl-12 ${fieldTouched.name && validationErrors.name ? "border-red-500 focus:ring-red-500" : ""}`}
                    />
                  </div>
                  {fieldTouched.name && validationErrors.name && (
                    <p className="flex items-center gap-1 mt-2 text-xs text-red-400 font-medium">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {validationErrors.name}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mb-4">
              <label className="block text-neutral-300 text-sm font-semibold mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldTouched.email) {
                      setValidationErrors((prev) => ({ ...prev, email: validateField("email", e.target.value) }));
                    }
                  }}
                  onBlur={() => handleBlur("email")}
                  className={`w-full px-4 py-3 rounded-xl bg-neutral-800/60 border border-neutral-700 text-neutral-100 placeholder-neutral-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all pl-12 ${fieldTouched.email && validationErrors.email ? "border-red-500 focus:ring-red-500" : ""}`}
                />
              </div>
              {fieldTouched.email && validationErrors.email && (
                <p className="flex items-center gap-1 mt-2 text-xs text-red-400 font-medium">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {validationErrors.email}
                </p>
              )}
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-neutral-300 text-sm font-semibold mb-0">Password</label>
                {isLogin && (
                  <button type="button" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={isLogin ? "Enter your password" : "Create a strong password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldTouched.password) {
                      setValidationErrors((prev) => ({ ...prev, password: validateField("password", e.target.value) }));
                    }
                  }}
                  onBlur={() => handleBlur("password")}
                  className={`w-full px-4 py-3 rounded-xl bg-neutral-800/60 border border-neutral-700 text-neutral-100 placeholder-neutral-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all pl-12 pr-12 ${fieldTouched.password && validationErrors.password ? "border-red-500 focus:ring-red-500" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {fieldTouched.password && validationErrors.password && (
                <p className="flex items-center gap-1 mt-2 text-xs text-red-400 font-medium">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {validationErrors.password}
                </p>
              )}

              {!isLogin && password && !validationErrors.password && (
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-neutral-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: pwStrength.width }}
                      transition={{ duration: 0.3 }}
                      className={`h-full rounded-full ${pwStrength.color}`}
                    />
                  </div>
                  <span className="text-xs text-neutral-400 font-medium w-14">{pwStrength.label}</span>
                </div>
              )}

              {!isLogin && !password && (
                <p className="mt-2 text-xs text-neutral-500">Minimum 6 characters recommended</p>
              )}
            </div>

            <motion.button
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold hover:from-indigo-500 hover:to-violet-500 transition-all shadow-lg hover:shadow-indigo-500/25 mt-2 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{isLogin ? "Signing in..." : "Creating account..."}</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>{isLogin ? "Sign In" : "Create Account"}</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              )}
            </motion.button>
          </form>

          <div className="my-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-700" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-neutral-900/80 text-xs text-neutral-500 font-medium uppercase tracking-wider">
                {isLogin ? "New here?" : "Already a member?"}
              </span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={toggleForm}
            type="button"
            className="w-full py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-300 font-semibold hover:bg-neutral-800 hover:border-neutral-600 transition-all"
          >
            {isLogin ? "Create a new account" : "Sign in to existing account"}
          </motion.button>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-xs text-neutral-500 mt-6 font-medium"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 font-bold">ECHONA</span> · Your Mental Wellness Companion
        </motion.p>
      </motion.div>
    </div>
  );
}

export default Auth;
