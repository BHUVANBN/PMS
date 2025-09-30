// manager.controller.js - Manager/Project Manager Controller
import mongoose from 'mongoose';
import { Project } from '../models/index.js';
import { Sprint } from '../models/index.js';
import { KanbanBoard } from '../models/index.js';
import { User } from '../models/index.js';
import { Standup } from '../models/index.js';

// ========================================
// 1. PROJECT OVERSIGHT
// ========================================

/**
 * Get all projects managed by the current manager
 */
export const getMyProjects = async (req, res) => {
  try {
    const managerId = req.user._id;
    
    const projects = await Project.find({
      projectManager: managerId
    }).populate('teamMembers', 'firstName lastName username email role')
      .populate('modules.moduleLead', 'firstName lastName username')
      .select('-__v');

    res.json({
      success: true,
      data: projects,
      count: projects.length
    });
  } catch (error) {
    console.error('Error fetching manager projects:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch projects'
    });
  }
};

/**
 * Permanently delete a project owned by the current manager
 */
export const deleteManagedProject = async (req, res) => {
  try {
    const { id } = req.params;
    const managerId = req.user._id;

    // Verify project ownership
    const project = await Project.findOne({ _id: id, projectManager: managerId });
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found or access denied'
      });
    }

    await Project.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Project deleted permanently'
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete project'
    });
  }
};

/**
 * Get detailed project information
 */
export const getProjectDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const managerId = req.user._id;

    const project = await Project.findOne({
      _id: id,
      projectManager: managerId
    }).populate('teamMembers', 'firstName lastName username email role isActive')
      .populate('modules.moduleLead', 'firstName lastName username')
      .populate('modules.teamMembers', 'firstName lastName username')
      .populate('modules.tickets.assignedDeveloper', 'firstName lastName username')
      .populate('modules.tickets.tester', 'firstName lastName username');

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found or access denied'
      });
    }

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Error fetching project details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project details'
    });
  }
};

/**
 * Create new project
 */
export const createProject = async (req, res) => {
  try {
    const managerId = req.user._id;
    const projectData = {
      ...req.body,
      projectManager: managerId
    };

    const project = await Project.create(projectData);

    res.status(201).json({
      success: true,
      data: project,
      message: 'Project created successfully'
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Update project scope, deadlines, status
 */
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const managerId = req.user._id;

    const project = await Project.findOneAndUpdate(
      {
        _id: id,
        projectManager: managerId
      },
      req.body,
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found or access denied'
      });
    }

    res.json({
      success: true,
      data: project,
      message: 'Project updated successfully'
    });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Archive/close project
 */
export const archiveProject = async (req, res) => {
  try {
    const { id } = req.params;
    const managerId = req.user._id;

    const project = await Project.findOneAndUpdate(
      {
        _id: id,
        projectManager: managerId
      },
      { status: 'completed' },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found or access denied'
      });
    }

    res.json({
      success: true,
      data: project,
      message: 'Project archived successfully'
    });
  } catch (error) {
    console.error('Error archiving project:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to archive project'
    });
  }
};

// ========================================
// 2. MODULE & SPRINT CONTROL
// ========================================

/**
 * Add module under project
 */
