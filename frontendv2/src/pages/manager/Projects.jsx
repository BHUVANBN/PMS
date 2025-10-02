import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Chip, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { Edit, Refresh } from '@mui/icons-material';
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
      console.log('Fetching manager projects...');
      const res = await managerAPI.getAllProjects();
      console.log('Manager projects API response:', res);
      
      const projList = res?.projects || res?.data?.projects || res?.data || res || [];
      console.log('Extracted projects list:', projList);
      console.log('Projects list type:', typeof projList, 'Is array:', Array.isArray(projList));
      
      const projects = Array.isArray(projList) ? projList : [];
      console.log('Final projects array:', projects);
      console.log('Projects count:', projects.length);
      
      const normalized = projects.map((p) => {
        console.log('Processing project:', p);
        return {
          id: p._id || p.id,
          name: p.name,
          status: p.status || 'planning',
          manager: p.projectManager?.firstName
            ? `${p.projectManager.firstName} ${p.projectManager.lastName || ''}`.trim()
            : (p.projectManager?.email || '-'),
          modules: Array.isArray(p.modules) ? p.modules.length : 0,
          startDate: p.startDate,
          endDate: p.endDate,
        };
      });
      console.log('Normalized projects:', normalized);
      
      // If no projects found for this manager, show a helpful message
      if (normalized.length === 0) {
        console.warn('No projects found for this manager');
        setError('No projects assigned to you yet. Create a new project or ask an admin to assign you as project manager.');
      } else {
        setError(null);
      }
      
      setRows(normalized);
    } catch (e) {
      console.error('Error fetching projects:', e);
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
        <Paper sx={{ p: 3, mb: 2, border: '1px solid', borderColor: error.includes('No projects assigned') ? 'info.light' : 'error.light', bgcolor: error.includes('No projects assigned') ? 'info.50' : 'error.50' }}>
          <Typography color={error.includes('No projects assigned') ? 'info.dark' : 'error'} sx={{ mb: error.includes('No projects assigned') ? 2 : 0 }}>
            {error}
          </Typography>
          {error.includes('No projects assigned') && (
            <Stack direction="row" spacing={2}>
              <Button 
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchProjects}
              >
                Refresh
              </Button>
            </Stack>
          )}
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
