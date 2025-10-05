// tester.controller.js - Tester Controller
import mongoose from 'mongoose';
import { BugTracker } from '../models/index.js';
import { Project } from '../models/index.js';
import { User } from '../models/index.js';
import { emitTicketEvent } from '../utils/realtime.js';

/**
 * Get projects where the tester is a team member
 */
export const getMyTestingProjects = async (req, res) => {
  try {
    const testerId = req.user._id;

    const projects = await Project.find({
      teamMembers: testerId,
      status: { $in: ['active', 'planning'] }
    })
      .select('name status description startDate endDate projectManager createdAt updatedAt')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      projects,
      count: projects.length
    });
  } catch (error) {
    console.error('Error fetching tester projects:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tester projects'
    });
  }
};

// ========================================
// 1. BUG TRACKING & MANAGEMENT
// ========================================

/**
 * Get all bugs reported by the current tester
 */
export const getMyReportedBugs = async (req, res) => {
  try {
    const testerId = req.user._id;
    const { status, severity, bugType, projectId } = req.query;

    let query = { reportedBy: testerId };

    // Apply filters
    if (status) query.status = status;
    if (severity) query.severity = severity;
    if (bugType) query.bugType = bugType;
    if (projectId) query.projectId = projectId;

    const bugs = await BugTracker.find(query)
      .populate('projectId', 'name')
      .populate('assignedTo', 'firstName lastName username')
      .populate('resolvedBy', 'firstName lastName username')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: bugs,
      count: bugs.length
    });
  } catch (error) {
    console.error('Error fetching reported bugs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reported bugs'
    });
  }
};

/**
 * Get all bugs accessible to the current tester (reported or assigned)
 */
export const getAllBugs = async (req, res) => {
  try {
    const testerId = req.user._id;
    const { status, severity, bugType, projectId } = req.query;

    let query = {
      $or: [
        { reportedBy: testerId },
        { assignedTo: testerId }
      ]
    };

    // Apply filters
    if (status) query.status = status;
    if (severity) query.severity = severity;
    if (bugType) query.bugType = bugType;
    if (projectId) query.projectId = projectId;

    const bugs = await BugTracker.find(query)
      .populate('projectId', 'name')
      .populate('assignedTo', 'firstName lastName username')
      .populate('reportedBy', 'firstName lastName username')
      .populate('resolvedBy', 'firstName lastName username')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: bugs,
      count: bugs.length
    });
  } catch (error) {
    console.error('Error fetching all bugs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bugs'
    });
  }
};

/**
 * Create a new bug report
 */
