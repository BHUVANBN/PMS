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
  BugReport,
  Assignment,
  CheckCircle,
  Error,
  Warning,
  Info,
  Refresh,
  MoreVert,
  TrendingUp,
  Speed,
  Timeline,
  Assessment
} from '@mui/icons-material';
import { testerAPI } from '../../services/api';

const TesterDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentBugs, setRecentBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch tester statistics and recent bugs
      const [statsResponse, bugsResponse] = await Promise.all([
        testerAPI.getTesterStats(),
        testerAPI.getAllBugs()
      ]);
      
      setStats(statsResponse.stats);
      setRecentBugs(bugsResponse.data.slice(0, 5)); // Show only recent 5 bugs
    } catch (err) {
      setError(err.message || 'Failed to fetch tester data');
      console.error('Tester Dashboard error:', err);
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

  const getSeverityColor = (severity) => {
    const colors = {
      critical: theme.palette.error.main,
      high: theme.palette.warning.main,
      medium: theme.palette.info.main,
      low: theme.palette.success.main
    };
    return colors[severity] || theme.palette.grey[500];
  };

  const getStatusColor = (status) => {
    const colors = {
      open: theme.palette.error.main,
      'in-progress': theme.palette.warning.main,
      resolved: theme.palette.success.main,
      closed: theme.palette.grey[600],
      verified: theme.palette.info.main
    };
    return colors[status] || theme.palette.grey[500];
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Tester Dashboard
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
            title="Total Bugs"
            value={stats?.bugs?.total || 0}
            icon={<BugReport />}
            color={theme.palette.error.main}
            trend="-12% this week"
            subtitle={`${stats?.bugs?.open || 0} open`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Test Cases"
            value={stats?.testCases?.total || 0}
            icon={<Assignment />}
            color={theme.palette.primary.main}
            subtitle={`${stats?.testCases?.passed || 0} passed`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Test Coverage"
            value={`${stats?.coverage?.percentage || 0}%`}
            icon={<Assessment />}
            color={theme.palette.info.main}
            trend="+8% this sprint"
            subtitle="Code coverage"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Projects"
            value={stats?.projects?.active || 0}
            icon={<Timeline />}
            color={theme.palette.success.main}
            subtitle={`${stats?.projects?.total || 0} total`}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Bug Severity Distribution */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '400px' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Bug Distribution by Severity
            </Typography>
            <Box>
              {stats?.severity && Object.entries(stats.severity).map(([severity, count]) => (
                <Box key={severity} mb={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                      {severity}
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {count}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(count / (stats?.bugs?.total || 1)) * 100}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: getSeverityColor(severity),
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Recent Bugs */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '400px' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Recent Bugs
              </Typography>
              <Button size="small" color="primary">
                View All
              </Button>
            </Box>
            <TableContainer sx={{ maxHeight: 320 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Severity</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentBugs.map((bug) => (
                    <TableRow key={bug._id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={600} noWrap>
                            {bug.title}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {bug.project?.name || 'Unknown Project'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={bug.severity}
                          size="small"
                          sx={{
                            bgcolor: `${getSeverityColor(bug.severity)}20`,
                            color: getSeverityColor(bug.severity),
                            textTransform: 'capitalize',
                            fontWeight: 600
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={bug.status}
                          size="small"
                          sx={{
                            bgcolor: `${getStatusColor(bug.status)}20`,
                            color: getStatusColor(bug.status),
                            textTransform: 'capitalize',
                            fontWeight: 600
                          }}
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

        {/* Test Execution Overview */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Test Execution Overview
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box textAlign="center" p={2}>
                  <Avatar sx={{ bgcolor: 'success.light', color: 'success.dark', mx: 'auto', mb: 1 }}>
                    <CheckCircle />
                  </Avatar>
                  <Typography variant="h5" fontWeight={600}>
                    {stats?.testCases?.passed || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Passed
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box textAlign="center" p={2}>
                  <Avatar sx={{ bgcolor: 'error.light', color: 'error.dark', mx: 'auto', mb: 1 }}>
                    <Error />
                  </Avatar>
                  <Typography variant="h5" fontWeight={600}>
                    {stats?.testCases?.failed || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Failed
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Performance Metrics */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Performance Metrics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box textAlign="center" p={2}>
                  <Avatar sx={{ bgcolor: 'info.light', color: 'info.dark', mx: 'auto', mb: 1 }}>
                    <Speed />
                  </Avatar>
                  <Typography variant="h5" fontWeight={600}>
                    {stats?.productivity?.bugsPerDay || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Bugs/Day
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box textAlign="center" p={2}>
                  <Avatar sx={{ bgcolor: 'warning.light', color: 'warning.dark', mx: 'auto', mb: 1 }}>
                    <Assignment />
                  </Avatar>
                  <Typography variant="h5" fontWeight={600}>
                    {stats?.productivity?.testsPerDay || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Tests/Day
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

export default TesterDashboard;
