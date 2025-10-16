// manager.route.js - Manager/Project Manager Routes
import express from 'express';
import { verifyToken, allowManagementTeam } from '../middleware/verifyToken.js';
import { hrGenericUpload } from '../middleware/upload.js';
import {
  // Project Oversight
  getMyProjects,
  getProjectDetails,
  createProject,
  updateProject,
  archiveProject,
  deleteManagedProject,
  
  // Module & Sprint Control
  addModule,
  updateModule,
  getModuleSummary,
  createSprint,
  updateSprint,
  getAllTickets,
  createTicket,
  getAllEmployees,
  reassignTicket,
  updateTicketStatus,
  getTicketReports,
  getProjectTeam,
  assignTeamRole,
  getUserWorkload,
  recordTeamStandup,
  getProjectKanban,
  getSprintSummary,
  getProjectAnalytics,
  getTeamAnalytics,
  getProjectRisks,
  getManagerStats,
  getTeamManagement
} from '../controllers/manager.controller.js';
import { sendProjectTeamDocument } from '../controllers/manager.controller.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken);
router.use(allowManagementTeam);

// ========================================
// 1. PROJECT OVERSIGHT
// ========================================

// Get all projects managed by the current manager
router.get('/projects', getMyProjects);

// Get detailed project information
router.get('/project/:id', getProjectDetails);

// Create new project
router.post('/project', createProject);

// Update project scope, deadlines, status
router.patch('/project/:id', updateProject);

// Archive/close project
router.delete('/project/:id', archiveProject);

// Permanently delete project (owned by current manager)
router.delete('/project/:id/hard', deleteManagedProject);

// ========================================
// 2. MODULE & SPRINT CONTROL
// ========================================

// Add module under project
router.post('/project/:id/module', addModule);

// Update module status, sprint duration
router.patch('/module/:projectId/:moduleId', updateModule);

// Get module summary with progress and blockers
router.get('/module/:projectId/:moduleId/summary', getModuleSummary);

// Start/manage sprints
router.post('/project/:projectId/sprint', createSprint);

// ========================================
// 3. TICKET OVERSIGHT
// ========================================

// View all tickets across modules (bird's-eye view)
router.get('/tickets', getAllTickets);

// Create a new ticket within a module
router.post('/ticket/:projectId/:moduleId', createTicket);

// Get all employees for assignment
router.get('/employees', getAllEmployees);

// Re-assign tickets (dev ↔ tester)
router.patch('/ticket/:projectId/:moduleId/:ticketId/assign', reassignTicket);

// Update ticket status (escalate, re-open, or close)
router.patch('/ticket/:projectId/:moduleId/:ticketId/status', updateTicketStatus);

// Generate ticket reports
router.get('/tickets/reports', getTicketReports);

// ========================================
// 4. TEAM & RESOURCE MANAGEMENT
// ========================================

// Get team info (legacy route - MUST BE BEFORE parameter routes)
router.get('/team', (req, res) => {
  return res.json({ 
    message: 'Manager can access manager/team',
    user: req.user,
    availableActions: [
      'View all managed projects',
      'Create and update projects',
      'Manage modules and sprints',
      'Oversee ticket assignments',
      'Monitor team performance',
      'Generate reports and analytics'
    ]
  });
});

// List employees under a project
router.get('/team/:projectId', getProjectTeam);

// Assign/remove members as dev/tester
router.patch('/team/:projectId/:userId/assign-role', assignTeamRole);

// Check workload for a user
router.get('/workload/:userId', getUserWorkload);

// Record daily standup summary for team
router.post('/team/:projectId/standup', recordTeamStandup);

// ========================================
// 5. KANBAN & SPRINT MONITORING
// ========================================

// Get Kanban view of all tickets for a project
router.get('/kanban/:projectId', getProjectKanban);

// Get sprint summary with velocity and burndown
router.get('/sprint/:id/summary', getSprintSummary);

// Extend/close sprint
router.patch('/sprint/:id/extend', updateSprint);

// ========================================
// 6. REPORTING & ANALYTICS
// ========================================

// Get project analytics and progress
router.get('/analytics/project/:id', getProjectAnalytics);

// Get team productivity metrics
router.get('/analytics/team/:id', getTeamAnalytics);

// Get project risks and blockers
router.get('/risks/:projectId', getProjectRisks);

// Get manager dashboard statistics
router.get('/stats', getManagerStats);

// Get team management data (moved to avoid conflict with legacy route)
router.get('/team-management', getTeamManagement);

// ========================================
// 7. DOCUMENT DISTRIBUTION
// ========================================

// Upload a document and distribute to all project team members
router.post('/project/:projectId/team-docs', hrGenericUpload, sendProjectTeamDocument);

// ========================================
// LEGACY ROUTES (for compatibility)
// ========================================

// Get current manager info
router.get('/me', (req, res) => {
  return res.json({ 
    message: 'Manager route', 
    user: req.user,
    role: 'manager',
    permissions: ['project_oversight', 'team_management', 'ticket_oversight', 'analytics']
  });
});

export default router;
