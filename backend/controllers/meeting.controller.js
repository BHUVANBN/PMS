// controllers/meetingController.js
import Meeting from '../models/meetingModel.js';
import { User, Project, USER_ROLES } from '../models/index.js';


// ✅ Schedule a meeting (only by Manager)
export const scheduleMeeting = async (req, res) => {
  try {
    const { projectId, title, description, meetingLink, startTime, endTime, participantIds, isTeamMeeting } = req.body;
    const createdBy = req.user.id; // assuming user info comes from JWT

    // Check if user is a manager
    const user = await User.findById(createdBy);
    if (!user || user.role !== USER_ROLES.MANAGER) {
      return res.status(403).json({ message: 'Only Project Managers can schedule meetings' });
    }

    // Verify project exists
    const project = await Project.findById(projectId).populate('teamMembers');
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Determine participants
    let participants = [];
    if (isTeamMeeting) {
      participants = project.teamMembers.map(member => member._id);
    } else if (participantIds && participantIds.length > 0) {
      participants = participantIds;
    } else {
      return res.status(400).json({ message: 'Provide participants or set isTeamMeeting to true' });
    }

    // Create meeting
    const meeting = await Meeting.create({
      projectId,
      createdBy,
      participants,
      title,
      description,
      meetingLink,
      startTime,
      endTime,
      isTeamMeeting
    });

    res.status(201).json({ message: 'Meeting scheduled successfully', meeting });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ✅ Get all meetings for a project
export const getProjectMeetings = async (req, res) => {
  try {
    const { projectId } = req.params;
    const meetings = await Meeting.find({ projectId })
      .populate('createdBy', 'firstName lastName email role')
      .populate('participants', 'firstName lastName email role');
    res.json(meetings);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching meetings', error: err.message });
  }
};
