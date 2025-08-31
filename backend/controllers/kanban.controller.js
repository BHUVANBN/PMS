// kanban.controller.js - Automatic Kanban Board and Ticket Workflow Controller
import mongoose from 'mongoose';
import { 
  Project,
  User,
  BugTracker,
  KanbanBoard,
  TICKET_STATUS, TICKET_TYPES, TICKET_PRIORITIES,
  PROJECT_STATUS,
  MODULE_STATUS,
  USER_ROLES,
  BUG_STATUS, BUG_SEVERITY, BUG_TYPES,
  KANBAN_BOARD_TYPES, DEFAULT_KANBAN_COLUMNS
} from '../models/index.js';


// Get Kanban Board based on user role and context
export const getKanbanBoard = async (req, res) => {
  const { boardType } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    let tickets = [];
    let boardData = {};

    switch (boardType) {
      case 'developer':
        // Fetch tickets assigned to the current developer
        const devProjects = await Project.find({ teamMembers: userId });
        const devTickets = await Project.aggregate([
          { $match: { teamMembers: new mongoose.Types.ObjectId(userId) } },
          { $unwind: '$modules' },
          { $unwind: '$modules.tickets' },
          { $match: { 
            'modules.tickets.assignedDeveloper': new mongoose.Types.ObjectId(userId),
            'modules.tickets.status': { $in: ['open', 'in_progress', 'reopened'] }
          }},
          { $project: {
            projectId: '$_id',
            projectName: '$name',
            moduleId: '$modules._id',
            moduleName: '$modules.name',
            ticket: '$modules.tickets'
          }}
        ]);
        tickets = devTickets.map(item => ({
          ...item.ticket,
          projectId: item.projectId,
          projectName: item.projectName
        }));
        break;

      case 'tester':
        // Fetch tickets assigned to the current tester for testing
        const testerProjects = await Project.find({ teamMembers: userId });
        const testerTickets = await Project.aggregate([
          { $match: { teamMembers: new mongoose.Types.ObjectId(userId) } },
          { $unwind: '$modules' },
          { $unwind: '$modules.tickets' },
          { $match: { 
            'modules.tickets.tester': new mongoose.Types.ObjectId(userId),
            'modules.tickets.status': { $in: ['testing', 'code_review'] }
          }},
          { $project: {
            projectId: '$_id',
            projectName: '$name',
            moduleId: '$modules._id',
            moduleName: '$modules.name',
            ticket: '$modules.tickets'
          }}
        ]);
        tickets = testerTickets.map(item => ({
          ...item.ticket,
          projectId: item.projectId,
          projectName: item.projectName
        }));
        break;

      case 'lead':
      case 'manager':
        // Fetch tickets for projects managed by the lead/manager
        const managedProjects = await Project.find({ projectManager: userId });
        const managedTickets = await Project.aggregate([
          { $match: { projectManager: new mongoose.Types.ObjectId(userId) } },
          { $unwind: '$modules' },
          { $unwind: '$modules.tickets' },
          { $match: { 
            'modules.tickets.status': { $in: ['ready_for_closure', 'closed'] }
          }},
          { $project: {
            projectId: '$_id',
            projectName: '$name',
            moduleId: '$modules._id',
            moduleName: '$modules.name',
            ticket: '$modules.tickets'
          }}
        ]);
        tickets = managedTickets.map(item => ({
          ...item.ticket,
          projectId: item.projectId,
          projectName: item.projectName
        }));
        break;

      case 'hr':
        // HR can view all tickets for attendance and project tracking
        const hrTickets = await Project.aggregate([
          { $unwind: '$modules' },
          { $unwind: '$modules.tickets' },
          { $project: {
            projectId: '$_id',
            projectName: '$name',
            moduleId: '$modules._id',
            moduleName: '$modules.name',
            ticket: '$modules.tickets'
          }},
          { $limit: 50 } // Limit for performance
        ]);
        tickets = hrTickets.map(item => ({
          ...item.ticket,
          projectId: item.projectId,
          projectName: item.projectName
        }));
        break;

      case 'admin':
        // Admin can view all tickets across all projects
        const adminTickets = await Project.aggregate([
          { $unwind: '$modules' },
          { $unwind: '$modules.tickets' },
          { $project: {
            projectId: '$_id',
            projectName: '$name',
            moduleId: '$modules._id',
            moduleName: '$modules.name',
            ticket: '$modules.tickets'
          }}
        ]);
        tickets = adminTickets.map(item => ({
          ...item.ticket,
          projectId: item.projectId,
          projectName: item.projectName
        }));
        break;

      default:
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid board type. Use: developer, tester, lead, manager, hr, or admin' 
        });
    }

    // Group tickets by status for Kanban columns
    const columns = {
      'To Do': tickets.filter(t => t.status === 'open'),
      'In Progress': tickets.filter(t => t.status === 'in_progress'),
      'Testing': tickets.filter(t => t.status === 'testing'),
      'Code Review': tickets.filter(t => t.status === 'code_review'),
      'Done': tickets.filter(t => t.status === 'done'),
      'Blocked': tickets.filter(t => t.status === 'blocked'),
      'Ready for Closure': tickets.filter(t => t.status === 'ready_for_closure'),
      'Closed': tickets.filter(t => t.status === 'closed'),
      'Reopened': tickets.filter(t => t.status === 'reopened')
    };

    // Calculate board statistics
    const stats = {
      total: tickets.length,
      open: columns['To Do'].length,
      inProgress: columns['In Progress'].length,
      testing: columns['Testing'].length,
      codeReview: columns['Code Review'].length,
      done: columns['Done'].length,
      blocked: columns['Blocked'].length,
      readyForClosure: columns['Ready for Closure'].length,
      closed: columns['Closed'].length,
      reopened: columns['Reopened'].length
    };

    boardData = {
      boardType,
      columns,
      stats,
      totalTickets: tickets.length
    };

    res.status(200).json({
      success: true,
      message: `Kanban board for ${boardType}`,
      data: boardData
    });

  } catch (error) {
    console.error('Error fetching kanban board:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch kanban board',
      error: error.message
    });
  }
};