export const addModule = async (req, res) => {
  try {
    const { id } = req.params;
    const managerId = req.user._id;

    const project = await Project.findOne({
      _id: id,
      projectManager: managerId
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found or access denied'
      });
    }

    // Add module to project
    project.modules.push(req.body);
    await project.save();

    const newModule = project.modules[project.modules.length - 1];

    res.status(201).json({
      success: true,
      data: newModule,
      message: 'Module added successfully'
    });
  } catch (error) {
    console.error('Error adding module:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Update module status, sprint duration
 */
export const updateModule = async (req, res) => {
  try {
    const { projectId, moduleId } = req.params;
    const managerId = req.user._id;

    const project = await Project.findOne({
      _id: projectId,
      projectManager: managerId
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found or access denied'
      });
    }

    const moduleIndex = project.modules.findIndex(
      module => module._id.toString() === moduleId
    );

    if (moduleIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Module not found'
      });
    }

    // Update module
    Object.assign(project.modules[moduleIndex], req.body);
    await project.save();

    res.json({
      success: true,
      data: project.modules[moduleIndex],
      message: 'Module updated successfully'
    });
  } catch (error) {
    console.error('Error updating module:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get module summary with progress and blockers
 */
export const getModuleSummary = async (req, res) => {
  try {
    const { projectId, moduleId } = req.params;
    const managerId = req.user._id;

    const project = await Project.findOne({
      _id: projectId,
      projectManager: managerId
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found or access denied'
      });
    }

    const module = project.modules.find(
      module => module._id.toString() === moduleId
    );

    if (!module) {
      return res.status(404).json({
        success: false,
        error: 'Module not found'
      });
    }

    // Calculate module statistics
    const totalTickets = module.tickets.length;
    const completedTickets = module.tickets.filter(ticket => ticket.status === 'done').length;
    const inProgressTickets = module.tickets.filter(ticket => ticket.status === 'in_progress').length;
    const blockedTickets = module.tickets.filter(ticket => ticket.status === 'blocked').length;

    const summary = {
      module,
      statistics: {
        totalTickets,
        completedTickets,
        inProgressTickets,
        blockedTickets,
        completionPercentage: totalTickets > 0 ? Math.round((completedTickets / totalTickets) * 100) : 0
      }
    };

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error fetching module summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch module summary'
    });
  }
};

/**
 * Start/manage sprints
 */
export const createSprint = async (req, res) => {
  try {
    const { projectId } = req.params;
    const managerId = req.user._id;

    // Verify project ownership
    const project = await Project.findOne({
      _id: projectId,
      projectManager: managerId
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found or access denied'
      });
    }

    const sprint = await Sprint.create({
      ...req.body,
      projectId
    });

    res.status(201).json({
      success: true,
      data: sprint,
      message: 'Sprint created successfully'
    });
  } catch (error) {
    console.error('Error creating sprint:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// ========================================
// 3. TICKET OVERSIGHT
// ========================================

/**
 * View all tickets across modules (bird's-eye view)
 */
export const getAllTickets = async (req, res) => {
  try {
    const managerId = req.user._id;
    const { status, priority, type, search } = req.query;

    // Get all projects managed by this manager
    const projects = await Project.find({
      projectManager: managerId
    }).populate('modules.tickets.assignedDeveloper', 'firstName lastName username')
      .populate('modules.tickets.tester', 'firstName lastName username');

    let allTickets = [];
    
    // Extract tickets from all modules
    projects.forEach(project => {
      project.modules.forEach(module => {
        module.tickets.forEach(ticket => {
          allTickets.push({
            ...ticket.toObject(),
            projectId: project._id,
            projectName: project.name,
            moduleId: module._id,
            moduleName: module.name
          });
        });
      });
    });

    // Apply filters
    if (status) {
      allTickets = allTickets.filter(ticket => ticket.status === status);
    }
    if (priority) {
      allTickets = allTickets.filter(ticket => ticket.priority === priority);
    }
    if (type) {
      allTickets = allTickets.filter(ticket => ticket.type === type);
    }
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      allTickets = allTickets.filter(ticket => 
        searchRegex.test(ticket.title) || 
        searchRegex.test(ticket.description)
      );
    }

    res.json({
      success: true,
      data: allTickets,
      count: allTickets.length
    });
  } catch (error) {
    console.error('Error fetching all tickets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tickets'
    });
  }
};

/**
 * Re-assign tickets (dev ↔ tester)
 */
