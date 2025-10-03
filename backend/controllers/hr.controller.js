import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User, USER_ROLES, Leave, Standup } from '../models/index.js';

/**
 * Create a new employee account
 * HR can create accounts for different roles
 */
export const createEmployee = async (req, res) => {
  try {
    const { username, email, password, role, firstName, lastName } = req.body;

    // Validate required fields
    if (!username || !email || !password || !firstName || !lastName) {
      return res.status(400).json({
        message: 'username, email, password, firstName, and lastName are required'
      });
    }

    // Validate role - HR can only assign certain roles
    const allowedRolesForHR = [
      USER_ROLES.EMPLOYEE,
      USER_ROLES.MANAGER,
      USER_ROLES.DEVELOPER,
      USER_ROLES.TESTER,
      USER_ROLES.MARKETING,
      USER_ROLES.SALES,
      USER_ROLES.INTERN
    ];

    const selectedRole = role && allowedRolesForHR.includes(role) ? role : USER_ROLES.EMPLOYEE;

    // Check if username or email already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(409).json({
        message: existingUser.username === username ? 'Username already exists' : 'Email already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new employee
    const newEmployee = await User.create({
      username,
      email,
      password: hashedPassword,
      role: selectedRole,
      firstName,
      lastName,
      isActive: true
    });

    // Return employee data without password
    const employeeResponse = {
      _id: newEmployee._id,
      username: newEmployee.username,
      email: newEmployee.email,
      role: newEmployee.role,
      firstName: newEmployee.firstName,
      lastName: newEmployee.lastName,
      isActive: newEmployee.isActive,
      createdAt: newEmployee.createdAt
    };

    return res.status(201).json({
      message: 'Employee created successfully',
      employee: employeeResponse
    });
  } catch (error) {
    console.error('Error creating employee:', error);
    return res.status(500).json({
      message: 'Server error while creating employee',
      error: error.message
    });
  }
};

/**
 * Get all employees with their details
 */
export const getAllEmployees = async (req, res) => {
	try {
		// HR can see all users except other HR users and admins (unless they need to)
		// For now, let's allow HR to see all users for management purposes
		const employees = await User.find({})
			.select('-password') // Exclude password from response
			.sort({ createdAt: -1 }); // Sort by newest first

		console.log(`HR getAllEmployees: Found ${employees.length} employees`);

		return res.status(200).json({
			message: 'Employees retrieved successfully',
			employees,
			count: employees.length
		});

	} catch (error) {
		console.error('Error retrieving employees:', error);
		return res.status(500).json({
			message: 'Server error while retrieving employees',
			error: error.message
		});
	}
};

/**
 * Get employees by role
 */
export const getEmployeesByRole = async (req, res) => {
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

		const employees = await User.find({ role })
			.select('-password')
			.sort({ createdAt: -1 });

		return res.status(200).json({
			message: `Employees with role '${role}' retrieved successfully`,
			employees,
			count: employees.length
		});

	} catch (error) {
		console.error('Error retrieving employees by role:', error);
		return res.status(500).json({
			message: 'Server error while retrieving employees by role',
			error: error.message
		});
	}
};

/**
 * Update employee information
 */
