// routes/meetingRoutes.js
import express from 'express';
import {
  scheduleMeeting,
  getProjectMeetings,
  getMeetingById,
  updateMeeting,
  deleteMeeting
} from '../controllers/meeting.controller.js';
import {
  verifyToken,
  managerOnly,
  requireProjectAccess,
  managerOrAdmin
} from '../middleware/roleAuth.js';

const router = express.Router();

/**
 * @route   POST /api/meetings/schedule
 * @desc    Schedule a new meeting (Manager only)
 * @access  Private (Manager)
 */
router.post('/schedule', verifyToken, managerOnly, scheduleMeeting);

/**
 * @route   GET /api/meetings/project/:projectId
 * @desc    Get all meetings for a project
 * @access  Private (Project members)
 */
router.get('/project/:projectId', verifyToken, requireProjectAccess, getProjectMeetings);

/**
 * @route   GET /api/meetings/:meetingId
 * @desc    Get a single meeting by ID
 * @access  Private (Meeting participants)
 */
router.get('/:meetingId', verifyToken, getMeetingById);

/**
 * @route   PUT /api/meetings/:meetingId
 * @desc    Update a meeting (Manager/Creator only)
 * @access  Private (Manager/Admin)
 */
router.put('/:meetingId', verifyToken, managerOrAdmin, updateMeeting);

/**
 * @route   DELETE /api/meetings/:meetingId
 * @desc    Delete a meeting (Manager/Creator only)
 * @access  Private (Manager/Admin)
 */
router.delete('/:meetingId', verifyToken, managerOrAdmin, deleteMeeting);

export default router;