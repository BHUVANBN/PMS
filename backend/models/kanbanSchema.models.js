import mongoose from 'mongoose';

// Defines types of Kanban boards
const KANBAN_BOARD_TYPES = {
  MAIN: 'main',                           // Main project board
  DEVELOPER_SPECIFIC: 'developer_specific', // Individual developer's board
  SPRINT_SPECIFIC: 'sprint_specific'       // Sprint-focused board
};

// Defines standard column names for Kanban boards
const DEFAULT_KANBAN_COLUMNS = {
  TODO: 'To Do',           // Tasks not started
  IN_PROGRESS: 'In Progress', // Tasks being worked on
  TESTING: 'Testing',      // Tasks under testing
  CODE_REVIEW: 'Code Review', // Tasks in review
  DONE: 'Done'            // Completed tasks
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
  columns: [{              // Workflow stages on board
    columnId: {            // Unique column identifier
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId()
    },
    name: {               // Column display name
      type: String,
      required: true
    },
    wipLimit: {           // Max items in column
      type: Number,
      default: null
    },
    order: {              // Column position on board
      type: Number,
      required: true
    },
    ticketIds: [{         // Tasks in column
      type: mongoose.Schema.Types.ObjectId
    }]
  }],
  settings: {             // Board display and behavior options
    showEstimates: {      // Show task effort estimates
      type: Boolean,
      default: true
    },
    showAssignees: {      // Show task assignees
      type: Boolean,
      default: true
    },
    autoMoveOnStatusChange: { // Auto-move tasks on status change
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true        // Auto-track creation/update times
});

// Indexes for efficient querying
kanbanSchema.index({ projectId: 1 });        // Query by project
kanbanSchema.index({ developerId: 1 });      // Query by developer
kanbanSchema.index({ sprintId: 1 });         // Query by sprint
kanbanSchema.index({ boardType: 1 });        // Query by board type

export {
  kanbanSchema,
  KANBAN_BOARD_TYPES,
  DEFAULT_KANBAN_COLUMNS
};