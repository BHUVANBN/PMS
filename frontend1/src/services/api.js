import axios from 'axios';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // Important for cookie-based auth
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ========================================
// AUTHENTICATION ENDPOINTS
// ========================================

export const authAPI = {
  // User login
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({
        role: response.data.role,
        token: response.data.token
      }));
    }
    return response.data;
  },

  // User registration
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({
        role: response.data.role,
        token: response.data.token
      }));
    }
    return response.data;
  },

  // User logout
  logout: async () => {
    const response = await api.post('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return response.data;
  },

  // Get current user info
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

// ========================================
// ADMIN ENDPOINTS
// ========================================

export const adminAPI = {
  // User management
  createUser: (userData) => api.post('/admin/users', userData),
  createHR: (hrData) => api.post('/admin/hr', hrData),
  getAllUsers: () => api.get('/admin/users'),
  getUsersByRole: (role) => api.get(`/admin/users/role/${role}`),
  updateUser: (userId, userData) => api.put(`/admin/users/${userId}`, userData),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  resetUserPassword: (userId, newPassword) => 
    api.put(`/admin/users/${userId}/reset-password`, { newPassword }),

  // System statistics
  getSystemStats: () => api.get('/admin/stats'),
};

// ========================================
// MANAGER ENDPOINTS
// ========================================

export const managerAPI = {
  // Project management
  getMyProjects: () => api.get('/manager/projects'),
  getProjectDetails: (projectId) => api.get(`/manager/projects/${projectId}`),
  createProject: (projectData) => api.post('/manager/projects', projectData),
  updateProject: (projectId, projectData) => 
    api.put(`/manager/projects/${projectId}`, projectData),
  archiveProject: (projectId) => api.put(`/manager/projects/${projectId}/archive`),

  // Module management
  addModule: (projectId, moduleData) => 
    api.post(`/manager/projects/${projectId}/modules`, moduleData),
  updateModule: (projectId, moduleId, moduleData) => 
    api.put(`/manager/projects/${projectId}/modules/${moduleId}`, moduleData),
  getModuleSummary: (projectId, moduleId) => 
    api.get(`/manager/projects/${projectId}/modules/${moduleId}/summary`),

  // Sprint management
  createSprint: (projectId, sprintData) => 
    api.post(`/manager/projects/${projectId}/sprints`, sprintData),
  getSprintSummary: (sprintId) => api.get(`/manager/sprints/${sprintId}/summary`),
  updateSprint: (sprintId, sprintData) => 
    api.put(`/manager/sprints/${sprintId}`, sprintData),

  // Ticket management
  getAllTickets: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return api.get(`/manager/tickets?${params}`);
  },
  reassignTicket: (projectId, moduleId, ticketId, assignmentData) => 
    api.put(`/manager/projects/${projectId}/modules/${moduleId}/tickets/${ticketId}/assign`, assignmentData),
  updateTicketStatus: (projectId, moduleId, ticketId, statusData) => 
    api.put(`/manager/projects/${projectId}/modules/${moduleId}/tickets/${ticketId}/status`, statusData),
  getTicketReports: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return api.get(`/manager/reports/tickets?${params}`);
  },

  // Team management
  getProjectTeam: (projectId) => api.get(`/manager/projects/${projectId}/team`),
  assignTeamRole: (projectId, userId, roleData) => 
    api.post(`/manager/projects/${projectId}/team/${userId}`, roleData),
  getUserWorkload: (userId) => api.get(`/manager/users/${userId}/workload`),
  recordTeamStandup: (projectId, standupData) => 
    api.post(`/manager/projects/${projectId}/standup`, standupData),

  // Kanban and analytics
  getProjectKanban: (projectId) => api.get(`/manager/projects/${projectId}/kanban`),
  getProjectAnalytics: (projectId) => api.get(`/manager/projects/${projectId}/analytics`),
};

// ========================================
// DEVELOPER ENDPOINTS
// ========================================

