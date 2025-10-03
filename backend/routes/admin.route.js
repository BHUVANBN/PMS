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
    getSystemHealth,
    getOrganizationAnalytics,
    getAllProjects,
    createProject,
    updateProject,
    getAllTeams
} from '../controllers/admin.controller.js';

const router = express.Router();

// Debug route for testing activity logs (remove in production) - before auth middleware
router.get('/activity-debug', async (req, res) => {
	try {
		const { User, Project, BugTracker, Sprint } = await import('../models/index.js');
		
		const userCount = await User.countDocuments();
		const projectCount = await Project.countDocuments();
		const bugCount = await BugTracker.countDocuments();
		const sprintCount = await Sprint.countDocuments();
		
		return res.json({
			message: 'Activity debug info',
			counts: {
				users: userCount,
				projects: projectCount,
				bugs: bugCount,
				sprints: sprintCount
			}
		});
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
});

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

// Get organization analytics
router.get('/analytics', getOrganizationAnalytics);

// Get activity logs
router.get('/activity', getActivityLogs);

// Get system health
router.get('/health', getSystemHealth);

// Project management routes
router.get('/projects', getAllProjects);
router.post('/projects', createProject);
router.put('/projects/:projectId', updateProject);

// Team management routes
router.get('/teams', getAllTeams);

// Legacy route for compatibility
router.get('/all', (req, res) => {
	return res.json({ message: 'Admin can do everything' });
});


export default router;