export const createBugReport = async (req, res) => {
  try {
    const testerId = req.user._id;
    const bugData = {
      ...req.body,
      reportedBy: testerId,
      status: 'new'
    };

    // Validate required fields
    if (!bugData.projectId || !bugData.title || !bugData.description || !bugData.severity || !bugData.bugType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: projectId, title, description, severity, bugType'
      });
    }

    // Generate unique bug number
    const bugCount = await BugTracker.countDocuments({ projectId: bugData.projectId });
    bugData.bugNumber = `BUG-${String(bugCount + 1).padStart(3, '0')}`;

    const bug = await BugTracker.create(bugData);

    const populatedBug = await BugTracker.findById(bug._id)
      .populate('projectId', 'name')
      .populate('reportedBy', 'firstName lastName username');

    res.status(201).json({
      success: true,
      data: populatedBug,
      message: 'Bug report created successfully'
    });
  } catch (error) {
    console.error('Error creating bug report:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Update bug report details
 */
export const updateBugReport = async (req, res) => {
  try {
    const { id } = req.params;
    const testerId = req.user._id;

    const bug = await BugTracker.findOne({
      _id: id,
      reportedBy: testerId
    });

    if (!bug) {
      return res.status(404).json({
        success: false,
        error: 'Bug not found or access denied'
      });
    }

    // Only allow updating certain fields for reported bugs
    const allowedUpdates = ['title', 'description', 'severity', 'bugType', 'stepsToReproduce', 'expectedBehavior', 'actualBehavior', 'foundInVersion', 'attachments'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    Object.assign(bug, updates);
    await bug.save();

    const updatedBug = await BugTracker.findById(bug._id)
      .populate('projectId', 'name')
      .populate('reportedBy', 'firstName lastName username')
      .populate('assignedTo', 'firstName lastName username');

    res.json({
      success: true,
      data: updatedBug,
      message: 'Bug report updated successfully'
    });
  } catch (error) {
    console.error('Error updating bug report:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Add comment to bug report
 */
export const addBugComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const testerId = req.user._id;

    if (!comment || comment.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Comment cannot be empty'
      });
    }

    const bug = await BugTracker.findById(id);

    if (!bug) {
      return res.status(404).json({
        success: false,
        error: 'Bug not found'
      });
    }

    // Verify tester has access to this bug
    if (bug.reportedBy.toString() !== testerId && bug.assignedTo?.toString() !== testerId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this bug'
      });
    }

    bug.comments.push({
      userId: testerId,
      comment: comment.trim()
    });

    await bug.save();

    const updatedBug = await BugTracker.findById(bug._id)
      .populate('projectId', 'name')
      .populate('reportedBy', 'firstName lastName username')
      .populate('assignedTo', 'firstName lastName username')
      .populate('comments.userId', 'firstName lastName username');

    res.json({
      success: true,
      data: updatedBug,
      message: 'Comment added successfully'
    });
  } catch (error) {
    console.error('Error adding bug comment:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Reopen a bug that was marked as resolved
 */
export const reopenBug = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const testerId = req.user._id;

    const bug = await BugTracker.findById(id);

    if (!bug) {
      return res.status(404).json({
        success: false,
        error: 'Bug not found'
      });
    }

    // Verify tester has access to this bug
    if (bug.reportedBy.toString() !== testerId && bug.assignedTo?.toString() !== testerId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this bug'
      });
    }

    if (bug.status !== 'resolved') {
      return res.status(400).json({
        success: false,
        error: 'Bug must be in resolved status to reopen'
      });
    }

    bug.status = 'reopened';
    bug.testingNotes = reason || 'Bug reopened by tester - issue still exists';

    await bug.save();

    const updatedBug = await BugTracker.findById(bug._id)
      .populate('projectId', 'name')
      .populate('reportedBy', 'firstName lastName username')
      .populate('assignedTo', 'firstName lastName username');

    res.json({
      success: true,
      data: updatedBug,
      message: 'Bug reopened successfully'
    });
  } catch (error) {
    console.error('Error reopening bug:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Close a bug after verification
 */
export const closeBug = async (req, res) => {
  try {
    const { id } = req.params;
    const { testingNotes } = req.body;
    const testerId = req.user._id;

    const bug = await BugTracker.findById(id);

    if (!bug) {
      return res.status(404).json({
        success: false,
        error: 'Bug not found'
      });
    }

    // Verify tester has access to this bug
    if (bug.reportedBy.toString() !== testerId && bug.assignedTo?.toString() !== testerId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this bug'
      });
    }

    if (bug.status !== 'resolved') {
      return res.status(400).json({
        success: false,
        error: 'Bug must be in resolved status to close'
      });
    }

    bug.status = 'closed';
    bug.testingNotes = testingNotes || 'Bug verified and closed by tester';
    bug.testedBy = testerId;

    await bug.save();

    const updatedBug = await BugTracker.findById(bug._id)
      .populate('projectId', 'name')
      .populate('reportedBy', 'firstName lastName username')
      .populate('assignedTo', 'firstName lastName username')
      .populate('testedBy', 'firstName lastName username');

    res.json({
      success: true,
      data: updatedBug,
      message: 'Bug closed successfully'
    });
  } catch (error) {
    console.error('Error closing bug:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// ========================================
// 2. TICKET TESTING & VERIFICATION
// ========================================

/**
 * Get all bugs assigned to the current tester for testing
 */
export const getMyAssignedBugs = async (req, res) => {
  try {
    const testerId = req.user._id;
    const { status, severity, bugType, projectId } = req.query;

    let query = { assignedTo: testerId };

    // Apply filters
    if (status) query.status = status;
    if (severity) query.severity = severity;
    if (bugType) query.bugType = bugType;
    if (projectId) query.projectId = projectId;

    const bugs = await BugTracker.find(query)
      .populate('projectId', 'name')
      .populate('reportedBy', 'firstName lastName username')
      .populate('resolvedBy', 'firstName lastName username')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: bugs,
      count: bugs.length
    });
  } catch (error) {
    console.error('Error fetching assigned bugs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch assigned bugs'
    });
  }
};

