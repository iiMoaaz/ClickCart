const ApiError = require('../utils/apiError');

// Handle JWT Invalid Signature
const handleJwtInvalidSignature = () =>
  new ApiError('Invalid token, please login again', 401);

// Handle JWT Invalid Signature
const handleJwtTokenExpired = () =>
  new ApiError('Token Expired, please login again', 401);

// Error for development
const sendErrorForDev = (err, res) => {
  return res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

// Error for production
const sendErrorForProd = (err, res) => {
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};

const globalError = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorForDev(err, res);
  } else {
    if (err.name === 'JsonWebTokenError') err = handleJwtInvalidSignature();
    if (err.name === 'TokenExpiredError') err = handleJwtTokenExpired();
    sendErrorForProd(err, res);
  }
};
module.exports = globalError;
