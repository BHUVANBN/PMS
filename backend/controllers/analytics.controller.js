// analytics.controller.js - Analytics Dashboard Controller
import { 
  Project, 
  User, 
  Sprint, 
  BugTracker, 
  Leave,
  ActivityLog,
  PROJECT_STATUS,
  BUG_STATUS,
  SPRINT_STATUS,
  LEAVE_STATUS
} from '../models/index.js';
import mongoose from 'mongoose';

// Get comprehensive dashboard analytics
export const getDashboardAnalytics = async (req, res) => {
  try {
    const { timeframe = '1month', projectId } = req.query;

    // Check permissions
    const userRole = req.effectiveRole || req.userRole;
    if (!['admin', 'manager', 'hr'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only admins, managers, and HR can view analytics'
      });
    }

    // Calculate date range
    let dateFilter = {};
    const now = new Date();
    
    switch (timeframe) {
      case '1week':
        dateFilter = { $gte: new Date(now.setDate(now.getDate() - 7)) };
        break;
      case '1month':
        dateFilter = { $gte: new Date(now.setMonth(now.getMonth() - 1)) };
        break;
      case '3months':
        dateFilter = { $gte: new Date(now.setMonth(now.getMonth() - 3)) };
        break;
      case '6months':
        dateFilter = { $gte: new Date(now.setMonth(now.getMonth() - 6)) };
        break;
      case '1year':
        dateFilter = { $gte: new Date(now.setFullYear(now.getFullYear() - 1)) };
        break;
    }

    const filter = projectId ? { projectId } : {};
    const projectFilter = projectId ? { _id: projectId } : {};

    // Fetch all required data
    const [projects, users, sprints, bugs, leaves, activities] = await Promise.all([
      Project.find(projectFilter),
      User.find({}),
      Sprint.find({ ...filter, createdAt: dateFilter }),
      BugTracker.find({ ...filter, createdAt: dateFilter }),
      Leave.find({ createdAt: dateFilter }),
      ActivityLog.find({ createdAt: dateFilter }).limit(100)
    ]);

    // Calculate analytics
    const analytics = {
      overview: calculateOverviewMetrics(projects, users, sprints, bugs),
      projectProgress: calculateProjectProgress(projects),
      workloadAnalysis: calculateWorkloadAnalysis(sprints, users),
      bugMetrics: calculateBugMetrics(bugs),
      velocityTrends: calculateVelocityTrends(sprints),
      leaveAnalytics: calculateLeaveAnalytics(leaves),
      performanceMetrics: calculatePerformanceMetrics(sprints, bugs, users),
      communicationMetrics: calculateCommunicationMetrics(activities),
      timeframe,
      generatedAt: new Date()
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard analytics',
      error: error.message
    });
  }
};

// Get project-specific analytics
export const getProjectAnalytics = async (req, res) => {
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

    const project = await Project.findById(projectId)
      .populate('teamMembers', 'firstName lastName role')
      .populate('projectManager', 'firstName lastName');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Calculate date range
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
    }

    // Fetch project-specific data
    const [sprints, bugs, activities] = await Promise.all([
      Sprint.find({ projectId, ...dateFilter }),
      BugTracker.find({ projectId, ...dateFilter }),
      ActivityLog.find({ projectId, ...dateFilter }).limit(50)
    ]);

    // Calculate project analytics
    const analytics = {
      project: {
        id: project._id,
        name: project.name,
        status: project.status,
        teamSize: project.teamMembers.length,
        manager: project.projectManager
      },
      progress: calculateProjectSpecificProgress(project, sprints),
      sprintAnalytics: calculateProjectSprintAnalytics(sprints),
      bugAnalytics: calculateProjectBugAnalytics(bugs),
      teamPerformance: calculateTeamPerformance(sprints, project.teamMembers),
      recentActivity: activities.slice(0, 20),
      timeframe,
      generatedAt: new Date()
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching project analytics',
      error: error.message
    });
  }
};

