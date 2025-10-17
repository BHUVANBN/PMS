import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, IconButton, Paper, Stack, Typography } from '@mui/material';
import UserAvatarName from '../../components/shared/UserAvatarName';
import { useNavigate } from 'react-router-dom';
import { Add, Delete, Edit, Refresh } from '@mui/icons-material';
import DataTable from '../../components/shared/DataTable';
import { adminAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const UserList = () => {
  const navigate = useNavigate();
  const { user, authLoading, isAuthenticated } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminAPI.getAllUsers();
      
      console.log('UserList API Response:', res);
      
      // Handle different response formats
      let users = [];
      if (Array.isArray(res)) {
        users = res;
      } else if (res?.users) {
        users = res.users;
      } else if (res?.data?.users) {
        users = res.data.users;
      } else if (res?.data && Array.isArray(res.data)) {
        users = res.data;
      }
      
      const normalized = users.map((u) => ({
        id: u._id || u.id,
        username: u.username || `${u.firstName || ''} ${u.lastName || ''}`.trim(),
        email: u.email,
        role: u.role,
        isActive: u.isActive !== false ? 'Active' : 'Inactive',
        createdAt: u.createdAt,
      }));
      
      console.log('Normalized users:', normalized);
      setRows(normalized);
    } catch (e) {
      console.error('Error fetching users:', e);
      setError(e.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      fetchUsers();
    }
  }, [authLoading, isAuthenticated, user]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await adminAPI.deleteUser(id);
      // Refresh the data from the database
      await fetchUsers();
    } catch (e) {
      alert(e.message || 'Failed to delete');
    }
  };

  const handleEdit = (row) => {
    navigate(`/admin/users/${row.id}/edit`);
  };

  const handleChangeRole = async (row, newRole) => {
    try {
      await adminAPI.updateUserRole(row.id, { role: newRole });
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, role: newRole } : r)));
    } catch (e) {
      alert(e.message || 'Failed to update role');
    }
  };

  const columns = useMemo(() => [
    {
      field: 'username',
      headerName: 'Username',
      sortable: true,
      render: (row) => (
        <UserAvatarName
          name={row.username}
          email={row.email}
          role={row.role}
          size={40}
          fontSize={'1rem'}
          fontWeight={600}
          mr={2}
        />
      ),
    },
    { field: 'email', headerName: 'Email', sortable: true },
    { field: 'role', headerName: 'Role', type: 'chip' },
    { field: 'isActive', headerName: 'Status', type: 'status' },
    { field: 'createdAt', headerName: 'Created', type: 'date' },
  ], []);

  const actions = useMemo(() => [
    {
      label: 'Edit User',
      icon: <Edit fontSize="small" />,
      onClick: (row) => handleEdit(row)
    },
    {
      label: 'Delete User',
      icon: <Delete fontSize="small" />,
      onClick: (row) => handleDelete(row.id)
    }
  ], []);

  if (authLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Verifying authentication...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <div>
          <Typography variant="h4" fontWeight="bold">Users</Typography>
          <Typography variant="body2" color="text.secondary">Manage all system users</Typography>
        </div>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<Refresh />} onClick={fetchUsers}>Refresh</Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/admin/users/new')}>New User</Button>
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
        actions={actions}
        onAction={(action, row) => action.onClick(row)}
        searchable={true}
        sortable={true}
        paginated={true}
        rowsPerPage={10}
        emptyMessage="No users found"
      />
    </Box>
  );
};

export default UserList;
