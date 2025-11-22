const { ValidationError } = require('../helpers/error.helper');

class DynamicValidator {
  static validationSchemas = {
    auth: {
      register: {
        name: {
          type: 'string',
          required: true,
          minLength: 2,
          maxLength: 255,
          trim: true
        },
        email: {
          type: 'email',
          required: true,
          normalize: true
        },
        password: {
          type: 'password',
          required: true,
          minLength: 8,
          pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
          message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        },
        phone_number: {
          type: 'phone',
          required: true,
          pattern: /^[+]?[\d\s\-\(\)]+$/
        },
        city: {
          type: 'string',
          required: true,
          minLength: 2,
          maxLength: 100,
          trim: true
        },
        role: {
          type: 'enum',
          required: false,
          values: ['customer', 'merchant'],
          default: 'customer'
        }
      },
      login: {
        email: {
          type: 'email',
          required: true,
          normalize: true
        },
        password: {
          type: 'string',
          required: true
        }
      },
      updateProfile: {
        name: {
          type: 'string',
          required: false,
          minLength: 2,
          maxLength: 255,
          trim: true
        },
        phone_number: {
          type: 'phone',
          required: false,
          pattern: /^[+]?[\d\s\-\(\)]+$/
        },
        city: {
          type: 'string',
          required: false,
          minLength: 2,
          maxLength: 100,
          trim: true
        }
      },
      changePassword: {
        current_password: {
          type: 'string',
          required: true
        },
        new_password: {
          type: 'password',
          required: true,
          minLength: 8,
          pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
          message: 'New password must contain at least one uppercase letter, one lowercase letter, and one number'
        }
      }
    },
    restaurant: {
      create: {
        name: {
          type: 'string',
          required: true,
          minLength: 2,
          maxLength: 255,
          trim: true
        },
        full_address: {
          type: 'string',
          required: true,
          minLength: 5,
          trim: true
        },
        city: {
          type: 'string',
          required: true,
          minLength: 2,
          maxLength: 100,
          trim: true
        },
        description: {
          type: 'string',
          required: false,
          maxLength: 1000,
          trim: true
        },
        photo: {
          type: 'url',
          required: false,
          pattern: /^https?:\/\/.+/
        }
      },
      update: {
        name: {
          type: 'string',
          required: false,
          minLength: 2,
          maxLength: 255,
          trim: true
        },
        full_address: {
          type: 'string',
          required: false,
          minLength: 5,
          trim: true
        },
        city: {
          type: 'string',
          required: false,
          minLength: 2,
          maxLength: 100,
          trim: true
        },
        description: {
          type: 'string',
          required: false,
          maxLength: 1000,
          trim: true
        },
        photo: {
          type: 'url',
          required: false,
          pattern: /^https?:\/\/.+/
        }
      },
      verify: {
        status: {
          type: 'enum',
          required: true,
          values: ['active', 'rejected']
        },
        rejection_reason: {
          type: 'string',
          required: function(value, allValues) {
            return allValues.status === 'rejected';
          },
          maxLength: 500,
          trim: true
        }
      }
    },
    menu: {
      create: {
        restaurantId: {
          type: 'number',
          required: true,
          min: 1
        },
        name: {
          type: 'string',
          required: true,
          minLength: 2,
          maxLength: 255,
          trim: true
        },
        price: {
          type: 'number',
          required: true,
          min: 0.01,
          max: 99999.99
        },
        description: {
          type: 'string',
          required: false,
          maxLength: 1000,
          trim: true
        },
        photo: {
          type: 'url',
          required: false,
          pattern: /^https?:\/\/.+/
        }
      },
      schedule: {
        menuId: {
          type: 'number',
          required: true,
          min: 1
        },
        dayOfWeek: {
          type: 'enum',
          required: true,
          values: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        }
      }
    },
    order: {
      create: {
        items: {
          type: 'array',
          required: true,
          minItems: 1,
          itemSchema: {
            menuId: {
              type: 'number',
              required: true,
              min: 1
            },
            quantity: {
              type: 'number',
              required: true,
              min: 1,
              max: 100
            },
            deliveryDate: {
              type: 'date',
              required: true,
              futureDate: true
            }
          }
        }
      },
      updateStatus: {
        status: {
          type: 'enum',
          required: true,
          values: ['confirmed', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled']
        }
      }
    },
    review: {
      create: {
        dailyOrderId: {
          type: 'number',
          required: true,
          min: 1
        },
        rating: {
          type: 'number',
          required: true,
          min: 1,
          max: 5
        },
        review: {
          type: 'string',
          required: false,
          minLength: 10,
          maxLength: 1000,
          trim: true
        }
      }
    },
    admin: {
      walletManage: {
        type: {
          type: 'enum',
          required: true,
          values: ['topup', 'withdraw', 'freeze']
        },
        amount: {
          type: 'number',
          required: true,
          min: 0.01,
          max: 999999.99
        },
        description: {
          type: 'string',
          required: true,
          minLength: 5,
          maxLength: 255,
          trim: true
        }
      }
    }
  };

  static validate(schemaPath, data) {
    const schema = this.getSchema(schemaPath);
    if (!schema) {
      throw new Error(`Validation schema not found: ${schemaPath}`);
    }

    const errors = [];
    const validatedData = { ...data };

    for (const [fieldName, fieldSchema] of Object.entries(schema)) {
      const value = validatedData[fieldName];
      const fieldErrors = this.validateField(fieldName, value, fieldSchema, validatedData);

      if (fieldErrors.length > 0) {
        errors.push(...fieldErrors);
      } else if (value !== undefined) {
        // Apply transformations
        if (fieldSchema.trim && typeof value === 'string') {
          validatedData[fieldName] = value.trim();
        }
        if (fieldSchema.normalize && typeof value === 'string') {
          validatedData[fieldName] = value.toLowerCase().trim();
        }
        if (fieldSchema.default && value === undefined) {
          validatedData[fieldName] = fieldSchema.default;
        }
      }
    }

    // Check for partial update validation (at least one field required)
    const partialUpdateFields = Object.values(schema).filter(field => field.required === false);
    if (partialUpdateFields.length > 0 && !Object.keys(data).some(key => schema[key] && schema[key].required !== false)) {
      const hasAnyField = Object.keys(data).some(key => schema[key]);
      if (!hasAnyField) {
        errors.push({
          field: '_general',
          message: 'At least one field must be provided'
        });
      }
    }

    if (errors.length > 0) {
      const error = new ValidationError('Validation failed');
      error.details = errors;
      throw error;
    }

    return validatedData;
  }

  static getSchema(schemaPath) {
    const [category, action] = schemaPath.split('.');
    return this.validationSchemas[category]?.[action];
  }

  static validateField(fieldName, value, schema, allValues = {}) {
    const errors = [];

    // Check if required
    const isRequired = typeof schema.required === 'function'
      ? schema.required(value, allValues)
      : schema.required;

    if (isRequired && (value === undefined || value === null || value === '')) {
      errors.push({
        field: fieldName,
        message: `${fieldName} is required`,
        value
      });
      return errors;
    }

    // Skip validation if field is not provided and not required
    if (value === undefined || value === null || value === '') {
      return errors;
    }

    // Type validation
    if (schema.type) {
      const typeError = this.validateType(fieldName, value, schema);
      if (typeError) errors.push(typeError);
    }

    // String validations
    if (typeof value === 'string') {
      if (schema.minLength !== undefined && value.length < schema.minLength) {
        errors.push({
          field: fieldName,
          message: `${fieldName} must be at least ${schema.minLength} characters long`,
          value
        });
      }
      if (schema.maxLength !== undefined && value.length > schema.maxLength) {
        errors.push({
          field: fieldName,
          message: `${fieldName} must be at most ${schema.maxLength} characters long`,
          value
        });
      }
    }

    // Number validations
    if (schema.type === 'number') {
      const num = Number(value);
      if (isNaN(num)) {
        errors.push({
          field: fieldName,
          message: `${fieldName} must be a valid number`,
          value
        });
      } else {
        if (schema.min !== undefined && num < schema.min) {
          errors.push({
            field: fieldName,
            message: `${fieldName} must be at least ${schema.min}`,
            value
          });
        }
        if (schema.max !== undefined && num > schema.max) {
          errors.push({
            field: fieldName,
            message: `${fieldName} must be at most ${schema.max}`,
            value
          });
        }
      }
    }

    // Enum validation
    if (schema.enum && schema.values) {
      if (!schema.values.includes(value)) {
        errors.push({
          field: fieldName,
          message: `${fieldName} must be one of: ${schema.values.join(', ')}`,
          value
        });
      }
    }

    // Pattern validation
    if (schema.pattern && typeof value === 'string') {
      if (!schema.pattern.test(value)) {
        errors.push({
          field: fieldName,
          message: schema.message || `${fieldName} format is invalid`,
          value
        });
      }
    }

    // Email validation
    if (schema.type === 'email' && typeof value === 'string') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errors.push({
          field: fieldName,
          message: 'Invalid email format',
          value
        });
      }
    }

