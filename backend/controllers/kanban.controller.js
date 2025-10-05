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
import { emitTicketEvent } from '../utils/realtime.js';

export const getDeveloperKanbanBoard = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.effectiveRole || req.userRole;

    // Check if user is a developer or has development permissions
    // Admin must not access Kanban personal boards per requirement
    if (userRole === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin cannot access Kanban boards'
      });
    }
    if (!['developer', 'manager'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only developers can access personal kanban board'
      });
    }

    const { projectId: filterProjectId } = req.query || {};
    if (filterProjectId && !mongoose.Types.ObjectId.isValid(filterProjectId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid projectId'
      });
    }

    const projectQuery = {
      status: { $in: ['active', 'planning'] },
      $or: [
        { teamMembers: userId },
        { 'modules.tickets.assignedDeveloper': userId }
      ]
    };
    if (filterProjectId) {
      projectQuery._id = new mongoose.Types.ObjectId(filterProjectId);
    }

    const projects = await Project.find(projectQuery)
      .populate('modules.tickets.assignedDeveloper', 'firstName lastName');

    if (filterProjectId && !projects.length) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or you are not a member'
      });
    }

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
      activeTickets: personalTickets.filter(t => ['open', 'in_progress', 'code_review'].includes(t.status)).length,
      projectId: filterProjectId ? filterProjectId.toString() : '',
      availableProjects: projects.map(project => ({
        _id: project._id,
        id: project._id,
        name: project.name
      }))
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

