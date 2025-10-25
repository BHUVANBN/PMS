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
  Avatar,
  Stack,
  CircularProgress
} from '@mui/material';
import {
  People,
  Business,
  Add,
  Edit,
  Delete,
  Visibility,
  Refresh
} from '@mui/icons-material';
import StatsCard from '../../components/dashboard/StatsCard';
import RecentActivity from '../../components/dashboard/RecentActivity';
import UserDialog from '../../components/admin/UserDialog';
import ProjectDialog from '../../components/admin/ProjectDialog';
import { adminAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
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
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        role: u.role,
        status: u.isActive === false ? 'inactive' : 'active',
        lastLogin: u.lastLogin || u.updatedAt || u.createdAt,
        createdAt: u.createdAt,
      }));

      const s = statsResponse || {};
      const h = healthResponse?.health || healthResponse || {};

      let realActivities = [];
      if (Array.isArray(activitiesResponse)) {
        realActivities = activitiesResponse;
      } else if (activitiesResponse?.activities) {
        realActivities = activitiesResponse.activities;
      } else if (activitiesResponse?.data?.activities) {
        realActivities = activitiesResponse.data.activities;
      }

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
        await adminAPI.deleteUser(userId);
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
      await adminAPI.updateUserRole(userData.id, userData);
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
      await adminAPI.createUser(userData);
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
    const colors = {
      admin: '#f44336',
      manager: '#2196f3',
      developer: '#03a9f4',
      tester: '#ff9800',
      hr: '#4caf50',
      sales: '#9c27b0',
      marketing: '#e91e63',
      intern: '#757575'
    };
    return colors[role] || '#9e9e9e';
  };

  const getRoleChipColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'manager': return 'primary';
      case 'developer': return 'info';
      case 'tester': return 'warning';
      case 'hr': return 'success';
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
    setSelectedProject(project);
    setOpenProjectDialog(true);
  };

  const handleUpdateProject = async (projectData) => {
    try {
      await adminAPI.updateProject(projectData.id, projectData);
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
      setSnackbar({
        open: true,
        message: `Failed to update project: ${error.message}`,
        severity: 'error'
      });
    }
  };

  const getManagerInitials = (manager) => {
    if (!manager) return '?';
    const firstName = manager.firstName || '';
    const lastName = manager.lastName || '';
    
    if (firstName && lastName) {
      return `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`;
    } else if (firstName) {
      return firstName.charAt(0).toUpperCase();
    } else if (lastName) {
      return lastName.charAt(0).toUpperCase();
    }
    return '?';
  };

  if (authLoading || loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }} className="container-page full-bleed-safe">
      {/* Header */}
      <Box mb={4} className="page-header">
        <Typography 
          variant="h1" 
          className="page-title"
          sx={{ 
            fontSize: { xs: '1.75rem', md: '2rem' },
            fontWeight: 700,
            mb: 1.5
          }}
        >
          Admin Dashboard
        </Typography>
        <Typography 
          variant="body1" 
          className="text-secondary"
          sx={{ 
            fontSize: '1rem',
            fontWeight: 400,
            lineHeight: 1.6,
            color: 'text.secondary'
          }}
        >
          Welcome back, {user?.username || 'Admin'}! Here's your system overview.
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchDashboardData}
            disabled={loading}
          >
            Refresh
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Main Layout */}
      <Box sx={{ display: { lg: 'flex' }, gap: { lg: 3 }, alignItems: 'flex-start' }}>
        {/* Main Content Column */}
        <Box sx={{ flex: 1 }}>
          {/* Stats Cards */}
          <Box className="card-grid-2 section" sx={{ mb: 4 }}>
            <StatsCard
              title="Total Users"
              value={stats.totalUsers}
              change={`${stats.totalUsers} registered users`}
              changeType="neutral"
              icon={People}
              color="primary"
            />
            <StatsCard
              title="Active Projects"
              value={stats.activeProjects}
              change={`${stats.activeProjects} projects`}
              changeType="neutral"
              icon={Business}
              color="success"
            />
          </Box>

          {/* User Management */}
          <Box className="card section" sx={{ mb: 3 }}>
            <Box className="card-header">
              <Typography variant="h3" className="card-header-title">
                User Management
              </Typography>
              <Box className="card-header-actions">
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
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
                          No users found.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : users.slice(0, 5).map((userItem) => (
                    <TableRow key={userItem.id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar
                            sx={{
                              width: 40,
                              height: 40,
                              mr: 2,
                              bgcolor: getRoleColor(userItem.role),
                              color: '#fff',
                              fontSize: '1rem',
                              fontWeight: 600
                            }}
                          >
                            {(() => {
                              const nameSource = (userItem.firstName || userItem.username || userItem.email || '').toString().trim();
                              return nameSource ? nameSource.charAt(0).toUpperCase() : '?';
                            })()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {userItem.username}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {userItem.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={userItem.role}
                          size="small"
                          sx={{
                            bgcolor: `${getRoleColor(userItem.role)}15`,
                            color: getRoleColor(userItem.role),
                            textTransform: 'capitalize',
                            fontWeight: 600,
                            border: `1px solid ${getRoleColor(userItem.role)}30`
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={userItem.status}
                          size="small"
                          color={getStatusColor(userItem.status)}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={0.5}>
                          <IconButton
                            size="small"
                            onClick={() => handleEditUser(userItem)}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteUser(userItem.id)}
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
          </Box>

          {/* Project Management */}
          <Box className="card section">
            <Box className="card-header">
              <Typography variant="h3" className="card-header-title">
                Project Management
              </Typography>
              <Box className="card-header-actions">
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  color="success"
                  onClick={() => navigate('/manager/projects/new')}
                >
                  Add Project
                </Button>
              </Box>
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
                  {projects.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
                          No projects found.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : projects.slice(0, 5).map((project) => (
                    <TableRow key={project._id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {project.projectName || project.name || project.title || 'Unnamed Project'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          {project.projectManager && (
                            <>
                              <Avatar
                                sx={{
                                  width: 32,
                                  height: 32,
                                  mr: 1.5,
                                  bgcolor: getRoleColor('manager'),
                                  fontSize: '0.875rem',
                                  fontWeight: 600,
                                  color: '#fff'
                                }}
                              >
                                {getManagerInitials(project.projectManager)}
                              </Avatar>
                              <Typography variant="body2">
                                {project.projectManager?.firstName} {project.projectManager?.lastName}
                              </Typography>
                            </>
                          )}
                        </Box>
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
          </Box>
        </Box>

        {/* Right Sidebar */}
        <Box sx={{ 
          width: { xs: '100%', lg: 360 },
          flexShrink: 0,
          mt: { xs: 3, lg: 0 }
        }}>
          <Box className="card" sx={{ 
            position: { lg: 'sticky' },
            top: { lg: 24 }
          }}>
            <RecentActivity activities={activities} onShowMore={handleShowMoreActivity} />
          </Box>
        </Box>
      </Box>

      {/* Dialogs */}
      <UserDialog
        open={openDialog}
        user={selectedUser}
        onClose={() => {
          setOpenDialog(false);
          setSelectedUser(null);
        }}
        onSave={selectedUser ? handleUpdateUser : handleCreateUser}
      />

      <ProjectDialog
        open={openProjectDialog}
        project={selectedProject}
        onClose={() => {
          setOpenProjectDialog(false);
          setSelectedProject(null);
        }}
        onSave={handleUpdateProject}
      />

      {/* Snackbar */}
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