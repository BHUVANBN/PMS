// API Configuration
// Prefer environment variable (Vite), then window override, then localhost fallback
const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL)
  || (typeof window !== 'undefined' && window.__API_BASE_URL__)
  || 'http://localhost:5000/api';

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Public (unauthenticated) API
export const publicAPI = {
  submitOnboarding: (formData) =>
    apiRequest('/public/onboarding', {
      method: 'POST',
      body: formData,
      includeAuth: false,
    }),
  listPublicOnboarding: () =>
    apiRequest('/public/onboarding'),
  approvePublicOnboarding: (id) =>
    apiRequest(`/public/onboarding/${id}/approve`, {
      method: 'POST',
    }),
  deletePublicOnboarding: (id) =>
    apiRequest(`/public/onboarding/${id}`, {
      method: 'DELETE',
    }),
};

// Standup API (per-user daily standup)
export const standupAPI = {
  // Check if current user submitted today
  getTodayStatus: () => apiRequest('/standup/today'),

  // Submit today's standup
  submit: (payload) =>
    apiRequest('/standup', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // My past standups
  myStandups: () => apiRequest('/standup/me'),

  // Admin/HR list
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const suffix = query ? `?${query}` : '';
    return apiRequest(`/standup/list${suffix}`);
  },

  // Manager/Admin/HR: today's standups scoped to role
  todayAll: () => apiRequest('/standup/today/all'),

  // Manager/Admin/HR: add comment to a standup
  addComment: (standupId, comment) =>
    apiRequest(`/standup/${standupId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    }),

  // Upload attachment to a standup (owner or privileged)
  addAttachment: (standupId, { file, name }) => {
    const formData = new FormData();
    if (file) formData.append('file', file);
    if (name) formData.append('name', name);
    return apiRequest(`/standup/${standupId}/attachments`, {
      method: 'POST',
      body: formData,
    });
  },

  // Summary report for range/project
  summary: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const suffix = query ? `?${query}` : '';
    return apiRequest(`/standup/summary${suffix}`);
  },
};

// Helper to build query string from params
const buildQuery = (params = {}) => {
  if (!params || typeof params !== 'object') return '';
  const parts = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
  return parts.length ? `?${parts.join('&')}` : '';
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
    // Unauthorized - do NOT hard-redirect. Let callers handle and AuthContext manage state.
    const err = new Error('Unauthorized');
    err.status = 401;
    throw err;
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
    const includeAuth = options.includeAuth !== false;
    const baseHeaders = createHeaders(includeAuth);
    const providedHeaders = options.headers || {};

    const config = {
      method: 'GET',
      credentials: 'include', // Include cookies for authentication
      ...options,
    };

    config.headers = { ...baseHeaders, ...providedHeaders };

    if (config.body instanceof FormData) {
      delete config.headers['Content-Type'];
    } else if (config.body && typeof config.body === 'object') {
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
      isVerifiedByHR:false
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

  forgotPassword: ({ email }) =>
    apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
      includeAuth: false,
    }),

  resetPassword: ({ token, password }) =>
    apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
      includeAuth: false,
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

  // Project management
  getAllProjects: () =>
    apiRequest('/admin/projects'),

  createProject: (projectData) =>
    apiRequest('/admin/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    }),

  updateProject: (projectId, projectData) =>
    apiRequest(`/admin/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    }),

  // Team management
  getAllTeams: () =>
    apiRequest('/admin/teams'),
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

  getOnboardingList: (params) =>
    apiRequest(`/hr/onboarding${buildQuery(params)}`),

  getOnboardingSummary: () =>
    apiRequest('/hr/onboarding/summary'),

  getOnboardingDetails: (userId) =>
    apiRequest(`/hr/onboarding/${userId}`),

  uploadOnboardingDocuments: (userId, formData) =>
    apiRequest(`/hr/onboarding/${userId}/documents`, {
      method: 'POST',
      body: formData,
    }),

  verifyOnboarding: (userId, payload) =>
    apiRequest(`/hr/onboarding/${userId}/verify`, {
      method: 'POST',
      body: payload,
    }),

  deleteOnboardingDocument: (userId, scope, docKey) =>
    apiRequest(`/hr/onboarding/${userId}/documents/${scope}/${docKey}`, {
      method: 'DELETE',
    }),

  // Generic HR documents (flexible)
  addHRGenericDocument: (userId, { name, description, file }) => {
    const formData = new FormData();
    if (name) formData.append('name', name);
    if (description) formData.append('description', description);
    if (file) formData.append('file', file);
    return apiRequest(`/hr/onboarding/${userId}/hr-docs`, {
      method: 'POST',
      body: formData,
    });
  },

  getHRGenericDocuments: (userId) =>
    apiRequest(`/hr/onboarding/${userId}/hr-docs`),

  deleteHRGenericDocument: (userId, docId) =>
    apiRequest(`/hr/onboarding/${userId}/hr-docs/${docId}`, { method: 'DELETE' }),

  // Finalize onboarding to employee documents archive
  finalizeOnboarding: (userId) =>
    apiRequest(`/hr/onboarding/${userId}/finalize`, { method: 'POST' }),

  finalizeAllOnboarding: () =>
    apiRequest('/hr/onboarding/finalize-all', { method: 'POST' }),
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
  addModule: (projectId, moduleData) => 
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
    apiRequest(`/manager/ticket/${projectId}/${moduleId}`, {
      method: 'POST',
      body: JSON.stringify(ticketData),
    }),

  // View all tickets across modules for manager
  getAllTickets: () =>
    apiRequest('/manager/tickets'),

  // Ticket CRUD via centralized tickets routes (project-scoped)
  getTicketById: (projectId, ticketId) =>
    apiRequest(`/tickets/${projectId}/${ticketId}`),

  updateTicket: (projectId, ticketId, ticketData) =>
    apiRequest(`/tickets/${projectId}/${ticketId}`, {
      method: 'PUT',
      body: JSON.stringify(ticketData),
    }),

  deleteTicket: (projectId, ticketId) =>
    apiRequest(`/tickets/${projectId}/${ticketId}`, {
      method: 'DELETE',
    }),

  // Get all employees for assignment
  getEmployees: (params) => {
    const query = params?.role ? `?role=${params.role}` : '';
    return apiRequest(`/manager/employees${query}`);
  },

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

  getTicketLogs: (projectId, ticketId) => {
    const query = ticketId ? `?ticketId=${ticketId}` : '';
    return apiRequest(`/manager/projects/${projectId}/ticket-logs${query}`);
  },

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

  getProjectBugs: (projectId, params = {}) =>
    apiRequest(`/bugs/project/${projectId}${buildQuery(params)}`),

  // Send a document to all team members of a project
  sendTeamDocument: (projectId, { name, description, file }) => {
    const formData = new FormData();
    if (name) formData.append('name', name);
    if (description) formData.append('description', description);
    if (file) formData.append('file', file);
    return apiRequest(`/manager/project/${projectId}/team-docs`, {
      method: 'POST',
      body: formData,
    });
  },
};

