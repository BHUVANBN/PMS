// leave.controller.js - Full Leave Management Implementation
import mongoose from 'mongoose';
import { Leave, User } from '../models/index.js';

// ─── Submit leave request (any employee) ─────────────────────────────────────
export const submitLeaveRequest = async (req, res) => {
  try {
    const employeeId = req.user._id;
    const { leaveType, startDate, endDate, reason, isHalfDay, halfDayPeriod, additionalDetails, priority } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'leaveType, startDate, endDate, and reason are required',
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ success: false, message: 'Invalid date format' });
    }

    if (end < start) {
      return res.status(400).json({ success: false, message: 'endDate must be on or after startDate' });
    }

    // Check for overlapping leave requests
    const existing = await Leave.findOne({
      employeeId,
      status: { $in: ['pending', 'approved'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } },
      ],
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'You already have a leave request overlapping with this date range',
      });
    }

    const leave = await Leave.create({
      employeeId,
      leaveType,
      startDate: start,
      endDate: end,
      reason: reason.trim(),
      isHalfDay: Boolean(isHalfDay),
      halfDayPeriod: isHalfDay ? halfDayPeriod : null,
      additionalDetails: additionalDetails?.trim(),
      priority: priority || 'medium',
      status: 'pending',
    });

    await leave.populate('employeeId', 'firstName lastName email role');

    return res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully',
      data: leave,
    });
  } catch (error) {
    console.error('submitLeaveRequest error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit leave request' });
  }
};

// ─── Get my leave requests (self) ─────────────────────────────────────────────
export const getMyLeaveRequests = async (req, res) => {
  try {
    const employeeId = req.user._id;
    const { status, page = 1, limit = 20 } = req.query;

    const filter = { employeeId };
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [leaves, total] = await Promise.all([
      Leave.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('reviewedBy', 'firstName lastName role'),
      Leave.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: leaves,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    console.error('getMyLeaveRequests error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch leave requests' });
  }
};

// ─── Cancel own leave request ─────────────────────────────────────────────────
export const cancelLeaveRequest = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const employeeId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(leaveId)) {
      return res.status(400).json({ success: false, message: 'Invalid leave ID' });
    }

    const leave = await Leave.findOne({ _id: leaveId, employeeId });
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }
    if (!['pending'].includes(leave.status)) {
      return res.status(400).json({ success: false, message: 'Only pending leave requests can be cancelled' });
    }

    leave.status = 'cancelled';
    leave.lastModifiedBy = employeeId;
    await leave.save();

    return res.status(200).json({ success: true, message: 'Leave request cancelled', data: leave });
  } catch (error) {
    console.error('cancelLeaveRequest error:', error);
    return res.status(500).json({ success: false, message: 'Failed to cancel leave request' });
  }
};

// ─── Get ALL leave requests (HR/Admin) ───────────────────────────────────────
export const getAllLeaveRequests = async (req, res) => {
  try {
    const { status, leaveType, employeeId, page = 1, limit = 20, startDate, endDate } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (leaveType) filter.leaveType = leaveType;
    if (employeeId && mongoose.Types.ObjectId.isValid(employeeId)) filter.employeeId = employeeId;
    if (startDate || endDate) {
      filter.startDate = {};
      if (startDate) filter.startDate.$gte = new Date(startDate);
      if (endDate) filter.startDate.$lte = new Date(endDate);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [leaves, total] = await Promise.all([
      Leave.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('employeeId', 'firstName lastName email role department')
        .populate('reviewedBy', 'firstName lastName role'),
      Leave.countDocuments(filter),
    ]);

    const stats = await Leave.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const summary = stats.reduce((acc, s) => { acc[s._id] = s.count; return acc; }, {});

    return res.status(200).json({
      success: true,
      data: leaves,
      summary,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    console.error('getAllLeaveRequests error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch leave requests' });
  }
};

// ─── Approve leave request (HR/Admin) ────────────────────────────────────────
export const approveLeaveRequest = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const reviewerId = req.user._id;
    const { comments } = req.body;

    if (!mongoose.Types.ObjectId.isValid(leaveId)) {
      return res.status(400).json({ success: false, message: 'Invalid leave ID' });
    }

    const leave = await Leave.findById(leaveId).populate('employeeId', 'firstName lastName email leaveBalance');
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }
    if (leave.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Leave request is already ${leave.status}` });
    }

    leave.status = 'approved';
    leave.reviewedBy = reviewerId;
    leave.reviewedAt = new Date();
    leave.reviewComments = comments?.trim();
    leave.lastModifiedBy = reviewerId;
    await leave.save();
    await leave.populate('reviewedBy', 'firstName lastName role');

    return res.status(200).json({ success: true, message: 'Leave request approved', data: leave });
  } catch (error) {
    console.error('approveLeaveRequest error:', error);
    return res.status(500).json({ success: false, message: 'Failed to approve leave request' });
  }
};

// ─── Reject leave request (HR/Admin) ─────────────────────────────────────────
export const rejectLeaveRequest = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const reviewerId = req.user._id;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(leaveId)) {
      return res.status(400).json({ success: false, message: 'Invalid leave ID' });
    }

    const leave = await Leave.findById(leaveId);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }
    if (leave.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Leave request is already ${leave.status}` });
    }

    leave.status = 'rejected';
    leave.reviewedBy = reviewerId;
    leave.reviewedAt = new Date();
    leave.reviewComments = reason.trim();
    leave.lastModifiedBy = reviewerId;
    await leave.save();
    await leave.populate('reviewedBy', 'firstName lastName role');
    await leave.populate('employeeId', 'firstName lastName email role');

    return res.status(200).json({ success: true, message: 'Leave request rejected', data: leave });
  } catch (error) {
    console.error('rejectLeaveRequest error:', error);
    return res.status(500).json({ success: false, message: 'Failed to reject leave request' });
  }
};

// ─── Get leave statistics (HR/Admin) ─────────────────────────────────────────
export const getLeaveStats = async (req, res) => {
  try {
    const stats = await Leave.aggregate([
      {
        $facet: {
          byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
          byType: [{ $group: { _id: '$leaveType', count: { $sum: 1 } } }],
          pending: [{ $match: { status: 'pending' } }, { $count: 'count' }],
          thisMonth: [
            {
              $match: {
                createdAt: {
                  $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                },
              },
            },
            { $count: 'count' },
          ],
        },
      },
    ]);

    const result = stats[0];
    return res.status(200).json({
      success: true,
      data: {
        byStatus: result.byStatus.reduce((acc, s) => { acc[s._id] = s.count; return acc; }, {}),
        byType: result.byType.reduce((acc, s) => { acc[s._id] = s.count; return acc; }, {}),
        pendingCount: result.pending[0]?.count || 0,
        thisMonthCount: result.thisMonth[0]?.count || 0,
      },
    });
  } catch (error) {
    console.error('getLeaveStats error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch leave statistics' });
  }
};
