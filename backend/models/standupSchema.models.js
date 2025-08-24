
// standupSchema.models.js
import mongoose from "mongoose";
const STANDUP_STATUS = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

const ACTION_ITEM_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

const standupSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    default: 15
  }, // in minutes
  status: {
    type: String,
    enum: Object.values(STANDUP_STATUS),
    default: STANDUP_STATUS.SCHEDULED
  },
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Changed from Developer to User
  }],
  updates: [{
    developerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Changed from Developer to User
      required: true
    },
    yesterday: [String],
    today: [String],
    blockers: [String],
    ticketsWorkedOn: [{
      type: mongoose.Schema.Types.ObjectId
    }]
  }],
  notes: String,
  actionItems: [{
    item: {
      type: String,
      required: true
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Changed from Developer to User
      required: true
    },
    dueDate: Date,
    status: {
      type: String,
      enum: Object.values(ACTION_ITEM_STATUS),
      default: ACTION_ITEM_STATUS.OPEN
    }
  }]
}, {
  timestamps: true
});

// Indexes
standupSchema.index({ projectId: 1, date: -1 });
standupSchema.index({ sprintId: 1, date: -1 });
standupSchema.index({ date: -1 });

export{
  standupSchema,
  STANDUP_STATUS,
  ACTION_ITEM_STATUS
};