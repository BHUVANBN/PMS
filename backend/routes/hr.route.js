import express from 'express';
import { verifyToken, allowHRAndAbove } from '../middleware/verifyToken.js';

import {
	createEmployee,
	getAllEmployees,
	getEmployeesByRole,
	updateEmployee,
	toggleEmployeeStatus,
	getEmployeeStats,
	getHRStats,
	getEmployeeById,
	getAllLeaveRequests,
	approveLeaveRequest,
	rejectLeaveRequest,
	getAllStandups,
	getEmployeeStandups
} from '../controllers/hr.controller.js';
import {
	getHROnboardingList,
	getHROnboardingDetails,
	uploadHRDocuments,
	verifyOnboarding,
	getOnboardingSummary,
	deleteOnboardingDocument
} from '../controllers/onboarding.controller.js';
import { hrOnboardingUpload } from '../middleware/upload.js';

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

// Get individual employee by ID
router.get('/employees/:id', getEmployeeById);

// Get employees by role
router.get('/employees/role/:role', getEmployeesByRole);

// Update employee information
router.put('/employees/:id', updateEmployee);

// Activate/Deactivate employee account
router.patch('/employees/:id/toggle-status', toggleEmployeeStatus);

// Get employee statistics (legacy)
router.get('/employee-stats', getEmployeeStats);

// Get HR dashboard statistics
router.get('/stats', getHRStats);

// Leave management
router.get('/leave-requests', getAllLeaveRequests);
router.put('/leave-requests/:leaveId/approve', approveLeaveRequest);
router.put('/leave-requests/:leaveId/reject', rejectLeaveRequest);

// Standup tracking
router.get('/standups', getAllStandups);
router.get('/standups/:employeeId', getEmployeeStandups);

// Onboarding management
router.get('/onboarding', getHROnboardingList);
router.get('/onboarding/summary', getOnboardingSummary);
router.get('/onboarding/:userId', getHROnboardingDetails);
router.post('/onboarding/:userId/documents', hrOnboardingUpload, uploadHRDocuments);
router.post('/onboarding/:userId/verify', verifyOnboarding);
// Delete a specific onboarding document (scope: 'employee' or 'hr')
router.delete('/onboarding/:userId/documents/:scope/:docKey', deleteOnboardingDocument);

export default router;



