import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Chip, Grid, IconButton, MenuItem, Paper, Select, Stack, TextField, Typography } from '@mui/material';
import { Add, Refresh } from '@mui/icons-material';
import DataTable from '../../components/shared/DataTable';
import { testerAPI } from '../../services/api';

const STATUS_OPTIONS = ['open', 'in-progress', 'resolved', 'closed'];
const SEVERITY_OPTIONS = ['low', 'medium', 'high', 'critical'];
const TYPE_OPTIONS = ['bug', 'feature', 'task'];

const Bugs = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [newBug, setNewBug] = useState({ title: '', description: '', severity: 'medium', type: 'bug' });

  const fetchBugs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await testerAPI.getAllBugs();
      const bugs = res?.bugs || res?.data?.bugs || res?.data || res || [];
      const normalized = (Array.isArray(bugs) ? bugs : []).map((b) => ({
        id: b._id || b.id,
        title: b.title || b.name || 'Untitled',
        status: b.status,
        severity: b.severity,
        type: b.type,
        reporter: b.reportedBy?.username || b.reporter?.username || '-',
        assignee: b.assignedTo?.username || '-',
        createdAt: b.createdAt,
      }));
      setRows(normalized);
    } catch (e) {
      setError(e.message || 'Failed to load bugs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBugs(); }, []);

  const updateStatus = async (row, newStatus) => {
    try {
      await testerAPI.updateBugStatus(row.id, newStatus);
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status: newStatus } : r)));
    } catch (e) {
      alert(e.message || 'Failed to update status');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      await testerAPI.createBug(newBug);
      setNewBug({ title: '', description: '', severity: 'medium', type: 'bug' });
      await fetchBugs();
    } catch (e) {
      alert(e.message || 'Failed to create bug');
    } finally {
      setCreating(false);
    }
  };

  const columns = useMemo(() => [
    { key: 'title', label: 'Title', sortable: true },
    { key: 'reporter', label: 'Reporter', sortable: true },
    { key: 'assignee', label: 'Assignee' },
    { key: 'severity', label: 'Severity', type: 'chip' },
    { key: 'type', label: 'Type', type: 'chip' },
    { key: 'status', label: 'Status', type: 'status', valueMap: { 'open': 'Open', 'in-progress': 'In Progress', 'resolved': 'Resolved', 'closed': 'Closed' } },
    { key: 'createdAt', label: 'Created', type: 'date' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <Stack direction="row" spacing={1}>
          <Select size="small" value={row.status} onChange={(e) => updateStatus(row, e.target.value)}>
            {STATUS_OPTIONS.map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </Select>
        </Stack>
      ),
    },
  ], []);

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <div>
          <Typography variant="h4" fontWeight="bold">Bug Tracker</Typography>
          <Typography variant="body2" color="text.secondary">Report and track bugs; update status as you verify fixes</Typography>
        </div>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<Refresh />} onClick={fetchBugs}>Refresh</Button>
        </Stack>
      </Stack>

      {/* Create Bug */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <form onSubmit={handleCreate}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <TextField label="Title" size="small" fullWidth required value={newBug.title} onChange={(e) => setNewBug({ ...newBug, title: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="Description" size="small" fullWidth value={newBug.description} onChange={(e) => setNewBug({ ...newBug, description: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={2}>
              <Select size="small" fullWidth value={newBug.severity} onChange={(e) => setNewBug({ ...newBug, severity: e.target.value })}>
                {SEVERITY_OPTIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Select size="small" fullWidth value={newBug.type} onChange={(e) => setNewBug({ ...newBug, type: e.target.value })}>
                {TYPE_OPTIONS.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </Select>
            </Grid>
            <Grid item xs={12} sm={1}>
              <Button type="submit" variant="contained" startIcon={<Add />} disabled={creating} fullWidth>Create</Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

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
        searchableKeys={["title","reporter","assignee","severity","status","type"]}
        initialPageSize={10}
        emptyMessage="No bugs found"
      />
    </Box>
  );
};

export default Bugs;