// Update ticket status (move between columns)
export const updateTicketStatus = async (req, res) => {
  const { projectId, ticketId } = req.params;
  const { status, comment } = req.body;
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
    const canUpdate = userRole === 'admin' || 
                     project.projectManager.toString() === userId ||
                     ticket.assignedDeveloper?.toString() === userId ||
                     ticket.tester?.toString() === userId;

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this ticket'
      });
    }

    // Validate status transition
    const validTransitions = {
      'open': ['in_progress', 'blocked'],
      'in_progress': ['testing', 'blocked', 'open'],
      'testing': ['code_review', 'done', 'blocked', 'in_progress'],
      'code_review': ['testing', 'done', 'blocked'],
      'done': ['ready_for_closure', 'testing'],
      'blocked': ['open', 'in_progress'],
      'ready_for_closure': ['closed', 'reopened'],
      'closed': ['reopened'],
      'reopened': ['in_progress', 'testing']
    };

    const currentStatus = ticket.status;
    const allowedTransitions = validTransitions[currentStatus] || [];

    if (!allowedTransitions.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${currentStatus} to ${status}`,
        allowedTransitions
      });
    }

    // Update ticket status
    ticket.status = status;

    // Add status change comment
    if (comment) {
      ticket.comments.push({
        userId,
        comment: `Status changed to ${status}: ${comment}`,
        createdAt: new Date()
      });
    } else {
      ticket.comments.push({
        userId,
        comment: `Status changed to ${status}`,
        createdAt: new Date()
      });
    }

    // Update timestamps based on status
    if (status === 'in_progress' && !ticket.startedAt) {
      ticket.startedAt = new Date();
    } else if (status === 'done' && !ticket.completedAt) {
      ticket.completedAt = new Date();
    }

    await project.save();

    res.status(200).json({
      success: true,
      message: 'Ticket status updated successfully',
      data: {
        ticketId: ticket._id,
        newStatus: status,
        previousStatus: currentStatus
      }
    });

  } catch (error) {
    console.error('Error updating ticket status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update ticket status',
      error: error.message
    });
  }
};

// Get project-specific kanban board
export const getProjectKanbanBoard = async (req, res) => {
  const { projectId } = req.params;
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

    // Group tickets by status
    const columns = {
      'To Do': allTickets.filter(t => t.status === 'open'),
      'In Progress': allTickets.filter(t => t.status === 'in_progress'),
      'Testing': allTickets.filter(t => t.status === 'testing'),
      'Code Review': allTickets.filter(t => t.status === 'code_review'),
      'Done': allTickets.filter(t => t.status === 'done'),
      'Blocked': allTickets.filter(t => t.status === 'blocked'),
      'Ready for Closure': allTickets.filter(t => t.status === 'ready_for_closure'),
      'Closed': allTickets.filter(t => t.status === 'closed'),
      'Reopened': allTickets.filter(t => t.status === 'reopened')
    };

    // Calculate project statistics
    const stats = {
      total: allTickets.length,
      open: columns['To Do'].length,
      inProgress: columns['In Progress'].length,
      testing: columns['Testing'].length,
      codeReview: columns['Code Review'].length,
      done: columns['Done'].length,
      blocked: columns['Blocked'].length,
      readyForClosure: columns['Ready for Closure'].length,
      closed: columns['Closed'].length,
      reopened: columns['Reopened'].length
    };

    const boardData = {
      projectId: project._id,
      projectName: project.name,
      columns,
      stats,
      totalTickets: project.tickets.length
    };

    res.status(200).json({
      success: true,
      message: `Kanban board for project: ${project.name}`,
      data: boardData
    });

  } catch (error) {
    console.error('Error fetching project kanban board:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project kanban board',
      error: error.message
    });
  }
};

// Get developer's personal kanban board
export const getDeveloperKanbanBoard = async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    if (userRole !== 'developer') {
      return res.status(403).json({
        success: false,
        message: 'This endpoint is only for developers'
      });
    }

    // Get tickets assigned to the developer
    const devTickets = await Project.aggregate([
      { $unwind: '$modules' },
      { $unwind: '$modules.tickets' },
      { $match: { 'modules.tickets.assignedDeveloper': new mongoose.Types.ObjectId(userId) } },
      { $project: {
        projectId: '$_id',
        projectName: '$name',
        moduleId: '$modules._id',
        moduleName: '$modules.name',
        ticket: '$modules.tickets'
      }}
    ]);

    const tickets = devTickets.map(item => ({
      ...item.ticket,
      projectId: item.projectId,
      projectName: item.projectName
    }));

    // Group tickets by status
    const columns = {
      'To Do': tickets.filter(t => t.status === 'open'),
      'In Progress': tickets.filter(t => t.status === 'in_progress'),
      'Testing': tickets.filter(t => t.status === 'testing'),
      'Code Review': tickets.filter(t => t.status === 'code_review'),
      'Done': tickets.filter(t => t.status === 'done'),
      'Blocked': tickets.filter(t => t.status === 'blocked')
    };

    // Calculate personal statistics
    const stats = {
      total: tickets.length,
      open: columns['To Do'].length,
      inProgress: columns['In Progress'].length,
      testing: columns['Testing'].length,
      codeReview: columns['Code Review'].length,
      done: columns['Done'].length,
      blocked: columns['Blocked'].length
    };

    const boardData = {
      developerId: userId,
      columns,
      stats,
      totalTickets: tickets.length
    };

    res.status(200).json({
      success: true,
      message: 'Developer kanban board',
      data: boardData
    });

  } catch (error) {
    console.error('Error fetching developer kanban board:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch developer kanban board',
      error: error.message
    });
  }
};