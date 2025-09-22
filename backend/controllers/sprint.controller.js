// sprint.controller.js - Sprint Management Controller
import { Sprint, Project, User, ActivityLog, SPRINT_STATUS, ASSIGNMENT_STATUS, USER_ROLES, ACTION_CATEGORIES } from '../models/index.js';
import mongoose from 'mongoose';

// Create a new sprint
export const createSprint = async (req, res) => {
  try {
    const {
      projectId,
      name,
      description,
      startDate,
      endDate,
      goals,
      assignedDevelopers,
      assignedTesters,
      sprintCapacity
    } = req.body;

    // Validate required fields
    if (!projectId || !name || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Project ID, name, start date, and end date are required'
      });
    }

    // Check if user has permission to create sprint for this project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user is project manager or admin
    const userRole = req.effectiveRole || req.userRole;
    if (!['admin', 'manager'].includes(userRole) && 
        project.projectManager.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only project managers and admins can create sprints'
      });
    }

    // Get next sprint number for this project
    const existingSprints = await Sprint.find({ projectId }).sort({ sprintNumber: -1 }).limit(1);
    const sprintNumber = existingSprints.length > 0 ? existingSprints[0].sprintNumber + 1 : 1;

    // Resolve sprint master (required by schema)
    const providedSprintMaster = req.body?.sprintMaster;
    const resolvedSprintMaster = providedSprintMaster || project.projectManager || req.user?._id;

    if (!resolvedSprintMaster) {
      return res.status(400).json({
        success: false,
        message: 'Sprint master could not be resolved. Provide sprintMaster explicitly or ensure the project has a projectManager.'
      });
    }

    const sprintMasterId = new mongoose.Types.ObjectId(resolvedSprintMaster);

    const sprint = new Sprint({
      projectId,
      name,
      description,
      sprintNumber,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      // Required by schema: person managing this sprint (usually the project manager)
      sprintMaster: sprintMasterId,
      goals: goals || [],
      status: SPRINT_STATUS.PLANNING,
      createdBy: req.user._id,
      assignedDevelopers: assignedDevelopers || [],
      assignedTesters: assignedTesters || [],
      sprintCapacity: sprintCapacity || {
        totalStoryPoints: 0,
        totalHours: 0,
        availableDevelopers: assignedDevelopers?.length || 0,
        availableTesters: assignedTesters?.length || 0
      }
    });

    await sprint.save();

    // Update project's current sprint if this is the first active sprint
    if (!project.currentSprintId) {
      project.currentSprintId = sprint._id;
      await project.save();
    }

    // Log activity
    await ActivityLog.create({
      projectId,
      entityType: 'sprint',
      entityId: sprint._id,
      userId: req.user._id,
      action: 'created',
      actionCategory: ACTION_CATEGORIES.SPRINT_PLANNING,
      description: `Sprint "${name}" created`,
      metadata: {
        sprintNumber,
        startDate,
        endDate
      }
    });

    res.status(201).json({
      success: true,
      message: 'Sprint created successfully',
      data: sprint
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating sprint',
      error: error.message
    });
  }
};

// Get all sprints for a project
export const getProjectSprints = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { projectId };
    if (status) filter.status = status;

    const sprints = await Sprint.find(filter)
      .populate('createdBy', 'firstName lastName')
      .populate('assignedDevelopers', 'firstName lastName email')
      .populate('assignedTesters', 'firstName lastName email')
      .sort({ sprintNumber: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Sprint.countDocuments(filter);

    res.json({
      success: true,
      data: {
        sprints,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalSprints: total
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching sprints',
      error: error.message
    });
  }
};

// Get specific sprint details
export const getSprint = async (req, res) => {
  try {
    const { sprintId } = req.params;

    const sprint = await Sprint.findById(sprintId)
      .populate('projectId', 'name description')
      .populate('createdBy', 'firstName lastName')
      .populate('assignedDevelopers', 'firstName lastName email role')
      .populate('assignedTesters', 'firstName lastName email role')
      .populate('assignments.assignedTo', 'firstName lastName email role')
      .populate('assignments.assignedBy', 'firstName lastName');

    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: 'Sprint not found'
      });
    }

    res.json({
      success: true,
      data: sprint
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching sprint',
      error: error.message
    });
  }
};

