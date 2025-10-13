// models/meetingModel.js
import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Must be a Project Manager
    required: true
  },

  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  title: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    trim: true
  },

  meetingLink: {
    type: String,
    required: true // PM must provide it (Zoom, Google Meet, etc.)
  },

  startTime: {
    type: Date,
    required: true
  },

  endTime: {
    type: Date,
    required: true
  },

  isTeamMeeting: {
    type: Boolean,
    default: false // false = 1-on-1, true = entire team
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Meeting', meetingSchema);