export const reassignTicket = async (req, res) => {
  try {
    const { projectId, moduleId, ticketId } = req.params;
    const { assignedDeveloper, tester } = req.body;
    const managerId = req.user._id;

    const project = await Project.findOne({
      _id: projectId,
      projectManager: managerId
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found or access denied'
      });
    }

    const module = project.modules.find(
      module => module._id.toString() === moduleId
    );

    if (!module) {
      return res.status(404).json({
        success: false,
        error: 'Module not found'
      });
    }

    const ticket = module.tickets.find(
      ticket => ticket._id.toString() === ticketId
    );

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }

    // Enforce permanent developer binding: once assigned, cannot be changed
    if (assignedDeveloper) {
      if (ticket.assignedDeveloper && ticket.assignedDeveloper.toString() !== assignedDeveloper.toString()) {
        return res.status(400).json({
          success: false,
          error: 'Assigned developer is permanent and cannot be changed once set'
        });
      }
      // If not set before, set now
      if (!ticket.assignedDeveloper) {
        ticket.assignedDeveloper = assignedDeveloper;
      }
    }
    if (tester) ticket.tester = tester;

    await project.save();

    res.json({
      success: true,
      data: ticket,
      message: 'Ticket reassigned successfully'
    });
  } catch (error) {
    console.error('Error reassigning ticket:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Update ticket status (escalate, re-open, or close)
 */
export const updateTicketStatus = async (req, res) => {
  try {
    const { projectId, moduleId, ticketId } = req.params;
    const { status, comment } = req.body;
    const managerId = req.user._id;

    const project = await Project.findOne({
      _id: projectId,
      projectManager: managerId
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found or access denied'
      });
    }

    const module = project.modules.find(
      module => module._id.toString() === moduleId
    );

    if (!module) {
      return res.status(404).json({
        success: false,
        error: 'Module not found'
      });
    }

    const ticket = module.tickets.find(
      ticket => ticket._id.toString() === ticketId
    );

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }

    // Update status
    ticket.status = status;
    
    // Add comment if provided
    if (comment) {
      ticket.comments.push({
        userId: managerId,
        comment: `[Manager Update] ${comment}`,
        createdAt: new Date()
      });
    }

    await project.save();

    res.json({
      success: true,
      data: ticket,
      message: 'Ticket status updated successfully'
    });
  } catch (error) {
    console.error('Error updating ticket status:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Generate ticket reports
 */
export const getTicketReports = async (req, res) => {
  try {
    const managerId = req.user._id;
    const { projectId, dateRange } = req.query;

    let query = { projectManager: managerId };
    if (projectId) query._id = projectId;

    const projects = await Project.find(query).populate('modules.tickets');

    let reportData = {
      totalTickets: 0,
      completedTickets: 0,
      inProgressTickets: 0,
      blockedTickets: 0,
      bugsFixed: 0,
      featuresDone: 0,
      pendingTickets: 0,
      overdueTickets: 0,
      byStatus: {},
      byPriority: {},
      byType: {}
    };

    projects.forEach(project => {
      project.modules.forEach(module => {
        module.tickets.forEach(ticket => {
          reportData.totalTickets++;
          
          // Count by status
          reportData.byStatus[ticket.status] = (reportData.byStatus[ticket.status] || 0) + 1;
          
          // Count by priority
          reportData.byPriority[ticket.priority] = (reportData.byPriority[ticket.priority] || 0) + 1;
          
          // Count by type
          reportData.byType[ticket.type] = (reportData.byType[ticket.type] || 0) + 1;

          // Specific counts
          if (ticket.status === 'done') {
            reportData.completedTickets++;
            if (ticket.type === 'bug') reportData.bugsFixed++;
            if (ticket.type === 'task') reportData.featuresDone++;
          } else if (ticket.status === 'in_progress') {
            reportData.inProgressTickets++;
          } else if (ticket.status === 'blocked') {
            reportData.blockedTickets++;
          } else {
            reportData.pendingTickets++;
          }
        });
      });
    });

    res.json({
      success: true,
      data: reportData
    });
  } catch (error) {
    console.error('Error generating ticket reports:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate reports'
    });
  }
};

// ========================================
// 4. TEAM & RESOURCE MANAGEMENT
// ========================================

/**
 * List employees under a project
 */
export const getProjectTeam = async (req, res) => {
  try {
    const { projectId } = req.params;
    const managerId = req.user._id;

    const project = await Project.findOne({
      _id: projectId,
      projectManager: managerId
    }).populate('teamMembers', 'firstName lastName username email role isActive')
      .populate('modules.moduleLead', 'firstName lastName username')
      .populate('modules.teamMembers', 'firstName lastName username');

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found or access denied'
      });
    }

    // Get unique team members
    const teamMembers = new Map();
    
    // Add project team members
    project.teamMembers.forEach(member => {
      teamMembers.set(member._id.toString(), {
        ...member.toObject(),
        role: 'Team Member',
        projectRole: 'Project Team'
      });
    });

    // Add module leads
    project.modules.forEach(module => {
      if (module.moduleLead) {
        teamMembers.set(module.moduleLead._id.toString(), {
          ...module.moduleLead.toObject(),
          role: 'Module Lead',
          projectRole: `Lead - ${module.name}`
        });
      }
      
      module.teamMembers.forEach(member => {
        if (!teamMembers.has(member._id.toString())) {
          teamMembers.set(member._id.toString(), {
            ...member.toObject(),
            role: 'Module Member',
            projectRole: `Member - ${module.name}`
          });
        }
      });
    });

    res.json({
      success: true,
      data: Array.from(teamMembers.values()),
      count: teamMembers.size
    });
  } catch (error) {
    console.error('Error fetching project team:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project team'
    });
  }
};

