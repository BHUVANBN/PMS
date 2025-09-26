// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to create headers with authentication
const createHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// Error handler for API responses
const handleApiError = (error, url) => {
  console.error(`API Error for ${url}:`, error);
  
  // Handle different types of errors
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    throw new Error('Network error - please check your connection');
  }
  
  if (error.message.includes('401')) {
    // Unauthorized - clear auth and redirect to login
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/login';
    throw new Error('Session expired - please login again');
  }
  
  if (error.message.includes('403')) {
    throw new Error('Access denied - insufficient permissions');
  }
  
  if (error.message.includes('404')) {
    throw new Error('Resource not found');
  }
  
  if (error.message.includes('500')) {
    throw new Error('Server error - please try again later');
  }
  
  // Default error message
  throw new Error(error.message || 'An unexpected error occurred');
};

// Generic API request handler with error interceptor
const apiRequest = async (url, options = {}) => {
  try {
    const config = {
      method: 'GET',
      headers: createHeaders(options.includeAuth !== false),
      credentials: 'include', // Include cookies for authentication
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    const response = await fetch(`${API_BASE_URL}${url}`, config);
    
    // Handle different response statuses
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }
      
      const error = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    handleApiError(error, url);
  }
};

// Authentication API
export const authAPI = {
  // Login user
  login: (credentials) => 
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      includeAuth: false,
    }),

  // Register user
  register: (userData) => 
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
      includeAuth: false,
    }),

  // Logout user
  logout: () => 
    apiRequest('/auth/logout', {
      method: 'POST',
    }),

  // Verify token
  verifyToken: () => 
    apiRequest('/auth/verify'),

  // Refresh token
  refreshToken: () => 
    apiRequest('/auth/refresh', {
      method: 'POST',
    }),
};

// Admin API
export const adminAPI = {
  // Get all users
  getAllUsers: () => 
    apiRequest('/admin/users'),

  // Get users by role
  getUsersByRole: (role) =>
    apiRequest(`/admin/users/role/${role}`),

  // Create HR account
  createHRAccount: (hrData) => 
    apiRequest('/admin/users/hr', {
      method: 'POST',
      body: JSON.stringify(hrData),
    }),

  // Get organization analytics (implemented on backend)
  getOrganizationAnalytics: () => 
    apiRequest('/admin/analytics'),

  // Get system stats
  getSystemStats: () => 
    apiRequest('/admin/stats'),

  // Get activity logs
  getActivityLogs: () =>
    apiRequest('/admin/activity'),

  // Get system health
  getSystemHealth: () =>
    apiRequest('/admin/health'),

  // Create new user
  createUser: (userData) =>
    apiRequest('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  // Update user role
  updateUserRole: (userId, roleData) => 
    apiRequest(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(roleData),
    }),

  // Delete user
  deleteUser: (userId) => 
    apiRequest(`/admin/users/${userId}`, {
      method: 'DELETE',
    }),
};

