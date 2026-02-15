const net = require("net");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");
const axios = require("axios");
const config = require("./config");
const requestLogger = require("./middleware/requestLogger");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

const surpriseRoutes = require("./routes/surpriseRoutes");
const gameRoutes = require("./routes/gameRoutes");
const moodRoutes = require("./routes/moodRoutes");
const authRoutes = require("./routes/authRoutes");
const spotifyRoutes = require("./routes/spotifyRoutes");
const mlRoutes = require("./routes/mlRoutes");

// ─── Port availability check ───────────────────────────────────────────────
function checkPortAvailable(port) {
  return new Promise((resolve) => {
    const tester = net.createServer();
    tester.once("error", (err) => {
      if (err.code === "EADDRINUSE") resolve(false);
      else resolve(true);
    });
    tester.once("listening", () => {
      tester.close(() => resolve(true));
    });
    tester.listen(port, "0.0.0.0");
  });
}

// ─── Express app setup ─────────────────────────────────────────────────────
const app = express();

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false, // frontend handles CSP
}));

// Global rate limiter — 200 requests per minute per IP
app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many requests — try again shortly" },
}));

// MongoDB (optional — never blocks startup)
if (config.mongoUri && config.mongoUri.trim() !== "") {
  mongoose
    .connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => {
      console.warn("⚠️  MongoDB not connected:", err.message);
      console.warn("   App will continue with in-memory storage");
    });

  // Listen for post-connection errors (reconnection failures)
  mongoose.connection.on("error", (err) => {
    console.error("⚠️  MongoDB connection error:", err.message);
  });
  mongoose.connection.on("disconnected", () => {
    console.warn("⚠️  MongoDB disconnected — will retry automatically");
  });
} else {
  console.log("ℹ️  MongoDB not configured — using in-memory storage");
}

// CORS
const allowedOrigins = new Set([
  config.frontendUrl,
  `http://localhost:${config.frontendPort}`,
  `http://127.0.0.1:${config.frontendPort}`,
  `http://localhost:${config.backendPort}`,
]);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) return callback(null, true);
      console.warn(`[CORS] Blocked: ${origin}`);
      return callback(null, false);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "4mb" }));

// JSON parse error handler (must be right after express.json)
app.use((err, req, res, next) => {
  if (err && err.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      error: "Invalid JSON payload",
      message: "Request body contains malformed JSON",
    });
  }
  return next(err);
});

// Request timeout — abort in-flight work when timeout fires
app.use((req, res, next) => {
  const timeoutMs = config.requestTimeoutMs || 12000;
  const timer = setTimeout(() => {
    if (res.headersSent) return;
    res.timedOut = true;
    res.status(504).json({
      success: false,
      error: "Request timeout",
      message: "Request took too long to complete",
      requestId: req.requestId,
    });
    // Destroy the underlying socket to abort in-flight work
    req.destroy();
  }, timeoutMs);
  res.on("finish", () => clearTimeout(timer));
  res.on("close", () => clearTimeout(timer));
  next();
});

app.use(requestLogger);

// ─── API Routes ─────────────────────────────────────────────────────────────
app.use("/api/surprise", surpriseRoutes);
app.use("/api/game", gameRoutes);
app.use("/api/mood", moodRoutes);

// Strict rate limiter for auth (10 attempts per minute)
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many login attempts — try again in a minute" },
});
app.use("/api/auth", authLimiter, authRoutes);

app.use("/api/spotify", spotifyRoutes);
app.use("/api/ml", mlRoutes);

// ─── Health Endpoints ───────────────────────────────────────────────────────
app.get("/auth/health", (req, res) => res.redirect(307, "/api/auth/health"));
app.get("/spotify/health", (req, res) => res.redirect(307, "/api/spotify/health"));

