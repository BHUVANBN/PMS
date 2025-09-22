// bugTracker.controller.js - Bug Tracker Management Controller
import { BugTracker, Project, User, ActivityLog, BUG_STATUS, BUG_SEVERITY, BUG_PRIORITY } from '../models/index.js';
import mongoose from 'mongoose';
import { emitBugEvent, emitTicketEvent } from '../utils/realtime.js';

// Create a new bug report
export const createBugReport = async (req, res) => {
  try {
    const {
      projectId,
      title,
      description,
      stepsToReproduce,
      expectedBehavior,
      actualBehavior,
      severity,
      priority,
      linkedTicket,
      environment,
      browserInfo,
      attachments,
      watchers
    } = req.body;

    // Validate required fields
    if (!projectId || !title || !description || !severity) {
      return res.status(400).json({
        success: false,
        message: 'Project ID, title, description, and severity are required'
      });
    }

    // Check if user has access to the project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Generate unique bug number
    const bugCount = await BugTracker.countDocuments({ projectId });
    const bugNumber = `BUG-${project.name.substring(0, 3).toUpperCase()}-${String(bugCount + 1).padStart(4, '0')}`;

    const bugReport = new BugTracker({
      projectId,
      title,
      description,
      stepsToReproduce: stepsToReproduce || [],
      expectedBehavior,
      actualBehavior,
      bugNumber,
      severity,
      priority: priority || BUG_PRIORITY.MEDIUM,
      status: BUG_STATUS.OPEN,
      reportedBy: req.user._id,
      linkedTicket: linkedTicket || null,
      environment: environment || {},
      browserInfo: browserInfo || {},
      attachments: attachments || [],
      watchers: watchers || [req.user._id],
      statusHistory: [{
        status: BUG_STATUS.OPEN,
        changedBy: req.user._id,
        changedAt: new Date(),
        reason: 'Bug report created'
      }]
    });

    await bugReport.save();

    // Log activity
    await ActivityLog.create({
      projectId,
      entityType: 'bug',
      entityId: bugReport._id,
      userId: req.user._id,
      action: 'created',
      actionCategory: 'bug_update',
      description: `Bug report "${title}" created`,
      metadata: {
        bugNumber,
        severity,
        priority
      }
    });

    res.status(201).json({
      success: true,
      message: 'Bug report created successfully',
      data: bugReport
    });

    // Emit realtime events for bug creation
    emitBugEvent({
      projectId: projectId.toString(),
      userIds: [req.user._id.toString()],
      type: 'bug.created',
      data: { bugId: bugReport._id, bugNumber }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating bug report',
      error: error.message
    });
  }
};

// Get all bugs for a project
export const getProjectBugs = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { 
      status, 
      severity, 
      priority, 
      assignedTo, 
      reportedBy,
      page = 1, 
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = { projectId };
    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (reportedBy) filter.reportedBy = reportedBy;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const bugs = await BugTracker.find(filter)
      .populate('reportedBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
      .populate('resolvedBy', 'firstName lastName email')
      .populate('watchers', 'firstName lastName email')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await BugTracker.countDocuments(filter);

    res.json({
      success: true,
      data: {
        bugs,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalBugs: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bugs',
      error: error.message
    });
  }
};

// Get specific bug details
export const getBugDetails = async (req, res) => {
  try {
    const { bugId } = req.params;

    const bug = await BugTracker.findById(bugId)
      .populate('projectId', 'name description')
      .populate('reportedBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email role')
      .populate('resolvedBy', 'firstName lastName email')
      .populate('watchers', 'firstName lastName email')
      .populate('comments.userId', 'firstName lastName email')
      .populate('statusHistory.changedBy', 'firstName lastName');

    if (!bug) {
      return res.status(404).json({
        success: false,
        message: 'Bug not found'
      });
    }

    res.json({
      success: true,
      data: bug
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bug details',
      error: error.message
    });
  }
};

// Assign bug to developer
export const assignBug = async (req, res) => {
  try {
    const { bugId } = req.params;
    const { assignedTo, comments } = req.body;

    const bug = await BugTracker.findById(bugId);
    if (!bug) {
      return res.status(404).json({
        success: false,
        message: 'Bug not found'
      });
    }

    // Check permissions
    const userRole = req.effectiveRole || req.userRole;
    if (!['admin', 'manager', 'tester'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Only admins, managers, and testers can assign bugs'
      });
    }

    // Validate assignee
    const assignee = await User.findById(assignedTo);
    if (!assignee) {
      return res.status(404).json({
        success: false,
        message: 'Assignee not found'
      });
    }

    const oldAssignee = bug.assignedTo;
    bug.assignedTo = assignedTo;
    bug.status = BUG_STATUS.ASSIGNED;
    bug.assignedAt = new Date();

    // Add to status history
    bug.statusHistory.push({
      status: BUG_STATUS.ASSIGNED,
      changedBy: req.user._id,
      changedAt: new Date(),
      reason: `Assigned to ${assignee.firstName} ${assignee.lastName}`,
      comments: comments || ''
    });

    // Add comment if provided
    if (comments) {
      bug.comments.push({
        userId: req.user._id,
        comment: comments,
        createdAt: new Date()
      });
    }

    await bug.save();

    // Log activity
    await ActivityLog.create({
      projectId: bug.projectId,
      entityType: 'bug',
      entityId: bugId,
      userId: req.user._id,
      action: 'assigned',
      actionCategory: 'bug_update',
      description: `Bug assigned to ${assignee.firstName} ${assignee.lastName}`,
      metadata: {
        bugNumber: bug.bugNumber,
        assignedTo,
        oldAssignee
      }
    });

    res.json({
      success: true,
      message: 'Bug assigned successfully',
      data: bug
    });

    emitBugEvent({
      projectId: bug.projectId.toString(),
      userIds: [assignedTo.toString()],
      type: 'bug.assigned',
      data: { bugId: bugId.toString(), assignedTo: assignedTo.toString() }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error assigning bug',
      error: error.message
    });
  }
};

