import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User, USER_ROLES, Project, Sprint, BugTracker, ActivityLog } from '../models/index.js';

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
		
		// Get active projects count
		const activeProjects = await Project.countDocuments({ 
			status: 'active'
		});
		
		// Get security alerts (count of recent failed login attempts or inactive admins)
		// For now, we'll count inactive users as a security metric
		const inactiveUsers = totalUsers - activeUsers;
		const securityAlerts = inactiveUsers > 5 ? Math.floor(inactiveUsers / 5) : 0;

		return res.status(200).json({
			message: 'System statistics retrieved successfully',
			totalUsers,
			activeUsers,
			activeProjects,
			securityAlerts,
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
		const { limit = 20 } = req.query;
		const activities = [];

		// 1. Get recent user activities (registrations)
		const recentUsers = await User.find({ isActive: true })
			.sort({ createdAt: -1 })
			.limit(5)
			.select('username email role createdAt updatedAt');

		recentUsers.forEach(user => {
			activities.push({
				id: `user_${user._id}`,
				type: 'user_joined',
				title: 'New team member',
				description: `${user.username} (${user.role}) joined the team`,
				user: 'System',
				timestamp: user.createdAt
			});

			// Add user update activity if user was recently updated
			if (user.updatedAt && user.updatedAt !== user.createdAt) {
				const timeDiff = new Date(user.updatedAt) - new Date(user.createdAt);
				if (timeDiff > 1000) { // More than 1 second difference
					activities.push({
						id: `user_update_${user._id}`,
						type: 'comment_added',
						title: 'User profile updated',
						description: `${user.username}'s profile was updated`,
						user: 'Admin',
						timestamp: user.updatedAt
					});
				}
			}
		});

		// 2. Get recent projects
		const recentProjects = await Project.find({})
			.sort({ createdAt: -1 })
			.limit(5)
			.populate('projectManager', 'username')
			.select('name description projectManager createdAt');

		recentProjects.forEach(project => {
			activities.push({
				id: `project_${project._id}`,
				type: 'ticket_created',
				title: 'New project created',
				description: `Project "${project.name}" was created`,
				user: project.projectManager?.username || 'Unknown',
				timestamp: project.createdAt
			});
		});

		// 3. Get recent bugs
		try {
			const recentBugs = await BugTracker.find({})
				.sort({ createdAt: -1 })
				.limit(5)
				.populate('reportedBy', 'username')
				.select('title description reportedBy createdAt status');

			recentBugs.forEach(bug => {
				activities.push({
					id: `bug_${bug._id}`,
					type: 'bug_reported',
					title: 'Bug reported',
					description: `"${bug.title}" - ${bug.description?.substring(0, 50) || 'No description'}...`,
					user: bug.reportedBy?.username || 'Unknown',
					timestamp: bug.createdAt
				});
			});
		} catch (bugError) {
			console.log('No bugs found, continuing with other activities');
		}

		// 4. Get recent sprints
		try {
			const recentSprints = await Sprint.find({})
				.sort({ createdAt: -1 })
				.limit(3)
				.populate('projectId', 'name')
				.select('name projectId createdAt status');

			recentSprints.forEach(sprint => {
				activities.push({
					id: `sprint_${sprint._id}`,
					type: 'task_completed',
					title: 'Sprint created',
					description: `Sprint "${sprint.name}" for ${sprint.projectId?.name || 'Unknown Project'}`,
					user: 'System',
					timestamp: sprint.createdAt
				});
			});
		} catch (sprintError) {
			console.log('No sprints found, continuing with other activities');
		}

		// 5. Get activity logs if they exist
		try {
			const activityLogs = await ActivityLog.find({})
				.sort({ timestamp: -1 })
				.limit(5)
				.populate('userId', 'username')
				.select('description userId timestamp action entityType');

			activityLogs.forEach(log => {
				let activityType = 'comment_added';
				if (log.action === 'created') activityType = 'ticket_created';
				else if (log.action === 'updated') activityType = 'task_completed';
				else if (log.entityType === 'bug_tracker') activityType = 'bug_reported';

				activities.push({
					id: `log_${log._id}`,
					type: activityType,
					title: `${log.entityType} ${log.action}`,
					description: log.description,
					user: log.userId?.username || 'Unknown',
					timestamp: log.timestamp
				});
			});
		} catch (logError) {
			console.log('No activity logs found, continuing with other activities');
		}

		// Sort all activities by timestamp (newest first) and limit
		const sortedActivities = activities
			.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
			.slice(0, parseInt(limit));

		return res.status(200).json({
			message: 'Activity logs retrieved successfully',
			activities: sortedActivities,
			total: sortedActivities.length
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

/**
 * Get all projects in the system (Admin only)
 */
export const getAllProjects = async (req, res) => {
	try {
		const projects = await Project.find({})
			.populate('projectManager', 'firstName lastName username email')
			.populate('teamMembers', 'firstName lastName username email role')
			.select('-__v')
			.sort({ createdAt: -1 });

		return res.status(200).json({
			message: 'Projects retrieved successfully',
			projects: projects,
			count: projects.length
		});

	} catch (error) {
		console.error('Error getting all projects:', error);
		return res.status(500).json({
			message: 'Server error while getting projects',
			error: error.message
		});
	}
};

/**
 * Create a new project (Admin only)
 */
export const createProject = async (req, res) => {
	try {
		const { 
			projectName, 
			description, 
			projectManager, 
			teamMembers = [], 
			startDate, 
			endDate,
			priority = 'medium',
			status = 'planning'
		} = req.body;

		// Validate required fields
		if (!projectName || !description || !projectManager) {
			return res.status(400).json({
				message: 'Project name, description, and project manager are required'
			});
		}

		// Verify project manager exists and has manager role
		const manager = await User.findById(projectManager);
		if (!manager) {
			return res.status(404).json({
				message: 'Project manager not found'
			});
		}

		if (manager.role !== USER_ROLES.MANAGER) {
			return res.status(400).json({
				message: 'Assigned user must have manager role'
			});
		}

		// Verify team members exist
		if (teamMembers.length > 0) {
			const members = await User.find({ _id: { $in: teamMembers } });
			if (members.length !== teamMembers.length) {
				return res.status(400).json({
					message: 'One or more team members not found'
				});
			}
		}

		// Create new project
		const newProject = await Project.create({
			projectName,
			description,
			projectManager,
			teamMembers,
			startDate: startDate ? new Date(startDate) : new Date(),
			endDate: endDate ? new Date(endDate) : null,
			priority,
			status,
			modules: []
		});

		// Populate the response
		const populatedProject = await Project.findById(newProject._id)
			.populate('projectManager', 'firstName lastName username email')
			.populate('teamMembers', 'firstName lastName username email role');

		return res.status(201).json({
			message: 'Project created successfully',
			project: populatedProject
		});

	} catch (error) {
		console.error('Error creating project:', error);
		return res.status(500).json({
			message: 'Server error while creating project',
			error: error.message
		});
	}
};

/**
 * Get all teams (projects with their team members) created by managers
 */
export const getAllTeams = async (req, res) => {
	try {
		const teams = await Project.find({})
			.populate('projectManager', 'firstName lastName username email')
			.populate('teamMembers', 'firstName lastName username email role')
			.select('projectName description projectManager teamMembers createdAt status')
			.sort({ createdAt: -1 });

		// Transform data to focus on team structure
		const teamData = teams.map(project => ({
			id: project._id,
			teamName: project.projectName,
			description: project.description,
			manager: project.projectManager,
			members: project.teamMembers,
			memberCount: project.teamMembers.length,
			createdAt: project.createdAt,
			status: project.status
		}));

		return res.status(200).json({
			message: 'Teams retrieved successfully',
			teams: teamData,
			count: teamData.length
		});

	} catch (error) {
		console.error('Error getting all teams:', error);
		return res.status(500).json({
			message: 'Server error while getting teams',
			error: error.message
		});
	}
};
