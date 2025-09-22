// activityLogSchema.models.js
import mongoose from 'mongoose';

//Defines what types of entities can be tracked:
const ENTITY_TYPES = {
  TICKET: 'ticket',   // Individual work tasks
  SPRINT: 'sprint',   //Weekly Sprints
  KANBAN: 'kanban',   //Kanaban Board Activities
  BUG_TRACKER: 'bug_tracker',   //Bug Tracking Activities
  MODULE: 'module',   // Project modules
  PROJECT: 'project',   //Projects
  STANDUP: 'standup',   //Daily standups
  USER: 'user'    //User profiles or Accounts
};


//Specific actions that can be performed:
const ACTIONS = {
  CREATED: 'created',   //Entity Creation
  UPDATED: 'updated',   //General Updates
  DELETED: 'deleted',   //Entity Deletion
  MOVED: 'moved',       //Moving Items [Btw Kanaban Boards, Btw Sprints, etc...]
  ASSIGNED: 'assigned',   //Assigning Work to someone
  UNASSIGNED: 'unassigned',   //Removing Assingments
  COMMENTED: 'commented',   //Adding Comments
  STATUS_CHANGED: 'status_changed',   //Workflow Status Changes
  PRIORITY_CHANGED: 'priority_changed',   //Priority Adjustments
  LOGGED_IN: 'logged_in',   //User Authentication
  LOGGED_OUT: 'logged_out'    //User Logout
};

//Groups actions into logical categories for easier filtering/reporting:
const ACTION_CATEGORIES = {
  TICKET_MANAGEMENT: 'ticket_management',   //All ticket-related actions
  SPRINT_PLANNING: 'sprint_planning',   //Sprint Creation, updates
  KANBAN_UPDATE: 'kanban_update',   //Board movements, updates
  PROJECT_ADMIN: 'project_admin',   //Project-level administration
  USER_MANAGEMENT: 'user_management',   //User-related activities
  STANDUP_ACTIVITY: 'standup_activity'    //Standup meeting activities
};

//Categorizes the nature of field changes:
const CHANGE_TYPES = {
  ADDED: 'added',   // New field/value added
  MODIFIED: 'modified',   // Existing value changed
  REMOVED: 'removed'    // Field/value deleted
};

const activityLogSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  entityType: {
    type: String,
    enum: Object.values(ENTITY_TYPES),
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  developerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Changed from Developer to User
    default: null
  },
  action: {
    type: String,
    enum: Object.values(ACTIONS),
    required: true
  },
  actionCategory: {
    type: String,
    enum: Object.values(ACTION_CATEGORIES),
    required: true
  },
  changes: [{
    field: {
      type: String,
      required: true
    },
    oldValue: String,
    newValue: String,
    changeType: {
      type: String,
      enum: Object.values(CHANGE_TYPES),
      required: true
    }
  }],
  description: {
    type: String,
    required: true
  },
  metadata: {
    ticketNumber: String,
    sprintNumber: Number,
    kanbanBoard: String,
    ipAddress: String,
    userAgent: String,
    sessionId: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: true, updatedAt: false } // Only need createdAt for logs
});

// Indexes
activityLogSchema.index({ projectId: 1, timestamp: -1 });
activityLogSchema.index({ entityType: 1, entityId: 1 });
activityLogSchema.index({ userId: 1, timestamp: -1 });
activityLogSchema.index({ action: 1, actionCategory: 1 });
activityLogSchema.index({ timestamp: -1 });
activityLogSchema.index({ 'metadata.ticketNumber': 1 });

const SPRINT = 'sprint';
const KANBAN = 'kanban';
const BUG_TRACKER = 'bug_tracker';


export {
  activityLogSchema,
  ENTITY_TYPES,
  SPRINT,
  KANBAN,
  BUG_TRACKER,
  ACTIONS,
  ACTION_CATEGORIES,
  CHANGE_TYPES
};

