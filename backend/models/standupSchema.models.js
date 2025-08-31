import mongoose from "mongoose";

// Defines possible statuses for standup meetings
const STANDUP_STATUS = {
  SCHEDULED: 'scheduled',    // Meeting planned but not started
  IN_PROGRESS: 'in_progress', // Meeting currently in progress
  COMPLETED: 'completed',    // Meeting has concluded
  CANCELLED: 'cancelled'     // Meeting was cancelled
};

// Defines possible statuses for tasks
const TASK_STATUS = {
  OPEN: 'open',              // Task not yet started
  IN_PROGRESS: 'in_progress', // Task being worked on
  COMPLETED: 'completed',    // Task fully completed
  CANCELLED: 'cancelled'     // Task abandoned
};

// Defines priority levels for tasks
const PRIORITY = {
  LOW: 'low',                // Low importance task
  MEDIUM: 'medium',          // Moderate importance task
  HIGH: 'high'               // High importance task
};

const LEAVE_STATUS = {
  PENDING: 'pending',       // Request submitted, awaiting approval
  APPROVED: 'approved',     // Request approved by HR/Manager
  REJECTED: 'rejected',     // Request denied
  CANCELLED: 'cancelled'    // Request cancelled by employee
};

// Leave types
const LEAVE_TYPES = {
  SICK_LEAVE: 'sick_leave',
  ANNUAL_LEAVE: 'annual_leave',
  PERSONAL_LEAVE: 'personal_leave',
  MATERNITY_LEAVE: 'maternity_leave',
  PATERNITY_LEAVE: 'paternity_leave',
  BEREAVEMENT_LEAVE: 'bereavement_leave',
  OTHER: 'other'
};


// Schema for daily standup meetings
const standupSchema = new mongoose.Schema({
  projectId: {                // Links to specific project
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  date: {                    // Date of the standup
    type: Date,
    required: true
  },
  status: {                  // Current state of the meeting
    type: String,
    enum: Object.values(STANDUP_STATUS),
    default: STANDUP_STATUS.SCHEDULED
  },
  attendees: [{              // Team members attending
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  updates: [{                // Individual team member updates
    developerId: {           // Team member providing update
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    tasks: [{               // Tasks associated with the update
      description: {        // Brief task description
        type: String,
        required: true
      },
      priority: {           // Task priority level
        type: String,
        enum: Object.values(PRIORITY),
        default: PRIORITY.MEDIUM
      },
      status: {             // Current task status
        type: String,
        enum: Object.values(TASK_STATUS),
        default: TASK_STATUS.OPEN
      },
      assignedTo: {         // Person responsible for task
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      }
    }],
    blockers: [String],     // Obstacles hindering progress
    outcomes: [String],     // Results from the meeting
    nextSteps: [String],     // Planned follow-up actions
    attendanceConfirmed: {  // Attendance confirmation as per project overview
      type: Boolean,
      default: true
    },
    // Leave request information for this developer
    leaveRequest: {
      leaveType: {          // Type of leave being requested
        type: String,
        enum: Object.values(LEAVE_TYPES),
        default: null
      },
      startDate: {          // Start date of leave
        type: Date,
        default: null
      },
      endDate: {            // End date of leave
        type: Date,
        default: null
      },
      numberOfDays: {       // Number of days requested
        type: Number,
        min: 0.5,           // Allow half-day requests
        default: null
      },
      reason: {             // Reason for leave
        type: String,
        trim: true,
        default: null
      },
      additionalDetails: {  // Additional details about leave
        type: String,
        default: null
      },
      status: {             // Current leave request status
        type: String,
        enum: Object.values(LEAVE_STATUS),
        default: null
      },
      reviewedBy: {         // Who approved/rejected the request
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
      },
      reviewedAt: {         // Review date
        type: Date,
        default: null
      },
      reviewComments: {     // Comments from reviewer
        type: String,
        default: null
      },
      attachments: [String] // Supporting documents (medical certificates, etc.)
    }
  }]
}, {
  timestamps: true          // Auto-add creation and update timestamps
});

// Indexes for efficient querying
standupSchema.index({ projectId: 1, date: -1 }); // Query by project, sort by recent
standupSchema.index({ date: -1 });               // Query by date, sort by recent

export {
  standupSchema,
  STANDUP_STATUS,
  TASK_STATUS,
  PRIORITY
};