// Assign ticket to user in sprint
export const assignTicketToUser = async (req, res) => {
  try {
    const { sprintId } = req.params;
    const { ticketId, assignedTo, estimatedHours, storyPoints, priority } = req.body;

    const sprint = await Sprint.findById(sprintId);
    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: 'Sprint not found'
      });
    }

    // Check if user can assign tickets
    const userRole = req.effectiveRole || req.userRole;
    if (!['admin', 'manager'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Only managers and admins can assign tickets'
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

    // Check if ticket is already assigned in this sprint
    const existingAssignment = sprint.assignments.find(a => a.ticketId.toString() === ticketId);
    if (existingAssignment) {
      return res.status(400).json({
        success: false,
        message: 'Ticket is already assigned in this sprint'
      });
    }

    // Create assignment
    const assignment = {
      ticketId: new mongoose.Types.ObjectId(ticketId),
      assignedTo: new mongoose.Types.ObjectId(assignedTo),
      assignedBy: req.user._id,
      assigneeRole: assignee.role,
      assignmentStatus: ASSIGNMENT_STATUS.ASSIGNED,
      estimatedHours: estimatedHours || 0,
      storyPoints: storyPoints || 0,
      priority: priority || 'medium',
      assignedAt: new Date()
    };

    sprint.assignments.push(assignment);

    // Update sprint metrics
    sprint.metrics.totalTickets = sprint.assignments.length;
    sprint.sprintCapacity.totalStoryPoints += storyPoints || 0;
    sprint.sprintCapacity.totalHours += estimatedHours || 0;

    await sprint.save();

    // Update user's assigned tickets
    await User.findByIdAndUpdate(assignedTo, {
      $push: {
        assignedTickets: {
          projectId: sprint.projectId,
          ticketId: ticketId,
          sprintId: sprintId
        }
      }
    });

    // Log activity
    await ActivityLog.create({
      projectId: sprint.projectId,
      entityType: 'sprint',
      entityId: sprintId,
      userId: req.user._id,
      action: 'ticket_assigned',
      actionCategory: ACTION_CATEGORIES.SPRINT_PLANNING,
      description: `Ticket assigned to ${assignee.firstName} ${assignee.lastName}`,
      metadata: {
        ticketId,
        assignedTo,
        assigneeRole: assignee.role,
        estimatedHours,
        storyPoints
      }
    });

    res.json({
      success: true,
      message: 'Ticket assigned successfully',
      data: assignment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error assigning ticket',
      error: error.message
    });
  }
};

// Update assignment status
export const updateAssignmentStatus = async (req, res) => {
  try {
    const { sprintId, assignmentId } = req.params;
    const { status, actualHours, comments } = req.body;

    const sprint = await Sprint.findById(sprintId);
    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: 'Sprint not found'
      });
    }

    const assignment = sprint.assignments.id(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Check if user can update assignment
    const userRole = req.effectiveRole || req.userRole;
    const isAssignee = assignment.assignedTo.toString() === req.user._id.toString();
    const canUpdate = ['admin', 'manager'].includes(userRole) || isAssignee;

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own assignments'
      });
    }

    const oldStatus = assignment.assignmentStatus;
    assignment.assignmentStatus = status;
    
    if (actualHours !== undefined) {
      assignment.actualHours = actualHours;
    }

    if (comments) {
      assignment.comments.push({
        userId: req.user._id,
        comment: comments,
        createdAt: new Date()
      });
    }

    // Update timestamps based on status
    if (status === ASSIGNMENT_STATUS.IN_PROGRESS && !assignment.startedAt) {
      assignment.startedAt = new Date();
    } else if (status === ASSIGNMENT_STATUS.COMPLETED && !assignment.completedAt) {
      assignment.completedAt = new Date();
    }

    // Update sprint metrics
    const completedCount = sprint.assignments.filter(a => a.assignmentStatus === ASSIGNMENT_STATUS.COMPLETED).length;
    const inProgressCount = sprint.assignments.filter(a => a.assignmentStatus === ASSIGNMENT_STATUS.IN_PROGRESS).length;
    const blockedCount = sprint.assignments.filter(a => a.assignmentStatus === ASSIGNMENT_STATUS.BLOCKED).length;

    sprint.metrics.completedTickets = completedCount;
    sprint.metrics.inProgressTickets = inProgressCount;
    sprint.metrics.blockedTickets = blockedCount;

    await sprint.save();

    // Log activity
    await ActivityLog.create({
      projectId: sprint.projectId,
      entityType: 'sprint',
      entityId: sprintId,
      userId: req.user._id,
      action: 'assignment_updated',
      actionCategory: ACTION_CATEGORIES.SPRINT_PLANNING,
      description: `Assignment status changed from ${oldStatus} to ${status}`,
      metadata: {
        assignmentId,
        oldStatus,
        newStatus: status,
        actualHours
      }
    });

    res.json({
      success: true,
      message: 'Assignment status updated successfully',
      data: assignment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating assignment status',
      error: error.message
    });
  }
};

