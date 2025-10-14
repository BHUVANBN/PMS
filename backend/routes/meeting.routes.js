import express from 'express';
import Meeting from '../models/meetingModel.js';
import {
  scheduleMeeting,
  getProjectMeetings,
  getMeetingById,
  updateMeeting,
  deleteMeeting,
  endMeeting, // ✅ NEW IMPORT
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
 * @route   GET /api/meetings/user
 * @desc    Get all meetings where the logged-in user is a participant
 * @access  Private
 */
router.get('/user', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const meetings = await Meeting.find({
      participants: { $in: [userId] },
    })
      .populate('projectId', 'name')
      .populate('createdBy', 'name email')
      .sort({ startTime: 1 });

    res.json({ success: true, meetings });
  } catch (error) {
    console.error('Error fetching user meetings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

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
 * @route   PATCH /api/meetings/:meetingId/end
 * @desc    End an ongoing meeting early by setting endTime = now
 * @access  Private (Manager only)
 */
router.patch('/:meetingId/end', verifyToken, managerOnly, endMeeting); // ✅ NEW ROUTE

/**
 * @route   DELETE /api/meetings/:meetingId
 * @desc    Delete a meeting (Manager/Creator only)
 * @access  Private (Manager/Admin)
 */
router.delete('/:meetingId', verifyToken, managerOrAdmin, deleteMeeting);

/**
 * @route   GET /api/meetings/test
 * @desc    Test route
 */
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Meeting routes working ✅' });
});

export default router;
