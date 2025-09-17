import mongoose from 'mongoose';

// Defines types of Kanban boards
const KANBAN_BOARD_TYPES = {
  MAIN: 'main',                           // Main project board
  DEVELOPER_SPECIFIC: 'developer_specific', // Individual developer's board
  TESTER_SPECIFIC: 'tester_specific',     // Individual tester's board
  SPRINT_SPECIFIC: 'sprint_specific',     // Sprint-focused board
  ROLE_SPECIFIC: 'role_specific'          // Role-based team boards (Sales, Marketing, etc.)
};

// Defines standard column names for Kanban boards with workflow mapping
const DEFAULT_KANBAN_COLUMNS = {
  TODO: 'To Do',           // Tasks not started - maps to OPEN status
  IN_PROGRESS: 'In Progress', // Tasks being worked on - maps to IN_PROGRESS status
  REVIEW: 'Review',        // Tasks under review - maps to CODE_REVIEW status
  TESTING: 'Testing',      // Tasks under testing - maps to TESTING status
  DONE: 'Done'            // Completed tasks - maps to DONE status
};

// Column status mapping for automatic ticket status updates
const COLUMN_STATUS_MAPPING = {
  'To Do': 'open',
  'In Progress': 'in_progress',
  'Review': 'code_review',
  'Testing': 'testing',
  'Done': 'done'
};

// Workflow rules for role-based transitions
const WORKFLOW_RULES = {
  DEVELOPER: {
    allowedTransitions: {
      'open': ['in_progress'],
      'in_progress': ['code_review', 'testing'],
      'code_review': ['in_progress', 'testing'],
      'testing': [], // Developers can't move from testing
      'done': []     // Developers can't move from done
    }
  },
  TESTER: {
    allowedTransitions: {
      'open': [],
      'in_progress': [],
      'code_review': [],
      'testing': ['in_progress', 'done'], // Testers can send back or approve
      'done': ['testing'] // Testers can reopen if bugs found
    }
  },
  MANAGER: {
    allowedTransitions: {
      'open': ['in_progress', 'testing', 'done'],
      'in_progress': ['open', 'code_review', 'testing', 'done'],
      'code_review': ['open', 'in_progress', 'testing', 'done'],
      'testing': ['open', 'in_progress', 'code_review', 'done'],
      'done': ['open', 'in_progress', 'code_review', 'testing']
    }
  }
};

