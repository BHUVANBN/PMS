// roleAuth.js - Role-based Authentication and Authorization Middleware
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

// Role hierarchy and permissions
const ROLE_PERMISSIONS = {
  admin: {
    level: 5,
    permissions: [
      'create_hr_accounts',
      'view_organization_analytics',
      'manage_all_projects',
      'manage_all_users',
      'system_configuration',
      'view_all_data',
      'delete_projects',
      'manage_roles'
    ]
  },
  employee: {
    level: 2,
    permissions: [
      'view_assigned_tickets',
      'update_ticket_status',
      'kanban_workflow',
      'comment_tickets',
      'view_sprint_board',
      'submit_timesheets'
    ]
  },
  hr: {
    level: 4,
    permissions: [
      'crud_employees',
      'approve_reject_leave',
      'track_standups',
      'view_employee_analytics',
      'manage_leave_policies',
      'view_attendance',
      'employee_reports'
    ]
  },
  manager: {
    level: 3,
    permissions: [
      'create_projects',
      'create_modules',
      'create_tickets',
      'assign_tickets',
      'view_sprint_board',
      'track_bug_tracker',
      'manage_team',
      'view_team_analytics',
      'approve_timesheets',
      'project_reports'
    ]
  },
  developer: {
    level: 2,
    permissions: [
      'view_assigned_tickets',
      'update_ticket_status',
      'kanban_workflow',
      'comment_tickets',
      'view_sprint_board',
      'submit_timesheets',
      'create_bug_reports'
    ]
  },
  tester: {
    level: 2,
    permissions: [
      'view_assigned_tickets',
      'receive_completed_tasks',
      'validate_kanban',
      'create_bug_tracker',
      'update_bug_status',
      'comment_tickets',
      'view_sprint_board',
      'submit_timesheets'
    ]
  },
  sales: {
    level: 2,
    permissions: [
      'view_assigned_tickets',
      'kanban_workflow',
      'update_ticket_status',
      'comment_tickets',
      'view_sprint_board',
      'submit_timesheets',
      'sales_reports'
    ]
  },
  marketing: {
    level: 2,
    permissions: [
      'view_assigned_tickets',
      'kanban_workflow',
      'update_ticket_status',
      'comment_tickets',
      'view_sprint_board',
      'submit_timesheets',
      'marketing_reports'
    ]
  },
  intern: {
    level: 1,
    permissions: [
      'view_assigned_tickets',
      'kanban_workflow',
      'update_ticket_status',
      'comment_tickets',
      'view_sprint_board',
      'submit_timesheets'
    ]
  }
};

// Resource-specific permissions
const RESOURCE_PERMISSIONS = {
  projects: {
    create: ['admin', 'manager'],
    read: ['admin', 'hr', 'manager', 'developer', 'tester', 'sales', 'marketing', 'intern', 'employee'],
    update: ['admin', 'manager'],
    delete: ['admin']
  },
  tickets: {
    create: ['admin', 'manager'],
    read: ['admin', 'hr', 'manager', 'developer', 'tester', 'sales', 'marketing', 'intern', 'employee'],
    update: ['admin', 'manager', 'developer', 'tester', 'sales', 'marketing', 'intern', 'employee'],
    delete: ['admin', 'manager']
  },
  users: {
    create: ['admin', 'hr'],
    read: ['admin', 'hr', 'manager'],
    update: ['admin', 'hr'],
    delete: ['admin']
  },
  leaves: {
    create: ['admin', 'hr', 'manager', 'developer', 'tester', 'sales', 'marketing', 'intern', 'employee'],
    read: ['admin', 'hr', 'manager'],
    update: ['admin', 'hr'],
    delete: ['admin', 'hr']
  },
  analytics: {
    create: ['admin', 'manager'],
    read: ['admin', 'hr', 'manager'],
    update: ['admin', 'manager'],
    delete: ['admin']
  },
  bugs: {
    create: ['admin', 'manager', 'developer', 'tester'],
    read: ['admin', 'hr', 'manager', 'developer', 'tester'],
    update: ['admin', 'manager', 'developer', 'tester'],
    delete: ['admin', 'manager']
  }
};

// Verify JWT token and extract user info
export const verifyToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || 
                  req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated.'
      });
    }

    // Add user info to request
    req.user = user;
    req.userRole = user.role;
    req.effectiveRole = user.role === 'intern' ? user.actualRole : user.role;
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token.',
      error: error.message
    });
  }
};