// Get user performance analytics
export const getUserPerformanceAnalytics = async (req, res) => {
  try {
    const { userId } = req.params;
    const { timeframe = '3months' } = req.query;

    // Check permissions
    const userRole = req.effectiveRole || req.userRole;
    const isOwnAnalytics = userId === req.user._id.toString();
    const canView = ['admin', 'hr', 'manager'].includes(userRole) || isOwnAnalytics;

    if (!canView) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate date range
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
    }

    // Fetch user-specific data
    const [sprints, bugs, leaves, activities] = await Promise.all([
      Sprint.find({ 'assignments.assignedTo': userId, ...dateFilter }),
      BugTracker.find({ $or: [{ assignedTo: userId }, { reportedBy: userId }], ...dateFilter }),
      Leave.find({ employeeId: userId, ...dateFilter }),
      ActivityLog.find({ userId, ...dateFilter }).limit(50)
    ]);

    // Calculate user analytics
    const analytics = {
      user: {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        role: user.role,
        email: user.email
      },
      workloadMetrics: calculateUserWorkloadMetrics(sprints, userId),
      bugMetrics: calculateUserBugMetrics(bugs, userId),
      leaveMetrics: calculateUserLeaveMetrics(leaves),
      productivityTrends: calculateUserProductivityTrends(sprints, activities, userId),
      recentActivity: activities.slice(0, 15),
      timeframe,
      generatedAt: new Date()
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user performance analytics',
      error: error.message
    });
  }
};

// Helper functions for calculations

function calculateOverviewMetrics(projects, users, sprints, bugs) {
  return {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === PROJECT_STATUS.IN_PROGRESS).length,
    totalUsers: users.length,
    totalSprints: sprints.length,
    activeSprints: sprints.filter(s => s.status === SPRINT_STATUS.ACTIVE).length,
    totalBugs: bugs.length,
    openBugs: bugs.filter(b => b.status !== BUG_STATUS.CLOSED).length,
    usersByRole: users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {})
  };
}

function calculateProjectProgress(projects) {
  return projects.map(project => {
    const totalTickets = project.modules.reduce((sum, module) => sum + module.tickets.length, 0);
    const completedTickets = project.modules.reduce((sum, module) => 
      sum + module.tickets.filter(ticket => ticket.status === 'done').length, 0
    );
    
    return {
      id: project._id,
      name: project.name,
      status: project.status,
      progress: totalTickets > 0 ? (completedTickets / totalTickets * 100).toFixed(2) : 0,
      totalTickets,
      completedTickets,
      teamSize: project.teamMembers.length
    };
  });
}

function calculateWorkloadAnalysis(sprints, users) {
  const workload = {};
  
  users.forEach(user => {
    workload[user._id] = {
      name: `${user.firstName} ${user.lastName}`,
      role: user.role,
      totalAssignments: 0,
      completedAssignments: 0,
      inProgressAssignments: 0,
      totalStoryPoints: 0,
      completedStoryPoints: 0
    };
  });

  sprints.forEach(sprint => {
    sprint.assignments.forEach(assignment => {
      const userId = assignment.assignedTo.toString();
      if (workload[userId]) {
        workload[userId].totalAssignments++;
        workload[userId].totalStoryPoints += assignment.storyPoints || 0;
        
        if (assignment.assignmentStatus === 'completed') {
          workload[userId].completedAssignments++;
          workload[userId].completedStoryPoints += assignment.storyPoints || 0;
        } else if (assignment.assignmentStatus === 'in_progress') {
          workload[userId].inProgressAssignments++;
        }
      }
    });
  });

  return Object.values(workload).filter(w => w.totalAssignments > 0);
}

function calculateBugMetrics(bugs) {
  const metrics = {
    total: bugs.length,
    byStatus: {},
    bySeverity: {},
    byPriority: {},
    averageResolutionTime: 0,
    resolutionRate: 0
  };

  // Group by status
  Object.values(BUG_STATUS).forEach(status => {
    metrics.byStatus[status] = bugs.filter(b => b.status === status).length;
  });

  // Group by severity
  bugs.forEach(bug => {
    metrics.bySeverity[bug.severity] = (metrics.bySeverity[bug.severity] || 0) + 1;
  });

  // Group by priority
  bugs.forEach(bug => {
    metrics.byPriority[bug.priority] = (metrics.byPriority[bug.priority] || 0) + 1;
  });

  // Calculate resolution metrics
  const resolvedBugs = bugs.filter(b => b.status === BUG_STATUS.CLOSED && b.closedAt);
  if (resolvedBugs.length > 0) {
    const totalResolutionTime = resolvedBugs.reduce((sum, bug) => {
      return sum + (bug.closedAt - bug.createdAt);
    }, 0);
    metrics.averageResolutionTime = totalResolutionTime / resolvedBugs.length / (1000 * 60 * 60 * 24); // in days
    metrics.resolutionRate = (resolvedBugs.length / bugs.length * 100).toFixed(2);
  }

  return metrics;
}