// Get a specific developer's Kanban board by developerId (for managers/admin to view)
export const getDeveloperKanbanBoardById = async (req, res) => {
  try {
    const { developerId } = req.params;
    const viewerRole = req.effectiveRole || req.userRole;

    if (!['admin', 'manager'].includes(viewerRole)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only managers or admins can view another developer\'s board'
      });
    }

    const projects = await Project.find({
      status: { $in: ['active', 'planning'] },
      $or: [
        { teamMembers: developerId },
        { 'modules.tickets.assignedDeveloper': developerId }
      ]
    }).populate('modules.tickets.assignedDeveloper', 'firstName lastName');

    const personalTickets = [];
    projects.forEach(project => {
      project.modules.forEach(module => {
        module.tickets.forEach(ticket => {
          if (ticket.assignedDeveloper && ticket.assignedDeveloper.toString() === developerId.toString()) {
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

    res.json({ success: true, data: kanbanData });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching developer kanban board by ID',
      error: error.message
    });
  }
};

// Tester personal Kanban board: shows tickets ready for testing or under testing
export const getTesterKanbanBoard = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.effectiveRole || req.userRole;

    // Admin excluded from Kanban endpoints
    if (userRole === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin cannot access Kanban boards'
      });
    }
    if (!['tester', 'manager'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only testers can access tester kanban board'
      });
    }

    // Find projects where tester is a team member
    const { projectId: testerProjectId } = req.query || {};
    if (testerProjectId && !mongoose.Types.ObjectId.isValid(testerProjectId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid projectId'
      });
    }

    const testerProjectQuery = {
      teamMembers: userId,
      status: { $in: ['active', 'planning'] }
    };
    if (testerProjectId) {
      testerProjectQuery._id = new mongoose.Types.ObjectId(testerProjectId);
    }

    const projects = await Project.find(testerProjectQuery)
      .populate('modules.tickets.assignedDeveloper', 'firstName lastName');

    if (testerProjectId && !projects.length) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or you are not assigned as tester'
      });
    }

    // Extract tickets assigned to this tester or awaiting assignment (testing status without tester)
    const testerTickets = [];
    const needsAssignment = [];
    projects.forEach(project => {
      project.modules.forEach(module => {
        module.tickets.forEach(ticket => {
          const ticketPayload = {
            ...ticket.toObject(),
            projectId: project._id,
            projectName: project.name,
            moduleId: module._id,
            moduleName: module.name
          };

          if (ticket.tester && ticket.tester.toString() === userId.toString()) {
            testerTickets.push({
              ...ticketPayload,
              assignedTester: true
            });
          } else if (!ticket.tester && ticket.status === 'testing') {
            needsAssignment.push({
              ...ticketPayload,
              assignedTester: false
            });
          }
        });
      });
    });

    const kanbanData = {
      columns: {
        testing: {
          id: 'testing',
          title: 'Testing Queue',
          tickets: [
            ...needsAssignment,
            ...testerTickets.filter(t => ['code_review', 'testing'].includes(t.status))
          ]
        },
        done: {
          id: 'done',
          title: 'Done',
          tickets: testerTickets.filter(t => t.status === 'done')
        }
      },
      totalTickets: testerTickets.length + needsAssignment.length,
      activeTickets: [
        ...testerTickets.filter(t => ['code_review', 'testing'].includes(t.status)),
        ...needsAssignment
      ].length,
      projectId: testerProjectId ? testerProjectId.toString() : '',
      availableProjects: projects.map(project => ({
        _id: project._id,
        id: project._id,
        name: project.name
      }))
    };

    res.json({ success: true, data: kanbanData });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tester kanban board',
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

    // Emit realtime event
    emitTicketEvent({
      projectId: board.projectId.toString(),
      type: 'kanban.ticket_moved',
      data: { boardId, ticketId, fromColumnId, toColumnId, newPosition }
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

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    let ticket = null;
    let module = null;
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
    const statusChanged = status !== oldStatus;

    const isAssignedDeveloper = ticket.assignedDeveloper?.toString() === req.user._id.toString();
    const isAssignedTester = ticket.tester?.toString() === req.user._id.toString();
    const isDeveloper = userRole === 'developer';
    const isTester = userRole === 'tester';
    const isManager = userRole === 'manager';
    const isAdmin = userRole === 'admin';

    if (statusChanged) {
      const canChangeStatus =
        isAdmin ||
        (isDeveloper && isAssignedDeveloper && status !== 'done') ||
        (isTester && isAssignedTester);

      if (!canChangeStatus) {
        return res.status(403).json({
          success: false,
          message: 'You are not permitted to change this ticket status'
        });
      }

      if (isManager) {
        return res.status(403).json({
          success: false,
          message: 'Managers cannot move tickets between workflow columns'
        });
      }
    }

    ticket.status = status;
    ticket.lastModified = new Date();

    let newlyAssignedTester = null;
    if (status === 'testing' && (!ticket.tester || ticket.tester === null)) {
      const moduleTeamMemberIds = Array.isArray(module?.teamMembers)
        ? module.teamMembers.map(memberId => memberId.toString())
        : [];
      const projectTeamMemberIds = Array.isArray(project.teamMembers)
        ? project.teamMembers.map(memberId => memberId.toString())
        : [];

      const candidateIds = Array.from(new Set([...moduleTeamMemberIds, ...projectTeamMemberIds]));

      if (!candidateIds.length) {
        return res.status(400).json({
          success: false,
          message: 'Cannot move ticket to testing because no team members are associated with this project'
        });
      }

      const testers = await User.find({
        _id: { $in: candidateIds },
        role: 'tester'
      }).select('_id firstName lastName username email');

      if (!testers.length) {
        return res.status(400).json({
          success: false,
          message: 'Cannot move ticket to testing because no testers are assigned to this project'
        });
      }

      const moduleTesterIds = new Set(moduleTeamMemberIds);

      const testerLoad = testers.map(tester => {
        const testerIdStr = tester._id.toString();
        let activeTestingCount = 0;

        project.modules.forEach(projectModule => {
          projectModule.tickets.forEach(projectTicket => {
            if (
              projectTicket.tester &&
              projectTicket.tester.toString() === testerIdStr &&
              projectTicket.status === 'testing'
            ) {
              activeTestingCount += 1;
            }
          });
        });

        return {
          tester,
          activeTestingCount,
          inModule: moduleTesterIds.has(testerIdStr)
        };
      });

      testerLoad.sort((a, b) => {
        if (a.inModule !== b.inModule) {
          return a.inModule ? -1 : 1;
        }

        if (a.activeTestingCount !== b.activeTestingCount) {
          return a.activeTestingCount - b.activeTestingCount;
        }

        const nameA = `${a.tester.firstName || ''} ${a.tester.lastName || ''}`.trim().toLowerCase();
        const nameB = `${b.tester.firstName || ''} ${b.tester.lastName || ''}`.trim().toLowerCase();
        return nameA.localeCompare(nameB);
      });

      newlyAssignedTester = testerLoad[0].tester;
      ticket.tester = newlyAssignedTester._id;

      const testerDisplayName = (newlyAssignedTester.firstName || newlyAssignedTester.lastName)
        ? `${newlyAssignedTester.firstName || ''} ${newlyAssignedTester.lastName || ''}`.trim()
        : newlyAssignedTester.username || newlyAssignedTester.email || 'tester';

      ticket.comments.push({
        userId: req.user._id,
        comment: `[System] Auto-assigned tester ${testerDisplayName} when ticket entered testing`,
        createdAt: new Date()
      });
    }

    if (comment) {
      ticket.comments.push({
        userId: req.user._id,
        comment: comment,
        createdAt: new Date()
      });
    }

    const kanbanBoards = await KanbanBoard.find({
      projectId: projectId,
      'columns.tickets.ticketId': ticketId
    });

    for (const board of kanbanBoards) {
      for (const column of board.columns) {
        const boardTicket = column.tickets.find(t => t.ticketId.toString() === ticketId);
        if (boardTicket) {
          boardTicket.status = status;
          boardTicket.lastModified = new Date();

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

    if (status === 'done' && !ticket.tester) {
      const testerUser = await User.findOne({ _id: { $in: project.teamMembers }, role: 'tester' });
      if (testerUser) {
        ticket.tester = testerUser._id;
        await project.save();
      }
    }

    emitTicketEvent({
      projectId: projectId.toString(),
      userIds: [ticket.assignedDeveloper, ticket.tester, project.projectManager]
        .filter(Boolean)
        .map(id => id.toString()),
      type: 'ticket.status_updated',
      data: { ticketId, oldStatus, newStatus: status }
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