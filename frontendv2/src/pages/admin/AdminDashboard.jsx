import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  People,
  Business,
  Assessment,
  Security,
  Add,
  Edit,
  Delete,
  Visibility
} from '@mui/icons-material';
import StatsCard from '../../components/dashboard/StatsCard';
import RecentActivity from '../../components/dashboard/RecentActivity';
import { adminAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeProjects: 0,
    systemHealth: 100,
    securityAlerts: 0
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  const mockUsers = [
    {
      id: 1,
      username: 'john_doe',
      email: 'john@example.com',
      role: 'developer',
      status: 'active',
      lastLogin: '2024-01-20T10:30:00Z',
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      username: 'jane_smith',
      email: 'jane@example.com',
      role: 'manager',
      status: 'active',
      lastLogin: '2024-01-20T09:15:00Z',
      createdAt: '2024-01-02T00:00:00Z'
    },
    {
      id: 3,
      username: 'mike_johnson',
      email: 'mike@example.com',
      role: 'tester',
      status: 'inactive',
      lastLogin: '2024-01-18T14:20:00Z',
      createdAt: '2024-01-03T00:00:00Z'
    },
    {
      id: 4,
      username: 'sarah_wilson',
      email: 'sarah@example.com',
      role: 'hr',
      status: 'active',
      lastLogin: '2024-01-20T11:45:00Z',
      createdAt: '2024-01-04T00:00:00Z'
    }
  ];

  const mockStats = {
    totalUsers: 24,
    activeProjects: 8,
    systemHealth: 98,
    securityAlerts: 2
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Try to fetch real data, fallback to mock data
      try {
        const [usersResponse, statsResponse] = await Promise.all([
          adminAPI.getAllUsers(),
          adminAPI.getSystemStats()
        ]);
        setUsers(usersResponse.users || mockUsers);
        setStats(statsResponse.stats || mockStats);
      } catch (error) {
        console.log('Using mock data:', error.message);
        setUsers(mockUsers);
        setStats(mockStats);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setUsers(mockUsers);
      setStats(mockStats);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminAPI.deleteUser(userId);
        setUsers(users.filter(user => user.id !== userId));
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      await adminAPI.updateUserRole(userId, { role: newRole });
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'manager': return 'primary';
      case 'developer': return 'success';
      case 'tester': return 'info';
      case 'hr': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'success' : 'default';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Admin Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        Welcome back, {user?.username || 'Admin'}! Here's your system overview.
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Users"
            value={stats.totalUsers}
            change="+12% from last month"
            changeType="positive"
            icon={People}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Active Projects"
            value={stats.activeProjects}
            change="+2 new this week"
            changeType="positive"
            icon={Business}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="System Health"
            value={`${stats.systemHealth}%`}
            change="All systems operational"
            changeType="neutral"
            icon={Assessment}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Security Alerts"
            value={stats.securityAlerts}
            change={stats.securityAlerts > 0 ? "Requires attention" : "All clear"}
            changeType={stats.securityAlerts > 0 ? "negative" : "positive"}
            icon={Security}
            color={stats.securityAlerts > 0 ? "error" : "success"}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* User Management */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" fontWeight="bold">
                User Management
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setOpenDialog(true)}
              >
                Add User
              </Button>
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Last Login</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {user.username}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.role}
                          size="small"
                          color={getRoleColor(user.role)}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.status}
                          size="small"
                          color={getStatusColor(user.status)}
                          variant="filled"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(user.lastLogin)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={0.5}>
                          <IconButton
                            size="small"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} lg={4}>
          <RecentActivity />
        </Grid>
      </Grid>

      {/* User Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedUser ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Username"
              fullWidth
              defaultValue={selectedUser?.username || ''}
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              defaultValue={selectedUser?.email || ''}
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                defaultValue={selectedUser?.role || 'developer'}
                label="Role"
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
                <MenuItem value="developer">Developer</MenuItem>
                <MenuItem value="tester">Tester</MenuItem>
                <MenuItem value="hr">HR</MenuItem>
                <MenuItem value="sales">Sales</MenuItem>
                <MenuItem value="marketing">Marketing</MenuItem>
              </Select>
            </FormControl>
            {!selectedUser && (
              <TextField
                label="Password"
                type="password"
                fullWidth
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setOpenDialog(false)}>
            {selectedUser ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

export default AdminDashboard;
