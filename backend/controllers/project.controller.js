// project.controller.js - Project Management Controller
import { Project, User, ActivityLog, PROJECT_STATUS, TICKET_STATUS, TICKET_PRIORITIES } from '../models/index.js';
import mongoose from 'mongoose';

// Create a new project
export const createProject = async (req, res) => {
  try {
    const {
      name,
      description,
      startDate,
      endDate,
      projectManager,
      teamMembers,
      modules
    } = req.body;

    // Validate required fields
    if (!name || !description || !startDate || !projectManager) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, start date, and project manager are required'
      });
    }

    // Check permissions - only admin and managers can create projects
    const userRole = req.effectiveRole || req.userRole;
    if (!['admin', 'manager'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Only admins and managers can create projects'
      });
    }

    // Validate project manager exists
    const manager = await User.findById(projectManager);
    if (!manager) {
      return res.status(404).json({
        success: false,
        message: 'Project manager not found'
      });
    }

    // Validate team members if provided
    if (teamMembers && teamMembers.length > 0) {
      const members = await User.find({ _id: { $in: teamMembers } });
      if (members.length !== teamMembers.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more team members not found'
        });
      }
    }

    const project = new Project({
      name,
      description,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      status: PROJECT_STATUS.PLANNING,
      projectManager,
      teamMembers: teamMembers || [],
      modules: modules || [],
      createdBy: req.user._id
    });

    await project.save();

    // Log activity
    await ActivityLog.create({
      projectId: project._id,
      entityType: 'project',
      entityId: project._id,
      userId: req.user._id,
      action: 'created',
      actionCategory: 'project_update',
      description: `Project "${name}" created`,
      metadata: {
        projectManager,
        teamSize: teamMembers?.length || 0
      }
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating project',
      error: error.message
    });
  }
};

// Get all projects with filtering and pagination
export const getProjects = async (req, res) => {
  try {
    const { 
      status, 
      projectManager, 
      page = 1, 
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter based on user role and permissions
    const userRole = req.effectiveRole || req.userRole;
    let filter = {};

    if (!['admin', 'hr'].includes(userRole)) {
      // Non-admin users can only see projects they're involved in
      filter.$or = [
        { projectManager: req.user._id },
        { teamMembers: req.user._id }
      ];
    }

    if (status) filter.status = status;
    if (projectManager) filter.projectManager = projectManager;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const projects = await Project.find(filter)
      .populate('projectManager', 'firstName lastName email')
      .populate('teamMembers', 'firstName lastName email role')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Project.countDocuments(filter);

    res.json({
      success: true,
      data: {
        projects,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalProjects: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching projects',
      error: error.message
    });
  }
};

// Get specific project details
export const getProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId)
      .populate('projectManager', 'firstName lastName email role')
      .populate('teamMembers', 'firstName lastName email role')
      .populate('modules.tickets.assignedDeveloper', 'firstName lastName email')
      .populate('modules.tickets.tester', 'firstName lastName email');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check access permissions
    const userRole = req.effectiveRole || req.userRole;
    const hasAccess = ['admin', 'hr'].includes(userRole) ||
                     project.projectManager._id.toString() === req.user._id.toString() ||
                     project.teamMembers.some(member => member._id.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this project'
      });
    }

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching project',
      error: error.message
    });
  }
};

// Update project details
export const updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const updates = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check permissions
    const userRole = req.effectiveRole || req.userRole;
    const canUpdate = ['admin'].includes(userRole) ||
                     project.projectManager.toString() === req.user._id.toString();

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'Only admins and project managers can update projects'
      });
    }

    // Update allowed fields
    const allowedUpdates = ['name', 'description', 'endDate', 'status', 'teamMembers'];
    const updateData = {};
    
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    });

    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate);
    }

    Object.assign(project, updateData);
    await project.save();

    // Log activity
    await ActivityLog.create({
      projectId,
      entityType: 'project',
      entityId: projectId,
      userId: req.user._id,
      action: 'updated',
      actionCategory: 'project_update',
      description: `Project "${project.name}" updated`,
      metadata: {
        updatedFields: Object.keys(updateData)
      }
    });

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating project',
      error: error.message
    });
  }
};

// Add module to project
export const addModule = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, description, estimatedHours, priority } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Module name is required'
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check permissions
    const userRole = req.effectiveRole || req.userRole;
    const canAdd = ['admin', 'manager'].includes(userRole) ||
                  project.projectManager.toString() === req.user._id.toString();

    if (!canAdd) {
      return res.status(403).json({
        success: false,
        message: 'Only admins, managers, and project managers can add modules'
      });
    }

    const newModule = {
      name,
      description: description || '',
      estimatedHours: estimatedHours || 0,
      priority: priority || 'medium',
      status: 'planning',
      tickets: []
    };

    project.modules.push(newModule);
    await project.save();

    const addedModule = project.modules[project.modules.length - 1];

    // Log activity
    await ActivityLog.create({
      projectId,
      entityType: 'module',
      entityId: addedModule._id,
      userId: req.user._id,
      action: 'created',
      actionCategory: 'project_update',
      description: `Module "${name}" added to project`,
      metadata: {
        moduleName: name,
        estimatedHours
      }
    });

    res.status(201).json({
      success: true,
      message: 'Module added successfully',
      data: addedModule
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding module',
      error: error.message
    });
  }
};

