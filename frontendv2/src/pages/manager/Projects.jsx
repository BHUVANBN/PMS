import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Chip, IconButton, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Add, Edit, Delete, Refresh } from '@mui/icons-material';
import DataTable from '../../components/shared/DataTable';
import { managerAPI } from '../../services/api';

const Projects = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await managerAPI.getAllProjects();
      const projects = res?.projects || res?.data?.projects || res?.data || [];
      const normalized = projects.map((p) => ({
        id: p._id || p.id,
        name: p.name,
        status: p.status || 'active',
        manager: p.manager?.username || p.manager?.name || '-',
        modules: (p.modules || []).length,
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

  const handleDelete = async (id) => {
    if (!id) return;
    const ok = window.confirm('Are you sure you want to archive/delete this project?');
    if (!ok) return;
    try {
      await managerAPI.deleteProject(id);
      setRows((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      alert(e.message || 'Failed to delete project');
    }
  };

  const columns = useMemo(() => [
    { key: 'name', label: 'Project', sortable: true },
    { key: 'manager', label: 'Manager', sortable: true },
    { key: 'modules', label: 'Modules' },
    { key: 'status', label: 'Status', type: 'chip' },
    { key: 'startDate', label: 'Start', type: 'date' },
    { key: 'endDate', label: 'End', type: 'date' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <Stack direction="row" spacing={1}>
          <IconButton size="small" onClick={() => navigate(`/manager/projects/${row.id}/edit`)}>
            <Edit fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => handleDelete(row.id)}>
            <Delete fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ], []);

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
        searchableKeys={["name","manager","status"]}
        initialPageSize={10}
        emptyMessage="No projects found"
      />
    </Box>
  );
};

export default Projects;
