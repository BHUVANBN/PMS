// analytics.route.js - Analytics Routes
import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import {
  getDashboardAnalytics,
  getProjectAnalytics,
  getUserPerformanceAnalytics
} from '../controllers/analytics.controller.js';

const router = express.Router();

// Protect all analytics routes
router.use(verifyToken);

// GET /api/analytics/dashboard?timeframe=1month&projectId=...
router.get('/dashboard', getDashboardAnalytics);

// GET /api/analytics/project/:projectId?timeframe=3months
router.get('/project/:projectId', getProjectAnalytics);

// GET /api/analytics/user/:userId?timeframe=3months
router.get('/user/:userId', getUserPerformanceAnalytics);

export default router;
