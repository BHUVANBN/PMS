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

const HRDashboard = () => {
  const navigate = useNavigate();
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

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
            HR Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage employees, track performance, and oversee HR operations
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
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

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Employees"
            value={stats?.employees?.total || 0}
            change={`${stats?.employees?.active || 0} active employees`}
            changeType="neutral"
            icon={People}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Recent Hires"
            value={stats?.employees?.recentHires || 0}
            change="New employees this month"
            changeType="positive"
            icon={PersonAdd}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Leave Requests"
            value={stats?.leaves?.pending || 0}
            change={`${stats?.leaves?.total || 0} total requests`}
            changeType="neutral"
            icon={EventNote}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
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

      <Grid container spacing={3}>
        {/* Employee Management */}
        <Grid item xs={12} lg={8}>
          <Paper elevation={2} sx={{ p: 3 }}>
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
                              fontSize: '1rem',
                              fontWeight: 600
                            }}
                          >
                            {employee.firstName?.[0]}{employee.lastName?.[0]}
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
        </Grid>

        {/* Role Distribution */}
        <Grid item xs={12} lg={4}>
          <Paper elevation={2} sx={{ p: 3, height: 'fit-content' }}>
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
        </Grid>

        {/* Leave Requests Overview */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
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
                <Card sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.50', border: '1px solid', borderColor: 'warning.200' }}>
                  <Avatar sx={{ bgcolor: 'warning.main', mx: 'auto', mb: 1, width: 48, height: 48 }}>
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
                <Card sx={{ p: 2, textAlign: 'center', bgcolor: 'success.50', border: '1px solid', borderColor: 'success.200' }}>
                  <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 1, width: 48, height: 48 }}>
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
                <Card sx={{ p: 2, textAlign: 'center', bgcolor: 'error.50', border: '1px solid', borderColor: 'error.200' }}>
                  <Avatar sx={{ bgcolor: 'error.main', mx: 'auto', mb: 1, width: 48, height: 48 }}>
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
                <Card sx={{ p: 2, textAlign: 'center', bgcolor: 'info.50', border: '1px solid', borderColor: 'info.200' }}>
                  <Avatar sx={{ bgcolor: 'info.main', mx: 'auto', mb: 1, width: 48, height: 48 }}>
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
        </Grid>
      </Grid>
    </Box>
  );
};

export default HRDashboard;
