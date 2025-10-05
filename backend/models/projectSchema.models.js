// projectSchema.models.js - Complete Project Management Schema
import mongoose from 'mongoose';
//import { moduleSchema } from './moduleSchema.models.js';

// Project lifecycle status options
const PROJECT_STATUS = {
  PLANNING: 'planning',     // Project is being planned, not started yet
  ACTIVE: 'active',         // Project is currently in progress
  ON_HOLD: 'on_hold',       // Project is paused/suspended temporarily - MAY NOT BE NEEDED for simple projects
  COMPLETED: 'completed',   // Project has been finished successfully
  CANCELLED: 'cancelled'    // Project was terminated - MAY NOT BE NEEDED for internal projects
};

// Types of work items that can be created in a project
const TICKET_TYPES = {
  TASK: 'task',            // General development task or feature
  BUG: 'bug',              // Bug fix or issue resolution
  // Could add: FEATURE: 'feature', IMPROVEMENT: 'improvement' in future
};

// Priority levels for tickets (business impact)
const TICKET_PRIORITIES = {
  LOW: 'low',              // Nice to have, can wait
  MEDIUM: 'medium',        // Standard priority, normal timeline
  HIGH: 'high',            // Important, should be done soon
  CRITICAL: 'critical'     // Urgent, blocking other work
};

// Ticket workflow status options
const TICKET_STATUS = {
  OPEN: 'open',            // Ticket created, not yet started
  IN_PROGRESS: 'in_progress', // Developer is actively working on it
  TESTING: 'testing',      // Being tested by QA/tester
  CODE_REVIEW: 'code_review', // Under peer review before merge - OPTIONAL: Skip if no code reviews
  DONE: 'done',            // Completed and verified
  BLOCKED: 'blocked'       // Cannot proceed due to external dependency - OPTIONAL: May not be needed
};

// Standard kanban board column names - REDUNDANT: Already defined in kanbanSchema
const DEFAULT_KANBAN_COLUMNS = {
  TODO: 'To Do',           // Backlog items ready to start
  IN_PROGRESS: 'In Progress', // Work currently being done
  TESTING: 'Testing',      // Items being tested/validated
  CODE_REVIEW: 'Code Review', // Items under review - OPTIONAL
  DONE: 'Done'            // Completed work
};

const MODULE_STATUS = {
  PLANNING: 'planning',     // Module is being planned
  ACTIVE: 'active',         // Module is currently in development
  TESTING: 'testing',       // Module is under testing
  COMPLETED: 'completed',   // Module is finished
  ON_HOLD: 'on_hold'        // Module is paused
};

// Ticket Schema - embedded within Module for better performance
const ticketSchema = new mongoose.Schema({
  
  // REQUIRED: Unique identifier for the ticket (e.g., MOD-001, MOD-002)
  ticketNumber: {
    type: String,
    required: true          // Must have unique reference number for tracking
  },
  
  // REQUIRED: Brief summary of what needs to be done
  title: {
    type: String,
    required: true          // Clear title is mandatory for understanding work
  },
  
  // OPTIONAL: Detailed explanation of the work required
  description: String,      // Can be optional for simple tasks
  
  // REQUIRED: What type of work this ticket represents
  type: {
    type: String,
    enum: Object.values(TICKET_TYPES),
    default: TICKET_TYPES.TASK          // Default to task if not specified
  },
  
  // OPTIONAL: Business priority level - could be simplified to just High/Medium/Low
  priority: {
    type: String,
    enum: Object.values(TICKET_PRIORITIES),
    default: TICKET_PRIORITIES.MEDIUM  // Default to medium priority
  },
  
  // REQUIRED: Current workflow status
  status: {
    type: String,
    enum: Object.values(TICKET_STATUS),
    default: TICKET_STATUS.OPEN        // New tickets start as open
  },
  
  // REQUIRED: Who is responsible for completing this ticket
  assignedDeveloper: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null           // Can be unassigned initially, assigned later by PM
  },
  
  // REQUIRED: Who will test this ticket once development is complete
  tester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null          // Optional tester assignment
  },
  
  // OPTIONAL: Which sprint this ticket belongs to (only if using sprints)
  sprintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sprint',
    default: null           // Can exist in backlog without sprint assignment
  },
  
  // OPTIONAL: Agile story points for effort estimation - may not be needed for simple projects
  storyPoints: {
    type: Number,
    min: 0,                 // Cannot be negative
    default: 0              // Default to 0 if not using story points
  },
  
  // OPTIONAL: Time estimation in hours - useful but not critical
  estimatedHours: {
    type: Number,
    min: 0,                 // Cannot be negative
    default: 0              // Default to 0 if not doing time estimation
  },
  
  // OPTIONAL: Actual time spent on the ticket - useful for reporting but not essential
  actualHours: {
    type: Number,
    min: 0,                 // Cannot be negative
    default: 0              // Starts at 0, updated as work progresses
  },
  
  // OPTIONAL: Target date to complete this ticket
  dueDate: {
    type: Date,
    default: null
  },
  
  // OPTIONAL: Link to bug tracker entry if this ticket is a bug
  bugTrackerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BugTracker',
    default: null           // Only populated for bug-type tickets
  },

  bugTrackerIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BugTracker'
    }
  ],

  // SYSTEM: Timestamps for workflow tracking
  startedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  
  // SYSTEM: Creator of the ticket
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // REQUIRED: Discussion thread for this ticket
  comments: [{
    // Auto-generated unique identifier for each comment
    commentId: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId()  // Auto-generate for referencing
    },
    // Who made this comment
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true        // Must know who commented for accountability
    },
    // The comment content
    comment: {
      type: String,
      required: true        // Empty comments serve no purpose
    },
    // When the comment was made
    createdAt: {
      type: Date,
      default: Date.now     // Automatically timestamp all comments
    }
  }],
  
  // OPTIONAL: File attachments (URLs to stored files) - useful for screenshots, docs
  attachments: [String]     // Array of file URLs/paths from cloud storage
}, {
  timestamps: true          // Auto-manage createdAt and updatedAt for ticket lifecycle
});

