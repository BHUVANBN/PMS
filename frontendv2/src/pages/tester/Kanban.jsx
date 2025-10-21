import React, { useCallback, useState, useEffect } from 'react';
import { Box, Stack, Button, Chip, Typography, Alert, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, TextField } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import BugReportIcon from '@mui/icons-material/BugReport';
import KanbanBoard from '../../components/kanban/KanbanBoard';
import TicketCard from '../../components/kanban/TicketCard';
import { kanbanAPI, testerAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import CreateBugDialog from './components/CreateBugDialog';

const TesterKanban = () => {
  const { user } = useAuth();
  const [activeProjectId, setActiveProjectId] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resolvingTicketId, setResolvingTicketId] = useState(null);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [clearedTickets, setClearedTickets] = useState(() => new Set());
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [moveDescription, setMoveDescription] = useState('');
  const [moveError, setMoveError] = useState('');
  const [moveSubmitting, setMoveSubmitting] = useState(false);
  const [ticketToMove, setTicketToMove] = useState(null);

  useEffect(() => {
    setClearedTickets(new Set());
  }, [refreshKey]);

  const normalizeTicketId = useCallback((ticket) => {
    if (!ticket) return '';
    const raw = ticket._id ?? ticket.id ?? '';
    return typeof raw === 'string' ? raw : raw?.toString?.() ?? String(raw ?? '');
  }, []);

  const loadProjects = async () => {
    const res = await testerAPI.getProjects();
    const list = res?.projects || res?.data?.projects || res?.data || [];
    return list.map((p) => ({
      _id: p._id || p.id,
      id: p._id || p.id,
      name: p.name,
    }));
  };

  const fetchBoard = async (projectId) => {
    return kanbanAPI.getTesterPersonalBoard(projectId);
  };

  const handleMoveCancel = () => {
    setMoveDialogOpen(false);
    setMoveDescription('');
    setMoveError('');
    setMoveSubmitting(false);
    setTicketToMove(null);
  };

  const handleMoveConfirm = async () => {
    if (!ticketToMove) return;
    const description = moveDescription.trim();
    if (!description) {
      setMoveError('Please describe the testing work performed or the reason for moving this ticket.');
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
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      setMoveError(err?.message || 'Failed to update ticket status.');
    } finally {
      setMoveSubmitting(false);
    }
  };

  const moveTicket = async ({ ticket, toKey }) => {
    const statusMap = { testing: 'testing', done: 'done' };
    const newStatus = statusMap[toKey];
    if (newStatus && ticket.projectId) {
      setTicketToMove({
        ticket,
        projectId: ticket.projectId,
        ticketId: ticket._id || ticket.id,
        newStatus,
      });
      setMoveDescription('');
      setMoveError('');
      setMoveDialogOpen(true);
    }
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedTicket(null);
  };

  const openDialog = useCallback((ticket) => {
    setSelectedTicket(ticket);
    setDialogOpen(true);
  }, []);

  const handleCreateBug = useCallback(async (payload) => {
    if (!selectedTicket) return;

    try {
      setSubmitting(true);
      setError(null);
      const projectId = selectedTicket.projectId;
      const moduleId = selectedTicket.moduleId;
      const ticketId = selectedTicket._id || selectedTicket.id;

      await testerAPI.createBugFromTicket(projectId, moduleId, ticketId, payload);

      closeDialog();
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error('Error creating bug from ticket:', err);
      setError(err.message || 'Failed to create bug tracker entry');
    } finally {
      setSubmitting(false);
    }
  }, [selectedTicket]);

  const handleResolveBugs = useCallback(async (ticket) => {
    if (!ticket) return;

    const normalizedId = normalizeTicketId(ticket);
    const projectId = ticket.projectId;
    const moduleId = ticket.moduleId;
    const ticketId = ticket._id || ticket.id;

    setResolvingTicketId(normalizedId);
    setError(null);

    try {
      await testerAPI.resolveTicketBugs(projectId, moduleId, ticketId);

      setClearedTickets((prev) => {
        const next = new Set(prev);
        if (normalizedId) {
          next.add(normalizedId);
        }
        return next;
      });

      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error('Error resolving ticket bugs:', err);
      setError(err.message || 'Failed to resolve linked bugs');
    } finally {
      setResolvingTicketId(null);
    }
  }, [normalizeTicketId]);

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

  const renderTicket = useCallback(({ key, ticket, columnKey, onDragStart }) => {
    const ticketId = normalizeTicketId(ticket);
    const bugs = ticket?.bugs || [];
    const isCleared = ticketId && clearedTickets.has(ticketId);
    const visibleBugs = isCleared ? [] : bugs;
    const bugCount = visibleBugs.length;

    return (
      <Box key={key} sx={{ p: 1, borderRadius: 2, bgcolor: 'background.paper', boxShadow: 0.5 }}>
        <TicketCard
          ticket={ticket}
          draggable={columnKey !== 'done'}
          onDragStart={onDragStart}
        />

        <Stack mt={1} spacing={1}>
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                size="small"
                icon={<BugReportIcon fontSize="small" />}
                label={`${bugCount} bug${bugCount === 1 ? '' : 's'}`}
                variant={bugCount ? 'filled' : 'outlined'}
                color={bugCount ? 'error' : 'default'}
              />
              {bugCount > 0 && (
                <Stack direction="row" spacing={0.5} flexWrap="wrap">
                  {visibleBugs.slice(0, 3).map((bug) => (
                    <Chip
                      key={bug._id}
                      size="small"
                      label={bug.bugNumber || bug.title}
                      color={severityColor(bug.severity)}
                      variant="outlined"
                    />
                  ))}
                  {bugCount > 3 && (
                    <Chip size="small" label={`+${bugCount - 3} more`} variant="outlined" />
                  )}
                </Stack>
              )}
            </Stack>

            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="outlined"
                disabled={!bugs.length || resolvingTicketId === ticketId}
                onClick={() => handleResolveBugs(ticket)}
              >
                {isCleared ? 'Cleared' : resolvingTicketId === ticketId ? 'Resolving…' : 'Resolve Bugs'}
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={() => openDialog(ticket)}
              >
                Log Bug
              </Button>
            </Stack>
          </Stack>

          <Typography variant="caption" color="text.secondary">
            Module: {ticket?.moduleName || 'N/A'}
          </Typography>
        </Stack>
      </Box>
    );
  }, [openDialog, severityColor, clearedTickets, resolvingTicketId, handleResolveBugs, normalizeTicketId]);

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <KanbanBoard
        title="Testing Kanban"
        description="Move tickets through testing workflow."
        loadProjects={loadProjects}
        fetchBoard={fetchBoard}
        moveTicket={moveTicket}
        columnsOrder={['testing', 'done']}
        showProjectSelector
        onProjectChange={setActiveProjectId}
        refreshKey={refreshKey}
        renderTicket={renderTicket}
        sseParams={(projectId) => {
          if (!(user?._id || user?.id)) return undefined;
          const params = { userId: user._id || user.id, role: 'tester' };
          const pid = projectId || activeProjectId;
          if (pid) return { ...params, projectId: pid };
          return params;
        }}
      />

      <CreateBugDialog
        open={dialogOpen}
        onClose={closeDialog}
        onSubmit={handleCreateBug}
        ticket={selectedTicket}
        submitting={submitting}
      />

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
            Provide testing notes explaining what you verified or why the ticket is advancing. This will appear in the ticket activity log.
          </Typography>
          <TextField
            label="Testing notes"
            value={moveDescription}
            onChange={(e) => setMoveDescription(e.target.value)}
            placeholder="Describe the validation steps, results, or reason for moving"
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
    </Box>
  );
};

export default TesterKanban;