/**
 * Assign/remove members as dev/tester
 */
export const assignTeamRole = async (req, res) => {
  try {
    const { projectId, userId } = req.params;
    const { role, moduleId } = req.body;
    const managerId = req.user._id;

    const project = await Project.findOne({
      _id: projectId,
      projectManager: managerId
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found or access denied'
      });
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (moduleId) {
      // Assign to specific module
      const module = project.modules.find(
        module => module._id.toString() === moduleId
      );

      if (!module) {
        return res.status(404).json({
          success: false,
          error: 'Module not found'
        });
      }

      if (role === 'moduleLead') {
        module.moduleLead = userId;
      } else if (role === 'teamMember') {
        if (!module.teamMembers.includes(userId)) {
          module.teamMembers.push(userId);
        }
      }
    } else {
      // Assign to project team
      if (!project.teamMembers.includes(userId)) {
        project.teamMembers.push(userId);
      }
    }

    await project.save();

    res.json({
      success: true,
      message: 'Team role assigned successfully'
    });
  } catch (error) {
    console.error('Error assigning team role:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Check workload for a user
 */
export const getUserWorkload = async (req, res) => {
  try {
    const { userId } = req.params;
    const managerId = req.user._id;

    // Verify manager has access to this user's workload
    const projects = await Project.find({
      projectManager: managerId,
      $or: [
        { teamMembers: userId },
        { 'modules.moduleLead': userId },
        { 'modules.teamMembers': userId }
      ]
    });

    if (projects.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to user workload'
      });
    }

    let totalTickets = 0;
    let inProgressTickets = 0;
    let completedTickets = 0;
    let estimatedHours = 0;
    let actualHours = 0;

    projects.forEach(project => {
      project.modules.forEach(module => {
        module.tickets.forEach(ticket => {
          if (ticket.assignedDeveloper?.toString() === userId) {
            totalTickets++;
            estimatedHours += ticket.estimatedHours || 0;
            actualHours += ticket.actualHours || 0;

            if (ticket.status === 'in_progress') {
              inProgressTickets++;
            } else if (ticket.status === 'done') {
              completedTickets++;
            }
          }
        });
      });
    });

    const workload = {
      userId,
      totalTickets,
      inProgressTickets,
      completedTickets,
      estimatedHours,
      actualHours,
      completionRate: totalTickets > 0 ? Math.round((completedTickets / totalTickets) * 100) : 0,
      workloadLevel: totalTickets > 10 ? 'High' : totalTickets > 5 ? 'Medium' : 'Low'
    };

    res.json({
      success: true,
      data: workload
    });
  } catch (error) {
    console.error('Error fetching user workload:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user workload'
    });
  }
};

/**
 * Record daily standup summary for team
 */