app.get("/health", async (req, res) => {
  const mongoStateMap = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  // Check ML service availability
  let mlStatus = "unknown";
  try {
    const mlRes = await axios.get(`${config.mlServiceUrl}/health`, {
      timeout: config.healthTimeoutMs,
    });
    mlStatus = mlRes.data?.status || "ok";
  } catch {
    mlStatus = "unavailable";
  }

  res.json({
    service: "echona-backend",
    status: "ok",
    env: config.nodeEnv,
    port: config.backendPort,
    dependencies: {
      mongodb: mongoStateMap[mongoose.connection.readyState] || "unknown",
      mlService: { url: config.mlServiceUrl, status: mlStatus },
      spotify: config.spotifyClientId ? "configured" : "not configured",
    },
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health", (req, res) => res.redirect(307, "/health"));

app.get("/", (req, res) => {
  res.json({
    message: "ECHONA Backend API",
    status: "running",
    version: "2.0.0",
    endpoints: {
      health: "/health",
      authHealth: "/api/auth/health",
      spotifyHealth: "/api/spotify/health",
      mlHealth: "/api/ml/health",
    },
    timestamp: new Date().toISOString(),
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

// ─── Keep-Alive: Prevent Render free tier from sleeping ────────────────────
if (config.nodeEnv === "production") {
  const PING_INTERVAL = 14 * 60 * 1000; // 14 minutes
  const BACKEND_URL = process.env.BACKEND_URL || "https://echona.onrender.com";
  
  setInterval(async () => {
    try {
      await axios.get(`${BACKEND_URL}/health`, { timeout: 5000 });
      console.log(`🔄 Keep-alive ping sent at ${new Date().toISOString()}`);
    } catch (error) {
      console.warn("⚠️  Keep-alive ping failed:", error.message);
    }
  }, PING_INTERVAL);
  
  console.log("🔄 Keep-alive mechanism enabled (pings every 14 minutes)");
}

// ─── Server startup with port conflict detection ────────────────────────────
const PORT = config.backendPort;
let server;

async function startServer() {
  const portFree = await checkPortAvailable(PORT);
  if (!portFree) {
    console.error(`\n❌ FATAL: Port ${PORT} is already in use!`);
    console.error("   Another process is occupying this port.");
    console.error(`\n   💡 Fix: Run in PowerShell:`);
    console.error(`      Get-NetTCPConnection -LocalPort ${PORT} -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }`);
    console.error(`\n   Or use: npm run prestart\n`);
    process.exit(1);
  }

  server = app.listen(PORT, "0.0.0.0", () => {
    console.log("\n╔═══════════════════════════════════════════════╗");
    console.log("║       🚀 ECHONA Backend API Running!          ║");
    console.log("╠═══════════════════════════════════════════════╣");
    console.log(`║   📡 API:      http://localhost:${PORT}          ║`);
    console.log(`║   🩺 Health:   http://localhost:${PORT}/health   ║`);
    console.log("║   ⚡ Mode:     stable + recovery enabled       ║");
    console.log("╚═══════════════════════════════════════════════╝\n");
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(`❌ Port ${PORT} became unavailable during startup`);
    } else {
      console.error("❌ Server error:", error.message);
    }
    process.exit(1);
  });
}

startServer().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});

// ─── Graceful shutdown ──────────────────────────────────────────────────────
let isShuttingDown = false;

function closeResources(onComplete) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  const done = (() => {
    let called = false;
    const fn = typeof onComplete === "function" ? onComplete : () => {};
    return () => {
      if (called) return;
      called = true;
      fn();
    };
  })();

  const forceTimeout = setTimeout(() => {
    console.error("⚠️  Forced shutdown after timeout");
    done();
  }, 5000);

  const closeMongo = () => {
    mongoose.connection
      .close(false)
      .catch(() => {})
      .finally(() => {
        clearTimeout(forceTimeout);
        done();
      });
  };

  if (!server) {
    closeMongo();
    return;
  }

  server.close(() => closeMongo());
}

function closeResourcesAndExit(exitCode) {
  closeResources(() => process.exit(exitCode));
}

process.on("SIGINT", () => {
  console.log("\n🛑 SIGINT received, shutting down gracefully...");
  closeResourcesAndExit(0);
});

process.on("SIGTERM", () => {
  console.log("\n🛑 SIGTERM received, shutting down gracefully...");
  closeResourcesAndExit(0);
});

process.once("SIGUSR2", () => {
  console.log("\n🔄 Nodemon restart signal, closing resources...");
  closeResources(() => process.kill(process.pid, "SIGUSR2"));
});

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error.message);
  console.error(error.stack);
  closeResourcesAndExit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("⚠️  Unhandled Rejection:", reason);
  if (config.nodeEnv === "production") {
    closeResourcesAndExit(1);
  }
});
