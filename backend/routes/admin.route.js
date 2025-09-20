import express from 'express';
import { verifyToken, allowAdminOnly } from '../middleware/verifyToken.js';
import { USER_ROLES } from '../models/userschema.models.js';
import {
	createUser,
	createHR,
	getAllUsers,
	getUsersByRole,
	updateUser,
	deleteUser,
	getSystemStats,
	resetUserPassword,
	getActivityLogs,
	getSystemHealth
} from '../controllers/admin.controller.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(verifyToken);
router.use(allowAdminOnly);

// Get current admin user info
router.get('/me', (req, res) => {
	return res.json({ message: 'Admin route', user: req.user });
});

// Create a new user with any role
router.post('/users', createUser);

// Create HR user specifically
router.post('/users/hr', createHR);

// Get all users in the system
router.get('/users', getAllUsers);

// Get users by role
router.get('/users/role/:role', getUsersByRole);

// Update any user
router.put('/users/:id', updateUser);

// Delete/deactivate user
router.delete('/users/:id', deleteUser);

// Reset user password
router.patch('/users/:id/reset-password', resetUserPassword);

// Get system statistics
router.get('/stats', getSystemStats);

// Get activity logs
router.get('/activity', getActivityLogs);

// Get system health
router.get('/health', getSystemHealth);

// Legacy route for compatibility
router.get('/all', (req, res) => {
	return res.json({ message: 'Admin can do everything' });
});

export default router;