// Developer API
export const developerAPI = {
  // Dashboard
  getDashboard: () => 
    apiRequest('/developer/dashboard'),

  getProjects: () =>
    apiRequest('/developer/projects'),

  getBugs: (projectId, params = {}) =>
    apiRequest(`/bugs/project/${projectId}${buildQuery(params)}`),

  // Get developer stats
  getStats: () =>
    apiRequest('/developer/stats'),

  // Tickets
  getMyTickets: () => 
    apiRequest('/developer/tickets'),

  // Complete a ticket (moves to testing if tester assigned)
  completeTicket: (projectId, moduleId, ticketId, payload) =>
    apiRequest(`/developer/tickets/${projectId}/${moduleId}/${ticketId}/complete`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

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
  getKanbanBoard: (projectId) => {
    const query = projectId ? `?projectId=${projectId}` : '';
    return apiRequest(`/kanbanboard/developer/personal${query}`);
  },

  // Get a specific developer's kanban board by ID (manager/admin usage)
  getKanbanBoardById: (developerId) =>
    apiRequest(`/kanbanboard/developer/${developerId}`),

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

  // Get tester stats
  getTesterStats: () =>
    apiRequest('/tester/stats'),

  getProjects: () =>
    apiRequest('/tester/projects'),

  // Get all bugs accessible to tester
  getAllBugs: () =>
    apiRequest('/tester/bugs'),

  createBugFromTicket: (projectId, moduleId, ticketId, payload) =>
    apiRequest(`/tester/tickets/${projectId}/${moduleId}/${ticketId}/bugs`, {
      method: 'POST',
      body: payload,
    }),

  resolveTicketBugs: (projectId, moduleId, ticketId) =>
    apiRequest(`/tester/tickets/${projectId}/${moduleId}/${ticketId}/resolve-bugs`, {
      method: 'POST',
    }),

  getProjectBugs: (projectId, params = {}) =>
    apiRequest(`/bugs/project/${projectId}${buildQuery(params)}`),

  getProjectBugsForDeveloper: (projectId, params = {}) =>
    apiRequest(`/bugs/project/${projectId}${buildQuery(params)}`),

  getProjectBugsForManager: (projectId, params = {}) =>
    apiRequest(`/bugs/project/${projectId}${buildQuery(params)}`),

  // Get tickets assigned to tester
  getMyTestTickets: () =>
    apiRequest('/tester/tickets'),

  // Approve/validate a ticket after testing
  approveTicket: (projectId, moduleId, ticketId, payload) =>
    apiRequest(`/tester/tickets/${projectId}/${moduleId}/${ticketId}/approve`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Start testing a ticket
  startTesting: (projectId, moduleId, ticketId, payload) =>
    apiRequest(`/tester/tickets/${projectId}/${moduleId}/${ticketId}/start-testing`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Complete testing for a ticket
  completeTesting: (projectId, moduleId, ticketId, payload) =>
    apiRequest(`/tester/tickets/${projectId}/${moduleId}/${ticketId}/complete-testing`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

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

  getOnboardingStatus: () =>
    apiRequest('/employee/onboarding'),

  uploadOnboardingDocuments: (formData) =>
    apiRequest('/employee/onboarding/documents', {
      method: 'POST',
      body: formData,
    }),
  
  // Fetch current user's received HR generic documents
  getMyHRDocs: () =>
    apiRequest('/employee/hr-docs'),
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
  // Get all tickets across all projects (admin/HR only)
  getAllTickets: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const suffix = query ? `?${query}` : '';
    return apiRequest(`/tickets${suffix}`);
  },

  // Get all tickets for a specific project
  getProjectTickets: (projectId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const suffix = query ? `?${query}` : '';
    return apiRequest(`/tickets/project/${projectId}${suffix}`);
  },

  // Ticket endpoints require projectId path parameter on backend
  getTicket: (projectId, ticketId) => 
    apiRequest(`/tickets/${projectId}/${ticketId}`),

  updateTicket: (projectId, ticketId, ticketData) => 
    apiRequest(`/tickets/${projectId}/${ticketId}`, {
      method: 'PUT',
      body: JSON.stringify(ticketData),
    }),

  // Create a ticket within a specific module of a project (uses project routes)
  createTicket: (projectId, moduleId, ticketData) =>
    apiRequest(`/projects/${projectId}/modules/${moduleId}/tickets`, {
      method: 'POST',
      body: JSON.stringify(ticketData),
    }),

  // Delete a ticket (centralized tickets route)
  deleteTicket: (projectId, ticketId) =>
    apiRequest(`/tickets/${projectId}/${ticketId}`, {
      method: 'DELETE',
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
  getDeveloperPersonalBoard: (projectId) => {
    const query = projectId ? `?projectId=${projectId}` : '';
    return apiRequest(`/kanbanboard/developer/personal${query}`);
  },

  // Get tester's personal board
  getTesterPersonalBoard: (projectId) => {
    const query = projectId ? `?projectId=${projectId}` : '';
    return apiRequest(`/kanbanboard/tester/personal${query}`);
  },

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

  getUsersByRole: (role) =>
    apiRequest(`/users/role/${role}`),

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
      // Token expired or invalid - do not redirect here; allow UI/AuthContext to handle
      return error;
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

export const calendarAPI = {
  // Create a new calendar event (HR only)
  createEvent: (eventData) =>
    apiRequest('/calendar/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    }),

  // Create a personal calendar event (any role)
  createPersonalEvent: (eventData) =>
    apiRequest('/calendar/events/personal', {
      method: 'POST',
      body: JSON.stringify(eventData),
    }),

  // Get all calendar events
  getAllEvents: () =>
    apiRequest('/calendar/events'),

  // Get events for a specific date range
  getEventsByDateRange: (startDate, endDate) =>
    apiRequest(`/calendar/events/range?startDate=${startDate}&endDate=${endDate}`),

  // Get a single calendar event by ID
  getEventById: (eventId) =>
    apiRequest(`/calendar/events/${eventId}`),

  // Update a calendar event
  updateEvent: (eventId, eventData) =>
    apiRequest(`/calendar/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    }),

  // Delete a calendar event
  deleteEvent: (eventId) =>
    apiRequest(`/calendar/events/${eventId}`, {
      method: 'DELETE',
    }),

  // Get users for attendee selection (HR only)
  getUsersForAttendees: () =>
    apiRequest('/calendar/users/attendees'),
};

export const meetingAPI = {
  // Schedule a meeting (manager only)
  scheduleMeeting: (payload) =>
    apiRequest('/meetings/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),

  // Get all meetings for a project
  getProjectMeetings: (projectId) =>
    apiRequest(`/meetings/project/${projectId}`),

  getUserMeetings: () =>
  apiRequest('/meetings/user', {
    method: 'GET',
  }),

  // Get a single meeting by ID
  getMeetingById: (meetingId) =>
    apiRequest(`/meetings/${meetingId}`),

  // Update a meeting (manager only)
  updateMeeting: (meetingId, payload) =>
    apiRequest(`/meetings/${meetingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
    
    endMeeting: (meetingId) =>
    apiRequest(`/meetings/${meetingId}/end`, {
    method: 'PATCH',
    }),

  // Delete a meeting (manager only)
  deleteMeeting: (meetingId) =>
    apiRequest(`/meetings/${meetingId}`, {
      method: 'DELETE',
    }),
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
  standup: standupAPI,
  calendar: calendarAPI,
  meetings: meetingAPI,
  public: publicAPI,
  utils: apiUtils,
  subscribeToEvents,
};