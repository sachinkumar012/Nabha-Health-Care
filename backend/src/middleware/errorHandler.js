const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error(`Error: ${err.message}`);

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Resource not found";
    error = {
      message,
      statusCode: 404,
    };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    let message = "Duplicate field value entered";

    // Extract the field that's duplicated
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];

    if (field === "email") {
      message = "Email address is already registered";
    } else if (field === "phone") {
      message = "Phone number is already registered";
    } else {
      message = `${field} '${value}' is already in use`;
    }

    error = {
      message,
      statusCode: 400,
    };
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    error = {
      message,
      statusCode: 400,
    };
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token";
    error = {
      message,
      statusCode: 401,
    };
  }

  if (err.name === "TokenExpiredError") {
    const message = "Token expired";
    error = {
      message,
      statusCode: 401,
    };
  }

  // File upload errors
  if (err.code === "LIMIT_FILE_SIZE") {
    const message = "File too large";
    error = {
      message,
      statusCode: 400,
    };
  }

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    const message = "Unexpected file field";
    error = {
      message,
      statusCode: 400,
    };
  }

  // MongoDB connection errors
  if (
    err.name === "MongoNetworkError" ||
    err.name === "MongooseServerSelectionError"
  ) {
    const message = "Database connection error";
    error = {
      message,
      statusCode: 503,
    };
  }

  // Rate limit errors
  if (err.statusCode === 429) {
    const message = "Too many requests, please try again later";
    error = {
      message,
      statusCode: 429,
    };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Server Error",
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
      error: err,
    }),
  });
};

module.exports = errorHandler;