function calculateVelocityTrends(sprints) {
  return sprints
    .filter(s => s.status === SPRINT_STATUS.COMPLETED)
    .sort((a, b) => a.sprintNumber - b.sprintNumber)
    .map(sprint => ({
      sprintNumber: sprint.sprintNumber,
      velocity: sprint.metrics.velocity || 0,
      completedStoryPoints: sprint.metrics.completedStoryPoints || 0,
      totalAssignments: sprint.assignments.length,
      completedAssignments: sprint.assignments.filter(a => a.assignmentStatus === 'completed').length
    }));
}

function calculateLeaveAnalytics(leaves) {
  const analytics = {
    total: leaves.length,
    byStatus: {},
    byType: {},
    averageDuration: 0,
    approvalRate: 0
  };

  // Group by status
  Object.values(LEAVE_STATUS).forEach(status => {
    analytics.byStatus[status] = leaves.filter(l => l.status === status).length;
  });

  // Group by type
  leaves.forEach(leave => {
    analytics.byType[leave.leaveType] = (analytics.byType[leave.leaveType] || 0) + 1;
  });

  // Calculate metrics
  if (leaves.length > 0) {
    const totalDays = leaves.reduce((sum, leave) => sum + leave.totalDays, 0);
    analytics.averageDuration = (totalDays / leaves.length).toFixed(2);
    
    const approvedLeaves = leaves.filter(l => l.status === LEAVE_STATUS.APPROVED).length;
    analytics.approvalRate = (approvedLeaves / leaves.length * 100).toFixed(2);
  }

  return analytics;
}

function calculatePerformanceMetrics(sprints, bugs, users) {
  const metrics = {
    sprintCompletionRate: 0,
    bugResolutionRate: 0,
    teamEfficiency: 0,
    qualityMetrics: {
      bugsPerTicket: 0,
      reopenedBugs: 0
    }
  };

  // Sprint completion rate
  const completedSprints = sprints.filter(s => s.status === SPRINT_STATUS.COMPLETED).length;
  if (sprints.length > 0) {
    metrics.sprintCompletionRate = (completedSprints / sprints.length * 100).toFixed(2);
  }

  // Bug resolution rate
  const resolvedBugs = bugs.filter(b => b.status === BUG_STATUS.CLOSED).length;
  if (bugs.length > 0) {
    metrics.bugResolutionRate = (resolvedBugs / bugs.length * 100).toFixed(2);
  }

  // Quality metrics
  const reopenedBugs = bugs.filter(b => 
    b.statusHistory.some(h => h.status === BUG_STATUS.OPEN && h.changedAt > b.createdAt)
  ).length;
  metrics.qualityMetrics.reopenedBugs = reopenedBugs;

  return metrics;
}

function calculateCommunicationMetrics(activities) {
  const metrics = {
    totalActivities: activities.length,
    byCategory: {},
    byAction: {},
    mostActiveUsers: {}
  };

  activities.forEach(activity => {
    // Group by category
    metrics.byCategory[activity.actionCategory] = (metrics.byCategory[activity.actionCategory] || 0) + 1;
    
    // Group by action
    metrics.byAction[activity.action] = (metrics.byAction[activity.action] || 0) + 1;
    
    // Count user activities
    const userId = activity.userId.toString();
    metrics.mostActiveUsers[userId] = (metrics.mostActiveUsers[userId] || 0) + 1;
  });

  return metrics;
}

function calculateProjectSpecificProgress(project, sprints) {
  const totalTickets = project.modules.reduce((sum, module) => sum + module.tickets.length, 0);
  const completedTickets = project.modules.reduce((sum, module) => 
    sum + module.tickets.filter(ticket => ticket.status === 'done').length, 0
  );

  return {
    totalTickets,
    completedTickets,
    progressPercentage: totalTickets > 0 ? (completedTickets / totalTickets * 100).toFixed(2) : 0,
    totalSprints: sprints.length,
    completedSprints: sprints.filter(s => s.status === SPRINT_STATUS.COMPLETED).length,
    activeSprints: sprints.filter(s => s.status === SPRINT_STATUS.ACTIVE).length
  };
}

function calculateProjectSprintAnalytics(sprints) {
  const completedSprints = sprints.filter(s => s.status === SPRINT_STATUS.COMPLETED);
  
  return {
    totalSprints: sprints.length,
    completedSprints: completedSprints.length,
    averageVelocity: completedSprints.length > 0 ? 
      (completedSprints.reduce((sum, s) => sum + (s.metrics.velocity || 0), 0) / completedSprints.length).toFixed(2) : 0,
    totalStoryPoints: completedSprints.reduce((sum, s) => sum + (s.metrics.completedStoryPoints || 0), 0),
    sprintTrends: completedSprints.map(s => ({
      sprintNumber: s.sprintNumber,
      velocity: s.metrics.velocity || 0,
      completedStoryPoints: s.metrics.completedStoryPoints || 0
    }))
  };
}

