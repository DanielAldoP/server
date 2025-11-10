const { body } = require('express-validator');

const updateUserStatusValidation = [
  body('is_active')
    .isBoolean()
    .withMessage('is_active must be a boolean value')
    .notEmpty()
    .withMessage('is_active is required')
];

const manageWalletValidation = [
  body('type')
    .isIn(['topup', 'deduct'])
    .withMessage('Type must be either topup or deduct')
    .notEmpty()
    .withMessage('Transaction type is required'),
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number')
    .custom((value) => {
      const decimalPlaces = value.toString().split('.')[1]?.length || 0;
      if (decimalPlaces > 2) {
        throw new Error('Amount can have at most 2 decimal places');
      }
      return true;
    })
    .withMessage('Amount can have at most 2 decimal places')
    .notEmpty()
    .withMessage('Amount is required'),
  body('description')
    .isLength({ min: 5, max: 500 })
    .withMessage('Description must be between 5 and 500 characters long')
    .notEmpty()
    .withMessage('Description is required')
];

const createAdminChatValidation = [
  body('subject')
    .isLength({ min: 5, max: 255 })
    .withMessage('Subject must be between 5 and 255 characters long')
    .notEmpty()
    .withMessage('Subject is required'),
  body('message')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters long')
    .notEmpty()
    .withMessage('Message is required')
];

const sendChatMessageValidation = [
  body('message')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message must be between 1 and 2000 characters long')
    .notEmpty()
    .withMessage('Message is required')
];

module.exports = {
  updateUserStatusValidation,
  manageWalletValidation,
  createAdminChatValidation,
  sendChatMessageValidation
};