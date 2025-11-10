const { ValidationError } = require('sequelize');
const { ApiError } = require('../helpers/error.helper');
const { ResponseHelper } = require('../helpers/response.helper');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error(err);

  // Sequelize validation error
  if (err instanceof ValidationError) {
    const message = 'Validation Error';
    const errors = err.errors.map(error => ({
      field: error.path,
      message: error.message
    }));
    return res.status(400).json(ResponseHelper.error(message, 400, errors));
  }

  // Sequelize foreign key constraint error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    const message = 'Referenced record does not exist';
    return res.status(400).json(ResponseHelper.error(message));
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    return res.status(401).json(ResponseHelper.unauthorized(message));
  }

  // JWT expired error
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    return res.status(401).json(ResponseHelper.unauthorized(message));
  }

  // Custom API error
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json(ResponseHelper.error(err.message, err.statusCode));
  }

  // Default error
  res.status(error.statusCode || 500).json(
    ResponseHelper.error(error.message || 'Internal Server Error', error.statusCode || 500)
  );
};

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

module.exports = {
  errorHandler,
  notFound
};