export const recordTeamStandup = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { date, summary, highlights, blockers, nextSteps } = req.body;
    const managerId = req.user._id;

    // Verify project ownership
    const project = await Project.findOne({
      _id: projectId,
      projectManager: managerId
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found or access denied'
      });
    }

    // Create or update standup
    const standupData = {
      projectId,
      date: date || new Date(),
      status: 'completed',
      attendees: project.teamMembers,
      updates: [{
        developerId: managerId,
        tasks: [],
        blockers: blockers || [],
        outcomes: highlights || [],
        nextSteps: nextSteps || [],
        attendanceConfirmed: true
      }]
    };

    const standup = await Standup.findOneAndUpdate(
      { projectId, date: new Date(date) },
      standupData,
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      data: standup,
      message: 'Team standup recorded successfully'
    });
  } catch (error) {
    console.error('Error recording team standup:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// ========================================
// 5. KANBAN & SPRINT MONITORING
// ========================================

/**
 * Get Kanban view of all tickets for a project
 */
export const getProjectKanban = async (req, res) => {
  try {
    const { projectId } = req.params;
    const managerId = req.user._id;

    const project = await Project.findOne({
      _id: projectId,
      projectManager: managerId
    }).populate('modules.tickets.assignedDeveloper', 'firstName lastName username')
      .populate('modules.tickets.tester', 'firstName lastName username');

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found or access denied'
      });
    }

    // Organize tickets by status for Kanban view
    const kanbanColumns = {
      todo: [],
      inProgress: [],
      review: [],
      testing: [],
      done: []
    };

    project.modules.forEach(module => {
      module.tickets.forEach(ticket => {
        const ticketWithContext = {
          ...ticket.toObject(),
          moduleId: module._id,
          moduleName: module.name,
          projectId: project._id,
          projectName: project.name
        };

        switch (ticket.status) {
          case 'open':
            kanbanColumns.todo.push(ticketWithContext);
            break;
          case 'in_progress':
            kanbanColumns.inProgress.push(ticketWithContext);
            break;
          case 'code_review':
            kanbanColumns.review.push(ticketWithContext);
            break;
          case 'testing':
            kanbanColumns.testing.push(ticketWithContext);
            break;
          case 'done':
            kanbanColumns.done.push(ticketWithContext);
            break;
        }
      });
    });

    res.json({
      success: true,
      data: {
        projectId,
        projectName: project.name,
        modules: project.modules,
        columns: kanbanColumns
      }
    });
  } catch (error) {
    console.error('Error fetching project kanban:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project kanban'
    });
  }
};

/**
 * Get sprint summary with velocity and burndown
 */
export const getSprintSummary = async (req, res) => {
  try {
    const { id } = req.params;
    const managerId = req.user._id;

    const sprint = await Sprint.findById(id).populate('projectId', 'name projectManager');

    if (!sprint) {
      return res.status(404).json({
        success: false,
        error: 'Sprint not found'
      });
    }

    // Verify project ownership
    if (sprint.projectId.projectManager.toString() !== managerId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to sprint'
      });
    }

    // Calculate sprint metrics
    const totalDays = Math.ceil((sprint.endDate - sprint.startDate) / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.ceil((new Date() - sprint.startDate) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, totalDays - daysElapsed);
    
    const velocity = sprint.completedStoryPoints / Math.max(1, daysElapsed);
    const projectedCompletion = sprint.plannedStoryPoints / Math.max(velocity, 1);
    const isOnTrack = projectedCompletion <= totalDays;

    const summary = {
      sprint,
      metrics: {
        totalDays,
        daysElapsed,
        daysRemaining,
        velocity,
        projectedCompletion,
        isOnTrack,
        completionPercentage: sprint.plannedStoryPoints > 0 ? 
          Math.round((sprint.completedStoryPoints / sprint.plannedStoryPoints) * 100) : 0
      }
    };

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error fetching sprint summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sprint summary'
    });
  }
};

/**
 * Extend/close sprint
 */
