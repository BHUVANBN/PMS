import express from 'express';
import { verifyToken, hrOrAdmin } from '../middleware/roleAuth.js';
import { getTodayStatus, submitStandup, listStandups, myStandups } from '../controllers/standup.controller.js';

const router = express.Router();

// Authenticated user endpoints
router.get('/today', verifyToken, getTodayStatus);
router.post('/', verifyToken, express.json(), submitStandup);
router.get('/me', verifyToken, myStandups);

// Admin/HR analysis
router.get('/list', verifyToken, hrOrAdmin, listStandups);

export default router;
