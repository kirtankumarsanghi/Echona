import { useState } from "react";
import axiosInstance from "./api/axiosInstance";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleRegister() {
    if (!name.trim() || !email.trim() || !password) {
      setError("Name, email, and password are required.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await axiosInstance.post("/api/auth/signup", {
        name,
        email,
        password,
      });

      setSuccess(res.data?.message || "Registration successful.");

      setTimeout(() => {
        window.location.href = "/login";
      }, 600);
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 p-4">
      <div className="bg-white/10 backdrop-blur-md p-10 rounded-2xl shadow-xl w-full max-w-md border border-white/20">
        <h1 className="text-3xl font-bold text-white text-center mb-6">
          Create Account ✨
        </h1>

        {error && (
          <div className="mb-4 rounded-xl border border-red-300/40 bg-red-500/20 px-3 py-2 text-sm text-red-100">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-xl border border-emerald-300/40 bg-emerald-500/20 px-3 py-2 text-sm text-emerald-100">
            {success}
          </div>
        )}

        <input
          type="text"
          placeholder="Enter your name"
          className="w-full p-3 mb-4 rounded-xl bg-white/20 text-white placeholder-gray-200 outline-none"
          onChange={(e) => setName(e.target.value)}
        />

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
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-white text-purple-700 font-semibold p-3 rounded-xl hover:bg-gray-200 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Creating account..." : "Register"}
        </button>

        <p className="text-center text-gray-200 mt-4">
          Already have an account?{" "}
          <a className="underline cursor-pointer text-white" href="/login">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
