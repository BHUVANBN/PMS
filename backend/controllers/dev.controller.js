import mongoose from 'mongoose';
import { User, Project, KanbanBoard, Standup, TICKET_STATUS, DEFAULT_KANBAN_COLUMNS } from '../models/index.js';

// Helper: map Kanban column name → ticket status
const kanbanColumnToTicketStatus = (columnName) => {
	switch (columnName) {
		case DEFAULT_KANBAN_COLUMNS.TODO:
			return TICKET_STATUS.OPEN;
		case DEFAULT_KANBAN_COLUMNS.IN_PROGRESS:
			return TICKET_STATUS.IN_PROGRESS;
		case DEFAULT_KANBAN_COLUMNS.TESTING:
			return TICKET_STATUS.TESTING;
		case DEFAULT_KANBAN_COLUMNS.CODE_REVIEW:
			return TICKET_STATUS.CODE_REVIEW;
		case DEFAULT_KANBAN_COLUMNS.DONE:
			return TICKET_STATUS.DONE;
		default:
			return null;
	}
};

export const getDeveloperDashboard = async (req, res) => {
	try {
		const developerId = new mongoose.Types.ObjectId(req.user.id);

		// Projects where developer is a team member
		const projects = await Project.find({ teamMembers: developerId })
			.select('name status teamMembers currentSprintId')
			.sort({ updatedAt: -1 })
			.limit(10);

		// Tickets assigned to developer (across projects) via aggregation on nested embedded arrays
		const ticketsAgg = await Project.aggregate([
			{ $match: { teamMembers: developerId } },
			{ $unwind: '$modules' },
			{ $unwind: '$modules.tickets' },
			{ $match: { 'modules.tickets.assignedDeveloper': developerId } },
			{ $project: {
				projectId: '$_id',
				projectName: '$name',
				moduleId: '$modules._id',
				moduleName: '$modules.name',
				ticketId: '$modules.tickets._id',
				ticketNumber: '$modules.tickets.ticketNumber',
				title: '$modules.tickets.title',
				status: '$modules.tickets.status',
				priority: '$modules.tickets.priority',
				type: '$modules.tickets.type',
				sprintId: '$modules.tickets.sprintId',
				storyPoints: '$modules.tickets.storyPoints',
				updatedAt: '$modules.tickets.updatedAt'
			} },
			{ $sort: { updatedAt: -1 } },
			{ $limit: 20 }
		]);

		// Developer-specific Kanban boards or main boards from member projects
		const boardQuery = {
			$or: [
				{ developerId },
				{ projectId: { $in: projects.map(p => p._id) } }
			]
		};
		const boards = await KanbanBoard.find(boardQuery)
			.select('projectId boardName boardType developerId sprintId columns settings')
			.limit(10)
			.sort({ updatedAt: -1 });

		// Recent standups where dev is attendee or has updates
		const standups = await Standup.find({
			$or: [
				{ attendees: developerId },
				{ 'updates.developerId': developerId }
			]
		})
			.select('projectId date status attendees updates')
			.sort({ date: -1 })
			.limit(10);

		return res.status(200).json({
			projects,
			tickets: ticketsAgg,
			boards,
			standups
		});
	} catch (error) {
		return res.status(500).json({ message: 'Server error', error: error.message });
	}
};

export const getMyProjects = async (req, res) => {
	try {
		const developerId = new mongoose.Types.ObjectId(req.user.id);
		const projects = await Project.find({ teamMembers: developerId })
			.select('name status description startDate endDate projectManager teamMembers currentSprintId createdAt updatedAt')
			.sort({ updatedAt: -1 });
		return res.status(200).json({ projects, count: projects.length });
	} catch (error) {
		return res.status(500).json({ message: 'Server error', error: error.message });
	}
};