export const updateSprint = async (req, res) => {
  try {
    const { id } = req.params;
    const { endDate, status, goal } = req.body;
    const managerId = req.user._id;

    const sprint = await Sprint.findById(id).populate('projectId', 'projectManager');

    if (!sprint) {
      return res.status(404).json({
        success: false,
        error: 'Sprint not found'
      });
    }

    // Verify project ownership
    if (sprint.projectId.projectManager.toString() !== managerId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to sprint'
      });
    }

    // Update sprint
    if (endDate) sprint.endDate = endDate;
    if (status) sprint.status = status;
    if (goal) sprint.goal = goal;

    await sprint.save();

    res.json({
      success: true,
      data: sprint,
      message: 'Sprint updated successfully'
    });
  } catch (error) {
    console.error('Error updating sprint:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// ========================================
// 6. REPORTING & ANALYTICS
// ========================================

/**
 * Get project analytics and progress
 */
export const getProjectAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const managerId = req.user._id;

    const project = await Project.findOne({
      _id: id,
      projectManager: managerId
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found or access denied'
      });
    }

    // Calculate project statistics
    let totalTickets = 0;
    let completedTickets = 0;
    let totalStoryPoints = 0;
    let completedStoryPoints = 0;
    let totalEstimatedHours = 0;
    let totalActualHours = 0;

    project.modules.forEach(module => {
      totalTickets += module.tickets.length;
      completedTickets += module.tickets.filter(ticket => ticket.status === 'done').length;
      
      module.tickets.forEach(ticket => {
        totalStoryPoints += ticket.storyPoints || 0;
        if (ticket.status === 'done') {
          completedStoryPoints += ticket.storyPoints || 0;
        }
        totalEstimatedHours += ticket.estimatedHours || 0;
        totalActualHours += ticket.actualHours || 0;
      });
    });

    const analytics = {
      projectId: id,
      projectName: project.name,
      progress: {
        totalTickets,
        completedTickets,
        completionPercentage: totalTickets > 0 ? Math.round((completedTickets / totalTickets) * 100) : 0,
        totalStoryPoints,
        completedStoryPoints,
        storyPointCompletion: totalStoryPoints > 0 ? Math.round((completedStoryPoints / totalStoryPoints) * 100) : 0
      },
      timeTracking: {
        totalEstimatedHours,
        totalActualHours,
        timeVariance: totalActualHours - totalEstimatedHours,
        efficiency: totalEstimatedHours > 0 ? Math.round((totalEstimatedHours / totalActualHours) * 100) : 0
      },
      modules: project.modules.map(module => ({
        moduleId: module._id,
        name: module.name,
        status: module.status,
        completionPercentage: module.completionPercentage,
        ticketCount: module.tickets.length,
        completedTickets: module.tickets.filter(ticket => ticket.status === 'done').length
      }))
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching project analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project analytics'
    });
  }
};

/**
 * Get team productivity metrics
 */
export const getTeamAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const managerId = req.user._id;

    const project = await Project.findOne({
      _id: id,
      projectManager: managerId
    }).populate('teamMembers', 'firstName lastName username role')
      .populate('modules.tickets.assignedDeveloper', 'firstName lastName username')
      .populate('modules.tickets.tester', 'firstName lastName username');

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found or access denied'
      });
    }

    // Calculate team member productivity
    const teamMetrics = new Map();

    project.teamMembers.forEach(member => {
      teamMetrics.set(member._id.toString(), {
        userId: member._id,
        name: `${member.firstName} ${member.lastName}`,
        username: member.username,
        role: member.role,
        totalTickets: 0,
        completedTickets: 0,
        inProgressTickets: 0,
        totalStoryPoints: 0,
        completedStoryPoints: 0,
        totalHours: 0,
        bugsReopened: 0
      });
    });

    // Aggregate ticket data by team member
    project.modules.forEach(module => {
      module.tickets.forEach(ticket => {
        if (ticket.assignedDeveloper) {
          const memberId = ticket.assignedDeveloper._id.toString();
          if (teamMetrics.has(memberId)) {
            const metrics = teamMetrics.get(memberId);
            metrics.totalTickets++;
            metrics.totalStoryPoints += ticket.storyPoints || 0;
            metrics.totalHours += ticket.actualHours || 0;

            if (ticket.status === 'done') {
              metrics.completedTickets++;
              metrics.completedStoryPoints += ticket.storyPoints || 0;
            } else if (ticket.status === 'in_progress') {
              metrics.inProgressTickets++;
            }
          }
        }
      });
    });

    // Calculate productivity scores
    const teamAnalytics = Array.from(teamMetrics.values()).map(metrics => ({
      ...metrics,
      completionRate: metrics.totalTickets > 0 ? Math.round((metrics.completedTickets / metrics.totalTickets) * 100) : 0,
      storyPointVelocity: metrics.completedStoryPoints,
      averageHoursPerTicket: metrics.totalTickets > 0 ? Math.round(metrics.totalHours / metrics.totalTickets * 10) / 10 : 0
    }));

    res.json({
      success: true,
      data: {
        projectId: id,
        projectName: project.name,
        teamMetrics: teamAnalytics,
        summary: {
          totalTeamMembers: teamAnalytics.length,
          averageCompletionRate: teamAnalytics.length > 0 ? 
            Math.round(teamAnalytics.reduce((sum, member) => sum + member.completionRate, 0) / teamAnalytics.length) : 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching team analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch team analytics'
    });
  }
};

