// controllers/meetingController.js
import Meeting from '../models/meetingModel.js';
import { User, Project, USER_ROLES } from '../models/index.js';

// ✅ Schedule a meeting (only by Manager)
export const scheduleMeeting = async (req, res) => {
  try {
    const { projectId, title, description, meetingLink, startTime, endTime, participantIds, isTeamMeeting } = req.body;
    const createdBy = req.user._id; // Use _id from your User model

    // Validate required fields
    if (!projectId || !title || !startTime || !endTime) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields: projectId, title, startTime, and endTime are required' 
      });
    }

    // Validate dates
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid date format for startTime or endTime' });
    }
    
    if (start >= end) {
      return res.status(400).json({ message: 'Start time must be before end time' });
    }

    if (start < new Date()) {
      return res.status(400).json({ message: 'Cannot schedule meetings in the past' });
    }

    // Check if user is a manager
    const user = await User.findById(createdBy);
    if (!user || user.role !== USER_ROLES.MANAGER) {
      return res.status(403).json({ message: 'Only Project Managers can schedule meetings' });
    }

    // Verify project exists and populate team members
    const project = await Project.findById(projectId).populate('teamMembers');
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Verify user is the project manager
    if (project.managerId && project.managerId.toString() !== createdBy.toString()) {
      return res.status(403).json({ message: 'You can only schedule meetings for projects you manage' });
    }

    // Determine participants
    let participants = [];
    if (isTeamMeeting) {
      // Include all team members
      participants = project.teamMembers.map(member => member._id);
      
      // Ensure the manager is included
      if (!participants.some(p => p.toString() === createdBy.toString())) {
        participants.push(createdBy);
      }
    } else if (participantIds && participantIds.length > 0) {
      // Validate that all participant IDs exist
      const validParticipants = await User.find({ 
        _id: { $in: participantIds } 
      }).select('_id');
      
      if (validParticipants.length !== participantIds.length) {
        return res.status(400).json({ 
          message: 'One or more participant IDs are invalid' 
        });
      }
      
      participants = participantIds;
      
      // Ensure the manager is included
      if (!participants.includes(createdBy)) {
        participants.push(createdBy);
      }
    } else {
      return res.status(400).json({ 
        message: 'Provide participants or set isTeamMeeting to true' 
      });
    }

    // Create meeting
    const meeting = await Meeting.create({
      projectId,
      createdBy,
      participants,
      title,
      description: description || '',
      meetingLink: meetingLink || '',
      startTime: start,
      endTime: end,
      isTeamMeeting: isTeamMeeting || false
    });

    // Populate the meeting before sending response
    const populatedMeeting = await Meeting.findById(meeting._id)
      .populate('createdBy', 'firstName lastName email role')
      .populate('participants', 'firstName lastName email role')
      .populate('projectId', 'name');

    res.status(201).json({ 
      message: 'Meeting scheduled successfully', 
      meeting: populatedMeeting 
    });
  } catch (err) {
    console.error('Error scheduling meeting:', err);
    res.status(500).json({ 
      message: 'Server error while scheduling meeting', 
      error: err.message 
    });
  }
};

// ✅ Get all meetings for a project
export const getProjectMeetings = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Get meetings where user is a participant or creator
    const meetings = await Meeting.find({ 
      projectId,
      $or: [
        { participants: userId },
        { createdBy: userId }
      ]
    })
      .populate('createdBy', 'firstName lastName email role')
      .populate('participants', 'firstName lastName email role')
      .sort({ startTime: 1 }); // Sort by start time

    res.json({ 
      count: meetings.length,
      meetings 
    });
  } catch (err) {
    console.error('Error fetching meetings:', err);
    res.status(500).json({ 
      message: 'Error fetching meetings', 
      error: err.message 
    });
  }
};

// ✅ Get a single meeting by ID
export const getMeetingById = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const userId = req.user.id;

    const meeting = await Meeting.findById(meetingId)
      .populate('createdBy', 'firstName lastName email role')
      .populate('participants', 'firstName lastName email role')
      .populate('projectId', 'name');

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    // Check if user has access to this meeting
    const isParticipant = meeting.participants.some(p => p._id.toString() === userId);
    const isCreator = meeting.createdBy._id.toString() === userId;

    if (!isParticipant && !isCreator) {
      return res.status(403).json({ message: 'Access denied to this meeting' });
    }

    res.json({ meeting });
  } catch (err) {
    console.error('Error fetching meeting:', err);
    res.status(500).json({ 
      message: 'Error fetching meeting', 
      error: err.message 
    });
  }
};

// ✅ Update a meeting (manager only)
export const updateMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    // Only the creator can update
    if (meeting.createdBy.toString() !== userId) {
      return res.status(403).json({ message: 'Only the meeting creator can update it' });
    }

    // Validate dates if provided
    if (updates.startTime || updates.endTime) {
      const start = new Date(updates.startTime || meeting.startTime);
      const end = new Date(updates.endTime || meeting.endTime);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ message: 'Invalid date format' });
      }
      
      if (start >= end) {
        return res.status(400).json({ message: 'Start time must be before end time' });
      }
    }

    // Update allowed fields
    const allowedUpdates = ['title', 'description', 'meetingLink', 'startTime', 'endTime', 'participantIds'];
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        if (key === 'participantIds') {
          meeting.participants = updates.participantIds;
        } else {
          meeting[key] = updates[key];
        }
      }
    });

    await meeting.save();

    const updatedMeeting = await Meeting.findById(meetingId)
      .populate('createdBy', 'firstName lastName email role')
      .populate('participants', 'firstName lastName email role');

    res.json({ 
      message: 'Meeting updated successfully', 
      meeting: updatedMeeting 
    });
  } catch (err) {
    console.error('Error updating meeting:', err);
    res.status(500).json({ 
      message: 'Error updating meeting', 
      error: err.message 
    });
  }
};

// ✅ Delete a meeting (manager only)
export const deleteMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const userId = req.user.id;

    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    // Only the creator can delete
    if (meeting.createdBy.toString() !== userId) {
      return res.status(403).json({ message: 'Only the meeting creator can delete it' });
    }

    await Meeting.findByIdAndDelete(meetingId);

    res.json({ message: 'Meeting deleted successfully' });
  } catch (err) {
    console.error('Error deleting meeting:', err);
    res.status(500).json({ 
      message: 'Error deleting meeting', 
      error: err.message 
    });
  }
};