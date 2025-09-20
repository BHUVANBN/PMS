// kanban.controller.js - Automatic Kanban Board and Ticket Workflow Controller
import mongoose from 'mongoose';
import { 
  Project,
  User,
  BugTracker,
  KanbanBoard,
  ActivityLog,
  TICKET_STATUS, TICKET_TYPES, TICKET_PRIORITIES,
  PROJECT_STATUS,
  MODULE_STATUS,
  USER_ROLES,
  BUG_STATUS, BUG_SEVERITY, BUG_TYPES,
  KANBAN_BOARD_TYPES, DEFAULT_KANBAN_COLUMNS
} from '../models/index.js';

export const getDeveloperKanbanBoard = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.effectiveRole || req.userRole;

    // Check if user is a developer or has development permissions
    if (!['developer', 'admin', 'manager'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only developers can access personal kanban board'
      });
    }

    // Find projects where user is a team member
    const projects = await Project.find({
      teamMembers: userId,
      status: { $in: ['active', 'planning'] }
    }).populate('modules.tickets.assignedDeveloper', 'firstName lastName');

    // Extract tickets assigned to this developer
    const personalTickets = [];
    projects.forEach(project => {
      project.modules.forEach(module => {
        module.tickets.forEach(ticket => {
          if (ticket.assignedDeveloper && ticket.assignedDeveloper._id.toString() === userId.toString()) {
            personalTickets.push({
              ...ticket.toObject(),
              projectId: project._id,
              projectName: project.name,
              moduleId: module._id,
              moduleName: module.name
            });
          }
        });
      });
    });

    // Group tickets by status for kanban columns
    const kanbanData = {
      columns: {
        todo: {
          id: 'todo',
          title: 'To Do',
          tickets: personalTickets.filter(t => t.status === 'open')
        },
        inProgress: {
          id: 'inProgress',
          title: 'In Progress',
          tickets: personalTickets.filter(t => t.status === 'in_progress')
        },
        review: {
          id: 'review',
          title: 'Code Review',
          tickets: personalTickets.filter(t => t.status === 'code_review')
        },
        testing: {
          id: 'testing',
          title: 'Testing',
          tickets: personalTickets.filter(t => t.status === 'testing')
        },
        done: {
          id: 'done',
          title: 'Done',
          tickets: personalTickets.filter(t => t.status === 'done')
        }
      },
      totalTickets: personalTickets.length,
      activeTickets: personalTickets.filter(t => ['open', 'in_progress', 'code_review'].includes(t.status)).length
    };

    res.json({
      success: true,
      data: kanbanData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching developer kanban board',
      error: error.message
    });
  }
};

// Create a new Kanban board
export const createKanbanBoard = async (req, res) => {
  try {
    const {
      projectId,
      boardName,
      boardType,
      developerId,
      sprintId,
      allowedRoles,
      allowedUsers,
      columns
    } = req.body;

    // Validate required fields
    if (!projectId || !boardName) {
      return res.status(400).json({
        success: false,
        message: 'Project ID and board name are required'
      });
    }

    // Check if user has permission to create board for this project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Default columns if not provided
    const defaultColumns = [
      { name: 'To Do', statusMapping: 'open', order: 1, tickets: [] },
      { name: 'In Progress', statusMapping: 'in_progress', order: 2, tickets: [] },
      { name: 'Review', statusMapping: 'code_review', order: 3, tickets: [] },
      { name: 'Testing', statusMapping: 'testing', order: 4, tickets: [] },
      { name: 'Done', statusMapping: 'done', order: 5, tickets: [] }
    ];

    const kanbanBoard = new KanbanBoard({
      projectId,
      boardName,
      boardType: boardType || KANBAN_BOARD_TYPES.MAIN,
      ownerId: req.user._id,
      developerId,
      sprintId,
      allowedRoles: allowedRoles || ['admin', 'manager', 'developer', 'tester'],
      allowedUsers: allowedUsers || [],
      columns: columns || defaultColumns,
      settings: {
        showEstimates: true,
        showAssignees: true,
        showPriority: true,
        autoMoveOnStatusChange: true,
        enableDragDrop: true
      }
    });

    await kanbanBoard.save();

    // Log activity
    await ActivityLog.create({
      projectId,
      entityType: 'kanban',
      entityId: kanbanBoard._id,
      userId: req.user._id,
      action: 'created',
      actionCategory: 'kanban_update',
      description: `Kanban board "${boardName}" created`,
      metadata: {
        boardType,
        columnsCount: kanbanBoard.columns.length
      }
    });

    res.status(201).json({
      success: true,
      message: 'Kanban board created successfully',
      data: kanbanBoard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating Kanban board',
      error: error.message
    });
  }
};

