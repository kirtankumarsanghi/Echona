import { useState } from "react";
import axios from "axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    try {
      const res = await axios.post("http://localhost:5001/api/auth/login", {
        email,
        password,
      });

      if (res.data.token) {
        localStorage.setItem("echona_token", res.data.token);
        localStorage.setItem("echona_user", JSON.stringify(res.data.user));
        window.location.href = "/dashboard";
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      alert("Login failed. Try again.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600 p-4">
      <div className="bg-white/10 backdrop-blur-md p-10 rounded-2xl shadow-xl w-full max-w-md border border-white/20">
        <h1 className="text-3xl font-bold text-white text-center mb-6">
          Welcome Back 👋
        </h1>

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
          className="w-full bg-white text-purple-700 font-semibold p-3 rounded-xl hover:bg-gray-200 transition"
        >
          Login
        </button>

        <p className="text-center text-gray-200 mt-4">
          Don't have an account?  
          <a href="/register" className="underline cursor-pointer text-white">Register</a>

        </p>
      </div>
    </div>
  );
}
