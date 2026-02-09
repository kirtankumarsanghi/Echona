import { useState } from "react";
import axios from "axios";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleRegister() {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        name,
        email,
        password,
      });

      alert(res.data.message);

      if (res.data.message === "Registered successfully") {
        window.location.href = "/login";
      }
    } catch (err) {
      alert("Registration failed");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 p-4">
      <div className="bg-white/10 backdrop-blur-md p-10 rounded-2xl shadow-xl w-full max-w-md border border-white/20">
        <h1 className="text-3xl font-bold text-white text-center mb-6">
          Create Account ✨
        </h1>

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
          className="w-full bg-white text-purple-700 font-semibold p-3 rounded-xl hover:bg-gray-200 transition"
        >
          Register
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