// Get Kanban boards for a project
export const getProjectKanbanBoards = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { boardType, developerId } = req.query;

    const filter = { projectId };
    if (boardType) filter.boardType = boardType;
    if (developerId) filter.developerId = developerId;

    // Check user access to boards
    const userRole = req.effectiveRole || req.userRole;
    if (!['admin', 'hr'].includes(userRole)) {
      filter.$or = [
        { allowedRoles: userRole },
        { allowedUsers: req.user._id },
        { ownerId: req.user._id }
      ];
    }

    const boards = await KanbanBoard.find(filter)
      .populate('ownerId', 'firstName lastName')
      .populate('developerId', 'firstName lastName')
      .populate('sprintId', 'name sprintNumber')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: boards
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching Kanban boards',
      error: error.message
    });
  }
};

// Get specific Kanban board with tickets
export const getKanbanBoard = async (req, res) => {
  try {
    const { boardId } = req.params;

    const board = await KanbanBoard.findById(boardId)
      .populate('ownerId', 'firstName lastName')
      .populate('developerId', 'firstName lastName')
      .populate('sprintId', 'name sprintNumber')
      .populate('allowedUsers', 'firstName lastName role');

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Kanban board not found'
      });
    }

    // Check user access
    const userRole = req.effectiveRole || req.userRole;
    const hasAccess = ['admin', 'hr'].includes(userRole) ||
                     board.allowedRoles.includes(userRole) ||
                     board.allowedUsers.some(user => user._id.toString() === req.user._id.toString()) ||
                     board.ownerId._id.toString() === req.user._id.toString();

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this Kanban board'
      });
    }

    // Get tickets for each column
    const project = await Project.findById(board.projectId);
    const boardWithTickets = board.toObject();

    for (let column of boardWithTickets.columns) {
      const ticketDetails = [];
      
      for (let ticket of column.tickets) {
        // Find ticket in project modules
        let foundTicket = null;
        for (let module of project.modules) {
          foundTicket = module.tickets.id(ticket.ticketId);
          if (foundTicket) {
            foundTicket = {
              ...foundTicket.toObject(),
              moduleId: module._id,
              moduleName: module.name
            };
            break;
          }
        }
        
        if (foundTicket) {
          ticketDetails.push({
            ...ticket,
            ticketDetails: foundTicket
          });
        }
      }
      
      column.tickets = ticketDetails;
    }

    res.json({
      success: true,
      data: boardWithTickets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching Kanban board',
      error: error.message
    });
  }
};

