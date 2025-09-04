// API Service for Project Management System
// Base URL configured in `src/config/api.js`
import { BASE_URL } from '../config/api.js';

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  
  const config = {
    credentials: 'include', // Include cookies for authentication
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add body for POST/PUT/PATCH requests
  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);
    
    // Handle non-JSON responses (e.g., logout)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    }
    
    // For non-JSON responses, just check if response is ok
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// =============================================================================
// AUTHENTICATION SERVICES
// =============================================================================

export const authAPI = {
  // Login user
  login: (credentials) => apiRequest('/api/auth/login', {
    method: 'POST',
    body: credentials,
  }),

  // Register new user
  register: (userData) => apiRequest('/api/auth/register', {
    method: 'POST',
    body: userData,
  }),

  // Logout user
  logout: () => apiRequest('/api/auth/logout', {
    method: 'POST',
  }),
};

// =============================================================================
// ADMIN SERVICES
// =============================================================================

export const adminAPI = {
  // Get current admin user info
  getMe: () => apiRequest('/api/admin/me'),

  // User management
  createUser: (userData) => apiRequest('/api/admin/users', {
    method: 'POST',
    body: userData,
  }),

  createHR: (hrData) => apiRequest('/api/admin/users/hr', {
    method: 'POST',
    body: hrData,
  }),

  getAllUsers: () => apiRequest('/api/admin/users'),

  getUsersByRole: (role) => apiRequest(`/api/admin/users/role/${role}`),

  updateUser: (userId, userData) => apiRequest(`/api/admin/users/${userId}`, {
    method: 'PUT',
    body: userData,
  }),

  deleteUser: (userId) => apiRequest(`/api/admin/users/${userId}`, {
    method: 'DELETE',
  }),

  resetUserPassword: (userId, passwordData) => apiRequest(`/api/admin/users/${userId}/reset-password`, {
    method: 'PATCH',
    body: passwordData,
  }),

  // System statistics
  getSystemStats: () => apiRequest('/api/admin/stats'),

  // Legacy route
  getAll: () => apiRequest('/api/admin/all'),
};

// =============================================================================
// HR SERVICES
// =============================================================================

export const hrAPI = {
  // Get current HR user info
  getMe: () => apiRequest('/api/hr/me'),

  // Employee management
  createEmployee: (employeeData) => apiRequest('/api/hr/employees', {
    method: 'POST',
    body: employeeData,
  }),

  getAllEmployees: () => apiRequest('/api/hr/employees'),

  getEmployeesByRole: (role) => apiRequest(`/api/hr/employees/role/${role}`),

  updateEmployee: (employeeId, employeeData) => apiRequest(`/api/hr/employees/${employeeId}`, {
    method: 'PUT',
    body: employeeData,
  }),

  toggleEmployeeStatus: (employeeId) => apiRequest(`/api/hr/employees/${employeeId}/toggle-status`, {
    method: 'PATCH',
  }),

  // HR statistics
  getEmployeeStats: () => apiRequest('/api/hr/stats'),
};

// =============================================================================
// MANAGER SERVICES
// =============================================================================

export const managerAPI = {
  // Get current manager user info
  getMe: () => apiRequest('/api/manager/me'),

  // Team management
  getTeam: () => apiRequest('/api/manager/team'),
};

// =============================================================================
// DEVELOPER SERVICES
// =============================================================================

