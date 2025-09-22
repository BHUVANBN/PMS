import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User, USER_ROLES, Project, Sprint, BugTracker } from '../models/index.js';

/**
 * Create a new user account with any role (Admin privilege)
 * Admin can create accounts for all roles including HR, Manager, and other Admins
 */
export const createUser = async (req, res) => {
	try {
		const { username, email, password, role, firstName, lastName } = req.body;

		// Validate required fields
		if (!username || !email || !password || !firstName || !lastName) {
			return res.status(400).json({
				message: 'username, email, password, firstName, and lastName are required'
			});
		}

		// Validate role - Admin can assign any role
		const allowedRoles = Object.values(USER_ROLES);
		const selectedRole = role && allowedRoles.includes(role) ? role : USER_ROLES.EMPLOYEE;

		// Check if username or email already exists
		const existingUser = await User.findOne({ $or: [{ username }, { email }] });
		if (existingUser) {
			return res.status(409).json({
				message: existingUser.username === username
					? 'Username already exists'
					: 'Email already exists'
			});
		}

		// Hash password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		// Create new user
		const newUser = await User.create({
			username,
			email,
			password: hashedPassword,
			role: selectedRole,
			firstName,
			lastName,
			isActive: true
		});

		// Return user data without password
		const userResponse = {
			_id: newUser._id,
			username: newUser.username,
			email: newUser.email,
			role: newUser.role,
			firstName: newUser.firstName,
			lastName: newUser.lastName,
			isActive: newUser.isActive,
			createdAt: newUser.createdAt
		};

		return res.status(201).json({
			message: 'User created successfully',
			user: userResponse
		});

	} catch (error) {
		console.error('Error creating user:', error);
		return res.status(500).json({
			message: 'Server error while creating user',
			error: error.message
		});
	}
};

/**
 * Create HR user specifically
 */
export const createHR = async (req, res) => {
	try {
		const { username, email, password, firstName, lastName } = req.body;

		// Validate required fields
		if (!username || !email || !password || !firstName || !lastName) {
			return res.status(400).json({
				message: 'username, email, password, firstName, and lastName are required'
			});
		}

		// Check if username or email already exists
		const existingUser = await User.findOne({ $or: [{ username }, { email }] });
		if (existingUser) {
			return res.status(409).json({
				message: existingUser.username === username
					? 'Username already exists'
					: 'Email already exists'
			});
		}

		// Hash password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		// Create new HR user
		const newHR = await User.create({
			username,
			email,
			password: hashedPassword,
			role: USER_ROLES.HR,
			firstName,
			lastName,
			isActive: true
		});

		// Return HR data without password
		const hrResponse = {
			_id: newHR._id,
			username: newHR.username,
			email: newHR.email,
			role: newHR.role,
			firstName: newHR.firstName,
			lastName: newHR.lastName,
			isActive: newHR.isActive,
			createdAt: newHR.createdAt
		};

		return res.status(201).json({
			message: 'HR user created successfully',
			user: hrResponse
		});

	} catch (error) {
		console.error('Error creating HR user:', error);
		return res.status(500).json({
			message: 'Server error while creating HR user',
			error: error.message
		});
	}
};

/**
 * Get all users in the system
 */
export const getAllUsers = async (req, res) => {
	try {
		const users = await User.find({})
			.select('-password') // Exclude password from response
			.sort({ createdAt: -1 }); // Sort by newest first

		return res.status(200).json({
			message: 'Users retrieved successfully',
			users,
			count: users.length
		});

	} catch (error) {
		console.error('Error retrieving users:', error);
		return res.status(500).json({
			message: 'Server error while retrieving users',
			error: error.message
		});
	}
};

/**
 * Get users by role
 */
export const getUsersByRole = async (req, res) => {
	try {
		const { role } = req.params;

		// Validate role
		const allowedRoles = Object.values(USER_ROLES);
		if (!allowedRoles.includes(role)) {
			return res.status(400).json({
				message: 'Invalid role specified',
				validRoles: allowedRoles
			});
		}

		const users = await User.find({ role })
			.select('-password')
			.sort({ createdAt: -1 });

		return res.status(200).json({
			message: `Users with role '${role}' retrieved successfully`,
			users,
			count: users.length
		});

	} catch (error) {
		console.error('Error retrieving users by role:', error);
		return res.status(500).json({
			message: 'Server error while retrieving users by role',
			error: error.message
		});
	}
};

/**
 * Update any user information
 */
export const updateUser = async (req, res) => {
	try {
		const { id } = req.params;
		const { firstName, lastName, email, role, isActive } = req.body;

		// Validate user ID
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: 'Invalid user ID' });
		}

		// Check if user exists
		const user = await User.findById(id);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		// Validate role if provided
		const allowedRoles = Object.values(USER_ROLES);
		if (role && !allowedRoles.includes(role)) {
			return res.status(400).json({
				message: 'Invalid role specified',
				validRoles: allowedRoles
			});
		}

		// Check if email is already taken by another user
		if (email && email !== user.email) {
			const emailExists = await User.findOne({ email });
			if (emailExists) {
				return res.status(409).json({ message: 'Email already exists' });
			}
		}

		// Update user
		const updateData = {};
		if (firstName) updateData.firstName = firstName;
		if (lastName) updateData.lastName = lastName;
		if (email) updateData.email = email;
		if (role) updateData.role = role;
		if (typeof isActive === 'boolean') updateData.isActive = isActive;

		const updatedUser = await User.findByIdAndUpdate(
			id,
			updateData,
			{ new: true }
		).select('-password');

		return res.status(200).json({
			message: 'User updated successfully',
			user: updatedUser
		});

	} catch (error) {
		console.error('Error updating user:', error);
		return res.status(500).json({
			message: 'Server error while updating user',
			error: error.message
		});
	}
};

