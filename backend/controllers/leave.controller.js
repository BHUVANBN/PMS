// leave.controller.js - Leave Management Controller
import { Leave, User, LEAVE_STATUS, LEAVE_TYPES } from '../models/index.js';
import { ActivityLog } from '../models/index.js';

// Submit a new leave request
export const submitLeaveRequest = async (req, res) => {
  try {
    const {
      leaveType,
      startDate,
      endDate,
      isHalfDay,
      halfDayPeriod,
      reason,
      additionalDetails,
      priority,
      emergencyContact,
      workHandover
    } = req.body;

    // Validate required fields
    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: leaveType, startDate, endDate, reason'
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      return res.status(400).json({
        success: false,
        message: 'Start date cannot be after end date'
      });
    }

    // Check for overlapping leave requests
    const overlappingLeave = await Leave.findOne({
      employeeId: req.user._id,
      status: { $in: [LEAVE_STATUS.PENDING, LEAVE_STATUS.APPROVED] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    });

    if (overlappingLeave) {
      return res.status(400).json({
        success: false,
        message: 'You already have a leave request for overlapping dates'
      });
    }

    // Create leave request
    const leaveRequest = new Leave({
      employeeId: req.user._id,
      leaveType,
      startDate: start,
      endDate: end,
      isHalfDay: isHalfDay || false,
      halfDayPeriod,
      reason,
      additionalDetails,
      priority: priority || 'medium',
      emergencyContact,
      workHandover,
      submittedAt: new Date()
    });

    await leaveRequest.save();

    // Log activity
    await ActivityLog.create({
      projectId: null,
      entityType: 'leave',
      entityId: leaveRequest._id,
      userId: req.user._id,
      action: 'created',
      actionCategory: 'leave_management',
      description: `Leave request submitted for ${leaveType}`,
      metadata: {
        leaveType,
        startDate,
        endDate
      }
    });

    res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully',
      data: leaveRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error submitting leave request',
      error: error.message
    });
  }
};

// Get all leave requests (HR/Admin view)
export const getAllLeaveRequests = async (req, res) => {
  try {
    const { status, leaveType, startDate, endDate, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    
    if (status) filter.status = status;
    if (leaveType) filter.leaveType = leaveType;
    if (startDate && endDate) {
      filter.startDate = { $gte: new Date(startDate) };
      filter.endDate = { $lte: new Date(endDate) };
    }

    const leaves = await Leave.find(filter)
      .populate('employeeId', 'firstName lastName email department jobTitle')
      .populate('reviewedBy', 'firstName lastName')
      .sort({ submittedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Leave.countDocuments(filter);

    res.json({
      success: true,
      data: {
        leaves,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching leave requests',
      error: error.message
    });
  }
};

// Get user's own leave requests
export const getMyLeaveRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const filter = { employeeId: req.user._id };
    if (status) filter.status = status;

    const leaves = await Leave.find(filter)
      .populate('reviewedBy', 'firstName lastName')
      .sort({ submittedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Leave.countDocuments(filter);

    res.json({
      success: true,
      data: {
        leaves,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching your leave requests',
      error: error.message
    });
  }
};

// Get pending leave requests for approval
export const getPendingLeaveRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const leaves = await Leave.find({ status: LEAVE_STATUS.PENDING })
      .populate('employeeId', 'firstName lastName email department jobTitle managerId')
      .sort({ priority: -1, submittedAt: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Leave.countDocuments({ status: LEAVE_STATUS.PENDING });

    res.json({
      success: true,
      data: {
        leaves,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching pending leave requests',
      error: error.message
    });
  }
};

// Approve or reject leave request
export const reviewLeaveRequest = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { action, comments } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Action must be either "approve" or "reject"'
      });
    }

    const leave = await Leave.findById(leaveId)
      .populate('employeeId', 'firstName lastName email');

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    if (leave.status !== LEAVE_STATUS.PENDING) {
      return res.status(400).json({
        success: false,
        message: 'Leave request has already been reviewed'
      });
    }

    // Update leave status
    leave.status = action === 'approve' ? LEAVE_STATUS.APPROVED : LEAVE_STATUS.REJECTED;
    leave.reviewedBy = req.user._id;
    leave.reviewedAt = new Date();
    leave.reviewComments = comments;
    leave.lastModifiedBy = req.user._id;

    await leave.save();

    // Log activity
    await ActivityLog.create({
      projectId: null,
      entityType: 'leave',
      entityId: leave._id,
      userId: req.user._id,
      action: 'status_changed',
      actionCategory: 'leave_management',
      description: `Leave request ${action}d by ${req.user.firstName} ${req.user.lastName}`,
      metadata: {
        employeeId: leave.employeeId._id,
        employeeName: `${leave.employeeId.firstName} ${leave.employeeId.lastName}`,
        action,
        comments
      }
    });

    res.json({
      success: true,
      message: `Leave request ${action}d successfully`,
      data: leave
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error reviewing leave request',
      error: error.message
    });
  }
};

// Cancel leave request (by employee)
export const cancelLeaveRequest = async (req, res) => {
  try {
    const { leaveId } = req.params;

    const leave = await Leave.findById(leaveId);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    // Check if user owns this leave request
    if (leave.employeeId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own leave requests'
      });
    }

    // Check if leave can be cancelled
    if (![LEAVE_STATUS.PENDING, LEAVE_STATUS.APPROVED].includes(leave.status)) {
      return res.status(400).json({
        success: false,
        message: 'Leave request cannot be cancelled'
      });
    }

    // Check if leave has already started
    const today = new Date();
    if (leave.startDate <= today) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel leave that has already started'
      });
    }

    leave.status = LEAVE_STATUS.CANCELLED;
    leave.lastModifiedBy = req.user._id;
    await leave.save();

    // Log activity
    await ActivityLog.create({
      projectId: null,
      entityType: 'leave',
      entityId: leave._id,
      userId: req.user._id,
      action: 'status_changed',
      actionCategory: 'leave_management',
      description: 'Leave request cancelled by employee',
      metadata: {
        previousStatus: leave.status
      }
    });

    res.json({
      success: true,
      message: 'Leave request cancelled successfully',
      data: leave
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling leave request',
      error: error.message
    });
  }
};

