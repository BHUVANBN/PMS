// leave.route.js - Leave Management Routes
import express from 'express';
import { verifyToken, allowHRAndAbove, allowAllAuthenticated } from '../middleware/verifyToken.js';
import {
  submitLeaveRequest,
  getMyLeaveRequests,
  cancelLeaveRequest,
  getAllLeaveRequests,
  approveLeaveRequest,
  rejectLeaveRequest,
  getLeaveStats,
} from '../controllers/leave.controller.js';

const router = express.Router();

// All leave routes require authentication
router.use(verifyToken);

// ─── Employee routes (any authenticated user) ─────────────────────────────────
router.post('/', allowAllAuthenticated, submitLeaveRequest);
router.get('/my', allowAllAuthenticated, getMyLeaveRequests);
router.patch('/:leaveId/cancel', allowAllAuthenticated, cancelLeaveRequest);

// ─── HR / Admin routes ────────────────────────────────────────────────────────
router.get('/', allowHRAndAbove, getAllLeaveRequests);
router.put('/:leaveId/approve', allowHRAndAbove, approveLeaveRequest);
router.put('/:leaveId/reject', allowHRAndAbove, rejectLeaveRequest);
router.get('/stats', allowHRAndAbove, getLeaveStats);

export default router;
