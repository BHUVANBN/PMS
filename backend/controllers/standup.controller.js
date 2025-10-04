import mongoose from 'mongoose';
import DailyStandup, { normalizeDate } from '../models/dailyStandup.models.js';
import { User } from '../models/index.js';

// GET /api/standup/today
export const getTodayStatus = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const today = normalizeDate(new Date());

    const existing = await DailyStandup.findOne({ userId, date: today });
    return res.status(200).json({ submitted: !!existing, standup: existing || null });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/standup
export const submitStandup = async (req, res) => {
  try {
    const user = req.user;
    const userId = new mongoose.Types.ObjectId(user._id);

    const today = normalizeDate(new Date());

    // Prevent duplicate submissions
    const existing = await DailyStandup.findOne({ userId, date: today });
    if (existing) {
      return res.status(409).json({ message: 'Standup already submitted for today', standup: existing });
    }

    const now = new Date();
    const payload = req.body || {};

    const doc = await DailyStandup.create({
      userId,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
      date: today,
      dateTime: now,
      status: payload.status,
      priority: payload.priority,
      working_hours: payload.working_hours,
      tasks_done: payload.tasks_done,
      activity_type: payload.activity_type,
      links: payload.links,
      progress: payload.progress,
      blockers: payload.blockers,
      collaboration: payload.collaboration,
      next_steps: payload.next_steps,
    });

    return res.status(201).json({ message: 'Standup submitted', standup: doc });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Standup already submitted for today' });
    }
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/standup/list?userId=&from=&to=&status=&priority=&q=  (Admin/HR only)
export const listStandups = async (req, res) => {
  try {
    const { userId, from, to, status, priority, q, page = 1, limit = 25 } = req.query;
    const match = {};

    if (userId && mongoose.Types.ObjectId.isValid(userId)) match.userId = new mongoose.Types.ObjectId(userId);
    if (status) match.status = status;
    if (priority) match.priority = priority;
    if (from || to) {
      match.date = {};
      if (from) match.date.$gte = normalizeDate(new Date(from));
      if (to) match.date.$lte = normalizeDate(new Date(to));
    }
    if (q) {
      match.$or = [
        { name: { $regex: q, $options: 'i' } },
        { tasks_done: { $regex: q, $options: 'i' } },
        { blockers: { $regex: q, $options: 'i' } },
        { next_steps: { $regex: q, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      DailyStandup.find(match).sort({ date: -1, createdAt: -1 }).skip(skip).limit(Number(limit)),
      DailyStandup.countDocuments(match),
    ]);

    return res.status(200).json({ items, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/standup/me - list my past standups
export const myStandups = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const items = await DailyStandup.find({ userId }).sort({ date: -1, createdAt: -1 }).limit(100);
    return res.status(200).json({ items });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
