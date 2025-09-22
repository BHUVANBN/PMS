import React, { useEffect, useMemo, useState } from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';
import { developerAPI, kanbanAPI, subscribeToEvents } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const Column = ({ title, columnKey, tickets = [], onDragStart, onDrop }) => {
  const handleDragOver = (e) => e.preventDefault();
  return (
    <Paper sx={{ p: 2, minWidth: 280 }} elevation={1} onDragOver={handleDragOver} onDrop={(e) => onDrop(e, columnKey)}>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>{title} ({tickets.length})</Typography>
      <Stack spacing={1}>
        {tickets.length === 0 ? (
          <Typography variant="caption" color="text.secondary">No tickets</Typography>
        ) : tickets.map((t, idx) => (
          <Paper
            key={t._id || t.id}
            sx={{ p: 1.5 }}
            variant="outlined"
            draggable
            onDragStart={(e) => onDragStart(e, { ticket: t, from: columnKey, index: idx })}
          >
            <Typography variant="body2" fontWeight={600}>{t.title || t.name || 'Ticket'}</Typography>
            <Typography variant="caption" color="text.secondary">{t.priority} • {t.type}</Typography>
          </Paper>
        ))}
      </Stack>
    </Paper>
  );
};

const DevKanban = () => {
  const { user } = useAuth();
  const [board, setBoard] = useState({ columns: {} });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragCtx, setDragCtx] = useState(null);

  const fetchBoard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await developerAPI.getKanbanBoard();
      const data = res?.board || res?.data?.board || res?.data || res || {};
      setBoard(data);
    } catch (e) {
      setError(e.message || 'Failed to load Kanban');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBoard(); }, []);

  // Subscribe to realtime events (user-scoped)
  useEffect(() => {
    if (!user?._id && !user?.id) return;
    const unsub = subscribeToEvents({ userId: user._id || user.id }, (evt) => {
      // Refresh on relevant ticket/kanban events
      if (evt?.type && (evt.type.startsWith('ticket.') || evt.type.startsWith('kanban.'))) {
        fetchBoard();
      }
    });
    return () => unsub && unsub();
  }, [user?._id, user?.id]);

  const columns = useMemo(() => {
    const cols = board?.columns || {};
    return [
      { key: 'todo', title: 'To Do', tickets: cols.todo?.tickets || cols.todo || [] },
      { key: 'inProgress', title: 'In Progress', tickets: cols.inProgress?.tickets || cols.inProgress || [] },
      { key: 'review', title: 'Review', tickets: cols.review?.tickets || cols.review || [] },
      { key: 'testing', title: 'Testing', tickets: cols.testing?.tickets || cols.testing || [] },
      { key: 'done', title: 'Done', tickets: cols.done?.tickets || cols.done || [] },
    ];
  }, [board]);

  const onDragStart = (e, ctx) => {
    setDragCtx(ctx);
  };

  const onDrop = async (e, toKey) => {
    e.preventDefault();
    if (!dragCtx || toKey === dragCtx.from) return;
    try {
      // We need boardId and column IDs. The developer personal board doesn't expose boardId here,
      // so we fallback to status update via project-scoped endpoint if we have projectId on ticket.
      const ticket = dragCtx.ticket;
      const statusMap = {
        todo: 'open',
        inProgress: 'in_progress',
        review: 'code_review',
        testing: 'testing',
        done: 'done',
      };
      const newStatus = statusMap[toKey];
      if (newStatus && ticket.projectId) {
        await kanbanAPI.updateTicketStatus(ticket.projectId, ticket._id || ticket.id, { status: newStatus });
      }
      setDragCtx(null);
      fetchBoard();
    } catch (err) {
      setError(err.message || 'Failed to move ticket');
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>My Kanban</Typography>
      {loading && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="body2">Loading board...</Typography>
        </Paper>
      )}
      {error && (
        <Paper sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'error.light' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}
      <Stack direction="row" spacing={2} sx={{ overflowX: 'auto' }}>
        {columns.map((c) => (
          <Column key={c.key} title={c.title} columnKey={c.key} tickets={c.tickets} onDragStart={onDragStart} onDrop={onDrop} />
        ))}
      </Stack>
    </Box>
  );
};

export default DevKanban;