// Get leave balance for user
export const getLeaveBalance = async (req, res) => {
  try {
    const { userId } = req.params;
    const targetUserId = userId || req.user._id;

    // Check permission to view other user's balance
    if (targetUserId !== req.user._id.toString() && 
        !['admin', 'hr', 'manager'].includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const user = await User.findById(targetUserId).select('leaveBalance firstName lastName');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate used leave for current year
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31);

    const usedLeave = await Leave.aggregate([
      {
        $match: {
          employeeId: user._id,
          status: LEAVE_STATUS.APPROVED,
          startDate: { $gte: yearStart },
          endDate: { $lte: yearEnd }
        }
      },
      {
        $group: {
          _id: '$leaveType',
          totalDays: { $sum: '$numberOfDays' }
        }
      }
    ]);

    const leaveBalance = {
      ...user.leaveBalance.toObject(),
      usedThisYear: usedLeave.reduce((acc, leave) => {
        acc[leave._id] = leave.totalDays;
        return acc;
      }, {})
    };

    res.json({
      success: true,
      data: {
        user: {
          firstName: user.firstName,
          lastName: user.lastName
        },
        leaveBalance
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching leave balance',
      error: error.message
    });
  }
};

// Get leave analytics (HR/Admin)
export const getLeaveAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, department } = req.query;
    
    const matchStage = {};
    if (startDate && endDate) {
      matchStage.startDate = { $gte: new Date(startDate) };
      matchStage.endDate = { $lte: new Date(endDate) };
    }

    // Get leave statistics
    const leaveStats = await Leave.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'users',
          localField: 'employeeId',
          foreignField: '_id',
          as: 'employee'
        }
      },
      { $unwind: '$employee' },
      ...(department ? [{ $match: { 'employee.department': department } }] : []),
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          approvedRequests: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          rejectedRequests: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          },
          pendingRequests: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          totalLeaveDays: { $sum: '$numberOfDays' },
          leaveByType: {
            $push: {
              type: '$leaveType',
              days: '$numberOfDays',
              status: '$status'
            }
          }
        }
      }
    ]);

    // Get leave trends by month
    const leaveTrends = await Leave.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: '$startDate' },
            month: { $month: '$startDate' }
          },
          count: { $sum: 1 },
          totalDays: { $sum: '$numberOfDays' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        statistics: leaveStats[0] || {},
        trends: leaveTrends
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching leave analytics',
      error: error.message
    });
  }
};

// Update leave balance (HR/Admin only)
export const updateLeaveBalance = async (req, res) => {
  try {
    const { userId } = req.params;
    const { leaveBalance } = req.body;

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.leaveBalance = { ...user.leaveBalance.toObject(), ...leaveBalance };
    await user.save();

    // Log activity
    await ActivityLog.create({
      projectId: null,
      entityType: 'user',
      entityId: user._id,
      userId: req.user._id,
      action: 'updated',
      actionCategory: 'leave_management',
      description: `Leave balance updated for ${user.firstName} ${user.lastName}`,
      metadata: {
        updatedBalance: leaveBalance
      }
    });

    res.json({
      success: true,
      message: 'Leave balance updated successfully',
      data: user.leaveBalance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating leave balance',
      error: error.message
    });
  }
};
