import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Paper, Select, MenuItem, Stack, Typography } from '@mui/material';
import { Refresh } from '@mui/icons-material';
import DataTable from '../../components/shared/DataTable';
import { managerAPI } from '../../services/api';

const ROLE_OPTIONS = ['developer', 'tester'];

const TeamManagement = () => {
  const [overview, setOverview] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await managerAPI.getTeamManagement();
      const data = res?.overview || res?.data?.overview || res?.data || res || {};
      setOverview(data);
      // Default select first project if not chosen
      if (!selectedProjectId) {
        const first = (data.projects || [])[0];
        if (first && (first._id || first.id)) setSelectedProjectId(first._id || first.id);
      }
    } catch (e) {
      setError(e.message || 'Failed to load team overview');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectTeam = async (projectId) => {
    if (!projectId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await managerAPI.getProjectTeam(projectId);
      const list = res?.team || res?.data?.team || res?.data || res || [];
      const normalized = (Array.isArray(list) ? list : []).map((m) => ({
        id: m._id || m.id,
        name: m.name || `${m.firstName || ''} ${m.lastName || ''}`.trim(),
        email: m.email,
        role: m.role,
        modules: (m.modules || []).length,
        isActive: m.isActive !== false,
      }));
      setMembers(normalized);
    } catch (e) {
      setError(e.message || 'Failed to load project team');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOverview(); }, []);
  useEffect(() => { if (selectedProjectId) fetchProjectTeam(selectedProjectId); }, [selectedProjectId]);

  const handleAssignRole = async (row, newRole) => {
    try {
      await managerAPI.assignTeamRole(selectedProjectId, row.id, { role: newRole });
      setMembers((prev) => prev.map((m) => (m.id === row.id ? { ...m, role: newRole } : m)));
    } catch (e) {
      alert(e.message || 'Failed to assign role');
    }
  };

  const columns = useMemo(() => [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Role', type: 'chip' },
    { key: 'modules', label: 'Modules' },
    { key: 'isActive', label: 'Status', type: 'status', valueMap: { true: 'Active', false: 'Inactive' } },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <Stack direction="row" spacing={1}>
          {ROLE_OPTIONS.filter((r) => r !== row.role).map((r) => (
            <Button key={r} size="small" variant="outlined" onClick={() => handleAssignRole(row, r)}>
              {`Make ${r}`}
            </Button>
          ))}
        </Stack>
      ),
    },
  ], [selectedProjectId]);

  const projectOptions = (overview?.projects || []).map((p) => ({
    id: p._id || p.id,
    name: p.name,
  }));

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <div>
          <Typography variant="h4" fontWeight="bold">Team Management</Typography>
          <Typography variant="body2" color="text.secondary">Assign roles and manage team members per project</Typography>
        </div>
        <Stack direction="row" spacing={1}>
          <Select
            size="small"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            displayEmpty
          >
            <MenuItem value="" disabled>Select Project</MenuItem>
            {projectOptions.map((p) => (
              <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
            ))}
          </Select>
          <Button variant="outlined" startIcon={<Refresh />} onClick={() => fetchProjectTeam(selectedProjectId)} disabled={!selectedProjectId}>Refresh</Button>
        </Stack>
      </Stack>

      {error && (
        <Paper sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'error.light' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}

      <DataTable
        columns={columns}
        data={members}
        loading={loading}
        enableSearch
        searchableKeys={["name","email","role"]}
        initialPageSize={10}
        emptyMessage={selectedProjectId ? 'No team members found' : 'Select a project to view team'}
      />
    </Box>
  );
};

export default TeamManagement;