function calculateProjectBugAnalytics(bugs) {
  return {
    totalBugs: bugs.length,
    openBugs: bugs.filter(b => b.status !== BUG_STATUS.CLOSED).length,
    resolvedBugs: bugs.filter(b => b.status === BUG_STATUS.CLOSED).length,
    criticalBugs: bugs.filter(b => b.severity === 'critical').length,
    averageResolutionTime: calculateAverageResolutionTime(bugs)
  };
}

function calculateTeamPerformance(sprints, teamMembers) {
  const performance = {};
  
  teamMembers.forEach(member => {
    performance[member._id] = {
      name: `${member.firstName} ${member.lastName}`,
      role: member.role,
      totalAssignments: 0,
      completedAssignments: 0,
      totalStoryPoints: 0,
      completedStoryPoints: 0
    };
  });

  sprints.forEach(sprint => {
    sprint.assignments.forEach(assignment => {
      const userId = assignment.assignedTo.toString();
      if (performance[userId]) {
        performance[userId].totalAssignments++;
        performance[userId].totalStoryPoints += assignment.storyPoints || 0;
        
        if (assignment.assignmentStatus === 'completed') {
          performance[userId].completedAssignments++;
          performance[userId].completedStoryPoints += assignment.storyPoints || 0;
        }
      }
    });
  });

  return Object.values(performance).filter(p => p.totalAssignments > 0);
}

function calculateUserWorkloadMetrics(sprints, userId) {
  let totalAssignments = 0;
  let completedAssignments = 0;
  let totalStoryPoints = 0;
  let completedStoryPoints = 0;

  sprints.forEach(sprint => {
    sprint.assignments.forEach(assignment => {
      if (assignment.assignedTo.toString() === userId) {
        totalAssignments++;
        totalStoryPoints += assignment.storyPoints || 0;
        
        if (assignment.assignmentStatus === 'completed') {
          completedAssignments++;
          completedStoryPoints += assignment.storyPoints || 0;
        }
      }
    });
  });

  return {
    totalAssignments,
    completedAssignments,
    totalStoryPoints,
    completedStoryPoints,
    completionRate: totalAssignments > 0 ? (completedAssignments / totalAssignments * 100).toFixed(2) : 0
  };
}

function calculateUserBugMetrics(bugs, userId) {
  const assigned = bugs.filter(b => b.assignedTo?.toString() === userId);
  const reported = bugs.filter(b => b.reportedBy.toString() === userId);
  const resolved = assigned.filter(b => b.status === BUG_STATUS.CLOSED);

  return {
    assignedBugs: assigned.length,
    reportedBugs: reported.length,
    resolvedBugs: resolved.length,
    resolutionRate: assigned.length > 0 ? (resolved.length / assigned.length * 100).toFixed(2) : 0
  };
}

function calculateUserLeaveMetrics(leaves) {
  const approved = leaves.filter(l => l.status === LEAVE_STATUS.APPROVED);
  const totalDays = approved.reduce((sum, leave) => sum + leave.totalDays, 0);

  return {
    totalRequests: leaves.length,
    approvedRequests: approved.length,
    totalDaysTaken: totalDays,
    approvalRate: leaves.length > 0 ? (approved.length / leaves.length * 100).toFixed(2) : 0
  };
}

function calculateUserProductivityTrends(sprints, activities, userId) {
  // Calculate productivity based on completed assignments and activity frequency
  const monthlyData = {};
  
  sprints.forEach(sprint => {
    const month = new Date(sprint.createdAt).toISOString().substring(0, 7);
    if (!monthlyData[month]) {
      monthlyData[month] = { assignments: 0, completed: 0, activities: 0 };
    }
    
    sprint.assignments.forEach(assignment => {
      if (assignment.assignedTo.toString() === userId) {
        monthlyData[month].assignments++;
        if (assignment.assignmentStatus === 'completed') {
          monthlyData[month].completed++;
        }
      }
    });
  });

  activities.forEach(activity => {
    const month = new Date(activity.createdAt).toISOString().substring(0, 7);
    if (monthlyData[month]) {
      monthlyData[month].activities++;
    }
  });

  return Object.entries(monthlyData).map(([month, data]) => ({
    month,
    ...data,
    completionRate: data.assignments > 0 ? (data.completed / data.assignments * 100).toFixed(2) : 0
  }));
}