// Update module
export const updateModule = async (req, res) => {
  try {
    const { projectId, moduleId } = req.params;
    const updates = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const module = project.modules.id(moduleId);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    // Check permissions
    const userRole = req.effectiveRole || req.userRole;
    const canUpdate = ['admin', 'manager'].includes(userRole) ||
                     project.projectManager.toString() === req.user._id.toString();

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'Only admins, managers, and project managers can update modules'
      });
    }

    // Update allowed fields
    const allowedUpdates = ['name', 'description', 'estimatedHours', 'priority', 'status'];
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        module[field] = updates[field];
      }
    });

    await project.save();

    // Log activity
    await ActivityLog.create({
      projectId,
      entityType: 'module',
      entityId: moduleId,
      userId: req.user._id,
      action: 'updated',
      actionCategory: 'project_update',
      description: `Module "${module.name}" updated`,
      metadata: {
        updatedFields: Object.keys(updates)
      }
    });

    res.json({
      success: true,
      message: 'Module updated successfully',
      data: module
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating module',
      error: error.message
    });
  }
};

// Add ticket to module
export const addTicket = async (req, res) => {
  try {
    const { projectId, moduleId } = req.params;
    const {
      title,
      description,
      priority,
      estimatedHours,
      assignedDeveloper,
      tester,
      dueDate
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required'
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const module = project.modules.id(moduleId);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    // Check permissions
    const userRole = req.effectiveRole || req.userRole;
    const canAdd = ['admin', 'manager'].includes(userRole) ||
                  project.projectManager.toString() === req.user._id.toString();

    if (!canAdd) {
      return res.status(403).json({
        success: false,
        message: 'Only admins, managers, and project managers can add tickets'
      });
    }

    // Generate ticket number
    const totalTickets = project.modules.reduce((sum, mod) => sum + mod.tickets.length, 0);
    const ticketNumber = `${project.name.substring(0, 3).toUpperCase()}-${String(totalTickets + 1).padStart(4, '0')}`;

    const newTicket = {
      ticketNumber,
      title,
      description,
      priority: priority || TICKET_PRIORITIES.MEDIUM,
      status: TICKET_STATUS.OPEN,
      estimatedHours: estimatedHours || 0,
      assignedDeveloper: assignedDeveloper || null,
      tester: tester || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      createdBy: req.user._id,
      comments: []
    };

    module.tickets.push(newTicket);
    await project.save();

    const addedTicket = module.tickets[module.tickets.length - 1];

    // Log activity
    await ActivityLog.create({
      projectId,
      entityType: 'ticket',
      entityId: addedTicket._id,
      userId: req.user._id,
      action: 'created',
      actionCategory: 'project_update',
      description: `Ticket "${title}" created`,
      metadata: {
        ticketNumber,
        moduleId,
        priority,
        assignedDeveloper,
        tester
      }
    });

    res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      data: addedTicket
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating ticket',
      error: error.message
    });
  }
};

// Update ticket
export const updateTicket = async (req, res) => {
  try {
    const { projectId, moduleId, ticketId } = req.params;
    const updates = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const module = project.modules.id(moduleId);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    const ticket = module.tickets.id(ticketId);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check permissions
    const userRole = req.effectiveRole || req.userRole;
    const isAssigned = ticket.assignedDeveloper?.toString() === req.user._id.toString() ||
                      ticket.tester?.toString() === req.user._id.toString();
    const canUpdate = ['admin', 'manager'].includes(userRole) ||
                     project.projectManager.toString() === req.user._id.toString() ||
                     isAssigned;

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this ticket'
      });
    }

    // Update allowed fields
    const allowedUpdates = ['title', 'description', 'priority', 'status', 'estimatedHours', 'actualHours', 'assignedDeveloper', 'tester', 'dueDate'];
    const oldValues = {};
    
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        oldValues[field] = ticket[field];
        if (field === 'dueDate' && updates[field]) {
          ticket[field] = new Date(updates[field]);
        } else {
          ticket[field] = updates[field];
        }
      }
    });

    // Update timestamps based on status
    if (updates.status) {
      if (updates.status === TICKET_STATUS.IN_PROGRESS && !ticket.startedAt) {
        ticket.startedAt = new Date();
      } else if (updates.status === TICKET_STATUS.DONE && !ticket.completedAt) {
        ticket.completedAt = new Date();
      }
    }

    await project.save();

    // Log activity
    await ActivityLog.create({
      projectId,
      entityType: 'ticket',
      entityId: ticketId,
      userId: req.user._id,
      action: 'updated',
      actionCategory: 'project_update',
      description: `Ticket "${ticket.title}" updated`,
      metadata: {
        ticketNumber: ticket.ticketNumber,
        updatedFields: Object.keys(updates),
        oldValues,
        newValues: updates
      }
    });

    res.json({
      success: true,
      message: 'Ticket updated successfully',
      data: ticket
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating ticket',
      error: error.message
    });
  }
};

