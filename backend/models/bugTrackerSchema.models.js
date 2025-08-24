// bugTrackerSchema.models.js
import mongoose from "mongoose";
const BUG_STATUS = {
  NEW: 'new',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  TESTING: 'testing',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
  REOPENED: 'reopened'
};

const BUG_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

const BUG_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

const BUG_TYPES = {
  FUNCTIONAL: 'functional',
  UI: 'ui',
  PERFORMANCE: 'performance',
  SECURITY: 'security',
  DATA: 'data',
  INTEGRATION: 'integration'
};

const bugTrackerSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  bugNumber: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: Object.values(BUG_STATUS),
    default: BUG_STATUS.NEW
  },
  severity: {
    type: String,
    enum: Object.values(BUG_SEVERITY),
    required: true
  },
  priority: {
    type: String,
    enum: Object.values(BUG_PRIORITY),
    default: BUG_PRIORITY.MEDIUM
  },
  bugType: {
    type: String,
    enum: Object.values(BUG_TYPES),
    required: true
  },
  
  // People involved
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Bug details
  //cloudinary Integration
  //Descripion
  stepsToReproduce: [{
    step: {
      type: String,
      required: true
    },
    order: {
      type: Number,
      required: true
    }
  }],
  expectedBehavior: String,
  actualBehavior: String,
  
  // Resolution details
  resolution: String,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  resolvedAt: {
    type: Date,
    default: null
  },
  
  // Testing - multiple
  testedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  testingNotes: String,
  
  // Tracking
  foundInVersion: String,
  fixedInVersion: String,
  
  // Additional info
  attachments: [String],
  relatedBugs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BugTracker'
  }],
  
  // Comments
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
  }]
}, {
  timestamps: true
});

// Indexes
bugTrackerSchema.index({ projectId: 1, status: 1 });
bugTrackerSchema.index({ ticketId: 1 });
bugTrackerSchema.index({ bugNumber: 1 });
bugTrackerSchema.index({ severity: 1, priority: 1 });
bugTrackerSchema.index({ assignedTo: 1 });
bugTrackerSchema.index({ reportedBy: 1 });
bugTrackerSchema.index({ status: 1, createdAt: -1 });

export{
  bugTrackerSchema,
  BUG_STATUS,
  BUG_SEVERITY,
  BUG_PRIORITY,
  BUG_TYPES
};