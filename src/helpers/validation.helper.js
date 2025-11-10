const { ValidationError } = require('./error.helper');

const validateRequired = (field, fieldName) => {
  if (!field || (typeof field === 'string' && field.trim() === '')) {
    throw new ValidationError(`${fieldName} is required`);
  }
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid email format');
  }
};

const validatePhone = (phone) => {
  const phoneRegex = /^[+]?[\d\s\-\(\)]+$/;
  if (!phoneRegex.test(phone)) {
    throw new ValidationError('Invalid phone number format');
  }
};

const validatePassword = (password) => {
  if (password.length < 8) {
    throw new ValidationError('Password must be at least 8 characters long');
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    throw new ValidationError('Password must contain at least one uppercase letter, one lowercase letter, and one number');
  }
};

const validateEnum = (value, allowedValues, fieldName) => {
  if (!allowedValues.includes(value)) {
    throw new ValidationError(`${fieldName} must be one of: ${allowedValues.join(', ')}`);
  }
};

const validateNumber = (value, fieldName, min = null, max = null) => {
  const num = Number(value);
  if (isNaN(num)) {
    throw new ValidationError(`${fieldName} must be a valid number`);
  }
  if (min !== null && num < min) {
    throw new ValidationError(`${fieldName} must be at least ${min}`);
  }
  if (max !== null && num > max) {
    throw new ValidationError(`${fieldName} must be at most ${max}`);
  }
};

const validateDate = (date, fieldName) => {
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    throw new ValidationError(`${fieldName} must be a valid date`);
  }
};

const validatePositiveNumber = (value, fieldName) => {
  validateNumber(value, fieldName, 0.01);
};

module.exports = {
  validateRequired,
  validateEmail,
  validatePhone,
  validatePassword,
  validateEnum,
  validateNumber,
  validateDate,
  validatePositiveNumber
};