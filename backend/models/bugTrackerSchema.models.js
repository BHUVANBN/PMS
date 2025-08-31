// Simplified bugTrackerSchema.models.js - For Testers Only
import mongoose from "mongoose";

const BUG_STATUS = {
  NEW: 'new',                    // Bug just reported, not yet assigned
  ASSIGNED: 'assigned',          // REQUIRED: Tester needs to know bug is assigned to developer
  IN_PROGRESS: 'in_progress',    // Developer is working on the fix
  // TESTING: 'testing',         // REMOVED: Not needed in tester-only system
  RESOLVED: 'resolved',          // Developer claims bug is fixed, ready for retesting
  CLOSED: 'closed',             // Tester verified fix and closed the bug
  REOPENED: 'reopened'          // Tester found bug still exists after "resolved"
};

const BUG_SEVERITY = {
  LOW: 'low',        // Minor issue, doesn't block functionality
  MEDIUM: 'medium',  // Moderate issue, affects some functionality
  HIGH: 'high',      // Major issue, affects core functionality
  CRITICAL: 'critical' // System breaking, requires immediate attention
};

// REMOVED: Priority is business decision, not tester concern
const BUG_PRIORITY = {
   LOW: 'low',
   MEDIUM: 'medium', 
   HIGH: 'high',
   URGENT: 'urgent'
 };

const BUG_TYPES = {
  FUNCTIONAL: 'functional',    // Feature not working as expected
  UI: 'ui',                   // Visual/interface issues
  PERFORMANCE: 'performance', // Speed/efficiency problems
  SECURITY: 'security',       // Security vulnerabilities
  DATA: 'data'               // Data corruption/incorrect data issues
  // INTEGRATION: 'integration' // REMOVED: Usually handled by developers, not testers
};

const bugTrackerSchema = new mongoose.Schema({
  // Core identification
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true  // Links bug to specific project
  },
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true  // Links bug to related user story/feature
  },
  bugNumber: {
    type: String,
    required: true,
    unique: true    // Unique identifier for easy reference (e.g., BUG-001)
  },
  
  // Bug description
  title: {
    type: String,
    required: true  // Brief summary of the bug
  },
  description: {
    type: String,
    required: true  // Detailed description of the issue
  },
  
  // Bug classification
  status: {
    type: String,
    enum: Object.values(BUG_STATUS),
    default: BUG_STATUS.NEW  // Default status when bug is first reported
  },
  severity: {
    type: String,
    enum: Object.values(BUG_SEVERITY),
    required: true  // Tester determines impact level
  },

  // REMOVED: Priority field - business decides priority, not testers
   priority: {
     type: String,
     enum: Object.values(BUG_PRIORITY),
     default: BUG_PRIORITY.MEDIUM
   },
  bugType: {
    type: String,
    enum: Object.values(BUG_TYPES),
    required: true  // Helps categorize and route bugs to right team
  },
  
  // People involved
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true  // REQUIRED: Tracks which tester found the bug
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null   // REQUIRED: Tester needs to know which developer will fix it
  },
  
  // Bug reproduction details
  stepsToReproduce: [{
    step: {
      type: String,
      required: true  // Each step to reproduce the bug
    },
    order: {
      type: Number,
      required: true  // Sequence of steps matters for reproduction
    }
  }],
  expectedBehavior: String,  // What should happen (helps developer understand intent)
  actualBehavior: String,    // What actually happens (describes the problem)
  
  // Resolution tracking
  resolution: String,        // How the bug was fixed (helpful for tester verification)
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null   // REQUIRED: Tester needs to know who fixed it for follow-up
  },
  resolvedAt: {
    type: Date,
    default: null   // When bug was marked as fixed (helps track resolution time)
  },
  
  // Testing verification
  // REMOVED: testedBy field - in tester-only system, reporter does retesting
  testedBy: {
     type: mongoose.Schema.Types.ObjectId,
     ref: 'User',
     default: null
   },
  testingNotes: String,  // Tester's notes during verification/retesting
  
  // Version tracking
  foundInVersion: String,    // Which version/build the bug was found in
  // REMOVED: fixedInVersion - testers don't track which version it was fixed in
  fixedInVersion: String,
  
  // Supporting materials
  attachments: [String],     // Screenshots, logs, videos to help reproduce bug
  
  
   relatedBugs: [{
     type: mongoose.Schema.Types.ObjectId,
     ref: 'BugTracker'
   }],
  
  // Communication
  comments: [{
    commentId: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId()  // Unique ID for each comment
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true  // Who made the comment
    },
    comment: {
      type: String,
      required: true  // The comment content
    },
    createdAt: {
      type: Date,
      default: Date.now  // When comment was made
    }
  }]
}, {
  timestamps: true  // Automatically tracks createdAt and updatedAt
});

// Indexes for efficient queries
bugTrackerSchema.index({ projectId: 1, status: 1 });    // Find bugs by project and status
bugTrackerSchema.index({ ticketId: 1 });                // Find bugs for specific ticket
bugTrackerSchema.index({ bugNumber: 1 });               // Quick lookup by bug number
bugTrackerSchema.index({ severity: 1 });                // Filter by severity level
// RESTORED: Index for assignment queries
bugTrackerSchema.index({ assignedTo: 1 });              // Find bugs assigned to specific developer
bugTrackerSchema.index({ reportedBy: 1 });              // Find bugs reported by specific tester
bugTrackerSchema.index({ status: 1, createdAt: -1 });   // Latest bugs by status

export {
  bugTrackerSchema,
  BUG_STATUS,
  BUG_SEVERITY,
  BUG_TYPES,
  BUG_PRIORITY
};