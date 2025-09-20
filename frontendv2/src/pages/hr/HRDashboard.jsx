import React, { useState, useEffect } from 'react';
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
  useTheme
} from '@mui/material';
import {
  People,
  PersonAdd,
  TrendingUp,
  Work,
  EventNote,
  Refresh,
  MoreVert,
  CheckCircle,
  Pending,
  Cancel
} from '@mui/icons-material';
import { hrAPI } from '../../services/api';

const HRDashboard = () => {
  const [stats, setStats] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();

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

  const StatCard = ({ title, value, icon, color, trend, subtitle }) => (
    <Card elevation={2} sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 600, color }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
            {trend && (
              <Box display="flex" alignItems="center" mt={1}>
                <TrendingUp sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
                <Typography variant="body2" color="success.main">
                  {trend}
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar sx={{ bgcolor: `${color}20`, color }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

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

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          HR Dashboard
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={handleRefresh}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Employees"
            value={stats?.employees?.total || 0}
            icon={<People />}
            color={theme.palette.primary.main}
            trend="+5% this month"
            subtitle={`${stats?.employees?.active || 0} active`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Recent Hires"
            value={stats?.employees?.recentHires || 0}
            icon={<PersonAdd />}
            color={theme.palette.success.main}
            subtitle="Last 30 days"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Leave Requests"
            value={stats?.leaves?.pending || 0}
            icon={<EventNote />}
            color={theme.palette.warning.main}
            subtitle={`${stats?.leaves?.total || 0} total`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Departments"
            value={stats?.overview?.departmentCount || 0}
            icon={<Work />}
            color={theme.palette.info.main}
            subtitle="Active departments"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Role Distribution */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '400px' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Employee Distribution by Role
            </Typography>
            <Box>
              {stats?.roles && Object.entries(stats.roles).map(([role, count]) => (
                <Box key={role} mb={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                      {role}
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
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
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Recent Employees */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '400px' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Recent Employees
              </Typography>
              <Button size="small" color="primary" onClick={() => window.location.assign('/hr/employees')}>
                View All
              </Button>
            </Box>
            <TableContainer sx={{ maxHeight: 320 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee._id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              mr: 1,
                              bgcolor: getRoleColor(employee.role),
                              fontSize: '0.875rem'
                            }}
                          >
                            {employee.firstName?.[0]}{employee.lastName?.[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {employee.firstName} {employee.lastName}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
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
                            bgcolor: `${getRoleColor(employee.role)}20`,
                            color: getRoleColor(employee.role),
                            textTransform: 'capitalize',
                            fontWeight: 600
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
                      <TableCell align="right">
                        <IconButton size="small">
                          <MoreVert fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Leave Requests Overview */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Leave Requests Overview
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <Box textAlign="center" p={2}>
                  <Avatar sx={{ bgcolor: 'warning.light', color: 'warning.dark', mx: 'auto', mb: 1 }}>
                    <Pending />
                  </Avatar>
                  <Typography variant="h5" fontWeight={600}>
                    {stats?.leaves?.pending || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Pending
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box textAlign="center" p={2}>
                  <Avatar sx={{ bgcolor: 'success.light', color: 'success.dark', mx: 'auto', mb: 1 }}>
                    <CheckCircle />
                  </Avatar>
                  <Typography variant="h5" fontWeight={600}>
                    {stats?.leaves?.approved || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Approved
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box textAlign="center" p={2}>
                  <Avatar sx={{ bgcolor: 'error.light', color: 'error.dark', mx: 'auto', mb: 1 }}>
                    <Cancel />
                  </Avatar>
                  <Typography variant="h5" fontWeight={600}>
                    {stats?.leaves?.rejected || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Rejected
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box textAlign="center" p={2}>
                  <Avatar sx={{ bgcolor: 'info.light', color: 'info.dark', mx: 'auto', mb: 1 }}>
                    <EventNote />
                  </Avatar>
                  <Typography variant="h5" fontWeight={600}>
                    {stats?.leaves?.total || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HRDashboard;
