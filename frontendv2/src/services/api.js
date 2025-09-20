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

// Generic API request handler with error handling
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: createHeaders(options.includeAuth !== false),
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    // Handle different response types
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      throw new Error(data.message || data || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
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

  // Create HR account
  createHRAccount: (hrData) => 
    apiRequest('/admin/create-hr', {
      method: 'POST',
      body: JSON.stringify(hrData),
    }),

  // Get organization analytics
  getOrganizationAnalytics: () => 
    apiRequest('/admin/analytics'),

  // Get system stats
  getSystemStats: () => 
    apiRequest('/admin/stats'),

  // Update user role
  updateUserRole: (userId, roleData) => 
    apiRequest(`/admin/users/${userId}/role`, {
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
  // Employee management
  getAllEmployees: () => 
    apiRequest('/hr/employees'),

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

  deleteEmployee: (employeeId) => 
    apiRequest(`/hr/employees/${employeeId}`, {
      method: 'DELETE',
    }),

  // Leave management
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
    apiRequest('/manager/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    }),

  updateProject: (projectId, projectData) => 
    apiRequest(`/manager/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    }),

  deleteProject: (projectId) => 
    apiRequest(`/manager/projects/${projectId}`, {
      method: 'DELETE',
    }),

  // Module management
  createModule: (projectId, moduleData) => 
    apiRequest(`/manager/projects/${projectId}/modules`, {
      method: 'POST',
      body: JSON.stringify(moduleData),
    }),

  updateModule: (moduleId, moduleData) => 
    apiRequest(`/manager/modules/${moduleId}`, {
      method: 'PUT',
      body: JSON.stringify(moduleData),
    }),

  deleteModule: (moduleId) => 
    apiRequest(`/manager/modules/${moduleId}`, {
      method: 'DELETE',
    }),

  // Ticket management
  createTicket: (moduleId, ticketData) => 
    apiRequest(`/manager/modules/${moduleId}/tickets`, {
      method: 'POST',
      body: JSON.stringify(ticketData),
    }),

  assignTicket: (ticketId, assignmentData) => 
    apiRequest(`/manager/tickets/${ticketId}/assign`, {
      method: 'PUT',
      body: JSON.stringify(assignmentData),
    }),

  // Sprint management
  createSprint: (sprintData) => 
    apiRequest('/manager/sprints', {
      method: 'POST',
      body: JSON.stringify(sprintData),
    }),

  getSprintBoard: (teamId) => 
    apiRequest(`/manager/sprint-board/${teamId}`),

  // Analytics
  getTeamAnalytics: () => 
    apiRequest('/manager/analytics'),

  getProjectAnalytics: (projectId) => 
    apiRequest(`/manager/analytics/project/${projectId}`),
};

// Developer API
export const developerAPI = {
  // Dashboard
  getDashboard: () => 
    apiRequest('/developer/dashboard'),

  // Tickets
  getMyTickets: () => 
    apiRequest('/developer/tickets'),

  updateTicketStatus: (ticketId, status) => 
    apiRequest(`/developer/tickets/${ticketId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  addTicketComment: (ticketId, comment) => 
    apiRequest(`/developer/tickets/${ticketId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    }),

  // Kanban board
  getKanbanBoard: () => 
    apiRequest('/developer/kanban'),

  moveTicket: (ticketId, newStatus) => 
    apiRequest(`/developer/kanban/move`, {
      method: 'PUT',
      body: JSON.stringify({ ticketId, newStatus }),
    }),
};

// Tester API
export const testerAPI = {
  // Dashboard
  getDashboard: () => 
    apiRequest('/tester/dashboard'),

  // Test cases
  getTestCases: () => 
    apiRequest('/tester/test-cases'),

  createTestCase: (testCaseData) => 
    apiRequest('/tester/test-cases', {
      method: 'POST',
      body: JSON.stringify(testCaseData),
    }),

  updateTestCase: (testCaseId, testCaseData) => 
    apiRequest(`/tester/test-cases/${testCaseId}`, {
      method: 'PUT',
      body: JSON.stringify(testCaseData),
    }),

  // Bug tracking
  createBug: (bugData) => 
    apiRequest('/tester/bugs', {
      method: 'POST',
      body: JSON.stringify(bugData),
    }),

  updateBugStatus: (bugId, status) => 
    apiRequest(`/tester/bugs/${bugId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  // Kanban board
  getKanbanBoard: () => 
    apiRequest('/tester/kanban'),

  validateTicket: (ticketId, validationData) => 
    apiRequest(`/tester/tickets/${ticketId}/validate`, {
      method: 'PUT',
      body: JSON.stringify(validationData),
    }),
};

// Employee API
export const employeeAPI = {
  // Profile
  getProfile: () => 
    apiRequest('/employee/profile'),

  updateProfile: (profileData) => 
    apiRequest('/employee/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),

  // Dashboard
  getDashboard: () => 
    apiRequest('/employee/dashboard'),

  // Leave requests
  submitLeaveRequest: (leaveData) => 
    apiRequest('/employee/leave-request', {
      method: 'POST',
      body: JSON.stringify(leaveData),
    }),

  getMyLeaveRequests: () => 
    apiRequest('/employee/leave-requests'),

  // Standups
  submitStandup: (standupData) => 
    apiRequest('/employee/standup', {
      method: 'POST',
      body: JSON.stringify(standupData),
    }),

  getMyStandups: () => 
    apiRequest('/employee/standups'),
};

// Sales API
export const salesAPI = {
  // Dashboard
  getDashboard: () => 
    apiRequest('/sales/dashboard'),

  // Tickets
  getMyTickets: () => 
    apiRequest('/sales/tickets'),

  updateTicketStatus: (ticketId, status) => 
    apiRequest(`/sales/tickets/${ticketId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  // Reports
  getSalesReports: () => 
    apiRequest('/sales/reports'),

  createSalesReport: (reportData) => 
    apiRequest('/sales/reports', {
      method: 'POST',
      body: JSON.stringify(reportData),
    }),

  // Kanban board
  getKanbanBoard: () => 
    apiRequest('/sales/kanban'),
};

// Marketing API
export const marketingAPI = {
  // Dashboard
  getDashboard: () => 
    apiRequest('/marketing/dashboard'),

  // Tickets
  getMyTickets: () => 
    apiRequest('/marketing/tickets'),

  updateTicketStatus: (ticketId, status) => 
    apiRequest(`/marketing/tickets/${ticketId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  // Campaigns
  getCampaigns: () => 
    apiRequest('/marketing/campaigns'),

  createCampaign: (campaignData) => 
    apiRequest('/marketing/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData),
    }),

  updateCampaign: (campaignId, campaignData) => 
    apiRequest(`/marketing/campaigns/${campaignId}`, {
      method: 'PUT',
      body: JSON.stringify(campaignData),
    }),

  // Kanban board
  getKanbanBoard: () => 
    apiRequest('/marketing/kanban'),
};

// Intern API
export const internAPI = {
  // Dashboard
  getDashboard: () => 
    apiRequest('/intern/dashboard'),

  // Tickets (same as assigned role)
  getMyTickets: () => 
    apiRequest('/intern/tickets'),

  updateTicketStatus: (ticketId, status) => 
    apiRequest(`/intern/tickets/${ticketId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  // Kanban board
  getKanbanBoard: () => 
    apiRequest('/intern/kanban'),

  // Learning resources
  getLearningResources: () => 
    apiRequest('/intern/learning-resources'),
};

// Generic APIs
export const ticketsAPI = {
  getTicket: (ticketId) => 
    apiRequest(`/tickets/${ticketId}`),

  updateTicket: (ticketId, ticketData) => 
    apiRequest(`/tickets/${ticketId}`, {
      method: 'PUT',
      body: JSON.stringify(ticketData),
    }),

  addComment: (ticketId, comment) => 
    apiRequest(`/tickets/${ticketId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    }),

  getComments: (ticketId) => 
    apiRequest(`/tickets/${ticketId}/comments`),
};

export const projectsAPI = {
  getAllProjects: () => 
    apiRequest('/projects'),

  getProject: (projectId) => 
    apiRequest(`/projects/${projectId}`),

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
  getBoard: () => 
    apiRequest('/kanbanboard'),

  moveTicket: (ticketId, newStatus, newPosition) => 
    apiRequest('/kanbanboard/move', {
      method: 'PUT',
      body: JSON.stringify({ ticketId, newStatus, newPosition }),
    }),

  updateTicketPosition: (ticketId, position) => 
    apiRequest('/kanbanboard/position', {
      method: 'PUT',
      body: JSON.stringify({ ticketId, position }),
    }),
};

export const analyticsAPI = {
  getDashboardData: () => 
    apiRequest('/analytics/dashboard'),

  getPerformanceMetrics: () => 
    apiRequest('/analytics/performance'),

  getProjectMetrics: (projectId) => 
    apiRequest(`/analytics/project/${projectId}`),

  getTeamMetrics: (teamId) => 
    apiRequest(`/analytics/team/${teamId}`),

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
};