export const updateEmployee = async (req, res) => {
	try {
		const { id } = req.params;
		const { firstName, lastName, email, role, isActive } = req.body;

		// Validate employee ID
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: 'Invalid employee ID' });
		}

		// Check if employee exists
		const employee = await User.findById(id);
		if (!employee) {
			return res.status(404).json({ message: 'Employee not found' });
		}

		// HR can only update certain roles
		const allowedRolesForHR = [
			USER_ROLES.EMPLOYEE,
			USER_ROLES.MANAGER,
			USER_ROLES.DEVELOPER,
			USER_ROLES.TESTER,
			USER_ROLES.MARKETING,
			USER_ROLES.SALES,
			USER_ROLES.INTERN
		];

		// Validate role if provided
		if (role && !allowedRolesForHR.includes(role)) {
			return res.status(400).json({
				message: 'HR cannot assign this role',
				allowedRoles: allowedRolesForHR
			});
		}

		// Check if email is already taken by another user
		if (email && email !== employee.email) {
			const emailExists = await User.findOne({ email });
			if (emailExists) {
				return res.status(409).json({ message: 'Email already exists' });
			}
		}

		// Update employee
		const updateData = {};
		if (firstName) updateData.firstName = firstName;
		if (lastName) updateData.lastName = lastName;
		if (email) updateData.email = email;
		if (role) updateData.role = role;
		if (typeof isActive === 'boolean') updateData.isActive = isActive;

		const updatedEmployee = await User.findByIdAndUpdate(
			id,
			updateData,
			{ new: true }
		).select('-password');

		return res.status(200).json({
			message: 'Employee updated successfully',
			employee: updatedEmployee
		});

	} catch (error) {
		console.error('Error updating employee:', error);
		return res.status(500).json({
			message: 'Server error while updating employee',
			error: error.message
		});
	}
};

/**
 * Deactivate/Reactivate employee account
 */
export const toggleEmployeeStatus = async (req, res) => {
	try {
		const { id } = req.params;

		// Validate employee ID
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: 'Invalid employee ID' });
		}

		// Check if employee exists
		const employee = await User.findById(id);
		if (!employee) {
			return res.status(404).json({ message: 'Employee not found' });
		}

		// Toggle active status
		const updatedEmployee = await User.findByIdAndUpdate(
			id,
			{ isActive: !employee.isActive },
			{ new: true }
		).select('-password');

		return res.status(200).json({
			message: `Employee ${updatedEmployee.isActive ? 'activated' : 'deactivated'} successfully`,
			employee: updatedEmployee
		});

	} catch (error) {
		console.error('Error toggling employee status:', error);
		return res.status(500).json({
			message: 'Server error while updating employee status',
			error: error.message
		});
	}
};

/**
 * Get employee statistics
 */
export const getEmployeeStats = async (req, res) => {
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

		const totalEmployees = await User.countDocuments();
		const activeEmployees = await User.countDocuments({ isActive: true });

		return res.status(200).json({
			message: 'Employee statistics retrieved successfully',
			totalEmployees,
			activeEmployees,
			inactiveEmployees: totalEmployees - activeEmployees,
			byRole: stats
		});

	} catch (error) {
		console.error('Error retrieving employee stats:', error);
		return res.status(500).json({
			message: 'Server error while retrieving statistics',
			error: error.message
		});
	}
};

/**
 * Get HR dashboard statistics
 */
export const getHRStats = async (req, res) => {
	try {
		// Get total employee count
		const totalEmployees = await User.countDocuments({ 
			isActive: true,
			role: { $ne: USER_ROLES.ADMIN }
		});

		// Get employees by role
		const roleStats = await User.aggregate([
			{ $match: { isActive: true, role: { $ne: USER_ROLES.ADMIN } } },
			{ $group: { _id: '$role', count: { $sum: 1 } } }
		]);

		// Get recent hires (last 30 days)
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
		
		const recentHires = await User.countDocuments({
			isActive: true,
			createdAt: { $gte: thirtyDaysAgo }
		});

		// Get inactive employees
		const inactiveEmployees = await User.countDocuments({ isActive: false });

		// Leave request statistics - using real data structure for future Leave model integration
		const leaveStats = {
			pending: 0,
			approved: 0,
			rejected: 0,
			total: 0
		};

		const stats = {
			employees: {
				total: totalEmployees,
				active: totalEmployees,
				inactive: inactiveEmployees,
				recentHires: recentHires
			},
			roles: roleStats.reduce((acc, item) => {
				acc[item._id] = item.count;
				return acc;
			}, {}),
			leaves: leaveStats,
			overview: {
				departmentCount: Object.keys(roleStats.reduce((acc, item) => {
					acc[item._id] = true;
					return acc;
				}, {})).length
			}
		};

		return res.status(200).json({
			message: 'HR statistics retrieved successfully',
			stats
		});

	} catch (error) {
		console.error('Error retrieving HR stats:', error);
		return res.status(500).json({
			message: 'Server error while retrieving HR statistics',
			error: error.message
		});
	}
};

