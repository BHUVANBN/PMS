// bugTracker.route.js - Bug Tracker Routes
import express from 'express';
import { verifyToken, allowDevelopmentTeam } from '../middleware/verifyToken.js';
import {
  createBugReport,
  getProjectBugs,
  getBugDetails,
  assignBug,
  updateBugStatus,
  addBugComment,
  updateBugPriority,
  updateBugWatchers,
  getBugStatistics,
  getUserAssignedBugs
} from '../controllers/bugTracker.controller.js';

const router = express.Router();

router.use(verifyToken);
router.use(allowDevelopmentTeam);

router.post('/', createBugReport);
router.get('/project/:projectId', getProjectBugs);
router.get('/:bugId', getBugDetails);
router.post('/:bugId/assign', assignBug);
router.patch('/:bugId/status', updateBugStatus);
router.post('/:bugId/comments', addBugComment);
router.patch('/:bugId/priority', updateBugPriority);
router.patch('/:bugId/watchers', updateBugWatchers);
router.get('/stats/project/:projectId', getBugStatistics);
router.get('/assigned/user/:userId', getUserAssignedBugs);

export default router;
