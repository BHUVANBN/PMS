import React, { useEffect, useMemo, useState } from 'react';
import { Box, Paper, Stack, Typography, Select, MenuItem, Button, Chip } from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { managerAPI } from '../../services/api';

const Column = ({ title, tickets = [] }) => (
  <Paper sx={{ p: 2, minWidth: 280, background: 'var(--mui-palette-background-paper)' }} elevation={1}>
    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>{title} <Chip size="small" label={tickets.length} sx={{ ml: 1 }} /></Typography>
    <Stack spacing={1}>
      {tickets.length === 0 ? (
        <Typography variant="caption" color="text.secondary">No tickets</Typography>
      ) : tickets.map((t) => (
        <Paper key={t._id || t.id} sx={{ p: 1.5 }} variant="outlined">
          <Typography variant="body2" fontWeight={600}>{t.title || t.name || 'Ticket'}</Typography>
          <Typography variant="caption" color="text.secondary">#{(t.code || t.key || t._id || '').toString().slice(-6)}</Typography>
          <Stack direction="row" spacing={1} mt={0.5}>
            {t.priority && <Chip size="small" label={t.priority} />}
            {t.type && <Chip size="small" label={t.type} />}
          </Stack>
        </Paper>
      ))}
    </Stack>
  </Paper>
);

const Kanban = () => {
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState('');
  const [board, setBoard] = useState({ columns: {} });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProjects = async () => {
    const res = await managerAPI.getAllProjects();
    const list = res?.projects || res?.data?.projects || res?.data || [];
    setProjects(list);
    if (!projectId && list[0]) setProjectId(list[0]._id || list[0].id);
  };

  const normalizeColumns = (columns = {}) => {
    // Backend may send columns with names like 'To Do', 'In Progress', 'Testing', 'Code Review', 'Done'
    // Normalize to keys: todo, inProgress, review, done
    const get = (keys) => {
      for (const k of keys) {
        if (Array.isArray(columns[k])) return columns[k];
        if (columns[k]?.tickets) return columns[k].tickets;
      }
      return [];
    };
    return {
      todo: get(['todo', 'To Do', 'toDo', 'open']),
      inProgress: get(['inProgress', 'In Progress', 'in_progress']),
      review: get(['review', 'Code Review', 'Testing', 'testing', 'code_review']),
      done: get(['done', 'Done', 'closed'])
    };
  };

  const fetchBoard = async (pid) => {
    if (!pid) return;
    try {
      setLoading(true);
      setError(null);
      const res = await managerAPI.getProjectKanban(pid);
      const raw = res?.data || res?.kanban || res || {};
      const normalized = { columns: normalizeColumns(raw.columns || raw) };
      setBoard(normalized);
    } catch (e) {
      setError(e.message || 'Failed to load Kanban board');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);
  useEffect(() => { if (projectId) fetchBoard(projectId); }, [projectId]);

  const columns = useMemo(() => {
    const cols = board?.columns || {};
    return [
      { key: 'todo', title: 'To Do', tickets: cols.todo || [] },
      { key: 'inProgress', title: 'In Progress', tickets: cols.inProgress || [] },
      { key: 'review', title: 'Review', tickets: cols.review || [] },
      { key: 'done', title: 'Done', tickets: cols.done || [] },
    ];
  }, [board]);

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <div>
          <Typography variant="h4" fontWeight="bold">Project Kanban</Typography>
          <Typography variant="body2" color="text.secondary">Select a project to view its Kanban board</Typography>
        </div>
        <Stack direction="row" spacing={1}>
          <Select size="small" value={projectId} onChange={(e) => setProjectId(e.target.value)} displayEmpty>
            <MenuItem value="" disabled>Select Project</MenuItem>
            {projects.map((p) => (
              <MenuItem key={p._id || p.id} value={p._id || p.id}>{p.name}</MenuItem>
            ))}
          </Select>
          <Button variant="outlined" startIcon={<Refresh />} onClick={() => fetchBoard(projectId)} disabled={!projectId || loading}>Refresh</Button>
        </Stack>
      </Stack>

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

export default Kanban;
