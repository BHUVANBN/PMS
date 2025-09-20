// Security utilities for XSS and CSRF protection
import DOMPurify from 'isomorphic-dompurify';

// CSRF Token Management
class CSRFManager {
  constructor() {
    this.token = null;
    this.tokenExpiry = null;
  }

  // Get CSRF token from meta tag or API
  async getToken() {
    // First try to get from meta tag
    const metaToken = document.querySelector('meta[name="csrf-token"]');
    if (metaToken) {
      this.token = metaToken.getAttribute('content');
      return this.token;
    }

    // If not in meta tag, fetch from API
    try {
      const response = await fetch('/api/csrf-token', {
        credentials: 'include'
      });
      const data = await response.json();
      this.token = data.token;
      this.tokenExpiry = Date.now() + (data.expiresIn || 3600000); // Default 1 hour
      return this.token;
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
      return null;
    }
  }

  // Check if token is valid and not expired
  isTokenValid() {
    return this.token && (!this.tokenExpiry || Date.now() < this.tokenExpiry);
  }

  // Get current token, refresh if needed
  async getCurrentToken() {
    if (!this.isTokenValid()) {
      await this.getToken();
    }
    return this.token;
  }

  // Add CSRF token to headers
  async addToHeaders(headers = {}) {
    const token = await this.getCurrentToken();
    if (token) {
      headers['X-CSRF-Token'] = token;
    }
    return headers;
  }

  // Add CSRF token to form data
  async addToFormData(formData) {
    const token = await this.getCurrentToken();
    if (token) {
      formData.append('_csrf', token);
    }
    return formData;
  }
}

// Global CSRF manager instance
export const csrfManager = new CSRFManager();

// XSS Protection utilities
export const xssProtection = {
  // Sanitize HTML content
  sanitizeHtml: (dirty, options = {}) => {
    const defaultOptions = {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'blockquote', 'code', 'pre', 'a', 'img'
      ],
      ALLOWED_ATTR: {
        'a': ['href', 'title'],
        'img': ['src', 'alt', 'title', 'width', 'height'],
        '*': ['class']
      },
      ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
      FORBID_TAGS: ['script', 'object', 'embed', 'link', 'style', 'iframe', 'form', 'input'],
      FORBID_ATTR: [
        'onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'onchange',
        'onsubmit', 'onreset', 'onselect', 'onunload', 'ondblclick', 'onkeydown',
        'onkeypress', 'onkeyup', 'onmousedown', 'onmouseup', 'onmousemove', 'onmouseout'
      ],
      KEEP_CONTENT: true,
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false,
      RETURN_TRUSTED_TYPE: false
    };

    return DOMPurify.sanitize(dirty, { ...defaultOptions, ...options });
  },

  // Sanitize plain text (remove all HTML)
  sanitizeText: (input) => {
    if (typeof input !== 'string') return input;
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true
    });
  },

  // Escape HTML entities
  escapeHtml: (unsafe) => {
    if (typeof unsafe !== 'string') return unsafe;
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  },

  // Validate and sanitize URL
  sanitizeUrl: (url) => {
    if (!url) return '';
    
    // Remove javascript: and data: protocols
    if (/^(javascript|data|vbscript):/i.test(url)) {
      return '';
    }

    // Allow only http, https, mailto, tel protocols
    if (!/^(https?|mailto|tel):/i.test(url) && !/^\//.test(url)) {
      return `https://${url}`;
    }

    return DOMPurify.sanitize(url);
  },

  // Sanitize object recursively
  sanitizeObject: (obj, options = {}) => {
    if (obj === null || obj === undefined) return obj;
    
    if (typeof obj === 'string') {
      return options.allowHtml ? 
        xssProtection.sanitizeHtml(obj, options.htmlOptions) : 
        xssProtection.sanitizeText(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => xssProtection.sanitizeObject(item, options));
    }
    
    if (typeof obj === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        const sanitizedKey = xssProtection.sanitizeText(key);
        sanitized[sanitizedKey] = xssProtection.sanitizeObject(value, options);
      }
      return sanitized;
    }
    
    return obj;
  }
};

