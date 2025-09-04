// Central API configuration

export const API_ORIGIN = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const BASE_URL = API_ORIGIN;

export function withBase(path = '') {
  if (!path) return BASE_URL;
  const hasLeadingSlash = path.startsWith('/');
  return `${BASE_URL}${hasLeadingSlash ? '' : '/'}${path}`;
}

// API service object
export const api = {
  // Auth endpoints
  login: (credentials) => fetch(withBase('/api/auth/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  }),
  
  logout: () => fetch(withBase('/api/auth/logout'), { method: 'POST' }),
  
  // User endpoints
  getUsers: () => fetch(withBase('/api/users')),
  getUser: (id) => fetch(withBase(`/api/users/${id}`)),
  createUser: (userData) => fetch(withBase('/api/users'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  }),
  updateUser: (id, userData) => fetch(withBase(`/api/users/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  }),
  deleteUser: (id) => fetch(withBase(`/api/users/${id}`), { method: 'DELETE' }),
  
  // Project endpoints
  getProjects: () => fetch(withBase('/api/projects')),
  getProject: (id) => fetch(withBase(`/api/projects/${id}`)),
  createProject: (projectData) => fetch(withBase('/api/projects'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(projectData)
  }),
  updateProject: (id, projectData) => fetch(withBase(`/api/projects/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(projectData)
  }),
  deleteProject: (id) => fetch(withBase(`/api/projects/${id}`), { method: 'DELETE' }),
  
  // Ticket endpoints
  getTickets: (projectId) => fetch(withBase(`/api/projects/${projectId}/tickets`)),
  getTicket: (projectId, ticketId) => fetch(withBase(`/api/projects/${projectId}/tickets/${ticketId}`)),
  createTicket: (projectId, ticketData) => fetch(withBase(`/api/projects/${projectId}/tickets`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ticketData)
  }),
  updateTicket: (projectId, ticketId, ticketData) => fetch(withBase(`/api/projects/${projectId}/tickets/${ticketId}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ticketData)
  }),
  deleteTicket: (projectId, ticketId) => fetch(withBase(`/api/projects/${projectId}/tickets/${ticketId}`), { method: 'DELETE' }),
  
  // Bug endpoints
  getBugs: () => fetch(withBase('/api/bugs')),
  getBug: (id) => fetch(withBase(`/api/bugs/${id}`)),
  createBug: (bugData) => fetch(withBase('/api/bugs'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bugData)
  }),
  updateBug: (id, bugData) => fetch(withBase(`/api/bugs/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bugData)
  }),
  deleteBug: (id) => fetch(withBase(`/api/bugs/${id}`), { method: 'DELETE' }),
  
  // Dashboard endpoints
  getDashboardStats: (role) => fetch(withBase(`/api/dashboard/${role}`)),
  getRecentActivity: () => fetch(withBase('/api/activity')),
  
  // Timesheet endpoints
  getTimesheets: (userId) => fetch(withBase(`/api/users/${userId}/timesheets`)),
  createTimesheet: (userId, timesheetData) => fetch(withBase(`/api/users/${userId}/timesheets`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(timesheetData)
  }),
  
  // Leave management endpoints
  getLeaveRequests: () => fetch(withBase('/api/leave-requests')),
  createLeaveRequest: (leaveData) => fetch(withBase('/api/leave-requests'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(leaveData)
  }),
  
  // System settings endpoints
  getSystemSettings: () => fetch(withBase('/api/system/settings')),
  updateSystemSettings: (settings) => fetch(withBase('/api/system/settings'), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings)
  })
};

export default api;
