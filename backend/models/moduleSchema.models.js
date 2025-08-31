// // moduleSchema.models.js - Project Modules Schema
// import mongoose from 'mongoose';
// import { TICKET_TYPES, TICKET_PRIORITIES, TICKET_STATUS } from './projectSchema.models.js';

// // Module status options
// const MODULE_STATUS = {
//   PLANNING: 'planning',     // Module is being planned
//   ACTIVE: 'active',         // Module is currently in development
//   TESTING: 'testing',       // Module is under testing
//   COMPLETED: 'completed',   // Module is finished
//   ON_HOLD: 'on_hold'        // Module is paused
// };

// // Ticket Schema - embedded within Module for better performance
// const ticketSchema = new mongoose.Schema({
  
//   // REQUIRED: Unique identifier for the ticket (e.g., MOD-001, MOD-002)
//   ticketNumber: {
//     type: String,
//     required: true          // Must have unique reference number for tracking
//   },
  
//   // REQUIRED: Brief summary of what needs to be done
//   title: {
//     type: String,
//     required: true          // Clear title is mandatory for understanding work
//   },
  
//   // OPTIONAL: Detailed explanation of the work required
//   description: String,      // Can be optional for simple tasks
  
//   // REQUIRED: What type of work this ticket represents
//   type: {
//     type: String,
//     enum: Object.values(TICKET_TYPES),
//     required: true          // Must specify if it's a task or bug for proper routing
//   },
  
//   // OPTIONAL: Business priority level - could be simplified to just High/Medium/Low
//   priority: {
//     type: String,
//     enum: Object.values(TICKET_PRIORITIES),
//     default: TICKET_PRIORITIES.MEDIUM  // Default to medium priority
//   },
  
//   // REQUIRED: Current workflow status
//   status: {
//     type: String,
//     enum: Object.values(TICKET_STATUS),
//     default: TICKET_STATUS.OPEN        // New tickets start as open
//   },
  
//   // REQUIRED: Who is responsible for completing this ticket
//   assignedDeveloper: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     default: null           // Can be unassigned initially, assigned later by PM
//   },
  
//   // REQUIRED: Who will test this ticket once development is complete
//   tester: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true          // Every ticket needs designated tester for your workflow
//   },
  
//   // OPTIONAL: Which sprint this ticket belongs to (only if using sprints)
//   sprintId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Sprint',
//     default: null           // Can exist in backlog without sprint assignment
//   },
  
//   // OPTIONAL: Agile story points for effort estimation - may not be needed for simple projects
//   storyPoints: {
//     type: Number,
//     min: 0,                 // Cannot be negative
//     default: 0              // Default to 0 if not using story points
//   },
  
//   // OPTIONAL: Time estimation in hours - useful but not critical
//   estimatedHours: {
//     type: Number,
//     min: 0,                 // Cannot be negative
//     default: 0              // Default to 0 if not doing time estimation
//   },
  
//   // OPTIONAL: Actual time spent on the ticket - useful for reporting but not essential
//   actualHours: {
//     type: Number,
//     min: 0,                 // Cannot be negative
//     default: 0              // Starts at 0, updated as work progresses
//   },
  
//   // OPTIONAL: Link to bug tracker entry if this ticket is a bug
//   bugTrackerId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'BugTracker',
//     default: null           // Only populated for bug-type tickets
//   },
  
//   // REQUIRED: Discussion thread for this ticket
//   comments: [{
//     // Auto-generated unique identifier for each comment
//     commentId: {
//       type: mongoose.Schema.Types.ObjectId,
//       default: () => new mongoose.Types.ObjectId()  // Auto-generate for referencing
//     },
//     // Who made this comment
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       required: true        // Must know who commented for accountability
//     },
//     // The comment content
//     comment: {
//       type: String,
//       required: true        // Empty comments serve no purpose
//     },
//     // When the comment was made
//     createdAt: {
//       type: Date,
//       default: Date.now     // Automatically timestamp all comments
//     }
//   }],
  
//   // OPTIONAL: File attachments (URLs to stored files) - useful for screenshots, docs
//   attachments: [String]     // Array of file URLs/paths from cloud storage
// }, {
//   timestamps: true          // Auto-manage createdAt and updatedAt for ticket lifecycle
// });

// const moduleSchema = new mongoose.Schema({
//   // REQUIRED: Module identification
//   name: {
//     type: String,
//     required: true,
//     trim: true
//   },
  
//   // OPTIONAL: Detailed module description
//   description: String,
  
//   // REQUIRED: Links to parent project
//   projectId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Project',
//     required: true
//   },
  
//   // REQUIRED: Current module status
//   status: {
//     type: String,
//     enum: Object.values(MODULE_STATUS),
//     default: MODULE_STATUS.PLANNING
//   },
  
//   // OPTIONAL: Module order/priority within project
//   order: {
//     type: Number,
//     default: 0
//   },
  
//   // OPTIONAL: Module start and end dates
//   startDate: Date,
//   endDate: Date,
  
//   // REQUIRED: Person responsible for this module
//   moduleLead: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
  
//   // OPTIONAL: Team members assigned to this module
//   teamMembers: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   }],
  
//   // OPTIONAL: Module completion percentage
//   completionPercentage: {
//     type: Number,
//     min: 0,
//     max: 100,
//     default: 0
//   },
  
//   // REQUIRED: All tickets for this module (embedded for better query performance)
//   tickets: [ticketSchema]
// }, {
//   timestamps: true
// });

// // Indexes for efficient queries
// moduleSchema.index({ projectId: 1 });           // Find modules by project
// moduleSchema.index({ moduleLead: 1 });          // Find modules led by specific user
// moduleSchema.index({ status: 1 });              // Query modules by status
// moduleSchema.index({ 'teamMembers': 1 });       // Find modules where user is team member
// moduleSchema.index({ 'tickets.assignedDeveloper': 1 }); // Find tickets assigned to specific developer
// moduleSchema.index({ 'tickets.status': 1 });    // Query tickets by their current status
// moduleSchema.index({ 'tickets.sprintId': 1 });  // Find tickets in specific sprint
// moduleSchema.index({ 'tickets.ticketNumber': 1 }); // Quick lookup by ticket number
// moduleSchema.index({ 'tickets.type': 1 });      // Filter tickets by type (task vs bug)

// export {
//   moduleSchema,
//   MODULE_STATUS
// };
