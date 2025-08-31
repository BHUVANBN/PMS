import mongoose from 'mongoose';

// Defines possible statuses for sprints
const SPRINT_STATUS = {
  PLANNING: 'planning',    // Sprint in planning phase
  ACTIVE: 'active',        // Sprint currently running
  COMPLETED: 'completed',  // Sprint finished
  CANCELLED: 'cancelled'   // Sprint stopped early
};

// Schema for sprint records
const sprintSchema = new mongoose.Schema({
  projectId: {              // Links to specific project
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  sprintNumber: {          // Sprint sequence in project
    type: Number,
    required: true
  },
  name: {                  // Sprint's descriptive name
    type: String,
    required: true
  },
  startDate: {             // Sprint start date
    type: Date,
    required: true
  },
  endDate: {               // Sprint end date
    type: Date,
    required: true
  },
  status: {                // Current sprint status
    type: String,
    enum: Object.values(SPRINT_STATUS),
    default: SPRINT_STATUS.PLANNING
  },
  goal: String,            // Sprint objectives
  plannedStoryPoints: {    // Planned effort estimate
    type: Number,
    default: 0
  },
  completedStoryPoints: {  // Completed effort estimate
    type: Number,
    default: 0
  },
  ticketIds: [{            // Tasks in sprint
    type: mongoose.Schema.Types.ObjectId
  }],
  assignedDevelopers: [{   // Team members assigned
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true         // Auto-track creation/update times
});

// Indexes for efficient querying
sprintSchema.index({ projectId: 1, status: 1 });     // Query by project and status
sprintSchema.index({ startDate: 1, endDate: 1 });    // Query by date range
sprintSchema.index({ sprintNumber: 1, projectId: 1 }); // Query by sprint number and project

export {
  sprintSchema,
  SPRINT_STATUS
};