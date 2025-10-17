import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Grid,
  Paper,
  LinearProgress,
  Button,
  Stack,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  Assignment,
  Group,
  TrendingUp,
  Schedule,
  CheckCircle,
  Refresh
} from '@mui/icons-material';
import StatsCard from '../../components/dashboard/StatsCard';
import TaskProgress from '../../components/dashboard/TaskProgress';
import MyUpcomingEvents from '../../components/dashboard/MyUpcomingEvents';
import QuickActions from '../../components/dashboard/QuickActions';
import { managerAPI } from '../../services/api';
import { standupAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ManagerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeProjects: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0
  });
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const quickActions = [
    {
      title: 'Assign Tasks',
      subtitle: 'Delegate work',
      icon: <Assignment />,
      color: 'success',
      path: '/manager/kanban'
    },
    {
      title: 'Team Management',
      subtitle: 'Manage team & roles',
      icon: <Group />,
      color: 'info',
      path: '/manager/team'
    },
    {
      title: 'View Reports',
      subtitle: 'Analytics & insights',
      icon: <TrendingUp />,
      color: 'warning',
      path: '/reports'
    }
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [projectsResponse, statsResponse, ticketsResponse] = await Promise.all([
        managerAPI.getAllProjects(),
        managerAPI.getManagerStats(),
        managerAPI.getAllTickets?.() || Promise.resolve({ data: [] })
      ]);

      const projList = projectsResponse?.projects || projectsResponse?.data?.projects || projectsResponse?.data || [];
      setProjects(Array.isArray(projList) ? projList : []);

      const s = statsResponse?.stats || statsResponse?.data?.stats || statsResponse;
      const normalizedStats = {
        activeProjects: s?.projects?.active ?? s?.projectStats?.active ?? s?.projectsActive ?? 0,
        pendingTasks: s?.tickets?.open ?? s?.ticketStats?.open ?? 0,
        inProgressTasks: s?.tickets?.inProgress ?? s?.ticketStats?.inProgress ?? 0,
        completedTasks: s?.tickets?.completed ?? s?.ticketStats?.completed ?? 0,
      };
      setStats(normalizedStats);

      const tickets = ticketsResponse?.data || ticketsResponse || [];
      const progressMap = {
        open: 0,
        'in_progress': 50,
        testing: 75,
        'code_review': 85,
        done: 100,
        completed: 100,
        blocked: 10,
      };
      const mappedTasks = (Array.isArray(tickets) ? tickets : []).slice(0, 10).map((t, idx) => ({
        id: t._id || t.id || idx,
        title: t.title || t.ticketNumber || 'Ticket',
        status: t.status || 'open',
        priority: t.priority || 'medium',
        dueDate: t.dueDate || null,
        assignee: t.assignedDeveloper?.username || t.assignedDeveloper?.name || t.assignedDeveloper ? 'Assigned' : 'Unassigned',
        progress: progressMap[t.status] ?? 0,
      }));
      setTasks(mappedTasks);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message || 'Failed to load manager dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      active: '#4caf50',
      completed: '#2196f3',
      pending: '#ff9800',
      on_hold: '#f44336',
      planning: '#9c27b0'
    };
    return colors[status] || '#757575';
  };

  const CompactStandups = () => {
    const [rows, setRows] = React.useState([]);
    const [loading, setLoading] = React.useState(false);

    const fetchToday = async () => {
      try {
        setLoading(true);
        const res = await standupAPI.todayAll();
        const items = res?.items || res?.data?.items || [];
        setRows(Array.isArray(items) ? items.slice(0, 5) : []);
      } finally {
        setLoading(false);
      }
    };

    React.useEffect(() => { fetchToday(); }, []);

    if (loading) return <LinearProgress />;
    if (!rows.length) return <Typography variant="body2" color="text.secondary">No standups yet today</Typography>;

    return (
      <Stack spacing={1}>
        {rows.map(r => (
          <Box key={r._id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="body2" sx={{ mr: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {(r.name || 'User')} — {(r.tasks_done || '').slice(0, 40)}{(r.tasks_done || '').length > 40 ? '…' : ''}
            </Typography>
            <Chip size="small" label={r.status || '-'} variant="outlined" />
          </Box>
        ))}
      </Stack>
    );
  };

  const downloadTodaySummary = async () => {
    const today = new Date();
    const from = new Date(today); from.setHours(0,0,0,0);
    const to = new Date(today); to.setHours(23,59,59,999);
    try {
      const res = await standupAPI.summary({ from: from.toISOString(), to: to.toISOString() });
      const { summary } = res?.data || res || {};
      const csv = [
        'Metric,Value',
        `Total,${summary?.total ?? 0}`,
        `TotalHours,${summary?.totalHours ?? 0}`,
        ...Object.entries(summary?.byStatus || {}).map(([k,v]) => `Status:${k},${v}`),
        ...Object.entries(summary?.byPriority || {}).map(([k,v]) => `Priority:${k},${v}`),
      ].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'standup-summary-today.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      // Swallow errors, widget is auxiliary
      console.error('Summary download failed', e);
    }
  };

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
          Manager Dashboard
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
          Welcome back, {user?.username || 'Manager'}! Here's your team overview.
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
        <Paper sx={{ 
          p: 2, 
          mb: 3, 
          background: 'rgba(244, 67, 54, 0.1)',
          border: '1px solid rgba(244, 67, 54, 0.3)',
          borderRadius: '12px'
        }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}

      {/* Main Layout */}
      <Box sx={{ display: { lg: 'flex' }, gap: { lg: 3 }, alignItems: 'flex-start' }}>
        {/* Main Content Column */}
        <Box sx={{ flex: 1 }}>
          {/* Stats Cards */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                title="Active Projects"
                value={stats.activeProjects}
                icon={Assignment}
                color="primary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                title="Pending Tasks"
                value={stats.pendingTasks}
                icon={Schedule}
                color="warning"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                title="In Progress Tasks"
                value={stats.inProgressTasks}
                icon={Assignment}
                color="info"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                title="Completed Tasks"
                value={stats.completedTasks}
                icon={CheckCircle}
                color="success"
              />
            </Grid>
          </Grid>

          {/* Quick Actions */}
          <Box mb={4}>
            <QuickActions actions={quickActions} />
          </Box>

          {/* Project Overview - Bento Grid */}
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
                Project Overview
              </Typography>
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => navigate('/projects')}
              >
                View All Projects
              </Button>
            </Box>

            {projects.length === 0 ? (
              <Box textAlign="center" py={6}>
                <Typography variant="body2" color="text.secondary">
                  No projects found
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {projects.map((project) => (
                  <Grid item xs={12} sm={6} lg={4} key={project._id}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        height: 320,
                        display: 'flex',
                        flexDirection: 'column',
                        background: 'rgba(255, 255, 255, 0.3)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.5)',
                        borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                          background: 'rgba(255, 255, 255, 0.4)',
                        }
                      }}
                      onClick={() => navigate(`/projects/${project._id}`)}
                    >
                      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        {/* Project Header */}
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 600,
                              fontSize: '1.1rem',
                              color: 'text.primary',
                              lineHeight: 1.3,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                            }}
                          >
                            {project.projectName || project.name || 'Unnamed Project'}
                          </Typography>
                        </Box>

                        {/* Status Badge */}
                        <Box mb={2}>
                          <Box
                            sx={{
                              display: 'inline-block',
                              px: 1.5,
                              py: 0.5,
                              borderRadius: '20px',
                              bgcolor: `${getStatusColor(project.status)}15`,
                              border: `1px solid ${getStatusColor(project.status)}30`
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                color: getStatusColor(project.status),
                                fontWeight: 600,
                                textTransform: 'capitalize',
                                fontSize: '0.75rem'
                              }}
                            >
                              {project.status || 'Active'}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Project Description */}
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            mb: 2,
                            flex: 1,
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            fontSize: '0.875rem',
                            lineHeight: 1.5,
                            minHeight: '63px'
                          }}
                        >
                          {project.description || 'No description available'}
                        </Typography>

                        {/* Bottom Section */}
                        <Box sx={{ mt: 'auto' }}>
                          {/* Project Manager */}
                          {project.projectManager && (
                            <Box 
                              display="flex" 
                              alignItems="center" 
                              mb={1.5}
                              pt={2}
                              borderTop="1px solid rgba(0, 0, 0, 0.08)"
                            >
                              <Box
                                sx={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: '50%',
                                  bgcolor: '#2196f3',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  mr: 1.5,
                                  flexShrink: 0
                                }}
                              >
                                <Typography
                                  sx={{
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: '0.875rem'
                                  }}
                                >
                                  {(project.projectManager?.firstName?.[0] || '').toUpperCase()}
                                  {(project.projectManager?.lastName?.[0] || '').toUpperCase()}
                                </Typography>
                              </Box>
                              <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Project Manager
                                </Typography>
                                <Typography 
                                  variant="body2" 
                                  fontWeight={500}
                                  sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {project.projectManager.firstName} {project.projectManager.lastName}
                                </Typography>
                              </Box>
                            </Box>
                          )}

                          {/* Team Size */}
                          <Box 
                            display="flex" 
                            alignItems="center" 
                            sx={{
                              p: 1.5,
                              borderRadius: '8px',
                              bgcolor: 'rgba(33, 150, 243, 0.08)'
                            }}
                          >
                            <Group sx={{ fontSize: 18, color: 'primary.main', mr: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                              {project.team?.length || 0} team {(project.team?.length || 0) === 1 ? 'member' : 'members'}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Box>

        {/* Right Sidebar */}
        <Box sx={{ 
          width: { xs: '100%', lg: 360 },
          flexShrink: 0,
          mt: { xs: 3, lg: 0 }
        }}>
          {/* Today's Standups (compact) */}
          <Paper elevation={0} sx={{ 
            p: 3,
            mb: 3,
            background: 'rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
          }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="subtitle1" fontWeight={600}>Today's Standups</Typography>
              <Button size="small" variant="text" onClick={() => navigate('/manager/standups')}>View</Button>
            </Box>
            <CompactStandups />
            <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 1 }}>
              <Button size="small" variant="outlined" onClick={downloadTodaySummary}>Download Summary</Button>
            </Stack>
          </Paper>

          {/* My Upcoming Events */}
          <Box sx={{ mb: 3 }}>
            <MyUpcomingEvents title="My Upcoming Events" days={14} />
          </Box>

          {/* Task Progress */}
          <Paper elevation={0} sx={{ 
            p: 3,
            background: 'rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
            position: { lg: 'sticky' },
            top: { lg: 24 }
          }}>
            <TaskProgress tasks={tasks} />
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default ManagerDashboard;