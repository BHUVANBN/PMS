// user.controller.js - User Management Controller
import { User, ActivityLog, USER_ROLES } from '../models/index.js';
import bcrypt from 'bcryptjs';

// Get all users with filtering and pagination
export const getUsers = async (req, res) => {
  try {
    const { 
      role, 
      page = 1, 
      limit = 20,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      active
    } = req.query;

    // Check permissions - only admin and HR can view all users
    const userRole = req.effectiveRole || req.userRole;
    if (!['admin', 'hr'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only admins and HR can view all users'
      });
    }

    let filter = {};
    if (role) filter.role = role;
    if (active !== undefined) filter.isActive = active === 'true';
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const users = await User.find(filter)
      .select('-password') // Exclude password from response
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// Get specific user details
export const getUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check permissions
    const userRole = req.effectiveRole || req.userRole;
    const isOwnProfile = userId === req.user._id.toString();
    const canView = ['admin', 'hr'].includes(userRole) || isOwnProfile;

    if (!canView) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

// Create new user (Admin/HR only)
export const createUser = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      firstName,
      lastName,
      role,
      actualRole,
      phoneNumber,
      address,
      dateOfBirth,
      joiningDate,
      department,
      leaveBalance
    } = req.body;

    // Check permissions - only admin and HR can create users
    const userRole = req.effectiveRole || req.userRole;
    if (!['admin', 'hr'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Only admins and HR can create users'
      });
    }

    // Validate required fields
    if (!username || !email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, password, first name, last name, and role are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }

    // Validate role
    if (!Object.values(USER_ROLES).includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Set default leave balance if not provided
    const defaultLeaveBalance = {
      annualLeave: 25,
      sickLeave: 10,
      personalLeave: 5,
      compensatoryLeave: 0
    };

    const newUser = new User({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      role,
      actualRole: actualRole || null,
      phoneNumber: phoneNumber || '',
      address: address || {},
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
      department: department || '',
      leaveBalance: leaveBalance || defaultLeaveBalance,
      isActive: true,
      assignedTickets: [],
      teams: []
    });

    await newUser.save();

    // Log activity
    await ActivityLog.create({
      entityType: 'user',
      entityId: newUser._id,
      userId: req.user._id,
      action: 'created',
      actionCategory: 'user_management',
      description: `User "${firstName} ${lastName}" created with role ${role}`,
      metadata: {
        newUserRole: role,
        newUserEmail: email
      }
    });

    // Remove password from response
    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: userResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
};

// Update user profile
export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    // Check permissions
    const userRole = req.effectiveRole || req.userRole;
    const isOwnProfile = userId === req.user._id.toString();
    const canUpdate = ['admin', 'hr'].includes(userRole) || isOwnProfile;

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Define allowed updates based on user role
    let allowedUpdates = ['firstName', 'lastName', 'phoneNumber', 'address', 'dateOfBirth'];
    
    if (['admin', 'hr'].includes(userRole)) {
      // Admin and HR can update more fields
      allowedUpdates = [
        'firstName', 'lastName', 'email', 'role', 'actualRole', 
        'phoneNumber', 'address', 'dateOfBirth', 'department', 
        'leaveBalance', 'isActive', 'teams'
      ];
    }

    // Prevent role changes for certain scenarios
    if (updates.role && !['admin'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can change user roles'
      });
    }

    // Apply updates
    const updateData = {};
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        if (field === 'email') {
          updateData[field] = updates[field].toLowerCase();
        } else if (field === 'dateOfBirth' && updates[field]) {
          updateData[field] = new Date(updates[field]);
        } else {
          updateData[field] = updates[field];
        }
      }
    });

    // Validate role if being updated
    if (updateData.role && !Object.values(USER_ROLES).includes(updateData.role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }

    Object.assign(user, updateData);
    await user.save();

    // Log activity
    await ActivityLog.create({
      entityType: 'user',
      entityId: userId,
      userId: req.user._id,
      action: 'updated',
      actionCategory: 'user_management',
      description: `User profile updated`,
      metadata: {
        updatedFields: Object.keys(updateData),
        targetUser: `${user.firstName} ${user.lastName}`
      }
    });

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: 'User updated successfully',
      data: userResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

// Change user password
export const changePassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;

    // Check permissions
    const userRole = req.effectiveRole || req.userRole;
    const isOwnProfile = userId === req.user._id.toString();
    const canChange = ['admin'].includes(userRole) || isOwnProfile;

    if (!canChange) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // For non-admin users, verify current password
    if (!['admin'].includes(userRole)) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required'
        });
      }

      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    user.password = hashedPassword;
    user.passwordChangedAt = new Date();
    await user.save();

    // Log activity
    await ActivityLog.create({
      entityType: 'user',
      entityId: userId,
      userId: req.user._id,
      action: 'password_changed',
      actionCategory: 'user_management',
      description: 'Password changed',
      metadata: {
        targetUser: `${user.firstName} ${user.lastName}`,
        changedByAdmin: ['admin'].includes(userRole)
      }
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: error.message
    });
  }
};

