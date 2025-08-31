import express from 'express';
import { verifyToken, allowManagementTeam } from '../middleware/verifyToken.js';
import { USER_ROLES } from '../models/userschema.models.js';

const router = express.Router();

router.get('/me', verifyToken, allowManagementTeam, (req, res) => {
	return res.json({ message: 'Manager route', user: req.user });
});

router.get('/team', verifyToken, allowManagementTeam, (req, res) => {
	return res.json({ message: 'Manager can access manager/team' });
});

export default router;