/**
 * Leave management: Approve a leave request
 */
export const approveLeaveRequest = async (req, res) => {
	try {
		// Stub implementation; integrate with Leave model/workflow as needed
		return res.status(200).json({ message: 'Leave request approved (stub)' });
	} catch (error) {
		console.error('Error approving leave request:', error);
		return res.status(500).json({
			message: 'Server error while approving leave request',
			error: error.message
		});
	}
};

/**
 * Leave management: Get all leave requests
 */
export const getAllLeaveRequests = async (req, res) => {
	try {
		// Stub data; replace with real query to Leave model when available
		const data = [
			{ id: 1, employee: 'Alice', status: 'Pending' },
			{ id: 2, employee: 'Bob', status: 'Approved' }
		];
		return res.status(200).json(data);
	} catch (error) {
		console.error('Error fetching leave requests:', error);
		return res.status(500).json({
			message: 'Server error while fetching leave requests',
			error: error.message
		});
	}
};

/**
 * Leave management: Reject a leave request
 */
export const rejectLeaveRequest = async (req, res) => {
	try {
		// Stub implementation; integrate with Leave model/workflow as needed
		return res.status(200).json({ message: 'Leave request rejected (stub)' });
	} catch (error) {
		console.error('Error rejecting leave request:', error);
		return res.status(500).json({
			message: 'Server error while rejecting leave request',
			error: error.message
		});
	}
};

/**
 * Standups: Get all standups
 */
export const getAllStandups = async (req, res) => {
	try {
		// Stub data; replace with real query to Standup model when available
		const data = [
			{ id: 1, employee: 'Alice', date: new Date().toISOString(), summary: 'Did X, plan Y' },
			{ id: 2, employee: 'Bob', date: new Date().toISOString(), summary: 'Fixed bug Z' }
		];
		return res.status(200).json(data);
	} catch (error) {
		console.error('Error fetching standups:', error);
		return res.status(500).json({
			message: 'Server error while fetching standups',
			error: error.message
		});
	}
};

/**
 * Standups: Get standups for a specific employee
 */
export const getEmployeeStandups = async (req, res) => {
	try {
		const { employeeId } = req.params;
		// Stub data filtered by employeeId; replace with real Standup model query
		const data = [
			{ id: 1, employeeId, date: new Date().toISOString(), summary: 'Daily update (stub)' }
		];
		return res.status(200).json(data);
	} catch (error) {
		console.error('Error fetching employee standups:', error);
		return res.status(500).json({
			message: 'Server error while fetching employee standups',
			error: error.message
		});
	}
};

/**
 * Get individual employee details by ID
 */
export const getEmployeeById = async (req, res) => {
	try {
		const { id } = req.params;

		// Find the employee by ID
		const employee = await User.findById(id).select('-password');
		
		if (!employee) {
			return res.status(404).json({
				message: 'Employee not found'
			});
		}

		// Check if user is actually an employee (not admin)
		if (employee.role === USER_ROLES.ADMIN) {
			return res.status(403).json({
				message: 'Cannot access admin user details through employee endpoint'
			});
		}

		// Return employee details with real data only
		const employeeDetails = {
			...employee.toObject(),
			department: employee.role,
			joinDate: employee.createdAt,
			lastActive: employee.updatedAt
		};

		return res.status(200).json({
			message: 'Employee details retrieved successfully',
			employee: employeeDetails
		});

	} catch (error) {
		console.error('Error retrieving employee details:', error);
		return res.status(500).json({
			message: 'Server error while retrieving employee details',
			error: error.message
		});
	}
};

