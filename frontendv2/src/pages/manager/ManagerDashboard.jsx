import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Grid,
  Paper,
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
    pendingTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0
  });
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Team performance will be derived from backend ticket stats per member when available.

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

      // Build real tasks list from tickets endpoint
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

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12}>
          <QuickActions actions={quickActions} />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={9} sm={9} md={9} lg={9}>
          <ProjectOverview projects={projects} onRefresh={fetchDashboardData} />
        </Grid>
        <Grid item xs={3} sm={3} md={3} lg={3}>
          <TaskProgress tasks={tasks} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ManagerDashboard;