// Get sprint board for specific user/role
export const getSprintBoard = async (req, res) => {
  try {
    const { sprintId } = req.params;
    const { userId, role } = req.query;

    const sprint = await Sprint.findById(sprintId)
      .populate('assignments.assignedTo', 'firstName lastName email role')
      .populate('assignments.assignedBy', 'firstName lastName');

    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: 'Sprint not found'
      });
    }

    let assignments = sprint.assignments;

    // Filter assignments based on role or user
    if (userId) {
      assignments = assignments.filter(a => a.assignedTo._id.toString() === userId);
    } else if (role) {
      assignments = assignments.filter(a => a.assigneeRole === role);
    }

    // Group assignments by status for board view
    const board = {
      assigned: assignments.filter(a => a.assignmentStatus === ASSIGNMENT_STATUS.ASSIGNED),
      inProgress: assignments.filter(a => a.assignmentStatus === ASSIGNMENT_STATUS.IN_PROGRESS),
      completed: assignments.filter(a => a.assignmentStatus === ASSIGNMENT_STATUS.COMPLETED),
      blocked: assignments.filter(a => a.assignmentStatus === ASSIGNMENT_STATUS.BLOCKED)
    };

    // Calculate board statistics
    const stats = {
      total: assignments.length,
      assigned: board.assigned.length,
      inProgress: board.inProgress.length,
      completed: board.completed.length,
      blocked: board.blocked.length,
      completionRate: assignments.length > 0 ? (board.completed.length / assignments.length * 100).toFixed(2) : 0
    };

    res.json({
      success: true,
      data: {
        sprint: {
          _id: sprint._id,
          name: sprint.name,
          sprintNumber: sprint.sprintNumber,
          status: sprint.status,
          startDate: sprint.startDate,
          endDate: sprint.endDate
        },
        board,
        stats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching sprint board',
      error: error.message
    });
  }
};

// Start sprint
export const startSprint = async (req, res) => {
  try {
    const { sprintId } = req.params;

    const sprint = await Sprint.findById(sprintId);
    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: 'Sprint not found'
      });
    }

    // Check permissions
    const userRole = req.effectiveRole || req.userRole;
    if (!['admin', 'manager'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Only managers and admins can start sprints'
      });
    }

    if (sprint.status !== SPRINT_STATUS.PLANNING) {
      return res.status(400).json({
        success: false,
        message: 'Sprint can only be started from planning status'
      });
    }

    sprint.status = SPRINT_STATUS.ACTIVE;
    sprint.actualStartDate = new Date();
    await sprint.save();

    // Update project's current sprint
    await Project.findByIdAndUpdate(sprint.projectId, {
      currentSprintId: sprintId
    });

    // Log activity
    await ActivityLog.create({
      projectId: sprint.projectId,
      entityType: 'sprint',
      entityId: sprintId,
      userId: req.user._id,
      action: 'started',
      actionCategory: ACTION_CATEGORIES.SPRINT_PLANNING,
      description: `Sprint "${sprint.name}" started`,
      metadata: {
        sprintNumber: sprint.sprintNumber
      }
    });

    res.json({
      success: true,
      message: 'Sprint started successfully',
      data: sprint
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error starting sprint',
      error: error.message
    });
  }
};