// Move ticket between columns (drag-drop functionality)
export const moveTicket = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { ticketId, fromColumnId, toColumnId, newPosition } = req.body;

    const board = await KanbanBoard.findById(boardId);
    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Kanban board not found'
      });
    }

    // Find columns
    const fromColumn = board.columns.id(fromColumnId);
    const toColumn = board.columns.id(toColumnId);

    if (!fromColumn || !toColumn) {
      return res.status(400).json({
        success: false,
        message: 'Invalid column ID(s)'
      });
    }

    // Find ticket in from column
    const ticketIndex = fromColumn.tickets.findIndex(t => t.ticketId.toString() === ticketId);
    if (ticketIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found in source column'
      });
    }

    const ticket = fromColumn.tickets[ticketIndex];

    // Check WIP limits
    if (toColumn.wipLimit && toColumn.tickets.length >= toColumn.wipLimit) {
      return res.status(400).json({
        success: false,
        message: `Cannot move ticket. Column "${toColumn.name}" has reached its WIP limit of ${toColumn.wipLimit}`
      });
    }

    // Check workflow rules
    const workflowRules = toColumn.rules?.workflow || [];
    if (workflowRules.length > 0 && !workflowRules.includes(fromColumn.name)) {
      return res.status(400).json({
        success: false,
        message: `Cannot move ticket from "${fromColumn.name}" to "${toColumn.name}". Workflow rules violation.`
      });
    }

    // Remove from source column
    fromColumn.tickets.splice(ticketIndex, 1);

    // Add to destination column
    if (newPosition !== undefined && newPosition < toColumn.tickets.length) {
      toColumn.tickets.splice(newPosition, 0, ticket);
    } else {
      toColumn.tickets.push(ticket);
    }

    // Update ticket status based on column mapping
    const statusMapping = {
      'To Do': 'open',
      'In Progress': 'in_progress',
      'Review': 'code_review',
      'Testing': 'testing',
      'Done': 'done',
      'Blocked': 'blocked'
    };

    const newStatus = statusMapping[toColumn.name] || 'open';
    ticket.status = newStatus;
    ticket.lastModified = new Date();

    // Update statistics
    board.statistics.ticketsMoved += 1;
    board.statistics.lastActivity = new Date();

    // Add to activity log
    board.recentActivity.unshift({
      action: 'ticket_moved',
      ticketId,
      fromColumn: fromColumn.name,
      toColumn: toColumn.name,
      userId: req.user._id,
      timestamp: new Date(),
      details: `Ticket moved from ${fromColumn.name} to ${toColumn.name}`
    });

    // Keep only last 50 activities
    if (board.recentActivity.length > 50) {
      board.recentActivity = board.recentActivity.slice(0, 50);
    }

    await board.save();

    res.json({
      success: true,
      message: 'Ticket moved successfully',
      data: {
        fromColumn: fromColumn.name,
        toColumn: toColumn.name,
        ticket: ticket
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error moving ticket',
      error: error.message
    });
  }
};

// Update ticket status (simplified version for direct status updates)
export const updateTicketStatus = async (req, res) => {
  try {
    const { projectId, ticketId } = req.params;
    const { status, comment } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    // Find the project and ticket
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    let ticket = null;
    let module = null;

    // Find ticket in project modules
    for (const mod of project.modules) {
      ticket = mod.tickets.id(ticketId);
      if (ticket) {
        module = mod;
        break;
      }
    }

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check if user has permission to update this ticket
    const userRole = req.effectiveRole || req.userRole;
    const canUpdate = 
      ['admin', 'manager'].includes(userRole) ||
      ticket.assignedDeveloper?.toString() === req.user._id.toString() ||
      ticket.tester?.toString() === req.user._id.toString();

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update tickets assigned to you'
      });
    }

    const oldStatus = ticket.status;
    ticket.status = status;
    ticket.lastModified = new Date();

    // Add comment if provided
    if (comment) {
      ticket.comments.push({
        userId: req.user._id,
        comment: comment,
        timestamp: new Date()
      });
    }

    // Update kanban boards that contain this ticket
    const kanbanBoards = await KanbanBoard.find({
      projectId: projectId,
      'columns.tickets.ticketId': ticketId
    });

    for (const board of kanbanBoards) {
      // Find and update ticket in kanban board
      for (const column of board.columns) {
        const boardTicket = column.tickets.find(t => t.ticketId.toString() === ticketId);
        if (boardTicket) {
          boardTicket.status = status;
          boardTicket.lastModified = new Date();
          
          // Add activity log
          board.recentActivity.unshift({
            action: 'ticket_status_updated',
            ticketId,
            oldStatus,
            newStatus: status,
            userId: req.user._id,
            timestamp: new Date(),
            details: `Ticket status changed from ${oldStatus} to ${status}`
          });
          break;
        }
      }
      await board.save();
    }

    await project.save();

    res.json({
      success: true,
      message: 'Ticket status updated successfully',
      data: {
        ticketId,
        oldStatus,
        newStatus: status,
        ticket: ticket
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating ticket status',
      error: error.message
    });
  }
};

