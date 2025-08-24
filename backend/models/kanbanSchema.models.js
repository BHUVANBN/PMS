// kanbanSchema.models.js
import mongoose from 'mongoose';

const KANBAN_BOARD_TYPES = {
  MAIN: 'main',
  DEVELOPER_SPECIFIC: 'developer_specific',
  SPRINT_SPECIFIC: 'sprint_specific'
};

const DEFAULT_KANBAN_COLUMNS = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  TESTING: 'Testing',
  CODE_REVIEW: 'Code Review',
  DONE: 'Done'
};

const kanbanSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  boardName: {
    type: String,
    required: true
  },
  boardType: {
    type: String,
    enum: Object.values(KANBAN_BOARD_TYPES),
    default: KANBAN_BOARD_TYPES.MAIN
  },
  developerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  sprintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sprint',
    default: null
  },
  columns: [{
    columnId: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId()
    },
    name: {
      type: String,
      required: true
    },
    wipLimit: {
      type: Number,
      default: null
    },
    order: {
      type: Number,
      required: true
    },
    ticketIds: [{
      type: mongoose.Schema.Types.ObjectId
    }]
  }],
  settings: {
    showEstimates: {
      type: Boolean,
      default: true
    },
    showAssignees: {
      type: Boolean,
      default: true
    },
    autoMoveOnStatusChange: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Indexes
kanbanSchema.index({ projectId: 1 });
kanbanSchema.index({ developerId: 1 });
kanbanSchema.index({ sprintId: 1 });
kanbanSchema.index({ boardType: 1 });

export{
  kanbanSchema,
  KANBAN_BOARD_TYPES,
  DEFAULT_KANBAN_COLUMNS
};
