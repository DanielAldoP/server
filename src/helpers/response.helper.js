/**
 * Standardized response helper for API responses
 * All responses follow consistent snake_case format as specified in request-response.md
 */

class ResponseHelper {
  /**
   * Success response helper
   * @param {Object} data - Response data
   * @param {string} message - Success message
   * @param {number} statusCode - HTTP status code (default: 200)
   * @returns {Object} Formatted response object
   */
  static success(data = null, message = 'Success', statusCode = 200) {
    return {
      status: true,
      message,
      data,
      timestamp: Math.floor(Date.now() / 1000) // Unix timestamp
    };
  }

  /**
   * Error response helper
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code (default: 400)
   * @param {Object} errors - Detailed error object (optional)
   * @returns {Object} Formatted error response
   */
  static error(message = 'Error', statusCode = 400, errors = null) {
    return {
      status: false,
      message,
      errors,
      timestamp: Math.floor(Date.now() / 1000) // Unix timestamp
    };
  }

  /**
   * Paginated response helper
   * @param {Array} data - Response data array
   * @param {Object} pagination - Pagination metadata
   * @param {string} message - Success message
   * @returns {Object} Formatted paginated response
   */
  static paginated(data, pagination, message = 'Success') {
    return {
      status: true,
      message,
      data,
      pagination: {
        current_page: pagination.page || 1,
        total_pages: pagination.totalPages || 1,
        total_items: pagination.total || 0,
        items_per_page: pagination.limit || 20,
        has_next_page: pagination.hasNext || false,
        has_prev_page: pagination.hasPrev || false
      },
      timestamp: Math.floor(Date.now() / 1000)
    };
  }

  /**
   * Validation error response helper
   * @param {Array} errors - Array of validation errors
   * @returns {Object} Formatted validation error response
   */
  static validationError(errors) {
    return this.error('Validation failed', 422, errors);
  }

  /**
   * Not found error response helper
   * @param {string} resource - Resource name that was not found
   * @returns {Object} Formatted not found error response
   */
  static notFound(resource = 'Resource') {
    return this.error(`${resource} not found`, 404);
  }

  /**
   * Unauthorized error response helper
   * @param {string} message - Custom error message
   * @returns {Object} Formatted unauthorized error response
   */
  static unauthorized(message = 'Unauthorized') {
    return this.error(message, 401);
  }

  /**
   * Forbidden error response helper
   * @param {string} message - Custom error message
   * @returns {Object} Formatted forbidden error response
   */
  static forbidden(message = 'Forbidden') {
    return this.error(message, 403);
  }

  /**
   * Server error response helper
   * @param {string} message - Custom error message
   * @returns {Object} Formatted server error response
   */
  static serverError(message = 'Internal server error') {
    return this.error(message, 500);
  }

  /**
   * Conflict error response helper
   * @param {string} message - Custom error message
   * @returns {Object} Formatted conflict error response
   */
  static conflict(message = 'Conflict') {
    return this.error(message, 409);
  }

  /**
   * Too many requests error response helper
   * @param {string} message - Custom error message
   * @returns {Object} Formatted rate limit error response
   */
  static tooManyRequests(message = 'Too many requests') {
    return this.error(message, 429);
  }
}

// Legacy compatibility exports
const createResponse = (success, data = null, message = null, error = null) => {
  const response = {
    success,
    timestamp: new Date().toISOString()
  };

  if (data !== null) response.data = data;
  if (message !== null) response.message = message;
  if (error !== null) response.error = error;

  return response;
};

const successResponse = (data, message) => createResponse(true, data, message);
const errorResponse = (error, message) => createResponse(false, null, message, error);

module.exports = {
  ResponseHelper,
  createResponse,
  successResponse,
  errorResponse
};