export const developerAPI = {
  // Personal dashboard
  getDashboard: () => api.get('/developer/dashboard'),
  getMyTasks: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return api.get(`/developer/tasks?${params}`);
  },

  // Task management
  updateTaskStatus: (projectId, moduleId, ticketId, statusData) => 
    api.put(`/developer/projects/${projectId}/modules/${moduleId}/tickets/${ticketId}/status`, statusData),
  addTaskComment: (projectId, moduleId, ticketId, comment) => 
    api.post(`/developer/projects/${projectId}/modules/${moduleId}/tickets/${ticketId}/comments`, { comment }),
  logTimeEntry: (projectId, moduleId, ticketId, timeData) => 
    api.post(`/developer/projects/${projectId}/modules/${moduleId}/tickets/${ticketId}/time`, timeData),

  // Code review
  getCodeReviewTasks: () => api.get('/developer/code-reviews'),
  submitCodeReview: (reviewId, reviewData) => 
    api.post(`/developer/code-reviews/${reviewId}`, reviewData),

  // Standup
  submitStandup: (projectId, standupData) => 
    api.post(`/developer/projects/${projectId}/standup`, standupData),
  getStandupHistory: (projectId) => api.get(`/developer/projects/${projectId}/standup/history`),
};

// ========================================
// TESTER ENDPOINTS
// ========================================

export const testerAPI = {
  // Dashboard and tasks
  getDashboard: () => api.get('/tester/dashboard'),
  getMyTestTasks: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return api.get(`/tester/tasks?${params}`);
  },

  // Bug tracking
  getAllBugs: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return api.get(`/tester/bugs?${params}`);
  },
  createBug: (bugData) => api.post('/tester/bugs', bugData),
  updateBug: (bugId, bugData) => api.put(`/tester/bugs/${bugId}`, bugData),
  getBugDetails: (bugId) => api.get(`/tester/bugs/${bugId}`),

  // Test execution
  updateTestStatus: (projectId, moduleId, ticketId, testData) => 
    api.put(`/tester/projects/${projectId}/modules/${moduleId}/tickets/${ticketId}/test`, testData),
  addTestComment: (projectId, moduleId, ticketId, comment) => 
    api.post(`/tester/projects/${projectId}/modules/${moduleId}/tickets/${ticketId}/test-comments`, { comment }),

  // Test reports
  getTestReports: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return api.get(`/tester/reports?${params}`);
  },
  generateTestSummary: (projectId) => api.get(`/tester/projects/${projectId}/test-summary`),
};

// ========================================
// HR ENDPOINTS
// ========================================

export const hrAPI = {
  // Employee management
  getDashboard: () => api.get('/hr/dashboard'),
  getAllEmployees: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return api.get(`/hr/employees?${params}`);
  },
  getEmployeeDetails: (employeeId) => api.get(`/hr/employees/${employeeId}`),
  createEmployee: (employeeData) => api.post('/hr/employees', employeeData),
  updateEmployee: (employeeId, employeeData) => 
    api.put(`/hr/employees/${employeeId}`, employeeData),
  deactivateEmployee: (employeeId) => api.put(`/hr/employees/${employeeId}/deactivate`),

  // HR analytics
  getHRStats: () => api.get('/hr/stats'),
  getEmployeeReports: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return api.get(`/hr/reports?${params}`);
  },

  // Leave management (if implemented)
  getLeaveRequests: () => api.get('/hr/leave-requests'),
  approveLeave: (requestId) => api.put(`/hr/leave-requests/${requestId}/approve`),
  rejectLeave: (requestId, reason) => 
    api.put(`/hr/leave-requests/${requestId}/reject`, { reason }),
};

// ========================================
// EMPLOYEE ENDPOINTS
// ========================================

export const employeeAPI = {
  // Personal profile
  getProfile: () => api.get('/employee/profile'),
  updateProfile: (profileData) => api.put('/employee/profile', profileData),
  changePassword: (passwordData) => api.put('/employee/change-password', passwordData),

  // Timesheet
  getTimesheet: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return api.get(`/employee/timesheet?${params}`);
  },
  logTime: (timeData) => api.post('/employee/timesheet', timeData),
  updateTimeEntry: (entryId, timeData) => 
    api.put(`/employee/timesheet/${entryId}`, timeData),

  // Leave requests (if implemented)
  submitLeaveRequest: (leaveData) => api.post('/employee/leave-request', leaveData),
  getMyLeaveRequests: () => api.get('/employee/leave-requests'),
};

