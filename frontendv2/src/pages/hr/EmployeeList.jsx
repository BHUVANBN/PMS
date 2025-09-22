import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Chip, IconButton, Paper, Stack, Typography } from '@mui/material';
import { Add, Edit, ToggleOn } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { hrAPI } from '../../services/api';
import DataTable from '../../components/shared/DataTable';

const EmployeeList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await hrAPI.getAllEmployees();
      const employees = res?.employees || res?.data?.employees || res?.data || [];
      const normalized = employees.map((e) => ({
        id: e._id || e.id,
        name: e.name || `${e.firstName || ''} ${e.lastName || ''}`.trim(),
        email: e.email,
        role: e.role,
        department: e.department || e.dept || '-'
        ,
        isActive: e.isActive !== false,
        createdAt: e.createdAt,
      }));
      setRows(normalized);
    } catch (err) {
      setError(err.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Refetch when navigated back from create/edit with refresh flag
  useEffect(() => {
    if (location.state?.refresh) {
      fetchEmployees();
      // remove the flag so it doesn't refire on further renders
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  const handleToggleStatus = async (id) => {
    try {
      await hrAPI.toggleEmployeeStatus(id);
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r)));
    } catch (err) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  const columns = useMemo(() => [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Role', type: 'chip' },
    { key: 'department', label: 'Department' },
    { key: 'isActive', label: 'Status', type: 'status', valueMap: { true: 'Active', false: 'Inactive' } },
    { key: 'createdAt', label: 'Joined', type: 'date' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <Stack direction="row" spacing={1}>
          <IconButton size="small" onClick={() => navigate(`/hr/employees/${row.id}/edit`)}>
            <Edit fontSize="small" />
          </IconButton>
          <IconButton size="small" color={row.isActive ? 'warning' : 'success'} onClick={() => handleToggleStatus(row.id)}>
            <ToggleOn fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ], []);

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <div>
          <Typography variant="h4" fontWeight="bold">Employees</Typography>
          <Typography variant="body2" color="text.secondary">Manage all employees in the organization</Typography>
        </div>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={fetchEmployees}>Refresh</Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/hr/employees/new')}>
            New Employee
          </Button>
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
        initialPageSize={10}
        enableSearch
        searchableKeys={['name', 'email', 'role', 'department']}
        emptyMessage="No employees found"
      />
    </Box>
  );
};

export default EmployeeList;
