const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key_change_this_in_production";

function authMiddleware(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>

    if (!token) {
      return res.status(401).json({ 
        error: "Authentication required", 
        message: "No token provided" 
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("[Auth Middleware] Error:", err.message);
    return res.status(401).json({ 
      error: "Invalid token", 
      message: err.message 
    });
  }
}

module.exports = { authMiddleware, JWT_SECRET };
