// ticket.controller.js - Ticket Management Controller
import mongoose from 'mongoose';
import { 
  TICKET_STATUS, TICKET_TYPES, TICKET_PRIORITIES,
  Project, PROJECT_STATUS,
  MODULE_STATUS,
  User, USER_ROLES
} from '../models/index.js';
import { emitTicketEvent } from '../utils/realtime.js';

// Create a new ticket
export const createTicket = async (req, res) => {
  const {
    title,
    description,
    type,
    priority,
    projectId,
    moduleId,
    assignedDeveloper,
    tester,
    estimatedHours,
    storyPoints,
    dueDate,
    tags
  } = req.body;
  
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    // Check if user has permission to create tickets
    if (!['admin', 'lead', 'manager'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Only admins, leads, and managers can create tickets'
      });
    }

    // Validate project exists and user has access
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user is project manager or admin
    if (userRole !== 'admin' && project.projectManager.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only create tickets for projects you manage'
      });
    }

    // Validate module exists and belongs to project (if moduleId provided)
    if (moduleId) {
      const module = project.modules.id(moduleId);
      if (!module) {
        return res.status(404).json({
          success: false,
          message: 'Module not found or does not belong to the specified project'
        });
      }
    }

    // Validate assigned developer exists and has developer role
    if (assignedDeveloper) {
      const developer = await User.findById(assignedDeveloper);
      if (!developer || developer.role !== 'developer') {
        return res.status(400).json({
          success: false,
          message: 'Assigned developer must be a valid developer user'
        });
      }
    }

    // Validate tester exists and has tester role
    if (tester) {
      const testerUser = await User.findById(tester);
      if (!testerUser || testerUser.role !== 'tester') {
        return res.status(400).json({
          success: false,
          message: 'Tester must be a valid tester user'
        });
      }
    }

    // Generate unique ticket number
    const projectCode = project.name.substring(0, 3).toUpperCase();
    let totalTicketCount = 0;
    
    // Count total tickets across all modules
    project.modules.forEach(module => {
      totalTicketCount += module.tickets.length;
    });
    
    const ticketNumber = `${projectCode}-${String(totalTicketCount + 1).padStart(3, '0')}`;

    // Create new ticket object
    const newTicket = {
      ticketNumber,
      title,
      description,
      type,
      priority,
      assignedDeveloper,
      tester,
      estimatedHours,
      storyPoints,
      dueDate,
      tags,
      moduleId,
      status: TICKET_STATUS.OPEN,
      comments: [],
      attachments: []
    };

    // Add ticket to the specified module or create a default module if none specified
    if (moduleId) {
      const module = project.modules.id(moduleId);
      if (module) {
        module.tickets.push(newTicket);
      } else {
        return res.status(404).json({
          success: false,
          message: 'Module not found'
        });
      }
    } else {
      // If no module specified, create a default module or add to first available module
      if (project.modules.length === 0) {
        // Create a default module
        project.modules.push({
          name: 'Default Module',
          description: 'Default module for tickets without specific module assignment',
          moduleLead: project.projectManager,
          tickets: [newTicket]
        });
      } else {
        // Add to first available module
        project.modules[0].tickets.push(newTicket);
      }
    }
    
    await project.save();

    // Find the created ticket
    let createdTicket = null;
    if (moduleId) {
      const module = project.modules.id(moduleId);
      createdTicket = module.tickets[module.tickets.length - 1];
    } else {
      const module = project.modules[project.modules.length - 1];
      createdTicket = module.tickets[module.tickets.length - 1];
    }

    // Emit realtime event for ticket creation (notify project members and assignees)
    emitTicketEvent({
      projectId: project._id.toString(),
      userIds: [assignedDeveloper, project.projectManager].filter(Boolean).map(id => id.toString()),
      type: 'ticket.created',
      data: { ticket: createdTicket, projectId: project._id, moduleId: createdTicket.moduleId }
    });

    return res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      ticket: createdTicket
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all tickets for a project
export const getProjectTickets = async (req, res) => {
  const { projectId } = req.params;
  const { status, priority, type, assignedTo, search } = req.query;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    // Validate project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check access permissions
    const hasAccess = userRole === 'admin' || 
                     project.projectManager.toString() === userId ||
                     project.teamMembers.some(member => member.toString() === userId);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this project'
      });
    }

    // Collect all tickets from all modules
    const allTickets = [];
    project.modules.forEach(module => {
      module.tickets.forEach(ticket => {
        allTickets.push({
          ...ticket.toObject(),
          moduleId: module._id,
          moduleName: module.name
        });
      });
    });

    // Filter tickets based on query parameters
    let filteredTickets = allTickets;

    if (status) {
      filteredTickets = filteredTickets.filter(ticket => ticket.status === status);
    }

    if (priority) {
      filteredTickets = filteredTickets.filter(ticket => ticket.priority === priority);
    }

    if (type) {
      filteredTickets = filteredTickets.filter(ticket => ticket.type === type);
    }

    if (assignedTo) {
      filteredTickets = filteredTickets.filter(ticket => 
        ticket.assignedDeveloper?.toString() === assignedTo
      );
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filteredTickets = filteredTickets.filter(ticket =>
        ticket.title.match(searchRegex) || 
        ticket.description?.match(searchRegex) ||
        ticket.ticketNumber.match(searchRegex)
      );
    }

    return res.status(200).json({
      success: true,
      tickets: filteredTickets,
      count: filteredTickets.length
    });
  } catch (error) {
    console.error('Error fetching project tickets:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get a specific ticket
export const getTicket = async (req, res) => {
  const { projectId, ticketId } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    // Validate project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Find ticket in project modules
    let ticket = null;
    let module = null;
    
    for (const projectModule of project.modules) {
      const foundTicket = projectModule.tickets.id(ticketId);
      if (foundTicket) {
        ticket = foundTicket;
        module = projectModule;
        break;
      }
    }
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check access permissions
    const hasAccess = userRole === 'admin' || 
                     project.projectManager.toString() === userId ||
                     project.teamMembers.some(member => member.toString() === userId) ||
                     ticket.assignedDeveloper?.toString() === userId ||
                     ticket.tester?.toString() === userId;

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this ticket'
      });
    }

    return res.status(200).json({
      success: true,
      ticket
    });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update a ticket
