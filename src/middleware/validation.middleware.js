const { validationResult } = require('express-validator');
const { ValidationError } = require('../helpers/error.helper');

const validateRequest = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors, 'ini errors')
      const errorMessages = errors.array().map(error => ({
        field: error.path || error.param,
        message: error.msg,
        value: error.value
      }));
      const validationError = new ValidationError('Validation failed');
      validationError.details = errorMessages;
      return next(validationError);
    }

    next();
  };
};

module.exports = { validateRequest };