// Form validation utilities with XSS protection
import DOMPurify from 'isomorphic-dompurify';

// Validation rules
export const validationRules = {
  required: (value, fieldName = 'Field') => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return `${fieldName} is required`;
    }
    return null;
  },

  email: (value) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
    return null;
  },

  minLength: (minLength) => (value, fieldName = 'Field') => {
    if (!value) return null;
    if (value.length < minLength) {
      return `${fieldName} must be at least ${minLength} characters long`;
    }
    return null;
  },

  maxLength: (maxLength) => (value, fieldName = 'Field') => {
    if (!value) return null;
    if (value.length > maxLength) {
      return `${fieldName} must be no more than ${maxLength} characters long`;
    }
    return null;
  },

  password: (value) => {
    if (!value) return null;
    
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumbers = /\d/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    
    if (value.length < minLength) {
      return `Password must be at least ${minLength} characters long`;
    }
    
    if (!hasUpperCase) {
      return 'Password must contain at least one uppercase letter';
    }
    
    if (!hasLowerCase) {
      return 'Password must contain at least one lowercase letter';
    }
    
    if (!hasNumbers) {
      return 'Password must contain at least one number';
    }
    
    if (!hasSpecialChar) {
      return 'Password must contain at least one special character';
    }
    
    return null;
  },

  confirmPassword: (originalPassword) => (value) => {
    if (!value) return null;
    if (value !== originalPassword) {
      return 'Passwords do not match';
    }
    return null;
  },

  phone: (value) => {
    if (!value) return null;
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
      return 'Please enter a valid phone number';
    }
    return null;
  },

  url: (value) => {
    if (!value) return null;
    try {
      new URL(value);
      return null;
    } catch {
      return 'Please enter a valid URL';
    }
  },

  number: (value, fieldName = 'Field') => {
    if (!value) return null;
    if (isNaN(value)) {
      return `${fieldName} must be a valid number`;
    }
    return null;
  },

  min: (minValue) => (value, fieldName = 'Field') => {
    if (!value) return null;
    if (Number(value) < minValue) {
      return `${fieldName} must be at least ${minValue}`;
    }
    return null;
  },

  max: (maxValue) => (value, fieldName = 'Field') => {
    if (!value) return null;
    if (Number(value) > maxValue) {
      return `${fieldName} must be no more than ${maxValue}`;
    }
    return null;
  },

  date: (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return 'Please enter a valid date';
    }
    return null;
  },

  futureDate: (value) => {
    if (!value) return null;
    const date = new Date(value);
    const now = new Date();
    if (date <= now) {
      return 'Date must be in the future';
    }
    return null;
  },

  pastDate: (value) => {
    if (!value) return null;
    const date = new Date(value);
    const now = new Date();
    if (date >= now) {
      return 'Date must be in the past';
    }
    return null;
  },

  custom: (validator) => (value, fieldName = 'Field') => {
    return validator(value, fieldName);
  }
};

// XSS Protection utilities
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Use DOMPurify to sanitize HTML content
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [], // No attributes allowed
    KEEP_CONTENT: true // Keep text content
  });
};

export const sanitizeHtml = (html, options = {}) => {
  const defaultOptions = {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li'],
    ALLOWED_ATTR: ['class'],
    FORBID_SCRIPT: true,
    FORBID_TAGS: ['script', 'object', 'embed', 'link', 'style'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur']
  };
  
  return DOMPurify.sanitize(html, { ...defaultOptions, ...options });
};

export const escapeHtml = (unsafe) => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// Form validation class
export class FormValidator {
  constructor(schema = {}) {
    this.schema = schema;
    this.errors = {};
  }

  // Validate a single field
  validateField(fieldName, value, rules = []) {
    const fieldRules = rules.length > 0 ? rules : this.schema[fieldName] || [];
    let error = null;

    // Sanitize input for XSS protection
    const sanitizedValue = typeof value === 'string' ? sanitizeInput(value) : value;

    for (const rule of fieldRules) {
      if (typeof rule === 'function') {
        error = rule(sanitizedValue, fieldName);
      } else if (typeof rule === 'object' && rule.validator) {
        error = rule.validator(sanitizedValue, fieldName);
      }

      if (error) {
        break;
      }
    }

    if (error) {
      this.errors[fieldName] = error;
    } else {
      delete this.errors[fieldName];
    }

    return error;
  }

  // Validate entire form
  validateForm(formData) {
    this.errors = {};
    const sanitizedData = {};

    Object.keys(formData).forEach(fieldName => {
      const value = formData[fieldName];
      const sanitizedValue = typeof value === 'string' ? sanitizeInput(value) : value;
      sanitizedData[fieldName] = sanitizedValue;
      
      this.validateField(fieldName, sanitizedValue);
    });

    return {
      isValid: Object.keys(this.errors).length === 0,
      errors: this.errors,
      sanitizedData
    };
  }

  // Get error for specific field
  getFieldError(fieldName) {
    return this.errors[fieldName] || null;
  }

  // Check if form has any errors
  hasErrors() {
    return Object.keys(this.errors).length > 0;
  }

  // Clear all errors
  clearErrors() {
    this.errors = {};
  }

  // Clear specific field error
  clearFieldError(fieldName) {
    delete this.errors[fieldName];
  }
}

// Common validation schemas
export const commonSchemas = {
  login: {
    email: [validationRules.required, validationRules.email],
    password: [validationRules.required]
  },

  register: {
    name: [validationRules.required, validationRules.minLength(2), validationRules.maxLength(50)],
    email: [validationRules.required, validationRules.email],
    password: [validationRules.required, validationRules.password],
    confirmPassword: [], // Will be set dynamically
    role: [validationRules.required],
    department: [validationRules.required]
  },

  profile: {
    name: [validationRules.required, validationRules.minLength(2), validationRules.maxLength(50)],
    email: [validationRules.required, validationRules.email],
    phone: [validationRules.phone],
    bio: [validationRules.maxLength(500)]
  },

  project: {
    name: [validationRules.required, validationRules.minLength(3), validationRules.maxLength(100)],
    description: [validationRules.required, validationRules.maxLength(1000)],
    startDate: [validationRules.required, validationRules.date],
    endDate: [validationRules.required, validationRules.date],
    budget: [validationRules.number, validationRules.min(0)]
  },

  task: {
    title: [validationRules.required, validationRules.minLength(3), validationRules.maxLength(100)],
    description: [validationRules.maxLength(1000)],
    priority: [validationRules.required],
    dueDate: [validationRules.date]
  },

  changePassword: {
    currentPassword: [validationRules.required],
    newPassword: [validationRules.required, validationRules.password],
    confirmNewPassword: [] // Will be set dynamically
  }
};

// Hook for form validation
export const useFormValidation = (schema = {}) => {
  const validator = new FormValidator(schema);

  const validateField = (fieldName, value, rules) => {
    return validator.validateField(fieldName, value, rules);
  };

  const validateForm = (formData) => {
    return validator.validateForm(formData);
  };

  const getFieldError = (fieldName) => {
    return validator.getFieldError(fieldName);
  };

  const hasErrors = () => {
    return validator.hasErrors();
  };

  const clearErrors = () => {
    validator.clearErrors();
  };

  const clearFieldError = (fieldName) => {
    validator.clearFieldError(fieldName);
  };

  return {
    validateField,
    validateForm,
    getFieldError,
    hasErrors,
    clearErrors,
    clearFieldError,
    errors: validator.errors
  };
};

export default {
  validationRules,
  sanitizeInput,
  sanitizeHtml,
  escapeHtml,
  FormValidator,
  commonSchemas,
  useFormValidation
};