// Check if user has specific role
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    const userRole = req.effectiveRole || req.userRole;
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}. Your role: ${userRole}`
      });
    }

    next();
  };
};

// Check if user has specific permission
export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    const userRole = req.effectiveRole || req.userRole;
    const rolePermissions = ROLE_PERMISSIONS[userRole];

    if (!rolePermissions || !rolePermissions.permissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required permission: ${permission}`
      });
    }

    next();
  };
};

// Check resource-specific permissions
export const requireResourcePermission = (resource, action) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    const userRole = req.effectiveRole || req.userRole;
    const resourcePerms = RESOURCE_PERMISSIONS[resource];

    if (!resourcePerms || !resourcePerms[action] || !resourcePerms[action].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Cannot ${action} ${resource} with role: ${userRole}`
      });
    }

    next();
  };
};

// Check if user can access specific project
export const requireProjectAccess = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.body.projectId;
    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID required.'
      });
    }

    const userRole = req.effectiveRole || req.userRole;

    // Admin and HR can access all projects
    if (['admin', 'hr'].includes(userRole)) {
      return next();
    }

    // For other roles, check if user is part of the project
    const { Project } = await import('../models/index.js');
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.'
      });
    }

    // Check if user is project manager
    if (project.projectManager.toString() === req.user._id.toString()) {
      return next();
    }

    // Check if user is team member
    const isTeamMember = project.teamMembers.some(
      memberId => memberId.toString() === req.user._id.toString()
    );

    if (!isTeamMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not a member of this project.'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error checking project access.',
      error: error.message
    });
  }
};

// Check if user can access specific ticket
export const requireTicketAccess = async (req, res, next) => {
  try {
    const ticketId = req.params.ticketId || req.body.ticketId;
    
    if (!ticketId) {
      return res.status(400).json({
        success: false,
        message: 'Ticket ID required.'
      });
    }

    const userRole = req.effectiveRole || req.userRole;

    // Admin and HR can access all tickets
    if (['admin', 'hr'].includes(userRole)) {
      return next();
    }

    // For other roles, check specific access
    const { Project } = await import('../models/index.js');
    
    // Find project containing the ticket
    const project = await Project.findOne({
      'modules.tickets._id': ticketId
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found.'
      });
    }

    // Check if user is project manager
    if (project.projectManager.toString() === req.user._id.toString()) {
      return next();
    }

    // Find the specific ticket
    let ticket = null;
    for (const module of project.modules) {
      ticket = module.tickets.id(ticketId);
      if (ticket) break;
    }

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found.'
      });
    }

    // Check if user is assigned to the ticket
    const isAssigned = ticket.assignedDeveloper?.toString() === req.user._id.toString() ||
                      ticket.tester?.toString() === req.user._id.toString();

    if (!isAssigned) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not assigned to this ticket.'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error checking ticket access.',
      error: error.message
    });
  }
};

// Admin only middleware
export const adminOnly = requireRole('admin');

// HR only middleware
export const hrOnly = requireRole('hr');

// Manager only middleware
export const managerOnly = requireRole('manager');

// Manager or Admin middleware
export const managerOrAdmin = requireRole('manager', 'admin');

// HR or Admin middleware
export const hrOrAdmin = requireRole('hr', 'admin');

// Team member roles (developer, tester, sales, marketing, intern)
export const teamMemberOnly = requireRole('developer', 'tester', 'sales', 'marketing', 'intern', 'employee');

// Development team (developer, tester, intern with dev role)
export const devTeamOnly = (req, res, next) => {
  const userRole = req.effectiveRole || req.userRole;
  const allowedRoles = ['developer', 'tester'];
  
  if (req.userRole === 'intern' && ['developer', 'tester'].includes(req.effectiveRole)) {
    return next();
  }
  
  if (!allowedRoles.includes(userRole)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Development team access required.'
    });
  }
  
  next();
};

// Check if user can manage team members
export const canManageTeam = (req, res, next) => {
  const userRole = req.effectiveRole || req.userRole;
  
  if (!['admin', 'hr', 'manager'].includes(userRole)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Team management privileges required.'
    });
  }
  
  next();
};

// Rate limiting for different roles
export const roleBasedRateLimit = (req, res, next) => {
  const userRole = req.effectiveRole || req.userRole;
  
  // Set different rate limits based on role
  const rateLimits = {
    admin: 1000,    // requests per hour
    hr: 500,
    manager: 300,
    developer: 200,
    tester: 200,
    sales: 150,
    marketing: 150,
    intern: 100,
    employee: 150
  };
  
  req.rateLimit = rateLimits[userRole] || 50;
  next();
};

export {
  ROLE_PERMISSIONS,
  RESOURCE_PERMISSIONS
};
