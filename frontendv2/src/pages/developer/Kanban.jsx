import React, { useCallback, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
  DialogActions,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import BugReportIcon from '@mui/icons-material/BugReport';
import KanbanBoard from '../../components/kanban/KanbanBoard';
import TicketCard from '../../components/kanban/TicketCard';
import { developerAPI, kanbanAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const DevKanban = () => {
  const { user } = useAuth();

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [moveDescription, setMoveDescription] = useState('');
  const [ticketToMove, setTicketToMove] = useState(null);
  const [moveError, setMoveError] = useState('');
  const [moveSubmitting, setMoveSubmitting] = useState(false);
  const [boardRefreshKey, setBoardRefreshKey] = useState(0);

  const loadProjects = async () => {
    const res = await developerAPI.getProjects();
    const list = res?.projects || res?.data?.projects || res?.data || [];
    return list.map((p) => ({
      _id: p._id || p.id,
      id: p._id || p.id,
      name: p.name,
    }));
  };

  const fetchBoard = async (projectId) => {
    return developerAPI.getKanbanBoard(projectId);
  };

  const handleMoveCancel = () => {
    setMoveDialogOpen(false);
    setMoveDescription('');
    setTicketToMove(null);
    setMoveError('');
    setMoveSubmitting(false);
  };

  const handleMoveConfirm = async () => {
    if (!ticketToMove) return;
    const description = moveDescription.trim();
    if (!description) {
      setMoveError('Please describe the work done or reason for this move.');
      return;
    }

    try {
      setMoveSubmitting(true);
      setMoveError('');
      const { projectId, ticketId, newStatus } = ticketToMove;
      await kanbanAPI.updateTicketStatus(projectId, ticketId, {
        status: newStatus,
        description,
      });
      setMoveDialogOpen(false);
      setTicketToMove(null);
      setMoveDescription('');
      setBoardRefreshKey((prev) => prev + 1);
    } catch (error) {
      setMoveError(error?.message || 'Failed to update ticket status.');
    } finally {
      setMoveSubmitting(false);
    }
  };

  const moveTicket = async ({ ticket, toKey, statusMap }) => {
    const newStatus = statusMap[toKey];
    if (newStatus && ticket.projectId) {
      setTicketToMove({ ticket, newStatus, projectId: ticket.projectId, ticketId: ticket._id || ticket.id });
      setMoveDescription('');
      setMoveDialogOpen(true);
    }
  };

  const severityColor = useCallback((severity) => {
    switch ((severity || '').toLowerCase()) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
      default:
        return 'success';
    }
  }, []);

  const statusColor = useCallback((status) => {
    switch ((status || '').toLowerCase()) {
      case 'new':
      case 'open':
        return 'warning';
      case 'assigned':
      case 'in_progress':
      case 'in-progress':
        return 'info';
      case 'resolved':
        return 'success';
      case 'closed':
        return 'default';
      case 'reopened':
        return 'error';
      default:
        return 'default';
    }
  }, []);

  const openDialog = useCallback((ticket) => {
    setSelectedTicket(ticket);
    setDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setSelectedTicket(null);
  }, []);

  const renderTicket = useCallback(({ key, ticket, columnKey, onDragStart }) => {
    const bugs = ticket?.bugs || [];
    const openBugCount = ticket?.openBugCount || 0;

    return (
      <Box key={key} sx={{ p: 1, borderRadius: 2, bgcolor: 'background.paper', boxShadow: 0.5 }}>
        <TicketCard
          ticket={ticket}
          draggable={columnKey !== 'testing' || openBugCount === 0}
          onDragStart={onDragStart}
        />

        <Stack mt={1} spacing={1}>
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                size="small"
                icon={<BugReportIcon fontSize="small" />}
                label={`${bugs.length} bug${bugs.length === 1 ? '' : 's'}`}
                variant={bugs.length ? 'filled' : 'outlined'}
                color={bugs.length ? 'error' : 'default'}
              />
              {bugs.slice(0, 3).map((bug) => (
                <Chip
                  key={bug._id || bug.id}
                  size="small"
                  label={bug.bugNumber || bug.title}
                  color={severityColor(bug.severity)}
                  variant="outlined"
                />
              ))}
              {bugs.length > 3 && (
                <Chip size="small" label={`+${bugs.length - 3} more`} variant="outlined" />
              )}
            </Stack>

            {bugs.length > 0 && (
              <Button size="small" variant="contained" onClick={() => openDialog(ticket)}>
                View Bugs
              </Button>
            )}
          </Stack>
        </Stack>
      </Box>
    );
  }, [openDialog, severityColor]);

  const bugsForDialog = useMemo(() => selectedTicket?.bugs || [], [selectedTicket]);

  return (
    <>
      <KanbanBoard
        title="My Kanban"
        description="Drag tickets across columns to update status."
        loadProjects={loadProjects}
        fetchBoard={fetchBoard}
        moveTicket={moveTicket}
        columnsOrder={['todo', 'inProgress', 'review', 'testing']}
        showProjectSelector
        renderTicket={renderTicket}
        refreshKey={boardRefreshKey}
        sseParams={(projectId) => {
          if (!(user?._id || user?.id)) return undefined;
          const params = { userId: user._id || user.id, role: 'developer' };
          if (projectId) return { ...params, projectId };
          return params;
        }}
      />

      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ pr: 6 }}>
          Bug Details
          <IconButton
            aria-label="close"
            onClick={closeDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ maxHeight: 560 }}>
          {selectedTicket && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Ticket
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {selectedTicket.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  #{selectedTicket.ticketNumber || (selectedTicket._id || selectedTicket.id)}
                </Typography>
              </Box>

              <Divider />

              {bugsForDialog.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No bugs attached to this ticket.
                </Typography>
              )}

              {bugsForDialog.map((bug) => (
                <Box key={bug._id || bug.id} sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}>
                    <Typography variant="h6" fontWeight={600}>
                      {bug.bugNumber || bug.title || 'Untitled Bug'}
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {bug.severity && (
                        <Chip label={`Severity: ${bug.severity}`} color={severityColor(bug.severity)} size="small" />
                      )}
                      {bug.status && (
                        <Chip label={`Status: ${bug.status}`} color={statusColor(bug.status)} size="small" />
                      )}
                      {bug.bugType && (
                        <Chip label={bug.bugType} variant="outlined" size="small" />
                      )}
                    </Stack>
                  </Stack>

                  {bug.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {bug.description}
                    </Typography>
                  )}

                  <Stack spacing={0.5} sx={{ mt: 2 }}>
                    {bug.expectedBehavior && (
                      <Typography variant="caption" color="text.secondary">
                        Expected: {bug.expectedBehavior}
                      </Typography>
                    )}
                    {bug.actualBehavior && (
                      <Typography variant="caption" color="text.secondary">
                        Actual: {bug.actualBehavior}
                      </Typography>
                    )}
                  </Stack>

                  {Array.isArray(bug.stepsToReproduce) && bug.stepsToReproduce.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="subtitle2">Steps to Reproduce</Typography>
                      <Stack spacing={0.5}>
                        {bug.stepsToReproduce
                          .sort((a, b) => (a.order || 0) - (b.order || 0))
                          .map((step, idx) => (
                            <Typography key={step.order || idx} variant="body2" color="text.secondary">
                              {`${step.order || idx + 1}. ${step.step}`}
                            </Typography>
                          ))}
                      </Stack>
                    </Box>
                  )}

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Reported By: {bug.reportedBy?.firstName ? `${bug.reportedBy.firstName} ${bug.reportedBy.lastName || ''}`.trim() : bug.reportedBy?.email || 'Unknown'}
                    </Typography>
                    {bug.assignedTo && (
                      <Typography variant="caption" color="text.secondary">
                        Assigned To: {bug.assignedTo?.firstName ? `${bug.assignedTo.firstName} ${bug.assignedTo.lastName || ''}`.trim() : bug.assignedTo?.email || 'Unassigned'}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary">
                      Created: {bug.createdAt ? new Date(bug.createdAt).toLocaleString() : 'N/A'}
                    </Typography>
                  </Stack>

                  {Array.isArray(bug.watchers) && bug.watchers.length > 0 && (
                    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
                      {bug.watchers.map((watcher) => (
                        <Chip
                          key={watcher._id || watcher.id}
                          label={`${watcher.firstName || ''} ${watcher.lastName || ''}`.trim() || watcher.email || 'Watcher'}
                          variant="outlined"
                          size="small"
                        />
                      ))}
                    </Stack>
                  )}
                </Box>
              ))}
            </Stack>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={moveDialogOpen} onClose={handleMoveCancel} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pr: 6 }}>
          Ticket Status Update
          <IconButton
            aria-label="close"
            onClick={handleMoveCancel}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {ticketToMove?.ticket?.title && (
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              {ticketToMove.ticket.title}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please describe what was completed and why this ticket is moving to the next stage. This note will be stored in the activity log.
          </Typography>
          <TextField
            label="Move description"
            value={moveDescription}
            onChange={(e) => setMoveDescription(e.target.value)}
            placeholder="Explain the work done, validation performed, or reason for the move"
            multiline
            minRows={3}
            fullWidth
            autoFocus
            disabled={moveSubmitting}
          />
          {moveError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {moveError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleMoveCancel} disabled={moveSubmitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleMoveConfirm}
            disabled={moveSubmitting}
          >
            {moveSubmitting ? 'Saving…' : 'Confirm Move'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DevKanban;
