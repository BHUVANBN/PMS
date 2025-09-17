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

// Get Kanban board for specific role/context (catch-all)
// Usage: GET /api/kanbanboard/developer | tester | lead | hr | admin
router.get('/:boardType', getKanbanBoard);

export default router;