import express from 'express';
import { submitPublicOnboarding, listPublicOnboarding, approvePublicOnboarding } from '../controllers/publicOnboarding.controller.js';
import { publicOnboardingUpload } from '../middleware/upload.js';
import { verifyToken, allowHRAndAbove } from '../middleware/verifyToken.js';

const router = express.Router();

// Public onboarding submission (no auth required)
router.post('/onboarding', publicOnboardingUpload, submitPublicOnboarding);

// HR/Admin protected endpoints for managing public onboarding submissions
router.get('/onboarding', verifyToken, allowHRAndAbove, listPublicOnboarding);
router.post('/onboarding/:id/approve', verifyToken, allowHRAndAbove, approvePublicOnboarding);

export default router;
