import express from 'express';
import { verifyToken, allowHRAndAbove } from '../middleware/verifyToken.js';

import {
	createEmployee,
	getAllEmployees,
	getEmployeesByRole,
	updateEmployee,
	toggleEmployeeStatus,
	getEmployeeStats
} from '../controllers/hr.controller.js';

const router = express.Router();

// All HR routes require authentication and HR role
router.use(verifyToken);
router.use(allowHRAndAbove);

// Get current HR user info
router.get('/me', (req, res) => {
	return res.json({ message: 'HR route', user: req.user });
});

// Create a new employee
router.post('/employees', createEmployee);

// Get all employees
router.get('/employees', getAllEmployees);

// Get employees by role
router.get('/employees/role/:role', getEmployeesByRole);

// Update employee information
router.put('/employees/:id', updateEmployee);

// Activate/Deactivate employee account
router.patch('/employees/:id/toggle-status', toggleEmployeeStatus);

// Get employee statistics
router.get('/stats', getEmployeeStats);

export default router;