export const getMyTickets = async (req, res) => {
	try {
		const developerId = new mongoose.Types.ObjectId(req.user.id);
		const { status, priority, type, projectId, search } = req.query;

		const match = { 'modules.tickets.assignedDeveloper': developerId };
		if (status) match['modules.tickets.status'] = status;
		if (priority) match['modules.tickets.priority'] = priority;
		if (type) match['modules.tickets.type'] = type;
		if (projectId && mongoose.Types.ObjectId.isValid(projectId)) match._id = new mongoose.Types.ObjectId(projectId);

		const pipeline = [
			{ $match: { teamMembers: developerId, ...(match._id ? { _id: match._id } : {}) } },
			{ $unwind: '$modules' },
			{ $unwind: '$modules.tickets' },
			{ $match: match },
		];

		if (search && search.trim()) {
			pipeline.push({ $match: { 'modules.tickets.title': { $regex: search.trim(), $options: 'i' } } });
		}

		pipeline.push(
			{ $project: {
				projectId: '$_id',
				projectName: '$name',
				moduleId: '$modules._id',
				moduleName: '$modules.name',
				ticketId: '$modules.tickets._id',
				ticketNumber: '$modules.tickets.ticketNumber',
				title: '$modules.tickets.title',
				description: '$modules.tickets.description',
				status: '$modules.tickets.status',
				priority: '$modules.tickets.priority',
				type: '$modules.tickets.type',
				sprintId: '$modules.tickets.sprintId',
				storyPoints: '$modules.tickets.storyPoints',
				estimatedHours: '$modules.tickets.estimatedHours',
				actualHours: '$modules.tickets.actualHours',
				updatedAt: '$modules.tickets.updatedAt'
			} },
			{ $sort: { updatedAt: -1 } }
		);

		const tickets = await Project.aggregate(pipeline);
		return res.status(200).json({ tickets, count: tickets.length });
	} catch (error) {
		return res.status(500).json({ message: 'Server error', error: error.message });
	}
};

export const getMyKanbanBoards = async (req, res) => {
	try {
		const developerId = new mongoose.Types.ObjectId(req.user.id);
		const boards = await KanbanBoard.find({
			$or: [
				{ developerId },
				{ projectId: { $in: (await Project.find({ teamMembers: developerId }).distinct('_id')) } }
			]
		})
			.select('projectId boardName boardType developerId sprintId columns settings createdAt updatedAt')
			.sort({ updatedAt: -1 });
		return res.status(200).json({ boards, count: boards.length });
	} catch (error) {
		return res.status(500).json({ message: 'Server error', error: error.message });
	}
};

export const moveOnKanbanBoard = async (req, res) => {
	try {
		const developerId = new mongoose.Types.ObjectId(req.user.id);
		const { boardId } = req.params;
		const { ticketId, fromColumnId, toColumnId, toIndex } = req.body;

		if (!boardId || !ticketId || !fromColumnId || !toColumnId || typeof toIndex !== 'number') {
			return res.status(400).json({ message: 'boardId, ticketId, fromColumnId, toColumnId, toIndex are required' });
		}

		const board = await KanbanBoard.findById(boardId);
		if (!board) return res.status(404).json({ message: 'Board not found' });

		// Access control: developer must be owner of dev board or member of project
		const isMember = await Project.exists({ _id: board.projectId, teamMembers: developerId });
		if (!(board.developerId?.toString() === developerId.toString() || isMember)) {
			return res.status(403).json({ message: 'Forbidden' });
		}

		// Remove from source
		const fromColumn = board.columns.find(c => c.columnId?.toString() === fromColumnId);
		const toColumn = board.columns.find(c => c.columnId?.toString() === toColumnId);
		if (!fromColumn || !toColumn) return res.status(400).json({ message: 'Invalid columnId' });

		const idx = fromColumn.ticketIds.findIndex(id => id.toString() === ticketId);
		if (idx === -1) return res.status(400).json({ message: 'Ticket not in source column' });
		fromColumn.ticketIds.splice(idx, 1);
		toColumn.ticketIds.splice(Math.max(0, Math.min(toIndex, toColumn.ticketIds.length)), 0, new mongoose.Types.ObjectId(ticketId));

		await board.save();

		// Optionally sync ticket status with column name if autoMoveOnStatusChange
		if (board.settings?.autoMoveOnStatusChange && toColumn?.name) {
			const newStatus = kanbanColumnToTicketStatus(toColumn.name);
			if (newStatus) {
				await Project.updateOne(
					{ _id: board.projectId, 'modules.tickets._id': new mongoose.Types.ObjectId(ticketId) },
					{ $set: { 'modules.tickets.$.status': newStatus } }
				);
			}
		}

		return res.status(200).json({ message: 'Moved', board });
	} catch (error) {
		return res.status(500).json({ message: 'Server error', error: error.message });
	}
};

