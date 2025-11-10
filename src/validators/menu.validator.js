const { body } = require('express-validator');

const createMenuValidation = [
  body('restaurant_id')
    .isInt({ min: 1 })
    .withMessage('Restaurant ID must be a positive integer')
    .notEmpty()
    .withMessage('Restaurant ID is required'),
  body('name')
    .isLength({ min: 2, max: 255 })
    .withMessage('Menu name must be between 2 and 255 characters long')
    .notEmpty()
    .withMessage('Menu name is required'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number')
    .custom((value) => {
      const decimalPlaces = value.toString().split('.')[1]?.length || 0;
      if (decimalPlaces > 2) {
        throw new Error('Price can have at most 2 decimal places');
      }
      return true;
    })
    .withMessage('Price can have at most 2 decimal places')
    .notEmpty()
    .withMessage('Price is required'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('photo')
    .optional()
    .isURL()
    .withMessage('Photo must be a valid URL')
];

const updateMenuValidation = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 255 })
    .withMessage('Menu name must be between 2 and 255 characters long'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number')
    .custom((value) => {
      const decimalPlaces = value.toString().split('.')[1]?.length || 0;
      if (decimalPlaces > 2) {
        throw new Error('Price can have at most 2 decimal places');
      }
      return true;
    })
    .withMessage('Price can have at most 2 decimal places'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('photo')
    .optional()
    .isURL()
    .withMessage('Photo must be a valid URL'),
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean value'),

  // Custom validation to ensure at least one field is being updated
  body().custom((value, { req }) => {
    const updateFields = ['name', 'price', 'description', 'photo', 'is_active'];
    const hasUpdateField = updateFields.some(field => req.body[field] !== undefined);
    if (!hasUpdateField) {
      throw new Error('At least one field must be provided for update');
    }
    return true;
  })
];

const createDailyMenuScheduleValidation = [
  body('menu_id')
    .isInt({ min: 1 })
    .withMessage('Menu ID must be a positive integer')
    .notEmpty()
    .withMessage('Menu ID is required'),
  body('day_of_week')
    .isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
    .withMessage('Day of week must be one of: monday, tuesday, wednesday, thursday, friday, saturday, sunday')
    .notEmpty()
    .withMessage('Day of week is required')
];

module.exports = {
  createMenuValidation,
  updateMenuValidation,
  createDailyMenuScheduleValidation
};