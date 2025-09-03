const errorHandler = (error, req, res, next) => {
  console.error('Error:', error);

  // MongoDB duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(409).json({ 
      error: `${field} already exists`,
      field 
    });
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(403).json({ error: 'Invalid token' });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired' });
  }

  // Validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({ 
      error: 'Validation failed',
      details: error.message 
    });
  }

  // Default error
  const status = error.statusCode || 500;

  res.status(status).json({
    error: error.message || "Internal Server Error",
  });
};

module.exports = { errorHandler };