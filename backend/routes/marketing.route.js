import express from 'express';
import { verifyToken, allowMarketingOnly } from '../middleware/verifyToken.js';
import { USER_ROLES } from '../models/userschema.models.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken);
router.use(allowMarketingOnly);

// Get current marketing user info
router.get('/me', (req, res) => {
	return res.json({ 
		message: 'Marketing route', 
		user: req.user,
		role: 'marketing',
		permissions: ['view_assigned_tickets', 'kanban_workflow', 'update_ticket_status', 'comment_tickets', 'view_sprint_board', 'submit_timesheets', 'marketing_reports']
	});
});

// Get marketing dashboard
router.get('/dashboard', (req, res) => {
	return res.json({
		message: 'Marketing dashboard',
		user: req.user,
		availableActions: [
			'View assigned tickets',
			'Update ticket status via Kanban',
			'Comment on tickets',
			'View sprint board',
			'Submit timesheets',
			'Generate marketing reports',
			'Track campaign metrics'
		]
	});
});

export default router;
