// Robust ECHONA Backend - Auto-restart on errors
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory mood storage
let moods = [];
let moodIdCounter = 1;

// Health check
app.get("/", (req, res) => {
  res.json({ 
    message: "ECHONA Backend API - DEMO MODE",
    status: "running",
    timestamp: new Date().toISOString(),
    moodsCount: moods.length
  });
});

// API Health Check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Add mood
app.post("/api/mood/add", (req, res) => {
  try {
    const { mood, score } = req.body;
    
    if (!mood) {
      return res.status(400).json({ error: "Mood is required" });
    }
    
    const log = {
      _id: moodIdCounter++,
      mood,
      score: score || 5,
      createdAt: new Date()
    };
    
    moods.push(log);
    console.log("✅ Mood saved:", mood, "- Total moods:", moods.length);
    res.json({ message: "Mood saved", log });
  } catch (error) {
    console.error("Error saving mood:", error);
    res.status(500).json({ error: "Failed to save mood" });
  }
});

// Get all moods
app.get("/api/mood", (req, res) => {
  try {
    res.json(moods);
  } catch (error) {
    console.error("Error fetching moods:", error);
    res.status(500).json({ error: "Failed to fetch moods" });
  }
});

// Get mood history
app.get("/api/mood/history", (req, res) => {
  try {
    res.json(moods);
  } catch (error) {
    console.error("Error fetching mood history:", error);
    res.status(500).json({ error: "Failed to fetch mood history" });
  }
});

// Get mood stats
app.get("/api/mood/stats", (req, res) => {
  try {
    const total = moods.length;
    const moodCounts = {};
    
    moods.forEach(m => {
      moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1;
    });
    
    const mostCommon = Object.keys(moodCounts).sort((a, b) => moodCounts[b] - moodCounts[a])[0] || "None";
    
    res.json({
      total,
      mostCommon,
      moodDistribution: moodCounts
    });
  } catch (error) {
    console.error("Error fetching mood stats:", error);
    res.status(500).json({ error: "Failed to fetch mood stats" });
  }
});

// Surprise Me endpoint
app.get("/api/surprise", (req, res) => {
  try {
    const suggestions = [
      { type: "song", title: "Happy Vibes", mood: "Happy" },
      { type: "song", title: "Chill Mode", mood: "Calm" },
      { type: "song", title: "Energy Boost", mood: "Excited" }
    ];
    
    const random = suggestions[Math.floor(Math.random() * suggestions.length)];
    res.json(random);
  } catch (error) {
    console.error("Error in surprise endpoint:", error);
    res.status(500).json({ error: "Failed to get surprise" });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: "Endpoint not found",
    path: req.path,
    method: req.method
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ 
    error: "Internal server error",
    message: err.message 
  });
});

// Start server with error handling
let server;
try {
  server = app.listen(PORT, () => {
    console.log("╔════════════════════════════════════════════╗");
    console.log("║   🚀 ECHONA Backend API Running!          ║");
    console.log("╠════════════════════════════════════════════╣");
    console.log(`║   📡 Server: http://localhost:${PORT}        ║`);
    console.log("║   ℹ️  Mode: DEMO (No Database Required)   ║");
    console.log("║   ✅ Ready to accept requests!            ║");
    console.log("╚════════════════════════════════════════════╝");
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ ERROR: Port ${PORT} is already in use!`);
      console.log(`💡 TIP: Kill the process using port ${PORT} or use a different port.`);
      process.exit(1);
    } else {
      console.error('❌ Server error:', error);
      process.exit(1);
    }
  });
} catch (error) {
  console.error("❌ Failed to start server:", error);
  process.exit(1);
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  if (server) {
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down...');
  if (server) {
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
