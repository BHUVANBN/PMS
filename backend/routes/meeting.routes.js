import express from 'express';
import { scheduleMeeting, getProjectMeetings } from '../controllers/meeting.controller.js';
import { verifyToken, managerOnly, requireProjectAccess } from '../middleware/roleAuth.js';

const router = express.Router();

// Only managers can schedule meetings
router.post('/schedule', verifyToken, managerOnly, scheduleMeeting);

// Any team member assigned to project can view meetings
router.get('/project/:projectId', verifyToken, requireProjectAccess, getProjectMeetings);

export default router;
