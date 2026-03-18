function authMiddleware(req, res, next) {
  const userId = req.session?.userId;
  if (!userId) {
    return res.status(401).json({
      success: false,
      error: "Authentication required",
      message: "Please sign in to access this feature",
      code: "NO_SESSION",
    });
  }
  req.user = { id: userId, email: req.session.email || "" };
  next();
}

module.exports = { authMiddleware };
