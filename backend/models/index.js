import mongoose from 'mongoose';
import { userSchema, USER_ROLES } from './userschema.models.js';
import {
	projectSchema,
	PROJECT_STATUS,
	TICKET_TYPES,
	TICKET_PRIORITIES,
	TICKET_STATUS,
	DEFAULT_KANBAN_COLUMNS
} from './projectSchema.models.js';
import { sprintSchema, SPRINT_STATUS } from './sprintSchema.models.js';
import { kanbanSchema, KANBAN_BOARD_TYPES, DEFAULT_KANBAN_COLUMNS as KANBAN_DEFAULTS } from './kanbanSchema.models.js';
import { bugTrackerSchema, BUG_STATUS, BUG_SEVERITY, BUG_PRIORITY, BUG_TYPES } from './bugTrackerSchema.models.js';
import { standupSchema, STANDUP_STATUS } from './standupSchema.models.js';
import { activityLogSchema, ENTITY_TYPES, ACTIONS, ACTION_CATEGORIES, CHANGE_TYPES } from './activityLogSchema.models.js';


// Compile and export models centrally (idempotent via mongoose.models cache)
const User = mongoose.models.User || mongoose.model('User', userSchema);
const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);
const Sprint = mongoose.models.Sprint || mongoose.model('Sprint', sprintSchema);
const KanbanBoard = mongoose.models.KanbanBoard || mongoose.model('KanbanBoard', kanbanSchema);
const BugTracker = mongoose.models.BugTracker || mongoose.model('BugTracker', bugTrackerSchema);
const Standup = mongoose.models.Standup || mongoose.model('Standup', standupSchema);
const ActivityLog = mongoose.models.ActivityLog || mongoose.model('ActivityLog', activityLogSchema);


export {
  // Models only
  User,
  Project,
  Sprint,
  KanbanBoard,
  BugTracker,
  Standup,
  ActivityLog,

  // Enums (re-exported for convenience)
  USER_ROLES,
  PROJECT_STATUS,
  TICKET_TYPES,
  TICKET_PRIORITIES,
  TICKET_STATUS,
  SPRINT_STATUS,
  KANBAN_BOARD_TYPES,
  KANBAN_DEFAULTS,
  BUG_STATUS,
  BUG_SEVERITY,
  BUG_PRIORITY,
  BUG_TYPES,
  STANDUP_STATUS,
  ENTITY_TYPES,
  ACTIONS,
  ACTION_CATEGORIES,
  CHANGE_TYPES,
  DEFAULT_KANBAN_COLUMNS,

};
