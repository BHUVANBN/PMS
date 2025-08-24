// sprintSchema.models.js
import mongoose from 'mongoose';
const SPRINT_STATUS = {
  PLANNING: 'planning',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

const sprintSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  sprintNumber: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: Object.values(SPRINT_STATUS),
    default: SPRINT_STATUS.PLANNING
  },
  goal: String,
  plannedStoryPoints: {
    type: Number,
    default: 0
  },
  completedStoryPoints: {
    type: Number,
    default: 0
  },
  ticketIds: [{
    type: mongoose.Schema.Types.ObjectId
  }],
  assignedDevelopers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Indexes
sprintSchema.index({ projectId: 1, status: 1 });
sprintSchema.index({ startDate: 1, endDate: 1 });
sprintSchema.index({ sprintNumber: 1, projectId: 1 });

export{
  sprintSchema,
  SPRINT_STATUS
};