// ========================================
// TICKET ENDPOINTS
// ========================================

export const ticketAPI = {
  // General ticket operations
  getAllTickets: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return api.get(`/tickets?${params}`);
  },
  getTicketDetails: (ticketId) => api.get(`/tickets/${ticketId}`),
  createTicket: (ticketData) => api.post('/tickets', ticketData),
  updateTicket: (ticketId, ticketData) => api.put(`/tickets/${ticketId}`, ticketData),
  deleteTicket: (ticketId) => api.delete(`/tickets/${ticketId}`),

  // Ticket comments
  addComment: (ticketId, comment) => 
    api.post(`/tickets/${ticketId}/comments`, { comment }),
  getComments: (ticketId) => api.get(`/tickets/${ticketId}/comments`),

  // Ticket attachments
  uploadAttachment: (ticketId, formData) => 
    api.post(`/tickets/${ticketId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  getAttachments: (ticketId) => api.get(`/tickets/${ticketId}/attachments`),
};

// ========================================
// KANBAN ENDPOINTS
// ========================================

export const kanbanAPI = {
  // Board operations
  getBoard: (projectId) => api.get(`/kanbanboard/${projectId}`),
  createBoard: (boardData) => api.post('/kanbanboard', boardData),
  updateBoard: (boardId, boardData) => api.put(`/kanbanboard/${boardId}`, boardData),

  // Card operations
  moveCard: (boardId, cardId, moveData) => 
    api.put(`/kanbanboard/${boardId}/cards/${cardId}/move`, moveData),
  updateCard: (boardId, cardId, cardData) => 
    api.put(`/kanbanboard/${boardId}/cards/${cardId}`, cardData),
  addCard: (boardId, cardData) => 
    api.post(`/kanbanboard/${boardId}/cards`, cardData),
  deleteCard: (boardId, cardId) => 
    api.delete(`/kanbanboard/${boardId}/cards/${cardId}`),

  // Column operations
  addColumn: (boardId, columnData) => 
    api.post(`/kanbanboard/${boardId}/columns`, columnData),
  updateColumn: (boardId, columnId, columnData) => 
    api.put(`/kanbanboard/${boardId}/columns/${columnId}`, columnData),
  deleteColumn: (boardId, columnId) => 
    api.delete(`/kanbanboard/${boardId}/columns/${columnId}`),
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

export const apiUtils = {
  // Handle API errors
  handleError: (error) => {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || error.response.data?.error || 'An error occurred';
      return {
        success: false,
        message,
        status: error.response.status,
        data: error.response.data
      };
    } else if (error.request) {
      // Request made but no response received
      return {
        success: false,
        message: 'Network error - please check your connection',
        status: 0
      };
    } else {
      // Something else happened
      return {
        success: false,
        message: error.message || 'An unexpected error occurred',
        status: 0
      };
    }
  },

  // Format API response
  formatResponse: (response) => {
    return {
      success: true,
      data: response.data,
      status: response.status,
      message: response.data?.message || 'Success'
    };
  },

  // Get user role
  getUserRole: () => {
    const user = authAPI.getCurrentUser();
    return user?.role || null;
  },

  // Check if user has specific role
  hasRole: (requiredRole) => {
    const userRole = apiUtils.getUserRole();
    return userRole === requiredRole;
  },

  // Check if user has any of the specified roles
  hasAnyRole: (roles) => {
    const userRole = apiUtils.getUserRole();
    return roles.includes(userRole);
  }
};

// Export the main API instance for custom requests
export default api;

// Export all API modules
export {
  api,
  authAPI,
  adminAPI,
  managerAPI,
  developerAPI,
  testerAPI,
  hrAPI,
  employeeAPI,
  ticketAPI,
  kanbanAPI,
  apiUtils
};
