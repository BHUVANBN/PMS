import mongoose from 'mongoose';
import DailyStandup, { normalizeDate } from '../models/dailyStandup.models.js';
import { User } from '../models/index.js';
import { emitStandupEvent } from '../utils/realtime.js';
import { uploadBufferToCloudinary } from '../utils/uploadToCloudinary.js';
import { Project } from '../models/index.js';

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

// POST /api/standup/:id/comments  (Manager/Admin/HR)
export const addStandupComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body || {};
    if (!comment || !String(comment).trim()) {
      return res.status(400).json({ message: 'Comment is required' });
    }
    const standup = await DailyStandup.findById(id);
    if (!standup) return res.status(404).json({ message: 'Standup not found' });

    const name = `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.username || 'Manager';
    standup.comments = standup.comments || [];
    standup.comments.push({ userId: req.user._id, name, comment: String(comment).trim(), createdAt: new Date() });
    await standup.save();

    emitStandupEvent({ userId: standup.userId.toString(), type: 'standup.commented', data: { standupId: standup._id.toString(), by: name } });

    return res.status(201).json({ message: 'Comment added', standup });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/standup/:id/attachments (multipart form-data: file, name?) (Any authenticated user for their own; admin/hr/manager any)
export const addStandupAttachment = async (req, res) => {
  try {
    const { id } = req.params;
    const standup = await DailyStandup.findById(id);
    if (!standup) return res.status(404).json({ message: 'Standup not found' });

    const isOwner = standup.userId.toString() === req.user._id.toString();
    const privileged = ['admin', 'hr', 'manager'].includes(req.user.role);
    if (!(isOwner || privileged)) return res.status(403).json({ message: 'Forbidden' });

    if (!req.file) return res.status(400).json({ message: 'File is required' });

    const uploaded = await uploadBufferToCloudinary(req.file.buffer, {
      folder: `standups/${standup.userId}/${standup.date.toISOString().slice(0,10)}`,
      public_id: `${Date.now()}-${(req.body?.name || req.file.originalname || 'attachment').slice(0,40)}`,
    });

    const item = {
      url: uploaded.secure_url,
      publicId: uploaded.public_id,
      uploadedAt: new Date(),
      uploadedBy: req.user._id,
      name: req.body?.name || req.file.originalname || ''
    };
    standup.attachments = standup.attachments || [];
    standup.attachments.push(item);
    await standup.save();

    emitStandupEvent({ userId: standup.userId.toString(), type: 'standup.attachment_added', data: { standupId: standup._id.toString(), name: item.name, by: req.user._id.toString() } });

    return res.status(201).json({ message: 'Attachment uploaded', attachment: item, standupId: standup._id });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/standup/today/all (Manager/Admin/HR)
export const getTodayStandupsForManager = async (req, res) => {
  try {
    const today = normalizeDate(new Date());
    const role = req.user.role;
    let match = { date: today };

    // If manager, restrict to their project team members
    if (role === 'manager') {
      const projects = await Project.find({ projectManager: req.user._id }).select('_id teamMembers');
      const memberIds = new Set();
      projects.forEach(p => (p.teamMembers || []).forEach(u => memberIds.add(u.toString())));
      match.userId = { $in: Array.from(memberIds).map(id => new mongoose.Types.ObjectId(id)) };
    }

    const items = await DailyStandup.find(match).sort({ createdAt: -1 });
    return res.status(200).json({ items, total: items.length });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/standup/summary?from=&to=&projectId= (Manager/Admin/HR)
export const getStandupSummary = async (req, res) => {
  try {
    const { from, to, projectId } = req.query;
    const match = {};
    if (from || to) {
      match.date = {};
      if (from) match.date.$gte = normalizeDate(new Date(from));
      if (to) match.date.$lte = normalizeDate(new Date(to));
    }

    // Optional: restrict to project team members
    if (projectId && mongoose.Types.ObjectId.isValid(projectId)) {
      const project = await Project.findById(projectId).select('teamMembers');
      if (project) {
        match.userId = { $in: project.teamMembers.map(id => new mongoose.Types.ObjectId(id.toString())) };
      }
    } else if (req.user.role === 'manager') {
      const projects = await Project.find({ projectManager: req.user._id }).select('teamMembers');
      const set = new Set();
      projects.forEach(p => (p.teamMembers || []).forEach(u => set.add(u.toString())));
      if (set.size) match.userId = { $in: Array.from(set).map(id => new mongoose.Types.ObjectId(id)) };
    }

    const items = await DailyStandup.find(match).select('status priority working_hours date');

    const summary = {
      total: items.length,
      byStatus: {},
      byPriority: {},
      totalHours: 0
    };
    items.forEach(it => {
      if (it.status) summary.byStatus[it.status] = (summary.byStatus[it.status] || 0) + 1;
      if (it.priority) summary.byPriority[it.priority] = (summary.byPriority[it.priority] || 0) + 1;
      if (typeof it.working_hours === 'number') summary.totalHours += it.working_hours;
    });

    return res.status(200).json({ summary });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
