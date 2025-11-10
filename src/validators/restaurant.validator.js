const { body } = require('express-validator');

const createRestaurantValidation = [
  body('name')
    .isLength({ min: 2, max: 255 })
    .withMessage('Restaurant name must be between 2 and 255 characters long')
    .notEmpty()
    .withMessage('Restaurant name is required'),
  body('full_address')
    .isLength({ min: 10, max: 500 })
    .withMessage('Address must be between 10 and 500 characters long')
    .notEmpty()
    .withMessage('Address is required'),
  body('city')
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters long')
    .notEmpty()
    .withMessage('City is required'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('photo')
    .optional()
    .isURL()
    .withMessage('Photo must be a valid URL')
];

const updateRestaurantValidation = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 255 })
    .withMessage('Restaurant name must be between 2 and 255 characters long'),
  body('full_address')
    .optional()
    .isLength({ min: 10, max: 500 })
    .withMessage('Address must be between 10 and 500 characters long'),
  body('city')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters long'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('photo')
    .optional()
    .isURL()
    .withMessage('Photo must be a valid URL'),

  // Custom validation to ensure at least one field is being updated
  body().custom((value, { req }) => {
    const updateFields = ['name', 'full_address', 'city', 'description', 'photo'];
    const hasUpdateField = updateFields.some(field => req.body[field] !== undefined);
    if (!hasUpdateField) {
      throw new Error('At least one field must be provided for update');
    }
    return true;
  })
];

const verifyRestaurantValidation = [
  body('status')
    .isIn(['active', 'rejected'])
    .withMessage('Status must be either active or rejected')
    .notEmpty()
    .withMessage('Status is required'),
  body('rejection_reason')
    .custom((value, { req }) => {
      if (req.body.status === 'rejected') {
        if (!value) {
          throw new Error('Rejection reason is required when rejecting a restaurant');
        }
        if (value.length < 10 || value.length > 500) {
          throw new Error('Rejection reason must be between 10 and 500 characters long');
        }
      }
      return true;
    })
    .withMessage('Rejection reason validation failed')
];

module.exports = {
  createRestaurantValidation,
  updateRestaurantValidation,
  verifyRestaurantValidation
};