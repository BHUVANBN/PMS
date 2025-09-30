// tester.route.js - Tester Routes
import express from 'express';
import { verifyToken, allowTesterOnly } from '../middleware/verifyToken.js';
import {
  // Bug Tracking & Management
  getMyReportedBugs,
  getMyAssignedBugs,
  createBugReport,
  updateBugReport,
  addBugComment,
  reopenBug,
  closeBug,
  
  // Ticket Testing & Verification
  getMyTestTickets,
  updateTicketTestStatus,
  createBugFromTicket,
  
  // Test Case Management
  getTestCases,
  updateTestCaseResult,
  
  // Quality Assurance & Reporting
  getTestingDashboard,
  generateTestingReport,
  
  // Testing Workflow Management
  startTicketTesting,
  completeTicketTesting,
  approveTicket,
  getTesterStats
} from '../controllers/tester.controller.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken);
router.use(allowTesterOnly);

// ========================================
// 1. BUG TRACKING & MANAGEMENT
// ========================================

// Get all bugs reported by the current tester
router.get('/bugs/reported', getMyReportedBugs);

// Get all bugs assigned to the current tester for testing
router.get('/bugs/assigned', getMyAssignedBugs);

// Create a new bug report
router.post('/bugs', createBugReport);

// Update bug report details
router.put('/bugs/:id', updateBugReport);

// Add comment to bug report
router.post('/bugs/:id/comments', addBugComment);

// Reopen a bug that was marked as resolved
router.patch('/bugs/:id/reopen', reopenBug);

// Close a bug after verification
router.patch('/bugs/:id/close', closeBug);

// ========================================
// 2. TICKET TESTING & VERIFICATION
// ========================================

// Get tickets assigned to the current tester for testing
router.get('/tickets', getMyTestTickets);

// Update ticket status during testing
router.patch('/tickets/:projectId/:moduleId/:ticketId/status', updateTicketTestStatus);

// Create bug report from failed ticket testing
router.post('/tickets/:projectId/:moduleId/:ticketId/bugs', createBugFromTicket);

// ========================================
// 3. TEST CASE MANAGEMENT
// ========================================

// Get test cases for a specific project/module
router.get('/testcases/:projectId/:moduleId', getTestCases);

// Update test case execution results
router.patch('/testcases/:projectId/:moduleId/:ticketId/result', updateTestCaseResult);

// ========================================
// 4. QUALITY ASSURANCE & REPORTING
// ========================================

// Get testing dashboard for the current tester
router.get('/dashboard', getTestingDashboard);

// Generate testing report for a project
router.get('/reports/:projectId', generateTestingReport);

// ========================================
// 5. TESTING WORKFLOW MANAGEMENT
// ========================================

// Start testing a ticket
router.post('/tickets/:projectId/:moduleId/:ticketId/start-testing', startTicketTesting);

// Complete testing for a ticket
router.post('/tickets/:projectId/:moduleId/:ticketId/complete-testing', completeTicketTesting);

// Approve/validate a ticket after testing
router.post('/tickets/:projectId/:moduleId/:ticketId/approve', approveTicket);

// Get tester dashboard statistics
router.get('/stats', getTesterStats);

// ========================================
// LEGACY ROUTES (for compatibility)
// ========================================

// Get current tester info
router.get('/me', (req, res) => {
  return res.json({ 
    message: 'Tester route', 
    user: req.user,
    role: 'tester',
    permissions: ['bug_tracking', 'ticket_testing', 'test_case_management', 'quality_assurance', 'reporting']
  });
});

export default router;


