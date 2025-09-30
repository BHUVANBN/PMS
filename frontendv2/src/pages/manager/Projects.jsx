import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Chip, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { Add, Edit, Delete, Refresh } from '@mui/icons-material';
import DataTable from '../../components/shared/DataTable';
import { managerAPI, projectsAPI } from '../../services/api';

const Projects = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await managerAPI.getAllProjects();
      const projList = res?.projects || res?.data?.projects || res?.data || res || [];
      const projects = Array.isArray(projList) ? projList : [];
      const normalized = projects.map((p) => ({
        id: p._id || p.id,
        name: p.name,
        status: p.status || 'planning',
        manager: p.projectManager?.firstName
          ? `${p.projectManager.firstName} ${p.projectManager.lastName || ''}`.trim()
          : (p.projectManager?.email || '-'),
        modules: Array.isArray(p.modules) ? p.modules.length : 0,
        startDate: p.startDate,
        endDate: p.endDate,
      }));
      setRows(normalized);
    } catch (e) {
      setError(e.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  // If navigated with refresh flag from create/edit, refetch and clear flag
  useEffect(() => {
    if (location.state?.refresh) {
      fetchProjects();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  const handleDelete = async (id) => {
    if (!id) return;
    const ok = window.confirm('Are you sure you want to permanently delete this project? This cannot be undone.');
    if (!ok) return;
    try {
      if (managerAPI.deleteProjectHard) {
        await managerAPI.deleteProjectHard(id);
      } else {
        await projectsAPI.deleteProject(id);
      }
      setRows((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      alert(e.message || 'Failed to delete project');
    }
  };

  // Status filter options (map to backend values)
  const STATUS_OPTIONS = [
    { value: 'all', label: 'All' },
    { value: 'planning', label: 'Planning' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'testing', label: 'Testing' },
    { value: 'code_review', label: 'Code Review' },
    { value: 'done', label: 'Done' },
    { value: 'completed', label: 'Completed' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'archived', label: 'Archived' },
  ];

  const [statusFilter, setStatusFilter] = useState('all');

  const filteredRows = useMemo(() => {
    if (statusFilter === 'all') return rows;
    return rows.filter(r => (r.status || '').toLowerCase() === statusFilter);
  }, [rows, statusFilter]);

  const columns = useMemo(() => [
    { field: 'name', headerName: 'Project', sortable: true },
    { field: 'manager', headerName: 'Manager', sortable: true },
    { field: 'modules', headerName: 'Modules' },
    { field: 'status', headerName: 'Status', type: 'status' },
    { field: 'startDate', headerName: 'Start', type: 'date' },
    { field: 'endDate', headerName: 'End', type: 'date' },
    { field: 'actions', headerName: 'Actions' },
  ], [navigate]);

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <div>
          <Typography variant="h4" fontWeight="bold">Projects</Typography>
          <Typography variant="body2" color="text.secondary">Manage your projects</Typography>
        </div>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<Refresh />} onClick={fetchProjects}>Refresh</Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/manager/projects/new')}>New Project</Button>
        </Stack>
      </Stack>

      {/* Status Filter */}
      <Stack direction="row" spacing={2} mb={2} alignItems="center">
        <Typography variant="body2" color="text.secondary">Filter by status:</Typography>
        <TextField
          select
          size="small"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          {STATUS_OPTIONS.map(opt => (
            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
          ))}
        </TextField>
      </Stack>

      {error && (
        <Paper sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'error.light' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}

      <DataTable
        columns={columns}
        data={filteredRows}
        loading={loading}
        searchable
        paginated
        onRefresh={fetchProjects}
        renderCell={(column, row) => {
          if (column.field === 'actions') {
            return (
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Edit />}
                  onClick={() => navigate(`/manager/projects/${row.id}/edit`)}
                >
                  Edit
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<Delete />}
                  onClick={() => handleDelete(row.id)}
                >
                  Delete
                </Button>
              </Stack>
            );
          }
          return undefined; // fall back to default rendering
        }}
      />
    </Box>
  );
};

export default Projects;
