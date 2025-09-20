import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Grid,
  Paper,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Button,
  IconButton,
  Menu,
  MenuItem,
  LinearProgress
} from '@mui/material';
import {
  Assignment,
  Group,
  TrendingUp,
  Schedule,
  Add,
  MoreVert,
  PlayArrow,
  Pause,
  CheckCircle
} from '@mui/icons-material';
import StatsCard from '../../components/dashboard/StatsCard';
import ProjectOverview from '../../components/dashboard/ProjectOverview';
import TaskProgress from '../../components/dashboard/TaskProgress';
import QuickActions from '../../components/dashboard/QuickActions';
import { managerAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeProjects: 0,
    teamMembers: 0,
    completedTasks: 0,
    pendingTasks: 0
  });
  const [projects, setProjects] = useState([]);
  const [teamPerformance, setTeamPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Team performance will be derived from backend ticket stats per member when available.

  const quickActions = [
    {
      title: 'Create Project',
      subtitle: 'Start new project',
      icon: <Add />,
      color: 'primary',
      path: '/projects/new'
    },
    {
      title: 'Assign Tasks',
      subtitle: 'Delegate work',
      icon: <Assignment />,
      color: 'success',
      path: '/tickets/assign'
    },
    {
      title: 'Team Meeting',
      subtitle: 'Schedule meeting',
      icon: <Group />,
      color: 'info',
      path: '/calendar/new'
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

      const [projectsResponse, statsResponse] = await Promise.all([
        managerAPI.getAllProjects(),
        managerAPI.getManagerStats(),
      ]);

      const projList = projectsResponse?.projects || projectsResponse?.data?.projects || projectsResponse?.data || [];
      setProjects(Array.isArray(projList) ? projList : []);

      const s = statsResponse?.stats || statsResponse?.data?.stats || statsResponse;
      const normalizedStats = {
        activeProjects: s?.projectStats?.active ?? s?.projects?.active ?? s?.projectsActive ?? 0,
        teamMembers: s?.team?.totalMembers ?? s?.teamStats?.totalMembers ?? 0,
        completedTasks: s?.tickets?.completed ?? s?.ticketStats?.completed ?? 0,
        pendingTasks: s?.tickets?.open ?? s?.ticketStats?.open ?? 0,
      };
      setStats(normalizedStats);

      // Optional: derive team performance if backend returns per-member metrics
      const perf = s?.team?.members || s?.teamMembers || [];
      const mappedPerf = Array.isArray(perf) ? perf.slice(0, 6).map((m, idx) => ({
        id: m._id || m.id || idx,
        name: m.name || `${m.firstName || ''} ${m.lastName || ''}`.trim() || 'Member',
        role: m.role || 'member',
        tasksCompleted: m.tasksCompleted || m.completed || 0,
        tasksInProgress: m.tasksInProgress || m.inProgress || 0,
        efficiency: m.efficiency || Math.min(100, Math.round(((m.completed || 0) / Math.max((m.completed || 0) + (m.inProgress || 0) + 1, 1)) * 100)),
        avatar: m.avatar || undefined,
      })) : [];
      setTeamPerformance(mappedPerf);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message || 'Failed to load manager dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 90) return 'success';
    if (efficiency >= 75) return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <LinearProgress sx={{ width: '60%' }} />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Manager Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        Welcome back, {user?.username || 'Manager'}! Here's your team overview.
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
            title="Active Projects"
            value={stats.activeProjects}
            change="+2 this month"
            changeType="positive"
            icon={Assignment}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Team Members"
            value={stats.teamMembers}
            change="All active"
            changeType="neutral"
            icon={Group}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Completed Tasks"
            value={stats.completedTasks}
            change="+15 this week"
            changeType="positive"
            icon={CheckCircle}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Pending Tasks"
            value={stats.pendingTasks}
            change="-5 from last week"
            changeType="positive"
            icon={Schedule}
            color="warning"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Project Overview */}
        <Grid item xs={12} lg={8}>
          <ProjectOverview projects={projects} />
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} lg={4}>
          <QuickActions actions={quickActions} />
        </Grid>

        {/* Team Performance */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title="Team Performance"
              titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
              action={
                <Button size="small" variant="outlined">
                  View All
                </Button>
              }
            />
            <CardContent sx={{ pt: 0 }}>
              <List sx={{ p: 0 }}>
                {teamPerformance.map((member) => (
                  <ListItem key={member.id} sx={{ px: 0, py: 2 }}>
                    <ListItemAvatar>
                      <Avatar src={member.avatar} sx={{ bgcolor: 'primary.main' }}>
                        {member.name.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                          <Typography variant="body1" fontWeight="medium">
                            {member.name}
                          </Typography>
                          <Chip
                            label={`${member.efficiency}%`}
                            size="small"
                            color={getEfficiencyColor(member.efficiency)}
                            variant="filled"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {member.role}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={2} mt={1}>
                            <Typography variant="caption" color="text.secondary">
                              Completed: {member.tasksCompleted}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              In Progress: {member.tasksInProgress}
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={member.efficiency}
                            color={getEfficiencyColor(member.efficiency)}
                            sx={{ mt: 1, height: 6, borderRadius: 3 }}
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Task Progress */}
        <Grid item xs={12} lg={6}>
          <TaskProgress />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ManagerDashboard;
