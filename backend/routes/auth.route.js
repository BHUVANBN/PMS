import express from 'express';
import { login, logout, register } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/login', express.json(), login);
router.post('/logout', logout);
router.post('/register', express.json(), register);

export default router;


