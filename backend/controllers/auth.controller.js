import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import { User, USER_ROLES } from '../models/index.js';

const signToken = (user) => {
	return jwt.sign(
		{ id: user._id.toString(), role: user.role, username: user.username },
		process.env.JWT_SECRET,
		{ expiresIn: '1d' }
	);
};

export const attachCookieParser = (app) => {
	app.use(cookieParser());
};

export const login = async (req, res) => {
	try {
		const { username, password } = req.body;
		if (!username || !password) {
			return res.status(400).json({ message: 'username and password are required' });
		}
		const user = await User.findOne({ username, isActive: true });
		if (!user) {
			return res.status(401).json({ message: 'Invalid credentials' });
		}
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(401).json({ message: 'Invalid credentials' });
		}
		const token = signToken(user);
		res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 24*60*60*1000 });
		return res.status(200).json({ message: 'Login successful', token, role: user.role });
	} catch (error) {
		return res.status(500).json({ message: 'Server error', error: error.message });
	}
};

export const logout = async (req, res) => {
	try {
		res.clearCookie('token');
		return res.status(200).json({ message: 'Logged out' });
	} catch (error) {
		return res.status(500).json({ message: 'Server error', error: error.message });
	}
};

export const register = async (req, res) => {
	try {
		const { username, email, password, role, firstName, lastName } = req.body;
		if (!username || !email || !password || !firstName || !lastName) {
			return res.status(400).json({ message: 'username, email, password, firstName, lastName are required' });
		}
		const allowedRoles = Object.values(USER_ROLES);
		const selectedRole = role && allowedRoles.includes(role) ? role : USER_ROLES.EMPLOYEE;
		const existing = await User.findOne({ $or: [{ username }, { email }] });
		if (existing) {
			return res.status(409).json({ message: 'username or email already exists' });
		}
		const salt = await bcrypt.genSalt(10);
		const hashed = await bcrypt.hash(password, salt);
		const user = await User.create({ username, email, password: hashed, role: selectedRole, firstName, lastName });
		const token = signToken(user);
		res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 24*60*60*1000 });
		return res.status(201).json({ message: 'Registered successfully', token, role: user.role });
	} catch (error) {
		return res.status(500).json({ message: 'Server error', error: error.message });
	}
};