function calculateAverageResolutionTime(bugs) {
  const resolvedBugs = bugs.filter(b => b.status === BUG_STATUS.CLOSED && b.closedAt);
  if (resolvedBugs.length === 0) return 0;
  
  const totalTime = resolvedBugs.reduce((sum, bug) => sum + (bug.closedAt - bug.createdAt), 0);
  return (totalTime / resolvedBugs.length / (1000 * 60 * 60 * 24)).toFixed(2); // in days
}

export default {
  getDashboardAnalytics,
  getProjectAnalytics,
  getUserPerformanceAnalytics,
  // keep default map updated if needed by consumers
  getPerformanceMetricsSummary: undefined,
  getTeamMetrics: undefined,
  getBugMetrics: undefined
};

// New: Overall performance metrics
export const getPerformanceMetricsSummary = async (req, res) => {
  try {
    const { timeframe = '3months' } = req.query;

    // Permissions: admin, manager, hr
    const userRole = req.effectiveRole || req.userRole;
    if (!['admin', 'manager', 'hr'].includes(userRole)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Date filter
    const now = new Date();
    let createdAt = {};
    if (timeframe === '1month') createdAt = { $gte: new Date(now.setMonth(now.getMonth() - 1)) };
    else if (timeframe === '3months') createdAt = { $gte: new Date(now.setMonth(now.getMonth() - 3)) };
    else if (timeframe === '6months') createdAt = { $gte: new Date(now.setMonth(now.getMonth() - 6)) };
    else if (timeframe === '1year') createdAt = { $gte: new Date(now.setFullYear(now.getFullYear() - 1)) };

    const [sprints, bugs, users] = await Promise.all([
      Sprint.find(createdAt.$gte ? { createdAt } : {}),
      BugTracker.find(createdAt.$gte ? { createdAt } : {}),
      User.find({})
    ]);

    const metrics = calculatePerformanceMetrics(sprints, bugs, users);
    return res.json({ success: true, data: metrics, timeframe });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching performance metrics', error: error.message });
  }
};

// New: Team metrics by teamId (interpreted as projectId)
export const getTeamMetrics = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { timeframe = '3months' } = req.query;

    const userRole = req.effectiveRole || req.userRole;
    if (!['admin', 'manager', 'hr'].includes(userRole)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const project = await Project.findById(teamId).populate('teamMembers', 'firstName lastName role');
    if (!project) return res.status(404).json({ success: false, message: 'Project (team) not found' });

    // Date filter
    const now = new Date();
    let createdAt = {};
    if (timeframe === '1month') createdAt = { $gte: new Date(now.setMonth(now.getMonth() - 1)) };
    else if (timeframe === '3months') createdAt = { $gte: new Date(now.setMonth(now.getMonth() - 3)) };
    else if (timeframe === '6months') createdAt = { $gte: new Date(now.setMonth(now.getMonth() - 6)) };

    const sprints = await Sprint.find({ projectId: teamId, ...(createdAt.$gte ? { createdAt } : {}) });
    const teamPerformance = calculateTeamPerformance(sprints, project.teamMembers);

    return res.json({ success: true, data: { team: { id: project._id, name: project.name }, performance: teamPerformance, timeframe } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching team metrics', error: error.message });
  }
};

// New: Bug metrics overall
export const getBugMetrics = async (req, res) => {
  try {
    const { projectId, timeframe = '3months' } = req.query;
    const userRole = req.effectiveRole || req.userRole;
    if (!['admin', 'manager', 'hr'].includes(userRole)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const now = new Date();
    let createdAt = {};
    if (timeframe === '1month') createdAt = { $gte: new Date(now.setMonth(now.getMonth() - 1)) };
    else if (timeframe === '3months') createdAt = { $gte: new Date(now.setMonth(now.getMonth() - 3)) };
    else if (timeframe === '6months') createdAt = { $gte: new Date(now.setMonth(now.getMonth() - 6)) };

    const filter = { ...(projectId ? { projectId } : {}), ...(createdAt.$gte ? { createdAt } : {}) };
    const bugs = await BugTracker.find(filter);
    const metrics = calculateBugMetrics(bugs);
    return res.json({ success: true, data: metrics, timeframe });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching bug metrics', error: error.message });
  }
};