export const developerAPI = {
  // Get current developer user info
  getMe: () => apiRequest('/api/developer/me'),

  // Developer dashboard
  getDashboard: () => apiRequest('/api/developer/dashboard'),

  // Projects
  getMyProjects: () => apiRequest('/api/developer/projects'),

  // Tickets
  getMyTickets: (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/api/developer/tickets?${queryParams}` : '/api/developer/tickets';
    return apiRequest(endpoint);
  },

  // Kanban boards
  getMyKanbanBoards: () => apiRequest('/api/developer/kanban/boards'),

  moveOnKanbanBoard: (boardId, moveData) => apiRequest(`/api/developer/kanban/boards/${boardId}/move`, {
    method: 'PATCH',
    body: moveData,
  }),

  // Standups
  getMyStandups: () => apiRequest('/api/developer/standups'),

  upsertMyStandupUpdate: (standupId, updateData) => apiRequest(`/api/developer/standups/${standupId}/updates`, {
    method: 'POST',
    body: updateData,
  }),
};

// =============================================================================
// EMPLOYEE SERVICES
// =============================================================================

export const employeeAPI = {
  // Get current employee user info
  getMe: () => apiRequest('/api/employee/me'),
};

// =============================================================================
// INTERN SERVICES
// =============================================================================

export const internAPI = {
  // Get current intern user info
  getMe: () => apiRequest('/api/intern/me'),
};

// =============================================================================
// TESTER SERVICES
// =============================================================================

export const testerAPI = {
  // Get current tester user info
  getMe: () => apiRequest('/api/tester/me'),
};

// =============================================================================
// KANBAN SERVICES
// =============================================================================

export const kanbanAPI = {
  // Get Kanban board for specific role/context
  getKanbanBoard: (boardType) => apiRequest(`/api/kanbanboard/${boardType}`),

  // Get project-specific kanban board
  getProjectKanbanBoard: (projectId) => apiRequest(`/api/kanbanboard/project/${projectId}`),

  // Get developer's personal kanban board
  getDeveloperKanbanBoard: () => apiRequest('/api/kanbanboard/developer/personal'),

  // Update ticket status (move between columns)
  updateTicketStatus: (projectId, ticketId, statusData) => apiRequest(`/api/kanbanboard/tickets/${projectId}/${ticketId}/status`, {
    method: 'PUT',
    body: statusData,
  }),
};

// =============================================================================
// TICKET SERVICES
// =============================================================================

export const ticketAPI = {
  // Create a new ticket
  createTicket: (ticketData) => apiRequest('/api/tickets', {
    method: 'POST',
    body: ticketData,
  }),

  // Get all tickets for a specific project
  getProjectTickets: (projectId, filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/api/tickets/project/${projectId}?${queryParams}` : `/api/tickets/project/${projectId}`;
    return apiRequest(endpoint);
  },

  // Get a specific ticket
  getTicket: (projectId, ticketId) => apiRequest(`/api/tickets/${projectId}/${ticketId}`),

  // Update ticket details
  updateTicket: (projectId, ticketId, ticketData) => apiRequest(`/api/tickets/${projectId}/${ticketId}`, {
    method: 'PUT',
    body: ticketData,
  }),

  // Add comment to ticket
  addComment: (projectId, ticketId, commentData) => apiRequest(`/api/tickets/${projectId}/${ticketId}/comments`, {
    method: 'POST',
    body: commentData,
  }),

  // Delete ticket
  deleteTicket: (projectId, ticketId) => apiRequest(`/api/tickets/${projectId}/${ticketId}`, {
    method: 'DELETE',
  }),

  // Get all tickets across all projects (admin/HR only)
  getAllTickets: (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/api/tickets?${queryParams}` : '/api/tickets';
    return apiRequest(endpoint);
  },
};

// =============================================================================
// GENERAL USER SERVICES (based on ROUTES_SPEC.txt)
// =============================================================================

export const userAPI = {
  // Get current user info
  getMe: () => apiRequest('/api/me'),

  // Get user's projects
  getMyProjects: () => apiRequest('/api/my/projects'),

  // Get user's tickets
  getMyTickets: (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/api/my/tickets?${queryParams}` : '/api/my/tickets';
    return apiRequest(endpoint);
  },

  // Get user's bugs
  getMyBugs: (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/api/my/bugs?${queryParams}` : '/api/my/bugs';
    return apiRequest(endpoint);
  },
};

// =============================================================================
// PROJECT SERVICES (based on ROUTES_SPEC.txt)
// =============================================================================

export const projectAPI = {
  // Create project
  createProject: (projectData) => apiRequest('/api/projects', {
    method: 'POST',
    body: projectData,
  }),

  // Get all visible projects
  getProjects: () => apiRequest('/api/projects'),

  // Get specific project
  getProject: (projectId) => apiRequest(`/api/projects/${projectId}`),

  // Update project
  updateProject: (projectId, projectData) => apiRequest(`/api/projects/${projectId}`, {
    method: 'PUT',
    body: projectData,
  }),

  // Delete project
  deleteProject: (projectId) => apiRequest(`/api/projects/${projectId}`, {
    method: 'DELETE',
  }),

  // Project membership
  updateMembers: (projectId, memberData) => apiRequest(`/api/projects/${projectId}/members`, {
    method: 'PATCH',
    body: memberData,
  }),

  updateManager: (projectId, managerData) => apiRequest(`/api/projects/${projectId}/manager`, {
    method: 'PATCH',
    body: managerData,
  }),
};

// =============================================================================
// SPRINT SERVICES (based on ROUTES_SPEC.txt)
// =============================================================================

export const sprintAPI = {
  // Create sprint
  createSprint: (projectId, sprintData) => apiRequest(`/api/projects/${projectId}/sprints`, {
    method: 'POST',
    body: sprintData,
  }),

  // Get project sprints
  getProjectSprints: (projectId) => apiRequest(`/api/projects/${projectId}/sprints`),

  // Get specific sprint
  getSprint: (projectId, sprintId) => apiRequest(`/api/projects/${projectId}/sprints/${sprintId}`),

  // Update sprint
  updateSprint: (projectId, sprintId, sprintData) => apiRequest(`/api/projects/${projectId}/sprints/${sprintId}`, {
    method: 'PUT',
    body: sprintData,
  }),

  // Delete sprint
  deleteSprint: (projectId, sprintId) => apiRequest(`/api/projects/${projectId}/sprints/${sprintId}`, {
    method: 'DELETE',
  }),

  // Assign developers to sprint
  assignDevelopers: (sprintId, developerData) => apiRequest(`/api/sprints/${sprintId}/assign-developers`, {
    method: 'PATCH',
    body: developerData,
  }),

  // Update sprint tickets
  updateTickets: (sprintId, ticketData) => apiRequest(`/api/sprints/${sprintId}/tickets`, {
    method: 'PATCH',
    body: ticketData,
  }),

  // Update sprint status
  updateStatus: (sprintId, statusData) => apiRequest(`/api/sprints/${sprintId}/status`, {
    method: 'PATCH',
    body: statusData,
  }),
};

// =============================================================================
// STANDUP SERVICES (based on ROUTES_SPEC.txt)
// =============================================================================

export const standupAPI = {
  // Create standup
  createStandup: (projectId, standupData) => apiRequest(`/api/projects/${projectId}/standups`, {
    method: 'POST',
    body: standupData,
  }),

  // Get project standups
  getProjectStandups: (projectId) => apiRequest(`/api/projects/${projectId}/standups`),

  // Get specific standup
  getStandup: (projectId, standupId) => apiRequest(`/api/projects/${projectId}/standups/${standupId}`),

  // Update standup
  updateStandup: (projectId, standupId, standupData) => apiRequest(`/api/projects/${projectId}/standups/${standupId}`, {
    method: 'PATCH',
    body: standupData,
  }),

  // Delete standup
  deleteStandup: (projectId, standupId) => apiRequest(`/api/projects/${projectId}/standups/${standupId}`, {
    method: 'DELETE',
  }),

  // Add standup update
  addUpdate: (standupId, updateData) => apiRequest(`/api/standups/${standupId}/updates`, {
    method: 'POST',
    body: updateData,
  }),

  // Update standup update
  updateUpdate: (standupId, updateId, updateData) => apiRequest(`/api/standups/${standupId}/updates/${updateId}`, {
    method: 'PATCH',
    body: updateData,
  }),

  // Delete standup update
  deleteUpdate: (standupId, updateId) => apiRequest(`/api/standups/${standupId}/updates/${updateId}`, {
    method: 'DELETE',
  }),
};

// =============================================================================
// BUG TRACKER SERVICES (based on ROUTES_SPEC.txt)
// =============================================================================

export const bugAPI = {
  // Create bug
  createBug: (projectId, bugData) => apiRequest(`/api/projects/${projectId}/bugs`, {
    method: 'POST',
    body: bugData,
  }),

  // Get project bugs
  getProjectBugs: (projectId, filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/api/projects/${projectId}/bugs?${queryParams}` : `/api/projects/${projectId}/bugs`;
    return apiRequest(endpoint);
  },

  // Get specific bug
  getBug: (projectId, bugId) => apiRequest(`/api/projects/${projectId}/bugs/${bugId}`),

  // Update bug
  updateBug: (projectId, bugId, bugData) => apiRequest(`/api/projects/${projectId}/bugs/${bugId}`, {
    method: 'PUT',
    body: bugData,
  }),

  // Assign bug
  assignBug: (projectId, bugId, assignData) => apiRequest(`/api/projects/${projectId}/bugs/${bugId}/assign`, {
    method: 'PATCH',
    body: assignData,
  }),

  // Update bug status
  updateBugStatus: (projectId, bugId, statusData) => apiRequest(`/api/projects/${projectId}/bugs/${bugId}/status`, {
    method: 'PATCH',
    body: statusData,
  }),

  // Add comment to bug
  addBugComment: (projectId, bugId, commentData) => apiRequest(`/api/projects/${projectId}/bugs/${bugId}/comments`, {
    method: 'POST',
    body: commentData,
  }),

  // Link bug to ticket
  linkBugToTicket: (projectId, ticketId, bugId) => apiRequest(`/api/projects/${projectId}/tickets/${ticketId}/link-bug/${bugId}`, {
    method: 'PATCH',
  }),
};

