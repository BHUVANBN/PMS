import express from 'express';
import { verifyToken, allowHRAndAbove, allowRoles } from '../middleware/verifyToken.js';

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
	deleteOnboardingDocument,
	addHRGenericDocument,
	getHRGenericDocuments,
	deleteHRGenericDocument,
	finalizeOnboardingToEmployeeDocs,
	listArchivedEmployeeDocuments,
	getArchivedEmployeeDocuments,
	finalizeAllVerifiedOnboarding,
	streamHROnboardingDocument,
} from '../controllers/onboarding.controller.js';
import { hrOnboardingUpload, hrGenericUpload } from '../middleware/upload.js';

const router = express.Router();

// All HR routes require authentication
router.use(verifyToken);

// Get current HR user info
router.get('/me', (req, res) => {
	return res.json({ message: 'HR route', user: req.user });
});

// Create a new employee (HR/Admin)
router.post('/employees', allowHRAndAbove, createEmployee);

// Get all employees (HR/Admin)
router.get('/employees', allowHRAndAbove, getAllEmployees);

// Get individual employee by ID (HR/Admin)
router.get('/employees/:id', allowHRAndAbove, getEmployeeById);

// Get employees by role (HR/Admin)
router.get('/employees/role/:role', allowHRAndAbove, getEmployeesByRole);

// Update employee information (HR/Admin)
router.put('/employees/:id', allowHRAndAbove, updateEmployee);

// Activate/Deactivate employee account (HR/Admin)
router.patch('/employees/:id/toggle-status', allowHRAndAbove, toggleEmployeeStatus);

// Get employee statistics (legacy) (HR/Admin)
router.get('/employee-stats', allowHRAndAbove, getEmployeeStats);

// Get HR dashboard statistics (HR/Admin)
router.get('/stats', allowHRAndAbove, getHRStats);

// Leave management (HR/Admin)
router.get('/leave-requests', allowHRAndAbove, getAllLeaveRequests);
router.put('/leave-requests/:leaveId/approve', allowHRAndAbove, approveLeaveRequest);
router.put('/leave-requests/:leaveId/reject', allowHRAndAbove, rejectLeaveRequest);

// Standup tracking (HR/Admin)
router.get('/standups', allowHRAndAbove, getAllStandups);
router.get('/standups/:employeeId', allowHRAndAbove, getEmployeeStandups);

// Onboarding management (HR/Admin)
router.get('/onboarding', allowHRAndAbove, getHROnboardingList);
router.get('/onboarding/summary', allowHRAndAbove, getOnboardingSummary);
router.get('/onboarding/:userId', allowHRAndAbove, getHROnboardingDetails);
router.post('/onboarding/:userId/documents', allowHRAndAbove, hrOnboardingUpload, uploadHRDocuments);
router.post('/onboarding/:userId/verify', allowHRAndAbove, verifyOnboarding);
// Delete a specific onboarding document (scope: 'employee' or 'hr') (HR/Admin)
router.delete('/onboarding/:userId/documents/:scope/:docKey', allowHRAndAbove, deleteOnboardingDocument);

// Finalize onboarding into employee archive and archive routes
router.post('/onboarding/:userId/finalize', allowHRAndAbove, finalizeOnboardingToEmployeeDocs);
router.post('/onboarding/finalize-all', allowHRAndAbove, finalizeAllVerifiedOnboarding);
router.get('/employee-documents', allowHRAndAbove, listArchivedEmployeeDocuments);
router.get('/employee-documents/:userId', allowHRAndAbove, getArchivedEmployeeDocuments);
router.get('/onboarding/:userId/documents/:scope/:docKey', allowHRAndAbove, streamHROnboardingDocument);

// Generic HR documents (flexible uploads with name/description)
// Allow Admin/HR/Manager for these endpoints
const allowAdminHrManager = allowRoles('admin', 'hr', 'manager');
router.post('/onboarding/:userId/hr-docs', allowAdminHrManager, hrGenericUpload, addHRGenericDocument);
router.get('/onboarding/:userId/hr-docs', allowAdminHrManager, getHRGenericDocuments);
router.delete('/onboarding/:userId/hr-docs/:docId', allowAdminHrManager, deleteHRGenericDocument);

export default router;