export const getMyStandups = async (req, res) => {
	try {
		const developerId = new mongoose.Types.ObjectId(req.user.id);
		const standups = await Standup.find({
			$or: [
				{ attendees: developerId },
				{ 'updates.developerId': developerId }
			]
		})
			.select('projectId date status attendees updates createdAt updatedAt')
			.sort({ date: -1 });
		return res.status(200).json({ standups, count: standups.length });
	} catch (error) {
		return res.status(500).json({ message: 'Server error', error: error.message });
	}
};

export const upsertMyStandupUpdate = async (req, res) => {
	try {
		const developerId = new mongoose.Types.ObjectId(req.user.id);
		const { standupId } = req.params;
		const { tasks = [], blockers = [], outcomes = [], nextSteps = [] } = req.body || {};

		if (!mongoose.Types.ObjectId.isValid(standupId)) {
			return res.status(400).json({ message: 'Invalid standupId' });
		}

		const standup = await Standup.findById(standupId);
		if (!standup) return res.status(404).json({ message: 'Standup not found' });

		// Ensure dev is allowed: attendee or project member
		const isAttendee = standup.attendees?.some(id => id.toString() === developerId.toString());
		const isMember = await Project.exists({ _id: standup.projectId, teamMembers: developerId });
		if (!(isAttendee || isMember)) return res.status(403).json({ message: 'Forbidden' });

		// Upsert update for this developer
		const updateIdx = standup.updates.findIndex(u => u.developerId?.toString() === developerId.toString());
		if (updateIdx === -1) {
			standup.updates.push({ developerId, tasks, blockers, outcomes, nextSteps });
		} else {
			standup.updates[updateIdx].tasks = tasks;
			standup.updates[updateIdx].blockers = blockers;
			standup.updates[updateIdx].outcomes = outcomes;
			standup.updates[updateIdx].nextSteps = nextSteps;
		}

		await standup.save();
		return res.status(200).json({ message: 'Standup update saved', standup });
	} catch (error) {
		return res.status(500).json({ message: 'Server error', error: error.message });
	}
};

/**
 * Get Developer dashboard statistics
 */
