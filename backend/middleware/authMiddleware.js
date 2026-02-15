const { verifyAccessToken } = require("../services/authService");

function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
        message: "Please sign in to access this feature",
        code: "NO_TOKEN",
      });
    }

    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Session expired",
        message: "Your session has expired. Please sign in again.",
        code: "TOKEN_EXPIRED",
      });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        error: "Invalid session",
        message: "Your session is invalid. Please sign in again.",
        code: "INVALID_TOKEN",
      });
    }
    return res.status(401).json({
      success: false,
      error: "Authentication failed",
      message: "Unable to verify your session. Please sign in again.",
      code: "AUTH_ERROR",
    });
  }
}

module.exports = { authMiddleware };