// Schema for Kanban boards
const kanbanSchema = new mongoose.Schema({
  projectId: {              // Links to specific project
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  boardName: {             // Board's descriptive name
    type: String,
    required: true
  },
  boardType: {             // Type of board
    type: String,
    enum: Object.values(KANBAN_BOARD_TYPES),
    default: KANBAN_BOARD_TYPES.MAIN
  },
  
  // Owner/Creator of the board
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Role-specific access control
  allowedRoles: [{
    type: String,
    enum: ['admin', 'hr', 'manager', 'developer', 'tester', 'sales', 'marketing', 'intern']
  }],
  
  // Specific users with access (for personal boards)
  allowedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  developerId: {           // Developer for personal board
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  sprintId: {              // Sprint for sprint-specific board
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sprint',
    default: null
  },
  
  // Kanban columns with enhanced workflow support
  columns: [{              // Workflow stages on board
    columnId: {            // Unique column identifier
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId()
    },
    name: {               // Column display name
      type: String,
      required: true
    },
    description: String,   // Column description/purpose
    statusMapping: {      // Maps to ticket status for auto-updates
      type: String,
      enum: ['open', 'in_progress', 'code_review', 'testing', 'done', 'blocked'],
      required: true
    },
    wipLimit: {           // Max items in column (Work In Progress limit)
      type: Number,
      default: null
    },
    order: {              // Column position on board
      type: Number,
      required: true
    },
    
    // Tickets in this column with position tracking
    tickets: [{
      ticketId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      },
      position: {         // Position within column for ordering
        type: Number,
        required: true
      },
      movedAt: {          // When ticket was moved to this column
        type: Date,
        default: Date.now
      },
      movedBy: {          // Who moved the ticket
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }],
    
    // Column-specific rules
    rules: {
      autoAssignTester: {  // Auto-assign tester when moved to testing
        type: Boolean,
        default: false
      },
      requireComments: {   // Require comments when moving tickets
        type: Boolean,
        default: false
      },
      notifyOnMove: {      // Send notifications on ticket moves
        type: Boolean,
        default: true
      }
    }
  }],
  
  // Board configuration and settings
  settings: {             // Board display and behavior options
    showEstimates: {      // Show task effort estimates
      type: Boolean,
      default: true
    },
    showAssignees: {      // Show task assignees
      type: Boolean,
      default: true
    },
    showPriority: {       // Show task priority indicators
      type: Boolean,
      default: true
    },
    autoMoveOnStatusChange: { // Auto-move tasks on status change
      type: Boolean,
      default: true
    },
    enableDragDrop: {     // Enable drag and drop functionality
      type: Boolean,
      default: true
    },
    swimlanes: {          // Swimlane configuration
      enabled: {
        type: Boolean,
        default: false
      },
      groupBy: {
        type: String,
        enum: ['assignee', 'priority', 'epic', 'none'],
        default: 'none'
      }
    }
  },
  
  // Workflow automation rules
  automationRules: [{
    name: String,
    trigger: {
      event: {
        type: String,
        enum: ['ticket_moved', 'status_changed', 'assignee_changed'],
        required: true
      },
      fromColumn: String,
      toColumn: String
    },
    actions: [{
      type: {
        type: String,
        enum: ['assign_user', 'send_notification', 'update_status', 'create_subtask'],
        required: true
      },
      parameters: mongoose.Schema.Types.Mixed
    }],
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // Board activity tracking
  recentActivity: [{
    action: {
      type: String,
      enum: ['ticket_moved', 'ticket_added', 'ticket_removed', 'column_added', 'column_modified'],
      required: true
    },
    ticketId: mongoose.Schema.Types.ObjectId,
    fromColumn: String,
    toColumn: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: String
  }],
  
  // Board filters and views
  savedFilters: [{
    name: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    filters: {
      assignee: [mongoose.Schema.Types.ObjectId],
      priority: [String],
      labels: [String],
      dueDate: {
        from: Date,
        to: Date
      }
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true        // Auto-track creation/update times
});

// Indexes for efficient querying
kanbanSchema.index({ projectId: 1 });        // Query by project
kanbanSchema.index({ developerId: 1 });      // Query by developer
kanbanSchema.index({ sprintId: 1 });         // Query by sprint
kanbanSchema.index({ boardType: 1 });        // Query by board type
kanbanSchema.index({ ownerId: 1 });          // Query by owner
kanbanSchema.index({ 'allowedUsers': 1 });   // Query by allowed users
kanbanSchema.index({ 'columns.tickets.ticketId': 1 }); // Find ticket location

// Virtual for board statistics
kanbanSchema.virtual('statistics').get(function() {
  const stats = {
    totalTickets: 0,
    ticketsByColumn: {},
    wipViolations: []
  };
  
  this.columns.forEach(column => {
    stats.totalTickets += column.tickets.length;
    stats.ticketsByColumn[column.name] = column.tickets.length;
    
    if (column.wipLimit && column.tickets.length > column.wipLimit) {
      stats.wipViolations.push({
        column: column.name,
        current: column.tickets.length,
        limit: column.wipLimit
      });
    }
  });
  
  return stats;
});

export {
  kanbanSchema,
  KANBAN_BOARD_TYPES,
  DEFAULT_KANBAN_COLUMNS,
  COLUMN_STATUS_MAPPING,
  WORKFLOW_RULES
};