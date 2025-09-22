// project.route.js - Project Routes
import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  addModule,
  updateModule,
  addTicket,
  updateTicket,
  addTicketComment,
  getUserAssignedTickets,
  deleteProject
} from '../controllers/project.controller.js';
import { getTicket as getTicketById } from '../controllers/ticket.controller.js';

const router = express.Router();

router.use(verifyToken);

// Projects
router.post('/', createProject);
router.get('/', getProjects);
router.get('/:projectId', getProject);
router.put('/:projectId', updateProject);
router.delete('/:projectId', deleteProject);

// Modules
router.post('/:projectId/modules', addModule);
router.put('/:projectId/modules/:moduleId', updateModule);

// Tickets
router.post('/:projectId/modules/:moduleId/tickets', addTicket);
router.put('/:projectId/modules/:moduleId/tickets/:ticketId', updateTicket);
router.post('/:projectId/modules/:moduleId/tickets/:ticketId/comments', addTicketComment);

// User assigned tickets across projects
router.get('/users/:userId/assigned-tickets', getUserAssignedTickets);

// ---------------------------------------------------------------------------
// Singular path aliases (to support /api/project/:projectId/module/:moduleId/ticket/:ticketId)
// These duplicate handlers ensure both plural and singular route styles work.
// Projects (base handled by mount path)
// Modules (alias)
router.post('/:projectId/module', addModule);
router.put('/:projectId/module/:moduleId', updateModule);
// Tickets (alias)
router.post('/:projectId/module/:moduleId/ticket', addTicket);
router.put('/:projectId/module/:moduleId/ticket/:ticketId', updateTicket);
router.post('/:projectId/module/:moduleId/ticket/:ticketId/comment', addTicketComment);
// GET single ticket (alias) – controller ignores moduleId but it’s kept for clear pathing
router.get('/:projectId/module/:moduleId/ticket/:ticketId', getTicketById);
// Add comment (plural alias)
router.post('/:projectId/module/:moduleId/ticket/:ticketId/comments', addTicketComment);

export default router;
