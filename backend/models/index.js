import mongoose from 'mongoose';
import { userSchema, USER_ROLES, USER_STATUS } from './userschema.models.js';
import {
	projectSchema,
	moduleSchema,
	PROJECT_STATUS,
	TICKET_TYPES,
	TICKET_PRIORITIES,
	TICKET_STATUS,
	MODULE_STATUS,
	DEFAULT_KANBAN_COLUMNS,
  
} from './projectSchema.models.js';
import { sprintSchema, SPRINT_STATUS, SPRINT_BOARD_TYPES, ASSIGNMENT_STATUS } from './sprintSchema.models.js';
import { kanbanSchema, KANBAN_BOARD_TYPES, DEFAULT_KANBAN_COLUMNS as KANBAN_DEFAULTS, COLUMN_STATUS_MAPPING, WORKFLOW_RULES } from './kanbanSchema.models.js';
import { bugTrackerSchema, BUG_STATUS, BUG_SEVERITY, BUG_PRIORITY, BUG_TYPES } from './bugTrackerSchema.models.js';
import { standupSchema, STANDUP_STATUS, TASK_STATUS, PRIORITY, LEAVE_STATUS, LEAVE_TYPES } from './standupSchema.models.js';
import { activityLogSchema, ENTITY_TYPES, ACTIONS, ACTION_CATEGORIES, CHANGE_TYPES } from './activityLogSchema.models.js';
import { leaveSchema, LEAVE_STATUS as LEAVE_SCHEMA_STATUS, LEAVE_TYPES as LEAVE_SCHEMA_TYPES, LEAVE_PRIORITY } from './leaveSchema.models.js';
import { analyticsSchema, DASHBOARD_TYPES, METRIC_TYPES, TIME_PERIODS } from './analyticsSchema.models.js';
import { Onboarding, ONBOARDING_STATUS } from './onboardingSchema.models.js';


// Compile and export models centrally (idempotent via mongoose.models cache)
const User = mongoose.models.User || mongoose.model('User', userSchema);
const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);
const Sprint = mongoose.models.Sprint || mongoose.model('Sprint', sprintSchema);
const KanbanBoard = mongoose.models.KanbanBoard || mongoose.model('KanbanBoard', kanbanSchema);
const BugTracker = mongoose.models.BugTracker || mongoose.model('BugTracker', bugTrackerSchema);
const Standup = mongoose.models.Standup || mongoose.model('Standup', standupSchema);
const ActivityLog = mongoose.models.ActivityLog || mongoose.model('ActivityLog', activityLogSchema);
const Leave = mongoose.models.Leave || mongoose.model('Leave', leaveSchema);
const Analytics = mongoose.models.Analytics || mongoose.model('Analytics', analyticsSchema);


export {
  // Models
  User,
  Project,
  Sprint,
  KanbanBoard,
  BugTracker,
  Standup,
  ActivityLog,
  Leave,
  Analytics,
  Onboarding,

  // User Enums
  USER_ROLES,
  USER_STATUS,
  
  // Project Enums
  PROJECT_STATUS,
  TICKET_TYPES,
  TICKET_PRIORITIES,
  TICKET_STATUS,
  MODULE_STATUS,
  DEFAULT_KANBAN_COLUMNS,
  
  // Sprint Enums
  SPRINT_STATUS,
  SPRINT_BOARD_TYPES,
  ASSIGNMENT_STATUS,
  
  // Kanban Enums
  KANBAN_BOARD_TYPES,
  KANBAN_DEFAULTS,
  COLUMN_STATUS_MAPPING,
  WORKFLOW_RULES,
  
  // Bug Tracker Enums
  BUG_STATUS,
  BUG_SEVERITY,
  BUG_PRIORITY,
  BUG_TYPES,
  
  // Standup Enums
  STANDUP_STATUS,
  TASK_STATUS,
  PRIORITY,
  
  // Leave Enums (using schema-specific ones to avoid conflicts)
  LEAVE_SCHEMA_STATUS as LEAVE_STATUS,
  LEAVE_SCHEMA_TYPES as LEAVE_TYPES,
  LEAVE_PRIORITY,
  
  // Analytics Enums
  DASHBOARD_TYPES,
  METRIC_TYPES,
  TIME_PERIODS,
  
  // Activity Log Enums
  ENTITY_TYPES,
  ACTIONS,
  ACTION_CATEGORIES,
  CHANGE_TYPES,
  ONBOARDING_STATUS
};
