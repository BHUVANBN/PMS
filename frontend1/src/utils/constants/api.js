// API endpoint constants
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
  },

  // Admin
  ADMIN: {
    USERS: '/admin/users',
    HR: '/admin/hr',
    STATS: '/admin/stats',
  },

  // Manager
  MANAGER: {
    PROJECTS: '/manager/projects',
    TICKETS: '/manager/tickets',
    REPORTS: '/manager/reports',
    SPRINTS: '/manager/sprints',
  },

  // Developer
  DEVELOPER: {
    DASHBOARD: '/developer/dashboard',
    TASKS: '/developer/tasks',
    CODE_REVIEWS: '/developer/code-reviews',
  },

  // Tester
  TESTER: {
    DASHBOARD: '/tester/dashboard',
    TASKS: '/tester/tasks',
    BUGS: '/tester/bugs',
    REPORTS: '/tester/reports',
  },

  // HR
  HR: {
    DASHBOARD: '/hr/dashboard',
    EMPLOYEES: '/hr/employees',
    STATS: '/hr/stats',
    REPORTS: '/hr/reports',
    LEAVE_REQUESTS: '/hr/leave-requests',
  },

  // Employee
  EMPLOYEE: {
    PROFILE: '/employee/profile',
    TIMESHEET: '/employee/timesheet',
    LEAVE_REQUESTS: '/employee/leave-requests',
  },

  // Tickets
  TICKETS: '/tickets',

  // Kanban
  KANBAN: '/kanbanboard',
};

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  HR: 'hr',
  MANAGER: 'manager',
  DEVELOPER: 'developer',
  TESTER: 'tester',
  EMPLOYEE: 'employee',
};

// Ticket statuses
export const TICKET_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  TESTING: 'testing',
  CODE_REVIEW: 'code_review',
  BLOCKED: 'blocked',
  DONE: 'done',
  CLOSED: 'closed',
};

// Ticket priorities
export const TICKET_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

// Ticket types
export const TICKET_TYPE = {
  TASK: 'task',
  BUG: 'bug',
  FEATURE: 'feature',
  IMPROVEMENT: 'improvement',
  STORY: 'story',
};

// Project statuses
export const PROJECT_STATUS = {
  PLANNING: 'planning',
  ACTIVE: 'active',
  ON_HOLD: 'on_hold',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Sprint statuses
export const SPRINT_STATUS = {
  PLANNING: 'planning',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export default {
  API_ENDPOINTS,
  HTTP_STATUS,
  USER_ROLES,
  TICKET_STATUS,
  TICKET_PRIORITY,
  TICKET_TYPE,
  PROJECT_STATUS,
  SPRINT_STATUS,
};