// =============================================================================
// ACTIVITY LOG SERVICES (based on ROUTES_SPEC.txt)
// =============================================================================

export const activityAPI = {
  // Create activity log (internal use)
  createLog: (projectId, logData) => apiRequest(`/api/projects/${projectId}/activity-logs`, {
    method: 'POST',
    body: logData,
  }),

  // Get project activity logs
  getProjectLogs: (projectId, filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/api/projects/${projectId}/activity-logs?${queryParams}` : `/api/projects/${projectId}/activity-logs`;
    return apiRequest(endpoint);
  },

  // Get entity-specific logs
  getEntityLogs: (projectId, entityType, entityId) => apiRequest(`/api/projects/${projectId}/activity-logs/${entityType}/${entityId}`),
};

// =============================================================================
// EXTENDED KANBAN SERVICES (based on ROUTES_SPEC.txt)
// =============================================================================

export const extendedKanbanAPI = {
  // Board CRUD
  createBoard: (projectId, boardData) => apiRequest(`/api/projects/${projectId}/kanban/boards`, {
    method: 'POST',
    body: boardData,
  }),

  getProjectBoards: (projectId) => apiRequest(`/api/projects/${projectId}/kanban/boards`),

  getBoard: (projectId, boardId) => apiRequest(`/api/projects/${projectId}/kanban/boards/${boardId}`),

  updateBoard: (projectId, boardId, boardData) => apiRequest(`/api/projects/${projectId}/kanban/boards/${boardId}`, {
    method: 'PUT',
    body: boardData,
  }),

  deleteBoard: (projectId, boardId) => apiRequest(`/api/projects/${projectId}/kanban/boards/${boardId}`, {
    method: 'DELETE',
  }),

  // Column management
  addColumn: (boardId, columnData) => apiRequest(`/api/kanban/boards/${boardId}/columns`, {
    method: 'POST',
    body: columnData,
  }),

  updateColumn: (boardId, columnId, columnData) => apiRequest(`/api/kanban/boards/${boardId}/columns/${columnId}`, {
    method: 'PATCH',
    body: columnData,
  }),

  deleteColumn: (boardId, columnId) => apiRequest(`/api/kanban/boards/${boardId}/columns/${columnId}`, {
    method: 'DELETE',
  }),

  // Move tickets on board
  moveTicket: (boardId, moveData) => apiRequest(`/api/kanban/boards/${boardId}/move`, {
    method: 'PATCH',
    body: moveData,
  }),
};

// =============================================================================
// EXPORT DEFAULT API OBJECT
// =============================================================================

const api = {
  auth: authAPI,
  admin: adminAPI,
  hr: hrAPI,
  manager: managerAPI,
  developer: developerAPI,
  employee: employeeAPI,
  intern: internAPI,
  tester: testerAPI,
  user: userAPI,
  project: projectAPI,
  ticket: ticketAPI,
  kanban: kanbanAPI,
  extendedKanban: extendedKanbanAPI,
  sprint: sprintAPI,
  standup: standupAPI,
  bug: bugAPI,
  activity: activityAPI,
};

export default api;
