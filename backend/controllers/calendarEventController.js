// controllers/calendarEventController.js
import CalendarEvent from '../models/calendarEventModel.js';
import { User, USER_ROLES } from '../models/index.js';
import { eventBus } from '../utils/realtime.js';

// ✅ Create a new calendar event (HR only)
export const createCalendarEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      eventDate,
      startTime,
      endTime,
      meetLink,
      location,
      attendeeIds,
      eventType,
      isAllDay,
      reminder,
      reminderTime
    } = req.body;

    const createdBy = req.user._id;

    // Validate required fields
    if (!title || !eventDate || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, eventDate, startTime, and endTime are required'
      });
    }

    // Check if user is HR
    const user = await User.findById(createdBy);
    if (!user || user.role !== USER_ROLES.HR) {
      return res.status(403).json({
        success: false,
        message: 'Only HR can create calendar events'
      });
    }

    // Validate date
    const eventDateObj = new Date(eventDate);
    if (isNaN(eventDateObj.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event date format'
      });
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid time format. Use HH:MM format (e.g., 14:30)'
      });
    }

    // Validate attendees if provided
    let attendees = [];
    if (attendeeIds && attendeeIds.length > 0) {
      const validAttendees = await User.find({
        _id: { $in: attendeeIds },
        isActive: true
      }).select('_id firstName lastName email');

      if (validAttendees.length !== attendeeIds.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more attendee IDs are invalid or inactive'
        });
      }

      attendees = attendeeIds;
    }

    // Create the event
    const calendarEvent = await CalendarEvent.create({
      createdBy,
      title,
      description: description || '',
      eventDate: eventDateObj,
      startTime,
      endTime,
      meetLink: meetLink || '',
      location: location || 'Virtual',
      attendees,
      eventType: eventType || 'meeting',
      isAllDay: isAllDay || false,
      reminder: reminder !== undefined ? reminder : true,
      reminderTime: reminderTime || 15
    });

    // Populate the event for response
    const populatedEvent = await CalendarEvent.findById(calendarEvent._id)
      .populate('createdBy', 'firstName lastName email role')
      .populate('attendees', 'firstName lastName email role');

    res.status(201).json({
      success: true,
      message: 'Calendar event created successfully',
      event: populatedEvent
    });

    try {
      const attendeeIds = (calendarEvent.attendees || []).map(a => a.toString());
      const targets = Array.from(new Set([createdBy.toString(), ...attendeeIds]));
      eventBus.emit('multicast', {
        users: targets,
        payload: { type: 'calendar.created', data: populatedEvent }
      });
      eventBus.emit('broadcast', { type: 'calendar.created', data: { _id: calendarEvent._id } });
    } catch (e) {
      // non-blocking
    }

  } catch (err) {
    console.error('Error creating calendar event:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while creating calendar event',
      error: err.message
    });
  }
};

// ✅ Get all calendar events (HR can see all, others see their events)
export const getCalendarEvents = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    let query = {};

    if (user.role === USER_ROLES.HR) {
      // HR can see all events
      query = {};
    } else {
      // Others can only see events they're attending or created
      query = {
        $or: [
          { attendees: userId },
          { createdBy: userId }
        ]
      };
    }

    const events = await CalendarEvent.find(query)
      .populate('createdBy', 'firstName lastName email role')
      .populate('attendees', 'firstName lastName email role')
      .sort({ eventDate: 1, startTime: 1 });

    res.json({
      success: true,
      count: events.length,
      events
    });
  } catch (err) {
    console.error('Error fetching calendar events:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching calendar events',
      error: err.message
    });
  }
};

// ✅ Get events for a specific date range
export const getEventsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate and endDate are required'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }

    let query = {
      eventDate: { $gte: start, $lte: end }
    };

    if (user.role !== USER_ROLES.HR) {
      // Non-HR users can only see events they're attending or created
      query.$or = [
        { attendees: userId },
        { createdBy: userId }
      ];
    }

    const events = await CalendarEvent.find(query)
      .populate('createdBy', 'firstName lastName email role')
      .populate('attendees', 'firstName lastName email role')
      .sort({ eventDate: 1, startTime: 1 });

    res.json({
      success: true,
      count: events.length,
      events
    });
  } catch (err) {
    console.error('Error fetching events by date range:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching events by date range',
      error: err.message
    });
  }
};

