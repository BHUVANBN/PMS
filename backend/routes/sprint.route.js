// sprint.route.js - Sprint Routes
import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import {
  createSprint,
  getProjectSprints,
  getSprint,
  assignTicketToUser,
  updateAssignmentStatus,
  getSprintBoard,
  startSprint,
  completeSprint,
  getUserSprintAssignments,
  getSprintAnalytics
} from '../controllers/sprint.controller.js';

const router = express.Router();

router.use(verifyToken);

router.post('/', createSprint);
router.get('/project/:projectId', getProjectSprints);
router.get('/:sprintId', getSprint);
router.post('/:sprintId/assignments', assignTicketToUser);
router.patch('/:sprintId/assignments/:assignmentId', updateAssignmentStatus);
router.get('/:sprintId/board', getSprintBoard);
router.post('/:sprintId/start', startSprint);
router.post('/:sprintId/complete', completeSprint);
router.get('/assignments/user/:userId', getUserSprintAssignments);
router.get('/analytics/project/:projectId', getSprintAnalytics);

export default router;
