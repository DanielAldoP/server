const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { ApiError } = require('../helpers/error.helper');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new ApiError('Access denied. No token provided.', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      throw new ApiError('Token is valid but user not found.', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(new ApiError('Invalid token.', 401));
    } else if (error.name === 'TokenExpiredError') {
      next(new ApiError('Token expired.', 401));
    } else {
      next(error);
    }
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ApiError('Access denied. Insufficient permissions.', 403));
    }
    next();
  };
};

module.exports = { auth, authorize };