// Complete sprint
export const completeSprint = async (req, res) => {
  try {
    const { sprintId } = req.params;
    const { retrospectiveNotes, achievements, improvements } = req.body;

    const sprint = await Sprint.findById(sprintId);
    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: 'Sprint not found'
      });
    }

    // Check permissions
    const userRole = req.effectiveRole || req.userRole;
    if (!['admin', 'manager'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Only managers and admins can complete sprints'
      });
    }

    if (sprint.status !== SPRINT_STATUS.ACTIVE) {
      return res.status(400).json({
        success: false,
        message: 'Only active sprints can be completed'
      });
    }

    sprint.status = SPRINT_STATUS.COMPLETED;
    sprint.actualEndDate = new Date();

    // Add retrospective data
    if (retrospectiveNotes || achievements || improvements) {
      sprint.retrospective = {
        notes: retrospectiveNotes || '',
        achievements: achievements || [],
        improvements: improvements || [],
        conductedBy: req.user._id,
        conductedAt: new Date()
      };
    }

    // Calculate final metrics
    const completedAssignments = sprint.assignments.filter(a => a.assignmentStatus === ASSIGNMENT_STATUS.COMPLETED);
    const totalStoryPointsCompleted = completedAssignments.reduce((sum, a) => sum + (a.storyPoints || 0), 0);
    const totalHoursSpent = sprint.assignments.reduce((sum, a) => sum + (a.actualHours || 0), 0);

    sprint.metrics.completedStoryPoints = totalStoryPointsCompleted;
    sprint.metrics.totalHoursSpent = totalHoursSpent;
    sprint.metrics.velocity = totalStoryPointsCompleted;

    await sprint.save();

    // Clear project's current sprint if this was the current one
    const project = await Project.findById(sprint.projectId);
    if (project.currentSprintId?.toString() === sprintId) {
      project.currentSprintId = null;
      await project.save();
    }

    // Log activity
    await ActivityLog.create({
      projectId: sprint.projectId,
      entityType: 'sprint',
      entityId: sprintId,
      userId: req.user._id,
      action: 'completed',
      actionCategory: ACTION_CATEGORIES.SPRINT_PLANNING,
      description: `Sprint "${sprint.name}" completed`,
      metadata: {
        sprintNumber: sprint.sprintNumber,
        completedStoryPoints: totalStoryPointsCompleted,
        totalHoursSpent
      }
    });

    res.json({
      success: true,
      message: 'Sprint completed successfully',
      data: sprint
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error completing sprint',
      error: error.message
    });
  }
};

// Get user's sprint assignments
export const getUserSprintAssignments = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, projectId } = req.query;

    // Check if user can view assignments
    const userRole = req.effectiveRole || req.userRole;
    const isOwnAssignments = userId === req.user._id.toString();
    const canView = ['admin', 'hr', 'manager'].includes(userRole) || isOwnAssignments;

    if (!canView) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const filter = { 'assignments.assignedTo': userId };
    if (projectId) filter.projectId = projectId;

    const sprints = await Sprint.find(filter)
      .populate('projectId', 'name')
      .populate('assignments.assignedTo', 'firstName lastName email')
      .sort({ sprintNumber: -1 });

    // Extract and filter assignments
    let assignments = [];
    sprints.forEach(sprint => {
      const userAssignments = sprint.assignments.filter(a => 
        a.assignedTo._id.toString() === userId &&
        (!status || a.assignmentStatus === status)
      );
      
      userAssignments.forEach(assignment => {
        assignments.push({
          ...assignment.toObject(),
          sprint: {
            _id: sprint._id,
            name: sprint.name,
            sprintNumber: sprint.sprintNumber,
            status: sprint.status,
            projectName: sprint.projectId.name
          }
        });
      });
    });

    res.json({
      success: true,
      data: assignments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user assignments',
      error: error.message
    });
  }
};

