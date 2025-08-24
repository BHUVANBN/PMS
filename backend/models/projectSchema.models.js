// projectSchema.models.js
import mongoose from 'mongoose';
const PROJECT_STATUS = {
  PLANNING: 'planning',
  ACTIVE: 'active',
  ON_HOLD: 'on_hold',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

const TICKET_TYPES = {
  TASK: 'task',
  BUG: 'bug',
};

const TICKET_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

const TICKET_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  TESTING: 'testing',
  CODE_REVIEW: 'code_review',
  DONE: 'done',
  BLOCKED: 'blocked'
};

const DEFAULT_KANBAN_COLUMNS = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  TESTING: 'Testing',
  CODE_REVIEW: 'Code Review',
  DONE: 'Done'
};

// Ticket Schema (embedded in Project)
const ticketSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  type: {
    type: String,
    enum: Object.values(TICKET_TYPES),
    required: true
  },
  priority: {
    type: String,
    enum: Object.values(TICKET_PRIORITIES),
    default: TICKET_PRIORITIES.MEDIUM
  },
  status: {
    type: String,
    enum: Object.values(TICKET_STATUS),
    default: TICKET_STATUS.OPEN
  },
  assignedDeveloper: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  tester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sprintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sprint',
    default: null
  },
  storyPoints: {
    type: Number,
    min: 0,
    default: 0
  },
  estimatedHours: {
    type: Number,
    min: 0,
    default: 0
  },
  actualHours: {
    type: Number,
    min: 0,
    default: 0
  },
  kanbanColumn: {
    type: String,
    enum: Object.values(DEFAULT_KANBAN_COLUMNS),
    default: DEFAULT_KANBAN_COLUMNS.TODO
  },
  kanbanOrder: {
    type: Number,
    default: 0
  },
  // Bug relation (if ticket type is bug)
  bugTrackerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BugTracker',
    default: null
  },
  comments: [{
    commentId: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId()
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    comment: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  attachments: [String]
}, {
  timestamps: true
});

// Main Project Schema (only tickets are embedded)
const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  startDate: {
    type: Date,
    required: true
  },
  endDate: Date,
  status: {
    type: String,
    enum: Object.values(PROJECT_STATUS),
    default: PROJECT_STATUS.PLANNING
  },
  
  // Only tickets are embedded
  tickets: [ticketSchema],
  
  // References to separate collections
  currentSprintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sprint',
    default: null
  },
  
  // Project members
  teamMembers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  projectManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes
projectSchema.index({ status: 1 });
projectSchema.index({ 'teamMembers': 1 });
projectSchema.index({ projectManager: 1 });
projectSchema.index({ 'tickets.assignedDeveloper': 1 });
projectSchema.index({ 'tickets.status': 1 });
projectSchema.index({ 'tickets.sprintId': 1 });
projectSchema.index({ 'tickets.ticketNumber': 1 });
projectSchema.index({ 'tickets.type': 1 });

export{
  projectSchema,
  PROJECT_STATUS,
  TICKET_TYPES,
  TICKET_PRIORITIES,
  TICKET_STATUS,
  DEFAULT_KANBAN_COLUMNS
};