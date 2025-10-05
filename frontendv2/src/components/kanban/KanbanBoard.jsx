import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Stack, Typography, Paper, Button, Select, MenuItem, LinearProgress } from '@mui/material';
import Column from './Column';
import { subscribeToEvents } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const defaultStatusMap = {
  todo: 'open',
  inProgress: 'in_progress',
  review: 'code_review',
  testing: 'testing',
  done: 'done',
};

const columnOrderIndex = {
  todo: 0,
  inProgress: 1,
  review: 2,
  testing: 3,
  done: 4,
};

// KanbanBoard is a reusable board with drag/drop and header toolbar
// Consumers pass in fetchBoard(), moveTicket(), and optional project selector props.
const KanbanBoard = ({
  title = 'Kanban',
  description,
  // Data
  initialProjectId = '',
  loadProjects, // async () => [{_id, name}]
  fetchBoard, // async (projectId?) => boardShape
  moveTicket, // async ({ ticket, fromKey, toKey, projectId, context }) => void
  columnsOrder = ['todo', 'inProgress', 'review', 'testing', 'done'],
  normalizeColumns, // optional (rawColumns) => key->tickets
  sseParams, // { projectId?, userId?, role? }
  showProjectSelector = false,
  // Actions
  onCreateBoard,
  onAddModule,
  onAddTicket,
  onColumnSettings,
  onProjectChange,
  refreshKey,
  renderTicket,
  onTicketUpdated,
}) => {
  const { user } = useAuth();
  const isManager = user?.role === 'manager';

  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState(initialProjectId || '');
  const [board, setBoard] = useState({ columns: {} });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragCtx, setDragCtx] = useState(null);

  const doLoadProjects = useCallback(async () => {
    if (!loadProjects) return;
    const list = await loadProjects();
    if (Array.isArray(list)) {
      setProjects(list);
      if (!projectId && list[0]) {
        const nextId = list[0]._id || list[0].id;
        if (nextId) setProjectId(nextId.toString());
      }
    }
  }, [loadProjects, projectId]);

  const doFetchBoard = useCallback(async (pid) => {
    try {
      setLoading(true);
      setError(null);
      const raw = await fetchBoard?.(pid);
      // Accept shapes used across app
      const data = raw?.data?.board || raw?.data || raw?.board || raw || {};
      let cols = data.columns || raw?.columns || {};
      if (normalizeColumns) {
        cols = normalizeColumns(cols);
      } else {
        // If array of columns
        if (Array.isArray(cols)) {
          const keyMap = {};
          cols.forEach((c) => {
            const key = (c.name || c.title || '').toLowerCase().replace(/\s+/g, '');
            keyMap[key] = c.tickets || [];
          });
          cols = keyMap;
        } else if (cols && typeof cols === 'object') {
          // If object with { key: { tickets: [...] } } shape, flatten to arrays
          const flattened = {};
          Object.keys(cols).forEach((k) => {
            const v = cols[k];
            if (v && Array.isArray(v.tickets)) {
              flattened[k] = v.tickets;
            } else if (Array.isArray(v)) {
              flattened[k] = v;
            } else {
              flattened[k] = [];
            }
          });
          cols = flattened;
        }
      }
      setBoard({ ...data, columns: cols });

      if (Array.isArray(data.availableProjects) && data.availableProjects.length) {
        setProjects(prev => {
          const map = new Map();
          prev.forEach(p => {
            const id = (p._id || p.id || '').toString();
            if (id) map.set(id, p);
          });
          data.availableProjects.forEach(p => {
            const id = (p._id || p.id || '').toString();
            if (!id) return;
            map.set(id, {
              _id: p._id || p.id,
              id: p._id || p.id,
              name: p.name,
            });
          });
          return Array.from(map.values());
        });
      }

      const incomingProjectId = data.projectId || pid || '';
      if (!projectId && incomingProjectId) {
        setProjectId(prev => prev || incomingProjectId.toString());
      }
    } catch (e) {
      setError(e.message || 'Failed to load board');
    } finally {
      setLoading(false);
    }
  }, [fetchBoard, normalizeColumns, projectId]);

  useEffect(() => { doLoadProjects(); }, [doLoadProjects]);
  useEffect(() => { doFetchBoard(projectId || undefined); }, [projectId, doFetchBoard]);
  useEffect(() => { if (refreshKey !== undefined) doFetchBoard(projectId); }, [refreshKey, doFetchBoard, projectId]);

  // notify parent of project change
  useEffect(() => {
    if (onProjectChange) onProjectChange(projectId);
  }, [projectId, onProjectChange]);

  const resolvedSseParams = useMemo(() => {
    if (typeof sseParams === 'function') {
      return sseParams(projectId) || undefined;
    }
    return sseParams;
  }, [sseParams, projectId]);

  // SSE
  const sseKey = JSON.stringify(resolvedSseParams || {});
  useEffect(() => {
    if (!resolvedSseParams) return;
    const unsub = subscribeToEvents(resolvedSseParams, (evt) => {
      if (evt?.type && (evt.type.startsWith('ticket.') || evt.type.startsWith('kanban.') || evt.type.startsWith('bug.'))) {
        doFetchBoard(projectId);
        onTicketUpdated?.(evt);
      }
    });
    return () => unsub && unsub();
  }, [sseKey, resolvedSseParams, projectId, doFetchBoard]);

  const columns = useMemo(() => {
    const cols = board?.columns || {};
    return columnsOrder
      .filter(Boolean)
      .map((key) => ({
        key,
        title: key === 'todo' ? 'To Do'
          : key === 'inProgress' ? 'In Progress'
          : key === 'review' ? 'Review'
          : key === 'testing' ? 'Testing'
          : key === 'done' ? 'Done' : key,
        tickets: cols[key] || [],
      }));
  }, [board, columnsOrder]);

  const onDragStart = (e, ctx) => {
    if (isManager) {
      // Disable drag and drop for managers
      return;
    }
    setDragCtx(ctx);
  };
  const onDrop = async (e, to) => {
    if (isManager) return; // Disable drag and drop for managers

    e.preventDefault();
    if (!dragCtx) return;

    const toKey = to.key || to;
    if (toKey === dragCtx.from) return;

    const fromOrder = columnOrderIndex[dragCtx.from] ?? columnsOrder.indexOf(dragCtx.from);
    const toOrder = columnOrderIndex[toKey] ?? columnsOrder.indexOf(toKey);
    if (fromOrder !== -1 && toOrder !== -1 && toOrder <= fromOrder) {
      setDragCtx(null);
      setError('Tickets can only be moved forward to later columns.');
      return;
    }

    try {
      await moveTicket?.({
        ticket: dragCtx.ticket,
        fromKey: dragCtx.from,
        toKey,
        projectId,
        context: { fromId: dragCtx.fromId, toId: to.id },
        statusMap: defaultStatusMap,
      });
      setDragCtx(null);
      setError(null);
      doFetchBoard(projectId);
    } catch (err) {
      setError(err.message || 'Failed to move ticket');
    }
  };

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 3,
          background: 'linear-gradient(90deg, rgba(239,246,255,1) 0%, rgba(236,253,245,1) 100%)',
          border: '1px solid rgba(148,163,184,0.3)'
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <div>
            <Typography variant="h4" fontWeight={800}>{title}</Typography>
            {description && (
              <Typography variant="body2" color="text.secondary">{description}</Typography>
            )}
          </div>
          <Stack direction="row" spacing={1}>
            {showProjectSelector && (
              <Select
                size="small"
                value={projectId || ''}
                onChange={(e) => setProjectId(e.target.value)}
                displayEmpty
              >
                <MenuItem value="" disabled>Select Project</MenuItem>
                {projects.map((p) => (
                  <MenuItem key={p._id || p.id} value={p._id || p.id}>{p.name}</MenuItem>
                ))}
              </Select>
            )}
            {onCreateBoard && (
              <Button color="primary" variant="contained" onClick={() => onCreateBoard(projectId)} disabled={loading}>Create Board</Button>
            )}
            {onAddModule && (
              <Button variant="outlined" onClick={() => onAddModule(projectId)} disabled={loading}>Add Module</Button>
            )}
            {onAddTicket && (
              <Button color="secondary" variant="contained" onClick={() => onAddTicket(projectId)} disabled={loading}>Add Ticket</Button>
            )}
            {onColumnSettings && (
              <Button variant="outlined" onClick={() => onColumnSettings(projectId)} disabled={loading}>Column Settings</Button>
            )}
            <Button variant="text" onClick={() => doFetchBoard(projectId)} disabled={loading}>Refresh</Button>
          </Stack>
        </Stack>
        {loading && <LinearProgress sx={{ mt: 2 }} />}
      </Paper>

      {error && (
        <Paper sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'error.light', borderRadius: 2 }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}

      <Stack
        direction="row"
        spacing={2.5}
        sx={{
          overflowX: 'auto',
          pb: 1,
        }}
      >
        {columns.map((c) => (
          <Column
            key={c.key}
            title={c.title}
            columnKey={c.key}
            columnId={c.id}
            tickets={c.tickets}
            onDragStart={onDragStart}
            onDrop={onDrop}
            renderTicket={renderTicket}
          />
        ))}
      </Stack>
    </Box>
  );
};

export default KanbanBoard;
