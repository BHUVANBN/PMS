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
import { testerAPI, subscribeToEvents } from '../../services/api';
import MyUpcomingEvents from '../../components/dashboard/MyUpcomingEvents';
import { useAuth } from '../../contexts/AuthContext';

const TesterDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentBugs, setRecentBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const { user } = useAuth();
  const [standupNotice, setStandupNotice] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsResponse, bugsResponse] = await Promise.all([
        testerAPI.getTesterStats(),
        testerAPI.getAllBugs()
      ]);

      const statsPayload = statsResponse?.stats || statsResponse?.data || statsResponse;
      const bugCollection = bugsResponse?.data || bugsResponse?.bugs || bugsResponse?.results || bugsResponse;

      setStats(statsPayload || null);
      setRecentBugs(Array.isArray(bugCollection) ? bugCollection.slice(0, 5) : []);
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

  useEffect(() => {
    if (!user?._id) return;
    let unsubscribe;
    let retryTimer;
    let retryDelay = 2000;
    const connect = () => {
      try {
        unsubscribe = subscribeToEvents(
          { userId: user._id },
          (payload) => {
            try {
              const type = payload?.type || '';
              if (type.startsWith('standup.')) {
                const title = type === 'standup.commented' ? 'Standup comment' : type === 'standup.attachment_added' ? 'Standup attachment' : 'Standup update';
                const by = payload?.data?.by ? ` by ${payload.data.by}` : '';
                setStandupNotice(`${title}${by}`);
                setTimeout(() => setStandupNotice(null), 12000);
              }
            } catch (err) { String(err); }
          },
          () => {
            try { if (typeof unsubscribe === 'function') unsubscribe(); } catch (err) { String(err); }
            if (retryTimer) clearTimeout(retryTimer);
            retryTimer = setTimeout(connect, retryDelay);
            retryDelay = Math.min(retryDelay * 2, 30000);
          }
        );
      } catch (err) {
        String(err);
        if (retryTimer) clearTimeout(retryTimer);
        retryTimer = setTimeout(connect, retryDelay);
        retryDelay = Math.min(retryDelay * 2, 30000);
      }
    };
    connect();
    return () => {
      try { if (typeof unsubscribe === 'function') unsubscribe(); } catch (err) { String(err); }
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [user?._id]);

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
      <Card 
        elevation={0} 
        sx={{ 
          height: { xs: 160, sm: 180 },
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.6)',
          borderRadius: '16px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
            background: 'rgba(255, 255, 255, 0.7)',
          }
        }}
      >
        <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography 
              color="text.primary" 
              variant="body1"
              sx={{ fontWeight: 600, fontSize: '0.95rem' }}
            >
              {title}
            </Typography>
            <Avatar 
              sx={{ 
                bgcolor: color,
                width: 48,
                height: 48,
                boxShadow: `0 4px 12px ${color}40`
              }}
            >
              {icon}
            </Avatar>
          </Box>
          
          <Box flex={1} display="flex" flexDirection="column">
            <Typography 
              variant="h2" 
              component="div" 
              sx={{ 
                fontWeight: 800, 
                color: 'text.primary',
                fontSize: '2.5rem',
                mb: 1,
                lineHeight: 1
              }}
            >
              {displayValue}
            </Typography>
            
            <Box mt="auto">
              {subtitle && (
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5 }}>
                  {subtitle}
                </Typography>
              )}
              {trend && (
                <Box display="flex" alignItems="center">
                  <TrendingUp sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
                  <Typography variant="body2" color="success.main" fontWeight={600}>
                    {trend}
                  </Typography>
                </Box>
              )}
            </Box>
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
          Tester Dashboard
        </Typography>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
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
            Welcome back! Here's your testing overview.
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
        {standupNotice && (
          <Alert severity="info" sx={{ mt: 2 }}>
            {standupNotice}
          </Alert>
        )}
      </Box>

      {/* Main Layout */}
      <Box sx={{ display: { lg: 'flex' }, gap: { lg: 3 }, alignItems: 'flex-start' }}>
        {/* Main Content Column */}
        <Box sx={{ flex: 1 }}>
          {/* Statistics Cards */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Bugs"
                value={summary.totalBugs || 0}
                icon={<BugReport sx={{ fontSize: 28 }} />}
                color={theme.palette.error.main}
                trend={`Reported: ${summary.reportedBugs || 0}`}
                subtitle={`${summary.activeBugs || 0} active`}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Assigned Bugs"
                value={summary.assignedBugs || 0}
                icon={<Assignment sx={{ fontSize: 28 }} />}
                color={theme.palette.primary.main}
                trend={`Resolved: ${summary.resolvedBugs || 0}`}
                subtitle={`${summary.closedBugs || 0} closed`}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Test Cases"
                value={testCases.total || 0}
                icon={<Assessment sx={{ fontSize: 28 }} />}
                color={theme.palette.info.main}
                trend={`Executed: ${testCases.executed || 0}`}
                subtitle={`${testCases.passed || 0} passed`}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Projects"
                value={summary.totalProjects || 0}
                icon={<Timeline sx={{ fontSize: 28 }} />}
                color={theme.palette.success.main}
                subtitle={`${summary.activeProjects || 0} active`}
              />
            </Grid>
          </Grid>

          {/* Recent Bugs Table */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3,
              mb: 4,
              background: 'rgba(255, 255, 255, 0.4)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              borderRadius: '16px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Recent Bugs
              </Typography>
              <Button size="small" variant="outlined">
                View All
              </Button>
            </Box>
            <TableContainer sx={{ maxHeight: 450 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, bgcolor: 'rgba(255, 255, 255, 0.9)' }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: 'rgba(255, 255, 255, 0.9)' }}>Title</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: 'rgba(255, 255, 255, 0.9)' }}>Severity</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: 'rgba(255, 255, 255, 0.9)' }}>Status</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, bgcolor: 'rgba(255, 255, 255, 0.9)' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentBugs.map((bug) => (
                    <TableRow key={bug._id || bug.id} hover sx={{ '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.02)' } }}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {bug.bugNumber || bug.reference || (bug._id || bug.id).slice(0, 8)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 350 }}>
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
                            fontWeight: 600,
                            border: `1px solid ${getSeverityColor(bug.severity)}40`,
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
                            fontWeight: 600,
                            border: `1px solid ${getStatusColor(bug.status)}40`,
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
                        <Typography variant="body2" color="text.secondary" align="center" py={3}>
                          No bugs reported yet.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Test Execution Overview - Full Width */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3,
              background: 'rgba(255, 255, 255, 0.4)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              borderRadius: '16px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Test Execution Overview
              </Typography>
              <Chip 
                label={`Total: ${testCases.total || 0}`}
                sx={{ 
                  fontWeight: 600,
                  bgcolor: 'primary.light',
                  color: 'white'
                }}
              />
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Box 
                  textAlign="center" 
                  p={3}
                  sx={{
                    background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(76, 175, 80, 0.05) 100%)',
                    borderRadius: '12px',
                    border: '2px solid rgba(76, 175, 80, 0.3)',
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 20px rgba(76, 175, 80, 0.2)',
                      border: '2px solid rgba(76, 175, 80, 0.5)',
                    }
                  }}
                >
                  <Avatar 
                    sx={{ 
                      bgcolor: 'success.main', 
                      color: '#fff', 
                      mx: 'auto', 
                      mb: 2,
                      width: 56,
                      height: 56,
                      boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)'
                    }}
                  >
                    <CheckCircle sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Typography variant="h3" fontWeight={800} color="success.main" mb={0.5}>
                    {testCases.passed || 0}
                  </Typography>
                  <Typography variant="body1" color="text.primary" fontWeight={600}>
                    Passed
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box 
                  textAlign="center" 
                  p={3}
                  sx={{
                    background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.15) 0%, rgba(244, 67, 54, 0.05) 100%)',
                    borderRadius: '12px',
                    border: '2px solid rgba(244, 67, 54, 0.3)',
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 20px rgba(244, 67, 54, 0.2)',
                      border: '2px solid rgba(244, 67, 54, 0.5)',
                    }
                  }}
                >
                  <Avatar 
                    sx={{ 
                      bgcolor: 'error.main', 
                      color: '#fff', 
                      mx: 'auto', 
                      mb: 2,
                      width: 56,
                      height: 56,
                      boxShadow: '0 4px 12px rgba(244, 67, 54, 0.4)'
                    }}
                  >
                    <Error sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Typography variant="h3" fontWeight={800} color="error.main" mb={0.5}>
                    {testCases.failed || 0}
                  </Typography>
                  <Typography variant="body1" color="text.primary" fontWeight={600}>
                    Failed
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box 
                  textAlign="center" 
                  p={3}
                  sx={{
                    background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.15) 0%, rgba(33, 150, 243, 0.05) 100%)',
                    borderRadius: '12px',
                    border: '2px solid rgba(33, 150, 243, 0.3)',
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 20px rgba(33, 150, 243, 0.2)',
                      border: '2px solid rgba(33, 150, 243, 0.5)',
                    }
                  }}
                >
                  <Avatar 
                    sx={{ 
                      bgcolor: 'info.main', 
                      color: '#fff', 
                      mx: 'auto', 
                      mb: 2,
                      width: 56,
                      height: 56,
                      boxShadow: '0 4px 12px rgba(33, 150, 243, 0.4)'
                    }}
                  >
                    <Speed sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Typography variant="h3" fontWeight={800} color="primary.main" mb={0.5}>
                    {testCases.executed || 0}
                  </Typography>
                  <Typography variant="body1" color="text.primary" fontWeight={600}>
                    Executed
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box 
                  textAlign="center" 
                  p={3}
                  sx={{
                    background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.15) 0%, rgba(255, 152, 0, 0.05) 100%)',
                    borderRadius: '12px',
                    border: '2px solid rgba(255, 152, 0, 0.3)',
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 20px rgba(255, 152, 0, 0.2)',
                      border: '2px solid rgba(255, 152, 0, 0.5)',
                    }
                  }}
                >
                  <Avatar 
                    sx={{ 
                      bgcolor: 'warning.main', 
                      color: '#fff', 
                      mx: 'auto', 
                      mb: 2,
                      width: 56,
                      height: 56,
                      boxShadow: '0 4px 12px rgba(255, 152, 0, 0.4)'
                    }}
                  >
                    <Warning sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Typography variant="h3" fontWeight={800} color="warning.main" mb={0.5}>
                    {testCases.blocked || 0}
                  </Typography>
                  <Typography variant="body1" color="text.primary" fontWeight={600}>
                    Blocked
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Box>

        {/* Right Sidebar */}
        <Box sx={{ 
          width: { xs: '100%', lg: 380 },
          flexShrink: 0,
          mt: { xs: 3, lg: 0 }
        }}>
          {/* My Upcoming Events */}
          <Box sx={{ mb: 3 }}>
            <MyUpcomingEvents title="My Upcoming Events" days={14} />
          </Box>

          {/* Bug Severity Distribution */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3,
              mb: 3,
              background: 'rgba(255, 255, 255, 0.4)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              borderRadius: '16px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
            }}
          >
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Bug Distribution by Severity
            </Typography>
            <Box>
              {Object.entries(severityDistribution).map(([severity, count]) => (
                <Box key={severity} mb={2.5}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2" sx={{ textTransform: 'capitalize', fontWeight: 500 }}>
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
                      height: 10,
                      borderRadius: 5,
                      bgcolor: 'rgba(0, 0, 0, 0.08)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: getSeverityColor(severity),
                        borderRadius: 5,
                      },
                    }}
                  />
                </Box>
              ))}
              {!Object.keys(severityDistribution).length && (
                <Typography variant="body2" color="text.secondary" textAlign="center" mt={2}>
                  No severity data available yet.
                </Typography>
              )}
            </Box>
          </Paper>

          {/* Bug Status Overview */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3,
              mb: 3,
              background: 'rgba(255, 255, 255, 0.4)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              borderRadius: '16px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
            }}
          >
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Bug Status Overview
            </Typography>
            <Box>
              {Object.entries(statusDistribution).map(([status, count]) => (
                <Box key={status} mb={2.5}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Chip
                      label={formatLabel(status)}
                      size="small"
                      sx={{
                        bgcolor: `${getStatusColor(status)}20`,
                        color: getStatusColor(status),
                        fontWeight: 600,
                        border: `1px solid ${getStatusColor(status)}40`,
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
                      height: 10,
                      borderRadius: 5,
                      bgcolor: 'rgba(0, 0, 0, 0.08)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: getStatusColor(status),
                        borderRadius: 5,
                      },
                    }}
                  />
                </Box>
              ))}
              {!Object.keys(statusDistribution).length && (
                <Typography variant="body2" color="text.secondary" textAlign="center" mt={2}>
                  No bug status data available yet.
                </Typography>
              )}
            </Box>
          </Paper>

          {/* Productivity Metrics */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3,
              background: 'rgba(255, 255, 255, 0.4)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              borderRadius: '16px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
              position: { lg: 'sticky' },
              top: { lg: 24 }
            }}
          >
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Productivity Metrics
            </Typography>
            <Stack spacing={2.5}>
              {productivityMetrics.map(({ key, label }) => {
                const rawValue = productivity[key] ?? 0;
                const value = Math.max(0, Math.min(Number.isFinite(rawValue) ? rawValue : 0, 100));

                return (
                  <Box key={key}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        {label}
                      </Typography>
                      <Typography variant="body2" fontWeight={700}>
                        {value}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={value}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        bgcolor: 'rgba(0, 0, 0, 0.08)',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: theme.palette.primary.main,
                          borderRadius: 5,
                        },
                      }}
                    />
                  </Box>
                );
              })}
            </Stack>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default TesterDashboard;