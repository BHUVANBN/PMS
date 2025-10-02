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
      console.log('HR API Response:', res);
      
      // Handle different response structures
      let employees = [];
      if (Array.isArray(res)) {
        employees = res;
      } else if (res?.employees) {
        employees = res.employees;
      } else if (res?.data?.employees) {
        employees = res.data.employees;
      } else if (res?.data && Array.isArray(res.data)) {
        employees = res.data;
      }
      
      console.log('Extracted employees:', employees);
      
      const normalized = employees.map((e) => ({
        id: e._id || e.id,
        name: e.name || `${e.firstName || ''} ${e.lastName || ''}`.trim() || 'N/A',
        email: e.email || 'N/A',
        role: e.role || 'N/A',
        department: e.department || e.dept || '-',
        isActive: e.isActive !== false ? 'Active' : 'Inactive',
        createdAt: e.createdAt,
      }));
      
      console.log('Normalized employees:', normalized);
      setRows(normalized);
    } catch (err) {
      console.error('Error fetching employees:', err);
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
      console.log('Refresh triggered from navigation state');
      // Small delay to ensure backend has processed the creation
      setTimeout(() => {
        fetchEmployees();
      }, 100);
      // remove the flag so it doesn't refire on further renders
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  const handleToggleStatus = async (id) => {
    try {
      await hrAPI.toggleEmployeeStatus(id);
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, isActive: r.isActive === 'Active' ? 'Inactive' : 'Active' } : r)));
    } catch (err) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  const columns = useMemo(() => [
    { field: 'name', headerName: 'Name', sortable: true },
    { field: 'email', headerName: 'Email', sortable: true },
    { field: 'role', headerName: 'Role', type: 'chip' },
    { field: 'department', headerName: 'Department' },
    { field: 'isActive', headerName: 'Status', type: 'status', valueMap: { true: 'Active', false: 'Inactive' } },
    { field: 'createdAt', headerName: 'Joined', type: 'date' },
    {
      field: 'actions',
      headerName: 'Actions',
      render: (row) => (
        <Stack direction="row" spacing={1}>
          <IconButton size="small" onClick={() => navigate(`/hr/employees/${row.id}/edit`)}>
            <Edit fontSize="small" />
          </IconButton>
          <IconButton size="small" color={row.isActive === 'Active' ? 'warning' : 'success'} onClick={() => handleToggleStatus(row.id)}>
            <ToggleOn fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ], [navigate]);

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

      {rows.length === 0 && !loading ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No employees found
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Create your first employee to get started
          </Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/hr/employees/new')}>
            Create Employee
          </Button>
        </Paper>
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          loading={loading}
          initialPageSize={10}
          enableSearch
          searchableKeys={['name', 'email', 'role', 'department']}
          emptyMessage="No employees found"
        />
      )}
    </Box>
  );
};

export default EmployeeList;
