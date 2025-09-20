import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Chip, IconButton, Paper, Stack, Typography } from '@mui/material';
import { Refresh, Done, PlayArrow } from '@mui/icons-material';
import DataTable from '../../components/shared/DataTable';
import { developerAPI } from '../../services/api';

const Tasks = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await developerAPI.getMyTickets();
      const tickets = res?.tickets || res?.data?.tickets || res?.data || res || [];
      const normalized = (Array.isArray(tickets) ? tickets : []).map((t) => ({
        id: t._id || t.id,
        title: t.title || t.name || 'Untitled',
        status: t.status,
        priority: t.priority,
        type: t.type,
        project: t.project?.name || '-',
        module: t.module?.name || '-',
        assignee: t.assignedDeveloper?.username || t.assignedTo?.username || '-',
        createdAt: t.createdAt,
      }));
      setRows(normalized);
    } catch (e) {
      setError(e.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const updateStatus = async (row, newStatus) => {
    try {
      await developerAPI.updateTicketStatus(row.id, newStatus);
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status: newStatus } : r)));
    } catch (e) {
      alert(e.message || 'Failed to update status');
    }
  };

  const columns = useMemo(() => [
    { key: 'title', label: 'Title', sortable: true },
    { key: 'project', label: 'Project', sortable: true },
    { key: 'module', label: 'Module' },
    { key: 'type', label: 'Type', type: 'chip' },
    { key: 'priority', label: 'Priority', type: 'chip' },
    { key: 'status', label: 'Status', type: 'status', valueMap: { 'open': 'Open', 'in-progress': 'In Progress', 'done': 'Done' } },
    { key: 'createdAt', label: 'Created', type: 'date' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <Stack direction="row" spacing={1}>
          {row.status !== 'in-progress' && (
            <Button size="small" variant="outlined" startIcon={<PlayArrow />} onClick={() => updateStatus(row, 'in-progress')}>
              Start
            </Button>
          )}
          {row.status !== 'done' && (
            <Button size="small" variant="contained" color="success" startIcon={<Done />} onClick={() => updateStatus(row, 'done')}>
              Done
            </Button>
          )}
        </Stack>
      ),
    },
  ], []);

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <div>
          <Typography variant="h4" fontWeight="bold">My Tasks</Typography>
          <Typography variant="body2" color="text.secondary">Manage and update your assigned tickets</Typography>
        </div>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<Refresh />} onClick={fetchTasks}>Refresh</Button>
        </Stack>
      </Stack>

      {error && (
        <Paper sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'error.light' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}

      <DataTable
        columns={columns}
        data={rows}
        loading={loading}
        enableSearch
        searchableKeys={["title","project","module","priority","status"]}
        initialPageSize={10}
        emptyMessage="No tasks found"
      />
    </Box>
  );
};

export default Tasks;
