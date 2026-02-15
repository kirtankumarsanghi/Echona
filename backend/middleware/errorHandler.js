function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    path: req.originalUrl,
    method: req.method,
    requestId: req.requestId,
  });
}

function errorHandler(err, req, res, next) {
  // Guard: if headers already sent, delegate to Express default handler
  if (res.headersSent) {
    return next(err);
  }

  // Normalize non-Error throws (strings, numbers, objects)
  if (!(err instanceof Error)) {
    const original = err;
    err = new Error(typeof original === "string" ? original : "Unknown error");
    if (typeof original === "object" && original !== null) {
      err.statusCode = original.statusCode;
      err.publicMessage = original.publicMessage || original.error;
    }
  }

  // Map known error types to appropriate status codes
  let statusCode = Number(err.statusCode) || 500;
  if (err.name === "SyntaxError" && err.status === 400) statusCode = 400;
  if (err.name === "ValidationError") statusCode = 400; // Mongoose
  if (err.name === "CastError") statusCode = 400; // Mongoose bad ObjectId
  if (err.name === "JsonWebTokenError") statusCode = 401;
  if (err.name === "TokenExpiredError") statusCode = 401;

  const isProd = process.env.NODE_ENV === "production";

  console.error("[Unhandled Error]", {
    requestId: req.requestId,
    path: req.originalUrl,
    method: req.method,
    statusCode,
    message: err.message,
    ...(isProd ? {} : { stack: err.stack }),
  });

  res.status(statusCode).json({
    success: false,
    error: err.publicMessage || (statusCode < 500 ? err.message : "Internal server error"),
    message: isProd && statusCode >= 500 ? "Unexpected server error" : err.message,
    requestId: req.requestId,
  });
}

/**
 * Wrap async route handlers to catch rejected promises
 * and forward them to the centralized errorHandler.
 * Usage: router.get("/path", catchAsync(async (req, res) => { ... }));
 */
function catchAsync(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { notFoundHandler, errorHandler, catchAsync };
