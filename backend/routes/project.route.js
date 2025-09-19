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

export default router;
