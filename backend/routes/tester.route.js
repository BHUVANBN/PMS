import express from 'express';
import { verifyToken, allowTesterOnly } from '../middleware/verifyToken.js';
import { USER_ROLES } from '../models/userschema.models.js';

const router = express.Router();

router.get('/me', verifyToken, allowTesterOnly, (req, res) => {
	return res.json({ message: 'Tester route', user: req.user });
});

export default router;


