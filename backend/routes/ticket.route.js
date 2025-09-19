// ticket.route.js - Ticket Management Routes
import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import {
  createTicket,
  getProjectTickets,
  getTicket,
  updateTicket,
  deleteTicket,
  addComment,
  getAllTickets
} from '../controllers/ticket.controller.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken);

// Get all tickets across all projects (admin/HR only) - MUST BE FIRST
// Usage: GET /api/tickets
// Query params: status, priority, type, projectId, search
router.get('/', getAllTickets);

// Create a new ticket
// Usage: POST /api/tickets
// Body: {
//   title: 'Ticket title',
//   description: 'Ticket description',
//   type: 'task|bug|feature|improvement',
//   priority: 'low|medium|high|critical',
//   projectId: 'project_id',
//   moduleId: 'module_id',
//   assignedDeveloper: 'developer_id',
//   tester: 'tester_id',
//   estimatedHours: 8,
//   storyPoints: 5,
//   dueDate: '2024-01-15',
//   tags: ['frontend', 'urgent']
// }
router.post('/', createTicket);

// Get all tickets for a specific project - SPECIFIC ROUTE BEFORE PARAMETERS
// Usage: GET /api/tickets/project/:projectId
// Query params: status, priority, type, assignedTo, search
router.get('/project/:projectId', getProjectTickets);

// Get a specific ticket - PARAMETER ROUTE AFTER SPECIFIC ROUTES
// Usage: GET /api/tickets/:projectId/:ticketId
router.get('/:projectId/:ticketId', getTicket);

// Update ticket details
// Usage: PUT /api/tickets/:projectId/:ticketId
// Body: {
//   title: 'Updated title',
//   description: 'Updated description',
//   priority: 'high',
//   status: 'in_progress',
//   assignedDeveloper: 'developer_id',
//   tester: 'tester_id'
// }
router.put('/:projectId/:ticketId', updateTicket);

// Add comment to ticket
// Usage: POST /api/tickets/:projectId/:ticketId/comments
// Body: {
//   comment: 'Comment text'
// }
router.post('/:projectId/:ticketId/comments', addComment);

// Delete ticket
// Usage: DELETE /api/tickets/:projectId/:ticketId
router.delete('/:projectId/:ticketId', deleteTicket);

export default router;