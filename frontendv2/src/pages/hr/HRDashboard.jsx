import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Paper,
  Avatar,
  Chip,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Alert,
  CircularProgress,
  useTheme,
  Divider,
  Stack
} from '@mui/material';

import {
  People,
  PersonAdd,
  Work,
  EventNote,
  Refresh,
  MoreVert,
  CheckCircle,
  Pending,
  Cancel,
  Add,
  Visibility,
  TrendingUp,
  Business
} from '@mui/icons-material';
import { hrAPI } from '../../services/api';
import StatsCard from '../../components/dashboard/StatsCard';
import MyUpcomingEvents from '../../components/dashboard/MyUpcomingEvents';
import QuickActions from '../../components/dashboard/QuickActions';
import { useAuth } from '../../contexts/AuthContext';

const HRDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const { user } = useAuth();

  const quickActions = [
    { title: 'Employee List', path: '/hr/employees', color: 'primary' },
    { title: 'Add Employee', path: '/hr/employees/new', color: 'success' },
    { title: 'Onboarding Submissions', path: '/hr/onboarding-public', color: 'info' },
    { title: 'Standups', path: '/hr/standups', color: 'warning' },
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch HR statistics and recent employees
      const [statsResponse, employeesResponse] = await Promise.all([
        hrAPI.getHRStats(),
        hrAPI.getAllEmployees()
      ]);
      
      setStats(statsResponse?.stats || statsResponse?.data?.stats || statsResponse);
      const emps = employeesResponse?.employees || employeesResponse?.data?.employees || employeesResponse?.data || employeesResponse || [];
      // Show only recent 5 employees (sort by createdAt desc if present)
      const normalized = emps.map(e => ({
        _id: e._id || e.id,
        firstName: e.firstName,
        lastName: e.lastName,
        email: e.email,
        role: e.role,
        isActive: e.isActive !== false,
        createdAt: e.createdAt,
      })).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 5);
      setEmployees(normalized);
    } catch (err) {
      setError(err.message || 'Failed to fetch HR data');
      console.error('HR Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    fetchData();
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: theme.palette.error.main,
      manager: theme.palette.primary.main,
      developer: theme.palette.info.main,
      tester: theme.palette.warning.main,
      hr: theme.palette.success.main,
      sales: theme.palette.secondary.main,
      marketing: theme.palette.purple?.main || theme.palette.primary.main,
      intern: theme.palette.grey[600]
    };
    return colors[role] || theme.palette.grey[500];
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        action={
          <Button color="inherit" size="small" onClick={handleRefresh}>
            Retry
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography 
          variant="h3" 
          sx={{ 
            fontWeight: 800, 
            color: 'text.primary',
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
            letterSpacing: '-0.02em',
            mb: 1.5
          }}
        >
          HR Dashboard
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            color: 'text.secondary',
            fontWeight: 400,
            fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
            lineHeight: 1.6,
            letterSpacing: '0.01em'
          }}
        >
          Manage employees, track performance, and oversee HR operations
        </Typography>
        <Typography
          variant="body1"
          sx={{ mt: 1.5, color: 'text.secondary' }}
        >
          Welcome{user?.fullName ? `, ${user.fullName}` : ''}.
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/hr/employees/new')}
            sx={{ bgcolor: 'primary.main' }}
          >
            Add Employee
          </Button>
        </Stack>
      </Box>

      {/* Quick Actions */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12}>
          <QuickActions actions={quickActions} />
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Main Layout with Sidebar */}
      <Box sx={{ display: { lg: 'flex' }, gap: { lg: 3 }, alignItems: 'flex-start' }}>
        {/* Main content column */}
        <Box sx={{ flex: 1 }}>
          {/* Statistics Cards */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} lg={3}>
              <StatsCard
                title="Total Employees"
                value={stats?.employees?.total || 0}
                change={`${stats?.employees?.active || 0} active employees`}
                changeType="neutral"
                icon={People}
                color="primary"
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <StatsCard
                title="Recent Hires"
                value={stats?.employees?.recentHires || 0}
                change="New employees this month"
                changeType="positive"
                icon={PersonAdd}
                color="success"
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <StatsCard
                title="Leave Requests"
                value={stats?.leaves?.pending || 0}
                change={`${stats?.leaves?.total || 0} total requests`}
                changeType="neutral"
                icon={EventNote}
                color="warning"
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <StatsCard
                title="Departments"
                value={stats?.overview?.departmentCount || 0}
                change="Active departments"
                changeType="neutral"
                icon={Work}
                color="info"
              />
            </Grid>
          </Grid>

          <Paper elevation={0} sx={{ 
            p: 3,
            mb: 3,
            background: 'rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
          }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Recent Employees
              </Typography>
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => navigate('/hr/employees')}
              >
                View All Employees
              </Button>
            </Box>
            
            <TableContainer sx={{ maxHeight: 400 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Joined</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Box display="flex" justifyContent="center" py={2}>
                          <CircularProgress size={24} />
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : employees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Box textAlign="center" py={3}>
                          <Typography variant="body2" color="text.secondary">
                            No employees found
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : employees.map((employee) => (
                    <TableRow key={employee._id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar
                            sx={{
                              width: 40,
                              height: 40,
                              mr: 2,
                              bgcolor: getRoleColor(employee.role),
                              color: '#fff',
                              fontSize: '1rem',
                              fontWeight: 700
                            }}
                          >
                            {(employee.firstName || employee.lastName || '')?.charAt(0)?.toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {employee.firstName} {employee.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {employee.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={employee.role}
                          size="small"
                          sx={{
                            bgcolor: `${getRoleColor(employee.role)}15`,
                            color: getRoleColor(employee.role),
                            textTransform: 'capitalize',
                            fontWeight: 600,
                            border: `1px solid ${getRoleColor(employee.role)}30`
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={employee.isActive ? <CheckCircle /> : <Cancel />}
                          label={employee.isActive ? 'Active' : 'Inactive'}
                          size="small"
                          color={employee.isActive ? 'success' : 'error'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(employee.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          size="small"
                          onClick={() => navigate(`/hr/employees/${employee._id}/edit`)}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Leave Requests Overview */}
          <Paper elevation={0} sx={{ 
            p: 3,
            background: 'rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
          }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Leave Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Leave request system coming soon
              </Typography>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  p: 2, 
                  textAlign: 'center', 
                  background: 'rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  borderRadius: '12px',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
                }}>
                  <Avatar sx={{ bgcolor: 'warning.main', mx: 'auto', mb: 1, width: 48, height: 48, color: '#fff' }}>
                    <Pending />
                  </Avatar>
                  <Typography variant="h4" fontWeight={700} color="warning.main">
                    {stats?.leaves?.pending || 0}
                  </Typography>
                  <Typography variant="body2" color="warning.dark" fontWeight={500}>
                    Pending Requests
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  p: 2, 
                  textAlign: 'center', 
                  background: 'rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  borderRadius: '12px',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
                }}>
                  <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 1, width: 48, height: 48, color: '#fff' }}>
                    <CheckCircle />
                  </Avatar>
                  <Typography variant="h4" fontWeight={700} color="success.main">
                    {stats?.leaves?.approved || 0}
                  </Typography>
                  <Typography variant="body2" color="success.dark" fontWeight={500}>
                    Approved
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  p: 2, 
                  textAlign: 'center', 
                  background: 'rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  borderRadius: '12px',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
                }}>
                  <Avatar sx={{ bgcolor: 'error.main', mx: 'auto', mb: 1, width: 48, height: 48, color: '#fff' }}>
                    <Cancel />
                  </Avatar>
                  <Typography variant="h4" fontWeight={700} color="error.main">
                    {stats?.leaves?.rejected || 0}
                  </Typography>
                  <Typography variant="body2" color="error.dark" fontWeight={500}>
                    Rejected
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  p: 2, 
                  textAlign: 'center', 
                  background: 'rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  borderRadius: '12px',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
                }}>
                  <Avatar sx={{ bgcolor: 'info.main', mx: 'auto', mb: 1, width: 48, height: 48, color: '#fff' }}>
                    <EventNote />
                  </Avatar>
                  <Typography variant="h4" fontWeight={700} color="info.main">
                    {stats?.leaves?.total || 0}
                  </Typography>
                  <Typography variant="body2" color="info.dark" fontWeight={500}>
                    Total Requests
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Box>

        {/* Right sidebar column */}
        <Box sx={{ 
          width: { xs: '100%', lg: 360 },
          flexShrink: 0,
          mt: { xs: 3, lg: 0 }
        }}>
          {/* My Upcoming Events */}
          <Box sx={{ mb: 3 }}>
            <MyUpcomingEvents title="My Upcoming Events" days={14} />
          </Box>

          {/* Employee Distribution */}
          <Paper elevation={0} sx={{ 
            p: 3, 
            height: 'fit-content',
            background: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
            position: { lg: 'sticky' },
            top: { lg: 24 }
          }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Employee Distribution
            </Typography>
            <Box>
              {stats?.roles && Object.entries(stats.roles).length > 0 ? (
                Object.entries(stats.roles).map(([role, count]) => (
                  <Box key={role} mb={3}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2" sx={{ textTransform: 'capitalize', fontWeight: 500 }}>
                        {role}
                      </Typography>
                      <Typography variant="body2" fontWeight={600} color="primary.main">
                        {count}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(count / (stats?.employees?.total || 1)) * 100}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: getRoleColor(role),
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  No role distribution data available
                </Typography>
              )}
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default HRDashboard;