// Deactivate/Activate user (Admin/HR only)
export const toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    // Check permissions - only admin and HR can toggle user status
    const userRole = req.effectiveRole || req.userRole;
    if (!['admin', 'hr'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Only admins and HR can change user status'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deactivating own account
    if (userId === req.user._id.toString() && !isActive) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account'
      });
    }

    user.isActive = isActive;
    await user.save();

    // Log activity
    await ActivityLog.create({
      entityType: 'user',
      entityId: userId,
      userId: req.user._id,
      action: isActive ? 'activated' : 'deactivated',
      actionCategory: 'user_management',
      description: `User ${isActive ? 'activated' : 'deactivated'}`,
      metadata: {
        targetUser: `${user.firstName} ${user.lastName}`,
        newStatus: isActive
      }
    });

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { isActive: user.isActive }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user status',
      error: error.message
    });
  }
};

// Get user statistics (Admin/HR only)
export const getUserStatistics = async (req, res) => {
  try {
    // Check permissions
    const userRole = req.effectiveRole || req.userRole;
    if (!['admin', 'hr'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          inactiveUsers: {
            $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] }
          },
          usersByRole: {
            $push: '$role'
          }
        }
      }
    ]);

    const roleStats = {};
    if (stats.length > 0) {
      stats[0].usersByRole.forEach(role => {
        roleStats[role] = (roleStats[role] || 0) + 1;
      });
    }

    const statistics = {
      totalUsers: stats.length > 0 ? stats[0].totalUsers : 0,
      activeUsers: stats.length > 0 ? stats[0].activeUsers : 0,
      inactiveUsers: stats.length > 0 ? stats[0].inactiveUsers : 0,
      usersByRole: roleStats
    };

    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user statistics',
      error: error.message
    });
  }
};

// Update user leave balance (HR/Admin only)
export const updateLeaveBalance = async (req, res) => {
  try {
    const { userId } = req.params;
    const { leaveBalance } = req.body;

    // Check permissions - only admin and HR can update leave balance
    const userRole = req.effectiveRole || req.userRole;
    if (!['admin', 'hr'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Only admins and HR can update leave balance'
      });
    }

    if (!leaveBalance) {
      return res.status(400).json({
        success: false,
        message: 'Leave balance data is required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const oldBalance = { ...user.leaveBalance };
    user.leaveBalance = { ...user.leaveBalance, ...leaveBalance };
    await user.save();

    // Log activity
    await ActivityLog.create({
      entityType: 'user',
      entityId: userId,
      userId: req.user._id,
      action: 'leave_balance_updated',
      actionCategory: 'user_management',
      description: 'Leave balance updated',
      metadata: {
        targetUser: `${user.firstName} ${user.lastName}`,
        oldBalance,
        newBalance: user.leaveBalance
      }
    });

    res.json({
      success: true,
      message: 'Leave balance updated successfully',
      data: { leaveBalance: user.leaveBalance }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating leave balance',
      error: error.message
    });
  }
};

// Get users by role
export const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;

    // Validate role
    if (!Object.values(USER_ROLES).includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }

    // Check permissions
    const userRole = req.effectiveRole || req.userRole;
    if (!['admin', 'hr', 'manager'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const users = await User.find({ 
      role, 
      isActive: true 
    }).select('firstName lastName email role');

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users by role',
      error: error.message
    });
  }
};

// Delete user (Admin only)
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check permissions - only admin can delete users
    const userRole = req.effectiveRole || req.userRole;
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can delete users'
      });
    }

    // Prevent deleting own account
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await User.findByIdAndDelete(userId);

    // Log activity
    await ActivityLog.create({
      entityType: 'user',
      entityId: userId,
      userId: req.user._id,
      action: 'deleted',
      actionCategory: 'user_management',
      description: `User deleted`,
      metadata: {
        deletedUser: `${user.firstName} ${user.lastName}`,
        deletedUserRole: user.role
      }
    });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};
