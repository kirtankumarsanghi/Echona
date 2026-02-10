const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection - Disabled for demo (no login required)
// const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/echona";
// let mongoConnected = false;
// mongoose
//   .connect(MONGODB_URI)
//   .then(() => {
//     console.log("✅ MongoDB connected");
//     mongoConnected = true;
//   })
//   .catch((err) => {
//     console.error("❌ MongoDB connection error:", err.message);
//     console.warn("⚠️  Server will run without MongoDB. Authentication features will not work.");
//     console.warn("⚠️  To fix: Start MongoDB or use MongoDB Atlas connection string");
//   });

// In-memory storage for demo (no database needed)
let moodsStorage = [];

// Routes
// const authRoutes = require("./routes/authRoutes"); // Disabled for demo
const moodRoutes = require("./routes/moodRoutes");

// app.use("/api/auth", authRoutes); // Disabled for demo
app.use("/api/mood", moodRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ 
    message: "ECHONA Backend API",
    status: "running",
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error("[Server Error]:", err);
  res.status(500).json({ error: "Internal server error", message: err.message });
});

// Start server on port 5001
const PORT = 5001;
const mongoConnected = false; // MongoDB disabled for demo

try {
  const server = app.listen(PORT, () => {
    console.log(`🚀 ECHONA Backend running on http://localhost:${PORT}`);
    console.log(`ℹ️  Running in DEMO mode without database`);
  });

  server.on('error', (err) => {
    console.error('❌ Server error:', err);
    process.exit(1);
  });
} catch (err) {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
}

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled rejection at:', promise, 'reason:', reason);
});
