// user.route.js - User Management Routes
import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  changePassword,
  toggleUserStatus,
  getUserStatistics,
  updateLeaveBalance,
  getUsersByRole,
  deleteUser
} from '../controllers/user.controller.js';

const router = express.Router();

// Protect all user routes
router.use(verifyToken);

// Admin/HR: list users with filters
router.get('/', getUsers);

// Admin/HR: create user
router.post('/', createUser);

// Get users by role (Admin/HR/Manager) - MUST BE BEFORE /:userId
router.get('/role/:role', getUsersByRole);

// Admin/HR: user statistics - MUST BE BEFORE /:userId
router.get('/stats/summary', getUserStatistics);

// Get user by ID (self or Admin/HR) - MUST BE AFTER specific routes
router.get('/:userId', getUser);

// Update user profile (self or Admin/HR)
router.put('/:userId', updateUser);
router.patch('/:userId', updateUser);

// Change password (self or Admin)
router.patch('/:userId/password', changePassword);

// Toggle user activation (Admin/HR)
router.patch('/:userId/status', toggleUserStatus);

// Admin/HR: update leave balance
router.patch('/:userId/leave-balance', updateLeaveBalance);

// Admin: delete user
router.delete('/:userId', deleteUser);

export default router;