// Add comment to ticket
export const addTicketComment = async (req, res) => {
  try {
    const { projectId, moduleId, ticketId } = req.params;
    const { comment } = req.body;

    if (!comment || comment.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Comment is required'
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const module = project.modules.id(moduleId);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    const ticket = module.tickets.id(ticketId);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    const newComment = {
      userId: req.user._id,
      comment: comment.trim(),
      createdAt: new Date()
    };

    ticket.comments.push(newComment);
    await project.save();

    // Log activity
    await ActivityLog.create({
      projectId,
      entityType: 'ticket',
      entityId: ticketId,
      userId: req.user._id,
      action: 'comment_added',
      actionCategory: 'project_update',
      description: 'Comment added to ticket',
      metadata: {
        ticketNumber: ticket.ticketNumber,
        commentLength: comment.length
      }
    });

    res.json({
      success: true,
      message: 'Comment added successfully',
      data: newComment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding comment',
      error: error.message
    });
  }
};

// Get user's assigned tickets across all projects
export const getUserAssignedTickets = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, priority, page = 1, limit = 20 } = req.query;

    // Check permissions
    const userRole = req.effectiveRole || req.userRole;
    const isOwnTickets = userId === req.user._id.toString();
    const canView = ['admin', 'hr', 'manager'].includes(userRole) || isOwnTickets;

    if (!canView) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const matchStage = {
      $or: [
        { 'modules.tickets.assignedDeveloper': new mongoose.Types.ObjectId(userId) },
        { 'modules.tickets.tester': new mongoose.Types.ObjectId(userId) }
      ]
    };

    const pipeline = [
      { $match: matchStage },
      { $unwind: '$modules' },
      { $unwind: '$modules.tickets' },
      {
        $match: {
          $or: [
            { 'modules.tickets.assignedDeveloper': new mongoose.Types.ObjectId(userId) },
            { 'modules.tickets.tester': new mongoose.Types.ObjectId(userId) }
          ]
        }
      }
    ];

    // Add status filter if provided
    if (status) {
      pipeline.push({ $match: { 'modules.tickets.status': status } });
    }

    // Add priority filter if provided
    if (priority) {
      pipeline.push({ $match: { 'modules.tickets.priority': priority } });
    }

    pipeline.push(
      {
        $project: {
          projectId: '$_id',
          projectName: '$name',
          moduleId: '$modules._id',
          moduleName: '$modules.name',
          ticket: '$modules.tickets'
        }
      },
      { $sort: { 'ticket.createdAt': -1 } },
      { $skip: (page - 1) * limit },
      { $limit: parseInt(limit) }
    );

    const tickets = await Project.aggregate(pipeline);

    // Get total count
    const countPipeline = [
      { $match: matchStage },
      { $unwind: '$modules' },
      { $unwind: '$modules.tickets' },
      {
        $match: {
          $or: [
            { 'modules.tickets.assignedDeveloper': new mongoose.Types.ObjectId(userId) },
            { 'modules.tickets.tester': new mongoose.Types.ObjectId(userId) }
          ]
        }
      }
    ];

    if (status) {
      countPipeline.push({ $match: { 'modules.tickets.status': status } });
    }
    if (priority) {
      countPipeline.push({ $match: { 'modules.tickets.priority': priority } });
    }

    countPipeline.push({ $count: 'total' });
    const countResult = await Project.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    res.json({
      success: true,
      data: {
        tickets,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalTickets: total
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching assigned tickets',
      error: error.message
    });
  }
};

// Delete project (admin only)
export const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Check permissions - only admin can delete projects
    const userRole = req.effectiveRole || req.userRole;
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can delete projects'
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    await Project.findByIdAndDelete(projectId);

    // Log activity
    await ActivityLog.create({
      projectId,
      entityType: 'project',
      entityId: projectId,
      userId: req.user._id,
      action: 'deleted',
      actionCategory: 'project_update',
      description: `Project "${project.name}" deleted`,
      metadata: {
        projectName: project.name
      }
    });

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting project',
      error: error.message
    });
  }
};
