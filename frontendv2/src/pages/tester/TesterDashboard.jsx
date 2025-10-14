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
  Stack,
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
import MyUpcomingEvents from '../../components/dashboard/MyUpcomingEvents';

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

      const statsPayload = statsResponse?.stats || statsResponse?.data || statsResponse;
      const bugCollection = bugsResponse?.data || bugsResponse?.bugs || bugsResponse?.results || bugsResponse;

      setStats(statsPayload || null);
      setRecentBugs(Array.isArray(bugCollection) ? bugCollection.slice(0, 5) : []); // Show only recent 5 bugs
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

  const StatCard = ({ title, value, icon, color, trend, subtitle }) => {
    const displayValue = typeof value === 'number' ? value.toLocaleString() : value;

    return (
    <Card elevation={2} sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 600, color }}>
              {displayValue}
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
  };

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
    const normalized = (status || '').toLowerCase();
    const colors = {
      new: theme.palette.info.main,
      assigned: theme.palette.warning.main,
      in_progress: theme.palette.primary.main,
      'in-progress': theme.palette.primary.main,
      resolved: theme.palette.success.main,
      closed: theme.palette.grey[600],
      reopened: theme.palette.error.main
    };
    return colors[normalized] || theme.palette.grey[500];
  };

  const formatLabel = (value) =>
    (value || '')
      .toString()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase()) || 'N/A';

  const summary = stats?.summary || {};
  const severityDistribution = stats?.severityDistribution || {};
  const statusDistribution = stats?.statusDistribution || {};
  const testCases = stats?.testCases || {};
  const productivity = stats?.productivity || {};

  const totalBugs = summary.totalBugs || 0;
  const productivityMetrics = [
    { key: 'bugDetectionRate', label: 'Bug Detection Rate' },
    { key: 'bugResolutionRate', label: 'Bug Resolution Rate' },
    { key: 'testExecutionRate', label: 'Test Execution Rate' },
    { key: 'testPassRate', label: 'Test Pass Rate' }
  ];

  return (
    <Box>
      {/* Header */}
      <Grid container spacing={2} alignItems="center" mb={3}>
        <Grid item xs={12} md={8}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Tester Dashboard
          </Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          <MyUpcomingEvents title="My Upcoming Events" days={14} />
        </Grid>
      </Grid>

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Bugs"
            value={summary.totalBugs || 0}
            icon={<BugReport />}
            color={theme.palette.error.main}
            trend={`Reported: ${summary.reportedBugs || 0}`}
            subtitle={`${summary.activeBugs || 0} active`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Assigned Bugs"
            value={summary.assignedBugs || 0}
            icon={<Assignment />}
            color={theme.palette.primary.main}
            trend={`Resolved: ${summary.resolvedBugs || 0}`}
            subtitle={`${summary.closedBugs || 0} closed`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Test Cases"
            value={testCases.total || 0}
            icon={<Assessment />}
            color={theme.palette.info.main}
            trend={`Executed: ${testCases.executed || 0}`}
            subtitle={`${testCases.passed || 0} passed`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Projects"
            value={summary.totalProjects || 0}
            icon={<Timeline />}
            color={theme.palette.success.main}
            subtitle={`${summary.activeProjects || 0} active`}
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
              {Object.entries(severityDistribution).map(([severity, count]) => (
                <Box key={severity} mb={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                      {formatLabel(severity)}
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {count}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={totalBugs ? (count / totalBugs) * 100 : 0}
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

        {/* Bug Status Distribution */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '400px' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Bug Status Overview
            </Typography>
            <Box>
              {Object.entries(statusDistribution).map(([status, count]) => (
                <Box key={status} mb={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Chip
                      label={formatLabel(status)}
                      size="small"
                      sx={{
                        bgcolor: `${getStatusColor(status)}20`,
                        color: getStatusColor(status),
                        fontWeight: 600
                      }}
                    />
                    <Typography variant="body2" fontWeight={600}>
                      {count}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={totalBugs ? (count / totalBugs) * 100 : 0}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: getStatusColor(status),
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>
              ))}
              {!Object.keys(statusDistribution).length && (
                <Typography variant="body2" color="text.secondary">
                  No bug status data available yet.
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Recent Bugs */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
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
                    <TableCell>ID</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Severity</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentBugs.map((bug) => (
                    <TableRow key={bug._id || bug.id} hover>
                      <TableCell>{bug.bugNumber || bug.reference || (bug._id || bug.id)}</TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={600} noWrap>
                            {bug.title || 'Untitled Bug'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {bug.project?.name || bug.projectName || 'Unknown Project'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={formatLabel(bug.severity)}
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
                          label={formatLabel(bug.status)}
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
                  {!recentBugs.length && (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Typography variant="body2" color="text.secondary" align="center">
                          No bugs reported yet.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
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
                    {testCases.passed || 0}
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
                    {testCases.failed || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Failed
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            <Stack spacing={2} sx={{ mt: 3 }}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Executed
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {testCases.executed || 0}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Blocked
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {testCases.blocked || 0}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Performance Metrics */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Productivity Metrics
            </Typography>
            <Stack spacing={2}>
              {productivityMetrics.map(({ key, label }) => {
                const rawValue = productivity[key] ?? 0;
                const value = Math.max(0, Math.min(Number.isFinite(rawValue) ? rawValue : 0, 100));

                return (
                  <Box key={key}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                      <Typography variant="body2" color="text.secondary">
                        {label}
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {value}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={value}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: theme.palette.primary.main,
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>
                );
              })}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
;

export default TesterDashboard;
