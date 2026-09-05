/**
 * Global centralized error-handling middleware for Express.
 * Must have exactly 4 parameters (err, req, res, next) so Express identifies it as an error handler.
 */
const errorHandler = (err, req, res, next) => {
  
  console.error(" [SERVER ERROR]:", {
    message: err.message,
    // stack: process.env.NODE_ENV === "production" ? "🥞 Hidden in Production" : err.stack,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
  });
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = err.errors || null;

  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `That ${field} is already registered.`;
  }

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Database Validation Failed";
    errors = Object.values(err.errors).map((el) => el.message);
  }


  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid session token. Please log in again.";
  }
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Your session has expired. Please log in again.";
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }), 
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }), 
  });
};

module.exports = errorHandler;