/**
 * Get tickets assigned to the current tester for testing
 */
export const getMyTestTickets = async (req, res) => {
  try {
    const testerId = req.user._id;
    const { status, priority, type, projectId, search } = req.query;

    // Find projects where the tester is assigned tickets
    let query = {};
    if (projectId) query._id = projectId;

    const projects = await Project.find(query)
      .populate({
        path: 'modules.tickets',
        match: { tester: testerId },
        populate: [
          { path: 'assignedDeveloper', select: 'firstName lastName username' },
          { path: 'tester', select: 'firstName lastName username' }
        ]
      })
      .populate('modules.moduleLead', 'firstName lastName username');

    let testTickets = [];

    projects.forEach(project => {
      project.modules.forEach(module => {
        module.tickets.forEach(ticket => {
          if (ticket.tester && ticket.tester._id.toString() === testerId) {
            testTickets.push({
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

    // Apply filters
    if (status) {
      testTickets = testTickets.filter(ticket => ticket.status === status);
    }
    if (priority) {
      testTickets = testTickets.filter(ticket => ticket.priority === priority);
    }
    if (type) {
      testTickets = testTickets.filter(ticket => ticket.type === type);
    }
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      testTickets = testTickets.filter(ticket => 
        searchRegex.test(ticket.title) || 
        searchRegex.test(ticket.description)
      );
    }

    res.json({
      success: true,
      data: testTickets,
      count: testTickets.length
    });
  } catch (error) {
    console.error('Error fetching test tickets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch test tickets'
    });
  }
};

/**
 * Update ticket status during testing
 */
export const updateTicketTestStatus = async (req, res) => {
  try {
    const { projectId, moduleId, ticketId } = req.params;
    const { status, testingNotes, actualHours } = req.body;
    const testerId = req.user._id;

    const project = await Project.findOne({
      _id: projectId
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
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

    // Verify tester is assigned to this ticket
    if (ticket.tester.toString() !== testerId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this ticket'
      });
    }

    // Update ticket status and testing information
    if (status) ticket.status = status;
    if (testingNotes) ticket.testingNotes = testingNotes;
    if (actualHours !== undefined) ticket.actualHours = actualHours;

    // Add testing comment
    ticket.comments.push({
      userId: testerId,
      comment: `[Testing Update] Status changed to ${status || ticket.status}. ${testingNotes || ''}`,
      createdAt: new Date()
    });

    await project.save();

    res.json({
      success: true,
      data: ticket,
      message: 'Ticket test status updated successfully'
    });
  } catch (error) {
    console.error('Error updating ticket test status:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Create bug report from failed ticket testing
 */
export const createBugFromTicket = async (req, res) => {
  try {
    const { projectId, moduleId, ticketId } = req.params;
    const { title, description, severity, bugType, stepsToReproduce, expectedBehavior, actualBehavior } = req.body;
    const testerId = req.user._id;

    const project = await Project.findOne({
      _id: projectId
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
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

    // Verify tester is assigned to this ticket
    if (ticket.tester?.toString() !== testerId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this ticket'
      });
    }

    if (!title || !description || !severity || !bugType) {
      return res.status(400).json({
        success: false,
        error: 'title, description, severity, and bugType are required'
      });
    }

    const existingBug = await BugTracker.findOne({
      projectId,
      ticketId,
      title: { $regex: new RegExp(`^${title}$`, 'i') }
    });
    if (existingBug) {
      return res.status(409).json({
        success: false,
        error: 'A bug with this title already exists for this ticket'
      });
    }

    // Create bug report
    const developerId = ticket.assignedDeveloper ? ticket.assignedDeveloper.toString() : null;

    const bugData = {
      projectId,
      ticketId,
      title,
      description,
      severity,
      bugType,
      stepsToReproduce,
      expectedBehavior,
      actualBehavior,
      foundInVersion: ticket.foundInVersion || 'Current',
      reportedBy: testerId,
      status: 'new',
      assignedTo: ticket.assignedDeveloper || null,
      watchers: [testerId, ticket.assignedDeveloper].filter(Boolean)
    };

    // Generate unique bug number
    const bugCount = await BugTracker.countDocuments({ projectId });
    const projectCodeSource = project?.projectCode || project?.code || project?.name || projectId.toString();
    const projectPrefix = (projectCodeSource || 'PRJ')
      .toString()
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase()
      .slice(0, 4) || projectId.toString().slice(-4).toUpperCase();
    bugData.bugNumber = `BUG-${projectPrefix}-${String(bugCount + 1).padStart(4, '0')}`;

    const bug = await BugTracker.create(bugData);

    // Update ticket with bug references
    ticket.bugTrackerId = bug._id;
    if (!Array.isArray(ticket.bugTrackerIds)) {
      ticket.bugTrackerIds = [];
    }
    ticket.bugTrackerIds.push(bug._id);
    ticket.status = 'open';
    ticket.comments.push({
      userId: testerId,
      comment: `Bug created from testing: ${bug.bugNumber}`,
      createdAt: new Date()
    });

    await project.save();

    emitTicketEvent({
      projectId: projectId.toString(),
      userIds: [developerId, testerId.toString()].filter(Boolean),
      type: 'ticket.bug_reported',
      data: {
        ticketId: ticket._id.toString(),
        bugId: bug._id.toString(),
        status: ticket.status
      }
    });

    const populatedBug = await BugTracker.findById(bug._id)
      .populate('projectId', 'name')
      .populate('reportedBy', 'firstName lastName username');

    const ticketBugs = await BugTracker.find({ projectId, ticketId })
      .sort({ createdAt: -1 })
      .select('bugNumber title severity status createdAt');

    res.status(201).json({
      success: true,
      data: {
        bug: populatedBug,
        ticket: {
          ...ticket.toObject(),
          bugTrackerIds: ticket.bugTrackerIds,
          bugTrackerId: ticket.bugTrackerId,
          bugs: ticketBugs
        }
      },
      message: 'Bug created from ticket testing successfully'
    });
  } catch (error) {
    console.error('Error creating bug from ticket:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// ========================================
// 3. TEST CASE MANAGEMENT
// ========================================

/**
 * Get test cases for a specific project/module
 */
export const getTestCases = async (req, res) => {
  try {
    const { projectId, moduleId } = req.params;
    const testerId = req.user._id;

    const project = await Project.findOne({
      _id: projectId
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
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

    // Get tickets assigned to this tester in this module
    const testTickets = module.tickets.filter(
      ticket => ticket.tester && ticket.tester.toString() === testerId
    );

    // Generate test cases from tickets
    const testCases = testTickets.map(ticket => ({
      ticketId: ticket._id,
      ticketNumber: ticket.ticketNumber,
      title: ticket.title,
      description: ticket.description,
      type: ticket.type,
      priority: ticket.priority,
      status: ticket.status,
      testSteps: [
        {
          step: 1,
          action: `Verify ${ticket.title}`,
          expectedResult: ticket.description || 'Functionality works as expected'
        }
      ],
      testData: 'Use appropriate test data based on ticket requirements',
      prerequisites: 'Ensure development environment is set up',
      estimatedTime: ticket.estimatedHours || 1
    }));

    res.json({
      success: true,
      data: {
        projectId,
        projectName: project.name,
        moduleId,
        moduleName: module.name,
        testCases,
        count: testCases.length
      }
    });
  } catch (error) {
    console.error('Error fetching test cases:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch test cases'
    });
  }
};

/**
 * Update test case execution results
 */
export const updateTestCaseResult = async (req, res) => {
  try {
    const { projectId, moduleId, ticketId } = req.params;
    const { testResult, testNotes, executionTime, defects } = req.body;
    const testerId = req.user._id;

    const project = await Project.findOne({
      _id: projectId
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
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

    // Verify tester is assigned to this ticket
    if (ticket.tester.toString() !== testerId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this ticket'
      });
    }

    // Update ticket with test results
    ticket.testingNotes = testNotes || '';
    ticket.actualHours = (ticket.actualHours || 0) + (executionTime || 0);

    // Update status based on test result
    if (testResult === 'passed') {
      ticket.status = 'done';
    } else if (testResult === 'failed') {
      ticket.status = 'testing';
    }

    // Add test execution comment
    ticket.comments.push({
      userId: testerId,
      comment: `[Test Execution] Result: ${testResult}. ${testNotes || ''} ${defects ? `Defects found: ${defects}` : ''}`,
      createdAt: new Date()
    });

    await project.save();

    res.json({
      success: true,
      data: ticket,
      message: 'Test case result updated successfully'
    });
  } catch (error) {
    console.error('Error updating test case result:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// ========================================
// 4. QUALITY ASSURANCE & REPORTING
// ========================================

/**
 * Get testing dashboard for the current tester
 */
export const getTestingDashboard = async (req, res) => {
  try {
    const testerId = req.user._id;

    // Get bugs reported by this tester
    const reportedBugs = await BugTracker.find({ reportedBy: testerId });
    const assignedBugs = await BugTracker.find({ assignedTo: testerId });

    // Get test tickets
    const projects = await Project.find()
      .populate({
        path: 'modules.tickets',
        match: { tester: testerId },
        populate: [
          { path: 'assignedDeveloper', select: 'firstName lastName username' },
          { path: 'tester', select: 'firstName lastName username' }
        ]
      });

    let testTickets = [];
    projects.forEach(project => {
      project.modules.forEach(module => {
        module.tickets.forEach(ticket => {
          if (ticket.tester && ticket.tester._id.toString() === testerId) {
            testTickets.push({
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

    // Calculate statistics
    const dashboard = {
      bugs: {
        totalReported: reportedBugs.length,
        totalAssigned: assignedBugs.length,
        byStatus: {
          new: reportedBugs.filter(bug => bug.status === 'new').length,
          assigned: reportedBugs.filter(bug => bug.status === 'assigned').length,
          in_progress: reportedBugs.filter(bug => bug.status === 'in_progress').length,
          resolved: reportedBugs.filter(bug => bug.status === 'resolved').length,
          closed: reportedBugs.filter(bug => bug.status === 'closed').length,
          reopened: reportedBugs.filter(bug => bug.status === 'reopened').length
        },
        bySeverity: {
          low: reportedBugs.filter(bug => bug.severity === 'low').length,
          medium: reportedBugs.filter(bug => bug.severity === 'medium').length,
          high: reportedBugs.filter(bug => bug.severity === 'high').length,
          critical: reportedBugs.filter(bug => bug.severity === 'critical').length
        }
      },
      tickets: {
        total: testTickets.length,
        byStatus: {
          open: testTickets.filter(ticket => ticket.status === 'open').length,
          in_progress: testTickets.filter(bug => bug.status === 'in_progress').length,
          testing: testTickets.filter(ticket => ticket.status === 'testing').length,
          code_review: testTickets.filter(ticket => ticket.status === 'code_review').length,
          done: testTickets.filter(ticket => ticket.status === 'done').length,
          blocked: testTickets.filter(ticket => ticket.status === 'blocked').length
        },
        byPriority: {
          low: testTickets.filter(ticket => ticket.priority === 'low').length,
          medium: testTickets.filter(ticket => ticket.priority === 'medium').length,
          high: testTickets.filter(ticket => ticket.priority === 'high').length,
          critical: testTickets.filter(ticket => ticket.priority === 'critical').length
        }
      },
      recentActivity: {
        recentBugs: reportedBugs.slice(0, 5).map(bug => ({
          id: bug._id,
          bugNumber: bug.bugNumber,
          title: bug.title,
          status: bug.status,
          createdAt: bug.createdAt
        })),
        recentTickets: testTickets.slice(0, 5).map(ticket => ({
          id: ticket._id,
          ticketNumber: ticket.ticketNumber,
          title: ticket.title,
          status: ticket.status,
          projectName: ticket.projectName
        }))
      }
    };

    res.json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    console.error('Error fetching testing dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch testing dashboard'
    });
  }
};

/**
 * Generate testing report for a project
 */
export const generateTestingReport = async (req, res) => {
  try {
    const { projectId } = req.params;
    const testerId = req.user._id;
    const { startDate, endDate } = req.query;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Get bugs reported by this tester in this project
    let bugQuery = { projectId, reportedBy: testerId };
    if (startDate && endDate) {
      bugQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const bugs = await BugTracker.find(bugQuery);

    // Get test tickets for this project
    const testTickets = [];
    project.modules.forEach(module => {
      module.tickets.forEach(ticket => {
        if (ticket.tester && ticket.tester.toString() === testerId) {
          testTickets.push({
            ...ticket.toObject(),
            moduleName: module.name
          });
        }
      });
    });

    // Calculate testing metrics
    const report = {
      projectId,
      projectName: project.name,
      period: {
        startDate: startDate || 'All time',
        endDate: endDate || 'All time'
      },
      bugs: {
        total: bugs.length,
        byStatus: {
          new: bugs.filter(bug => bug.status === 'new').length,
          assigned: bugs.filter(bug => bug.status === 'assigned').length,
          in_progress: bugs.filter(bug => bug.status === 'in_progress').length,
          resolved: bugs.filter(bug => bug.status === 'resolved').length,
          closed: bugs.filter(bug => bug.status === 'closed').length,
          reopened: bugs.filter(bug => bug.status === 'reopened').length
        },
        bySeverity: {
          low: bugs.filter(bug => bug.severity === 'low').length,
          medium: bugs.filter(bug => bug.severity === 'medium').length,
          high: bugs.filter(bug => bug.severity === 'high').length,
          critical: bugs.filter(bug => bug.severity === 'critical').length
        },
        byType: {
          functional: bugs.filter(bug => bug.bugType === 'functional').length,
          ui: bugs.filter(bug => bug.bugType === 'ui').length,
          performance: bugs.filter(bug => bug.bugType === 'performance').length,
          security: bugs.filter(bug => bug.bugType === 'security').length,
          data: bugs.filter(bug => bug.bugType === 'data').length
        }
      },
      tickets: {
        total: testTickets.length,
        byStatus: {
          open: testTickets.filter(ticket => ticket.status === 'open').length,
          in_progress: testTickets.filter(ticket => ticket.status === 'in_progress').length,
          testing: testTickets.filter(ticket => ticket.status === 'testing').length,
          code_review: testTickets.filter(ticket => ticket.status === 'code_review').length,
          done: testTickets.filter(ticket => ticket.status === 'done').length,
          blocked: testTickets.filter(ticket => ticket.status === 'blocked').length
        },
        completionRate: testTickets.length > 0 ? 
          Math.round((testTickets.filter(ticket => ticket.status === 'done').length / testTickets.length) * 100) : 0
      },
      qualityMetrics: {
        bugDetectionRate: bugs.length > 0 ? Math.round((bugs.filter(bug => bug.status === 'closed').length / bugs.length) * 100) : 0,
        averageBugResolutionTime: bugs.filter(bug => bug.status === 'closed').length > 0 ? 
          Math.round(bugs.filter(bug => bug.status === 'closed').reduce((sum, bug) => {
            const resolutionTime = new Date(bug.updatedAt) - new Date(bug.createdAt);
            return sum + resolutionTime;
          }, 0) / (bugs.filter(bug => bug.status === 'closed').length * 24 * 60 * 60 * 1000)) : 0
      }
    };

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error generating testing report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate testing report'
    });
  }
};

// ========================================
// 5. TESTING WORKFLOW MANAGEMENT
// ========================================

/**
 * Start testing a ticket
 */
export const startTicketTesting = async (req, res) => {
  try {
    const { projectId, moduleId, ticketId } = req.params;
    const { testPlan, estimatedTime } = req.body;
    const testerId = req.user._id;

    const project = await Project.findOne({
      _id: projectId
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
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

    // Verify tester is assigned to this ticket
    if (ticket.tester.toString() !== testerId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this ticket'
      });
    }

    // Check if ticket is ready for testing
    if (ticket.status !== 'testing' && ticket.status !== 'code_review') {
      return res.status(400).json({
        success: false,
        error: 'Ticket is not ready for testing'
      });
    }

    // Update ticket status and add testing information
    ticket.status = 'testing';
    ticket.testingNotes = testPlan || 'Testing started';
    ticket.estimatedHours = estimatedTime || ticket.estimatedHours;

    // Add testing start comment
    ticket.comments.push({
      userId: testerId,
      comment: `[Testing Started] ${testPlan || 'Testing initiated'}`,
      createdAt: new Date()
    });

    await project.save();

    res.json({
      success: true,
      data: ticket,
      message: 'Ticket testing started successfully'
    });
  } catch (error) {
    console.error('Error starting ticket testing:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Complete testing for a ticket
 */
export const completeTicketTesting = async (req, res) => {
  try {
    const { projectId, moduleId, ticketId } = req.params;
    const { testResult, testNotes, defects, actualTime } = req.body;
    const testerId = req.user._id;

    const project = await Project.findOne({
      _id: projectId
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
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

    // Verify tester is assigned to this ticket
    if (ticket.tester.toString() !== testerId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this ticket'
      });
    }

    // Update ticket with testing results
    ticket.testingNotes = testNotes || '';
    ticket.actualHours = (ticket.actualHours || 0) + (actualTime || 0);

    // Update status based on test result
    if (testResult === 'passed') {
      ticket.status = 'done';
    } else if (testResult === 'failed') {
      ticket.status = 'testing';
      // If defects found, create bug report
      if (defects && defects.length > 0) {
        // This could trigger automatic bug creation
        ticket.testingNotes += `\nDefects found: ${defects.join(', ')}`;
      }
    }

    // Add testing completion comment
    ticket.comments.push({
      userId: testerId,
      comment: `[Testing Completed] Result: ${testResult}. ${testNotes || ''} ${defects ? `Defects: ${defects.join(', ')}` : ''}`,
      createdAt: new Date()
    });

    await project.save();

    res.json({
      success: true,
      data: ticket,
      message: 'Ticket testing completed successfully'
    });
  } catch (error) {
    console.error('Error completing ticket testing:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Approve/Validate a ticket after testing
 */
export const approveTicket = async (req, res) => {
  try {
    const { projectId, moduleId, ticketId } = req.params;
    const { approvalNotes } = req.body;
    const testerId = req.user._id;

    const project = await Project.findOne({
      _id: projectId
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
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

    // Verify tester is assigned to this ticket
    if (ticket.tester && ticket.tester.toString() !== testerId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this ticket'
      });
    }

    // Approve ticket - mark as done
    ticket.status = 'done';
    ticket.testingNotes = approvalNotes || 'Ticket approved by tester';
    
    // Add approval comment
    ticket.comments.push({
      userId: testerId,
      comment: `[Tester] Ticket approved and validated. ${approvalNotes || ''}`,
      createdAt: new Date()
    });

    await project.save();

    res.json({
      success: true,
      data: ticket,
      message: 'Ticket approved successfully'
    });
  } catch (error) {
    console.error('Error approving ticket:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get Tester dashboard statistics
 */
export const getTesterStats = async (req, res) => {
  try {
    const testerId = req.user._id;

    // Get bugs reported by this tester
    const reportedBugs = await BugTracker.find({ reportedBy: testerId });
    
    // Get bugs assigned to this tester
    const assignedBugs = await BugTracker.find({ assignedTo: testerId });

    // Calculate bug statistics
    const bugStats = {
      reported: {
        total: reportedBugs.length,
        open: reportedBugs.filter(b => b.status === 'open').length,
        inProgress: reportedBugs.filter(b => b.status === 'in-progress').length,
        resolved: reportedBugs.filter(b => b.status === 'resolved').length,
        closed: reportedBugs.filter(b => b.status === 'closed').length
      },
      assigned: {
        total: assignedBugs.length,
        pending: assignedBugs.filter(b => b.status === 'open').length,
        testing: assignedBugs.filter(b => b.status === 'in-progress').length,
        verified: assignedBugs.filter(b => b.status === 'resolved').length
      }
    };

    // Get severity breakdown for reported bugs
    const severityStats = {
      critical: reportedBugs.filter(b => b.severity === 'critical').length,
      high: reportedBugs.filter(b => b.severity === 'high').length,
      medium: reportedBugs.filter(b => b.severity === 'medium').length,
      low: reportedBugs.filter(b => b.severity === 'low').length
    };

    // Get projects where tester is involved
    const projects = await Project.find({ teamMembers: testerId });
    
    // Get test case statistics from actual ticket data
    let totalTickets = 0;
    let testedTickets = 0;
    let passedTickets = 0;
    let failedTickets = 0;
    
    projects.forEach(project => {
      project.modules.forEach(module => {
        module.tickets.forEach(ticket => {
          if (ticket.tester && ticket.tester.toString() === testerId.toString()) {
            totalTickets++;
            if (ticket.status === 'done') {
              testedTickets++;
              passedTickets++;
            } else if (ticket.status === 'testing' && ticket.testingNotes) {
              testedTickets++;
              failedTickets++;
            }
          }
        });
      });
    });

    const testCaseStats = {
      total: totalTickets,
      executed: testedTickets,
      passed: passedTickets,
      failed: failedTickets,
      blocked: totalTickets - testedTickets
    };

    // Calculate productivity metrics
    const productivity = {
      bugDetectionRate: Math.round((bugStats.reported.total / Math.max(testCaseStats.executed, 1)) * 100),
      bugResolutionRate: Math.round((bugStats.reported.resolved / Math.max(bugStats.reported.total, 1)) * 100),
      testExecutionRate: Math.round((testCaseStats.executed / Math.max(testCaseStats.total, 1)) * 100),
      testPassRate: Math.round((testCaseStats.passed / Math.max(testCaseStats.executed, 1)) * 100)
    };

    const stats = {
      bugs: bugStats,
      severity: severityStats,
      testCases: testCaseStats,
      projects: {
        total: projects.length,
        active: projects.filter(p => p.status === 'active').length
      },
      productivity,
      overview: {
        totalBugsReported: bugStats.reported.total,
        totalBugsAssigned: bugStats.assigned.total,
        activeProjects: projects.filter(p => p.status === 'active').length,
        testCasesExecuted: testCaseStats.executed
      }
    };

    return res.status(200).json({
      success: true,
      message: 'Tester statistics retrieved successfully',
      stats
    });

  } catch (error) {
    console.error('Error getting tester stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while getting tester statistics',
      error: error.message
    });
  }
};