export const getDeveloperStats = async (req, res) => {
	try {
		const developerId = new mongoose.Types.ObjectId(req.user.id);

		// Get projects where developer is a team member
		const projects = await Project.find({ teamMembers: developerId });
		const projectIds = projects.map(p => p._id);

		// Get tickets assigned to this developer
		const ticketsAgg = await Project.aggregate([
			{ $match: { teamMembers: developerId } },
			{ $unwind: '$modules' },
			{ $unwind: '$modules.tickets' },
			{ $match: { 'modules.tickets.assignedDeveloper': developerId } },
			{ $group: {
				_id: '$modules.tickets.status',
				count: { $sum: 1 },
				storyPoints: { $sum: '$modules.tickets.storyPoints' }
			}}
		]);

		// Process ticket statistics
		const ticketStats = {
			total: 0,
			open: 0,
			inProgress: 0,
			testing: 0,
			codeReview: 0,
			done: 0,
			totalStoryPoints: 0
		};

		ticketsAgg.forEach(stat => {
			ticketStats.total += stat.count;
			ticketStats.totalStoryPoints += stat.storyPoints || 0;
			
			switch (stat._id) {
				case TICKET_STATUS.OPEN:
					ticketStats.open = stat.count;
					break;
				case TICKET_STATUS.IN_PROGRESS:
					ticketStats.inProgress = stat.count;
					break;
				case TICKET_STATUS.TESTING:
					ticketStats.testing = stat.count;
					break;
				case TICKET_STATUS.CODE_REVIEW:
					ticketStats.codeReview = stat.count;
					break;
				case TICKET_STATUS.DONE:
					ticketStats.done = stat.count;
					break;
			}
		});

		// Get recent standups
		const recentStandups = await Standup.find({
			$or: [
				{ attendees: developerId },
				{ projectId: { $in: projectIds } }
			]
		}).sort({ date: -1 }).limit(5);

		const standupStats = {
			total: recentStandups.length,
			thisWeek: recentStandups.filter(s => {
				const weekAgo = new Date();
				weekAgo.setDate(weekAgo.getDate() - 7);
				return s.date >= weekAgo;
			}).length
		};

		// Calculate productivity metrics
		const productivity = {
			completionRate: ticketStats.total > 0 ? Math.round((ticketStats.done / ticketStats.total) * 100) : 0,
			averageStoryPoints: ticketStats.total > 0 ? Math.round(ticketStats.totalStoryPoints / ticketStats.total) : 0,
			activeWorkload: ticketStats.inProgress + ticketStats.testing + ticketStats.codeReview
		};

		const stats = {
			projects: {
				total: projects.length,
				active: projects.filter(p => p.status === 'active').length
			},
			tickets: ticketStats,
			standups: standupStats,
			productivity,
			overview: {
				assignedTickets: ticketStats.total,
				completedTickets: ticketStats.done,
				activeProjects: projects.filter(p => p.status === 'active').length,
				totalStoryPoints: ticketStats.totalStoryPoints
			}
		};

		return res.status(200).json({
			success: true,
			message: 'Developer statistics retrieved successfully',
			stats
		});

	} catch (error) {
		console.error('Error getting developer stats:', error);
		return res.status(500).json({
			success: false,
			message: 'Server error while getting developer statistics',
			error: error.message
		});
	}
};

/**
 * Mark ticket as completed - automatically moves to tester
 */
export const completeTicket = async (req, res) => {
	try {
		const developerId = new mongoose.Types.ObjectId(req.user.id);
		const { projectId, moduleId, ticketId } = req.params;
		const { actualHours, completionNotes } = req.body;

		// Find the project
		const project = await Project.findById(projectId);
		if (!project) {
			return res.status(404).json({
				success: false,
				message: 'Project not found'
			});
		}

		// Find the module
		const module = project.modules.id(moduleId);
		if (!module) {
			return res.status(404).json({
				success: false,
				message: 'Module not found'
			});
		}

		// Find the ticket
		const ticket = module.tickets.id(ticketId);
		if (!ticket) {
			return res.status(404).json({
				success: false,
				message: 'Ticket not found'
			});
		}

		// Verify developer is assigned to this ticket
		if (ticket.assignedDeveloper.toString() !== developerId.toString()) {
			return res.status(403).json({
				success: false,
				message: 'You are not assigned to this ticket'
			});
		}

		// Update ticket status
		if (ticket.tester) {
			// If tester is assigned, move to testing
			ticket.status = TICKET_STATUS.TESTING;
		} else {
			// If no tester, mark as done
			ticket.status = TICKET_STATUS.DONE;
		}

		// Update completion details
		ticket.completedAt = new Date();
		if (actualHours) {
			ticket.actualHours = actualHours;
		}

		// Add completion comment
		ticket.comments.push({
			userId: developerId,
			comment: `[Developer] Marked as completed. ${completionNotes || ''}`,
			createdAt: new Date()
		});

		await project.save();

		return res.status(200).json({
			success: true,
			message: ticket.tester ? 'Ticket completed and moved to testing' : 'Ticket completed',
			data: ticket
		});

	} catch (error) {
		console.error('Error completing ticket:', error);
		return res.status(500).json({
			success: false,
			message: 'Server error while completing ticket',
			error: error.message
		});
	}
};


