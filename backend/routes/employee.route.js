import express from 'express';
import { verifyToken, allowEmployeeOnly } from '../middleware/verifyToken.js';
import { USER_ROLES } from '../models/userschema.models.js';

const router = express.Router();

router.get('/me', verifyToken, allowEmployeeOnly, (req, res) => {
	return res.json({ message: 'Employee route', user: req.user });
});

export default router;


