import express from 'express';
import { login, logout, register, verifyToken, refreshToken } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/login', login);
router.post('/logout', logout);
router.post('/register', register);
router.get('/verify', verifyToken);
router.post('/refresh', refreshToken);

export default router;


