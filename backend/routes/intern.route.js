import express from 'express';
import { verifyToken, allowInternOnly } from '../middleware/verifyToken.js';
import { USER_ROLES } from '../models/userschema.models.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken);
router.use(allowInternOnly);

// Get current intern info
router.get('/me', (req, res) => {
	const effectiveRole = req.user.actualRole || 'intern';
	return res.json({ 
		message: 'Intern route', 
		user: req.user,
		role: 'intern',
		actualRole: effectiveRole,
		permissions: ['view_assigned_tickets', 'kanban_workflow', 'update_ticket_status', 'comment_tickets', 'view_sprint_board', 'submit_timesheets']
	});
});

// Get intern dashboard
router.get('/dashboard', (req, res) => {
	const effectiveRole = req.user.actualRole || 'intern';
	return res.json({
		message: 'Intern dashboard',
		user: req.user,
		effectiveRole: effectiveRole,
		availableActions: [
			'View assigned tickets',
			'Update ticket status via Kanban',
			'Comment on tickets',
			'View sprint board',
			'Submit timesheets',
			'Participate in standups'
		],
		note: `Working as ${effectiveRole} with intern status`
	});
});

export default router;
