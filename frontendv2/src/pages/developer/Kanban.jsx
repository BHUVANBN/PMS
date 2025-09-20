import React, { useEffect, useMemo, useState } from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';
import { developerAPI } from '../../services/api';

const Column = ({ title, tickets = [] }) => (
  <Paper sx={{ p: 2, minWidth: 280 }} elevation={1}>
    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>{title} ({tickets.length})</Typography>
    <Stack spacing={1}>
      {tickets.length === 0 ? (
        <Typography variant="caption" color="text.secondary">No tickets</Typography>
      ) : tickets.map((t) => (
        <Paper key={t._id || t.id} sx={{ p: 1.5 }} variant="outlined">
          <Typography variant="body2" fontWeight={600}>{t.title || t.name || 'Ticket'}</Typography>
          <Typography variant="caption" color="text.secondary">{t.priority} • {t.type}</Typography>
        </Paper>
      ))}
    </Stack>
  </Paper>
);

const DevKanban = () => {
  const [board, setBoard] = useState({ columns: {} });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const columns = useMemo(() => {
    const cols = board?.columns || {};
    return [
      { key: 'todo', title: 'To Do', tickets: cols.todo?.tickets || cols.todo || [] },
      { key: 'inProgress', title: 'In Progress', tickets: cols.inProgress?.tickets || cols.inProgress || [] },
      { key: 'review', title: 'Review', tickets: cols.review?.tickets || cols.review || [] },
      { key: 'done', title: 'Done', tickets: cols.done?.tickets || cols.done || [] },
    ];
  }, [board]);

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>My Kanban</Typography>
      {error && (
        <Paper sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'error.light' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}
      <Stack direction="row" spacing={2} sx={{ overflowX: 'auto' }}>
        {columns.map((c) => (
          <Column key={c.key} title={c.title} tickets={c.tickets} />
        ))}
      </Stack>
    </Box>
  );
};

export default DevKanban;