// Get sprint analytics
export const getSprintAnalytics = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { timeframe = '3months' } = req.query;

    // Check permissions
    const userRole = req.effectiveRole || req.userRole;
    if (!['admin', 'manager', 'hr'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    let dateFilter = {};
    const now = new Date();
    
    switch (timeframe) {
      case '1month':
        dateFilter = { createdAt: { $gte: new Date(now.setMonth(now.getMonth() - 1)) } };
        break;
      case '3months':
        dateFilter = { createdAt: { $gte: new Date(now.setMonth(now.getMonth() - 3)) } };
        break;
      case '6months':
        dateFilter = { createdAt: { $gte: new Date(now.setMonth(now.getMonth() - 6)) } };
        break;
      case '1year':
        dateFilter = { createdAt: { $gte: new Date(now.setFullYear(now.getFullYear() - 1)) } };
        break;
    }

    const sprints = await Sprint.find({ projectId, ...dateFilter })
      .populate('assignments.assignedTo', 'firstName lastName role')
      .sort({ sprintNumber: -1 });

    // Calculate analytics
    const analytics = {
      totalSprints: sprints.length,
      completedSprints: sprints.filter(s => s.status === SPRINT_STATUS.COMPLETED).length,
      activeSprints: sprints.filter(s => s.status === SPRINT_STATUS.ACTIVE).length,
      averageVelocity: 0,
      totalStoryPoints: 0,
      averageSprintDuration: 0,
      teamPerformance: {},
      sprintTrends: []
    };

    if (sprints.length > 0) {
      const completedSprints = sprints.filter(s => s.status === SPRINT_STATUS.COMPLETED);
      
      if (completedSprints.length > 0) {
        analytics.averageVelocity = completedSprints.reduce((sum, s) => sum + (s.metrics.velocity || 0), 0) / completedSprints.length;
        analytics.totalStoryPoints = completedSprints.reduce((sum, s) => sum + (s.metrics.completedStoryPoints || 0), 0);
        
        const totalDuration = completedSprints.reduce((sum, s) => {
          if (s.actualStartDate && s.actualEndDate) {
            return sum + (s.actualEndDate - s.actualStartDate);
          }
          return sum;
        }, 0);
        analytics.averageSprintDuration = totalDuration / completedSprints.length / (1000 * 60 * 60 * 24); // in days
      }

      // Team performance analysis
      const teamStats = {};
      sprints.forEach(sprint => {
        sprint.assignments.forEach(assignment => {
          const userId = assignment.assignedTo._id.toString();
          const userName = `${assignment.assignedTo.firstName} ${assignment.assignedTo.lastName}`;
          
          if (!teamStats[userId]) {
            teamStats[userId] = {
              name: userName,
              role: assignment.assignedTo.role,
              totalAssignments: 0,
              completedAssignments: 0,
              totalStoryPoints: 0,
              completedStoryPoints: 0
            };
          }
          
          teamStats[userId].totalAssignments++;
          teamStats[userId].totalStoryPoints += assignment.storyPoints || 0;
          
          if (assignment.assignmentStatus === ASSIGNMENT_STATUS.COMPLETED) {
            teamStats[userId].completedAssignments++;
            teamStats[userId].completedStoryPoints += assignment.storyPoints || 0;
          }
        });
      });

      analytics.teamPerformance = Object.values(teamStats);

      // Sprint trends (last 6 sprints)
      analytics.sprintTrends = sprints.slice(0, 6).map(sprint => ({
        sprintNumber: sprint.sprintNumber,
        name: sprint.name,
        velocity: sprint.metrics.velocity || 0,
        completedStoryPoints: sprint.metrics.completedStoryPoints || 0,
        totalAssignments: sprint.assignments.length,
        completedAssignments: sprint.assignments.filter(a => a.assignmentStatus === ASSIGNMENT_STATUS.COMPLETED).length
      }));
    }

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching sprint analytics',
      error: error.message
    });
  }
};
