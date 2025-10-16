// models/calendarEventModel.js
import mongoose from 'mongoose';

const calendarEventSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // HR who created the event
    required: true
  },

  title: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    trim: true
  },

  eventDate: {
    type: Date,
    required: true
  },

  startTime: {
    type: String, // Format: "HH:MM" (e.g., "14:30")
    required: true
  },

  endTime: {
    type: String, // Format: "HH:MM" (e.g., "15:30")
    required: true
  },

  meetLink: {
    type: String,
    trim: true
  },

  location: {
    type: String,
    trim: true,
    default: 'Virtual'
  },

  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  eventType: {
    type: String,
    enum: ['meeting', 'review', 'training', 'event', 'other'],
    default: 'meeting'
  },

  isAllDay: {
    type: Boolean,
    default: false
  },

  reminder: {
    type: Boolean,
    default: true
  },

  reminderTime: {
    type: Number, // Minutes before event (e.g., 15, 30, 60)
    default: 15
  },

  isPersonal: {
    type: Boolean,
    default: false
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
calendarEventSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('CalendarEvent', calendarEventSchema);
