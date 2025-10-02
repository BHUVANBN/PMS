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
import UserDialog from '../../components/admin/UserDialog';
import { adminAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Snackbar, Alert } from '@mui/material';

export default function AdminDashboard() {
  const { user, authLoading, isAuthenticated } = useAuth();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeProjects: 0,
    systemHealth: 100,
    securityAlerts: 0,
  });
  const [activities, setActivities] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      fetchDashboardData();
      
      // Set up polling for real-time activity updates every 30 seconds
      const activityInterval = setInterval(() => {
        fetchActivities();
      }, 30000);
      
      return () => {
        clearInterval(activityInterval);
      };
    }
  }, [authLoading, isAuthenticated, user]);

  const fetchActivities = async () => {
    try {
      const activitiesResponse = await adminAPI.getActivityLogs();
      
      // Normalize activities
      let realActivities = [];
      if (Array.isArray(activitiesResponse)) {
        realActivities = activitiesResponse;
      } else if (activitiesResponse?.activities) {
        realActivities = activitiesResponse.activities;
      } else if (activitiesResponse?.data?.activities) {
        realActivities = activitiesResponse.data.activities;
      }

      setActivities(realActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [usersResponse, statsResponse, healthResponse, activitiesResponse] = await Promise.all([
        adminAPI.getAllUsers(),
        adminAPI.getSystemStats(),
        adminAPI.getSystemHealth(),
        adminAPI.getActivityLogs(),
      ]);

      console.log('Users Response:', usersResponse);
      console.log('Stats Response:', statsResponse);
      console.log('Health Response:', healthResponse);
      console.log('Activities Response:', activitiesResponse);

      // Normalize users - handle direct array response
      let realUsers = [];
      if (Array.isArray(usersResponse)) {
        realUsers = usersResponse;
      } else if (usersResponse?.users) {
        realUsers = usersResponse.users;
      } else if (usersResponse?.data?.users) {
        realUsers = usersResponse.data.users;
      } else if (usersResponse?.data && Array.isArray(usersResponse.data)) {
        realUsers = usersResponse.data;
      }

      const normalizedUsers = realUsers.map(u => ({
        id: u._id || u.id,
        username: u.username || `${u.firstName || ''} ${u.lastName || ''}`.trim(),
        email: u.email,
        role: u.role,
        status: u.isActive === false ? 'inactive' : 'active',
        lastLogin: u.lastLogin || u.updatedAt || u.createdAt,
        createdAt: u.createdAt,
      }));

      // Normalize stats
      const s = statsResponse || {};
      const h = healthResponse?.health || healthResponse || {};

      // Normalize activities
      let realActivities = [];
      if (Array.isArray(activitiesResponse)) {
        realActivities = activitiesResponse;
      } else if (activitiesResponse?.activities) {
        realActivities = activitiesResponse.activities;
      } else if (activitiesResponse?.data?.activities) {
        realActivities = activitiesResponse.data.activities;
      }

      console.log('Real activities found:', realActivities.length);
      if (realActivities.length > 0) {
        console.log('Sample activity:', realActivities[0]);
      }

      setUsers(normalizedUsers);
      setActivities(realActivities);
      setStats({
        totalUsers: s.totalUsers ?? normalizedUsers.length,
        activeProjects: s.activeProjects ?? 0,
        systemHealth: h.status === 'healthy' ? 100 : 75,
        securityAlerts: s.securityAlerts ?? 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message || 'Failed to load data');
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
        const response = await adminAPI.deleteUser(userId);
        console.log('Delete response:', response);
        
        // Refresh the user list from the database
        await fetchDashboardData();
        
        setSnackbar({
          open: true,
          message: 'User deleted successfully',
          severity: 'success'
        });
      } catch (error) {
        console.error('Error deleting user:', error);
        setSnackbar({
          open: true,
          message: `Failed to delete user: ${error.message}`,
          severity: 'error'
        });
      }
    }
  };

  const handleUpdateUser = async (userData) => {
    try {
      const response = await adminAPI.updateUserRole(userData.id, userData);
      console.log('Update response:', response);
      
      // Refresh the user list from the database
      await fetchDashboardData();
      
      setOpenDialog(false);
      setSelectedUser(null);
      
      setSnackbar({
        open: true,
        message: 'User updated successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating user:', error);
      setSnackbar({
        open: true,
        message: `Failed to update user: ${error.message}`,
        severity: 'error'
      });
    }
  };

  const handleCreateUser = async (userData) => {
    try {
      const response = await adminAPI.createUser(userData);
      console.log('Create response:', response);
      
      // Refresh the user list from the database
      await fetchDashboardData();
      
      setOpenDialog(false);
      setSelectedUser(null);
      
      setSnackbar({
        open: true,
        message: 'User created successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error creating user:', error);
      setSnackbar({
        open: true,
        message: `Failed to create user: ${error.message}`,
        severity: 'error'
      });
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
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (authLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Verifying authentication...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Admin Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        Welcome back, {user?.username || 'Admin'}! Here's your system overview.
      </Typography>

      {error && (
        <Paper sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'error.light' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Users"
            value={stats.totalUsers}
            change={`${stats.totalUsers} registered users`}
            changeType="neutral"
            icon={People}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Active Projects"
            value={stats.activeProjects}
            change={`${stats.activeProjects} in progress`}
            changeType="neutral"
            icon={Business}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="System Health"
            value={`${stats.systemHealth}%`}
            change={stats.systemHealth === 100 ? "All systems operational" : "System degraded"}
            changeType={stats.systemHealth === 100 ? "positive" : "negative"}
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
                onClick={() => {
                  setSelectedUser(null);
                  setOpenDialog(true);
                }}
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
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Typography variant="body2" color="text.secondary">Loading users...</Typography>
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Typography variant="body2" color="text.secondary">No users found.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : users.map((user) => (
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
          <RecentActivity activities={activities} />
        </Grid>
      </Grid>

      {/* User Dialog */}
      <UserDialog
        open={openDialog}
        user={selectedUser}
        onClose={() => {
          setOpenDialog(false);
          setSelectedUser(null);
        }}
        onSave={selectedUser ? handleUpdateUser : handleCreateUser}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
