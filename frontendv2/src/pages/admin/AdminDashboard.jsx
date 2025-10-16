import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Visibility,
  Group
} from '@mui/icons-material';
import StatsCard from '../../components/dashboard/StatsCard';
import RecentActivity from '../../components/dashboard/RecentActivity';
import UserDialog from '../../components/admin/UserDialog';
import ProjectDialog from '../../components/admin/ProjectDialog';
import { adminAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import TwoColumnRight from '../../components/layout/TwoColumnRight';
import { Snackbar, Alert } from '@mui/material';

export default function AdminDashboard() {
  const { user, authLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeProjects: 0,
    systemHealth: 100,
  });
  const [activities, setActivities] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openProjectDialog, setOpenProjectDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
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

      const [usersResponse, projectsResponse, statsResponse, healthResponse, activitiesResponse] = await Promise.all([
        adminAPI.getAllUsers(),
        adminAPI.getAllProjects(),
        adminAPI.getSystemStats(),
        adminAPI.getSystemHealth(),
        adminAPI.getActivityLogs(),
      ]);

      console.log('Users Response:', usersResponse);
      console.log('Projects Response:', projectsResponse);
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

      // Normalize projects
      let realProjects = [];
      if (Array.isArray(projectsResponse)) {
        realProjects = projectsResponse;
      } else if (projectsResponse?.projects) {
        realProjects = projectsResponse.projects;
      } else if (projectsResponse?.data?.projects) {
        realProjects = projectsResponse.data.projects;
      }


      setUsers(normalizedUsers);
      setProjects(realProjects);
      setActivities(realActivities);
      setStats({
        totalUsers: s.totalUsers ?? normalizedUsers.length,
        activeProjects: s.activeProjects ?? realProjects.length,
        systemHealth: h.status === 'healthy' ? 100 : 75,
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

  

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleShowMoreActivity = () => {
    navigate('/admin/activity-logs');
  };

  const handleEditProject = (project) => {
    console.log('Editing project:', project);
    setSelectedProject(project);
    setOpenProjectDialog(true);
  };

  const handleUpdateProject = async (projectData) => {
    try {
      console.log('Sending project data for update:', projectData);
      const response = await adminAPI.updateProject(projectData.id, projectData);
      console.log('Update project response:', response);
      
      // Refresh the project list from the database
      await fetchDashboardData();
      
      setOpenProjectDialog(false);
      setSelectedProject(null);
      
      setSnackbar({
        open: true,
        message: 'Project updated successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating project:', error);
      console.error('Error details:', error.response?.data);
      setSnackbar({
        open: true,
        message: `Failed to update project: ${error.message}`,
        severity: 'error'
      });
    }
  };

  if (authLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Verifying authentication...</Typography>
      </Box>
    );
  }

  const rightRail = (
    <Box sx={{ p: 2 }}>
      <RecentActivity activities={activities} onShowMore={handleShowMoreActivity} />
    </Box>
  );

  return (
    <TwoColumnRight right={rightRail}>
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
        <Grid item xs={12} sm={6} md={6}>
          <StatsCard
            title="Total Users"
            value={stats.totalUsers}
            change={`${stats.totalUsers} registered users`}
            changeType="neutral"
            icon={People}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <StatsCard
            title="Active Projects"
            value={stats.activeProjects}
            change={`${stats.activeProjects} projects`}
            changeType="neutral"
            icon={Business}
            color="success"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* User Management */}
        <Grid item xs={12} lg={6}>
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
            
            <TableContainer sx={{ maxHeight: 400 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <Typography variant="body2" color="text.secondary">Loading users...</Typography>
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <Typography variant="body2" color="text.secondary">No users found.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : users.slice(0, 5).map((user) => (
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
            {users.length > 5 && (
              <Box mt={2} textAlign="center">
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => navigate('/admin/users')}
                >
                  View All Users ({users.length})
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Project Management */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" fontWeight="bold">
                Project Management
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                color="success"
                onClick={() => navigate('/manager/projects/new')}
              >
                Add Project
              </Button>
            </Box>
            
            <TableContainer sx={{ maxHeight: 400 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Project</TableCell>
                    <TableCell>Manager</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <Typography variant="body2" color="text.secondary">Loading projects...</Typography>
                      </TableCell>
                    </TableRow>
                  ) : projects.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <Typography variant="body2" color="text.secondary">No projects found.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : projects.slice(0, 5).map((project) => (
                    <TableRow key={project._id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {project.projectName || project.name || project.title || 'Unnamed Project'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {project.projectManager?.firstName} {project.projectManager?.lastName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={project.status || 'active'}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          size="small"
                          onClick={() => handleEditProject(project)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {projects.length > 5 && (
              <Box mt={2} textAlign="center">
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => navigate('/projects')}
                >
                  View All Projects ({projects.length})
                </Button>
              </Box>
            )}
          </Paper>
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

      {/* Project Dialog */}
      <ProjectDialog
        open={openProjectDialog}
        project={selectedProject}
        onClose={() => {
          setOpenProjectDialog(false);
          setSelectedProject(null);
        }}
        onSave={handleUpdateProject}
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
    </TwoColumnRight>
  );
}
