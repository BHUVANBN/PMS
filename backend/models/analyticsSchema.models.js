// analyticsSchema.models.js - Analytics Dashboard for Admin and Managers
import mongoose from 'mongoose';

// Dashboard types for different roles
const DASHBOARD_TYPES = {
  ADMIN_OVERVIEW: 'admin_overview',           // Organization-wide analytics
  MANAGER_PROJECT: 'manager_project',         // Project-specific analytics
  MANAGER_TEAM: 'manager_team',              // Team performance analytics
  HR_EMPLOYEE: 'hr_employee'                 // Employee analytics
};

// Metric types for tracking
const METRIC_TYPES = {
  PRODUCTIVITY: 'productivity',
  QUALITY: 'quality',
  VELOCITY: 'velocity',
  WORKLOAD: 'workload',
  BUG_METRICS: 'bug_metrics',
  LEAVE_METRICS: 'leave_metrics',
  PERFORMANCE: 'performance'
};

// Time period for analytics
const TIME_PERIODS = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  YEARLY: 'yearly'
};

const analyticsSchema = new mongoose.Schema({
  // Dashboard identification
  dashboardId: {
    type: String,
    required: true,
    unique: true
  },
  
  dashboardType: {
    type: String,
    enum: Object.values(DASHBOARD_TYPES),
    required: true
  },
  
  // Owner and access control
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Context (project, team, organization)
  contextId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null  // Project ID for project dashboards, null for org-wide
  },
  
  // Time period for this analytics snapshot
  timePeriod: {
    type: String,
    enum: Object.values(TIME_PERIODS),
    required: true
  },
  
  startDate: {
    type: Date,
    required: true
  },
  
  endDate: {
    type: Date,
    required: true
  },
  
  // Project Progress Metrics
  projectMetrics: {
    totalProjects: Number,
    activeProjects: Number,
    completedProjects: Number,
    onHoldProjects: Number,
    cancelledProjects: Number,
    
    // Project completion rates
    completionRate: Number,  // Percentage
    onTimeDelivery: Number,  // Percentage
    
    // Project health indicators
    projectsAtRisk: Number,
    projectsDelayed: Number,
    
    // Resource allocation
    totalBudgetAllocated: Number,
    budgetUtilized: Number,
    budgetVariance: Number
  },
  
  // Team Workload Analytics
  workloadMetrics: {
    totalTeamMembers: Number,
    activeMembers: Number,
    
    // Ticket distribution
    totalTickets: Number,
    completedTickets: Number,
    inProgressTickets: Number,
    blockedTickets: Number,
    
    // Workload by role
    workloadByRole: [{
      role: String,
      memberCount: Number,
      assignedTickets: Number,
      completedTickets: Number,
      averageTicketsPerMember: Number
    }],
    
    // Individual performance
    topPerformers: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      ticketsCompleted: Number,
      averageCompletionTime: Number,
      qualityScore: Number
    }],
    
    // Capacity utilization
    teamCapacity: Number,
    capacityUtilization: Number,  // Percentage
    overloadedMembers: Number
  },
  
  // Bug Tracker Analytics
  bugMetrics: {
    totalBugs: Number,
    openBugs: Number,
    inProgressBugs: Number,
    fixedBugs: Number,
    closedBugs: Number,
    reopenedBugs: Number,
    
    // Bug severity distribution
    bugsBySeverity: {
      critical: Number,
      high: Number,
      medium: Number,
      low: Number
    },
    
    // Bug resolution metrics
    averageResolutionTime: Number,  // Hours
    averageResponseTime: Number,    // Hours
    bugReopenRate: Number,          // Percentage
    
    // Bug trends
    bugsCreatedThisPeriod: Number,
    bugsResolvedThisPeriod: Number,
    bugBacklog: Number,
    
    // Quality indicators
    bugDensity: Number,             // Bugs per feature/module
    escapeRate: Number,             // Bugs found in production
    
    // Top bug reporters and fixers
    topBugReporters: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      bugsReported: Number
    }],
    
    topBugFixers: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      bugsFixed: Number,
      averageFixTime: Number
    }]
  },
  
  // Sprint and Velocity Analytics
  velocityMetrics: {
    totalSprints: Number,
    completedSprints: Number,
    activeSprints: Number,
    
    // Velocity tracking
    averageVelocity: Number,        // Story points per sprint
    velocityTrend: String,          // 'increasing', 'decreasing', 'stable'
    
    // Sprint success metrics
    sprintGoalAchievement: Number,  // Percentage
    averageSprintCompletion: Number, // Percentage
    
    // Burndown analysis
    averageBurndownVariance: Number,
    sprintsWithHealthyBurndown: Number,
    
    // Commitment vs delivery
    averageCommitment: Number,      // Story points
    averageDelivery: Number,        // Story points
    commitmentAccuracy: Number      // Percentage
  },
  
  // Leave and Attendance Analytics (for HR)
  leaveMetrics: {
    totalLeaveRequests: Number,
    approvedLeaves: Number,
    rejectedLeaves: Number,
    pendingLeaves: Number,
    
    // Leave utilization
    leaveUtilizationRate: Number,   // Percentage
    averageLeaveDuration: Number,   // Days
    
    // Leave patterns
    leaveByType: [{
      leaveType: String,
      count: Number,
      totalDays: Number
    }],
    
    // Attendance patterns
    attendanceRate: Number,         // Percentage
    absenteeismRate: Number,        // Percentage
    
    // Team availability
    teamAvailability: Number,       // Percentage
    criticalAbsences: Number        // Key team members on leave
  },
  
  // Performance and Quality Metrics
  performanceMetrics: {
    // Code quality (for development teams)
    codeReviewCoverage: Number,     // Percentage
    averageReviewTime: Number,      // Hours
    codeQualityScore: Number,       // 1-10 scale
    
    // Delivery metrics
    onTimeDeliveryRate: Number,     // Percentage
    averageLeadTime: Number,        // Days from creation to completion
    averageCycleTime: Number,       // Days from start to completion
    
    // Customer satisfaction
    customerSatisfactionScore: Number, // 1-10 scale
    feedbackScore: Number,          // Average feedback rating
    
    // Innovation metrics
    improvementSuggestions: Number,
    implementedImprovements: Number,
    processOptimizations: Number
  },
  
  // Standup and Communication Analytics
  communicationMetrics: {
    standupAttendance: Number,      // Percentage
    averageStandupDuration: Number, // Minutes
    
    // Communication patterns
    totalComments: Number,
    averageResponseTime: Number,    // Hours
    collaborationScore: Number,     // 1-10 scale
    
    // Knowledge sharing
    documentationUpdates: Number,
    knowledgeTransferSessions: Number
  },
  
  // Financial and Resource Metrics (for Admin)
  resourceMetrics: {
    totalResourceCost: Number,
    costPerProject: Number,
    costPerTicket: Number,
    resourceUtilization: Number,    // Percentage
    
    // ROI metrics
    projectROI: Number,             // Percentage
    costVariance: Number,           // Percentage
    budgetEfficiency: Number        // Percentage
  },
  
  // Trend Analysis
  trends: {
    productivityTrend: String,      // 'up', 'down', 'stable'
    qualityTrend: String,
    velocityTrend: String,
    bugTrend: String,
    
    // Predictive insights
    projectedCompletion: Date,
    riskFactors: [String],
    recommendations: [String]
  },
  
  // Dashboard configuration
  configuration: {
    refreshInterval: Number,        // Minutes
    autoRefresh: Boolean,
    alertThresholds: {
      bugCount: Number,
      velocityDrop: Number,
      qualityScore: Number,
      utilizationRate: Number
    },
    
    // Visualization preferences
    chartTypes: [String],
    displayMetrics: [String],
    customFilters: mongoose.Schema.Types.Mixed
  },
  
  // Alerts and notifications
  alerts: [{
    alertType: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    message: String,
    triggeredAt: {
      type: Date,
      default: Date.now
    },
    acknowledged: {
      type: Boolean,
      default: false
    },
    acknowledgedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Data freshness
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  
  dataSource: {
    projects: [mongoose.Schema.Types.ObjectId],
    teams: [mongoose.Schema.Types.ObjectId],
    timeRange: {
      start: Date,
      end: Date
    }
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
analyticsSchema.index({ dashboardType: 1, ownerId: 1 });
analyticsSchema.index({ contextId: 1, timePeriod: 1 });
analyticsSchema.index({ startDate: 1, endDate: 1 });
analyticsSchema.index({ lastUpdated: -1 });
analyticsSchema.index({ 'alerts.severity': 1, 'alerts.acknowledged': 1 });

// Virtual for dashboard health score
analyticsSchema.virtual('healthScore').get(function() {
  let score = 100;
  
  // Deduct points for various issues
  if (this.bugMetrics && this.bugMetrics.openBugs > 10) score -= 10;
  if (this.velocityMetrics && this.velocityMetrics.velocityTrend === 'decreasing') score -= 15;
  if (this.performanceMetrics && this.performanceMetrics.onTimeDeliveryRate < 80) score -= 20;
  if (this.workloadMetrics && this.workloadMetrics.overloadedMembers > 0) score -= 10;
  
  return Math.max(score, 0);
});

// Virtual for critical alerts count
analyticsSchema.virtual('criticalAlertsCount').get(function() {
  return this.alerts.filter(alert => 
    alert.severity === 'critical' && !alert.acknowledged
  ).length;
});

export {
  analyticsSchema,
  DASHBOARD_TYPES,
  METRIC_TYPES,
  TIME_PERIODS
};
