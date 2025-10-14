import express from 'express';
import {
  createCalendarEvent,
  getCalendarEvents,
  getCalendarEventById,
  updateCalendarEvent,
  deleteCalendarEvent,
  getEventsByDateRange,
  getUsersForAttendees
} from '../controllers/calendarEventController.js';
import {
  verifyToken,
  hrOnly,
  hrOrAdmin
} from '../middleware/roleAuth.js';

const router = express.Router();

/**
 * @route   POST /api/calendar/events
 * @desc    Create a new calendar event (HR only)
 * @access  Private (HR)
 */
router.post('/events', verifyToken, hrOnly, createCalendarEvent);

/**
 * @route   GET /api/calendar/events
 * @desc    Get all calendar events (HR sees all, others see their events)
 * @access  Private
 */
router.get('/events', verifyToken, getCalendarEvents);

/**
 * @route   GET /api/calendar/events/range
 * @desc    Get calendar events for a specific date range
 * @access  Private
 */
router.get('/events/range', verifyToken, getEventsByDateRange);

/**
 * @route   GET /api/calendar/events/:eventId
 * @desc    Get a single calendar event by ID
 * @access  Private (Event attendees/creators)
 */
router.get('/events/:eventId', verifyToken, getCalendarEventById);

/**
 * @route   PUT /api/calendar/events/:eventId
 * @desc    Update a calendar event (Creator only)
 * @access  Private (Event creator)
 */
router.put('/events/:eventId', verifyToken, updateCalendarEvent);

/**
 * @route   DELETE /api/calendar/events/:eventId
 * @desc    Delete a calendar event (Creator only)
 * @access  Private (Event creator)
 */
router.delete('/events/:eventId', verifyToken, deleteCalendarEvent);

/**
 * @route   GET /api/calendar/users/attendees
 * @desc    Get all active users for attendee selection (HR only)
 * @access  Private (HR)
 */
router.get('/users/attendees', verifyToken, hrOnly, getUsersForAttendees);

/**
 * @route   GET /api/calendar/test
 * @desc    Test route for calendar API
 * @access  Public
 */
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Calendar routes working ✅' });
});

export default router;