// Content Security Policy helpers
export const cspHelpers = {
  // Generate nonce for inline scripts
  generateNonce: () => {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode.apply(null, array));
  },

  // Check if CSP is supported
  isSupported: () => {
    return 'SecurityPolicyViolationEvent' in window;
  },

  // Report CSP violations
  reportViolation: (violationEvent) => {
    console.warn('CSP Violation:', {
      blockedURI: violationEvent.blockedURI,
      violatedDirective: violationEvent.violatedDirective,
      originalPolicy: violationEvent.originalPolicy,
      sourceFile: violationEvent.sourceFile,
      lineNumber: violationEvent.lineNumber
    });

    // Send to monitoring service
    if (window.analytics) {
      window.analytics.track('CSP Violation', {
        blockedURI: violationEvent.blockedURI,
        violatedDirective: violationEvent.violatedDirective
      });
    }
  }
};

// Input validation and sanitization middleware
export const secureInput = {
  // Validate and sanitize form input
  processFormInput: (formData, schema = {}) => {
    const processed = {};
    const errors = {};

    for (const [key, value] of Object.entries(formData)) {
      const fieldSchema = schema[key] || { type: 'text', sanitize: true };
      
      try {
        let processedValue = value;

        // Sanitize based on field type
        if (fieldSchema.sanitize !== false) {
          switch (fieldSchema.type) {
            case 'html':
              processedValue = xssProtection.sanitizeHtml(value, fieldSchema.htmlOptions);
              break;
            case 'url':
              processedValue = xssProtection.sanitizeUrl(value);
              break;
            case 'email':
              processedValue = xssProtection.sanitizeText(value).toLowerCase();
              break;
            default:
              processedValue = xssProtection.sanitizeText(value);
          }
        }

        // Apply additional validation
        if (fieldSchema.validate) {
          const validationResult = fieldSchema.validate(processedValue);
          if (validationResult !== true) {
            errors[key] = validationResult;
            continue;
          }
        }

        processed[key] = processedValue;
      } catch (error) {
        errors[key] = 'Invalid input format';
      }
    }

    return {
      data: processed,
      errors,
      isValid: Object.keys(errors).length === 0
    };
  },

  // Rate limiting for form submissions
  rateLimiter: (() => {
    const submissions = new Map();
    
    return {
      checkLimit: (identifier, maxAttempts = 5, windowMs = 300000) => { // 5 attempts per 5 minutes
        const now = Date.now();
        const key = `${identifier}_${Math.floor(now / windowMs)}`;
        
        const current = submissions.get(key) || 0;
        if (current >= maxAttempts) {
          return false;
        }
        
        submissions.set(key, current + 1);
        
        // Cleanup old entries
        for (const [k, v] of submissions.entries()) {
          if (k.split('_')[1] < Math.floor((now - windowMs) / windowMs)) {
            submissions.delete(k);
          }
        }
        
        return true;
      }
    };
  })()
};

// Secure API request wrapper
export const secureApiRequest = async (url, options = {}) => {
  // Add CSRF token to headers
  const headers = await csrfManager.addToHeaders(options.headers || {});
  
  // Add security headers
  headers['X-Requested-With'] = 'XMLHttpRequest';
  headers['X-Content-Type-Options'] = 'nosniff';
  
  // Sanitize request body if it's JSON
  let body = options.body;
  if (body && options.headers?.['Content-Type']?.includes('application/json')) {
    try {
      const parsedBody = typeof body === 'string' ? JSON.parse(body) : body;
      const sanitizedBody = xssProtection.sanitizeObject(parsedBody);
      body = JSON.stringify(sanitizedBody);
    } catch (error) {
      console.error('Failed to sanitize request body:', error);
    }
  }

  return fetch(url, {
    ...options,
    headers,
    body,
    credentials: 'include' // Include cookies for authentication
  });
};

// Initialize security measures
export const initializeSecurity = () => {
  // Set up CSP violation reporting
  if (cspHelpers.isSupported()) {
    document.addEventListener('securitypolicyviolation', cspHelpers.reportViolation);
  }

  // Initialize CSRF token
  csrfManager.getToken().catch(console.error);

  // Set up global error handling for security issues
  window.addEventListener('error', (event) => {
    if (event.error && event.error.name === 'SecurityError') {
      console.error('Security Error:', event.error);
      // Report to monitoring service
    }
  });

  // Prevent clickjacking
  if (window.self !== window.top) {
    document.body.style.display = 'none';
    console.error('Page loaded in iframe - potential clickjacking attempt');
  }
};

export default {
  csrfManager,
  xssProtection,
  cspHelpers,
  secureInput,
  secureApiRequest,
  initializeSecurity
};