/**
 * Get project risks and blockers
 */
export const getProjectRisks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const managerId = req.user._id;

    const project = await Project.findOne({
      _id: projectId,
      projectManager: managerId
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found or access denied'
      });
    }

    const risks = [];
    const blockers = [];

    // Analyze modules for risks
    project.modules.forEach(module => {
      if (module.status === 'on_hold') {
        risks.push({
          type: 'Module On Hold',
          severity: 'High',
          description: `Module "${module.name}" is currently on hold`,
          moduleId: module._id,
          moduleName: module.name
        });
      }

      if (module.completionPercentage < 50 && new Date(module.endDate) < new Date()) {
        risks.push({
          type: 'Module Overdue',
          severity: 'Critical',
          description: `Module "${module.name}" is overdue and only ${module.completionPercentage}% complete`,
          moduleId: module._id,
          moduleName: module.name,
          endDate: module.endDate
        });
      }
    });

    // Analyze tickets for blockers
    project.modules.forEach(module => {
      module.tickets.forEach(ticket => {
        if (ticket.status === 'blocked') {
          blockers.push({
            ticketId: ticket._id,
            ticketNumber: ticket.ticketNumber,
            title: ticket.title,
            moduleId: module._id,
            moduleName: module.name,
            assignedDeveloper: ticket.assignedDeveloper,
            priority: ticket.priority,
            type: ticket.type
          });
        }

        if (ticket.status === 'open' && new Date() > new Date(ticket.dueDate)) {
          risks.push({
            type: 'Ticket Overdue',
            severity: ticket.priority === 'critical' ? 'Critical' : 'High',
            description: `Ticket "${ticket.title}" is overdue`,
            ticketId: ticket._id,
            ticketNumber: ticket.ticketNumber,
            moduleName: module.name,
            dueDate: ticket.dueDate
          });
        }
      });
    });

    const riskAssessment = {
      projectId,
      projectName: project.name,
      totalRisks: risks.length,
      totalBlockers: blockers.length,
      riskLevel: risks.length > 5 ? 'High' : risks.length > 2 ? 'Medium' : 'Low',
      risks,
      blockers,
      recommendations: []
    };

    // Generate recommendations
    if (blockers.length > 0) {
      riskAssessment.recommendations.push('Address blocked tickets to improve workflow');
    }
    if (risks.filter(r => r.severity === 'Critical').length > 0) {
      riskAssessment.recommendations.push('Critical risks require immediate attention');
    }
    if (project.status === 'active' && risks.length > 3) {
      riskAssessment.recommendations.push('Consider project review meeting to address multiple risks');
    }

    res.json({
      success: true,
      data: riskAssessment
    });
  } catch (error) {
    console.error('Error fetching project risks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project risks'
    });
  }
};

/**
 * Get Manager dashboard statistics
 */
