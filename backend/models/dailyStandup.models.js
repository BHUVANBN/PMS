import mongoose from 'mongoose';

// Daily Standup schema (per-user, per-day)
const dailyStandupSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true },
  date: { type: Date, required: true, index: true }, // normalized to YYYY-MM-DD 00:00:00Z
  dateTime: { type: Date, required: true },

  status: { type: String, enum: ['Delayed', 'On Track', 'Under Review', 'Done'], required: true },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], required: true },

  working_hours: { type: Number, min: 0, default: 0 },
  tasks_done: { type: String, default: '' },
  activity_type: { type: String, default: '' },
  links: { type: String, default: '' },
  progress: { type: String, default: '' }, // free text or percentage string
  blockers: { type: String, default: '' },
  collaboration: { type: String, default: '' },
  next_steps: { type: String, default: '' },
}, { timestamps: true });

// Enforce one record per user per day
dailyStandupSchema.index({ userId: 1, date: 1 }, { unique: true });

// Helper to normalize date to midnight UTC
export const normalizeDate = (d = new Date()) => {
  const n = new Date(d);
  n.setUTCHours(0, 0, 0, 0);
  return n;
};

const DailyStandup = mongoose.models.DailyStandup || mongoose.model('DailyStandup', dailyStandupSchema);
export default DailyStandup;