/**
 * Delete a user (soft delete by deactivating)
 */
export const deleteUser = async (req, res) => {
	try {
		const { id } = req.params;

		// Validate user ID
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: 'Invalid user ID' });
		}

		// Check if user exists
		const user = await User.findById(id);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		// Prevent admin from deleting themselves
		if (user._id.toString() === req.user.id) {
			return res.status(400).json({ message: 'Cannot delete your own account' });
		}

		// Soft delete by deactivating
		const deletedUser = await User.findByIdAndUpdate(
			id,
			{ isActive: false },
			{ new: true }
		).select('-password');

		return res.status(200).json({
			message: 'User deactivated successfully',
			user: deletedUser
		});

	} catch (error) {
		console.error('Error deleting user:', error);
		return res.status(500).json({
			message: 'Server error while deleting user',
			error: error.message
		});
	}
};

/**
 * Get system statistics
 */
export const getSystemStats = async (req, res) => {
	try {
		const stats = await User.aggregate([
			{
				$group: {
					_id: '$role',
					count: { $sum: 1 },
					active: { $sum: { $cond: ['$isActive', 1, 0] } },
					inactive: { $sum: { $cond: ['$isActive', 0, 1] } }
				}
			},
			{
				$sort: { count: -1 }
			}
		]);

		const totalUsers = await User.countDocuments();
		const activeUsers = await User.countDocuments({ isActive: true });

		return res.status(200).json({
			message: 'System statistics retrieved successfully',
			totalUsers,
			activeUsers,
			inactiveUsers: totalUsers - activeUsers,
			byRole: stats
		});

	} catch (error) {
		console.error('Error retrieving system stats:', error);
		return res.status(500).json({
			message: 'Server error while retrieving statistics',
			error: error.message
		});
	}
};

/**
 * Get organization analytics
 */
export const getOrganizationAnalytics = async (req, res) => {
	try {
		// Stub implementation; replace with real analytics aggregation as needed
		return res.status(200).json({
			message: 'Organization analytics endpoint working'
		});
	} catch (error) {
		console.error('Error getting organization analytics:', error);
		return res.status(500).json({
			message: 'Server error while getting organization analytics',
			error: error.message
		});
	}
};

/**
 * Reset user password
 */
export const resetUserPassword = async (req, res) => {
	try {
		const { id } = req.params;
		const { newPassword } = req.body;

		if (!newPassword) {
			return res.status(400).json({ message: 'New password is required' });
		}

		// Validate user ID
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: 'Invalid user ID' });
		}

		// Check if user exists
		const user = await User.findById(id);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		// Hash new password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(newPassword, salt);

		// Update password
		const updatedUser = await User.findByIdAndUpdate(
			id,
			{ password: hashedPassword },
			{ new: true }
		).select('-password');

		return res.status(200).json({
			message: 'Password reset successfully',
			user: updatedUser
		});

	} catch (error) {
		console.error('Error resetting password:', error);
		return res.status(500).json({
			message: 'Server error while resetting password',
			error: error.message
		});
	}
};

/**
 * Get system activity logs
 */
export const getActivityLogs = async (req, res) => {
	try {
		const { limit = 50, offset = 0 } = req.query;
		
		// Get recent user activities (registrations, logins, etc.)
		const recentUsers = await User.find({ isActive: true })
			.sort({ createdAt: -1 })
			.limit(parseInt(limit))
			.skip(parseInt(offset))
			.select('username email role createdAt updatedAt');

		// Convert user data to activity format (real data only)
		const activities = recentUsers.map(user => ({
			id: user._id,
			type: 'user_created',
			description: `User ${user.username} (${user.role}) was created`,
			timestamp: user.createdAt,
			user: {
				username: user.username,
				role: user.role
			}
		}));

		return res.status(200).json({
			message: 'Activity logs retrieved successfully',
			activities,
			total: activities.length
		});

	} catch (error) {
		console.error('Error getting activity logs:', error);
		return res.status(500).json({
			message: 'Server error while getting activity logs',
			error: error.message
		});
	}
};

/**
 * Get system health status
 */
export const getSystemHealth = async (req, res) => {
	try {
		const startTime = Date.now();
		
		// Check database connection
		const dbStatus = mongoose.connection.readyState === 1 ? 'healthy' : 'unhealthy';
		
		// Get basic system metrics
		const userCount = await User.countDocuments({ isActive: true });
		const totalUsers = await User.countDocuments();
		
		// Calculate response time
		const responseTime = Date.now() - startTime;
		
		// System health data with real metrics
		const healthData = {
			status: dbStatus === 'healthy' ? 'healthy' : 'unhealthy',
			timestamp: new Date().toISOString(),
			services: {
				database: {
					status: dbStatus,
					responseTime: responseTime + 'ms'
				},
				api: {
					status: 'healthy',
					responseTime: responseTime + 'ms'
				}
			},
			metrics: {
				activeUsers: userCount,
				totalUsers: totalUsers,
				uptime: process.uptime(),
				memoryUsage: process.memoryUsage(),
				nodeVersion: process.version
			}
		};

		return res.status(200).json({
			message: 'System health retrieved successfully',
			health: healthData
		});

	} catch (error) {
		console.error('Error getting system health:', error);
		return res.status(500).json({
			message: 'Server error while getting system health',
			error: error.message,
			health: {
				status: 'unhealthy',
				timestamp: new Date().toISOString(),
				error: error.message
			}
		});
	}
};
