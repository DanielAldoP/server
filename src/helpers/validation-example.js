/**
 * Dynamic Validator Usage Examples
 *
 * This file demonstrates how to use the new dynamic validation system
 * to replace the old field-by-field validation approach.
 */

const DynamicValidator = require('./dynamic-validator.helper');

// Example 1: Basic validation
const userData = {
  name: 'John Doe',
  email: 'john@example.com',
  password: 'Password123',
  phone_number: '+1234567890',
  city: 'New York'
};

try {
  const validatedUser = DynamicValidator.validate('auth.register', userData);
  console.log('Validated user data:', validatedUser);
} catch (error) {
  console.error('Validation errors:', error.details);
}

// Example 2: Adding custom validation schema
DynamicValidator.addSchema('product', 'create', {
  name: {
    type: 'string',
    required: true,
    minLength: 3,
    maxLength: 100,
    trim: true
  },
  price: {
    type: 'number',
    required: true,
    min: 0.01,
    max: 99999.99
  },
  category: {
    type: 'enum',
    required: true,
    values: ['electronics', 'clothing', 'food', 'books']
  },
  description: {
    type: 'string',
    required: false,
    maxLength: 1000,
    trim: true
  }
});

// Example 3: Validating with conditional requirements
const reviewData = {
  rating: 5,
  review: 'Great product!'
};

try {
  const validatedReview = DynamicValidator.validate('review.create', reviewData);
  console.log('Validated review:', validatedReview);
} catch (error) {
  console.error('Validation errors:', error.details);
}

// Example 4: Array validation
const orderData = {
  items: [
    {
      menuId: 1,
      quantity: 2,
      deliveryDate: '2024-12-25'
    },
    {
      menuId: 2,
      quantity: 1,
      deliveryDate: '2024-12-26'
    }
  ]
};

try {
  const validatedOrder = DynamicValidator.validate('order.create', orderData);
  console.log('Validated order:', validatedOrder);
} catch (error) {
  console.error('Validation errors:', error.details);
}

module.exports = {
  DynamicValidator
};