import express from 'express';
import { verifyToken, hrOrAdmin, requireRole } from '../middleware/roleAuth.js';
import { getTodayStatus, submitStandup, listStandups, myStandups, addStandupComment, addStandupAttachment, getTodayStandupsForManager, getStandupSummary } from '../controllers/standup.controller.js';
import { baseUpload } from '../middleware/upload.js';

const router = express.Router();

// Authenticated user endpoints
router.get('/today', verifyToken, getTodayStatus);
router.post('/', verifyToken, express.json(), submitStandup);
router.get('/me', verifyToken, myStandups);

// Admin/HR analysis
router.get('/list', verifyToken, hrOrAdmin, listStandups);

// Manager/Admin/HR: comment on a standup
router.post('/:id/comments', verifyToken, requireRole('manager','admin','hr'), express.json(), addStandupComment);

// Upload attachment to a standup (owner or privileged roles)
router.post('/:id/attachments', verifyToken, baseUpload.single('file'), addStandupAttachment);

// Today standups for manager scope
router.get('/today/all', verifyToken, getTodayStandupsForManager);

// Summary report
router.get('/summary', verifyToken, getStandupSummary);

export default router;