export const updateTicket = async (req, res) => {
  const { projectId, ticketId } = req.params;
  const updateData = req.body;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    // Validate project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Find ticket in project modules
    let ticket = null;
    let module = null;
    
    for (const projectModule of project.modules) {
      const foundTicket = projectModule.tickets.id(ticketId);
      if (foundTicket) {
        ticket = foundTicket;
        module = projectModule;
        break;
      }
    }
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check permissions
    const canEdit = userRole === 'admin' || 
                   project.projectManager.toString() === userId ||
                   ticket.assignedDeveloper?.toString() === userId;

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to edit this ticket'
      });
    }

    // Update ticket fields
    Object.keys(updateData).forEach(key => {
      if (key !== '_id' && key !== 'ticketNumber' && key !== 'createdAt' && key !== 'updatedAt') {
        ticket[key] = updateData[key];
      }
    });

    await project.save();

    // Emit realtime event for ticket update
    emitTicketEvent({
      projectId: project._id.toString(),
      userIds: [ticket.assignedDeveloper, project.projectManager, ticket.tester].filter(Boolean).map(id => id.toString()),
      type: 'ticket.updated',
      data: { ticketId: ticket._id, changes: updateData }
    });

    return res.status(200).json({
      success: true,
      message: 'Ticket updated successfully',
      ticket
    });
  } catch (error) {
    console.error('Error updating ticket:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete a ticket
export const deleteTicket = async (req, res) => {
  const { projectId, ticketId } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    // Validate project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Find ticket in project modules
    let ticket = null;
    let module = null;
    
    for (const projectModule of project.modules) {
      const foundTicket = projectModule.tickets.id(ticketId);
      if (foundTicket) {
        ticket = foundTicket;
        module = projectModule;
        break;
      }
    }
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check permissions (only admin and project manager can delete)
    const canDelete = userRole === 'admin' || project.projectManager.toString() === userId;

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this ticket'
      });
    }

    // Remove ticket from project
    ticket.remove();
    await project.save();

    // Emit realtime event for ticket deletion
    emitTicketEvent({
      projectId: project._id.toString(),
      userIds: [project.projectManager].map(id => id.toString()),
      type: 'ticket.deleted',
      data: { ticketId }
    });

    return res.status(200).json({
      success: true,
      message: 'Ticket deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Add comment to ticket
export const addComment = async (req, res) => {
  const { projectId, ticketId } = req.params;
  const { comment } = req.body;
  const userId = req.user.id;

  try {
    // Validate project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Find ticket in project modules
    let ticket = null;
    let module = null;
    
    for (const projectModule of project.modules) {
      const foundTicket = projectModule.tickets.id(ticketId);
      if (foundTicket) {
        ticket = foundTicket;
        module = projectModule;
        break;
      }
    }
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Add comment
    ticket.comments.push({
      userId,
      comment,
      createdAt: new Date()
    });

    await project.save();

    // Emit realtime event for comment addition
    emitTicketEvent({
      projectId: project._id.toString(),
      userIds: [ticket.assignedDeveloper, ticket.tester, project.projectManager].filter(Boolean).map(id => id.toString()),
      type: 'ticket.comment_added',
      data: { ticketId: ticket._id, comment: ticket.comments[ticket.comments.length - 1] }
    });

    return res.status(200).json({
      success: true,
      message: 'Comment added successfully',
      comment: ticket.comments[ticket.comments.length - 1]
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all tickets across all projects (for admin/HR)
export const getAllTickets = async (req, res) => {
  const { status, priority, type, projectId, search } = req.query;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    // Only admin and HR can view all tickets
    if (!['admin', 'hr'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view all tickets'
      });
    }

    // Build match conditions
    const matchConditions = {};
    if (projectId) matchConditions._id = new mongoose.Types.ObjectId(projectId);
    if (status) matchConditions['modules.tickets.status'] = status;
    if (priority) matchConditions['modules.tickets.priority'] = priority;
    if (type) matchConditions['modules.tickets.type'] = type;

    // Build aggregation pipeline
    const pipeline = [
      { $match: matchConditions },
      { $unwind: '$modules' },
      { $unwind: '$modules.tickets' }
    ];

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      pipeline.push({
        $match: {
          $or: [
            { 'modules.tickets.title': searchRegex },
            { 'modules.tickets.description': searchRegex },
            { 'modules.tickets.ticketNumber': searchRegex }
          ]
        }
      });
    }

    pipeline.push({
      $project: {
        projectId: '$_id',
        projectName: '$name',
        moduleId: '$modules._id',
        moduleName: '$modules.name',
        ticket: '$modules.tickets'
      }
    });

    const tickets = await Project.aggregate(pipeline);

    return res.status(200).json({
      success: true,
      tickets,
      count: tickets.length
    });
  } catch (error) {
    console.error('Error fetching all tickets:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};