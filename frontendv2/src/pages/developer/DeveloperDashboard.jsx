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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  TicketIcon,
  CodeBracketIcon,
  ClockIcon,
  CheckCircleIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import StatsGrid from '../../components/dashboard/StatsGrid';
import DashboardCard from '../../components/dashboard/DashboardCard';
import Badge from '../../components/ui/Badge';
import { developerAPI, subscribeToEvents } from '../../services/api';
import MyUpcomingEvents from '../../components/dashboard/MyUpcomingEvents';
import TwoColumnRight from '../../components/layout/TwoColumnRight';
import { useAuth } from '../../contexts/AuthContext';
import { Alert } from '@mui/material';

const DeveloperDashboard = () => {
  const [stats, setStats] = useState([]);
  const [myTickets, setMyTickets] = useState([]);
  const [standups, setStandups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const { user } = useAuth();
  const [standupNotice, setStandupNotice] = useState(null);

  useEffect(() => {
    fetchDashboardData();
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
                // auto-clear after 12s
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

  const fetchDashboardData = async () => {
    try {
      setError(null);
      setLoading(true);

      const [statsRes, ticketsRes, dashboardRes] = await Promise.all([
        developerAPI.getStats().catch(() => null),
        developerAPI.getMyTickets().catch(() => null),
        developerAPI.getDashboard().catch(() => null),
      ]);

      // Stats cards mapping
      const s = statsRes?.stats;
      const ticketStats = s?.tickets || {};
      const statsCards = [
        {
          title: 'Assigned Tickets',
          value: String(s?.overview?.assignedTickets ?? ticketStats.total ?? 0),
          subtitle: 'Total tickets assigned',
          icon: <TicketIcon className="h-6 w-6" />,
          color: 'primary'
        },
        {
          title: 'In Progress',
          value: String(ticketStats.inProgress ?? 0),
          subtitle: 'Currently being worked on',
          icon: <PlayIcon className="h-6 w-6" />,
          color: 'info'
        },
        {
          title: 'Code Review',
          value: String(ticketStats.codeReview ?? 0),
          subtitle: 'Pending review',
          icon: <CodeBracketIcon className="h-6 w-6" />,
          color: 'warning'
        },
        {
          title: 'Done',
          value: String(ticketStats.done ?? 0),
          subtitle: 'Completed tickets',
          icon: <CheckCircleIcon className="h-6 w-6" />,
          color: 'success'
        }
      ];
      setStats(statsCards);

      // Tickets mapping
      const tickets = ticketsRes?.tickets || [];
      const normalizedTickets = tickets.map((t) => ({
        id: t.ticketId || t._id || t.id,
        title: t.title,
        description: t.description || 'No description available',
        priority: t.priority,
        status: t.status,
        project: t.projectName,
        estimatedHours: t.estimatedHours ?? 0,
        spentHours: t.actualHours ?? 0,
      }));
      setMyTickets(normalizedTickets);

      // Standups from dashboard summary (replaces dummy Today tasks/commits)
      const standupsArr = dashboardRes?.standups || [];
      setStandups(standupsArr);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message || 'Failed to load dashboard');
    } finally {
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

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedTicket(null);
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading dashboard...</Typography>
      </Box>
    );
  }

  const rightRail = (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 3 }}>
        <MyUpcomingEvents title="My Upcoming Events" days={14} />
      </Box>
      <DashboardCard title="Recent Standups" className="h-full">
        <List dense>
          {standups.length === 0 && (
            <ListItem sx={{ px: 0 }}>
              <ListItemText primary="No recent standups" />
            </ListItem>
          )}
          {standups.map((s, index) => (
            <ListItem key={index} sx={{ px: 0 }}>
              <Avatar sx={{ mr: 2, bgcolor: 'primary.main', width: 32, height: 32 }}>
                <PlayIcon className="h-4 w-4" />
              </Avatar>
              <ListItemText
                primary={s.projectId?.name || 'Standup'}
                secondary={new Date(s.date).toLocaleString()}
              />
            </ListItem>
          ))}
        </List>
      </DashboardCard>
    </Box>
  );

  return (
    <TwoColumnRight right={rightRail}>
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
        Developer Dashboard
      </Typography>
      <Typography 
        variant="h6" 
        sx={{ 
          color: 'text.secondary',
          fontWeight: 400,
          fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
          lineHeight: 1.6,
          letterSpacing: '0.01em',
          mb: 2
        }}
      >
        Welcome back! Here's your development overview.
      </Typography>
      {standupNotice && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {standupNotice}
        </Alert>
      )}
      {error && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography color="error">{error}</Typography>
          </CardContent>
        </Card>
      )}
      
      {/* Stats Overview */}
      <Box sx={{ mb: 4 }}>
        <StatsGrid stats={stats} />
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <DashboardCard title="My Active Tickets" className="h-full">
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
              {myTickets.map((ticket, index) => (
                <Card key={index} sx={{ minWidth: 280, maxWidth: 350, flex: 1 }}>
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box sx={{ flex: 1, mr: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          {ticket.id}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, fontSize: '1rem' }}>
                          {ticket.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
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
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Typography variant="body2" sx={{ mr: 2 }}>
                        {ticket.spentHours}h / {ticket.estimatedHours}h
                      </Typography>
                      <Box sx={{ width: 80, mr: 2 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={(ticket.spentHours / ticket.estimatedHours) * 100} 
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                      <Button size="small" variant="outlined" onClick={() => handleViewTicket(ticket)}>
                        View
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </DashboardCard>
        </Grid>
      </Grid>

      {/* Ticket Details Modal */}
      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle>
          Ticket Details
        </DialogTitle>
        <DialogContent>
          {selectedTicket && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {selectedTicket.title}
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary', lineHeight: 1.6 }}>
                {selectedTicket.description}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                <strong>Ticket ID:</strong> {selectedTicket.id}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                <strong>Project:</strong> {selectedTicket.project}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                <strong>Priority:</strong> {selectedTicket.priority}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                <strong>Status:</strong> {selectedTicket.status}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                <strong>Time Spent:</strong> {selectedTicket.spentHours}h / {selectedTicket.estimatedHours}h
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ mr: 2 }}>
                  Progress:
                </Typography>
                <Box sx={{ width: 200 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={(selectedTicket.spentHours / selectedTicket.estimatedHours) * 100} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Close</Button>
        </DialogActions>
      </Dialog>
    </TwoColumnRight>
  );
};

export default DeveloperDashboard;