// HR API
export const hrAPI = {
  // HR stats
  getHRStats: () =>
    apiRequest('/hr/stats'),
  // Employee management
  getAllEmployees: () => 
    apiRequest('/hr/employees'),

  getEmployeeById: (employeeId) =>
    apiRequest(`/hr/employees/${employeeId}`),

  createEmployee: (employeeData) => 
    apiRequest('/hr/employees', {
      method: 'POST',
      body: JSON.stringify(employeeData),
    }),

  updateEmployee: (employeeId, employeeData) => 
    apiRequest(`/hr/employees/${employeeId}`, {
      method: 'PUT',
      body: JSON.stringify(employeeData),
    }),

  // Toggle employee active status
  toggleEmployeeStatus: (employeeId) =>
    apiRequest(`/hr/employees/${employeeId}/toggle-status`, {
      method: 'PATCH',
    }),

  // Leave management
  // Implemented on backend
  getAllLeaveRequests: () => 
    apiRequest('/hr/leave-requests'),

  approveLeaveRequest: (leaveId) => 
    apiRequest(`/hr/leave-requests/${leaveId}/approve`, {
      method: 'PUT',
    }),

  rejectLeaveRequest: (leaveId, reason) => 
    apiRequest(`/hr/leave-requests/${leaveId}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    }),

  // Standup tracking
  getAllStandups: () => 
    apiRequest('/hr/standups'),

  getEmployeeStandups: (employeeId) => 
    apiRequest(`/hr/standups/${employeeId}`),
};

// Manager API
export const managerAPI = {
  // Project management
  getAllProjects: () => 
    apiRequest('/manager/projects'),

  createProject: (projectData) => 
    apiRequest('/manager/project', {
      method: 'POST',
      body: JSON.stringify(projectData),
    }),

  updateProject: (projectId, projectData) => 
    apiRequest(`/manager/project/${projectId}`, {
      method: 'PATCH',
      body: JSON.stringify(projectData),
    }),

  deleteProject: (projectId) => 
    apiRequest(`/manager/project/${projectId}`, {
      method: 'DELETE',
    }),

  getProjectDetails: (projectId) =>
    apiRequest(`/manager/project/${projectId}`),

  // Module management (align with backend manager.route.js)
  createModule: (projectId, moduleData) => 
    apiRequest(`/manager/project/${projectId}/module`, {
      method: 'POST',
      body: JSON.stringify(moduleData),
    }),

  updateModule: (projectId, moduleId, moduleData) => 
    apiRequest(`/manager/module/${projectId}/${moduleId}`, {
      method: 'PATCH',
      body: JSON.stringify(moduleData),
    }),

  // Ticket management (manager ticket routes require projectId and moduleId)
  createTicket: (projectId, moduleId, ticketData) => 
    apiRequest(`/projects/${projectId}/modules/${moduleId}/tickets`, {
      method: 'POST',
      body: JSON.stringify(ticketData),
    }),

  // View all tickets across modules for manager
  getAllTickets: () =>
    apiRequest('/manager/tickets'),

  assignTicket: (projectId, moduleId, ticketId, assignmentData) => 
    apiRequest(`/manager/ticket/${projectId}/${moduleId}/${ticketId}/assign`, {
      method: 'PATCH',
      body: JSON.stringify(assignmentData),
    }),

  // Sprint management
  createSprint: (projectId, sprintData) => 
    apiRequest(`/manager/project/${projectId}/sprint`, {
      method: 'POST',
      body: JSON.stringify(sprintData),
    }),

  // Implemented on backend
  getSprintBoard: (teamId) => 
    apiRequest(`/manager/sprint-board/${teamId}`),

  // Analytics
  getTeamAnalytics: (teamId) => 
    apiRequest(`/manager/analytics/team/${teamId}`),

  getProjectAnalytics: (projectId) => 
    apiRequest(`/manager/analytics/project/${projectId}`),

  // Manager stats
  getManagerStats: () =>
    apiRequest('/manager/stats'),

  // Permanently delete a project owned by current manager
  deleteProjectHard: (projectId) =>
    apiRequest(`/manager/project/${projectId}/hard`, { method: 'DELETE' }),

  // Team management
  getTeamManagement: () =>
    apiRequest('/manager/team-management'),

  getProjectTeam: (projectId) =>
    apiRequest(`/manager/team/${projectId}`),

  assignTeamRole: (projectId, userId, payload) =>
    apiRequest(`/manager/team/${projectId}/${userId}/assign-role`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  // Kanban & Sprint
  getProjectKanban: (projectId) =>
    apiRequest(`/manager/kanban/${projectId}`),

  getSprintSummary: (sprintId) =>
    apiRequest(`/manager/sprint/${sprintId}/summary`),
};

// Developer API
export const developerAPI = {
  // Dashboard
  getDashboard: () => 
    apiRequest('/developer/dashboard'),

  // Tickets
  getMyTickets: () => 
    apiRequest('/developer/tickets'),

  updateTicketStatus: (projectId, ticketId, status) => 
    // Delegate to kanban controller's direct ticket status endpoint
    apiRequest(`/kanbanboard/tickets/${projectId}/${ticketId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  addTicketComment: (ticketId, comment) => 
    apiRequest(`/developer/tickets/${ticketId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    }),

  // Kanban boards
  getKanbanBoard: () => 
    apiRequest('/kanbanboard/developer/personal'),

  moveTicketOnBoard: (boardId, payload) => 
    apiRequest(`/kanbanboard/${boardId}/move`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
};

// Tester API
export const testerAPI = {
  // Dashboard
  getDashboard: () => 
    apiRequest('/tester/dashboard'),

  // Test cases
  getTestCases: (projectId, moduleId) => 
    apiRequest(`/tester/testcases/${projectId}/${moduleId}`),

  // Update test case execution results for a ticket
  updateTestCase: (projectId, moduleId, ticketId, payload) => 
    apiRequest(`/tester/testcases/${projectId}/${moduleId}/${ticketId}/result`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  // Bug tracking
  createBug: (bugData) => 
    apiRequest('/tester/bugs', {
      method: 'POST',
      body: JSON.stringify(bugData),
    }),

  // Update a bug report (details or status)
  updateBugStatus: (bugId, status) => 
    apiRequest(`/tester/bugs/${bugId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
};

// Employee API (minimal, supported by backend)
export const employeeAPI = {
  getDashboard: () => 
    apiRequest('/employee/dashboard'),
};

// Sales API
export const salesAPI = {
  // Dashboard (supported by backend)
  getDashboard: () => 
    apiRequest('/sales/dashboard'),
};

// Marketing API
export const marketingAPI = {
  // Dashboard (supported by backend)
  getDashboard: () => 
    apiRequest('/marketing/dashboard'),
};

// Intern API
export const internAPI = {
  // Dashboard (supported by backend)
  getDashboard: () => 
    apiRequest('/intern/dashboard'),
};

// Generic APIs
export const ticketsAPI = {
  // Ticket endpoints require projectId path parameter on backend
  getTicket: (projectId, ticketId) => 
    apiRequest(`/tickets/${projectId}/${ticketId}`),

  updateTicket: (projectId, ticketId, ticketData) => 
    apiRequest(`/tickets/${projectId}/${ticketId}`, {
      method: 'PUT',
      body: JSON.stringify(ticketData),
    }),

  addComment: (projectId, ticketId, comment) => 
    apiRequest(`/tickets/${projectId}/${ticketId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    }),

  getComments: (ticketId) => 
    apiRequest(`/tickets/${ticketId}/comments`),
};

export const projectsAPI = {
  getAllProjects: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const suffix = query ? `?${query}` : '';
    return apiRequest(`/projects${suffix}`);
  },

  getProject: (projectId) => 
    apiRequest(`/projects/${projectId}`),

  // Create a new project
  createProject: (projectData) =>
    apiRequest('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    }),

  // Update project
  updateProject: (projectId, projectData) =>
    apiRequest(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    }),

  // Delete project
  deleteProject: (projectId) =>
    apiRequest(`/projects/${projectId}`, {
      method: 'DELETE',
    }),

  // Modules
  addModule: (projectId, moduleData) =>
    apiRequest(`/projects/${projectId}/modules`, {
      method: 'POST',
      body: JSON.stringify(moduleData),
    }),

  updateModule: (projectId, moduleId, moduleData) =>
    apiRequest(`/projects/${projectId}/modules/${moduleId}`, {
      method: 'PUT',
      body: JSON.stringify(moduleData),
    }),

  // Tickets
  addTicket: (projectId, moduleId, ticketData) =>
    apiRequest(`/projects/${projectId}/modules/${moduleId}/tickets`, {
      method: 'POST',
      body: JSON.stringify(ticketData),
    }),

  updateTicket: (projectId, moduleId, ticketId, ticketData) =>
    apiRequest(`/projects/${projectId}/modules/${moduleId}/tickets/${ticketId}`, {
      method: 'PUT',
      body: JSON.stringify(ticketData),
    }),

  addTicketComment: (projectId, moduleId, ticketId, comment) =>
    apiRequest(`/projects/${projectId}/modules/${moduleId}/tickets/${ticketId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    }),

  // User assigned tickets across projects
  getAssignedTickets: (userId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const suffix = query ? `?${query}` : '';
    return apiRequest(`/projects/users/${userId}/assigned-tickets${suffix}`);
  },

  // (Optional) Placeholder if needed later
  getProjectModules: (projectId) => 
    apiRequest(`/projects/${projectId}/modules`),
};

export const sprintsAPI = {
  getAllSprints: () => 
    apiRequest('/sprints'),

  getSprint: (sprintId) => 
    apiRequest(`/sprints/${sprintId}`),

  updateSprint: (sprintId, sprintData) => 
    apiRequest(`/sprints/${sprintId}`, {
      method: 'PUT',
      body: JSON.stringify(sprintData),
    }),
};

export const bugsAPI = {
  getAllBugs: () => 
    apiRequest('/bugs'),

  getBug: (bugId) => 
    apiRequest(`/bugs/${bugId}`),

  createBug: (bugData) => 
    apiRequest('/bugs', {
      method: 'POST',
      body: JSON.stringify(bugData),
    }),

  updateBug: (bugId, bugData) => 
    apiRequest(`/bugs/${bugId}`, {
      method: 'PUT',
      body: JSON.stringify(bugData),
    }),

  assignBug: (bugId, assigneeId) => 
    apiRequest(`/bugs/${bugId}/assign`, {
      method: 'PUT',
      body: JSON.stringify({ assigneeId }),
    }),
};

export const kanbanAPI = {
  // Create a new kanban board
  createBoard: (payload) =>
    apiRequest('/kanbanboard', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Get all boards for a project
  getProjectBoards: (projectId) =>
    apiRequest(`/kanbanboard/project/${projectId}`),

  // Get developer's personal board
  getDeveloperPersonalBoard: () =>
    apiRequest('/kanbanboard/developer/personal'),

  // Get tester's personal board
  getTesterPersonalBoard: () =>
    apiRequest('/kanbanboard/tester/personal'),

  // Get a specific board by ID
  getBoard: (boardId) => 
    apiRequest(`/kanbanboard/${boardId}`),

  // Move a ticket between columns on the board
  moveTicket: (boardId, { ticketId, fromColumnId, toColumnId, newPosition }) => 
    apiRequest(`/kanbanboard/${boardId}/move`, {
      method: 'PUT',
      body: JSON.stringify({ ticketId, fromColumnId, toColumnId, newPosition }),
    }),

  // Update a column configuration
  updateColumn: (boardId, columnId, payload) =>
    apiRequest(`/kanbanboard/${boardId}/columns/${columnId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  // Directly update a ticket status (project scoped)
  updateTicketStatus: (projectId, ticketId, payload) =>
    apiRequest(`/kanbanboard/tickets/${projectId}/${ticketId}/status`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  // Add/Remove ticket on a board
  addTicketToBoard: (boardId, payload) =>
    apiRequest(`/kanbanboard/${boardId}/tickets`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  removeTicketFromBoard: (boardId, ticketId) =>
    apiRequest(`/kanbanboard/${boardId}/tickets/${ticketId}`, {
      method: 'DELETE',
    }),

  // Board stats and settings
  getBoardStatistics: (boardId) =>
    apiRequest(`/kanbanboard/${boardId}/statistics`),

  updateBoardSettings: (boardId, settings) =>
    apiRequest(`/kanbanboard/${boardId}/settings`, {
      method: 'PUT',
      body: JSON.stringify({ settings }),
    }),
};

export const analyticsAPI = {
  getDashboardData: () => 
    apiRequest('/analytics/dashboard'),

  // New endpoint implemented on backend
  getPerformanceMetrics: () => 
    apiRequest('/analytics/performance'),

  getProjectMetrics: (projectId) => 
    apiRequest(`/analytics/project/${projectId}`),

  // New endpoint implemented on backend
  getTeamMetrics: (teamId) => 
    apiRequest(`/analytics/team/${teamId}`),

  // New endpoint implemented on backend
  getBugMetrics: () => 
    apiRequest('/analytics/bugs'),
};

export const usersAPI = {
  getAllUsers: () => 
    apiRequest('/users'),

  getUser: (userId) => 
    apiRequest(`/users/${userId}`),

  updateUser: (userId, userData) => 
    apiRequest(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),

  deleteUser: (userId) => 
    apiRequest(`/users/${userId}`, {
      method: 'DELETE',
    }),
};

// Utility functions
export const apiUtils = {
  // Set auth token
  setAuthToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  },

  // Clear auth token
  clearAuthToken: () => {
    localStorage.removeItem('token');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!getAuthToken();
  },

  // Handle API errors globally
  handleApiError: (error) => {
    console.error('API Error:', error);
    
    // Handle specific error cases
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      // Token expired or invalid
      apiUtils.clearAuthToken();
      window.location.href = '/login';
    } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
      // Insufficient permissions
      console.error('Insufficient permissions');
    } else if (error.message.includes('500')) {
      // Server error
      console.error('Server error occurred');
    }
    
    return error;
  },
};

// Realtime: Server-Sent Events subscription helper
export const subscribeToEvents = ({ userId, projectId, role } = {}, onMessage, onError) => {
  const params = new URLSearchParams();
  if (userId) params.append('userId', userId);
  else if (projectId) params.append('projectId', projectId);
  else if (role) params.append('role', role);
  const url = `${API_BASE_URL.replace(/\/$/, '')}/events${params.toString() ? `?${params.toString()}` : ''}`;
  const es = new EventSource(url, { withCredentials: true });
  es.onmessage = (evt) => {
    try {
      const payload = JSON.parse(evt.data);
      onMessage && onMessage(payload);
    } catch {
      // ignore non-JSON (e.g., heartbeat)
    }
  };
  es.onerror = (err) => {
    onError && onError(err);
  };
  return () => {
    es.close();
  };
};

// Default export with all APIs
export default {
  auth: authAPI,
  admin: adminAPI,
  hr: hrAPI,
  manager: managerAPI,
  developer: developerAPI,
  tester: testerAPI,
  employee: employeeAPI,
  sales: salesAPI,
  marketing: marketingAPI,
  intern: internAPI,
  tickets: ticketsAPI,
  projects: projectsAPI,
  sprints: sprintsAPI,
  bugs: bugsAPI,
  kanban: kanbanAPI,
  analytics: analyticsAPI,
  users: usersAPI,
  utils: apiUtils,
  subscribeToEvents,
};
