// Date formatting utilities
export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatRelativeTime = (date) => {
  if (!date) return '';
  const now = new Date();
  const target = new Date(date);
  const diffInSeconds = Math.floor((now - target) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return formatDate(date);
};

// Text formatting utilities
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const formatUserName = (user) => {
  if (!user) return 'Unknown User';
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  return user.username || user.email || 'Unknown User';
};

// Number formatting utilities
export const formatNumber = (num) => {
  if (typeof num !== 'number') return '0';
  return num.toLocaleString();
};

export const formatCurrency = (amount) => {
  if (typeof amount !== 'number') return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// Status formatting utilities
export const getStatusColor = (status) => {
  const statusColors = {
    pending: '#f59e0b',
    'in-progress': '#3b82f6',
    completed: '#10b981',
    cancelled: '#ef4444',
    active: '#10b981',
    inactive: '#6b7280',
    open: '#3b82f6',
    closed: '#10b981',
    resolved: '#10b981',
    rejected: '#ef4444'
  };
  
  return statusColors[status?.toLowerCase()] || '#6b7280';
};

export const getPriorityColor = (priority) => {
  const priorityColors = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#ef4444',
    critical: '#dc2626'
  };
  
  return priorityColors[priority?.toLowerCase()] || '#6b7280';
};
