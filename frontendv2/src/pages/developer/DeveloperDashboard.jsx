import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Box,
  List,
  ListItem,
  ListItemText,
  Chip,
  LinearProgress,
  Avatar,
  Button
} from '@mui/material';
import {
  TicketIcon,
  CodeBracketIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BugAntIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import StatsGrid from '../../components/dashboard/StatsGrid';
import DashboardCard from '../../components/dashboard/DashboardCard';
import Badge from '../../components/ui/Badge';
import { developerAPI } from '../../services/api';

const DeveloperDashboard = () => {
  const [stats, setStats] = useState([]);
  const [myTickets, setMyTickets] = useState([]);
  const [recentCommits, setRecentCommits] = useState([]);
  const [todayTasks, setTodayTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Mock data for demonstration
      setStats([
        {
          title: 'Active Tickets',
          value: '8',
          subtitle: 'Assigned to me',
          icon: <TicketIcon className="h-6 w-6" />,
          trend: 'neutral',
          trendValue: 'Same',
          color: 'primary'
        },
        {
          title: 'Completed Today',
          value: '3',
          subtitle: 'Tasks finished',
          icon: <CheckCircleIcon className="h-6 w-6" />,
          trend: 'up',
          trendValue: '+2',
          color: 'success'
        },
        {
          title: 'Code Reviews',
          value: '2',
          subtitle: 'Pending review',
          icon: <CodeBracketIcon className="h-6 w-6" />,
          trend: 'down',
          trendValue: '-1',
          color: 'info'
        },
        {
          title: 'Bugs Found',
          value: '1',
          subtitle: 'This week',
          icon: <BugAntIcon className="h-6 w-6" />,
          trend: 'down',
          trendValue: '-2',
          color: 'warning'
        }
      ]);

      setMyTickets([
        { 
          id: 'TASK-123',
          title: 'Implement user authentication',
          priority: 'High',
          status: 'In Progress',
          project: 'E-commerce Platform',
          estimatedHours: 8,
          spentHours: 5
        },
        { 
          id: 'TASK-124',
          title: 'Fix responsive design issues',
          priority: 'Medium',
          status: 'To Do',
          project: 'Mobile App Redesign',
          estimatedHours: 4,
          spentHours: 0
        },
        { 
          id: 'TASK-125',
          title: 'Optimize database queries',
          priority: 'High',
          status: 'Code Review',
          project: 'API Integration',
          estimatedHours: 6,
          spentHours: 6
        },
        { 
          id: 'TASK-126',
          title: 'Add unit tests for payment module',
          priority: 'Medium',
          status: 'To Do',
          project: 'E-commerce Platform',
          estimatedHours: 3,
          spentHours: 0
        }
      ]);

      setRecentCommits([
        { message: 'Fix: Resolve authentication bug in login flow', time: '2 hours ago', branch: 'feature/auth' },
        { message: 'Add: Implement password reset functionality', time: '4 hours ago', branch: 'feature/auth' },
        { message: 'Update: Improve error handling in API calls', time: '1 day ago', branch: 'develop' },
        { message: 'Refactor: Clean up user service methods', time: '2 days ago', branch: 'develop' }
      ]);

      setTodayTasks([
        { task: 'Complete authentication module', completed: true },
        { task: 'Review pull request #45', completed: true },
        { task: 'Fix responsive design bug', completed: false },
        { task: 'Write unit tests for payment', completed: false },
        { task: 'Update documentation', completed: false }
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'error';
      case 'Medium': return 'warning';
      case 'Low': return 'success';
      default: return 'primary';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress': return 'primary';
      case 'To Do': return 'secondary';
      case 'Code Review': return 'info';
      case 'Done': return 'success';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Developer Dashboard
      </Typography>
      
      {/* Stats Overview */}
      <Box sx={{ mb: 4 }}>
        <StatsGrid stats={stats} />
      </Box>

      <Grid container spacing={3}>
        {/* My Tickets */}
        <Grid item xs={12} lg={8}>
          <DashboardCard title="My Active Tickets" className="h-full">
            <Box sx={{ mt: 2 }}>
              {myTickets.map((ticket, index) => (
                <Card key={index} sx={{ mb: 2, p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        {ticket.id}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {ticket.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {ticket.project}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column', alignItems: 'flex-end' }}>
                      <Badge variant={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                      <Chip
                        label={ticket.status}
                        color={getStatusColor(ticket.status)}
                        size="small"
                      />
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                    <ClockIcon className="h-4 w-4 mr-1" />
                    <Typography variant="body2" sx={{ mr: 2 }}>
                      {ticket.spentHours}h / {ticket.estimatedHours}h
                    </Typography>
                    <Box sx={{ width: 100, mr: 2 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={(ticket.spentHours / ticket.estimatedHours) * 100} 
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                    <Button size="small" variant="outlined">
                      View Details
                    </Button>
                  </Box>
                </Card>
              ))}
            </Box>
          </DashboardCard>
        </Grid>

        {/* Today's Tasks */}
        <Grid item xs={12} lg={4}>
          <DashboardCard title="Today's Tasks" className="h-full">
            <List dense>
              {todayTasks.map((task, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <Box sx={{ mr: 2 }}>
                    {task.completed ? (
                      <CheckCircleIcon className="h-5 w-5 text-success-600" />
                    ) : (
                      <Box sx={{ 
                        width: 20, 
                        height: 20, 
                        border: '2px solid', 
                        borderColor: 'neutral.300',
                        borderRadius: '50%' 
                      }} />
                    )}
                  </Box>
                  <ListItemText
                    primary={task.task}
                    sx={{
                      '& .MuiListItemText-primary': {
                        textDecoration: task.completed ? 'line-through' : 'none',
                        color: task.completed ? 'text.secondary' : 'text.primary'
                      }
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </DashboardCard>
        </Grid>

        {/* Recent Commits */}
        <Grid item xs={12}>
          <DashboardCard title="Recent Commits">
            <List dense>
              {recentCommits.map((commit, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <Avatar sx={{ mr: 2, bgcolor: 'primary.main', width: 32, height: 32 }}>
                    <CodeBracketIcon className="h-4 w-4" />
                  </Avatar>
                  <ListItemText
                    primary={commit.message}
                    secondary={`${commit.branch} • ${commit.time}`}
                  />
                </ListItem>
              ))}
            </List>
          </DashboardCard>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Quick Actions</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ p: 2, textAlign: 'center', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
                    <TicketIcon className="h-8 w-8 mx-auto mb-2 text-primary-600" />
                    <Typography variant="body2">View All Tickets</Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ p: 2, textAlign: 'center', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
                    <PlayIcon className="h-8 w-8 mx-auto mb-2 text-primary-600" />
                    <Typography variant="body2">Kanban Board</Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ p: 2, textAlign: 'center', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
                    <CodeBracketIcon className="h-8 w-8 mx-auto mb-2 text-primary-600" />
                    <Typography variant="body2">Code Reviews</Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ p: 2, textAlign: 'center', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
                    <BugAntIcon className="h-8 w-8 mx-auto mb-2 text-primary-600" />
                    <Typography variant="body2">Report Bug</Typography>
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DeveloperDashboard;
