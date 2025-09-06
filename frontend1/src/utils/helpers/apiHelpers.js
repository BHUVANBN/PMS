import { apiUtils } from '../../services/api.js';

// Helper functions for API operations
export const apiHelpers = {
  // Wrapper for API calls with error handling
  async safeApiCall(apiFunction, ...args) {
    try {
      const response = await apiFunction(...args);
      return apiUtils.formatResponse(response);
    } catch (error) {
      return apiUtils.handleError(error);
    }
  },

  // Build query parameters from object
  buildQueryParams(params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        searchParams.append(key, value);
      }
    });
    return searchParams.toString();
  },

  // Format date for API
  formatDateForAPI(date) {
    if (!date) return null;
    return new Date(date).toISOString();
  },

  // Parse API date response
  parseAPIDate(dateString) {
    if (!dateString) return null;
    return new Date(dateString);
  },

  // Validate required fields
  validateRequiredFields(data, requiredFields) {
    const missing = requiredFields.filter(field => !data[field]);
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
    return true;
  },

  // Format user display name
  formatUserName(user) {
    if (!user) return 'Unknown User';
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username || user.email || 'Unknown User';
  },

  // Get status color class
  getStatusColor(status) {
    const statusColors = {
      open: 'text-blue-600 bg-blue-100',
      in_progress: 'text-yellow-600 bg-yellow-100',
      testing: 'text-purple-600 bg-purple-100',
      code_review: 'text-orange-600 bg-orange-100',
      blocked: 'text-red-600 bg-red-100',
      done: 'text-green-600 bg-green-100',
      closed: 'text-gray-600 bg-gray-100',
      active: 'text-green-600 bg-green-100',
      completed: 'text-blue-600 bg-blue-100',
      cancelled: 'text-red-600 bg-red-100',
      on_hold: 'text-yellow-600 bg-yellow-100',
    };
    return statusColors[status] || 'text-gray-600 bg-gray-100';
  },

  // Get priority color class
  getPriorityColor(priority) {
    const priorityColors = {
      low: 'text-green-600 bg-green-100',
      medium: 'text-yellow-600 bg-yellow-100',
      high: 'text-orange-600 bg-orange-100',
      critical: 'text-red-600 bg-red-100',
    };
    return priorityColors[priority] || 'text-gray-600 bg-gray-100';
  },

  // Format file size
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Debounce function for search
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Check if user has permission for action
  hasPermission(userRole, requiredRoles) {
    if (!requiredRoles || requiredRoles.length === 0) return true;
    return requiredRoles.includes(userRole);
  },

  // Format duration in hours to human readable
  formatDuration(hours) {
    if (!hours) return '0h';
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours < 24) return `${Math.round(hours * 10) / 10}h`;
    const days = Math.floor(hours / 24);
    const remainingHours = Math.round((hours % 24) * 10) / 10;
    return `${days}d ${remainingHours}h`;
  },

  // Calculate completion percentage
  calculateCompletion(completed, total) {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  },

  // Sort array by multiple criteria
  multiSort(array, sortCriteria) {
    return array.sort((a, b) => {
      for (const criteria of sortCriteria) {
        const { field, direction = 'asc' } = criteria;
        const aVal = this.getNestedValue(a, field);
        const bVal = this.getNestedValue(b, field);
        
        if (aVal < bVal) return direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  },

  // Get nested object value by path
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  },

  // Group array by field
  groupBy(array, field) {
    return array.reduce((groups, item) => {
      const key = this.getNestedValue(item, field);
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    }, {});
  },

  // Filter array by multiple criteria
  multiFilter(array, filters) {
    return array.filter(item => {
      return Object.entries(filters).every(([field, value]) => {
        if (value === null || value === undefined || value === '') return true;
        const itemValue = this.getNestedValue(item, field);
        if (Array.isArray(value)) {
          return value.includes(itemValue);
        }
        if (typeof value === 'string' && typeof itemValue === 'string') {
          return itemValue.toLowerCase().includes(value.toLowerCase());
        }
        return itemValue === value;
      });
    });
  }
};

export default apiHelpers;