    // Phone validation
    if (schema.type === 'phone' && typeof value === 'string') {
      const phoneRegex = /^[+]?[\d\s\-\(\)]+$/;
      if (!phoneRegex.test(value)) {
        errors.push({
          field: fieldName,
          message: 'Invalid phone number format',
          value
        });
      }
    }

    // Password validation
    if (schema.type === 'password' && typeof value === 'string') {
      if (schema.minLength && value.length < schema.minLength) {
        errors.push({
          field: fieldName,
          message: `Password must be at least ${schema.minLength} characters long`,
          value
        });
      }
      if (schema.pattern && !schema.pattern.test(value)) {
        errors.push({
          field: fieldName,
          message: schema.message || 'Password format is invalid',
          value
        });
      }
    }

    // URL validation
    if (schema.type === 'url' && typeof value === 'string') {
      try {
        new URL(value);
      } catch {
        errors.push({
          field: fieldName,
          message: 'Invalid URL format',
          value
        });
      }
    }

    // Date validation
    if (schema.type === 'date') {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        errors.push({
          field: fieldName,
          message: `${fieldName} must be a valid date`,
          value
        });
      }
      if (schema.futureDate && date <= new Date()) {
        errors.push({
          field: fieldName,
          message: `${fieldName} must be a future date`,
          value
        });
      }
    }

    // Array validation
    if (schema.type === 'array') {
      if (!Array.isArray(value)) {
        errors.push({
          field: fieldName,
          message: `${fieldName} must be an array`,
          value
        });
      } else {
        if (schema.minItems && value.length < schema.minItems) {
          errors.push({
            field: fieldName,
            message: `${fieldName} must have at least ${schema.minItems} items`,
            value
          });
        }
        if (schema.maxItems && value.length > schema.maxItems) {
          errors.push({
            field: fieldName,
            message: `${fieldName} must have at most ${schema.maxItems} items`,
            value
          });
        }

        // Validate array items
        if (schema.itemSchema) {
          value.forEach((item, index) => {
            const itemErrors = this.validateField(`${fieldName}[${index}]`, item, schema.itemSchema);
            errors.push(...itemErrors);
          });
        }
      }
    }

    return errors;
  }

  static validateType(fieldName, value, schema) {
    switch (schema.type) {
      case 'string':
        if (typeof value !== 'string') {
          return {
            field: fieldName,
            message: `${fieldName} must be a string`,
            value
          };
        }
        break;
      case 'number':
        if (typeof value !== 'number' && typeof value !== 'string') {
          return {
            field: fieldName,
            message: `${fieldName} must be a number`,
            value
          };
        }
        break;
      case 'email':
        if (typeof value !== 'string') {
          return {
            field: fieldName,
            message: `${fieldName} must be a string`,
            value
          };
        }
        break;
      case 'enum':
        if (!schema.values.includes(value)) {
          return {
            field: fieldName,
            message: `${fieldName} must be one of: ${schema.values.join(', ')}`,
            value
          };
        }
        break;
    }
    return null;
  }

  static addSchema(category, action, schema) {
    if (!this.validationSchemas[category]) {
      this.validationSchemas[category] = {};
    }
    this.validationSchemas[category][action] = schema;
  }

  static removeSchema(category, action) {
    if (this.validationSchemas[category]) {
      delete this.validationSchemas[category][action];
    }
  }
}

module.exports = DynamicValidator;