import express from 'express';
import { verifyToken, allowDeveloperOnly } from '../middleware/verifyToken.js';
import { USER_ROLES } from '../models/userschema.models.js';
import {
	getDeveloperDashboard,
	getMyProjects,
	getMyTickets,
	getMyKanbanBoards,
	moveOnKanbanBoard,
	getMyStandups,
	upsertMyStandupUpdate,
	getDeveloperStats,
	completeTicket
} from '../controllers/dev.controller.js';

const router = express.Router();

router.get('/me', verifyToken, allowDeveloperOnly, (req, res) => {
	return res.json({ message: 'Developer route', user: req.user });
});

// Developer dashboard summary
router.get('/dashboard', verifyToken, allowDeveloperOnly, getDeveloperDashboard);

// Projects where the developer is a team member
router.get('/projects', verifyToken, allowDeveloperOnly, getMyProjects);

// Tickets assigned to the developer (with filters)
router.get('/tickets', verifyToken, allowDeveloperOnly, getMyTickets);

// Developer-accessible Kanban boards
router.get('/kanban/boards', verifyToken, allowDeveloperOnly, getMyKanbanBoards);

// Move ticket on a kanban board
router.patch('/kanban/boards/:boardId/move', verifyToken, allowDeveloperOnly, express.json(), moveOnKanbanBoard);

// Standups for or involving the developer
router.get('/standups', verifyToken, allowDeveloperOnly, getMyStandups);

// Create/update my standup update
router.post('/standups/:standupId/updates', verifyToken, allowDeveloperOnly, express.json(), upsertMyStandupUpdate);

// Get developer dashboard statistics
router.get('/stats', verifyToken, allowDeveloperOnly, getDeveloperStats);

// Complete a ticket (moves to testing if tester assigned, or done if no tester)
router.post('/tickets/:projectId/:moduleId/:ticketId/complete', verifyToken, allowDeveloperOnly, express.json(), completeTicket);

export default router;


