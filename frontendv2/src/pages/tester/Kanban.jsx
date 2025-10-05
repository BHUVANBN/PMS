import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { Box, Stack, Button, Chip, Typography, Alert } from '@mui/material';
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

  const moveTicket = async ({ ticket, toKey }) => {
    const statusMap = { testing: 'testing', done: 'done' };
    const newStatus = statusMap[toKey];
    if (newStatus && ticket.projectId) {
      await kanbanAPI.updateTicketStatus(ticket.projectId, ticket._id || ticket.id, { status: newStatus });
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
    </Box>
  );
};

export default TesterKanban;
