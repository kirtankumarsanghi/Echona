import { useState } from "react";
import axiosInstance from "./api/axiosInstance";
import { login as authLogin } from "./utils/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axiosInstance.post("/api/auth/login", {
        email,
        password,
      });

      if (res.data?.token) {
        authLogin(res.data.token, res.data.user);
        window.location.href = "/dashboard";
      } else {
        setError(res.data?.message || "Login failed. Please try again.");
      }
    } catch (err) {
      setError(err.message || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600 p-4">
      <div className="bg-white/10 backdrop-blur-md p-10 rounded-2xl shadow-xl w-full max-w-md border border-white/20">
        <h1 className="text-3xl font-bold text-white text-center mb-6">
          Welcome Back 👋
        </h1>

        {error && (
          <div className="mb-4 rounded-xl border border-red-300/40 bg-red-500/20 px-3 py-2 text-sm text-red-100">
            {error}
          </div>
        )}

        <input
          type="email"
          placeholder="Enter your email"
          className="w-full p-3 mb-4 rounded-xl bg-white/20 text-white placeholder-gray-200 outline-none"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Enter your password"
          className="w-full p-3 mb-6 rounded-xl bg-white/20 text-white placeholder-gray-200 outline-none"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-white text-purple-700 font-semibold p-3 rounded-xl hover:bg-gray-200 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center text-gray-200 mt-4">
          Don't have an account?  
          <a href="/register" className="underline cursor-pointer text-white">Register</a>

        </p>
      </div>
    </div>
  );
}
