// leaveSchema.models.js - Comprehensive Leave Management System
import mongoose from 'mongoose';

// Leave request status workflow
const LEAVE_STATUS = {
  PENDING: 'pending',       // Request submitted, awaiting HR/Manager approval
  APPROVED: 'approved',     // Request approved by HR/Manager
  REJECTED: 'rejected',     // Request denied with reason
  CANCELLED: 'cancelled',   // Request cancelled by employee
  WITHDRAWN: 'withdrawn'    // Request withdrawn before approval/rejection
};

// Types of leave available in the organization
const LEAVE_TYPES = {
  SICK_LEAVE: 'sick_leave',
  ANNUAL_LEAVE: 'annual_leave',
  PERSONAL_LEAVE: 'personal_leave',
  MATERNITY_LEAVE: 'maternity_leave',
  PATERNITY_LEAVE: 'paternity_leave',
  BEREAVEMENT_LEAVE: 'bereavement_leave',
  EMERGENCY_LEAVE: 'emergency_leave',
  COMPENSATORY_LEAVE: 'compensatory_leave',
  OTHER: 'other'
};

// Priority levels for leave requests
const LEAVE_PRIORITY = {
  LOW: 'low',        // Regular planned leave
  MEDIUM: 'medium',  // Important but not urgent
  HIGH: 'high',      // Urgent leave request
  EMERGENCY: 'emergency' // Emergency situations
};

const leaveSchema = new mongoose.Schema({
  // Employee who is requesting leave
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Leave request details
  leaveType: {
    type: String,
    enum: Object.values(LEAVE_TYPES),
    required: true
  },
  
  // Leave duration
  startDate: {
    type: Date,
    required: true
  },
  
  endDate: {
    type: Date,
    required: true
  },
  
  // Number of days requested (calculated automatically)
  numberOfDays: {
    type: Number,
    min: 0.5,           // Allow half-day requests
    required: true
  },
  
  // Half day specification
  isHalfDay: {
    type: Boolean,
    default: false
  },
  
  halfDayPeriod: {
    type: String,
    enum: ['morning', 'afternoon'],
    default: null
  },
  
  // Reason for leave
  reason: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  
  // Additional details or comments
  additionalDetails: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  
  // Current status of the leave request
  status: {
    type: String,
    enum: Object.values(LEAVE_STATUS),
    default: LEAVE_STATUS.PENDING
  },
  
  // Priority level
  priority: {
    type: String,
    enum: Object.values(LEAVE_PRIORITY),
    default: LEAVE_PRIORITY.MEDIUM
  },
  
  // HR/Manager who reviewed the request
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Review details
  reviewedAt: {
    type: Date,
    default: null
  },
  
  reviewComments: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  // Supporting documents (medical certificates, etc.)
  attachments: [String],
  
  // Emergency contact during leave
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  
  // Work handover details
  workHandover: {
    handoverTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    handoverNotes: String,
    criticalTasks: [String]
  },
  
  // Leave balance tracking
  leaveBalance: {
    beforeLeave: Number,
    afterLeave: Number,
    leaveTypeBalance: Number
  },
  
  // Approval workflow
  approvalWorkflow: [{
    approver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    approverRole: {
      type: String,
      enum: ['hr', 'manager', 'admin'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    comments: String,
    actionDate: Date,
    order: {
      type: Number,
      required: true
    }
  }],
  
  // System metadata
  submittedAt: {
    type: Date,
    default: Date.now
  },
  
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
leaveSchema.index({ employeeId: 1, status: 1 });
leaveSchema.index({ status: 1, submittedAt: -1 });
leaveSchema.index({ reviewedBy: 1 });
leaveSchema.index({ startDate: 1, endDate: 1 });
leaveSchema.index({ leaveType: 1 });
leaveSchema.index({ priority: 1, status: 1 });

// Virtual for calculating leave duration
leaveSchema.virtual('duration').get(function() {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return this.isHalfDay ? 0.5 : diffDays;
  }
  return 0;
});

// Pre-save middleware to calculate numberOfDays
leaveSchema.pre('save', function(next) {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    this.numberOfDays = this.isHalfDay ? 0.5 : diffDays;
  }
  next();
});

export {
  leaveSchema,
  LEAVE_STATUS,
  LEAVE_TYPES,
  LEAVE_PRIORITY
};