const moduleSchema = new mongoose.Schema({
  // REQUIRED: Module identification
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  // OPTIONAL: Detailed module description
  description: String,
  
  // REQUIRED: Links to parent project
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: false,
    default: null
  },
  
  // REQUIRED: Current module status
  status: {
    type: String,
    enum: Object.values(MODULE_STATUS),
    default: MODULE_STATUS.PLANNING
  },
  
  // OPTIONAL: Module order/priority within project
  order: {
    type: Number,
    default: 0
  },
  
  // OPTIONAL: Module start and end dates
  startDate: Date,
  endDate: Date,
  
  // REQUIRED: Person responsible for this module
  moduleLead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    default: null
  },
  
  // OPTIONAL: Team members assigned to this module
  teamMembers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // OPTIONAL: Module completion percentage
  completionPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  // OPTIONAL: Estimated hours for the module
  estimatedHours: {
    type: Number,
    min: 0,
    default: 0
  },
  
  // OPTIONAL: Module priority
  priority: {
    type: String,
    enum: Object.values(TICKET_PRIORITIES),
    default: TICKET_PRIORITIES.MEDIUM
  },
  
  // REQUIRED: All tickets for this module (embedded for better query performance)
  tickets: [ticketSchema]
}, {
  timestamps: true
});

// Note: Indexes are defined at the project level for better performance
// No duplicate indexes needed here since they're handled in projectSchema

// Note: Tickets are now embedded within modules, not directly in projects
// See moduleSchema.models.js for the ticket schema definition

// Main Project Schema - contains all project information and embedded tickets
const projectSchema = new mongoose.Schema({
  
  // REQUIRED: Project identification
  name: {
    type: String,
    required: true          // Every project must have a clear name
  },
  
  // OPTIONAL: Detailed project description/scope - helpful but not mandatory
  description: String,      // Project overview, goals, scope
  
  // REQUIRED: When the project is scheduled to begin
  startDate: {
    type: Date,
    required: true          // Essential for project planning and timeline
  },
  
  // OPTIONAL: Target completion date (can be updated as project progresses)
  endDate: Date,            // Can be set initially or updated later
  
  // REQUIRED: Current project lifecycle status
  status: {
    type: String,
    enum: Object.values(PROJECT_STATUS),
    default: PROJECT_STATUS.PLANNING    // New projects start in planning phase
  },
  
  // REQUIRED: All modules for this project (embedded for better query performance)
  modules: [moduleSchema],  // Embedded documents - faster than separate collection
  
  // OPTIONAL: Reference to currently active sprint (only if using sprint methodology)
  currentSprintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sprint',
    default: null           // Not all projects use sprints, can be null
  },
  
  // REQUIRED: All users who can work on this project
  teamMembers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'             // References to User documents for team composition
  }],
  
  // REQUIRED: Person responsible for managing this project
  projectManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true          // Every project needs a designated manager/owner
  },
  
  // SYSTEM: Creator of the project
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true          // Auto-manage createdAt and updatedAt for project lifecycle
});

// Database indexes for efficient queries - all are useful for common operations
projectSchema.index({ status: 1 });                    // Query projects by status (active, completed, etc.)
projectSchema.index({ 'teamMembers': 1 });             // Find all projects where user is team member
projectSchema.index({ projectManager: 1 });            // Find projects managed by specific user
projectSchema.index({ 'modules.tickets.assignedDeveloper': 1 }); // Find tickets assigned to specific developer
projectSchema.index({ 'modules.tickets.status': 1 });  // Query tickets by their current status
projectSchema.index({ 'modules.tickets.sprintId': 1 }); // Find tickets in specific sprint
projectSchema.index({ 'modules.tickets.ticketNumber': 1 }); // Quick lookup by ticket number (very common)
projectSchema.index({ 'modules.tickets.type': 1 });    // Filter tickets by type (task vs bug)

// Export schema and constants for use in other modules
export {
  projectSchema,           // Main schema for creating Project model
  moduleSchema,            // Embedded module schema (accessible via Project.modules)
  PROJECT_STATUS,          // Available project status options
  TICKET_TYPES,           // Available ticket types
  TICKET_PRIORITIES,      // Available priority levels  
  TICKET_STATUS,          // Available ticket status options
  MODULE_STATUS,          // Available module status options
  DEFAULT_KANBAN_COLUMNS, // CONSIDER REMOVING: Redundant with kanban schema
};