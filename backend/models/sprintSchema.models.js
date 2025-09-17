import mongoose from 'mongoose';

// Defines possible statuses for sprints
const SPRINT_STATUS = {
  PLANNING: 'planning',    // Sprint in planning phase
  ACTIVE: 'active',        // Sprint currently running
  COMPLETED: 'completed',  // Sprint finished
  CANCELLED: 'cancelled'   // Sprint stopped early
};

// Sprint board view types for different roles
const SPRINT_BOARD_TYPES = {
  MANAGER_VIEW: 'manager_view',     // Team Manager's comprehensive view
  DEVELOPER_VIEW: 'developer_view', // Individual developer's assigned tasks
  TESTER_VIEW: 'tester_view',       // Tester's assigned validation tasks
  TEAM_VIEW: 'team_view'            // Team-wide sprint overview
};

// Task assignment status
const ASSIGNMENT_STATUS = {
  ASSIGNED: 'assigned',       // Task assigned to user
  ACCEPTED: 'accepted',       // User accepted the assignment
  IN_PROGRESS: 'in_progress', // User is working on the task
  COMPLETED: 'completed',     // Task completed by assignee
  REJECTED: 'rejected'        // User rejected the assignment
};

// Schema for sprint records
const sprintSchema = new mongoose.Schema({
  projectId: {              // Links to specific project
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  sprintNumber: {          // Sprint sequence in project
    type: Number,
    required: true
  },
  name: {                  // Sprint's descriptive name
    type: String,
    required: true
  },
  startDate: {             // Sprint start date
    type: Date,
    required: true
  },
  endDate: {               // Sprint end date
    type: Date,
    required: true
  },
  status: {                // Current sprint status
    type: String,
    enum: Object.values(SPRINT_STATUS),
    default: SPRINT_STATUS.PLANNING
  },
  goal: String,            // Sprint objectives
  
  // Sprint capacity planning
  plannedStoryPoints: {    // Planned effort estimate
    type: Number,
    default: 0
  },
  completedStoryPoints: {  // Completed effort estimate
    type: Number,
    default: 0
  },
  
  // Sprint team composition
  sprintMaster: {          // Person managing this sprint (usually Team Manager)
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Role-based task assignments
  assignments: [{
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    assigneeRole: {
      type: String,
      enum: ['developer', 'tester', 'sales', 'marketing', 'intern'],
      required: true
    },
    assignmentStatus: {
      type: String,
      enum: Object.values(ASSIGNMENT_STATUS),
      default: ASSIGNMENT_STATUS.ASSIGNED
    },
    assignedAt: {
      type: Date,
      default: Date.now
    },
    acceptedAt: Date,
    completedAt: Date,
    estimatedHours: Number,
    actualHours: Number,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    notes: String
  }],
  
  // Sprint board configuration for different role views
  boardViews: [{
    viewType: {
      type: String,
      enum: Object.values(SPRINT_BOARD_TYPES),
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    columns: [{
      name: String,
      order: Number,
      ticketIds: [mongoose.Schema.Types.ObjectId]
    }],
    filters: {
      assignee: [mongoose.Schema.Types.ObjectId],
      priority: [String],
      status: [String],
      role: [String]
    }
  }],
  
  // Team members assigned to this sprint
  assignedDevelopers: [{   
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  assignedTesters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  assignedSales: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  assignedMarketing: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  assignedInterns: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Sprint metrics for real-time tracking
  metrics: {
    totalTickets: {
      type: Number,
      default: 0
    },
    completedTickets: {
      type: Number,
      default: 0
    },
    inProgressTickets: {
      type: Number,
      default: 0
    },
    blockedTickets: {
      type: Number,
      default: 0
    },
    burndownData: [{
      date: Date,
      remainingStoryPoints: Number,
      completedStoryPoints: Number
    }],
    velocityData: {
      plannedVelocity: Number,
      actualVelocity: Number
    }
  },
  
  // Sprint retrospective data
  retrospective: {
    whatWentWell: [String],
    whatCouldImprove: [String],
    actionItems: [{
      item: String,
      assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      dueDate: Date,
      status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed'],
        default: 'pending'
      }
    }]
  },
  
  // Sprint events
  events: [{
    eventType: {
      type: String,
      enum: ['planning', 'daily_standup', 'review', 'retrospective'],
      required: true
    },
    scheduledDate: Date,
    actualDate: Date,
    attendees: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    notes: String,
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled'
    }
  }]
}, {
  timestamps: true         // Auto-track creation/update times
});

// Indexes for efficient querying
sprintSchema.index({ projectId: 1, status: 1 });     // Query by project and status
sprintSchema.index({ startDate: 1, endDate: 1 });    // Query by date range
sprintSchema.index({ sprintNumber: 1, projectId: 1 }); // Query by sprint number and project
sprintSchema.index({ sprintMaster: 1 });             // Query by sprint master
sprintSchema.index({ 'assignments.assignedTo': 1 }); // Query assignments by user
sprintSchema.index({ 'assignments.assigneeRole': 1 }); // Query assignments by role
sprintSchema.index({ status: 1, startDate: -1 });    // Active sprints by date

// Virtual for sprint progress percentage
sprintSchema.virtual('progressPercentage').get(function() {
  if (this.metrics.totalTickets === 0) return 0;
  return Math.round((this.metrics.completedTickets / this.metrics.totalTickets) * 100);
});

// Virtual for sprint duration in days
sprintSchema.virtual('duration').get(function() {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return 0;
});

export {
  sprintSchema,
  SPRINT_STATUS,
  SPRINT_BOARD_TYPES,
  ASSIGNMENT_STATUS
};