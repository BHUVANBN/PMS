// activityLogSchema.models.js
import mongoose from 'mongoose';
const ENTITY_TYPES = {
  TICKET: 'ticket',
  SPRINT: 'sprint',
  KANBAN: 'kanban',
  BUG_TRACKER: 'bug_tracker',
  PROJECT: 'project',
  STANDUP: 'standup',
  USER: 'user'
};

const ACTIONS = {
  CREATED: 'created',
  UPDATED: 'updated',
  DELETED: 'deleted',
  MOVED: 'moved',
  ASSIGNED: 'assigned',
  UNASSIGNED: 'unassigned',
  COMMENTED: 'commented',
  STATUS_CHANGED: 'status_changed',
  PRIORITY_CHANGED: 'priority_changed',
  LOGGED_IN: 'logged_in',
  LOGGED_OUT: 'logged_out'
};

const ACTION_CATEGORIES = {
  TICKET_MANAGEMENT: 'ticket_management',
  SPRINT_PLANNING: 'sprint_planning',
  KANBAN_UPDATE: 'kanban_update',
  PROJECT_ADMIN: 'project_admin',
  USER_MANAGEMENT: 'user_management',
  STANDUP_ACTIVITY: 'standup_activity'
};

const CHANGE_TYPES = {
  ADDED: 'added',
  MODIFIED: 'modified',
  REMOVED: 'removed'
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

export const SPRINT = 'sprint';
export const KANBAN = 'kanban';
export const BUG_TRACKER = 'bug_tracker';


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