// ✅ Get a single calendar event by ID
export const getCalendarEventById = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;

    const event = await CalendarEvent.findById(eventId)
      .populate('createdBy', 'firstName lastName email role')
      .populate('attendees', 'firstName lastName email role');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Calendar event not found'
      });
    }

    // Check if user has access to this event
    const isAttendee = event.attendees.some(attendee => attendee._id.toString() === userId);
    const isCreator = event.createdBy._id.toString() === userId;

    if (!isAttendee && !isCreator) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this event'
      });
    }

    res.json({
      success: true,
      event
    });
  } catch (err) {
    console.error('Error fetching calendar event:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching calendar event',
      error: err.message
    });
  }
};

// ✅ Update a calendar event (only creator can update)
export const updateCalendarEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;
    const updates = req.body;

    const event = await CalendarEvent.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Calendar event not found'
      });
    }

    // Only the creator can update
    if (event.createdBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the event creator can update it'
      });
    }

    // Validate time format if provided
    if (updates.startTime) {
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(updates.startTime)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid start time format. Use HH:MM format'
        });
      }
    }

    if (updates.endTime) {
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(updates.endTime)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid end time format. Use HH:MM format'
        });
      }
    }

    // Validate attendees if provided
    if (updates.attendeeIds) {
      const validAttendees = await User.find({
        _id: { $in: updates.attendeeIds },
        isActive: true
      }).select('_id');

      if (validAttendees.length !== updates.attendeeIds.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more attendee IDs are invalid or inactive'
        });
      }

      event.attendees = updates.attendeeIds;
    }

    // Update allowed fields
    const allowedUpdates = [
      'title', 'description', 'eventDate', 'startTime', 'endTime',
      'meetLink', 'location', 'eventType', 'isAllDay', 'reminder', 'reminderTime'
    ];

    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key) && key !== 'attendeeIds') {
        event[key] = updates[key];
      }
    });

    await event.save();

    const updatedEvent = await CalendarEvent.findById(eventId)
      .populate('createdBy', 'firstName lastName email role')
      .populate('attendees', 'firstName lastName email role');

    res.json({
      success: true,
      message: 'Calendar event updated successfully',
      event: updatedEvent
    });

    try {
      const attendeeIds = (updatedEvent.attendees || []).map(a => a._id?.toString?.() || a.toString());
      const targets = Array.from(new Set([updatedEvent.createdBy?._id?.toString?.() || event.createdBy.toString(), ...attendeeIds]));
      eventBus.emit('multicast', {
        users: targets,
        payload: { type: 'calendar.updated', data: updatedEvent }
      });
      eventBus.emit('broadcast', { type: 'calendar.updated', data: { _id: updatedEvent._id } });
    } catch (e) {
      // non-blocking
    }
  } catch (err) {
    console.error('Error updating calendar event:', err);
    res.status(500).json({
      success: false,
      message: 'Error updating calendar event',
      error: err.message
    });
  }
};

// ✅ Delete a calendar event (only creator can delete)
export const deleteCalendarEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;

    const event = await CalendarEvent.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Calendar event not found'
      });
    }

    // Only the creator can delete
    if (event.createdBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the event creator can delete it'
      });
    }

    await CalendarEvent.findByIdAndDelete(eventId);

    res.json({
      success: true,
      message: 'Calendar event deleted successfully'
    });

    try {
      const attendeeIds = (event.attendees || []).map(a => a.toString());
      const targets = Array.from(new Set([event.createdBy.toString(), ...attendeeIds]));
      eventBus.emit('multicast', {
        users: targets,
        payload: { type: 'calendar.deleted', data: { _id: eventId } }
      });
      eventBus.emit('broadcast', { type: 'calendar.deleted', data: { _id: eventId } });
    } catch (e) {
      // non-blocking
    }
  } catch (err) {
    console.error('Error deleting calendar event:', err);
    res.status(500).json({
      success: false,
      message: 'Error deleting calendar event',
      error: err.message
    });
  }
};

// ✅ Get all active users for attendee selection (HR only)
export const getUsersForAttendees = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Only HR can access this endpoint
    if (!user || user.role !== USER_ROLES.HR) {
      return res.status(403).json({
        success: false,
        message: 'Only HR can access user list for attendees'
      });
    }

    const users = await User.find({
      isActive: true,
      role: { $ne: USER_ROLES.ADMIN } // Exclude admin users from attendee list
    })
    .select('firstName lastName email role')
    .sort({ firstName: 1, lastName: 1 });

    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (err) {
    console.error('Error fetching users for attendees:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching users for attendees',
      error: err.message
    });
  }
};
