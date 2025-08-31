// kanban.route.js - Reusable Kanban Board Routes
import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import {
  getKanbanBoard,
  updateTicketStatus,
  getProjectKanbanBoard,
  getDeveloperKanbanBoard
} from '../controllers/kanban.controller.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken);

// Get Kanban board for specific role/context
// Usage: GET /api/kanbanboard/developer
//        GET /api/kanbanboard/tester  
//        GET /api/kanbanboard/lead
//        GET /api/kanbanboard/hr
//        GET /api/kanbanboard/admin
router.get('/:boardType', getKanbanBoard);

// Get project-specific kanban board
// Usage: GET /api/kanbanboard/project/:projectId
router.get('/project/:projectId', getProjectKanbanBoard);

// Get developer's personal kanban board
// Usage: GET /api/kanbanboard/developer/personal
router.get('/developer/personal', getDeveloperKanbanBoard);

// Update ticket status (move between columns)
// Usage: PUT /api/kanbanboard/tickets/:projectId/:ticketId/status
// Body: { status: 'in_progress', comment: 'Optional comment' }
router.put('/tickets/:projectId/:ticketId/status', updateTicketStatus);

export default router;