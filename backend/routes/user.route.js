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

// Get user by ID (self or Admin/HR)
router.get('/:userId', getUser);

// Admin/HR: create user
router.post('/', createUser);

// Update user profile (self or Admin/HR)
router.put('/:userId', updateUser);
router.patch('/:userId', updateUser);

// Change password (self or Admin)
router.patch('/:userId/password', changePassword);

// Toggle user activation (Admin/HR)
router.patch('/:userId/status', toggleUserStatus);

// Admin/HR: update leave balance
router.patch('/:userId/leave-balance', updateLeaveBalance);

// Get users by role (Admin/HR/Manager)
router.get('/role/:role', getUsersByRole);

// Admin/HR: user statistics
router.get('/stats/summary', getUserStatistics);

// Admin: delete user
router.delete('/:userId', deleteUser);

export default router;