export const getManagerStats = async (req, res) => {
  try {
    const managerId = req.user._id;
    
    // Get projects managed by this manager
    const projects = await Project.find({ projectManager: managerId });
    const projectIds = projects.map(p => p._id);
    
    // Calculate project statistics
    const projectStats = {
      total: projects.length,
      active: projects.filter(p => p.status === 'active').length,
      completed: projects.filter(p => p.status === 'completed').length,
      onHold: projects.filter(p => p.status === 'on-hold').length
    };
    
    // Get team members across all projects
    const allTeamMembers = new Set();
    projects.forEach(project => {
      project.teamMembers.forEach(member => allTeamMembers.add(member.toString()));
    });
    
    // Get sprints for managed projects
    const sprints = await Sprint.find({ projectId: { $in: projectIds } });
    const sprintStats = {
      total: sprints.length,
      active: sprints.filter(s => s.status === 'active').length,
      completed: sprints.filter(s => s.status === 'completed').length,
      planned: sprints.filter(s => s.status === 'planned').length
    };
    
    // Calculate real ticket statistics from project modules
    let totalTickets = 0;
    let openTickets = 0;
    let inProgressTickets = 0;
    let completedTickets = 0;
    let blockedTickets = 0;

    projects.forEach(project => {
      project.modules?.forEach(module => {
        module.tickets?.forEach(ticket => {
          totalTickets++;
          switch (ticket.status) {
            case 'open':
              openTickets++;
              break;
            case 'in-progress':
            case 'development':
            case 'testing':
              inProgressTickets++;
              break;
            case 'done':
            case 'completed':
              completedTickets++;
              break;
            case 'blocked':
              blockedTickets++;
              break;
          }
        });
      });
    });

    const ticketStats = {
      total: totalTickets,
      open: openTickets,
      inProgress: inProgressTickets,
      completed: completedTickets,
      blocked: blockedTickets
    };
    
    // Calculate team performance metrics
    const teamStats = {
      totalMembers: allTeamMembers.size,
      activeProjects: projectStats.active,
      avgProjectSize: allTeamMembers.size > 0 ? Math.round(allTeamMembers.size / Math.max(projectStats.total, 1)) : 0,
      productivity: Math.round((ticketStats.completed / Math.max(ticketStats.total, 1)) * 100)
    };
    
    const stats = {
      projects: projectStats,
      sprints: sprintStats,
      tickets: ticketStats,
      team: teamStats,
      overview: {
        managedProjects: projectStats.total,
        teamSize: allTeamMembers.size,
        completionRate: Math.round((projectStats.completed / Math.max(projectStats.total, 1)) * 100),
        activeWorkload: projectStats.active + sprintStats.active
      }
    };

    return res.status(200).json({
      success: true,
      message: 'Manager statistics retrieved successfully',
      stats
    });

  } catch (error) {
    console.error('Error getting manager stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while getting manager statistics',
      error: error.message
    });
  }
};

/**
 * Get team management data for manager
 */
export const getTeamManagement = async (req, res) => {
  try {
    const managerId = req.user.id;

    // Get all projects managed by this manager
    const projects = await Project.find({ 
      $or: [
        { manager: managerId },
        { 'team.manager': managerId }
      ]
    }).populate('team.members', 'username email role firstName lastName isActive');

    // Get all team members from managed projects
    const allTeamMembers = new Set();
    const teamData = [];

    projects.forEach(project => {
      if (project.team && project.team.members) {
        project.team.members.forEach(member => {
          if (!allTeamMembers.has(member._id.toString())) {
            allTeamMembers.add(member._id.toString());
            teamData.push({
              id: member._id,
              username: member.username,
              email: member.email,
              role: member.role,
              firstName: member.firstName,
              lastName: member.lastName,
              isActive: member.isActive,
              projects: [project.name],
              // Remove mock performance data - would come from task/project tracking
              projectCount: 1
            });
          } else {
            // Add project to existing team member
            const existingMember = teamData.find(tm => tm.id.toString() === member._id.toString());
            if (existingMember && !existingMember.projects.includes(project.name)) {
              existingMember.projects.push(project.name);
              existingMember.projectCount++;
            }
          }
        });
      }
    });

    // Get team statistics
    const teamStats = {
      totalMembers: teamData.length,
      activeMembers: teamData.filter(member => member.isActive).length,
      roleDistribution: teamData.reduce((acc, member) => {
        acc[member.role] = (acc[member.role] || 0) + 1;
        return acc;
      }, {}),
      averageProjectsPerMember: teamData.length > 0 
        ? Math.round(teamData.reduce((sum, member) => sum + member.projectCount, 0) / teamData.length)
        : 0
    };

    return res.status(200).json({
      success: true,
      message: 'Team management data retrieved successfully',
      team: {
        members: teamData,
        statistics: teamStats,
        projects: projects.map(p => ({
          id: p._id,
          name: p.name,
          status: p.status,
          teamSize: p.team?.members?.length || 0
        }))
      }
    });

  } catch (error) {
    console.error('Error getting team management data:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while getting team management data',
      error: error.message
    });
  }
};