// Update bug status
export const updateBugStatus = async (req, res) => {
  try {
    const { bugId } = req.params;
    const { status, comments, resolution, testingNotes } = req.body;

    const bug = await BugTracker.findById(bugId);
    if (!bug) {
      return res.status(404).json({
        success: false,
        message: 'Bug not found'
      });
    }

    // Check permissions based on status transition
    const userRole = req.effectiveRole || req.userRole;
    const isAssignee = bug.assignedTo?.toString() === req.user._id.toString();
    const canUpdate = ['admin', 'manager'].includes(userRole) || 
                     (isAssignee && ['developer', 'tester'].includes(userRole));

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this bug status'
      });
    }

    // Validate status transitions
    const validTransitions = {
      [BUG_STATUS.OPEN]: [BUG_STATUS.ASSIGNED, BUG_STATUS.CLOSED],
      [BUG_STATUS.ASSIGNED]: [BUG_STATUS.IN_PROGRESS, BUG_STATUS.OPEN, BUG_STATUS.CLOSED],
      [BUG_STATUS.IN_PROGRESS]: [BUG_STATUS.FIXED, BUG_STATUS.ASSIGNED, BUG_STATUS.CLOSED],
      [BUG_STATUS.FIXED]: [BUG_STATUS.CLOSED, BUG_STATUS.IN_PROGRESS],
      [BUG_STATUS.CLOSED]: [BUG_STATUS.OPEN]
    };

    const currentStatus = bug.status;
    const allowedTransitions = validTransitions[currentStatus] || [];

    if (!allowedTransitions.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${currentStatus} to ${status}`,
        allowedTransitions
      });
    }

    const oldStatus = bug.status;
    bug.status = status;

    // Update timestamps based on status
    if (status === BUG_STATUS.IN_PROGRESS && !bug.startedAt) {
      bug.startedAt = new Date();
    } else if (status === BUG_STATUS.FIXED && !bug.fixedAt) {
      bug.fixedAt = new Date();
      bug.resolvedBy = req.user._id;
      if (resolution) {
        bug.resolution = {
          description: resolution,
          resolvedBy: req.user._id,
          resolvedAt: new Date()
        };
      }
    } else if (status === BUG_STATUS.CLOSED && !bug.closedAt) {
      bug.closedAt = new Date();
      if (testingNotes) {
        bug.testingNotes = testingNotes;
      }
    }

    // Add to status history
    bug.statusHistory.push({
      status,
      changedBy: req.user._id,
      changedAt: new Date(),
      reason: `Status changed from ${oldStatus} to ${status}`,
      comments: comments || ''
    });

    // Add comment if provided
    if (comments) {
      bug.comments.push({
        userId: req.user._id,
        comment: comments,
        createdAt: new Date()
      });
    }

    await bug.save();

    // Log activity
    await ActivityLog.create({
      projectId: bug.projectId,
      entityType: 'bug',
      entityId: bugId,
      userId: req.user._id,
      action: 'status_changed',
      actionCategory: 'bug_update',
      description: `Bug status changed from ${oldStatus} to ${status}`,
      metadata: {
        bugNumber: bug.bugNumber,
        oldStatus,
        newStatus: status
      }
    });

    res.json({
      success: true,
      message: 'Bug status updated successfully',
      data: bug
    });

    emitBugEvent({
      projectId: bug.projectId.toString(),
      userIds: [bug.assignedTo, bug.reportedBy].filter(Boolean).map(id => id.toString()),
      type: 'bug.status_updated',
      data: { bugId: bugId.toString(), oldStatus, newStatus: status }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating bug status',
      error: error.message
    });
  }
};

// Add comment to bug
export const addBugComment = async (req, res) => {
  try {
    const { bugId } = req.params;
    const { comment } = req.body;

    if (!comment || comment.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Comment is required'
      });
    }

    const bug = await BugTracker.findById(bugId);
    if (!bug) {
      return res.status(404).json({
        success: false,
        message: 'Bug not found'
      });
    }

    const newComment = {
      userId: req.user._id,
      comment: comment.trim(),
      createdAt: new Date()
    };

    bug.comments.push(newComment);
    await bug.save();

    // Populate the comment with user details for response
    await bug.populate('comments.userId', 'firstName lastName email');
    const addedComment = bug.comments[bug.comments.length - 1];

    // Log activity
    await ActivityLog.create({
      projectId: bug.projectId,
      entityType: 'bug',
      entityId: bugId,
      userId: req.user._id,
      action: 'comment_added',
      actionCategory: 'bug_update',
      description: 'Comment added to bug',
      metadata: {
        bugNumber: bug.bugNumber,
        commentLength: comment.length
      }
    });

    res.json({
      success: true,
      message: 'Comment added successfully',
      data: addedComment
    });

    emitBugEvent({
      projectId: bug.projectId.toString(),
      userIds: [bug.assignedTo, bug.reportedBy].filter(Boolean).map(id => id.toString()),
      type: 'bug.comment_added',
      data: { bugId: bugId.toString(), comment: addedComment }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding comment',
      error: error.message
    });
  }
};

// Update bug priority or severity
export const updateBugPriority = async (req, res) => {
  try {
    const { bugId } = req.params;
    const { priority, severity, reason } = req.body;

    const bug = await BugTracker.findById(bugId);
    if (!bug) {
      return res.status(404).json({
        success: false,
        message: 'Bug not found'
      });
    }

    // Check permissions
    const userRole = req.effectiveRole || req.userRole;
    if (!['admin', 'manager', 'tester'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Only admins, managers, and testers can update bug priority/severity'
      });
    }

    const oldPriority = bug.priority;
    const oldSeverity = bug.severity;

    if (priority) bug.priority = priority;
    if (severity) bug.severity = severity;

    // Add comment about the change
    const changes = [];
    if (priority && priority !== oldPriority) {
      changes.push(`Priority changed from ${oldPriority} to ${priority}`);
    }
    if (severity && severity !== oldSeverity) {
      changes.push(`Severity changed from ${oldSeverity} to ${severity}`);
    }

    if (changes.length > 0) {
      const changeComment = changes.join(', ') + (reason ? `. Reason: ${reason}` : '');
      bug.comments.push({
        userId: req.user._id,
        comment: changeComment,
        createdAt: new Date()
      });
    }

    await bug.save();

    // Log activity
    await ActivityLog.create({
      projectId: bug.projectId,
      entityType: 'bug',
      entityId: bugId,
      userId: req.user._id,
      action: 'priority_updated',
      actionCategory: 'bug_update',
      description: changes.join(', '),
      metadata: {
        bugNumber: bug.bugNumber,
        oldPriority,
        newPriority: priority,
        oldSeverity,
        newSeverity: severity
      }
    });

    res.json({
      success: true,
      message: 'Bug priority/severity updated successfully',
      data: bug
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating bug priority/severity',
      error: error.message
    });
  }
};

// Add/remove watchers
export const updateBugWatchers = async (req, res) => {
  try {
    const { bugId } = req.params;
    const { action, userId } = req.body; // action: 'add' or 'remove'

    const bug = await BugTracker.findById(bugId);
    if (!bug) {
      return res.status(404).json({
        success: false,
        message: 'Bug not found'
      });
    }

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (action === 'add') {
      if (!bug.watchers.includes(userId)) {
        bug.watchers.push(userId);
      }
    } else if (action === 'remove') {
      bug.watchers = bug.watchers.filter(w => w.toString() !== userId);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Action must be "add" or "remove"'
      });
    }

    await bug.save();

    res.json({
      success: true,
      message: `Watcher ${action}ed successfully`,
      data: { watchers: bug.watchers }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating watchers',
      error: error.message
    });
  }
};

// Get bug statistics for a project
export const getBugStatistics = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { timeframe = '1month' } = req.query;

    // Check permissions
    const userRole = req.effectiveRole || req.userRole;
    if (!['admin', 'manager', 'hr', 'tester'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    let dateFilter = {};
    const now = new Date();
    
    switch (timeframe) {
      case '1week':
        dateFilter = { createdAt: { $gte: new Date(now.setDate(now.getDate() - 7)) } };
        break;
      case '1month':
        dateFilter = { createdAt: { $gte: new Date(now.setMonth(now.getMonth() - 1)) } };
        break;
      case '3months':
        dateFilter = { createdAt: { $gte: new Date(now.setMonth(now.getMonth() - 3)) } };
        break;
      case '6months':
        dateFilter = { createdAt: { $gte: new Date(now.setMonth(now.getMonth() - 6)) } };
        break;
    }

    const bugs = await BugTracker.find({ projectId, ...dateFilter })
      .populate('reportedBy', 'firstName lastName')
      .populate('assignedTo', 'firstName lastName')
      .populate('resolvedBy', 'firstName lastName');

    // Calculate statistics
    const stats = {
      total: bugs.length,
      byStatus: {},
      bySeverity: {},
      byPriority: {},
      resolved: bugs.filter(b => b.status === BUG_STATUS.CLOSED).length,
      averageResolutionTime: 0,
      topReporters: {},
      topResolvers: {}
    };

    // Group by status
    Object.values(BUG_STATUS).forEach(status => {
      stats.byStatus[status] = bugs.filter(b => b.status === status).length;
    });

    // Group by severity
    Object.values(BUG_SEVERITY).forEach(severity => {
      stats.bySeverity[severity] = bugs.filter(b => b.severity === severity).length;
    });

    // Group by priority
    Object.values(BUG_PRIORITY).forEach(priority => {
      stats.byPriority[priority] = bugs.filter(b => b.priority === priority).length;
    });

    // Calculate average resolution time
    const resolvedBugs = bugs.filter(b => b.status === BUG_STATUS.CLOSED && b.closedAt);
    if (resolvedBugs.length > 0) {
      const totalResolutionTime = resolvedBugs.reduce((sum, bug) => {
        return sum + (bug.closedAt - bug.createdAt);
      }, 0);
      stats.averageResolutionTime = totalResolutionTime / resolvedBugs.length / (1000 * 60 * 60 * 24); // in days
    }

    // Top reporters
    bugs.forEach(bug => {
      const reporter = `${bug.reportedBy.firstName} ${bug.reportedBy.lastName}`;
      stats.topReporters[reporter] = (stats.topReporters[reporter] || 0) + 1;
    });

    // Top resolvers
    bugs.filter(b => b.resolvedBy).forEach(bug => {
      const resolver = `${bug.resolvedBy.firstName} ${bug.resolvedBy.lastName}`;
      stats.topResolvers[resolver] = (stats.topResolvers[resolver] || 0) + 1;
    });

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bug statistics',
      error: error.message
    });
  }
};

// Get user's assigned bugs
export const getUserAssignedBugs = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, priority, page = 1, limit = 10 } = req.query;

    // Check permissions
    const userRole = req.effectiveRole || req.userRole;
    const isOwnBugs = userId === req.user._id.toString();
    const canView = ['admin', 'hr', 'manager'].includes(userRole) || isOwnBugs;

    if (!canView) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const filter = { assignedTo: userId };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const bugs = await BugTracker.find(filter)
      .populate('projectId', 'name')
      .populate('reportedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await BugTracker.countDocuments(filter);

    res.json({
      success: true,
      data: {
        bugs,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalBugs: total
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching assigned bugs',
      error: error.message
    });
  }
};
