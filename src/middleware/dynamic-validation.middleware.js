const DynamicValidator = require('../helpers/dynamic-validator.helper');

/**
 * Middleware for dynamic validation using schema-based approach
 * @param {string} schemaPath - Path to validation schema (e.g., 'auth.register')
 * @param {string} source - Source of data ('body', 'query', 'params')
 * @returns {Function} Express middleware function
 */
const validateDynamic = (schemaPath, source = 'body') => {
  return (req, res, next) => {
    try {
      const data = req[source];
      const validatedData = DynamicValidator.validate(schemaPath, data);

      // Replace the original data with validated data
      req[source] = validatedData;
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware for validating multiple sources
 * @param {Object} validationConfig - Configuration object with sources as keys
 * @returns {Function} Express middleware function
 */
const validateMultiple = (validationConfig) => {
  return (req, res, next) => {
    try {
      for (const [source, schemaPath] of Object.entries(validationConfig)) {
        const data = req[source];
        const validatedData = DynamicValidator.validate(schemaPath, data);
        req[source] = validatedData;
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  validateDynamic,
  validateMultiple
};