import express from 'express';
import { verifyToken, allowEmployeesAndAbove } from '../middleware/verifyToken.js';
import { USER_ROLES } from '../models/userschema.models.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken);
router.use(allowEmployeesAndAbove);

// Get current employee info
router.get('/me', (req, res) => {
	return res.json({ 
		message: 'Employee route', 
		user: req.user,
		role: 'employee',
		permissions: ['view_profile', 'update_profile', 'apply_leave', 'view_assigned_tickets', 'submit_timesheets']
	});
});

// Get employee dashboard
router.get('/dashboard', (req, res) => {
	return res.json({
		message: 'Employee dashboard',
		user: req.user,
		availableActions: [
			'View profile information',
			'Update personal details',
			'Apply for leave',
			'View assigned tickets',
			'Submit timesheets',
			'View team information'
		]
	});
});

export default router;