// Add ticket to Kanban board
export const addTicketToBoard = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { ticketId, columnId, position } = req.body;

    const board = await KanbanBoard.findById(boardId);
    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Kanban board not found'
      });
    }

    const column = board.columns.id(columnId);
    if (!column) {
      return res.status(400).json({
        success: false,
        message: 'Invalid column ID'
      });
    }

    // Check if ticket already exists on board
    const existingTicket = board.columns.some(col => 
      col.tickets.some(t => t.ticketId.toString() === ticketId)
    );

    if (existingTicket) {
      return res.status(400).json({
        success: false,
        message: 'Ticket already exists on this board'
      });
    }

    // Check WIP limit
    if (column.wipLimit && column.tickets.length >= column.wipLimit) {
      return res.status(400).json({
        success: false,
        message: `Column "${column.name}" has reached its WIP limit of ${column.wipLimit}`
      });
    }

    // Add ticket to column
    const newTicket = {
      ticketId,
      position: position || column.tickets.length + 1,
      movedAt: new Date(),
      movedBy: req.user._id
    };

    if (position && position <= column.tickets.length) {
      column.tickets.splice(position - 1, 0, newTicket);
      // Update positions
      column.tickets.forEach((t, index) => {
        t.position = index + 1;
      });
    } else {
      column.tickets.push(newTicket);
    }

    // Add to activity log
    board.recentActivity.unshift({
      action: 'ticket_added',
      ticketId,
      toColumn: column.name,
      userId: req.user._id,
      timestamp: new Date(),
      details: `Ticket added to ${column.name}`
    });

    await board.save();

    res.json({
      success: true,
      message: 'Ticket added to board successfully',
      data: newTicket
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding ticket to board',
      error: error.message
    });
  }
};

// Remove ticket from Kanban board
export const removeTicketFromBoard = async (req, res) => {
  try {
    const { boardId, ticketId } = req.params;

    const board = await KanbanBoard.findById(boardId);
    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Kanban board not found'
      });
    }

    // Find and remove ticket
    let removed = false;
    let removedFromColumn = null;

    for (let column of board.columns) {
      const ticketIndex = column.tickets.findIndex(t => t.ticketId.toString() === ticketId);
      if (ticketIndex !== -1) {
        column.tickets.splice(ticketIndex, 1);
        // Update positions
        column.tickets.forEach((t, index) => {
          t.position = index + 1;
        });
        removedFromColumn = column.name;
        removed = true;
        break;
      }
    }

    if (!removed) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found on this board'
      });
    }

    // Add to activity log
    board.recentActivity.unshift({
      action: 'ticket_removed',
      ticketId,
      fromColumn: removedFromColumn,
      userId: req.user._id,
      timestamp: new Date(),
      details: `Ticket removed from ${removedFromColumn}`
    });

    await board.save();

    res.json({
      success: true,
      message: 'Ticket removed from board successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing ticket from board',
      error: error.message
    });
  }
};

// Update board settings
export const updateBoardSettings = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { settings } = req.body;

    const board = await KanbanBoard.findById(boardId);
    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Kanban board not found'
      });
    }

    // Check if user can modify board
    if (board.ownerId.toString() !== req.user._id.toString() && 
        !['admin', 'manager'].includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only board owner or managers can modify settings'
      });
    }

    board.settings = { ...board.settings.toObject(), ...settings };
    await board.save();

    res.json({
      success: true,
      message: 'Board settings updated successfully',
      data: board.settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating board settings',
      error: error.message
    });
  }
};

// Get board statistics
export const getBoardStatistics = async (req, res) => {
  try {
    const { boardId } = req.params;

    const board = await KanbanBoard.findById(boardId);
    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Kanban board not found'
      });
    }

    const stats = board.statistics;

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching board statistics',
      error: error.message
    });
  }
};

// Update column configuration
export const updateColumn = async (req, res) => {
  try {
    const { boardId, columnId } = req.params;
    const { name, description, wipLimit, rules } = req.body;

    const board = await KanbanBoard.findById(boardId);
    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Kanban board not found'
      });
    }

    const column = board.columns.id(columnId);
    if (!column) {
      return res.status(404).json({
        success: false,
        message: 'Column not found'
      });
    }

    // Update column properties
    if (name) column.name = name;
    if (description !== undefined) column.description = description;
    if (wipLimit !== undefined) column.wipLimit = wipLimit;
    if (rules) column.rules = { ...column.rules.toObject(), ...rules };

    await board.save();

    // Log activity
    board.recentActivity.unshift({
      action: 'column_modified',
      userId: req.user._id,
      timestamp: new Date(),
      details: `Column "${column.name}" updated`
    });

    res.json({
      success: true,
      message: 'Column updated successfully',
      data: column
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating column',
      error: error.message
    });
  }
};