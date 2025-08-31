import express from 'express';
import { verifyToken, allowInternOnly } from '../middleware/verifyToken.js';
import { USER_ROLES } from '../models/userschema.models.js';

const router = express.Router();

router.get('/me', verifyToken, allowInternOnly, (req, res) => {
	return res.json({ message: 'Intern route', user: req.user });
});

export default router;



