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
  DialogActions,
  IconButton,
  Alert,
  Skeleton
} from '@mui/material';
import {
  TicketIcon,
  CodeBracketIcon,
  ClockIcon,
  CheckCircleIcon,
  PlayIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import StatsGrid from '../../components/dashboard/StatsGrid';
import DashboardCard from '../../components/dashboard/DashboardCard';
import Badge from '../../components/ui/Badge';
import { developerAPI, subscribeToEvents } from '../../services/api';
import MyUpcomingEvents from '../../components/dashboard/MyUpcomingEvents';
import TwoColumnRight from '../../components/layout/TwoColumnRight';
import { useAuth } from '../../contexts/AuthContext';

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

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <Box>
      {/* Stats skeleton */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={6} lg={3} key={i}>
              <Skeleton 
                variant="rectangular" 
                height={120} 
                sx={{ borderRadius: '12px' }}
                animation="pulse"
              />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Tickets skeleton */}
      <Box>
        <Skeleton variant="text" width={200} height={40} sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton 
                variant="rectangular" 
                height={200} 
                sx={{ borderRadius: '12px' }}
                animation="pulse"
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );

  // Empty state for tickets
  const EmptyTicketsState = () => (
    <Box 
      sx={{ 
        textAlign: 'center', 
        py: 6,
        px: 2
      }}
    >
      <Box
        sx={{
          display: 'inline-flex',
          p: 2,
          borderRadius: '50%',
          bgcolor: 'rgba(0,0,0,0.04)',
          mb: 2
        }}
      >
        <TicketIcon style={{ width: 64, height: 64, color: 'rgba(0,0,0,0.3)' }} />
      </Box>
      <Typography 
        variant="h6" 
        sx={{ 
          fontWeight: 600,
          color: 'text.primary',
          mb: 1
        }}
      >
        No active tickets assigned
      </Typography>
      <Typography 
        variant="body2" 
        sx={{ 
          color: 'text.secondary',
          maxWidth: 400,
          mx: 'auto'
        }}
      >
        Your assigned tickets will appear here
      </Typography>
    </Box>
  );

  if (loading) {
    return (
      <TwoColumnRight 
        right={
          <Box sx={{ p: 0 }}>
            <Box sx={{ 
              bgcolor: 'white', 
              borderRadius: '12px', 
              p: 3,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <Skeleton variant="text" width={150} height={30} sx={{ mb: 2 }} />
              {[1, 2, 3].map((i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="80%" />
                    <Skeleton variant="text" width="60%" />
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        }
      >
        <Box sx={{ 
          maxWidth: 1400, 
          mx: 'auto', 
          px: { xs: 2, md: 4 }, 
          py: 3 
        }}>
          <LoadingSkeleton />
        </Box>
      </TwoColumnRight>
    );
  }

  const rightRail = (
    <Box sx={{ p: 0 }}>
      <Box sx={{ 
        bgcolor: 'white', 
        borderRadius: '12px', 
        p: 3,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        transition: 'box-shadow 0.2s ease',
        '@media (hover: hover)': {
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }
        }
      }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontSize: '1.125rem',
            fontWeight: 600,
            mb: 2,
            color: 'text.primary'
          }}
        >
          Recent Standups
        </Typography>
        <List sx={{ p: 0 }}>
          {standups.length === 0 && (
            <Box sx={{ 
              textAlign: 'center', 
              py: 4,
              color: 'text.secondary'
            }}>
              <PlayIcon style={{ width: 32, height: 32, margin: '0 auto 8px' }} />
              <Typography variant="body2">No recent standups</Typography>
            </Box>
          )}
          {standups.map((s, index) => (
            <ListItem 
              key={index} 
              sx={{ 
                px: 0,
                py: 2,
                borderBottom: index < standups.length - 1 ? '1px solid rgba(0,0,0,0.08)' : 'none',
                transition: 'background 0.15s ease',
                borderRadius: '8px',
                '@media (hover: hover)': {
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,0.02)'
                  }
                }
              }}
            >
              <Avatar 
                sx={{ 
                  mr: 2, 
                  bgcolor: 'primary.main', 
                  width: 40, 
                  height: 40,
                  '& svg': {
                    color: '#ffffff !important'
                  }
                }}
              >
                <PlayIcon style={{ width: 20, height: 20, color: '#ffffff' }} />
              </Avatar>
              <ListItemText
                primary={
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 500,
                      fontSize: '0.875rem',
                      color: 'text.primary'
                    }}
                  >
                    {s.projectId?.name || 'Standup'}
                  </Typography>
                }
                secondary={
                  <Box>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: 'block',
                        fontSize: '0.75rem',
                        color: 'text.secondary'
                      }}
                    >
                      {new Date(s.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: 'block',
                        fontSize: '0.75rem',
                        color: 'text.secondary'
                      }}
                    >
                      {new Date(s.date).toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit' 
                      })}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );

  return (
    <TwoColumnRight right={rightRail}>
      <Box sx={{ 
        width: '100%',
        px: { xs: 2, md: 3 }, 
        py: 3 
      }}>
        {/* Page Header */}
        <Box 
          sx={{ 
            mb: 4,
            pb: 3,
            borderBottom: '1px solid rgba(0,0,0,0.08)'
          }}
        >
          <Typography 
            variant="h1" 
            sx={{ 
              fontSize: { xs: '1.75rem', md: '2rem' },
              fontWeight: 700,
              mb: 1,
              color: 'text.primary'
            }}
          >
            Developer Dashboard
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              fontSize: '1rem',
              fontWeight: 400,
              lineHeight: 1.6,
              color: 'text.secondary'
            }}
          >
            Welcome back! Here's your development overview.
          </Typography>
        </Box>

        {/* Standup Notice Alert */}
        {standupNotice && (
          <Alert 
            severity="info" 
            sx={{ 
              mb: 3,
              borderRadius: '12px',
              fontSize: '0.875rem',
              animation: 'slideIn 0.3s ease'
            }}
          >
            {standupNotice}
          </Alert>
        )}

        {/* Error State */}
        {error && (
          <Alert 
            severity="error" 
            variant="outlined"
            sx={{ 
              mb: 3,
              borderRadius: '12px'
            }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={fetchDashboardData}
                sx={{ fontWeight: 500 }}
              >
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}
        
        {/* Stats Overview */}
        <Box sx={{ mb: 6 }}>
          <Grid container spacing={2.5}>
            {stats.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    bgcolor: 'white',
                    borderRadius: '12px',
                    p: 3,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s ease',
                    height: '100%',
                    minHeight: 180,
                    display: 'flex',
                    flexDirection: 'column',
                    '@media (hover: hover)': {
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        bgcolor: `${stat.color}.main`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        flexShrink: 0,
                        '& svg': {
                          color: '#ffffff !important'
                        }
                      }}
                    >
                      {React.cloneElement(stat.icon, { 
                        style: { width: 24, height: 24, color: '#ffffff' } 
                      })}
                    </Box>
                  </Box>
                  <Typography
                    variant="overline"
                    sx={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      color: 'text.secondary',
                      display: 'block',
                      mb: 1,
                      lineHeight: 1.2
                    }}
                  >
                    {stat.title}
                  </Typography>
                  <Typography
                    variant="h3"
                    sx={{
                      fontSize: '2.25rem',
                      fontWeight: 700,
                      color: 'text.primary',
                      mb: 0.5,
                      lineHeight: 1.2
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: '0.875rem',
                      fontWeight: 400,
                      color: 'text.secondary',
                      lineHeight: 1.4,
                      mt: 'auto'
                    }}
                  >
                    {stat.subtitle}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* My Active Tickets */}
        <Box sx={{ mb: 6 }}>
          <Box
            sx={{
              bgcolor: 'white',
              borderRadius: '12px',
              p: 3,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            <Typography
              variant="h2"
              sx={{
                fontSize: '1.25rem',
                fontWeight: 600,
                color: 'text.primary',
                mb: 3
              }}
            >
              My Active Tickets
            </Typography>

            {myTickets.length === 0 ? (
              <EmptyTicketsState />
            ) : (
              <Grid container spacing={3}>
                {myTickets.map((ticket, index) => (
                  <Grid item xs={12} sm={6} lg={4} key={index}>
                    <Card
                      onClick={() => handleViewTicket(ticket)}
                      sx={{
                        bgcolor: 'white',
                        border: '1px solid rgba(0,0,0,0.08)',
                        borderRadius: '12px',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                        height: '100%',
                        '@media (hover: hover)': {
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                          }
                        }
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        {/* Header with badges */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Box sx={{ flex: 1, mr: 2 }}>
                            <Typography 
                              variant="overline" 
                              sx={{ 
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                color: 'text.secondary',
                                letterSpacing: '0.5px',
                                display: 'block',
                                mb: 0.5
                              }}
                            >
                              {ticket.id}
                            </Typography>
                            <Typography 
                              variant="h6" 
                              sx={{ 
                                fontWeight: 600, 
                                mb: 1, 
                                fontSize: '1.125rem',
                                lineHeight: 1.4,
                                color: 'text.primary'
                              }}
                            >
                              {ticket.title}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontSize: '0.875rem',
                                fontWeight: 400,
                                color: 'text.secondary',
                                mb: 2
                              }}
                            >
                              {ticket.project}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column', alignItems: 'flex-end' }}>
                            <Badge 
                              variant={getPriorityColor(ticket.priority)}
                              sx={{
                                transition: 'transform 0.15s ease',
                                '@media (hover: hover)': {
                                  '&:hover': {
                                    transform: 'scale(1.05)'
                                  }
                                }
                              }}
                            >
                              {ticket.priority}
                            </Badge>
                            <Chip
                              label={ticket.status}
                              color={getStatusColor(ticket.status)}
                              size="small"
                              sx={{
                                fontSize: '0.75rem',
                                height: 24,
                                transition: 'transform 0.15s ease',
                                '@media (hover: hover)': {
                                  '&:hover': {
                                    transform: 'scale(1.05)'
                                  }
                                }
                              }}
                            />
                          </Box>
                        </Box>

                        {/* Progress section */}
                        <Box 
                          sx={{ 
                            pt: 2,
                            borderTop: '1px solid rgba(0,0,0,0.08)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            flexWrap: 'wrap'
                          }}
                        >
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontSize: '0.875rem',
                              fontWeight: 500,
                              color: 'text.primary'
                            }}
                          >
                            {ticket.spentHours}h / {ticket.estimatedHours}h
                          </Typography>
                          <Box sx={{ flex: 1, minWidth: 100 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={ticket.estimatedHours > 0 ? (ticket.spentHours / ticket.estimatedHours) * 100 : 0} 
                              sx={{ 
                                height: 6, 
                                borderRadius: 3,
                                transition: 'all 0.3s ease',
                                bgcolor: 'rgba(0,0,0,0.06)'
                              }}
                            />
                          </Box>
                          <Button 
                            size="small" 
                            variant="outlined"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewTicket(ticket);
                            }}
                            sx={{
                              fontSize: '0.875rem',
                              fontWeight: 500,
                              textTransform: 'none',
                              px: 2,
                              transition: 'all 0.15s ease',
                              '@media (hover: hover)': {
                                '&:hover': {
                                  transform: 'scale(0.98)'
                                }
                              }
                            }}
                          >
                            View
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Box>

        {/* Ticket Details Modal */}
        <Dialog 
          open={modalOpen} 
          onClose={handleCloseModal} 
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '12px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              maxWidth: 600
            }
          }}
          BackdropProps={{
            sx: {
              bgcolor: 'rgba(0,0,0,0.5)'
            }
          }}
          TransitionProps={{
            timeout: 200
          }}
        >
          <DialogTitle 
            sx={{ 
              p: 3,
              borderBottom: '1px solid rgba(0,0,0,0.08)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                fontSize: '1.25rem',
                fontWeight: 600,
                color: 'text.primary'
              }}
            >
              Ticket Details
            </Typography>
            <IconButton
              onClick={handleCloseModal}
              sx={{
                width: 32,
                height: 32,
                transition: 'background 0.15s ease',
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.04)'
                }
              }}
              aria-label="Close dialog"
            >
              <XMarkIcon style={{ width: 20, height: 20 }} />
            </IconButton>
          </DialogTitle>
          <DialogContent 
            sx={{ 
              p: 3,
              maxHeight: '70vh',
              overflowY: 'auto'
            }}
          >
            {selectedTicket && (
              <Box>
                {/* Title and badges */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontSize: '1.25rem',
                      fontWeight: 600,
                      color: 'text.primary',
                      flex: 1,
                      mr: 2
                    }}
                  >
                    {selectedTicket.title}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Badge variant={getPriorityColor(selectedTicket.priority)}>
                      {selectedTicket.priority}
                    </Badge>
                    <Chip
                      label={selectedTicket.status}
                      color={getStatusColor(selectedTicket.status)}
                      size="small"
                    />
                  </Box>
                </Box>

                {/* Description */}
                <Box 
                  sx={{ 
                    p: 2,
                    mb: 3,
                    bgcolor: 'rgba(0,0,0,0.02)',
                    borderRadius: '8px',
                    border: '1px solid rgba(0,0,0,0.06)'
                  }}
                >
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontSize: '1rem',
                      lineHeight: 1.6,
                      color: 'text.secondary'
                    }}
                  >
                    {selectedTicket.description}
                  </Typography>
                </Box>

                {/* Info section */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ mb: 1.5 }}>
                    <Typography 
                      component="span" 
                      sx={{ 
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: 'text.primary'
                      }}
                    >
                      Ticket ID:
                    </Typography>
                    <Typography 
                      component="span" 
                      sx={{ 
                        fontSize: '0.875rem',
                        fontWeight: 400,
                        color: 'text.secondary',
                        ml: 1
                      }}
                    >
                      {selectedTicket.id}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 1.5 }}>
                    <Typography 
                      component="span" 
                      sx={{ 
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: 'text.primary'
                      }}
                    >
                      Project:
                    </Typography>
                    <Typography 
                      component="span" 
                      sx={{ 
                        fontSize: '0.875rem',
                        fontWeight: 400,
                        color: 'text.secondary',
                        ml: 1
                      }}
                    >
                      {selectedTicket.project}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 1.5 }}>
                    <Typography 
                      component="span" 
                      sx={{ 
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: 'text.primary'
                      }}
                    >
                      Priority:
                    </Typography>
                    <Typography 
                      component="span" 
                      sx={{ 
                        fontSize: '0.875rem',
                        fontWeight: 400,
                        color: 'text.secondary',
                        ml: 1
                      }}
                    >
                      {selectedTicket.priority}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 1.5 }}>
                    <Typography 
                      component="span" 
                      sx={{ 
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: 'text.primary'
                      }}
                    >
                      Status:
                    </Typography>
                    <Typography 
                      component="span"
                      sx={{ 
                        fontSize: '0.875rem',
                        fontWeight: 400,
                        color: 'text.secondary',
                        ml: 1
                      }}
                    >
                      {selectedTicket.status}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography 
                      component="span" 
                      sx={{ 
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: 'text.primary'
                      }}
                    >
                      Time Spent:
                    </Typography>
                    <Typography 
                      component="span" 
                      sx={{ 
                        fontSize: '0.875rem',
                        fontWeight: 400,
                        color: 'text.secondary',
                        ml: 1
                      }}
                    >
                      {selectedTicket.spentHours}h / {selectedTicket.estimatedHours}h
                    </Typography>
                  </Box>
                </Box>

                {/* Progress section */}
                <Box 
                  sx={{ 
                    pt: 3,
                    borderTop: '1px solid rgba(0,0,0,0.08)'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: 'text.primary'
                      }}
                    >
                      Progress
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: 'primary.main'
                      }}
                    >
                      {selectedTicket.estimatedHours > 0 
                        ? Math.round((selectedTicket.spentHours / selectedTicket.estimatedHours) * 100)
                        : 0}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={selectedTicket.estimatedHours > 0 
                      ? (selectedTicket.spentHours / selectedTicket.estimatedHours) * 100 
                      : 0
                    } 
                    sx={{ 
                      height: 10, 
                      borderRadius: 5,
                      bgcolor: 'rgba(0,0,0,0.06)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 5,
                        transition: 'transform 0.3s ease'
                      }
                    }}
                    aria-label={`Progress: ${selectedTicket.spentHours} out of ${selectedTicket.estimatedHours} hours`}
                  />
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions 
            sx={{ 
              p: 3,
              borderTop: '1px solid rgba(0,0,0,0.08)',
              justifyContent: 'flex-end'
            }}
          >
            <Button 
              onClick={handleCloseModal}
              variant="contained"
              sx={{
                fontSize: '0.875rem',
                fontWeight: 500,
                textTransform: 'none',
                px: 3,
                py: 1,
                borderRadius: '8px',
                boxShadow: 'none',
                transition: 'all 0.15s ease',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                },
                '&:active': {
                  transform: 'scale(0.98)'
                }
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add keyframe animation for alert */}
        <style>
          {`
            @keyframes slideIn {
              from {
                opacity: 0;
                transform: translateY(-10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }

            @media (prefers-reduced-motion: reduce) {
              * {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
              }
            }
          `}
        </style>
      </Box>
    </TwoColumnRight>
  );
};

export default DeveloperDashboard;