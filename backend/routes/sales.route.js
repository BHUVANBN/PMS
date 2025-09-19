import express from 'express';
import { verifyToken, allowSalesOnly } from '../middleware/verifyToken.js';
import { USER_ROLES } from '../models/userschema.models.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken);
router.use(allowSalesOnly);

// Get current sales user info
router.get('/me', (req, res) => {
	return res.json({ 
		message: 'Sales route', 
		user: req.user,
		role: 'sales',
		permissions: ['view_assigned_tickets', 'kanban_workflow', 'update_ticket_status', 'comment_tickets', 'view_sprint_board', 'submit_timesheets', 'sales_reports']
	});
});

// Get sales dashboard
router.get('/dashboard', (req, res) => {
	return res.json({
		message: 'Sales dashboard',
		user: req.user,
		availableActions: [
			'View assigned tickets',
			'Update ticket status via Kanban',
			'Comment on tickets',
			'View sprint board',
			'Submit timesheets',
			'Generate sales reports',
			'Track sales metrics'
		]
	});
});

export default router;
