const { body } = require('express-validator');

const orderItemValidation = [
  body('items.*.menu_id')
    .isInt({ min: 1 })
    .withMessage('Menu ID must be a positive integer')
    .notEmpty()
    .withMessage('Menu ID is required'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer')
    .notEmpty()
    .withMessage('Quantity is required'),
  body('items.*.delivery_date')
    .isISO8601()
    .withMessage('Delivery date must be a valid date in ISO format (YYYY-MM-DD)')
    .custom((value) => {
      const deliveryDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (deliveryDate < today) {
        throw new Error('Delivery date cannot be in the past');
      }
      return true;
    })
    .withMessage('Delivery date cannot be in the past')
    .notEmpty()
    .withMessage('Delivery date is required')
];

const createOrderValidation = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Items must be an array with at least one item')
    .notEmpty()
    .withMessage('Order items are required'),
  ...orderItemValidation
];

const updateOrderStatusValidation = [
  body('status')
    .isIn(['pending', 'confirmed', 'delivered', 'cancelled'])
    .withMessage('Status must be one of: pending, confirmed, delivered, cancelled')
    .notEmpty()
    .withMessage('Status is required')
];

const confirmDeliveryValidation = [
  body('type')
    .isIn(['merchant', 'customer'])
    .withMessage('Type must be either merchant or customer')
    .notEmpty()
    .withMessage('Confirmation type is required')
];

module.exports = {
  createOrderValidation,
  updateOrderStatusValidation,
  confirmDeliveryValidation
};