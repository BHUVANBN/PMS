// kanban.route.js - Reusable Kanban Board Routes
import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import {
  getKanbanBoard,
  getProjectKanbanBoards,
  getDeveloperKanbanBoard,
  getTesterKanbanBoard,
  createKanbanBoard,
  moveTicket,
  updateTicketStatus,
  addTicketToBoard,
  removeTicketFromBoard,
  updateColumn,
  getBoardStatistics,
  updateBoardSettings
} from '../controllers/kanban.controller.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken);

// Create new kanban board
// Usage: POST /api/kanbanboard
router.post('/', createKanbanBoard);

// Get project-specific kanban boards (plural - returns all boards for a project)
// Usage: GET /api/kanbanboard/project/:projectId
router.get('/project/:projectId', getProjectKanbanBoards);

// Get developer's personal kanban board (must be before /:boardId)
// Usage: GET /api/kanbanboard/developer/personal
router.get('/developer/personal', getDeveloperKanbanBoard);

// Get tester's personal kanban board (must be before /:boardId)
// Usage: GET /api/kanbanboard/tester/personal
router.get('/tester/personal', getTesterKanbanBoard);

// Update ticket status (direct status update)
// Usage: PUT /api/kanbanboard/tickets/:projectId/:ticketId/status
router.put('/tickets/:projectId/:ticketId/status', updateTicketStatus);

// Get board statistics
// Usage: GET /api/kanbanboard/:boardId/statistics
router.get('/:boardId/statistics', getBoardStatistics);

// Update board settings
// Usage: PUT /api/kanbanboard/:boardId/settings
router.put('/:boardId/settings', updateBoardSettings);

// Move ticket between columns (drag-drop)
// Usage: PUT /api/kanbanboard/:boardId/move
router.put('/:boardId/move', moveTicket);

// Update column configuration
// Usage: PUT /api/kanbanboard/:boardId/columns/:columnId
router.put('/:boardId/columns/:columnId', updateColumn);

// Add ticket to board
// Usage: POST /api/kanbanboard/:boardId/tickets
router.post('/:boardId/tickets', addTicketToBoard);

// Remove ticket from board
// Usage: DELETE /api/kanbanboard/:boardId/tickets/:ticketId
router.delete('/:boardId/tickets/:ticketId', removeTicketFromBoard);

// Get specific kanban board by ID (must be last to avoid conflicts)
// Usage: GET /api/kanbanboard/:boardId
router.get('/:boardId', getKanbanBoard);

export default router;