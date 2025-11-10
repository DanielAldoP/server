const { body } = require('express-validator');

const createReviewValidation = [
  body('daily_order_id')
    .isInt({ min: 1 })
    .withMessage('Daily order ID must be a positive integer')
    .notEmpty()
    .withMessage('Daily order ID is required'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5')
    .notEmpty()
    .withMessage('Rating is required'),
  body('review')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Review cannot exceed 1000 characters')
];

const updateReviewValidation = [
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
  body('review')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Review cannot exceed 1000 characters'),

  // Custom validation to ensure at least one field is being updated
  body().custom((value, { req }) => {
    const updateFields = ['rating', 'review'];
    const hasUpdateField = updateFields.some(field => req.body[field] !== undefined);
    if (!hasUpdateField) {
      throw new Error('At least one field must be provided for update');
    }
    return true;
  })
];

module.exports = {
  createReviewValidation,
  updateReviewValidation
};